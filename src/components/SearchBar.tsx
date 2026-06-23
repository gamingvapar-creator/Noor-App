import { Search } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface SearchBarProps {
  language?: Language;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export function SearchBar({ language = 'English', searchQuery = "", setSearchQuery }: SearchBarProps) {
  const tSet = translations[language];

  return (
    <div className="px-4 mb-6 relative" id="search-bar-wrapper">
      {/* Background glow for the search bar */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-8 bg-[#B89C5D]/5 dark:bg-blue-400/5 blur-xl rounded-full"></div>
      
      <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/85 dark:border-white/10 rounded-full p-1.5 pl-4 backdrop-blur-md relative z-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] transition-all">
        <Search className="w-5 h-5 text-slate-400 dark:text-gray-400 mr-2.5" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery?.(e.target.value)}
          placeholder={tSet.search_placeholder} 
          className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none w-full"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery?.("")}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold px-2 cursor-pointer active:scale-95"
          >
            ✕
          </button>
        )}
        <button className="bg-emerald-600/10 dark:bg-[#B89C5D]/10 hover:brightness-105 active:scale-95 text-emerald-700 dark:text-[#B89C5D] px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ml-1 border border-emerald-600/10 dark:border-transparent">
          {language === 'Arabic' ? "ابحث" : language === 'Hindi' ? "खोजें" : language === 'Urdu' ? "تلاش" : "Search"}
        </button>
      </div>
    </div>
  );
}
