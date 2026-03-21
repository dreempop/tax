// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import {
  Users, FileText, Eye, EyeOff,
  Loader2, BarChart2, RefreshCw, AlertTriangle, Bell, Send,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

interface Stats {
  users: { total: number };
  articles: { total: number; published: number; draft: number };
  categories: { name: string; count: number }[];
  monthly: { month: string; count: number }[];
  recentArticles: { id: string; title: string; published_at: string; is_published: boolean; category: string }[];
  draftArticles: { id: string; title: string; category: string }[];
  recentUsers: { id: string; full_name: string | null; username: string | null; updated_at: string }[];
}

const TAX_DEADLINES = [
  { id: 'pnd90_91', form: 'ภ.ง.ด.90/91', title: 'ยื่นภาษีเงินได้บุคคลธรรมดา', date: '31 มี.ค.' },
  { id: 'pnd94',   form: 'ภ.ง.ด.94',    title: 'ยื่นภาษีครึ่งปี (ม.ค.–มิ.ย.)',   date: '30 ก.ย.' },
  { id: 'pnd1',    form: 'ภ.ง.ด.1',     title: 'นำส่งภาษีหัก ณ ที่จ่าย',         date: 'ทุกวันที่ 7' },
  { id: 'vat',     form: 'ภ.พ.30',      title: 'ยื่นภาษีมูลค่าเพิ่ม (VAT)',       date: 'ทุกวันที่ 15' },
];

function NotifyPanel({ token }: { token: string }) {
  const [selectedId, setSelectedId] = useState(TAX_DEADLINES[0].id);
  const [recipientType, setRecipientType] = useState<'all' | 'self'>('self');
  const [sending, setSending] = useState(false);
  type RecipientResult = { email: string; name: string; status: 'sent' | 'failed'; error?: string };
  const [result, setResult] = useState<{ sent?: number; total?: number; error?: string; results?: RecipientResult[]; message?: string } | null>(null);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deadlineId: selectedId, recipientType }),
      });
      setResult(await res.json());
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-white">ส่งอีเมลแจ้งเตือนกำหนดภาษี</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(['self', 'all'] as const).map(type => (
            <button
              key={type}
              onClick={() => setRecipientType(type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                recipientType === type
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {type === 'self' ? '🧪 ทดสอบ' : '📮 ทุกคน'}
            </button>
          ))}
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {sending ? 'กำลังส่ง...' : 'ส่งแจ้งเตือน'}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className={`text-xs px-4 py-2.5 rounded-lg border ${
            result.error ? 'bg-red-900/30 border-red-800 text-red-400'
            : result.sent === result.total ? 'bg-green-900/30 border-green-800 text-green-400'
            : 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
          }`}>
            {result.error
              ? `❌ ${result.error}`
              : result.message
              ? `ℹ️ ${result.message}`
              : `✅ ส่งสำเร็จ ${result.sent} / ${result.total} อีเมล`}
          </div>

          {/* Per-user status table */}
          {result.results && result.results.length > 0 && (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800/60">
                    <th className="text-left text-gray-500 font-medium px-4 py-2">ชื่อ</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-2">อีเมล</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {result.results.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-white">{r.name}</td>
                      <td className="px-4 py-2.5 text-gray-400">{r.email}</td>
                      <td className="px-4 py-2.5 text-center">
                        {r.status === 'sent'
                          ? <span className="inline-flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>ส่งแล้ว</span>
                          : <span className="inline-flex items-center gap-1 text-red-400" title={r.error}><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>ล้มเหลว</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ORANGE = '#f97316';
const GRAY = '#374151';
const PIE_COLORS_ARTICLE = [ORANGE, GRAY];

const TooltipStyle = {
  contentStyle: { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#f97316' },
};

function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: number; sub?: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start justify-between hover:border-${accent}-500/40 transition-colors`}>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className="text-gray-600">{icon}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const fetchStats = async (tk: string) => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (!res.ok) { setError('ไม่สามารถโหลดข้อมูลสถิติได้'); setLoading(false); return; }
    setStats(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setToken(session.access_token);
      fetchStats(session.access_token);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-32">
      <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
    </div>
  );

  if (error || !stats) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-400">{error || 'ไม่พบข้อมูล'}</p>
      <button onClick={() => fetchStats(token)} className="mt-4 flex items-center gap-2 mx-auto text-sm text-orange-400 hover:text-orange-300">
        <RefreshCw className="w-4 h-4" /> ลองใหม่
      </button>
    </div>
  );

  const articlePieData = [
    { name: 'เผยแพร่', value: stats.articles.published },
    { name: 'ฉบับร่าง', value: stats.articles.draft },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมระบบ C-Advisor</p>
        </div>
        <button onClick={() => fetchStats(token)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ผู้ใช้ทั้งหมด"   value={stats.users.total}    sub="บัญชีในระบบ"                                          icon={<Users className="w-6 h-6" />}   accent="blue" />
        <StatCard label="บทความทั้งหมด"    value={stats.articles.total} sub={`เผยแพร่แล้ว ${stats.articles.published} บทความ`}   icon={<FileText className="w-6 h-6" />} accent="green" />
        <StatCard label="เผยแพร่แล้ว"      value={stats.articles.published} sub="บทความที่มีคนอ่าน"                               icon={<Eye className="w-6 h-6" />}     accent="orange" />
        <StatCard label="ฉบับร่าง"         value={stats.articles.draft} sub="ยังไม่เผยแพร่"                                       icon={<EyeOff className="w-6 h-6" />}  accent="gray" />
      </div>

      {/* Line chart — monthly articles */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-white">บทความรายเดือน (6 เดือนล่าสุด)</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TooltipStyle} formatter={(v) => [v, 'บทความ']} />
            <Line type="monotone" dataKey="count" stroke={ORANGE} strokeWidth={2} dot={{ fill: ORANGE, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart + Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — categories */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">บทความตามหมวดหมู่</h2>
          </div>
          {stats.categories.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.categories} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipStyle} formatter={(v) => [v, 'บทความ']} />
                <Bar dataKey="count" fill={ORANGE} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — articles only */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">สัดส่วนบทความ</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={articlePieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {articlePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS_ARTICLE[i]} />)}
                </Pie>
                <Tooltip {...TooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">บทความล่าสุด</h2>
          </div>
          {stats.recentArticles.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {stats.recentArticles.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white line-clamp-1">{a.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.category} · {new Date(a.published_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5 ${a.is_published ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {a.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {a.is_published ? 'เผยแพร่' : 'ร่าง'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draft articles */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-white">ฉบับร่าง</h2>
            </div>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{stats.articles.draft}</span>
          </div>
          {stats.draftArticles.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีฉบับร่าง</p>
          ) : (
            <div className="space-y-3">
              {stats.draftArticles.map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0"></span>
                  <div className="min-w-0">
                    <p className="text-sm text-white line-clamp-1">{a.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.category || 'ไม่ระบุหมวด'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">ผู้ใช้ล่าสุด</h2>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-gray-600 text-sm">ไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-white line-clamp-1">
                      {u.full_name || u.username || <span className="text-gray-600">ไม่ระบุชื่อ</span>}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(u.updated_at).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NotifyPanel token={token} />

    </div>
  );
}