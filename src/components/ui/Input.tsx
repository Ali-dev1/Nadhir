import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  errorTestId?: string;
  isTextArea?: boolean;
  rows?: number;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ label, error, errorTestId, isTextArea, leftIcon, className, ...props }, ref) => {
    const commonClasses = cn(
      'w-full px-4 py-4 bg-white border outline-none text-[16px] transition-all duration-200 text-charcoal placeholder:text-charcoal/30 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] font-sans',
      leftIcon && 'pl-11',
      error ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-charcoal/15 focus:border-gold focus:ring-1 focus:ring-gold',
      className
    );

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-[10px] font-bold text-charcoal tracking-[0.15em] uppercase font-sans">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40">
              {leftIcon}
            </div>
          )}
          
          {isTextArea ? (
            <textarea
              ref={ref}
              className={cn(commonClasses, 'min-h-[100px] resize-y')}
              {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
            />
          ) : (
            <input
              ref={ref}
              className={commonClasses}
              {...props as React.InputHTMLAttributes<HTMLInputElement>}
            />
          )}
        </div>
        
        {error && (
          <p data-testid={errorTestId || "form-error"} className="text-[11px] text-red-600 font-medium tracking-[0.05em] uppercase font-sans mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
