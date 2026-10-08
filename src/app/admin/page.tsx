'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function AdminIndexPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Admin Portal...</p>
      </div>
    </div>
  );
}
