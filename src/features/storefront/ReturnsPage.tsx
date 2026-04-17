import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Clock } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Customer Care</p>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Returns & Exchanges</h1>
        <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
        <p className="text-charcoal/60 text-sm max-w-lg mx-auto">
          Your satisfaction is our priority. We want you to love every piece from Nadhir Thobes.
        </p>
      </div>

      {/* Quick Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {[
          { icon: Clock, title: '7-Day Window', desc: 'From the date of delivery' },
          { icon: RotateCcw, title: 'Free Exchanges', desc: 'For wrong size or defects' },
          { icon: ShieldCheck, title: 'Quality Guarantee', desc: 'All items inspected before dispatch' },
          { icon: Truck, title: 'Return Pickup', desc: 'Within Nairobi Metro area' },
        ].map((card) => (
          <div key={card.title} className="bg-white border border-charcoal/5 p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold shrink-0">
              <card.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{card.title}</p>
              <p className="text-xs text-charcoal/40 mt-1">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-10 text-sm text-charcoal/70 leading-relaxed font-light">
        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">Eligibility</h2>
          <p className="mb-3">To be eligible for a return or exchange, items must meet the following criteria:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Returned within 7 calendar days of delivery</li>
            <li>Unworn, unwashed, and in original condition</li>
            <li>All original tags and packaging intact</li>
            <li>Accompanied by proof of purchase (order confirmation or receipt number)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">Non-Returnable Items</h2>
          <p className="mb-3">The following items cannot be returned for hygiene and safety reasons:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All fragrance and perfume products</li>
            <li>Items marked as "Final Sale" or purchased during promotional events</li>
            <li>Customized or altered garments</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">How to Initiate a Return</h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>Contact our team via WhatsApp or email with your order number</li>
            <li>Our team will confirm eligibility and provide return instructions</li>
            <li>Package the item securely in its original packaging</li>
            <li>For Nairobi customers, we will arrange a pickup. For other locations, ship to the address provided</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">Refund Processing</h2>
          <p>Once we receive and inspect your return, refunds are processed within 3-5 business days via M-PESA reversal to the original payment number. You will receive a WhatsApp confirmation when the refund is initiated.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">Exchanges</h2>
          <p>If you need a different size, we offer free exchanges subject to stock availability. Contact our team and we will arrange the swap. The replacement item will be dispatched after we receive the original.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">Defective Items</h2>
          <p>If you receive a defective or damaged item, please contact us within 48 hours of delivery with photographs of the defect. We will arrange an immediate replacement or full refund at no cost to you.</p>
        </section>
      </div>
    </div>
  );
};
