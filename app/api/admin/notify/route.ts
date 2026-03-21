import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Thai tax deadline events
const TAX_DEADLINES = [
  {
    id: 'pnd90_91',
    form: 'ภ.ง.ด.90 / ภ.ง.ด.91',
    title: 'ยื่นภาษีเงินได้บุคคลธรรมดา ประจำปี',
    date: '31 มีนาคม',
    dateOnline: '8 เมษายน (ยื่นออนไลน์)',
    description: 'ยื่นแบบแสดงรายการภาษีเงินได้บุคคลธรรมดาประจำปีภาษี 2567',
    color: '#16a34a',
  },
];

export async function POST(req: NextRequest) {
  try {
    // Verify admin token
    const auth = req.headers.get('Authorization') ?? '';
    const token = auth.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deadlineId, subject, recipientType } = await req.json();
    if (!deadlineId) return NextResponse.json({ error: 'deadlineId is required' }, { status: 400 });

    const dl = TAX_DEADLINES.find(d => d.id === deadlineId);
    if (!dl) return NextResponse.json({ error: 'Invalid deadlineId' }, { status: 400 });

    // Fetch all users from profiles
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, username');

    if (recipientType === 'self') {
      query = query.eq('id', user.id);
    }

    const { data: profiles, error: profileErr } = await query;
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    // Get emails from auth.users
    const userIds = (profiles ?? []).map(p => p.id);
    if (userIds.length === 0) return NextResponse.json({ sent: 0, message: 'ไม่พบผู้รับ' });

    const { data: authUsers, error: authUsersErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersErr) return NextResponse.json({ error: authUsersErr.message }, { status: 500 });

    const emailMap: Record<string, string> = {};
    for (const u of authUsers.users) {
      if (u.email && userIds.includes(u.id)) emailMap[u.id] = u.email;
    }

    const recipients = (profiles ?? [])
      .filter(p => emailMap[p.id])
      .map(p => ({ email: emailMap[p.id], name: p.full_name || p.username || 'ผู้ใช้งาน' }));

    if (recipients.length === 0) return NextResponse.json({ sent: 0, message: 'ไม่พบอีเมลผู้รับ' });

    const emailSubject = subject || `📢 แจ้งเตือน: ${dl.title}`;

    let sent = 0;
    const results: { email: string; name: string; status: 'sent' | 'failed'; error?: string }[] = [];
    for (const r of recipients) {
      try {
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID!,
          process.env.EMAILJS_TEMPLATE_ID!,
          {
            to_email: r.email,
            to_name: r.name,
            form: dl.form,
            title: dl.title,
            date: dl.date,
            date_online: dl.dateOnline,
            description: dl.description,
            subject: emailSubject,
          },
          {
            publicKey: process.env.EMAILJS_PUBLIC_KEY!,
            privateKey: process.env.EMAILJS_PRIVATE_KEY!,
          }
        );
        sent++;
        results.push({ email: r.email, name: r.name, status: 'sent' });
      } catch (e: any) {
        results.push({ email: r.email, name: r.name, status: 'failed', error: e.message ?? JSON.stringify(e) });
      }
    }

    return NextResponse.json({ sent, total: recipients.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    deadlines: TAX_DEADLINES.map(({ id, form, title, date, dateOnline }) => ({ id, form, title, date, dateOnline }))
  });
}
