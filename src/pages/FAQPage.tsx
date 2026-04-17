import React, { useState } from 'react';
import { StaticPageLayout } from '../layouts/StaticPageLayout';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What sizes do you offer?',
    answer: 'Our Kanzus come in sizes 52–62 (measured in inches). These refer to the length of the garment from shoulder to hem. Use our Size Guide on any product page to find your perfect fit based on your height.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery within Nairobi takes 2-3 business days. We are working on expanding to Mombasa and other major towns soon.',
  },
  {
    question: 'Which areas do you deliver to?',
    answer: 'We currently deliver across Nairobi and its environs. For deliveries outside Nairobi, please contact us on WhatsApp to discuss options.',
  },
  {
    question: 'How do I pay?',
    answer: 'We accept M-PESA payments. After placing your order, you will receive an STK push prompt on your phone to complete payment. It\'s fast, secure, and familiar.',
  },
  {
    question: 'What if my item doesn\'t fit?',
    answer: 'We accept returns within 7 days of delivery for unworn items in original condition. The customer covers return shipping. Refunds are processed via M-PESA within 3 business days.',
  },
  {
    question: 'How do I track my order?',
    answer: 'After placing your order, you\'ll receive your order ID. You can message us on WhatsApp with your order ID anytime for a status update. We also notify you when your order is dispatched.',
  },
  {
    question: 'Are the perfumes authentic?',
    answer: 'Yes. Our fragrances are sourced directly from trusted Arabian perfumeries. We offer concentrated Attar and Oud oils — no synthetic dilutions.',
  },
  {
    question: 'Can I order as a gift?',
    answer: 'Absolutely! Just enter the recipient\'s delivery address at checkout and add any gift message in the Delivery Notes field.',
  },
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <StaticPageLayout title="Frequently Asked Questions">
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-charcoal/10 bg-white overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-5 text-left min-h-[56px]"
            >
              <span className="font-medium text-charcoal pr-4">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-charcoal/40 shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-charcoal/70 text-sm leading-relaxed border-t border-charcoal/5 pt-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
};
