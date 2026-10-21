import "server-only";

if (typeof window !== "undefined") {
  throw new Error("lib/admin/session.ts is a server-only module.");
}

import crypto from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { query } from "@/lib/db";

export const ADMIN_COOKIE_NAME = "fendi_admin_session";
export const SESSION_DURATION_HOURS = 8;
export const MIN_SECRET_LENGTH = 32;

interface SessionJwtPayload {
  sessionId: string;
  userId: string;
  role: string;
  mustChangePassword: boolean;
  expiresAt: string;
}

/**
 * Derives and validates a secure secret key for signing JWT session tokens.
 * Enforces a minimum length of 32 characters (256 bits) in production.
 */
function getSessionSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error(
        "[AUTH SECURITY ERROR] SESSION_SECRET environment variable is missing in production."
      );
      throw new Error(
        "[AUTH SECURITY CONFIG ERROR] SESSION_SECRET environment variable is missing in production. Please configure a 32+ character random secret."
      );
    }
    console.warn(
      "[AUTH SECURITY WARNING] SESSION_SECRET is not configured. Using local development fallback."
    );
    return new TextEncoder().encode("fendi-plastic-development-secret-key-32chars-min!");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    if (isProd) {
      console.error(
        `[AUTH SECURITY ERROR] SESSION_SECRET length (${secret.length}) is below required minimum of ${MIN_SECRET_LENGTH} characters.`
      );
      throw new Error(
        `[AUTH SECURITY CONFIG ERROR] SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`
      );
    }
    console.warn(
      `[AUTH SECURITY WARNING] SESSION_SECRET is shorter than ${MIN_SECRET_LENGTH} characters.`
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT containing minimal session data.
 */
async function signSessionJwt(payload: SessionJwtPayload): Promise<string> {
  const key = getSessionSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .sign(key);
}

/**
 * Verifies and decodes a session JWT.
 */
async function verifySessionJwt(token: string): Promise<SessionJwtPayload | null> {
  try {
    const key = getSessionSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Creates a fresh session in the database and sets the signed cookie.
 * Lifetime: exactly 8 hours across JWT, database record, and cookie.
 */
export async function createAdminSession(
  userId: string,
  role: string,
  mustChangePassword: boolean,
  userAgent: string | null = null,
  ipAddress: string | null = null
): Promise<string> {
  const sessionId = "sess_" + crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  // 1. Insert session record into PostgreSQL
  await query(
    `INSERT INTO admin_sessions (id, user_id, expires_at, created_at, last_active_at, user_agent, ip_address)
     VALUES ($1, $2, $3, NOW(), NOW(), $4, $5);`,
    [sessionId, userId, expiresAt, userAgent, ipAddress]
  );

  // 2. Sign JWT containing session reference
  const token = await signSessionJwt({
    sessionId,
    userId,
    role,
    mustChangePassword,
    expiresAt: expiresAt.toISOString(),
  });

  // 3. Set HttpOnly, Secure, SameSite=Lax cookie with 8-hour expiry
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
    expires: expiresAt,
  });

  return token;
}

/**
 * Reads and verifies the active admin session from cookies and database.
 */
export async function getVerifiedAdminSession(): Promise<{
  sessionId: string;
  userId: string;
  role: string;
  mustChangePassword: boolean;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySessionJwt(token);
  if (!payload || !payload.sessionId || !payload.userId) {
    return null;
  }

  // Verify that the session actually exists in PostgreSQL and is not expired
  try {
    const res = await query<{
      id: string;
      user_id: string;
      expires_at: Date;
      role: string;
      must_change_password: boolean;
    }>(
      `SELECT s.id, s.user_id, s.expires_at, u.role, u.must_change_password
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > NOW();`,
      [payload.sessionId]
    );

    if (res.rows.length === 0) {
      // Invalidate stale cookie
      await deleteAdminSession();
      return null;
    }

    const row = res.rows[0];
    return {
      sessionId: row.id,
      userId: row.user_id,
      role: row.role,
      mustChangePassword: row.must_change_password,
    };
  } catch (err) {
    console.error("[AUTH SESSION VERIFY ERROR]", (err as Error).message);
    return null;
  }
}

/**
 * Invalidates the current session from database and removes cookie.
 * Robust against expired tokens by extracting sessionId via decodeJwt.
 */
export async function deleteAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token) {
      try {
        const payload = decodeJwt(token);
        if (payload?.sessionId && typeof payload.sessionId === "string") {
          await query(`DELETE FROM admin_sessions WHERE id = $1;`, [payload.sessionId]);
        }
      } catch {
        // Token was malformed; delete cookie anyway
      }
    }
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.warn("[AUTH LOGOUT WARNING] Error while removing session:", (err as Error).message);
  }
}

/**
 * Rotates session upon password change: deletes all old sessions for this user,
 * generates a fresh session, and sets the updated cookie.
 */
export async function rotateAdminSession(
  userId: string,
  role: string,
  userAgent: string | null = null,
  ipAddress: string | null = null
): Promise<string> {
  // 1. Invalidate all existing sessions for this user
  await query(`DELETE FROM admin_sessions WHERE user_id = $1;`, [userId]);

  // 2. Issue a brand new session with mustChangePassword = false
  return createAdminSession(userId, role, false, userAgent, ipAddress);
}
