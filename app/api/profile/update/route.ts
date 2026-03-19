import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  full_name: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

async function verifyUser(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyUser(req.headers.get('authorization'));
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
    }

    const { username, full_name, website } = validation.data;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        full_name,
        website,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
