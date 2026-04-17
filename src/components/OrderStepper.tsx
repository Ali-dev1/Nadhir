import React from 'react';
import type { OrderStatus } from '../types';
import { Check, Clock, CheckCircle, Settings, Truck, PackageCheck, AlertCircle } from 'lucide-react';

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'pending', label: 'Placed', icon: Clock, color: 'text-charcoal/40' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
  { status: 'processing', label: 'Processing', icon: Settings, color: 'text-orange-400' },
  { status: 'dispatched', label: 'Dispatched', icon: Truck, color: 'text-purple-500' },
  { status: 'delivered', label: 'Delivered', icon: PackageCheck, color: 'text-green-500' },
];

interface Props {
  currentStatus: OrderStatus;
}

export const OrderStepper: React.FC<Props> = ({ currentStatus }) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center justify-center py-6 px-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-sm">
        <AlertCircle className="w-4 h-4 mr-2" /> This order has been cancelled.
      </div>
    );
  }

  const currentIdx = STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
        {/* Progress line */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-charcoal/5" />
        <div
          className="absolute top-5 left-8 h-[2px] bg-gold transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * (100 - (100/STEPS.length)))}%` }}
        />

        {STEPS.map((step, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const StepIcon = step.icon;

          return (
            <div key={step.status} className="relative flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                  isComplete
                    ? 'bg-gold text-white'
                    : isCurrent
                    ? 'bg-white text-gold border-2 border-gold scale-110'
                    : 'bg-white text-charcoal/20 border-2 border-charcoal/5'
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold text-center transition-colors duration-500 ${
                    isComplete || isCurrent ? 'text-charcoal' : 'text-charcoal/20'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                   <span className={`text-[8px] font-medium mt-0.5 ${step.color} animate-pulse`}>
                     Current Stage
                   </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
