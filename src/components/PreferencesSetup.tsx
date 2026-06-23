import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Languages } from 'lucide-react';
import { Language } from '../utils/i18n';

interface PreferencesSetupProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onComplete: () => void;
}

export function PreferencesSetup({ isDarkMode, setIsDarkMode, language, setLanguage, onComplete }: PreferencesSetupProps) {
  const languagesList: { code: Language; nativeName: string; flag: string; locale: string }[] = [
    { code: 'English', nativeName: 'English', flag: '🇬🇧', locale: 'EN' },
    { code: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', locale: 'HI' },
    { code: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', locale: 'UR' },
    { code: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', locale: 'AR' },
  ];

  const handleNext = () => {
    localStorage.setItem('noor_ai_preferences_set', 'true');
    // Force light theme
    setIsDarkMode(false);
    onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/98 backdrop-blur-2xl z-[999] flex flex-col justify-between p-6 overflow-y-auto no-scrollbar"
      id="preferences-setup-screen"
    >
      {/* Background soft glowing lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#B89C5D]/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header section with branding logo */}
      <div className="relative z-10 text-center pt-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-[#B89C5D] p-[1.5px] shadow-[0_4px_20px_rgba(16,185,129,0.1)] mx-auto mb-4 flex items-center justify-center animate-pulse">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-emerald-500/10">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Noor AI Preferences</h1>
        <p className="text-[12px] text-slate-500 mt-1 font-semibold">Behtareen translation language select karein.</p>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 my-auto flex-shrink-0 w-full max-w-sm mx-auto py-6">
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#B89C5D] bg-emerald-500/10 px-3 py-1 rounded-full">Language Choice</span>
            <h2 className="text-[20px] font-black text-slate-900 mt-3 leading-tight">Apni Personal Language Chunay</h2>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">Quran ke alaawa app ka har tab aur setting aapke chunay bhasha me translate ho jayega.</p>
          </div>

          {/* Language Selection List Layout */}
          <div className="flex flex-col gap-2.5 mt-2">
            {languagesList.map((langItem) => {
              const isSelected = language === langItem.code;
              return (
                <div
                  key={langItem.code}
                  onClick={() => {
                    setLanguage(langItem.code);
                    localStorage.setItem('noor_ai_language', langItem.code);
                  }}
                  className={`h-13 rounded-2xl border px-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-600 shadow-sm"
                      : "bg-white border-slate-200 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-label={langItem.code}>{langItem.flag}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-slate-900 leading-none">{langItem.nativeName}</span>
                      <span className="text-[9px] font-semibold text-slate-500 mt-1 leading-none">{langItem.code} Language</span>
                    </div>
                  </div>
                  
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Button Footer */}
      <div className="relative z-10 w-full max-w-sm mx-auto pt-4 pb-8 flex items-center justify-center">
        <button
          onClick={handleNext}
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-105 active:scale-97 text-white font-black text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
        >
          <span>Noor AI Shuru Karein</span>
        </button>
      </div>
    </motion.div>
  );
}
