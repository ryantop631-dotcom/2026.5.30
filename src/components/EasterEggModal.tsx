import React from 'react';
import { Sparkles, Volume2, X, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { Language, translations } from '../translations';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function EasterEggModal({ isOpen, onClose, lang }: EasterEggModalProps) {
  if (!isOpen) return null;

  const t = translations[lang].easterEgg;

  return (
    <div 
      id="easter-egg-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="easter-egg-card"
        className="relative w-full max-w-md bg-white dark:bg-[#111726] rounded-3xl p-6 md:p-8 border-2 border-[#0052FF] dark:border-[#3B82F6] shadow-2xl animate-scale-up text-center overflow-hidden animate-pulse-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner background glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#0052FF]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#FF3B30]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button 
          id="close-easter-egg-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Robot Badge Icon */}
        <div className="mx-auto w-20 h-20 mb-5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0052FF] via-[#3B82F6] to-[#FFCC00] animate-spin-[duration:6s] opacity-75 blur-xs" />
          <div className="relative w-18 h-18 rounded-full bg-white dark:bg-[#0B0F19] flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md">
            <img 
              src="/favicon.png?v=4" 
              alt="Robot Avatar" 
              className="w-12 h-12 rounded-full object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#FF3B30] text-white p-1 rounded-full shadow">
            <Zap size={14} className="fill-current" />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-[#0052FF] dark:text-blue-300 text-xs font-headline font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} className="text-[#FFCC00]" />
          <span>{t.toastSubtitle}</span>
        </div>

        <h3 className="font-headline font-black text-2xl md:text-3xl text-gray-900 dark:text-white mb-3 tracking-tight">
          {t.toastTitle}
        </h3>

        <p className="font-sans text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          {t.toastDesc}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            id="easter-egg-replay-sound"
            onClick={() => soundEngine.playRobotFanfare()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#3B82F6] hover:from-blue-700 hover:to-blue-600 text-white font-headline font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Volume2 size={18} />
            <span>{t.playAgain}</span>
          </button>

          <button
            id="easter-egg-close-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-headline font-semibold text-sm transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
