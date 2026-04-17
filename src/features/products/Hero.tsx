import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { NadhirService } from '../../services/api';

export const Hero: React.FC = () => {
  const [headline, setHeadline] = useState('Elevate Your Presence.');
  const [subtext, setSubtext] = useState(
    'Discover impeccable tailoring and bespoke Arab fragrances. The Nadhir Thobes collection brings timeless Moroccan elegance to the modern Nairobi gentleman.'
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await NadhirService.getStoreSettings();
        if (settings) {
          setHeadline(settings.hero_headline);
          setSubtext(settings.hero_subtext);
        }
      } catch {
        // Use hardcoded defaults
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const headlineParts = headline.split(' ');
  const lastWord = headlineParts.pop() || '';
  const firstWords = headlineParts.join(' ');

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full flex items-end pb-[80px] md:pb-[100px] overflow-hidden">
      {/* Background Image & Dramatic Overlays */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-kanzu.png" 
          alt="Luxury Kanzu Storefront" 
          className="w-full h-full object-cover object-center animate-slow-zoom scale-105 bg-charcoal"
          loading="eager"
        />
        {/* Deep, rich bottom overlay to anchor text */}
        <div className="absolute inset-0 bg-charcoal/20" />
        <div className="absolute inset-x-0 bottom-0 h-[75vh] bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 w-full">
        {/* Frosted Glass New Arrival Badge (Mobile & Desktop) */}
        <div className="inline-flex flex-col backdrop-blur-md bg-white/5 border border-white/10 p-4 shadow-2xl mb-8 group cursor-pointer hover:bg-white/10 transition-colors">
          <p className="text-[9px] tracking-[0.25em] uppercase text-gold mb-1">New Arrival</p>
          <div className="flex items-center gap-3">
            <p className="font-serif text-[18px] text-ivory">The Royal Muscat</p>
            <div className="w-6 h-[1px] bg-gold opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] text-ivory/50 tracking-[0.1em] uppercase">2026 Edition</p>
          </div>
        </div>

        <div className="max-w-[800px]">
          {loaded ? (
            <>
              <h1 className="text-[40px] md:text-[64px] lg:text-[72px] font-serif text-ivory leading-[1.05] mb-5 md:mb-6 tracking-tight animate-fade-in">
                {firstWords}{firstWords ? <br className="hidden md:block" /> : null}{' '}
                <span className="italic text-gold block mt-1 md:mt-0">{lastWord}</span>
              </h1>
              <p className="text-[15px] md:text-[18px] text-ivory/70 font-light leading-relaxed mb-8 md:mb-10 max-w-[500px]">
                {subtext}
              </p>
            </>
          ) : (
            <div className="animate-pulse space-y-4 mb-10">
              <div className="h-10 md:h-16 bg-ivory/10 w-3/4 max-w-[400px]" />
              <div className="h-10 md:h-16 bg-ivory/10 w-1/2 max-w-[200px] mt-2" />
              <div className="h-4 bg-ivory/5 w-full max-w-[500px] mt-6" />
              <div className="h-4 bg-ivory/5 w-3/4 max-w-[400px]" />
            </div>
          )}
          
          {/* Bottom Pinned Dual Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-5">
            <button 
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-[52px] md:h-[56px] bg-gold hover:bg-white text-charcoal px-8 text-[11px] md:text-[13px] font-sans font-bold uppercase tracking-[0.15em] transition-colors flex justify-center items-center gap-3 w-full sm:w-max"
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-[52px] md:h-[56px] border border-white/20 hover:border-ivory hover:bg-ivory/5 text-ivory px-8 text-[11px] md:text-[13px] font-sans font-bold uppercase tracking-[0.15em] transition-all w-full sm:w-max"
            >
              Our Heritage
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
