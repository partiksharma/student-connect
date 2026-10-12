'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, profiles, projects, reports, logout } = useApp();
  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);

  // If on admin login page, just render children directly
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  // Active Server-Side Session Verification
  useEffect(() => {
    let isMounted = true;

    fetch('/api/admin/session')
      .then(async (res) => {
        if (!res.ok) {
          if (isMounted) {
            setSessionVerified(false);
            router.replace('/admin/login');
          }
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (isMounted) {
          if (data.authenticated) {
            setSessionVerified(true);
          } else {
            setSessionVerified(false);
            router.replace('/admin/login');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setSessionVerified(false);
          router.replace('/admin/login');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const isAuthorized = sessionVerified === true && currentUser && currentUser.role === 'admin';

  const pendingStudents = profiles.filter((p) => p.role === 'student' && (p.status === 'pending_approval' || (p.status as string) === 'pending')).length;
  const pendingBusinesses = profiles.filter((p) => p.role === 'business' && (p.status === 'pending_approval' || (p.status as string) === 'pending')).length;
  const pendingProjects = projects.filter((p) => p.status === 'pending_approval' || (p.status as string) === 'pending').length;
  const totalApprovalsPending = pendingStudents + pendingBusinesses + pendingProjects;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    logout();
    router.push('/admin/login');
  };

  const navItems = [
    {
      name: 'Dashboard & Metrics',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Approval Queue',
      href: '/admin/approvals',
      icon: CheckCircle2,
      badge: totalApprovalsPending > 0 ? totalApprovalsPending : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      name: 'Safety & Reports',
      href: '/admin/reports',
      icon: AlertTriangle,
      badge: pendingReportsCount > 0 ? pendingReportsCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  if (sessionVerified === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Staff Admin Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              This panel is separated from the public platform and restricted to authorized team members.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/admin/login"
              className="block w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20 text-center"
            >
              Sign In to Admin Portal →
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors text-center"
            >
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-4 sm:p-6 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 lg:pb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-[#0D3D2B] flex items-center justify-center text-white p-2 shadow-md shrink-0">
            <LogoIcon className="w-full h-full text-white" />
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight block">
              StudentConnect
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Admin Back-Office
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="py-3 lg:py-6 flex-1 flex flex-row lg:flex-col overflow-x-auto gap-2 lg:gap-0 lg:space-y-1.5 scrollbar-none">
          <div className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Management & Moderation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 lg:shrink ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Public Website & Session Controls */}
        <div className="pt-3 lg:pt-4 border-t border-slate-800 flex flex-row lg:flex-col gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex-1 flex items-center justify-between px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">View Public Website</span>
              <span className="sm:hidden">Website</span>
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Live</span>
          </Link>

          <button
            onClick={handleAdminLogout}
            className="flex-1 flex items-center gap-2 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sign Out Admin</span>
            <span className="sm:hidden">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Minimal Admin Header */}
        <header className="h-14 sm:h-16 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-slate-400 truncate">
              Admin Session Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 max-w-[200px] sm:max-w-none truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{currentUser?.email || 'partiksharmabscc@gmail.com'}</span>
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
