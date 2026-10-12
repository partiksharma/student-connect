import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flmczzezsysoxbxlspor.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_91V651chyZkYk9VJNPrPaA_OPVz2htY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export function getServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Authorized Administrator Identity (Server-side enforced only)
export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'partiksharmabsccs@gmail.com').toLowerCase().trim();
export const ADMIN_SESSION_COOKIE = 'admin_session';

// Cryptographic Secret for signing Admin Sessions
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '7cebedc1eb6d30b921e768ef2a827f42bd5e852bb9ea919e8fda129747464630';

// In-Memory Rate Limiter for Admin Login Protection
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    rateLimitMap.delete(identifier);
    return { allowed: true };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { attempts: 1, resetAt: now + LOCKOUT_WINDOW_MS });
  } else {
    entry.attempts += 1;
  }
}

export function resetFailedLogins(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Validates the admin password using constant-time comparison against the secure server configuration.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;

  const envSalt = process.env.ADMIN_PASSWORD_SALT;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envPassword = process.env.ADMIN_PASSWORD;

  // 1. Verify via scrypt salt & hash
  if (envSalt && envHash) {
    try {
      const computedHash = crypto.scryptSync(password, envSalt, 64).toString('hex');
      const hashBufferA = Buffer.from(computedHash, 'hex');
      const hashBufferB = Buffer.from(envHash, 'hex');
      if (hashBufferA.length === hashBufferB.length && crypto.timingSafeEqual(hashBufferA, hashBufferB)) {
        return true;
      }
    } catch (err) {
      console.error('Error during password hash comparison:', err);
    }
  }

  // 2. Direct constant-time verification if plain password set in server environment
  if (envPassword) {
    try {
      const bufA = Buffer.from(password);
      const bufB = Buffer.from(envPassword);
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        return true;
      }
    } catch {}
  }

  return false;
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token for the admin.
 */
export function createAdminSessionToken(user: { id: string; email: string }): string {
  const payload: AdminTokenPayload = {
    sub: user.id,
    email: user.email.toLowerCase(),
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 3600, // 8 hours
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies the admin session token and ensures it is authentic, unexpired,
 * and exclusively issued for the authorized administrator account.
 */
export function verifyAdminSessionToken(token: string): AdminTokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  try {
    const sigBufferA = Buffer.from(signature);
    const sigBufferB = Buffer.from(expectedSignature);
    if (sigBufferA.length !== sigBufferB.length || !crypto.timingSafeEqual(sigBufferA, sigBufferB)) {
      return null;
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload: AdminTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    // STRICT CHECK: Must be the authorized admin email and role
    if (payload.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    if (payload.role !== 'admin') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts session token from incoming HTTP request (Cookies or Authorization Bearer header).
 */
export function extractAdminSessionToken(req: Request): string | null {
  // 1. Check Cookie header
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`)) {
        return decodeURIComponent(cookie.substring(ADMIN_SESSION_COOKIE.length + 1));
      }
    }
  }

  // 2. Check Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Server-side authorization check for protected admin APIs and routes.
 * Never trusts spoofable client-side headers.
 */
export function verifyAdminRequest(req: Request): boolean {
  const token = extractAdminSessionToken(req);
  if (!token) return false;

  const payload = verifyAdminSessionToken(token);
  return payload !== null;
}

/**
 * Returns current admin user from verified request or null if unauthorized.
 */
export function getAdminSessionUser(req: Request): { id: string; email: string; role: 'admin' } | null {
  const token = extractAdminSessionToken(req);
  if (!token) return null;

  const payload = verifyAdminSessionToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: 'admin',
  };
}
