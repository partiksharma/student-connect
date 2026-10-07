'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoIcon } from './LogoIcon';

export function Footer() {
  const pathname = usePathname();

  // If in the isolated admin panel, do NOT render the main website footer
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-[#E5DFD5] bg-[#F7F4EE] text-stone-700 py-14 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D3D2B] flex items-center justify-center text-white p-1.5 shadow-sm">
              <LogoIcon className="w-full h-full text-white" />
            </div>
            <span className="font-black text-lg text-[#111C16]">StudentConnect</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            The free platform connecting driven university students with small businesses for real-world project work, references, and growth.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0D3D2B] mb-3.5">
            For Students
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
            <li>
              <Link href="/projects" className="hover:text-[#0D3D2B] transition-colors">
                Find Projects
              </Link>
            </li>
            <li>
              <Link href="/student/dashboard" className="hover:text-[#0D3D2B] transition-colors">
                Student Workspace
              </Link>
            </li>
            <li>
              <Link href="/student/profile" className="hover:text-[#0D3D2B] transition-colors">
                Profile Builder
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0D3D2B] mb-3.5">
            For Small Businesses
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
            <li>
              <Link href="/business/projects/new" className="hover:text-[#0D3D2B] transition-colors">
                Post a Project Need
              </Link>
            </li>
            <li>
              <Link href="/business/dashboard" className="hover:text-[#0D3D2B] transition-colors">
                Business Hub
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-[#0D3D2B] transition-colors">
                Zero-Cost Small Biz Program
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#0D3D2B] mb-3.5">
            About & Community
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
            <li>
              <Link href="/about" className="hover:text-[#0D3D2B] transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/creator" className="hover:text-[#0D3D2B] transition-colors">
                Creator
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#0D3D2B] transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-stone-400 hover:text-amber-700 transition-colors flex items-center gap-1 text-[11px] pt-1">
                <span>🛡️</span> Staff / Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} StudentConnect Platform. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="hover:text-[#0D3D2B] transition-colors text-[11px]">
            Admin Portal
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-[#0D3D2B] transition-colors text-[11px]">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
