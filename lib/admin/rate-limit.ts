import "server-only";

if (typeof window !== "undefined") {
  throw new Error("lib/admin/rate-limit.ts is a server-only module.");
}

import crypto from "crypto";
import { query } from "@/lib/db";

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil: Date | null;
  retryAfterSeconds: number;
}

/**
 * Generates a privacy-preserving, stable rate-limiting key.
 * Avoids storing raw client IP addresses or usernames in the database.
 */
export function generateRateLimitKey(
  clientIdentifier: string,
  username: string
): string {
  const secret = process.env.SESSION_SECRET || "fendi-auth-privacy-salt";
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${clientIdentifier.trim().toLowerCase()}:${username.trim().toLowerCase()}`);
  return `rl_${hmac.digest("hex").slice(0, 32)}`;
}

/**
 * Multi-process database-backed rate limiter for authentication endpoints.
 * Compatible with multi-worker Phusion Passenger in cPanel.
 * Fails closed securely if storage is unavailable.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<RateLimitStatus> {
  try {
    const res = await query<{
      attempts: number;
      first_attempt_at: Date;
      last_attempt_at: Date;
      blocked_until: Date | null;
    }>(
      `SELECT attempts, first_attempt_at, last_attempt_at, blocked_until
       FROM auth_rate_limits
       WHERE \`key\` = $1;`,
      [key]
    );

    if (res.rows.length === 0) {
      return {
        allowed: true,
        remainingAttempts: maxAttempts,
        blockedUntil: null,
        retryAfterSeconds: 0,
      };
    }

    const row = res.rows[0];
    const now = new Date();

    // 1. Check if actively locked out
    if (row.blocked_until && new Date(row.blocked_until) > now) {
      const retryAfterSeconds = Math.ceil(
        (new Date(row.blocked_until).getTime() - now.getTime()) / 1000
      );
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: new Date(row.blocked_until),
        retryAfterSeconds,
      };
    }

    // 2. Check if previous lockout or attempt window has expired
    const windowMs = windowMinutes * 60 * 1000;
    const firstAttemptTime = new Date(row.first_attempt_at).getTime();
    const lockoutExpired = row.blocked_until !== null && new Date(row.blocked_until) <= now;
    const windowExpired = now.getTime() - firstAttemptTime > windowMs;

    if (lockoutExpired || windowExpired) {
      return {
        allowed: true,
        remainingAttempts: maxAttempts,
        blockedUntil: null,
        retryAfterSeconds: 0,
      };
    }

    const remaining = Math.max(0, maxAttempts - row.attempts);
    return {
      allowed: row.attempts < maxAttempts,
      remainingAttempts: remaining,
      blockedUntil: null,
      retryAfterSeconds: 0,
    };
  } catch (err) {
    console.error(
      "[RATE LIMIT STORAGE ERROR] Rate limit database query failed (failing closed for security):",
      (err as Error).message
    );
    // Secure fail-closed: deny login when rate-limiting storage is offline or missing
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: null,
      retryAfterSeconds: 60,
    };
  }
}

/**
 * Records a failed login attempt and blocks if maxAttempts reached.
 * Correctly resets attempt counts upon lockout expiration so the first
 * failed attempt after expiration does not immediately re-lock the account.
 */
export async function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  blockDurationMinutes: number = 15
): Promise<RateLimitStatus> {
  try {
    // Keep this a single atomic upsert so parallel app workers cannot bypass the limit.
    await query(
      `INSERT INTO auth_rate_limits (
         \`key\`, attempts, first_attempt_at, last_attempt_at, blocked_until
       ) VALUES (?, 1, NOW(3), NOW(3), NULL)
       ON DUPLICATE KEY UPDATE
         attempts = CASE
           WHEN (blocked_until IS NOT NULL AND blocked_until <= NOW(3))
             OR first_attempt_at <= DATE_SUB(NOW(3), INTERVAL ? MINUTE)
             THEN 1 ELSE attempts + 1
         END,
         first_attempt_at = CASE
           WHEN (first_attempt_at <= DATE_SUB(NOW(3), INTERVAL ? MINUTE))
             OR (blocked_until IS NOT NULL AND blocked_until <= NOW(3))
             THEN NOW(3) ELSE first_attempt_at
         END,
         last_attempt_at = NOW(3),
         blocked_until = IF(attempts >= ?, DATE_ADD(NOW(3), INTERVAL ? MINUTE), NULL);`,
      [key, blockDurationMinutes, blockDurationMinutes, maxAttempts, blockDurationMinutes]
    );

    const res = await query<{ attempts: number; blocked_until: Date | string | null }>(
      "SELECT attempts, blocked_until FROM auth_rate_limits WHERE `key` = ?;",
      [key]
    );
    const row = res.rows[0];
    if (!row) throw new Error("Rate limit row was not persisted.");
    const now = new Date();
    const isBlocked = row.blocked_until !== null && new Date(row.blocked_until) > now;
    const retryAfter = isBlocked
      ? Math.ceil((new Date(row.blocked_until!).getTime() - now.getTime()) / 1000)
      : 0;

    return {
      allowed: !isBlocked,
      remainingAttempts: Math.max(0, maxAttempts - row.attempts),
      blockedUntil: row.blocked_until ? new Date(row.blocked_until) : null,
      retryAfterSeconds: retryAfter,
    };
  } catch (err) {
    console.error(
      "[RATE LIMIT RECORD ERROR] Could not update auth_rate_limits (failing closed for security):",
      (err as Error).message
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: null,
      retryAfterSeconds: 60,
    };
  }
}

/**
 * Resets rate limit counter upon successful authentication.
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await query("DELETE FROM auth_rate_limits WHERE `key` = ?;", [key]);
  } catch (err) {
    console.warn(
      "[RATE LIMIT RESET WARNING] Could not clear auth_rate_limits key:",
      (err as Error).message
    );
  }
}
