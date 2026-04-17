import React, { useState, useEffect } from 'react';
import { NadhirService } from '../../services/api';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '../../types';

const DEFAULT_FAQ: FAQItem[] = [
  { question: 'How long does delivery take?', answer: 'We deliver nationwide in 1-3 business days.' },
  { question: 'What payment methods do you accept?', answer: 'We accept manual M-PESA or Cash on Delivery. You can choose to pay securely to our Till Number or pay when your order arrives.' },
  { question: 'What is your return policy?', answer: 'We offer a 7-day return window from the date of delivery.' },
];

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQ);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await NadhirService.getStoreSettings();
        if (settings?.faq_json && settings.faq_json.length > 0) {
          setFaqs(settings.faq_json);
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
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Customer Care</p>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Frequently Asked Questions</h1>
        <div className="w-16 h-[1px] bg-gold mx-auto" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-charcoal/5 p-6 animate-pulse">
              <div className="h-4 bg-charcoal/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-charcoal/5 bg-white transition-all duration-300 hover:shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center p-6 text-left gap-4"
              >
                <span className="font-medium text-sm text-charcoal leading-relaxed">{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                <p className="px-6 text-sm text-charcoal/60 leading-relaxed font-light">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
