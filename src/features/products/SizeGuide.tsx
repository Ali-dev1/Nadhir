import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div data-testid="size-guide-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <div className="bg-ivory shadow-2xl overflow-hidden w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-6 border-b border-charcoal/10">
          <h2 className="font-serif text-2xl text-charcoal">Measuring Guide</h2>
          <button 
            onClick={onClose}
            className="text-charcoal/50 hover:text-charcoal transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-charcoal/80 text-center leading-relaxed font-light">
            To find your perfect Kanzu length, measure closely from the highest point of your shoulder down to exactly where you want the hem to fall (usually near the ankle or mid-calf).
          </p>
          
          <div className="bg-white p-6 border border-gold/30 flex items-center justify-between">
            <span className="font-serif italic text-gold text-lg">Shoulder to Ankle</span>
            <span className="text-charcoal font-medium text-xl">50" - 60"</span>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full btn-primary"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
