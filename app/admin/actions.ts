"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createAdminSession, deleteAdminSession, rotateAdminSession } from "@/lib/admin/session";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  generateRateLimitKey,
} from "@/lib/admin/rate-limit";
import { requirePasswordChangePending } from "@/lib/admin/dal";

// Dummy bcrypt hash for constant-time comparison to prevent user enumeration via timing
const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Resolves the client network identifier following a documented trusted-proxy strategy.
 *
 * In production or cPanel Passenger setups:
 * - If TRUST_PROXY=true is set, the server trusts the reverse proxy (e.g. Apache mod_remoteip or Nginx)
 *   to overwrite/sanitize incoming headers, using the client IP from X-Forwarded-For or X-Real-IP.
 * - If TRUST_PROXY is false or unset, client-supplied proxy headers are NOT trusted for isolating rate-limit
 *   buckets, preventing attackers from evading rate limiting via arbitrary header injection.
 */
async function getClientIdentifier(): Promise<string> {
  const headerList = await headers();
  const trustProxy = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";

  if (trustProxy) {
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  }

  return "direct-client";
}

/**
 * Helper to determine client IP address for session audit logging.
 */
async function getAuditIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") || "127.0.0.1";
}

/**
 * Server-side password policy enforcement.
 * Must match requirements displayed in the UI:
 * - At least 10 characters (and max 128 characters)
 * - Contains letters
 * - Contains numbers
 */
function validateNewPasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 10) {
    return {
      valid: false,
      error: "يجب ألا تقل كلمة المرور الجديدة عن 10 خانات.",
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      error: "يجب ألا تتجاوز كلمة المرور الجديدة 128 خانة.",
    };
  }

  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasNumber = /[0-9\u0660-\u0669]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: "يجب أن تحتوي كلمة المرور على مزيج من الأحرف والأرقام.",
    };
  }

  return { valid: true };
}

/**
 * Server Action: Admin Login
 * Enforces fail-closed rate limiting, constant-time comparison, generic errors,
 * privacy-preserving keys, and detailed sanitized server logging.
 */
export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return {
      success: false,
      error: "يرجى إدخال اسم المستخدم وكلمة المرور.",
    };
  }

  const clientIdentifier = await getClientIdentifier();
  const rateLimitKey = generateRateLimitKey(clientIdentifier, username);

  // 1. Multi-process rate limit check (Fails closed on storage errors)
  const rateLimitStatus = await checkRateLimit(rateLimitKey, 5, 15);
  if (!rateLimitStatus.allowed) {
    if (rateLimitStatus.blockedUntil) {
      const minutes = Math.ceil(rateLimitStatus.retryAfterSeconds / 60);
      return {
        success: false,
        error: `تم تجاوز الحد الأقصى للمحاولات المتتالية. يرجى الانتظار لمدة ${minutes} دقيقة قبل المحاولة مرة أخرى.`,
      };
    }

    // Storage offline or uninitialized
    return {
      success: false,
      error: "خدمة التحقق غير متاحة حالياً بسبب أعمال الصيانة. يرجى إعادة المحاولة لاحقاً.",
    };
  }

  // 2. Fetch user from PostgreSQL
  let userRow: {
    id: string;
    username: string;
    password_hash: string;
    role: string;
    must_change_password: boolean;
  } | null = null;

  try {
    const res = await query<{
      id: string;
      username: string;
      password_hash: string;
      role: string;
      must_change_password: boolean;
    }>(
      `SELECT id, username, password_hash, role, must_change_password
       FROM admin_users
       WHERE username = $1;`,
      [username]
    );

    if (res.rows.length > 0) {
      userRow = res.rows[0];
    }
  } catch (err) {
    const dbErr = err as { code?: string; message?: string };
    if (dbErr.code === "42P01") {
      console.error(
        `[AUTH ERROR] Missing authentication table (PostgreSQL 42P01: ${dbErr.message}). The authentication schema has not been applied to the database. Run "scripts/auth-schema.sql" to initialize tables.`
      );
    } else if (dbErr.code === "ECONNREFUSED" || dbErr.code === "ENOTFOUND") {
      console.error(
        `[AUTH ERROR] Database connection refused or host unreachable (${dbErr.code}). Verify PostgreSQL service status and connection parameters.`
      );
    } else if (dbErr.code === "28P01" || dbErr.code === "28000") {
      console.error(
        `[AUTH ERROR] Database authentication failed (${dbErr.code}). Verify PGUSER and PGPASSWORD.`
      );
    } else {
      console.error(
        `[AUTH ERROR] Unexpected database query failure during admin login (${dbErr.code || "UNKNOWN"}: ${dbErr.message || "Unknown error"}).`
      );
    }

    return {
      success: false,
      error: "حدث خطأ غير متوقع في خدمة التحقق. يرجى إعادة المحاولة لاحقاً.",
    };
  }

  // 3. Constant-time password verification to prevent timing enumeration
  const targetHash = userRow ? userRow.password_hash : DUMMY_HASH;
  const isPasswordValid = await bcrypt.compare(password, targetHash);

  if (!userRow || !isPasswordValid) {
    await recordFailedAttempt(rateLimitKey, 5, 15);
    // Generic error to prevent username enumeration
    return {
      success: false,
      error: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    };
  }

  // 4. Successful login: reset rate limit and record login timestamp
  await resetRateLimit(rateLimitKey);

  try {
    await query(`UPDATE admin_users SET last_login_at = NOW() WHERE id = $1;`, [userRow.id]);
  } catch (err) {
    console.warn("[AUTH UPDATE LOGIN TIMESTAMP WARNING]", (err as Error).message);
  }

  // 5. Create database session and set HttpOnly cookie
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  const auditIp = await getAuditIp();

  await createAdminSession(
    userRow.id,
    userRow.role,
    userRow.must_change_password,
    userAgent,
    auditIp
  );

  // 6. Direct routing based on activation status
  if (userRow.must_change_password) {
    redirect("/admin/change-password");
  } else {
    redirect("/admin");
  }
}

/**
 * Server Action: Logout
 * Invalidates the database session and clears the cookie.
 */
export async function logoutAction(): Promise<void> {
  await deleteAdminSession();
  redirect("/admin/login");
}

/**
 * Server Action: Mandatory Initial Password Change
 * Enforces authentication, super_admin role, server-side password policy,
 * and session rotation.
 */
export async function changePasswordAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // Authorization check inside the Server Action: must be super_admin in pending state
  const currentAdmin = await requirePasswordChangePending();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "يرجى تعبئة كافة الحقول المطلوبة.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
    };
  }

  // Server-side password policy validation
  const policyCheck = validateNewPasswordPolicy(newPassword);
  if (!policyCheck.valid) {
    return {
      success: false,
      error: policyCheck.error,
    };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      error: "لا يمكن استخدام كلمة المرور المؤقتة السابقة ككلمة مرور جديدة.",
    };
  }

  // Fetch current hash to verify current password
  let userHash: string | null = null;
  try {
    const res = await query<{ password_hash: string }>(
      `SELECT password_hash FROM admin_users WHERE id = $1;`,
      [currentAdmin.id]
    );
    if (res.rows.length > 0) {
      userHash = res.rows[0].password_hash;
    }
  } catch (err) {
    console.error("[AUTH CHANGE PASSWORD DB ERROR]", (err as Error).message);
    return {
      success: false,
      error: "حدث خطأ أثناء التحقق من كلمة المرور الحالية. يرجى إعادة المحاولة.",
    };
  }

  if (!userHash) {
    return { success: false, error: "تعذر العثور على حساب المشرف." };
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, userHash);
  if (!isCurrentValid) {
    return {
      success: false,
      error: "كلمة المرور المؤقتة الحالية غير صحيحة.",
    };
  }

  // Hash new password securely with bcrypt (work factor: 12)
  const newHash = await bcrypt.hash(newPassword, 12);

  // Update password and clear must_change_password flag
  try {
    await query(
      `UPDATE admin_users
       SET password_hash = $2,
           must_change_password = FALSE,
           updated_at = NOW()
       WHERE id = $1;`,
      [currentAdmin.id, newHash]
    );
  } catch (err) {
    console.error("[AUTH PASSWORD UPDATE ERROR]", (err as Error).message);
    return {
      success: false,
      error: "تعذر حفظ كلمة المرور الجديدة في قاعدة البيانات. يرجى المحاولة لاحقاً.",
    };
  }

  // Rotate session: invalidate all previous sessions and establish fresh active session
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  const auditIp = await getAuditIp();

  await rotateAdminSession(currentAdmin.id, currentAdmin.role, userAgent, auditIp);

  redirect("/admin");
}
