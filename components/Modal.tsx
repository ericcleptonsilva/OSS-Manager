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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 shadow-2xl rounded-2xl border ${
          darkMode 
            ? 'bg-slate-900/80 backdrop-blur-2xl border-white/10 text-white shadow-black/50' 
            : 'bg-white/70 backdrop-blur-2xl border-slate-200/50 text-slate-900 shadow-slate-200/50'
        }`}
      >
        <div 
          className={`px-6 py-4 flex justify-between items-center border-b ${
            darkMode ? 'border-white/5 bg-white/5' : 'border-slate-200/50 bg-slate-50/50'
          }`}
        >
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-white/10 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};