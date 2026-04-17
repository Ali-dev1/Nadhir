import React, { useState } from 'react';
import { StaticPageLayout } from '../layouts/StaticPageLayout';
import { MessageCircle, Mail, Clock, Send, Loader2, CheckCircle, Camera } from 'lucide-react';

const STORE_PHONE = '254799999355';
const STORE_EMAIL = 'nadhirthobes@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj';
const TIKTOK_URL = 'https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate sending — in production this would call a Resend edge function
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <StaticPageLayout title="Contact Us">
      <p className="text-lg text-charcoal/80 mb-10">
        We'd love to hear from you. Reach out through any of the channels below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <a
          href={`https://wa.me/${STORE_PHONE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-charcoal/10 p-6 text-center hover:border-green-300 transition-colors group"
        >
          <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-medium text-charcoal mb-1">WhatsApp</h3>
          <p className="text-sm text-charcoal/50">Fastest response</p>
          <p className="text-sm text-green-600 mt-2 group-hover:underline">Chat Now →</p>
        </a>

        <a href={`mailto:${STORE_EMAIL}`} className="bg-white border border-charcoal/10 p-6 text-center hover:border-gold/30 transition-colors group">
          <Mail className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="font-medium text-charcoal mb-1">Email</h3>
          <p className="text-sm text-charcoal/50">{STORE_EMAIL}</p>
          <p className="text-sm text-gold mt-2 group-hover:underline">Send Email →</p>
        </a>

        <div className="bg-white border border-charcoal/10 p-6 text-center">
          <Clock className="w-8 h-8 text-charcoal/40 mx-auto mb-3" />
          <h3 className="font-medium text-charcoal mb-1">Business Hours</h3>
          <p className="text-sm text-charcoal/50">Mon — Sat: 9am – 7pm</p>
          <p className="text-sm text-charcoal/50">Sunday: 10am – 4pm</p>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-charcoal/10 p-6 text-center hover:border-pink-300 transition-colors group"
        >
          <Camera className="w-8 h-8 text-pink-600 mx-auto mb-3" />
          <h3 className="font-medium text-charcoal mb-1">Instagram</h3>
          <p className="text-sm text-charcoal/50">@nadhirthobes</p>
          <p className="text-sm text-pink-600 mt-2 group-hover:underline">Follow Us →</p>
        </a>

        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-charcoal/10 p-6 text-center hover:border-charcoal/30 transition-colors group"
        >
          <svg className="w-8 h-8 text-charcoal mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.01a6.34 6.34 0 00-.82-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.76 1.53V7.45c-1 0-1.93-.28-2.72-.76z"/></svg>
          <h3 className="font-medium text-charcoal mb-1">TikTok</h3>
          <p className="text-sm text-charcoal/50">@nadhirthobes</p>
          <p className="text-sm text-charcoal mt-2 group-hover:underline">Watch Now →</p>
        </a>
      </div>

      <h2 className="text-2xl font-serif text-charcoal mb-6">Send us a Message</h2>
      <form onSubmit={handleSubmit} className="bg-white border border-charcoal/10 p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Your Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Message</label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            className="w-full px-4 py-3 border border-charcoal/20 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-base resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={status !== 'idle'}
          className="btn-primary min-h-[48px] disabled:opacity-50"
        >
          {status === 'sending' ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</span>
          ) : status === 'sent' ? (
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Message Sent!</span>
          ) : (
            <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
          )}
        </button>
      </form>
    </StaticPageLayout>
  );
};
