import { Quote, Sparkles } from 'lucide-react';
import { translations, Language } from '../utils/i18n';
import { dailyVerses } from '../data/dailyVerses';

interface DailyVerseProps {
  language?: Language;
}

export function DailyVerse({ language = 'English' }: DailyVerseProps) {
  const tSet = translations[language];

  // Rotate daily verse based on calendar day of the month
  const dayOfMonth = new Date().getDate();
  const index = (dayOfMonth - 1) % dailyVerses.length;
  const verse = dailyVerses[index] || dailyVerses[0];

  // Determine language translation
  const translationText = 
    language === 'Arabic' 
      ? verse.arabic
      : language === 'Hindi'
      ? verse.hindi
      : language === 'Urdu'
      ? verse.urdu
      : verse.english;

  const titleTranslation = 
    language === 'Arabic'
      ? `سورة ${verse.surahName} (${verse.verseNum})`
      : language === 'Hindi'
      ? `सूरह ${verse.surahName} (${verse.verseNum})`
      : language === 'Urdu'
      ? `سورہ ${verse.surahName} (${verse.verseNum})`
      : `Surah ${verse.surahName} (${verse.verseNum})`;

  const benefitText = language === 'Urdu' || language === 'Arabic' ? verse.benefitUrdu : verse.benefitEnglish;

  return (
    <div className="px-4 mb-8" id="daily-verse-wrapper">
      <div className="relative rounded-[28px] overflow-hidden border border-slate-200 dark:border-white/10 p-6 bg-gradient-to-br from-slate-50 to-slate-150 dark:from-[#161C23] dark:to-[#0A0D10] shadow-md dark:shadow-xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-10 translate-x-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#B89C5D]/10 rounded-full blur-[40px] translate-y-10 -translate-x-10 pointer-events-none"></div>
        
        {/* Decorative Graphic (Lantern/Book placeholder) */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-15 dark:opacity-40 pointer-events-none overflow-hidden">
           {/* Abstract glowing shape mimicking the book spread from reference */}
           <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-full h-[150%] bg-[url('https://images.unsplash.com/photo-1582236355447-38686d6ebaf1?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center rounded-l-full rotate-[15deg] object-cover mix-blend-color-dodge opacity-65"></div>
           <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-24 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-full rounded-b-md blur-[20px] opacity-30 mix-blend-screen"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 mt-1 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-550 dark:text-gray-400 flex-shrink-0 shadow-inner">
               <Quote className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-black text-[17px] mb-0.5">{tSet.daily_verse}</h2>
              <p className="text-emerald-600 dark:text-green-500 text-[12px] font-black uppercase tracking-wider">{tSet.ayah_of_day}</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mt-2 w-full pr-2 pb-2">
             <span className="text-slate-950 dark:text-white text-[25px] font-arabic mb-4 font-normal leading-[1.6] drop-shadow-sm select-text text-center w-full" dir="rtl">
                {verse.arabic}
             </span>
             <p className="text-slate-800 dark:text-gray-250 text-[13px] mb-3 max-w-[95%] font-bold leading-relaxed select-text">
                {translationText}
             </p>
             <p className="text-emerald-700 dark:text-[#B89C5D] text-[11px] font-black tracking-wide mb-4">
               {titleTranslation}
             </p>

             {/* Benefit Badge */}
             <div className="mt-2 w-full border-t border-slate-200/50 dark:border-white/5 pt-3 flex items-start gap-2.5 text-left bg-emerald-500/[0.03] dark:bg-white/[0.01] p-3 rounded-xl border border-emerald-500/10">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#B89C5D] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 dark:text-green-400 block mb-0.5">Benefit / Fazilat</span>
                  <p className="text-slate-600 dark:text-gray-400 text-[10.5px] font-medium leading-relaxed leading-[1.3]">{benefitText}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
