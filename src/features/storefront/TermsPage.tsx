import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-16">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Legal</p>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Terms of Service</h1>
        <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
        <p className="text-charcoal/40 text-xs uppercase tracking-widest">Last updated: March 2026</p>
      </div>

      <div className="space-y-10 text-sm text-charcoal/70 leading-relaxed font-light">
        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using the Nadhir Thobes website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">2. Products & Pricing</h2>
          <p>All products listed on Nadhir Thobes are subject to availability. Prices are displayed in Kenyan Shillings (KES) and include applicable taxes. We reserve the right to modify prices without prior notice. In the event of a pricing error, we will notify you before processing the order.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">3. Orders & Payment</h2>
          <p>Orders are confirmed upon successful M-PESA payment. By placing an order, you confirm that the information provided is accurate and that you are authorized to use the M-PESA account for payment. Order confirmation will be sent via the platform and, where applicable, WhatsApp notification.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">4. Delivery</h2>
          <p>We deliver nationwide. Delivery timelines are estimates and may vary due to circumstances beyond our control. You will receive a dispatch notification when your order leaves our facility.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">5. Returns & Exchanges</h2>
          <p>We accept returns within 7 days of delivery. Items must be unworn, unwashed, with original tags and packaging intact. Fragrance products are non-returnable for hygiene reasons. Return shipping costs are the responsibility of the buyer unless the item is defective.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">6. Intellectual Property</h2>
          <p>All content on the Nadhir Thobes website — including text, images, logos, and design — is the property of Nadhir Thobes and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">7. Limitation of Liability</h2>
          <p>Nadhir Thobes shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the specific product in question.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">8. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes shall be resolved through the courts of Nairobi.</p>
        </section>

        <section>
          <h2 className="text-lg font-serif text-charcoal mb-4">9. Contact</h2>
          <p>For questions regarding these terms, please contact us at <a href="mailto:nadhirthobes@gmail.com" className="text-gold hover:underline">nadhirthobes@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
};
