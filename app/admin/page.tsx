// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Users, FileText, BarChart2, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { label: 'จัดการผู้ใช้', icon: <Users className="w-6 h-6" />, href: '/admin/users', desc: 'ดู / ระงับ / ลบบัญชีผู้ใช้' },
    { label: 'จัดการบทความ', icon: <FileText className="w-6 h-6" />, href: '/admin/articles', desc: 'เพิ่ม แก้ไข ลบบทความ' },
    { label: 'สถิติการใช้งาน', icon: <BarChart2 className="w-6 h-6" />, href: '/admin/stats', desc: 'ภาพรวมการใช้แอปพลิเคชัน' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">จัดการระบบ C-Advisor</p>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 group"
          >
            <span className="text-gray-500 group-hover:text-orange-400 transition-colors">
              {item.icon}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
