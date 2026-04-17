import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-charcoal text-ivory hover:bg-charcoal/90 shadow-lg',
      secondary: 'bg-gold text-charcoal hover:bg-gold/90 shadow-md',
      outline: 'border border-charcoal/20 text-charcoal hover:bg-charcoal/5',
      ghost: 'text-charcoal hover:bg-charcoal/5',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs tracking-wider',
      md: 'px-6 py-3 text-sm font-bold uppercase tracking-widest',
      lg: 'px-8 py-4 text-base font-bold uppercase tracking-widest',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
