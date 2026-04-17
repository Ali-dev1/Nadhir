import React, { useState, useEffect } from 'react';
import { NadhirService } from '../services/api';
import type { StoreSettings } from '../types';

/**
 * MaintenanceGate wraps the public storefront.
 * If store_settings.maintenance_mode is true, it renders a branded
 * "Coming Soon" screen instead of the children. Admin routes are NOT
 * affected by this gate — they exist outside its scope in App.tsx.
 */
export const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(() => {
    const cached = localStorage.getItem('nadhir_settings');
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        return data;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [checked, setChecked] = useState(() => {
    const cached = localStorage.getItem('nadhir_settings');
    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        return (Date.now() - timestamp < 5 * 60 * 1000);
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    const check = async () => {
      try {
        const data = await NadhirService.getStoreSettings();
        setSettings(data);
      } catch {
        // If we can't reach the DB, let the site through or use cached
      } finally {
        setChecked(true);
      }
    };
    check();
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ivory">
        <div className="w-8 h-8 rounded-full border-t-2 border-gold animate-spin" />
      </div>
    );
  }

  // Admin routes and development are usually excluded by routing in App.tsx, 
  // but we enforce the gate here for the storefront.
  const isMaintenance = settings?.maintenance_mode || false;
  const isLive = settings?.is_live || false;

  if (!isLive || isMaintenance) {
    const title = !isLive ? "Coming Soon" : "Under Maintenance";
    const subtitle = !isLive 
      ? "We are currently preparing our digital boutique for the grand unveiling."
      : "We are currently performing routine maintenance to enhance your experience.";

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-charcoal text-ivory px-4">
        <div className="text-center max-w-lg">
          <p className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-8 animate-pulse">
            {title}
          </p>
          <img src="/logo.png" alt="Nadhir Thobes" className="h-24 w-auto object-contain mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-serif mb-6">
            <span className="text-gold">Nadhir</span> Thobes
          </h1>
          <div className="w-16 h-[1px] bg-gold/40 mx-auto mb-8" />
          <p className="text-ivory/60 text-sm leading-relaxed mb-12 font-light">
            {subtitle}<br />
            Please check back shortly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/254799999355"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ivory/20 hover:border-gold text-ivory hover:text-gold px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all"
            >
              Contact Us on WhatsApp
            </a>
          </div>
          <p className="text-ivory/20 text-[9px] uppercase tracking-[0.4em] mt-16 font-mono">
            &copy; {new Date().getFullYear()} Nadhir Thobes
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
