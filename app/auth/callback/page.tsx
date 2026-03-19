'use client';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/dashboard');
    });
  }, []);

  return <p>กำลังยืนยันอีเมล...</p>;
}
