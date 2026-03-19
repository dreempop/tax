'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Loader2,
  AlertCircle,
  ImageIcon,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';

// Type for profile data
type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  updated_at: string;
};

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Document upload state
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documents, setDocuments] = useState<{ fileName: string; publicUrl: string }[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    full_name: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setSession(session);
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`*`)
          .eq('id', session.user.id)
          .single();

        if (error && status !== 406) throw error;

        if (data) {
          setProfile(data);
          setFormData({
            username: data.username || '',
            full_name: data.full_name || ''
          });
          fetchDocuments(session.user.id);
        }
      } catch (error: any) {
        setError('Unable to load profile data');
        console.error('Error fetching profile:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const fetchDocuments = async (userId: string) => {
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list(userId, { sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const docs = (data || []).map(file => ({
        fileName: `${userId}/${file.name}`,
        publicUrl: supabase.storage.from('documents').getPublicUrl(`${userId}/${file.name}`).data.publicUrl,
      }));
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDocUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!session) return;

    setUploadingDoc(true);
    try {
      const form = new FormData();
      Array.from(event.target.files).forEach(f => form.append('file', f));
      form.append('userId', session.user.id);

      const res = await fetch('/api/upload-image', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);

      const newDocs = json.uploaded.map((u: { fileName: string; publicUrl: string }) => ({
        fileName: u.fileName,
        publicUrl: u.publicUrl,
      }));
      setDocuments(prev => [...newDocs, ...prev]);
    } catch (error: any) {
      setSaveMessage(`อัปโหลดไม่สำเร็จ: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 4000);
    } finally {
      setUploadingDoc(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDeleteDoc = async (fileName: string) => {
    try {
      const res = await fetch('/api/upload-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDocuments(prev => prev.filter(d => d.fileName !== fileName));
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!session) return;

    const file = event.target.files[0];
    setUploadingAvatar(true);
    setSaveMessage('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('userId', session.user.id);

      const res = await fetch('/api/upload-avatar', { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);

      const publicUrl: string = json.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile!, avatar_url: publicUrl, updated_at: new Date().toISOString() });
      setSaveMessage('อัปโหลดรูปแบบสำเร็จ');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage(`อัปโหลดไม่สำเร็จ: ${error.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          username: formData.username,
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;

      setProfile({
        ...profile!,
        username: formData.username,
        full_name: formData.full_name,
        updated_at: new Date().toISOString(),
      });
      setSaveMessage('Profile updated successfully');
      setEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-green-600 font-medium tracking-wide">กำลังโหลดข้อมูล...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full text-center"
        >
          <div className="mx-auto w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-neutral-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </motion.div>
      </div>
    );
  }

  if (!session || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 sm:py-14 px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-2xl mx-auto space-y-5"
      >
        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Banner */}
          <div className="relative h-28 sm:h-36 bg-gradient-to-r from-green-500 to-green-400">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-neutral-700 hover:bg-white transition-all shadow-sm"
              >
                {editing ? <><X className="w-4 h-4" /> ยกเลิก</> : <><Edit2 className="w-4 h-4" /> แก้ไขโปรไฟล์</>}
              </button>
            </div>
          </div>

          {/* Avatar + Name */}
          <div className="px-6 sm:px-8 pb-7">
            <div className="relative -mt-14 sm:-mt-16 mb-5 flex items-end justify-between">
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-2xl">
                      <Loader2 className="h-7 w-7 animate-spin text-white" />
                    </div>
                  )}
                  {profile.avatar_url ? (
                    <img className="h-full w-full object-cover" src={profile.avatar_url} alt="Avatar" />
                  ) : (
                    <div className="h-full w-full bg-green-50 flex items-center justify-center">
                      <User className="h-10 w-10 text-green-300" />
                    </div>
                  )}
                </div>
                {editing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-colors z-20"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  </>
                )}
              </div>
              {saveMessage && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    saveMessage.includes('Error') || saveMessage.includes('ไม่สำเร็จ')
                      ? 'bg-red-50 text-red-500'
                      : 'bg-green-50 text-green-600'
                  }`}
                >
                  {saveMessage}
                </motion.span>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {profile.full_name || 'ผู้ใช้งาน'}
              </h1>
              <p className="text-sm text-neutral-400 font-medium">@{profile.username || 'username'}</p>
            </div>
          </div>
        </div>

        {/* ── Personal Information Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8">
          <h2 className="text-base font-bold text-neutral-900 mb-6 uppercase tracking-widest text-xs text-green-600">ข้อมูลส่วนตัว</h2>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> อีเมล
              </label>
              <div className="text-neutral-700 font-medium px-4 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-sm">
                {session.user.email}
              </div>
            </div>

            {/* Full Name + Username */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5" /> ชื่อ-นามสกุล
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-neutral-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none text-sm font-medium"
                    placeholder="ชื่อ-นามสกุลของคุณ"
                  />
                ) : (
                  <div className="text-neutral-700 font-medium px-4 py-3 rounded-2xl text-sm">
                    {profile.full_name || <span className="text-neutral-300">ยังไม่ได้ตั้งค่า</span>}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5" /> ชื่อผู้ใช้
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-neutral-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none text-sm font-medium"
                    placeholder="ชื่อผู้ใช้"
                  />
                ) : (
                  <div className="text-neutral-700 font-medium px-4 py-3 rounded-2xl text-sm">
                    {profile.username || <span className="text-neutral-300">ยังไม่ได้ตั้งค่า</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer row */}
          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>อัปเดตล่าสุด: {new Date(profile.updated_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {editing && (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</> : <><Save className="w-4 h-4" /> บันทึก</>}
              </button>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-2xl border border-green-100">
                <ImageIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-green-600 uppercase tracking-widest">เอกสารของฉัน</h2>
                <p className="text-xs text-neutral-400 mt-0.5">สลิป ใบเสร็จ หรือเอกสารภาษีของคุณ</p>
              </div>
            </div>
            <button
              onClick={() => docFileInputRef.current?.click()}
              disabled={uploadingDoc}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {uploadingDoc ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปโหลด...</>
              ) : (
                <><Upload className="w-4 h-4" /> อัปโหลดรูป</>
              )}
            </button>
            <input
              type="file"
              ref={docFileInputRef}
              onChange={handleDocUpload}
              className="hidden"
              accept="image/*"
              multiple
            />
          </div>

          {loadingDocs ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
            </div>
          ) : documents.length === 0 ? (
            <button
              onClick={() => docFileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-neutral-200 rounded-2xl py-16 flex flex-col items-center gap-3 text-neutral-400 hover:border-green-300 hover:text-green-500 transition-colors group"
            >
              <div className="p-4 bg-neutral-50 group-hover:bg-green-50 rounded-2xl transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปหรือเอกสาร</span>
              <span className="text-xs">รองรับ JPG, PNG ขนาดไม่เกิน 10 MB</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.fileName}
                  className="relative group aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100"
                >
                  <img
                    src={doc.publicUrl}
                    alt="document"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeleteDoc(doc.fileName)}
                      className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => docFileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:border-green-300 hover:text-green-500 transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">เพิ่มรูป</span>
              </button>
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}