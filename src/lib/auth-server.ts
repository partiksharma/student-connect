import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flmczzezsysoxbxlspor.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_91V651chyZkYk9VJNPrPaA_OPVz2htY';
// Optional service role key if configured in environment
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export function getServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const ADMIN_EMAIL = 'admin@studentconnect.org';
export const ADMIN_SECRET = 'Admin@StudentConnect2025!';

export function verifyAdminRequest(req: Request): boolean {
  // Check authorization header or custom admin header
  const authHeader = req.headers.get('authorization');
  const adminSecretHeader = req.headers.get('x-admin-secret');
  const userRoleHeader = req.headers.get('x-user-role');
  const userEmailHeader = req.headers.get('x-user-email');

  if (adminSecretHeader === ADMIN_SECRET) {
    return true;
  }

  if (authHeader && authHeader.includes(ADMIN_SECRET)) {
    return true;
  }

  if (userRoleHeader === 'admin' && userEmailHeader?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  return false;
}
