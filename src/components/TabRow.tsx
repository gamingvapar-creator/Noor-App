import { useState } from 'react';
import { translations, Language } from '../utils/i18n';

interface TabRowProps {
  language?: Language;
  activeTab?: number;
  setActiveTab?: (index: number) => void;
}

export function TabRow({ language = 'English', activeTab = 0, setActiveTab }: TabRowProps) {
  const tSet = translations[language];

  const localizedTabs = [
    tSet.tab_trending,
    tSet.tab_surah,
    tSet.tab_juz,
    tSet.tab_audio,
    tSet.tab_bookmarks
  ];

  return (
    <div className="px-4 mb-8 overflow-x-auto no-scrollbar" id="tabrow-container">
      <div className="flex gap-6 min-w-max pb-1">
        {localizedTabs.map((tab, idx) => {
          const isActive = idx === activeTab;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveTab?.(idx)}
              className="relative flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
            >
              <span className={`text-sm font-black pb-2 transition-colors ${
                isActive 
                  ? 'text-emerald-600 dark:text-green-500' 
                  : 'text-slate-400 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
              }`}>
                {tab}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-0.5 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
