// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { ShieldCheck, Users, FileText, BarChart2, LogOut, Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // หน้า login ไม่ต้องแสดง admin header
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) { setReady(true); return; }

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/admin/login'); return; }

      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { await supabase.auth.signOut(); router.replace('/admin/login'); return; }

      setAdminEmail(session.user.email ?? 'Admin');
      setReady(true);
    };
    check();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <Home className="w-4 h-4" /> },
    { label: 'ผู้ใช้', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'บทความ', href: '/admin/articles', icon: <FileText className="w-4 h-4" /> },
    { label: 'สถิติ', href: '/admin/stats', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Admin Header — ซ่อนในหน้า login */}
      {!isLoginPage && (
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-bold text-white">Admin</span>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-orange-500/10 text-orange-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: email + logout */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-gray-500 max-w-[160px] truncate">
                {adminEmail}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:block">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
