import React from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconClass: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40',
      btnClass: 'bg-red-650 hover:bg-red-700 focus:ring-red-500 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40',
      btnClass: 'bg-amber-500 hover:bg-amber-650 focus:ring-amber-500 text-white',
    },
    info: {
      icon: Info,
      iconClass: 'text-indigo-650 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/40',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${config.iconClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all ${config.btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
