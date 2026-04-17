import React, { useState, useEffect } from 'react';
import { NadhirService } from '../../services/api';

const DEFAULT_ABOUT = `Nadhir Thobes is a curated haven for the modern Nairobi gentleman, specializing in authentic Omani, Moroccan, and Emirati Kanzus alongside niche Arab fragrances.

Founded on the principle that traditional garments deserve modern presentation, we source directly from master tailors across the Arabian Peninsula to bring you the finest craftsmanship at honest prices.

Our collection represents hundreds of hours of hand-stitched artistry from some of the most respected ateliers in Oman, Morocco, Saudi Arabia, and the UAE. Every garment is selected for its superior fabric quality, precision tailoring, and timeless design.

We believe that dressing well is an act of self-respect. Whether you are preparing for Jummah prayers, a wedding celebration, or simply want to carry yourself with distinction — Nadhir Thobes provides the wardrobe to match your ambition.`;

export const AboutPage: React.FC = () => {
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await NadhirService.getStoreSettings();
        if (settings?.about_us_text) {
          setAboutText(settings.about_us_text);
        }
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Our Heritage</p>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">About Nadhir Thobes</h1>
        <div className="w-16 h-[1px] bg-gold mx-auto" />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-charcoal/5 rounded" style={{ width: `${90 - i * 10}%` }} />
          ))}
        </div>
      ) : (
        <div className="prose prose-lg max-w-none">
          {aboutText.split('\n').filter(Boolean).map((paragraph, idx) => (
            <p key={idx} className="text-charcoal/70 leading-relaxed font-light mb-6 text-base">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-charcoal/5 pt-16">
        {[
          { stat: '500+', label: 'Garments Delivered' },
          { stat: '4', label: 'Countries Sourced' },
          { stat: '100%', label: 'Authentic Pieces' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-3xl font-serif text-gold mb-2">{item.stat}</p>
            <p className="text-[10px] text-charcoal/40 uppercase tracking-[0.3em] font-bold">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
