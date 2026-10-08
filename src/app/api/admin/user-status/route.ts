import { NextResponse } from 'next/server';
import { getServerSupabaseClient, verifyAdminRequest } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const isAuthorized = verifyAdminRequest(req);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required to alter verification status' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, status } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
    }

    // Normalizing status to accepted database account_status enum values
    let targetStatus: 'pending_approval' | 'approved' | 'rejected' = 'pending_approval';
    if (status === 'approved') {
      targetStatus = 'approved';
    } else if (status === 'rejected') {
      targetStatus = 'rejected';
    } else if (status === 'pending_approval' || status === 'pending') {
      targetStatus = 'pending_approval';
    } else {
      return NextResponse.json(
        { error: `Invalid status: '${status}'. Must be 'approved', 'rejected', or 'pending_approval'` },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        status: targetStatus,
        updated_at: now,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update user status in database:', error);
      return NextResponse.json(
        { error: `Database update failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: `User status successfully updated to ${targetStatus}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
