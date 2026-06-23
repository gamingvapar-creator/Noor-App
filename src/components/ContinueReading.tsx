import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface ContinueReadingProps {
  onOpenQuran: () => void;
  userEmail?: string;
  language?: Language;
}

export function ContinueReading({ onOpenQuran, userEmail, language = 'English' }: ContinueReadingProps) {
  const [lastSurah, setLastSurah] = useState<string | null>(null);
  const [lastVerse, setLastVerse] = useState<number | null>(null);
  const tSet = translations[language];

  useEffect(() => {
    const savedSurah = localStorage.getItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`);
    const savedVerse = localStorage.getItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`);
    if (savedSurah && savedVerse) {
      setLastSurah(savedSurah);
      setLastVerse(Number(savedVerse));
    }
  }, [userEmail]);

  if (!lastSurah) {
    return (
      <div className="px-4 mb-32" id="continue-reading-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-500 w-5 h-5 fill-emerald-500/10" />
            <h2 className="text-slate-900 dark:text-white font-black text-[17px] tracking-tight">{tSet.continue_reading}</h2>
          </div>
        </div>

        <div onClick={onOpenQuran} className="bg-slate-100 dark:bg-[#161C23]/80 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-slate-200/50 dark:hover:bg-[#161C23]/95 transition-all cursor-pointer rounded-[24px] p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md active:scale-98">
          <p className="text-slate-650 dark:text-gray-400 text-xs leading-relaxed font-bold">
            {tSet.checkpoint_tip}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-32" id="continue-reading-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-emerald-500 w-5 h-5 fill-emerald-500/10" />
          <h2 className="text-slate-900 dark:text-white font-black text-[17px] tracking-tight">{tSet.continue_reading}</h2>
        </div>
        <button onClick={onOpenQuran} className="text-emerald-600 dark:text-green-500 text-[13px] font-black flex items-center hover:brightness-105 active:scale-95 transition-colors">
          {tSet.view_all} <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      <div 
        onClick={onOpenQuran}
        className="bg-slate-100 dark:bg-[#161C23]/80 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-slate-200/50 dark:hover:bg-[#161C23]/95 transition-all cursor-pointer rounded-[24px] p-3.5 pl-3.5 pr-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md active:scale-98"
      >
        {/* Book cover icon */}
        <div className="w-[52px] h-[72px] bg-gradient-to-br from-[#1B3B2B] to-[#0A1F13] rounded-md shadow-lg flex-shrink-0 flex items-center justify-center border border-green-700/55 overflow-hidden relative">
           <div className="absolute inset-1 border border-yellow-500/20 rounded-[4px]"></div>
           <div className="absolute inset-[6px] border border-yellow-500/10 rounded-[2px]"></div>
           <div className="w-5 h-5 rounded-sm bg-[#1B3B2B] border border-yellow-500/40 transform rotate-45 flex items-center justify-center shadow-inner">
             <div className="w-2 h-2 rounded-sm bg-yellow-500/20 transform -rotate-45" />
           </div>
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-slate-900 dark:text-white font-extrabold text-[14px] mb-1">{lastSurah}</h3>
          <p className="text-slate-500 dark:text-gray-400 text-[11px] font-black">{tSet.last_read}: Ayah {lastVerse}</p>
          
          <div className="flex items-center gap-3 mt-2.5">
             <div className="flex-1 h-2 bg-slate-200 dark:bg-[#0A0D10] rounded-full overflow-hidden border border-slate-300/40 dark:border-white/5">
                <div className="h-full bg-emerald-500 rounded-full relative" style={{ width: lastSurah === "Al-Faatiha" ? "100%" : `${Math.min(100, Math.round((lastVerse || 1) / 286 * 100))}%` }}>
                   <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                </div>
             </div>
             <span className="text-slate-700 dark:text-gray-400 text-[10px] w-8 font-black">
                {lastSurah === "Al-Faatiha" ? "100" : Math.min(100, Math.round((lastVerse || 1) / 286 * 100))}%
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="hidden sm:block px-5 py-2 rounded-full border border-emerald-500/30 text-emerald-700 dark:text-green-500 text-[13px] font-extrabold hover:bg-emerald-500/10 transition-colors">
              Continue
           </button>
           <button className="sm:hidden w-8 h-8 rounded-full bg-slate-200 dark:bg-white/[0.04] flex items-center justify-center hover:bg-slate-350 dark:hover:bg-white/10 transition-colors border border-slate-300 dark:border-white/5">
              <ChevronRight className="w-4 h-4 text-slate-500 dark:text-gray-400" />
           </button>
        </div>
      </div>
    </div>
  );
}
