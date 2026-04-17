import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = 10;
    const step = (100 / (toast.duration || 5000)) * interval;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onRemove(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration, toast.id, onRemove, isPaused]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const borderColors = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20',
    warning: 'border-amber-500/20',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return (
    <div 
      className={`pointer-events-auto min-w-[320px] bg-white border ${borderColors[toast.type]} shadow-xl p-4 flex items-center gap-4 relative overflow-hidden animate-in slide-in-from-right-full duration-300`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div>{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-charcoal">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-charcoal/20 hover:text-charcoal transition-colors p-1">
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-charcoal/5 w-full">
        <div 
          className={`h-full transition-all linear ${progressColors[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
