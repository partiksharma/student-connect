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
    <footer className="border-t border-[#400B15] bg-[#58111F] text-amber-50 py-14 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7A1C2E] flex items-center justify-center text-white p-1.5 shadow-sm">
              <LogoIcon className="w-full h-full text-white" />
            </div>
            <span className="font-black text-lg text-white">StudentConnect</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            The free platform connecting driven university students with small businesses for real-world project work, references, and growth.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5">
            For Students
          </h4>
          <ul className="space-y-2.5 text-xs text-amber-100/70 font-medium">
            <li>
              <Link href="/projects" className="hover:text-amber-300 transition-colors">
                Find Projects
              </Link>
            </li>
            <li>
              <Link href="/student/dashboard" className="hover:text-amber-300 transition-colors">
                Student Workspace
              </Link>
            </li>
            <li>
              <Link href="/student/profile" className="hover:text-amber-300 transition-colors">
                Profile Builder
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5">
            For Small Businesses
          </h4>
          <ul className="space-y-2.5 text-xs text-amber-100/70 font-medium">
            <li>
              <Link href="/business/projects/new" className="hover:text-amber-300 transition-colors">
                Post a Project Need
              </Link>
            </li>
            <li>
              <Link href="/business/dashboard" className="hover:text-amber-300 transition-colors">
                Business Hub
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-amber-300 transition-colors">
                Zero-Cost Small Biz Program
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3.5">
            About & Community
          </h4>
          <ul className="space-y-2.5 text-xs text-amber-100/70 font-medium">
            <li>
              <Link href="/about" className="hover:text-amber-300 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/creator" className="hover:text-amber-300 transition-colors">
                Creator
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-300 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
