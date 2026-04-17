import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'inline' | 'prestige' | 'overlay';
  message?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', variant = 'inline', message, className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={cn('relative flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-gold stroke-[1.5]', sizes[size])} />
      {variant === 'prestige' && (
        <div className="absolute inset-0 rounded-full border-t-2 border-gold/20 animate-ping" />
      )}
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center space-y-4">
        {spinner}
        {message && <p className="text-charcoal font-serif text-lg animate-pulse">{message}</p>}
      </div>
    );
  }

  if (variant === 'prestige') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        {spinner}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-bold text-gold animate-fade-in mb-2">Nadhir Thobes</p>
          <p className="text-charcoal/50 font-serif italic text-sm">{message || 'Loading Prestige...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {spinner}
      {message && <span className="text-sm font-medium text-charcoal/60">{message}</span>}
    </div>
  );
};
