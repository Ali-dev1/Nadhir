import React, { useState, useEffect } from 'react';
import { NadhirService } from '../../services/api';
import { Phone, Mail, MapPin, MessageSquare, Camera } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [contactEmail, setContactEmail] = useState('nadhirthobes@gmail.com');
  const [contactPhone, setContactPhone] = useState('254799999355');
  const [whatsapp, setWhatsapp] = useState('254799999355');
  const [instagram, setInstagram] = useState('https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await NadhirService.getStoreSettings();
        if (settings) {
          setContactEmail(settings.contact_email);
          setContactPhone(settings.contact_phone);
          setWhatsapp(settings.whatsapp_number);
          setInstagram(settings.instagram_url || '');
          setTiktok(settings.tiktok_url || '');
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cleanPhone = contactPhone.startsWith('+') ? contactPhone.substring(1) : contactPhone;
  const formattedPhone = `+${cleanPhone.replace(/^(\d{3})(\d{3})(\d{6})$/, '$1 $2 $3')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Get in Touch</p>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Contact Us</h1>
        <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
        <p className="text-charcoal/60 text-sm max-w-lg mx-auto">
          Our concierge team is available to assist you with sizing, orders, and bespoke requests.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-charcoal/5 p-8 animate-pulse">
              <div className="h-4 bg-charcoal/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-charcoal/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello Nadhir Thobes, I have a question about...')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-charcoal/5 p-8 hover:shadow-lg transition-all duration-300 group flex items-start gap-5"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">WhatsApp</p>
              <p className="font-medium text-charcoal text-sm">Chat with our team</p>
              <p className="text-xs text-charcoal/40 mt-1">Fastest response · Usually within minutes</p>
            </div>
          </a>

          <a
            href={`tel:${contactPhone}`}
            className="bg-white border border-charcoal/5 p-8 hover:shadow-lg transition-all duration-300 group flex items-start gap-5"
          >
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:scale-110 transition-transform shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">Call Us</p>
              <p className="font-medium text-charcoal text-sm">{formattedPhone}</p>
              <p className="text-xs text-charcoal/40 mt-1">Mon–Sat · 9am – 6pm EAT</p>
            </div>
          </a>

          <a
            href={`mailto:${contactEmail}`}
            className="bg-white border border-charcoal/5 p-8 hover:shadow-lg transition-all duration-300 group flex items-start gap-5"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">Email</p>
              <p className="font-medium text-charcoal text-sm">{contactEmail}</p>
              <p className="text-xs text-charcoal/40 mt-1">We respond within 24 hours</p>
            </div>
          </a>

          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-charcoal/5 p-8 hover:shadow-lg transition-all duration-300 group flex items-start gap-5"
          >
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">Instagram</p>
              <p className="font-medium text-charcoal text-sm">Follow our journey</p>
              <p className="text-xs text-charcoal/40 mt-1">@nadhirthobes</p>
            </div>
          </a>

          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-charcoal/5 p-8 hover:shadow-lg transition-all duration-300 group flex items-start gap-5"
          >
            <div className="w-12 h-12 bg-charcoal/5 rounded-full flex items-center justify-center text-charcoal group-hover:scale-110 transition-transform shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.01a6.34 6.34 0 00-.82-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.76 1.53V7.45c-1 0-1.93-.28-2.72-.76z"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">TikTok</p>
              <p className="font-medium text-charcoal text-sm">Watch our collection</p>
              <p className="text-xs text-charcoal/40 mt-1">@nadhirthobes</p>
            </div>
          </a>

          <div className="bg-white border border-charcoal/5 p-8 flex items-start gap-5">
            <div className="w-12 h-12 bg-charcoal/5 rounded-full flex items-center justify-center text-charcoal/40 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mb-2">Visit Our Flagship</p>
              <p className="font-medium text-charcoal text-sm">Eastleigh KINGS TOWER SHOP NO G4</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Kings+Tower+Eastleigh+Shop+G4" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gold mt-1 inline-block hover:underline"
              >
                View on Map
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
