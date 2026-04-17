import { StaticPageLayout } from '../layouts/StaticPageLayout';
import { MessageCircle } from 'lucide-react';

const STORE_PHONE = '254799999355';

export const AboutPage: React.FC = () => {
  return (
    <StaticPageLayout title="About Nadhir Thobes">
      <p className="text-lg font-serif text-charcoal/90">
        Founded in Nairobi, Nadhir Thobes brings the finest Kanzus and Arab fragrances to East Africa's most discerning gentlemen.
      </p>

      <p>
        We believe every man deserves to wear garments that honor his heritage while reflecting modern elegance. Each Kanzu in our collection is sourced directly from master tailors across Oman, Morocco, Saudi Arabia, and the Emirates—crafted from premium fabrics and finished with meticulous attention to detail.
      </p>

      <p>
        Our perfume collection features authentic Oud, Musk, Amber, and Rose oils from trusted Arabian perfumeries, offering scents that last and leave an impression.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-10 mb-4">Where We Ship</h2>
      <p>
        We currently ship across Nairobi with 2-3 business day delivery. We're expanding to Mombasa, Kisumu, and other major towns soon.
      </p>

      <h2 className="text-2xl font-serif text-charcoal mt-10 mb-4">Our Promise</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Authentic, premium-quality garments and fragrances</li>
        <li>Fast, reliable delivery within Nairobi</li>
        <li>Responsive customer support via WhatsApp</li>
        <li>Hassle-free 7-day returns for unworn items</li>
      </ul>

      <div className="mt-10 bg-charcoal/5 p-6 text-center">
        <p className="text-charcoal/70 mb-4">Have a question? We'd love to hear from you.</p>
        <a
          href={`https://wa.me/${STORE_PHONE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-medium transition-colors min-h-[48px]"
        >
          <MessageCircle className="w-5 h-5" /> Contact us on WhatsApp
        </a>
      </div>
    </StaticPageLayout>
  );
};
