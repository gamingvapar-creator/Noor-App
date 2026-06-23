import { Grid, Book, BookOpen, Bookmark, Library } from 'lucide-react';
import { useState } from 'react';
import { translations, Language } from '../utils/i18n';

interface CategoryListProps {
  language?: Language;
  activeIdx?: number;
  setActiveIdx?: (index: number) => void;
}

export function CategoryList({ language = 'English', activeIdx = 0, setActiveIdx }: CategoryListProps) {
  const tSet = translations[language];

  const categories = [
    { name: tSet.category_all, icon: Grid },
    { name: tSet.category_meccan, icon: Book },
    { name: tSet.category_medinan, icon: Library },
    { name: tSet.category_para, icon: BookOpen },
    { name: tSet.category_ruko, icon: Bookmark },
  ];

  return (
    <div className="px-4 mb-8 overflow-x-auto no-scrollbar" id="categorylist-container">
      <div className="flex gap-4 min-w-max">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const active = idx === activeIdx;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveIdx?.(idx)}
              className={`flex flex-col items-center justify-center w-[76px] h-[80px] rounded-[22px] cursor-pointer transition-all active:scale-95 ${
                active 
                  ? 'bg-emerald-600/10 dark:bg-green-500/10 border border-emerald-500 dark:border-green-500 shadow-[0_4px_16px_rgba(16,185,129,0.12)]' 
                  : 'bg-slate-100 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-emerald-600 dark:text-green-500 fill-emerald-600/10 dark:fill-green-500/10' : 'text-[#B89C5D] dark:text-yellow-500/80'}`} />
              <span className={`text-[11px] leading-none ${active ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500 dark:text-gray-400 font-semibold'}`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
