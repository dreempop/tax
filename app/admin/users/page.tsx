// app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import {
  Search, Pencil, Trash2, Loader2, CheckCircle2, XCircle,
  AlertTriangle, ShieldCheck, User,
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  updated_at: string;
  role: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [editModal, setEditModal] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setToken(session.access_token);
      fetchUsers(session.access_token);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (tk: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (!res.ok) {
      showToast('error', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(u =>
            u.username?.toLowerCase().includes(q) ||
            u.full_name?.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบผู้ใช้นี้?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    if (res.ok) {
      showToast('success', 'ลบผู้ใช้เรียบร้อยแล้ว');
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      showToast('error', 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    const res = await fetch(`/api/admin/users/${editModal.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editModal),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      setEditModal(null);
      showToast('success', 'บันทึกข้อมูลสำเร็จ');
    } else {
      showToast('error', 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-900/90 border border-green-700 text-green-300'
            : 'bg-red-900/90 border border-red-700 text-red-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">จัดการผู้ใช้</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} บัญชีทั้งหมด</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหรือ username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">ไม่พบผู้ใช้</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">ผู้ใช้</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Username</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">สิทธิ์</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">อัปเดตล่าสุด</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
                  {/* Avatar + name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium line-clamp-1">{user.full_name || '—'}</p>
                        <p className="text-gray-600 text-xs truncate max-w-[120px]">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-4 py-3.5 text-gray-400 hidden md:table-cell">
                    {user.username || <span className="text-gray-700">—</span>}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      user.role === 'admin'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role || 'user'}
                    </span>
                  </td>

                  {/* Updated at */}
                  <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString('th-TH') : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditModal(user)}
                        className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="ลบ"
                      >
                        {deletingId === user.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-yellow-400" />
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">แก้ไขข้อมูลผู้ใช้</h2>
                <button onClick={() => setEditModal(null)} className="text-gray-500 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={editModal.full_name ?? ''}
                    onChange={e => setEditModal(m => m ? { ...m, full_name: e.target.value } : m)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                  <input
                    type="text"
                    value={editModal.username ?? ''}
                    onChange={e => setEditModal(m => m ? { ...m, username: e.target.value } : m)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Website</label>
                  <input
                    type="text"
                    value={editModal.website ?? ''}
                    onChange={e => setEditModal(m => m ? { ...m, website: e.target.value } : m)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">สิทธิ์</label>
                  <select
                    value={editModal.role ?? 'user'}
                    onChange={e => setEditModal(m => m ? { ...m, role: e.target.value } : m)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
