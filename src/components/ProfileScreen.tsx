import { Settings, Cloud, Type, User, Palette, Languages, Check, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { translations, Language } from '../utils/i18n';

interface ProfileScreenProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  tajweedColors: {
    ghunnah: string;
    qalqalah: string;
    ikhfa: string;
    idgham: string;
    iqlab: string;
    madd: string;
    silent: string;
  };
  setTajweedColors: React.Dispatch<React.SetStateAction<{
    ghunnah: string;
    qalqalah: string;
    ikhfa: string;
    idgham: string;
    iqlab: string;
    madd: string;
    silent: string;
  }>>;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  language?: Language;
  setLanguage: (lang: Language) => void;
}

export function ProfileScreen({ userName, userEmail, onLogout, fontSize, setFontSize, tajweedColors, setTajweedColors, isDarkMode, setIsDarkMode, language = 'English', setLanguage }: ProfileScreenProps) {
  const tSet = translations[language];
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const triggerManualSync = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
    }, 900);
  };

  // Convert font size (16 to 48) to lines limit rating (15 to 5)
  const linesEstimate = Math.max(5, Math.min(15, Math.round(15 - ((fontSize - 16) / (48 - 16)) * 10)));

  const updateColor = (key: keyof typeof tajweedColors, color: string) => {
    setTajweedColors(prev => ({ ...prev, [key]: color }));
  };

  const tajweedRules = [
    { key: 'ghunnah', label: 'Ghunnah', arabic: 'غنة' },
    { key: 'qalqalah', label: 'Qalqalah', arabic: 'قلقلة' },
    { key: 'ikhfa', label: 'Ikhfa', arabic: 'إخفاء' },
    { key: 'idgham', label: 'Idgham', arabic: 'إدغام' },
    { key: 'iqlab', label: 'Iqlab', arabic: 'إقلاب' },
    { key: 'madd', label: 'Madd', arabic: 'مد' },
    { key: 'silent', label: 'Silent Letter', arabic: 'صامت' },
  ] as const;

  const languagesList: Language[] = ['English', 'Hindi', 'Urdu', 'Arabic'];

  return (
    <div className="flex flex-col items-center justify-start pt-16 px-6 min-h-full pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500" id="profile-container">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4 group cursor-pointer">
           <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
           <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-[#161C23] dark:to-[#252D36] border-2 border-emerald-500/30 flex items-center justify-center relative shadow-xl overflow-hidden">
             <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400/80" />
           </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{userName || "Mehmaan"}</h1>
        <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mt-1.5">{userEmail === 'guest' ? "Guest Mode Active" : userEmail}</p>
        <p className="text-emerald-700 dark:text-green-400 text-xs font-black mt-3 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/25">
          {userEmail === 'guest' ? (language === 'Urdu' ? 'مہمان زائر' : language === 'Arabic' ? 'زائر' : language === 'Hindi' ? 'अतिथि' : "Guest Visitor") : "Quran Learner"}
        </p>
      </div>

      {/* Guest Mode Warning Notice Card */}
      {userEmail === 'guest' && (
        <div className="w-full mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 text-left shadow-md flex items-start gap-3">
          <div className="text-base pt-0.5">✨</div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-emerald-600 dark:text-green-555 uppercase tracking-wider">Guest Mode Active</h4>
            <p className="text-[11px] text-slate-700 dark:text-slate-350 mt-1 leading-relaxed font-bold">
              Apne reading checkpoints, custom Tajweed settings aur coins balance ko permanent save rakhne ke liye settings se login karein!
            </p>
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1 pl-2">Settings</h2>
        
        {/* Language Selection Setting Block */}
        <div className="w-full bg-slate-100 dark:bg-[#161C23] border border-slate-200 dark:border-white/5 rounded-[24px] p-5 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Languages className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-black text-sm">Language</span>
              <span className="text-slate-500 dark:text-gray-400 text-[11px] tracking-tight font-semibold">Select your Quranic UI localization</span>
            </div>
          </div>
          
          {/* iOS Style Segmented Control Widget for Language Selector */}
          <div className="grid grid-cols-4 bg-slate-200/50 dark:bg-black/45 p-1 rounded-2xl border border-slate-300/30 dark:border-white/5 mt-1.5 overflow-hidden">
            {languagesList.map((lang) => {
              const selected = lang === language;
              const displayNameMap: Record<Language, string> = {
                English: "EN",
                Hindi: "हिंदी",
                Urdu: "اردو",
                Arabic: "عربي"
              };

              return (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    localStorage.setItem('noor_ai_language', lang);
                  }}
                  className={`py-2 text-[11.5px] font-black rounded-xl transition-all uppercase tracking-wide cursor-pointer ${
                    selected 
                      ? 'bg-emerald-600 dark:bg-[#B89C5D] text-white dark:text-black shadow-md scale-100' 
                      : 'text-slate-600 dark:text-gray-450 hover:text-slate-800 dark:hover:text-white active:scale-95'
                  }`}
                  title={`Select language ${lang}`}
                >
                  {displayNameMap[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Cloud Sync Status */}
        <div className="w-full bg-slate-55 bg-gradient-to-br from-emerald-50 to-white border border-emerald-500/15 rounded-[24px] p-4 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-extrabold text-sm">Google Cloud Progress Sync</span>
                <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Active 🟢</span>
              </div>
            </div>
            
            <button 
              onClick={triggerManualSync}
              className="p-2 rounded-xl hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer"
              title="Sync now"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncingNow ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold leading-relaxed bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
            <p>
              Aapka saara data (<span className="text-emerald-700 font-bold">Bookmarks, Read Progress, Tokens, Coin logs, Noor AI history</span>) aapke email address <span className="text-emerald-700 font-bold select-all">{userEmail}</span> ke sath Firebase database me hamesha ke liye online secure hai!
            </p>
          </div>
        </div>

        {/* Font Size Adjustment */}
        <div className="w-full bg-slate-100 dark:bg-[#161C23] border border-slate-200 dark:border-white/5 rounded-[24px] p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Type className="w-5 h-5 text-[#B89C5D] dark:text-[#B89C5D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-black text-sm">{tSet.font_size}</span>
              <span className="text-slate-500 dark:text-gray-400 text-[11px] tracking-tight font-semibold">{linesEstimate} Lines per Page</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-2 mt-2">
            <span className="text-slate-500 dark:text-gray-400 text-sm font-bold">A</span>
            <input 
              type="range" 
              min="16" 
              max="48" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-emerald-600 dark:accent-green-500 h-1 bg-slate-300 dark:bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
            />
            <span className="text-slate-900 dark:text-white text-lg font-black">A</span>
          </div>
        </div>

        {/* Tajweed Colors Customization */}
        <div className="w-full bg-slate-100 dark:bg-[#161C23] border border-slate-200 dark:border-white/5 rounded-[24px] p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#B89C5D] dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-black text-sm">{language === 'Arabic' ? 'ألوان التجويد' : language === 'Hindi' ? 'तजवीद रंग' : language === 'Urdu' ? 'تجوید کے رنگ' : 'Tajweed Colors'}</span>
              <span className="text-slate-500 dark:text-gray-400 text-[11px] font-semibold tracking-tight">Personalize reading colors</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5 mt-2">
            {tajweedRules.map(rule => {
              // Localize labels if appropriate
              const tajweedLabels: Record<string, string> = {
                ghunnah: language === 'Hindi' ? 'गुन्ना' : language === 'Urdu' ? 'غنہ' : 'Ghunnah',
                qalqalah: language === 'Hindi' ? 'कलकला' : language === 'Urdu' ? 'قلقلہ' : 'Qalqalah',
                ikhfa: language === 'Hindi' ? 'इखफा' : language === 'Urdu' ? 'اخفاء' : 'Ikhfa',
                idgham: language === 'Hindi' ? 'इद्गाम' : language === 'Urdu' ? 'ادغام' : 'Idgham',
                iqlab: language === 'Hindi' ? 'इक्लाब' : language === 'Urdu' ? 'اقلاب' : 'Iqlab',
                madd: language === 'Hindi' ? 'मद्द' : language === 'Urdu' ? 'مد' : 'Madd',
                silent: language === 'Hindi' ? 'मूक शब्द' : language === 'Urdu' ? 'حروف صامت' : 'Silent Letter',
              };

              return (
                <div key={rule.key} className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tajweedColors[rule.key]}
                      onChange={(e) => updateColor(rule.key, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent transition-transform hover:scale-110"
                    />
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-gray-200 text-xs font-black">{tajweedLabels[rule.key] || rule.label}</span>
                    </div>
                  </div>
                  <span className="font-arabic text-[#B89C5D] text-lg leading-none">{rule.arabic}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Log Out / Log In Option Button */}
        {userEmail === 'guest' ? (
          <button
            onClick={onLogout}
            className="w-full h-12 mt-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-105 active:scale-97 text-white font-extrabold text-xs rounded-2xl border border-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10 uppercase tracking-widest"
          >
            <span>Google Account Se Log in Karein</span>
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="w-full h-12 mt-4 bg-rose-500/10 hover:bg-rose-500/18 active:scale-97 text-rose-600 dark:text-rose-400 font-extrabold text-xs rounded-2xl border border-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest"
          >
            <span>Google Account Log out</span>
          </button>
        )}
        
      </div>
    </div>
  );
}
