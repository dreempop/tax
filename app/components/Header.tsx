// app/components/Header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Home, MessageSquare, FileText, Calculator, User, LogOut, Menu, X, Image } from 'lucide-react';
import LoginPopup from './LoginPopup';
import RegisterPopup from './RegisterPopup';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [registerPopupOpen, setRegisterPopupOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // รายการเมนูพื้นฐาน (แสดงเสมอ)
  const baseNavItems = [
    { name: 'หน้าแรก', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'แชทบอท', href: '/homepage/chatbot', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'บทความ', href: '/articles', icon: <FileText className="w-4 h-4" /> },
    { name: 'คำนวณภาษี', href: '/tax-calculator', icon: <Calculator className="w-4 h-4" /> },
  ];

  // เมนูที่แสดงเฉพาะเมื่อล็อกอิน
  const loggedInNavItems = [
    { name: 'บันทึกการบริจาค', href: '/gallery', icon: <Image className="w-4 h-4" /> },
  ];

  // รวมรายการเมนูทั้งหมดตามสถานะการล็อกอิน
  const [navItems, setNavItems] = useState(baseNavItems);

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);

      if (user) {
        setNavItems([...baseNavItems, ...loggedInNavItems]);
        // ดึง avatar_url จาก profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        if (profile?.avatar_url) setProfileAvatarUrl(profile.avatar_url);
      } else {
        setNavItems(baseNavItems);
        setProfileAvatarUrl(null);
      }
    };

    getUser();

    // ฟัง event เมื่อมีการเปลี่ยนแปลงสถานะการเข้าสู่ระบบ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any | null) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);

        if (currentUser) {
          setNavItems([...baseNavItems, ...loggedInNavItems]);
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', currentUser.id)
            .single();
          if (profile?.avatar_url) setProfileAvatarUrl(profile.avatar_url);
        } else {
          setNavItems(baseNavItems);
          setProfileAvatarUrl(null);
        }
      }
    );
    

    return () => subscription.unsubscribe();
  }, []);

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // จัดการการออกจากระบบ
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push('/');
  };

  // จัดการ popup
  const openLoginPopup = () => {
    setLoginPopupOpen(true);
    setRegisterPopupOpen(false);
  };

  const openRegisterPopup = () => {
    setRegisterPopupOpen(true);
    setLoginPopupOpen(false);
  };

  const closePopups = () => {
    setLoginPopupOpen(false);
    setRegisterPopupOpen(false);
  };

  // ข้อมูลผู้ใช้
  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ผู้ใช้งาน';
  const avatarUrl = profileAvatarUrl || user?.user_metadata?.avatar_url || null;

  // ซ่อน Header บนหน้า admin
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          {/* Logo - ด้านซ้าย */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">C-Advisor</span>
            </Link>
          </div>

          {/* Navigation Links - ตรงกลาง */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* ด้านขวา - ระบบเข้าสู่ระบบหรือเมนูผู้ใช้ */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <span className="hidden md:block font-medium">{username}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      โปรไฟล์ของฉัน
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <button
                  onClick={openLoginPopup}
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={openRegisterPopup}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* ปุ่มเมนูสำหรับมือถือ */}
            <button
              className="md:hidden ml-2 p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* เมนูสำหรับมือถือ */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>โปรไฟล์ของฉัน</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    onClick={() => {
                      openLoginPopup();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => {
                      openRegisterPopup();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Popup สำหรับ Login/Register */}
      <LoginPopup
        isOpen={loginPopupOpen}
        onClose={closePopups}
        onSwitchToRegister={openRegisterPopup}
        onLoginSuccess={() => console.log('Login successful')}
      />
      <RegisterPopup
        isOpen={registerPopupOpen}
        onClose={closePopups}
        onSwitchToLogin={openLoginPopup}
        onRegisterSuccess={() => console.log('Registration successful')}
      />
    </>
  );
};

export default Header;