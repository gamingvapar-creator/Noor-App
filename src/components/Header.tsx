import { Sparkles, Moon } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface HeaderProps {
  userName?: string;
  language?: Language;
}

export function Header({ userName, language = 'English' }: HeaderProps) {
  const displayName = userName ? userName.split(" ")[0] : "";
  const tSet = translations[language];

  // Map Assalamu Alaikum correctly based on language
  const greeting = language === 'Arabic' ? "السلام عليكم" : tSet.assalamu_alaikum;

  return (
    <div className="flex items-center justify-between px-4 py-6" id="app-header-view">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-950/40 flex items-center justify-center relative overflow-hidden border border-emerald-500/30">
           <Moon className="text-emerald-500 w-6 h-6 fill-emerald-500/20" />
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white font-black text-xl tracking-tight leading-none">
            {displayName ? `${greeting}, ${displayName}` : greeting}
          </h1>
          <p className="text-emerald-600 dark:text-green-500 text-xs font-semibold flex items-center gap-1 mt-1">
            May Allah bless your day <span className="text-rose-500">♥</span>
          </p>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/10 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-center relative shadow-md shadow-emerald-500/5">
        <Sparkles className="text-emerald-600 dark:text-emerald-400 w-5 h-5" id="header-sparkles" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#B89C5D] rounded-full border border-white dark:border-[#0A0D10] animate-pulse"></div>
      </div>
    </div>
  );
}
