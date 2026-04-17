import React from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className, size = 'md' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    default: 'bg-charcoal/5 text-charcoal/60 border-charcoal/10',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-[11px]',
  };

  return (
    <span className={cn(
      'inline-block uppercase tracking-widest font-bold border rounded-sm antialiased',
      variants[variant],
      sizes[size],
      className
    )}>
      {label}
    </span>
  );
};
