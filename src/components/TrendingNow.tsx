import { AudioLines, Play, Pause, ChevronRight, Headphones } from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import { allSurahsMetadata } from '../data/allSurahs';

interface TrendingNowProps {
  language?: Language;
  onPlaySurah?: (surahId: number) => void;
  playingSurahId?: number | null;
  isHomePlaying?: boolean;
}

export function TrendingNow({ 
  language = 'English', 
  onPlaySurah, 
  playingSurahId = null, 
  isHomePlaying = false 
}: TrendingNowProps) {
  const tSet = translations[language];

  // Dynamically roll 3 distinct stable random Suras from the 114 Surahs everyday
  const todayStr = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const id1 = (hash % 114) + 1;
  const id2 = ((hash + 31) % 114) + 1;
  const id3 = ((hash + 67) % 114) + 1;

  const surah1 = allSurahsMetadata.find(s => s.id === id1) || allSurahsMetadata[35]; // fallback Ya-Sin
  const surah2 = allSurahsMetadata.find(s => s.id === id2) || allSurahsMetadata[17]; // fallback Al-Kahf
  const surah3 = allSurahsMetadata.find(s => s.id === id3) || allSurahsMetadata[54]; // fallback Ar-Rahman

  const dailyTrending = [
    { id: surah1.id, surahName: `Surah ${surah1.surah}`, reciterName: 'Mishary Rashid Al-Afasy' },
    { id: surah2.id, surahName: `Surah ${surah2.surah}`, reciterName: 'Mishary Rashid Al-Afasy' },
    { id: surah3.id, surahName: `Surah ${surah3.surah}`, reciterName: 'Mishary Rashid Al-Afasy' },
  ];

  return (
    <div className="mb-8" id="trending-reciters-section">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <AudioLines className="text-emerald-500 w-5 h-5" />
          <h2 className="text-slate-800 dark:text-white font-black text-[17px] tracking-tight">{tSet.trending_now}</h2>
        </div>
        <button className="text-emerald-600 dark:text-green-500 text-[13px] font-black flex items-center hover:brightness-105 active:scale-95 transition-all">
          {tSet.view_all} <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      <div className="pl-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max pb-4 pr-4">
          {dailyTrending.map((item) => {
            const isCurrentPlaying = playingSurahId === item.id && isHomePlaying;
            return (
              <div 
                key={item.id} 
                onClick={() => onPlaySurah?.(item.id)}
                className={`flex items-center w-[230px] rounded-full p-2 pr-4 cursor-pointer backdrop-blur-sm transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] border ${
                  isCurrentPlaying 
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800" 
                    : "bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="relative w-12 h-12 flex-shrink-0 mr-3">
                  <div className="w-full h-full rounded-full overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-[#1A2027]">
                     <div className="w-full h-full bg-gradient-to-tr from-emerald-600/30 via-[#B89C5D]/30 to-green-600/20" />
                  </div>
                  {/* Headphones Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] bg-emerald-600 dark:bg-green-500 text-white dark:text-black rounded-full border-2 border-white dark:border-[#0A0D10] flex items-center justify-center shadow-sm">
                     <Headphones className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 mr-2 flex flex-col justify-center">
                  <h3 className="text-slate-900 dark:text-white text-[13px] font-black truncate">{item.surahName}</h3>
                  <p className="text-slate-550 dark:text-gray-400 text-[10px] truncate leading-tight mt-0.5 font-semibold">
                    {tSet.reciter}: <span className="text-emerald-700 dark:text-gray-300 font-extrabold">{item.reciterName}</span>
                  </p>
                </div>
                <div className={`w-[28px] h-[28px] flex-shrink-0 rounded-full flex items-center justify-center ml-auto transition-transform hover:scale-110 border ${
                  isCurrentPlaying 
                    ? "bg-emerald-500 text-white border-emerald-500" 
                    : "bg-emerald-600/10 dark:bg-green-500/20 text-emerald-700 dark:text-green-500 border-emerald-500/10"
                }`}>
                  {isCurrentPlaying ? (
                    <Pause className="w-2.5 h-2.5 fill-current" />
                  ) : (
                    <Play className="w-[10px] h-[10px] fill-current ml-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
