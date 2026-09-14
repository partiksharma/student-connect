'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'business' | 'other'>('student');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="flex flex-col bg-[#FCF9F6] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">
            <Mail className="w-3.5 h-3.5 text-amber-700" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#2A151B]">
            Contact StudentConnect
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-medium">
            Have questions about student projects, small business moderation, or partnerships? Send us a message and we&apos;ll get back to you promptly.
          </p>
        </div>

        {/* Contact Form & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E4DC] shadow-xs">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Message Received!</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Thank you for reaching out. Our support and moderation team will reply within 24 hours.
                </p>
                <Button size="sm" variant="outline" onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-stone-900 mb-2">Send us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    I am a...
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="student">University Student</option>
                    <option value="business">Small Business Owner</option>
                    <option value="other">University Faculty / Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question about project approval"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you today?..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#FCF9F6] text-stone-900 outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>

          {/* Right: Info cards & FAQs */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
              <div className="flex items-center gap-2.5 text-[#7A1C2E]">
                <ShieldCheck className="w-5 h-5 text-[#E59819]" />
                <h3 className="font-bold text-sm text-stone-900">Direct Support</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                For moderation escalations, platform safety, or feedback, you can reach out directly via:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC] text-stone-800 font-medium">
                  support@studentconnect.org
                </div>
                <div className="p-2.5 rounded-xl bg-[#FCF9F6] border border-[#F0E4DC] text-stone-800 font-medium">
                  moderation@studentconnect.org
                </div>
              </div>
            </div>

            <div className="bg-[#FFF8F3] rounded-3xl p-6 border border-[#F0E4DC] space-y-3">
              <div className="flex items-center gap-2 text-[#7A1C2E]">
                <HelpCircle className="w-5 h-5 text-[#E59819]" />
                <h3 className="font-bold text-sm text-stone-900">Quick Response Time</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our support team is active Monday through Friday, 9:00 AM – 6:00 PM. Most queries are answered within 4 hours.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
