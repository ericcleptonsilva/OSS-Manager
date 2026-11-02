import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconX } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className={`glass-specular relative w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 shadow-2xl rounded-3xl border ${
          darkMode 
            ? 'bg-slate-900/90 backdrop-blur-2xl border-white/10 text-white shadow-black/60' 
            : 'bg-white/90 backdrop-blur-2xl border-slate-200/80 text-slate-900 shadow-slate-300/40'
        }`}
      >
        <div 
          className={`px-5 py-4 flex justify-between items-center border-b ${
            darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200/60 bg-slate-50/60'
          }`}
        >
          <h3 className="font-athletic text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className={`touch-target min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'hover:bg-white/10 text-slate-400 hover:text-white active:bg-white/15' 
                : 'hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 active:bg-slate-300'
            }`}
            aria-label="Fechar janela"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
