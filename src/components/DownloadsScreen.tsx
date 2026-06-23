import { useState, useEffect } from 'react';
import { Download, Check, Loader2, Play, Pause, AlertCircle, FileAudio } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface SurahDownload {
  id: string;
  name: string;
  arabicName: string;
  translation: string;
  totalVerses: number;
}

interface DownloadsScreenProps {
  language?: Language;
}

const SURAH_LIST: SurahDownload[] = [
  { id: '001', name: 'Al-Faatiha', arabicName: 'سُورَةُ ٱلْفَاتِحَةِ', translation: 'The Opening', totalVerses: 7 },
  { id: '002', name: 'Al-Baqarah', arabicName: 'سُورَةُ ٱلْبَقَرَةِ', translation: 'The Cow', totalVerses: 286 }
];

export function DownloadsScreen({ language = 'English' }: DownloadsScreenProps) {
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadStatus, setDownloadStatus] = useState<Record<string, 'idle' | 'downloading' | 'completed' | 'error'>>({});
  const tSet = translations[language];

  // Sync saved download states from local storage on mount
  useEffect(() => {
    const statuses: Record<string, 'idle' | 'downloading' | 'completed' | 'error'> = {};
    for (const surah of SURAH_LIST) {
      const isDownloaded = localStorage.getItem(`noor_ai_downloaded_surah_${surah.id}`) === 'true';
      statuses[surah.id] = isDownloaded ? 'completed' : 'idle';
    }
    setDownloadStatus(statuses);
  }, []);

  const handleDownload = async (surah: SurahDownload) => {
    if (downloadStatus[surah.id] === 'downloading') return;

    setDownloadStatus(prev => ({ ...prev, [surah.id]: 'downloading' }));
    setDownloadProgress(prev => ({ ...prev, [surah.id]: 10 }));

    const rawId = parseInt(surah.id, 10);
    const surahIdStr = String(rawId).padStart(3, '0');
    const audioUrl = rawId === 1 
      ? `https://www.image2url.com/r2/default/audio/1782127158574-c1c666e9-206e-4269-b51d-f43159885651.mp3`
      : `https://server8.mp3quran.net/afs/${surahIdStr}.mp3`;

    try {
      // Simulate progress ticks
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev[surah.id] || 0;
          if (current >= 90) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [surah.id]: current + 15 };
        });
      }, 300);

      const response = await fetch(audioUrl);
      clearInterval(interval);

      if (!response.ok) {
        throw new Error('Network error');
      }

      setDownloadProgress(prev => ({ ...prev, [surah.id]: 95 }));

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surah_${surah.name.replace(/\s+/g, '_')}_Alafasy.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus(prev => ({ ...prev, [surah.id]: 'completed' }));
      setDownloadProgress(prev => ({ ...prev, [surah.id]: 100 }));
      localStorage.setItem(`noor_ai_downloaded_surah_${surah.id}`, 'true');

    } catch (error) {
      console.error('Audio download error, trying direct window link:', error);
      
      // Fallback: trigger a secure direct browser window tab opening which prompts clean download
      try {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.target = '_blank';
        link.download = `${surah.id}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDownloadStatus(prev => ({ ...prev, [surah.id]: 'completed' }));
        localStorage.setItem(`noor_ai_downloaded_surah_${surah.id}`, 'true');
      } catch (fallbackError) {
        setDownloadStatus(prev => ({ ...prev, [surah.id]: 'error' }));
      }
    }
  };

  return (
    <div className="px-5 pt-6 pb-28 animate-in fade-in duration-300" id="downloads-container">
      {/* Title */}
      <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
        {tSet.nav_downloads}
      </h2>
      <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
        Quran Pak ki selected surahs ki high-quality voice (Mishary Rashid Al-Afasy) ko download kar ke offline recitation ka lutf uthayein.
      </p>

      {/* Surah List */}
      <div className="flex flex-col gap-4">
        {SURAH_LIST.map((surah) => {
          const status = downloadStatus[surah.id] || 'idle';
          const progress = downloadProgress[surah.id] || 0;

          return (
            <div 
              key={surah.id}
              className="bg-slate-100 dark:bg-[#161C23]/80 border border-slate-200 dark:border-white/10 rounded-[24px] p-4 flex items-center justify-between gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] backdrop-blur-md hover:border-emerald-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Audio Icon design */}
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-green-500/20 flex items-center justify-center text-emerald-600 dark:text-green-400">
                  <FileAudio className="w-5 h-5 opacity-90" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 leading-none">
                    {surah.name}
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-arabic pt-0.5" dir="rtl">
                      {surah.arabicName}
                    </span>
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-gray-400 mt-1.5 leading-none">
                    {surah.translation} • {surah.totalVerses} {language === 'Arabic' ? 'آية' : language === 'Hindi' ? 'आयतें' : language === 'Urdu' ? 'آیات' : 'Verses'}
                  </p>
                </div>
              </div>

              {/* Action Button right-aligned */}
              <div className="flex items-center gap-2">
                {status === 'downloading' ? (
                  <div className="flex flex-col items-center gap-1 px-3">
                    <Loader2 className="w-5 h-5 text-emerald-600 dark:text-green-400 animate-spin" />
                    <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">{progress}%</span>
                  </div>
                ) : status === 'completed' ? (
                  <button 
                    onClick={() => handleDownload(surah)}
                    className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer hover:bg-emerald-500/20 transition-all shadow-inner"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </button>
                ) : status === 'error' ? (
                  <button 
                    onClick={() => handleDownload(surah)}
                    className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-600 px-3.5 py-1.5 rounded-full text-xs font-black cursor-pointer hover:bg-rose-500/20 transition-all"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDownload(surah)}
                    className="bg-[#B89C5D] hover:brightness-105 text-white px-4 py-2 rounded-full text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 border border-transparent"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
