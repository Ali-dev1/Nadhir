import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const StaticPageLayout: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 min-h-[60vh]">
      <Link to="/" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>
      <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-8">{title}</h1>
      <div className="prose prose-charcoal max-w-none text-charcoal/80 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  );
};
