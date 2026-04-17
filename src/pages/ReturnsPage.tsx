import React from 'react';
import { StaticPageLayout } from '../layouts/StaticPageLayout';

export const ReturnsPage: React.FC = () => {
  return (
    <StaticPageLayout title="Returns Policy">
      <p className="text-lg font-serif text-charcoal/90 mb-8">
        Your satisfaction is our priority. We want you to love every piece from Nadhir Thobes.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-8 mb-4">Return Window</h2>
      <p>
        You may return any item within <strong>7 days</strong> of receiving your delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-8 mb-4">How to Return</h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>Contact us on WhatsApp with your <strong>Order ID</strong> and reason for return</li>
        <li>We'll confirm your return request within 24 hours</li>
        <li>Ship the item back to our Nairobi address (shared via WhatsApp)</li>
        <li>Once we receive and inspect the item, your refund will be processed</li>
      </ol>

      <h2 className="text-2xl font-serif text-charcoal mt-8 mb-4">Shipping Costs</h2>
      <p>
        The customer covers return shipping costs. We recommend using a tracked courier service for your protection.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-8 mb-4">Refunds</h2>
      <p>
        Refunds are processed via <strong>M-PESA</strong> to the number used during purchase, within <strong>3 business days</strong> of receiving the returned item.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-8 mb-4">Items Not Eligible for Return</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Perfumes and fragrances (due to hygiene regulations)</li>
        <li>Items that have been worn, washed, or altered</li>
        <li>Items without original tags and packaging</li>
      </ul>

      <div className="mt-10 p-6 bg-charcoal/5 text-sm text-charcoal/70 text-center">
        Questions about returns? Message us on WhatsApp — we respond within hours.
      </div>
    </StaticPageLayout>
  );
};
