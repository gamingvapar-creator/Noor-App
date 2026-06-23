import { Flame, Play, Pause, ChevronRight } from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import { allSurahsMetadata } from '../data/allSurahs';

interface PopularSurahsProps {
  language?: Language;
  onPlaySurah?: (surahId: number) => void;
  playingSurahId?: number | null;
  isHomePlaying?: boolean;
}

// Popular Surah IDs in the Quran: Al-Mulk (67), Ar-Rahman (55), Al-Waqi'ah (56), Ya-Sin (36)
const POPULAR_IDS = [55, 67, 56, 36];

export function PopularSurahs({ 
  language = 'English', 
  onPlaySurah, 
  playingSurahId = null, 
  isHomePlaying = false 
}: PopularSurahsProps) {
  const tSet = translations[language];

  // Map to the actual list of Surahs from the official metadata
  const popularSuras = POPULAR_IDS.map(id => {
    const meta = allSurahsMetadata.find(s => s.id === id);
    return {
      id: id,
      name: meta?.surah || 'Surah',
      arabicName: meta?.arabicSurah || 'سورة',
      ayahCount: meta?.totalVerses || 0,
      language: 'Arabic'
    };
  });

  // Helper for Surah count label
  const ayahsLabel = language === 'Arabic' ? 'آية' : language === 'Hindi' ? 'आयत' : language === 'Urdu' ? 'آیات' : 'Ayahs';

  return (
    <div className="mb-8" id="popular-surahs-section">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="text-emerald-500 w-5 h-5 fill-emerald-500/10" />
          <h2 className="text-slate-800 dark:text-white font-black text-[17px] tracking-tight">{tSet.popular_surahs}</h2>
        </div>
        <button className="text-emerald-600 dark:text-green-500 text-[13px] font-black flex items-center hover:brightness-105 active:scale-95 transition-all">
          {tSet.view_all} <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      <div className="pl-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max pb-4 pr-4">
          {popularSuras.map((surah, idx) => {
            const isCurrentPlaying = playingSurahId === surah.id && isHomePlaying;
            return (
              <div 
                key={surah.id}
                onClick={() => onPlaySurah?.(surah.id)}
                className="relative w-[145px] h-[190px] rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 group cursor-pointer shadow-md dark:shadow-lg transition-all"
              >
                {/* Background mountain placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-25 dark:opacity-40 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0A0D10] dark:via-[#0A0D10]/20 dark:to-[#0A0D10]/40"></div>
                
                {/* Top Row - Badge & Language */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-yellow-500/20 border-2 border-emerald-600 dark:border-yellow-500/80 rounded-[8px] transform rotate-45 shadow-[0_0_10px_rgba(16,185,129,0.15)]"></div>
                    <span className="relative text-slate-950 dark:text-white font-black text-xs z-10">{idx + 1}</span>
                  </div>
                  <div className="bg-slate-200/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-md px-2 py-0.5 mt-0.5">
                    <span className="text-[9px] text-slate-800 dark:text-gray-250 font-black tracking-wide uppercase">{surah.language}</span>
                  </div>
                 </div>

                {/* Center Content */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center text-center px-1">
                  <span className="text-slate-950 dark:text-white text-[23px] font-arabic drop-shadow-sm tracking-wide break-words">{surah.arabicName}</span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                  <div className="pb-0.5 min-w-0 flex-1 mr-1">
                    <h3 className="text-slate-900 dark:text-white font-black text-[13px] leading-tight mb-0.5 truncate">{surah.name}</h3>
                    <p className="text-slate-550 dark:text-gray-400 text-[10px] font-bold truncate">{surah.ayahCount} {ayahsLabel}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-[0_0_15px_rgba(29,185,84,0.1)] flex-shrink-0 ${
                    isCurrentPlaying 
                      ? "bg-emerald-500 text-white border-emerald-500" 
                      : "bg-emerald-600/10 dark:bg-green-500/20 text-emerald-700 dark:text-green-500 border-emerald-500/30 group-hover:bg-emerald-600 dark:group-hover:bg-green-500 group-hover:text-white dark:group-hover:text-black"
                  }`}>
                    {isCurrentPlaying ? (
                      <Pause className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
