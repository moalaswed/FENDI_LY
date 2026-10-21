import "server-only";

if (typeof window !== "undefined") {
  throw new Error("lib/admin/dal.ts is a server-only module.");
}

import { cache } from "react";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getVerifiedAdminSession } from "@/lib/admin/session";

export interface AdminUserDto {
  id: string;
  username: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Retrieves the currently authenticated administrator DTO.
 * Wrapped in React cache() to deduplicate queries within a single render pass.
 * Returns only safe UI fields; never exposes password hashes or tokens.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUserDto | null> => {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return null;
  }

  try {
    const res = await query<{
      id: string;
      username: string;
      role: string;
      must_change_password: boolean;
      created_at: Date;
      last_login_at: Date | null;
    }>(
      `SELECT id, username, role, must_change_password, created_at, last_login_at
       FROM admin_users
       WHERE id = $1;`,
      [session.userId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      username: row.username,
      role: row.role,
      mustChangePassword: row.must_change_password,
      createdAt: new Date(row.created_at).toISOString(),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    };
  } catch (err) {
    console.error("[DAL USER QUERY ERROR]", (err as Error).message);
    return null;
  }
});

/**
 * Enforces super-admin authorization.
 * Redirects unauthenticated requests to /admin/login.
 * Redirects administrators with mustChangePassword=true to /admin/change-password.
 *
 * Must be invoked inside every admin page, Server Action, and protected API route.
 */
export async function requireSuperAdmin(options?: {
  allowPasswordChangePage?: boolean;
}): Promise<AdminUserDto> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  if (admin.role !== "super_admin") {
    console.warn(`[SECURITY VIOLATION] Non-super-admin user ${admin.id} attempted to access protected resource.`);
    redirect("/admin/login");
  }

  // Deny access to general admin resources until the initial password has been changed
  if (admin.mustChangePassword && !options?.allowPasswordChangePage) {
    redirect("/admin/change-password");
  }

  return admin;
}

/**
 * Specifically guards the password change route and action.
 * Allows access only to authenticated administrators who still have must_change_password = true.
 */
export async function requirePasswordChangePending(): Promise<AdminUserDto> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  // Enforce role authorization: only super_admin can perform pending password activation
  if (admin.role !== "super_admin") {
    console.warn(
      `[SECURITY VIOLATION] User ${admin.id} with role "${admin.role}" attempted to access super_admin password activation.`
    );
    redirect("/admin/login");
  }

  if (!admin.mustChangePassword) {
    redirect("/admin");
  }

  return admin;
}
