import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck,
  Camera,
  MessageSquare
} from 'lucide-react';
import { NadhirService } from '../services/api';

export const Footer: React.FC = () => {
  const [contactPhone, setContactPhone] = useState('254799999355');
  const [contactEmail, setContactEmail] = useState('nadhirthobes@gmail.com');
  const [whatsapp, setWhatsapp] = useState('254799999355');
  const [instagram, setInstagram] = useState('https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S');

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await NadhirService.getStoreSettings();
        if (settings) {
          setContactPhone(settings.contact_phone);
          setContactEmail(settings.contact_email);
          setWhatsapp(settings.whatsapp_number);
          setInstagram(settings.instagram_url || '');
          setTiktok(settings.tiktok_url || '');
        }
      } catch {
        // Use defaults
      }
    };
    load();
  }, []);

  return (
    <footer data-testid="footer" className="bg-[#111111] text-ivory border-t border-charcoal/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-ivory/5 mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ivory/5 flex items-center justify-center text-gold">
              <Truck strokeWidth={1} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Express Concierge</p>
              <p className="text-[9px] text-ivory/40 leading-relaxed uppercase tracking-widest">Nationwide & East Africa Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ivory/5 flex items-center justify-center text-gold">
              <ShieldCheck strokeWidth={1} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Master Craftsmanship</p>
              <p className="text-[9px] text-ivory/40 leading-relaxed uppercase tracking-widest">Authentic Gulf Tailoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ivory/5 flex items-center justify-center text-gold">
              <CreditCard strokeWidth={1} className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Secure Commerce</p>
              <p className="text-[9px] text-ivory/40 leading-relaxed uppercase tracking-widest">Safe & Flexible Payments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Nadhir Thobes" className="h-20 w-auto object-contain mb-2" />
              <p className="text-[9px] text-ivory/40 uppercase tracking-[0.5em] mt-1 ml-1 leading-none italic">Old Money • Nairobi Prestige</p>
            </Link>
            <p className="text-sm text-ivory/50 leading-relaxed max-w-sm font-light">
              Nadhir Thobes is a curated haven for the modern Nairobi gentleman, specializing in authentic Omani, Moroccan, and Emirati Kanzus alongside niche Arab fragrances.
            </p>
            <div className="flex items-center gap-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-ivory/5 text-ivory/30 hover:text-gold hover:bg-ivory/10 transition-all" aria-label="Instagram">
                  <Camera className="w-5 h-5" />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-ivory/5 text-ivory/30 hover:text-gold hover:bg-ivory/10 transition-all" aria-label="TikTok">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.01a6.34 6.34 0 00-.82-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.76 1.53V7.45c-1 0-1.93-.28-2.72-.76z"/></svg>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-ivory/5 text-ivory/30 hover:text-gold hover:bg-ivory/10 transition-all" aria-label="WhatsApp">
                  <MessageSquare className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
 
          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Collections</h3>
              <ul className="space-y-3">
                <li><Link to="/collections?category=Omani" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Omani Kanzus</Link></li>
                <li><Link to="/collections?category=Moroccan" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Moroccan Kanzus</Link></li>
                <li><Link to="/collections?category=Saudi" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Saudi Kanzus</Link></li>
                <li><Link to="/collections?category=Emirati" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Emirati Kanzus</Link></li>
                <li><Link to="/collections?category=Arab+Perfumes" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Arab Fragrances</Link></li>
              </ul>
            </div>
 
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Assistance</h3>
              <ul className="space-y-3">
                <li><Link to="/faq" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">FAQ</Link></li>
                <li><Link to="/returns" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Returns Policy</Link></li>
                <li><Link to="/contact" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">Contact Us</Link></li>
                <li><Link to="/about" className="inline-block py-1 text-xs text-ivory/50 hover:text-ivory transition-colors font-medium">About Nadhir Thobes</Link></li>
              </ul>
            </div>
 
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Boutique</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs text-ivory/50">
                  <MapPin className="w-5 h-5 text-gold shrink-0" />
                  <span className="leading-relaxed">
                    <a href="https://www.google.com/maps/search/?api=1&query=Kings+Tower+Eastleigh+Shop+G4" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                      Eastleigh KINGS TOWER SHOP NO G4
                    </a>
                  </span>
                </li>
                <li className="flex gap-3 text-xs text-ivory/50">
                  <Phone className="w-5 h-5 text-gold shrink-0" />
                  <a href={`tel:${contactPhone}`} className="py-1 hover:text-gold transition-colors">{contactPhone.startsWith('+') ? '' : '+'}{contactPhone}</a>
                </li>
                <li className="flex gap-3 text-xs text-ivory/50">
                  <Mail className="w-5 h-5 text-gold shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="py-1 hover:text-gold transition-colors">{contactEmail}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ivory/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-[10px] text-ivory/40 uppercase tracking-[0.2em] font-medium font-mono">
              &copy; {new Date().getFullYear()} Nadhir Thobes.
            </p>
            <Link to="/terms" className="text-[10px] text-ivory/20 hover:text-ivory/50 uppercase tracking-[0.15em] transition-colors">Terms</Link>
            <Link to="/privacy" className="text-[10px] text-ivory/20 hover:text-ivory/50 uppercase tracking-[0.15em] transition-colors">Privacy</Link>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </footer>
  );
};
