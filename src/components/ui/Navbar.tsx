'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Briefcase,
  GraduationCap,
  ChevronDown,
  PlusCircle,
  Clock,
  Menu,
  X,
  LogOut,
  FileText,
  UserCheck,
  Bell,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Button } from './Button';
import { LogoIcon } from './LogoIcon';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, currentStudent, currentBusiness, notifications, markNotificationAsRead, logout } = useApp();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const myNotifications = notifications.filter((n) => n.user_id === currentUser?.id);
  const unreadCount = myNotifications.filter((n) => !n.is_read).length;

  // If in the isolated admin panel, do NOT render the main website navbar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5DFD5] bg-[#F7F4EE]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Main Branding */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#0D3D2B] flex items-center justify-center text-white shadow-md shadow-[#0D3D2B]/20 group-hover:scale-105 transition-transform p-2">
                <LogoIcon className="w-full h-full text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#111C16]">
                  StudentConnect
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/projects"
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  pathname === '/projects'
                    ? 'text-white bg-[#0D3D2B] shadow-xs'
                    : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                }`}
              >
                Find Projects
              </Link>

              {/* Student Dynamic Links */}
              {currentUser?.role === 'student' && (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pathname === '/student/dashboard'
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    Workspace
                  </Link>
                  <Link
                    href="/student/applications"
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pathname.startsWith('/student/applications')
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    href="/student/profile"
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pathname.startsWith('/student/profile')
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* Business Dynamic Links */}
              {currentUser?.role === 'business' && (
                <>
                  <Link
                    href="/business/dashboard"
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pathname === '/business/dashboard'
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    Business Hub
                  </Link>
                  <Link
                    href="/business/projects"
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      pathname === '/business/projects'
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    My Projects
                  </Link>
                  <Link
                    href="/business/projects/new"
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      pathname === '/business/projects/new'
                        ? 'text-white bg-[#0D3D2B] shadow-xs'
                        : 'text-stone-700 hover:text-[#0D3D2B] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#16563D]" />
                    Post Project
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Bar & User Profile */}
          <div className="flex items-center gap-3">
            {currentUser && currentUser.role !== 'admin' ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifDropdownOpen(!isNotifDropdownOpen);
                      setIsRoleDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-full border border-[#E5DFD5] bg-white hover:bg-[#EFE9DE] text-stone-700 transition-all cursor-pointer shadow-xs"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4 text-[#0D3D2B]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16563D] text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 font-black text-xs text-[#0D3D2B]">
                          <Bell className="w-3.5 h-3.5 text-[#16563D]" />
                          Notifications
                        </div>
                        <span className="text-[10px] text-stone-400 font-bold">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {myNotifications.length > 0 ? (
                          myNotifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-3 rounded-2xl border text-xs space-y-1 transition-colors cursor-pointer ${
                                !n.is_read
                                  ? 'bg-[#F4F9F6] border-[#D6EADB]'
                                  : 'bg-[#FAF7F2] border-[#EAE4D9] opacity-80'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-stone-900">
                                <span className="flex items-center gap-1">
                                  {n.type === 'application_accepted' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16563D]" />
                                  )}
                                  {n.type === 'message' && (
                                    <MessageSquare className="w-3.5 h-3.5 text-[#0D3D2B]" />
                                  )}
                                  {n.title}
                                </span>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-[#16563D]" />
                                )}
                              </div>
                              <p className="text-[11px] text-stone-600 leading-normal">
                                {n.message}
                              </p>
                              {n.workspace_id && (
                                <div className="pt-1">
                                  <Link
                                    href={`/workspace/${n.workspace_id}`}
                                    onClick={() => setIsNotifDropdownOpen(false)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0D3D2B] hover:underline"
                                  >
                                    Launch Workspace →
                                  </Link>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-stone-400 font-medium">
                            No notifications yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Role Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(!isRoleDropdownOpen);
                      setIsNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E5DFD5] bg-white/90 hover:bg-[#EFE9DE] transition-all text-xs font-bold text-stone-800 cursor-pointer shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0D3D2B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {currentUser.role === 'student' && <GraduationCap className="w-4 h-4" />}
                      {currentUser.role === 'business' && <Briefcase className="w-4 h-4" />}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-stone-900 truncate max-w-[130px]">
                        {currentUser.role === 'student'
                          ? currentStudent?.full_name || 'Student'
                          : currentBusiness?.business_name || 'Business'}
                      </div>
                      <div className="text-[10px] text-[#16563D] capitalize font-medium flex items-center gap-1">
                        <span>{currentUser.role === 'business' ? 'Client' : currentUser.role}</span>
                        {currentUser.status === 'pending_approval' && (
                          <span className="text-[#0D3D2B] font-bold">(Pending Verification)</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
                  </button>

                  {/* Account Actions Dropdown */}
                  {isRoleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Info Header */}
                      <div className="p-3 border-b border-stone-100 bg-[#FAF7F2] rounded-2xl mb-2">
                        <div className="font-extrabold text-xs text-stone-900 truncate">
                          {currentUser.role === 'student'
                            ? currentStudent?.full_name
                            : currentBusiness?.business_name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {currentUser.email}
                        </div>
                        {currentUser.role === 'student' && currentStudent?.school && (
                          <div className="text-[10px] text-[#0D3D2B] font-bold mt-1">
                            🏫 {currentStudent.school}
                          </div>
                        )}
                        {currentUser.role === 'business' && currentBusiness?.location && (
                          <div className="text-[10px] text-[#0D3D2B] font-bold mt-1">
                            📍 {currentBusiness.location}
                          </div>
                        )}
                      </div>

                      {/* Student Exclusive Account Actions */}
                      {currentUser.role === 'student' && (
                        <div className="space-y-1">
                          <Link
                            href="/student/dashboard"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            Student Workspace
                          </Link>
                          <Link
                            href="/student/applications"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            My Applications
                          </Link>
                          <Link
                            href="/student/profile"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            Edit Profile
                          </Link>
                        </div>
                      )}

                      {/* Business/Client Exclusive Account Actions */}
                      {currentUser.role === 'business' && (
                        <div className="space-y-1">
                          <Link
                            href="/business/dashboard"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            Business Dashboard
                          </Link>
                          <Link
                            href="/business/projects"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            My Projects
                          </Link>
                          <Link
                            href="/business/projects/new"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#EFE9DE] text-stone-800 flex items-center gap-2"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-[#0D3D2B]" />
                            Post a Project Need
                          </Link>
                        </div>
                      )}

                      {/* Log Out */}
                      <div className="pt-2 mt-2 border-t border-stone-100">
                        <button
                          onClick={() => {
                            logout();
                            setIsRoleDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-600" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary" className="hidden sm:inline-flex">
                    Signup
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-stone-700 hover:bg-[#EFE9DE]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5DFD5] space-y-2">
            <Link
              href="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
            >
              Find Projects
            </Link>
            {currentUser?.role === 'student' && (
              <>
                <Link
                  href="/student/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  Student Dashboard
                </Link>
                <Link
                  href="/student/applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  Applications
                </Link>
                <Link
                  href="/student/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  Profile
                </Link>
              </>
            )}
            {currentUser?.role === 'business' && (
              <>
                <Link
                  href="/business/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  Business Dashboard
                </Link>
                <Link
                  href="/business/projects"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  My Projects
                </Link>
                <Link
                  href="/business/projects/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 hover:bg-[#EFE9DE]"
                >
                  Post a Project
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-[#E5DFD5]">
              {!currentUser || currentUser.role === 'admin' ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold border border-[#E5DFD5] text-stone-800 hover:bg-[#EFE9DE]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-[#0D3D2B] text-white hover:bg-[#08281A]"
                  >
                    Signup
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pending Account Notice Banner */}
      {currentUser?.status === 'pending_approval' && currentUser.role !== 'admin' && (
        <div className="bg-[#0D3D2B] text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-[#34D399]" />
          <span>
            Your account profile is currently awaiting verification by the community team.
          </span>
        </div>
      )}
    </header>
  );
}
