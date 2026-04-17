import React from 'react';
import { StaticPageLayout } from '../../layouts/StaticPageLayout';

export const PrivacyPage: React.FC = () => {
  return (
    <StaticPageLayout title="Privacy Policy">
      <div className="prose prose-charcoal max-w-none">
        <p className="text-lg text-charcoal/60 mb-10">Last updated: April 2026</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Information Collection</h2>
            <p>At Nadhir Thobes, we value your privacy. This policy outlines how we collect, use, and protect your personal information.</p>
            <p>When you place an order or create an account on Nadhir Thobes, we collect personal information necessary to fulfill your purchase, including your full name, phone number, email address, and delivery address.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Use of Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-charcoal/80">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you regarding your order status</li>
              <li>Provide customer support via WhatsApp or email</li>
              <li>Improve our website and services</li>
              <li>Send promotional offers (only if you have opted in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We do not store any sensitive payment credentials on our servers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Cookies and Analytics</h2>
            <p>We use local storage strictly for essential shopping features (such as your shopping bag and authentication state). We do not use intrusive third-party tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Your Rights</h2>
            <p>You have the right to request access to, correction of, or deletion of your personal data. Please contact us via WhatsApp or email if you wish to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-charcoal mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at nadhirthobes@gmail.com.</p>
          </section>
        </div>
      </div>
    </StaticPageLayout>
  );
};
