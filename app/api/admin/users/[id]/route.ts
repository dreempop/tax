// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) return null;
  const isAdminMeta = user.app_metadata?.role === 'admin';
  if (!isAdminMeta) {
    const serviceClient = getServiceClient();
    const { data: profile } = await serviceClient.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return null;
  }
  return { adminUser: user };
}

// GET — single user profile
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PUT — update user profile (username, full_name, website, role, is_approved)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { username, full_name, website, role, is_approved } = body;

  const supabase = getServiceClient();

  // Build update object
  const updateData: Record<string, unknown> = { username, full_name, website, updated_at: new Date().toISOString() };
  if (role !== undefined) updateData.role = role;
  if (is_approved !== undefined) updateData.is_approved = !!is_approved;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove user profile row (does NOT delete auth user — requires service role key)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await verifyAdmin(request);
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
