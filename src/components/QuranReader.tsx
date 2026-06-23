  import { useState, useMemo, Fragment, useEffect, useRef } from 'react';
import { ChevronLeft, Settings2, PlayCircle, PauseCircle, Loader2, Check, Flag, Bookmark, ChevronDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuranReaderProps {
  onClose: () => void;
  fontSize: number;
  userEmail: string;
  tajweedColors: {
    ghunnah: string;
    qalqalah: string;
    ikhfa: string;
    idgham: string;
    iqlab: string;
    madd: string;
    silent: string;
  };
  initialSurahId?: number;
  autoPlay?: boolean;
}

import { quranData } from '../data/quranData';
import { allSurahsMetadata } from '../data/allSurahs';

export type ReadingMode = 'arabic' | 'urdu' | 'english' | 'arabic_urdu' | 'arabic_english' | 'all';

function TajweedText({ text, colors }: { text: string | undefined | null, colors: QuranReaderProps['tajweedColors'] }) {
  const segments = useMemo(() => {
    if (!text) return [];
    const list = [];
    let lastIndex = 0;
    const regex = /\[([a-zA-Z0-9:]+)\[([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        list.push({ text: text.substring(lastIndex, match.index), rule: null });
      }
      list.push({ text: match[2], rule: match[1].split(':')[0] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      list.push({ text: text.substring(lastIndex), rule: null });
    }
    return list;
  }, [text]);

  const mapColor = (rule: string) => {
    if (rule === 'g') return colors.ghunnah;
    if (rule === 'q') return colors.qalqalah;
    if (rule === 'i' || rule === 's') return colors.ikhfa; // Ikhfa / Ikhfa Shafawi
    if (rule === 'o' || rule === 'a') return colors.idgham; // Idgham / Idgham Shafawi
    if (rule === 'c') return colors.iqlab;
    if (rule === 'm' || rule === 'n' || rule === 'p') return colors.madd;
    if (rule === 'f' || rule === 'l' || rule === 'h') return colors.silent;
    return 'inherit';
  };

  return (
    <>
      {segments.map((seg, idx) => (
        <span key={idx} style={{ color: seg.rule ? mapColor(seg.rule) : 'inherit', transition: 'color 0.3s ease' }}>
          {seg.text}
        </span>
      ))}
    </>
  );
}

function QuranWordHighlighter({ text, isActive, progressPercent, colors }: { text: string; isActive: boolean; progressPercent: number; colors: QuranReaderProps['tajweedColors'] }) {
  const words = useMemo(() => {
    if (!text) return [];
    return text.split(/\s+/).filter(Boolean);
  }, [text]);
  
  if (!text) return null;
  if (!isActive) {
    return <TajweedText text={text} colors={colors} />;
  }
  
  const totalWords = words.length;
  const activeWordIdx = Math.min(totalWords - 1, Math.floor((progressPercent / 100) * totalWords));

  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1.5 justify-end leading-[2.6] text-right" dir="rtl">
      {words.map((word, index) => {
        const isWordActive = index === activeWordIdx;
        const isWordPassed = index < activeWordIdx;
        return (
          <span
            key={index}
            className={`transition-all duration-200 inline-block px-1 rounded-lg ${
              isWordActive 
                ? 'bg-yellow-400 text-slate-950 font-black scale-102 shadow-md shadow-yellow-500/30' 
                : isWordPassed 
                ? 'text-yellow-200 font-bold opacity-80' 
                : 'text-white'
            }`}
          >
            <TajweedText text={word} colors={colors} />
          </span>
        );
      })}
    </span>
  );
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function QuranReader({ onClose, fontSize, userEmail, tajweedColors, initialSurahId, autoPlay }: QuranReaderProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [readingMode, setReadingMode] = useState<ReadingMode>('arabic');
  const [currentPlayingVerseIdx, setCurrentPlayingVerseIdx] = useState<number | null>(null);
  const [currentWordProgressPercent, setCurrentWordProgressPercent] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSurahSelectOpen, setIsSurahSelectOpen] = useState(false);
  const [isAyahSelectOpen, setIsAyahSelectOpen] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState("");

  const [loadedQuranData, setLoadedQuranData] = useState(() => {
    return allSurahsMetadata.map(m => {
      const staticSurah = quranData.find(s => s.id === m.id);
      return {
        id: m.id,
        surah: m.surah,
        arabicSurah: m.arabicSurah,
        juz: m.juz,
        bismillah: m.bismillah,
        totalVerses: m.totalVerses,
        // Al-E-Imran (id: 3) will be retrieved completely from the API so that all 200 verses are loaded properly without truncation
        verses: staticSurah && staticSurah.id !== 3 
          ? staticSurah.verses.map((v, idx) => ({ ...v, id: idx + 1 })) 
          : []
      };
    });
  });

  const [loadingSurahId, setLoadingSurahId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ruko Bookmark State mapped permanently via storage keyed on userEmail
  const [lastReadVerseIndex, setLastReadVerseIndex] = useState<number | null>(null);
  const [showDeselectConfirmFor, setShowDeselectConfirmFor] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [scrollTargetVerse, setScrollTargetVerse] = useState<number | null>(null);

  // Audio Playback State (by Mishary Rashid Al-Afasy)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate verses per page based on font size (15 to 5)
  const versesPerPage = Math.max(5, Math.min(15, Math.round(15 - ((fontSize - 16) / (48 - 16)) * 10)));

  // Generate dynamic pages containing standard pages or single loading placeholder for empty ones
  const pagesData = useMemo(() => {
    let result = [];
    for (let s of loadedQuranData) {
      if (s.verses.length === 0) {
        result.push({
          id: `${s.id}-page-placeholder`,
          surahId: s.id,
          surah: s.surah,
          arabicSurah: s.arabicSurah,
          bismillah: s.bismillah,
          verses: [],
          startIndex: 0,
          isFirstPageOfSurah: true,
          totalPagesForSurah: 1,
          pageIndexForSurah: 1,
          juz: s.juz,
          isLoadingPlaceholder: true
        });
        continue;
      }
      let vChunks = [];
      for (let i = 0; i < s.verses.length; i += versesPerPage) {
        vChunks.push(s.verses.slice(i, i + versesPerPage));
      }
      for (let i = 0; i < vChunks.length; i++) {
        result.push({
          id: `${s.id}-page-${i}`,
          surahId: s.id,
          surah: s.surah,
          arabicSurah: s.arabicSurah,
          bismillah: i === 0 ? s.bismillah : null,
          verses: vChunks[i],
          startIndex: i * versesPerPage,
          isFirstPageOfSurah: i === 0,
          totalPagesForSurah: vChunks.length,
          pageIndexForSurah: i + 1,
          juz: s.juz,
          isLoadingPlaceholder: false
        });
      }
    }
    return result;
  }, [loadedQuranData, versesPerPage]);

  const currentPageData = pagesData[page] || pagesData[0] || {
    id: "empty",
    surahId: 1,
    surah: "Al-Faatiha",
    arabicSurah: "سُورَةُ ٱلْفَاتِحَةِ",
    bismillah: null,
    verses: [],
    startIndex: 0,
    isFirstPageOfSurah: false,
    totalPagesForSurah: 0,
    pageIndexForSurah: 0,
    juz: 1,
    isLoadingPlaceholder: false
  };

  const [initialSuraIdHandled, setInitialSuraIdHandled] = useState(false);
  useEffect(() => {
    if (initialSurahId && !initialSuraIdHandled && pagesData.length > 0) {
      const surahMeta = allSurahsMetadata.find(s => s.id === initialSurahId);
      const savedRuko = surahMeta ? localStorage.getItem(`noor_ai_ruko_verse_${surahMeta.surah}_${userEmail || 'guest'}`) : null;
      const targetVerse = savedRuko ? parseInt(savedRuko, 10) : 1;

      const targetPageIdx = pagesData.findIndex(p => 
        p.surahId === initialSurahId && 
        !p.isLoadingPlaceholder &&
        targetVerse > p.startIndex &&
        targetVerse <= p.startIndex + p.verses.length
      );
      
      const fallbackIdx = pagesData.findIndex(p => p.surahId === initialSurahId && !p.isLoadingPlaceholder);
      const resolvedIdx = targetPageIdx !== -1 ? targetPageIdx : fallbackIdx;

      if (resolvedIdx !== -1) {
        setPage([resolvedIdx, 0]);
        setInitialSuraIdHandled(true);
        if (savedRuko) {
          setScrollTargetVerse(targetVerse);
        }
      }
    }
  }, [initialSurahId, pagesData, initialSuraIdHandled, userEmail]);

  const [hasAutoplayed, setHasAutoplayed] = useState(false);
  useEffect(() => {
    if (autoPlay && !hasAutoplayed && audioRef.current && currentPageData && currentPageData.surahId === initialSurahId) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(err => console.error("Autoplay trigger failed:", err));
        setHasAutoplayed(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, hasAutoplayed, currentPageData?.surahId, initialSurahId]);

  const handleSelectAyah = (verseNum: number) => {
    const targetPageIdx = pagesData.findIndex(p => 
      p.surahId === currentPageData.surahId &&
      !p.isLoadingPlaceholder &&
      verseNum > p.startIndex &&
      verseNum <= p.startIndex + p.verses.length
    );
    
    if (targetPageIdx !== -1) {
      setPage([targetPageIdx, 1]);
      setScrollTargetVerse(verseNum);
    }
    setIsAyahSelectOpen(false);
  };

  const prevLoadedCountRef = useRef<{ [key: number]: number }>({});
  
  useEffect(() => {
    loadedQuranData.forEach(s => {
      const prevCount = prevLoadedCountRef.current[s.id] || 0;
      if (prevCount === 0 && s.verses.length > 0) {
        // Find if user is currently viewing this Surah's placeholder
        if (currentPageData && currentPageData.surahId === s.id && currentPageData.isLoadingPlaceholder) {
          const savedRuko = localStorage.getItem(`noor_ai_ruko_verse_${s.surah}_${userEmail || 'guest'}`);
          const targetVerse = savedRuko ? parseInt(savedRuko, 10) : 1;
          
          const targetPageIdx = pagesData.findIndex(p => 
            p.surahId === s.id && 
            !p.isLoadingPlaceholder &&
            targetVerse > p.startIndex && 
            targetVerse <= p.startIndex + p.verses.length
          );
          
          if (targetPageIdx !== -1) {
            setPage([targetPageIdx, 0]);
          } else {
            const fallbackIdx = pagesData.findIndex(p => p.surahId === s.id && !p.isLoadingPlaceholder);
            if (fallbackIdx !== -1) {
              setPage([fallbackIdx, 0]);
            }
          }
        }
      }
      prevLoadedCountRef.current[s.id] = s.verses.length;
    });
  }, [loadedQuranData, pagesData, currentPageData, userEmail]);

  useEffect(() => {
    if (!currentPageData) return;
    const sId = currentPageData.surahId;
    const surahState = loadedQuranData.find(s => s.id === sId);
    if (surahState && surahState.verses.length === 0 && loadingSurahId !== sId) {
      setLoadingSurahId(sId);
      setErrorMessage(null);
      
      const cleanFirstAyah = (arabic: string, urdu: string, english: string, surahId: number) => {
        if (surahId === 1 || surahId === 9) {
          return { arabic, urdu, english };
        }
        let cleanedArabic = arabic;
        const bismillahStandard = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
        if (cleanedArabic.startsWith(bismillahStandard)) {
          cleanedArabic = cleanedArabic.substring(bismillahStandard.length).trim();
        } else {
          const parts = cleanedArabic.split(" ");
          if (parts.length > 4 && parts[0] === "بِسْمِ" && parts[1].includes("للَّهِ") && parts[2].includes("رَّحْمَ") && parts[3].includes("رَّح")) {
            cleanedArabic = parts.slice(4).join(" ").trim();
          }
        }
        return { arabic: cleanedArabic, urdu, english };
      };

      const fetchSurah = async () => {
        try {
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${sId}/editions/quran-tajweed,ur.jandali,en.sahih`);
          if (!res.ok) throw new Error("API call failed");
          const json = await res.json();
          if (json.code === 200 && json.data && json.data.length === 3) {
            const arabicAyahs = json.data[0].ayahs;
            const urduAyahs = json.data[1].ayahs;
            const englishAyahs = json.data[2].ayahs;
            
            const mergedVerses = arabicAyahs.map((ayah: any, index: number) => {
              const cleaned = cleanFirstAyah(
                ayah.text, 
                urduAyahs[index]?.text || "", 
                englishAyahs[index]?.text || "", 
                sId
              );
              
              const baseVerse = index === 0 ? cleaned : {
                arabic: ayah.text,
                urdu: urduAyahs[index]?.text || "",
                english: englishAyahs[index]?.text || ""
              };
              return {
                ...baseVerse,
                id: index + 1
              };
            });
            
            setLoadedQuranData(prev => prev.map(s => {
              if (s.id === sId) {
                return {
                  ...s,
                  verses: mergedVerses
                };
              }
              return s;
            }));
          } else {
            throw new Error("Required editions not found");
          }
        } catch (err: any) {
          console.error("Quran loading error:", err);
          setErrorMessage("Network connection check karein ya thodi der baad koshish karein.");
        } finally {
          setLoadingSurahId(null);
        }
      };
      
      fetchSurah();
    }
  }, [currentPageData?.surahId, loadedQuranData, loadingSurahId]);

  // Lock background scroll when Quran reader is mounted
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Smooth lock handler to reset window scroll position
    const lockScroll = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('scroll', lockScroll);
    
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('scroll', lockScroll);
    };
  }, []);

  // Load saved resume point upon opening
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (hasInitializedRef.current) return;
    const lastReadSurah = localStorage.getItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`);
    const lastReadVerseStr = localStorage.getItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`);
    if (lastReadSurah && lastReadVerseStr && pagesData.length > 0) {
      const lastReadVerse = parseInt(lastReadVerseStr, 10);
      const targetPageIdx = pagesData.findIndex(p => 
        p.surah === lastReadSurah && 
        lastReadVerse > p.startIndex && 
        lastReadVerse <= p.startIndex + p.verses.length
      );
      if (targetPageIdx !== -1) {
        setPage([targetPageIdx, 0]);
        hasInitializedRef.current = true;
      }
    }
  }, [pagesData, userEmail]);

  // Handle page out of bounds when font size (and thus pagesData.length) changes
  useEffect(() => {
    if (pagesData.length === 0) return;
    if (page >= pagesData.length || page < 0) {
      setPage([0, 0]);
    }
  }, [page, pagesData.length]);

  // Scroll to saved verse index on page load/change
  useEffect(() => {
    const targetVerse = scrollTargetVerse || lastReadVerseIndex;
    if (targetVerse === null) return;
    
    // Set a small timeout to let the page render in full
    const timer = setTimeout(() => {
      const container = document.getElementById('quran-scroll-container');
      const element = document.getElementById(`verse-${targetVerse}`) || document.getElementById(`arabic-verse-${targetVerse}`);
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScrollTop = relativeTop - container.clientHeight / 2 + element.clientHeight / 2;
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
      if (scrollTargetVerse) {
        setScrollTargetVerse(null);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [page, lastReadVerseIndex, scrollTargetVerse]);

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next >= 0 && next < pagesData.length) {
      setPage([next, newDirection]);
    }
  };

  const handleSelectSurah = (surahName: string) => {
    // Try to find if there is a saved checkpoint for this specific Surah
    const savedVerseStr = localStorage.getItem(`noor_ai_ruko_verse_${surahName}_${userEmail || 'guest'}`);
    let targetVerse = savedVerseStr ? parseInt(savedVerseStr, 10) : 1;
    
    // Find page index in pagesData
    const targetPageIdx = pagesData.findIndex(p => 
      p.surah === surahName && 
      targetVerse > p.startIndex && 
      targetVerse <= p.startIndex + p.verses.length
    );
    
    if (targetPageIdx !== -1) {
      setPage([targetPageIdx, 1]);
      setScrollTargetVerse(targetVerse);
    } else {
      // Fallback: first page of that Surah
      const fallbackIdx = pagesData.findIndex(p => p.surah === surahName);
      if (fallbackIdx !== -1) {
        setPage([fallbackIdx, 1]);
        setScrollTargetVerse(1);
      }
    }
    setIsSurahSelectOpen(false);
  };

  // Dynamic Audio Recitation Setup based on selected Surah
  useEffect(() => {
    if (!currentPageData?.surah) return;

    const surahId = String(currentPageData.surahId || 1).padStart(3, '0');
    const audioUrl = currentPageData.surahId === 1
      ? `https://www.image2url.com/r2/default/audio/1782127158574-c1c666e9-206e-4269-b51d-f43159885651.mp3`
      : `https://server8.mp3quran.net/afs/${surahId}.mp3`;
    
    // Stop any currently playing audio before creating a new one
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    // Explicitly configure audio for reliable background behavior
    audio.preload = "auto";
    audioRef.current = audio;
    setIsPlaying(false);
    setIsAudioLoading(false);

    const updateMediaSession = () => {
      if ('mediaSession' in navigator && currentPageData) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${currentPageData.surah} (${currentPageData.arabicSurah || 'Surah'})`,
            artist: 'Mishary Rashid Al-Afasy Recitation',
            album: 'Mubarak Al-Quran Al-Kareem',
            artwork: [
              { src: 'https://images.unsplash.com/photo-1609599006346-7c3809634f1b?q=80&w=256&auto=format&fit=crop', sizes: '256x256', type: 'image/jpeg' },
              { src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=512', sizes: '512x512', type: 'image/jpeg' }
            ]
          });

          navigator.mediaSession.setActionHandler('play', () => {
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.error("MediaSession play error:", err));
              setIsPlaying(true);
            }
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          });

          navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            if (audioRef.current) {
              const offset = details.seekOffset || 10;
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - offset);
            }
          });

          navigator.mediaSession.setActionHandler('seekforward', (details) => {
            if (audioRef.current) {
              const offset = details.seekOffset || 10;
              audioRef.current.currentTime = Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + offset);
            }
          });
        } catch (e) {
          console.error("Failed to initialize MediaSession:", e);
        }
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      setIsAudioLoading(false);
      updateMediaSession();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsAudioLoading(false);
      setCurrentPlayingVerseIdx(null);
      setCurrentWordProgressPercent(0);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "none";
      }
    };

    const onWaiting = () => {
      setIsAudioLoading(true);
    };

    const onCanPlay = () => {
      setIsAudioLoading(false);
    };

    const onTimeUpdate = () => {
      if (audioRef.current && currentPageData) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 1;
        const sId = currentPageData.surahId || 1;

        if (sId === 1) {
          const timings = [
            { id: 1, start: 0, end: 5.5 },
            { id: 2, start: 5.5, end: 11.5 },
            { id: 3, start: 11.5, end: 16.5 },
            { id: 4, start: 16.5, end: 22.5 },
            { id: 5, start: 22.5, end: 31.0 },
            { id: 6, start: 31.0, end: 37.5 },
            { id: 7, start: 37.5, end: duration }
          ];

          const currentTimingsObj = timings.find(t => currentTime >= t.start && currentTime < t.end) || timings[timings.length - 1];
          const activeVerse = currentTimingsObj.id;
          
          const vDur = currentTimingsObj.end - currentTimingsObj.start;
          const relativeTime = currentTime - currentTimingsObj.start;
          const progress = Math.min(100, Math.max(0, (relativeTime / vDur) * 100));

          setCurrentPlayingVerseIdx(activeVerse);
          setCurrentWordProgressPercent(progress);
        } else {
          const totalVerses = currentPageData.verses.length;
          if (totalVerses > 0) {
            const ratio = currentTime / duration;
            const floatIdx = ratio * totalVerses;
            const activeVersePageIdx = Math.min(totalVerses, Math.max(1, Math.ceil(floatIdx)));
            setCurrentPlayingVerseIdx(activeVersePageIdx);

            const relativeRatio = floatIdx - (activeVersePageIdx - 1);
            const progress = Math.min(100, Math.max(0, relativeRatio * 100));
            setCurrentWordProgressPercent(progress);
          }
        }
      }
    };

    audio.addEventListener('playing', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('playing', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audioRef.current = null;
    };
  }, [currentPageData?.surah]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsAudioLoading(true);
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
        setIsAudioLoading(false);
        setIsPlaying(false);
      });
    }
  };

  // Read bookmark from storage linked to this specific Surah and this Gmail / Guest
  useEffect(() => {
    if (currentPageData?.surah) {
      const saved = localStorage.getItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`);
      setLastReadVerseIndex(saved ? Number(saved) : null);
    }
  }, [currentPageData?.surah, userEmail]);

  const handleMarkRuko = (verseIndex: number) => {
    // If no bookmark, simply save
    if (lastReadVerseIndex === null) {
      setLastReadVerseIndex(verseIndex);
      localStorage.setItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`, verseIndex.toString());
      localStorage.setItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`, currentPageData.surah);
      localStorage.setItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`, verseIndex.toString());
      return;
    }

    // Attempting to deselect the exact ending marked verse
    if (verseIndex === lastReadVerseIndex) {
      // Show deselection warning dialog
      setShowDeselectConfirmFor(verseIndex);
      return;
    }

    // Try to deselect from the middle (which is blocked!)
    if (verseIndex < lastReadVerseIndex) {
      setWarningMessage(`Beech ki verses ko deselect nahi kiya ja sakta! Sirf ending active verse (Ayah ${lastReadVerseIndex}) ko hi deselect kiya ja sakta hai.`);
      setTimeout(() => setWarningMessage(null), 5000);
      return;
    }

    // They clicked a higher verse (moving the reading point forward)
    setLastReadVerseIndex(verseIndex);
    localStorage.setItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`, verseIndex.toString());
    
    // Also save the global checkpoint across the entire Quran to resume instantly later
    localStorage.setItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`, currentPageData.surah);
    localStorage.setItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`, verseIndex.toString());
  };

  const handleConfirmDeselect = () => {
    if (showDeselectConfirmFor === null) return;
    
    // Decrement the marked progress by 1 step or clear if it is the first one
    const newIdx = showDeselectConfirmFor > 1 ? showDeselectConfirmFor - 1 : null;
    setLastReadVerseIndex(newIdx);
    
    if (newIdx === null) {
      localStorage.removeItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`);
      localStorage.removeItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`);
      localStorage.removeItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`);
    } else {
      localStorage.setItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`, newIdx.toString());
      localStorage.setItem(`noor_ai_last_read_surah_${userEmail || 'guest'}`, currentPageData.surah);
      localStorage.setItem(`noor_ai_last_read_verse_${userEmail || 'guest'}`, newIdx.toString());
    }
    
    setShowDeselectConfirmFor(null);
  };

  const isHighlighted = (verseIndex: number) => {
    if (lastReadVerseIndex === null) return false;
    return verseIndex <= lastReadVerseIndex;
  };

  const isLastReadVerse = (verseIndex: number) => {
    return lastReadVerseIndex === verseIndex;
  };

  const renderUnifiedAauzuBismillah = () => {
    // Only render on the first page of the Surah
    if (!currentPageData.isFirstPageOfSurah) return null;

    return (
      <div className="border-[#B89C5D]/30 border-b pb-6 mb-8 mt-2 mx-auto w-full max-w-lg flex flex-col items-center justify-center text-center">
        {/* Aauzu billahi minashshaitonirrajeem */}
        <div className="flex flex-col items-center w-full relative">
          <div className="w-full flex justify-end mb-1 pr-4">
            <span className="text-yellow-400/90 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-400/5 border border-yellow-400/10 font-mono scale-90">
              Ta'awwuz
            </span>
          </div>
          <h2 className="font-arabic text-[26px] md:text-[30px] text-center drop-shadow-sm leading-tight text-white/90" dir="rtl">
            أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
          </h2>
          {(readingMode === 'urdu' || readingMode === 'arabic_urdu' || readingMode === 'all') && (
            <p className="font-urdu text-[15px] text-center text-green-400/80 mt-1.5" dir="rtl">
              میں پناہ مانگتا ہوں اللہ کی شیطان مردود سے
            </p>
          )}
          {(readingMode === 'english' || readingMode === 'arabic_english' || readingMode === 'all') && (
            <p className="font-sans text-[11px] font-medium text-center text-gray-450 mt-1">
              I seek refuge in Allah from Satan, the expelled
            </p>
          )}
        </div>

        {/* Divider Underline */}
        <div className="w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#B89C5D]/50 to-transparent my-4" />

        {/* Bismillahir Rahmanir Raheem */}
        <div className="flex flex-col items-center font-bold w-full relative">
          <div className="w-full flex justify-end mb-1 pr-4">
            <span className="text-emerald-450 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 font-mono scale-90">
              Tasmiyah
            </span>
          </div>
          <h2 className="font-arabic text-[28px] md:text-[32px] text-center drop-shadow-sm leading-tight text-white animate-pulse" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </h2>
          {(readingMode === 'urdu' || readingMode === 'arabic_urdu' || readingMode === 'all') && (
            <p className="font-urdu text-[15px] text-center text-green-400/85 mt-1.5" dir="rtl">
              شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
            </p>
          )}
          {(readingMode === 'english' || readingMode === 'arabic_english' || readingMode === 'all') && (
            <p className="font-sans text-[11px] font-medium text-center text-gray-450 mt-1">
              In the name of Allah, the Entirely Merciful, the Especially Merciful
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Filter verses to skip Al-Fatiha's first verse (the Bismillah)
    const renderedVerses = currentPageData.verses.filter((v: any, idx: number) => {
      if (currentPageData.surahId === 1) {
        const absoluteIdx = currentPageData.startIndex + idx + 1;
        return absoluteIdx !== 1;
      }
      return true;
    });

    if (currentPageData.isLoadingPlaceholder) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 px-6 w-full text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-[#B89C5D]/20 border-t-[#B89C5D] mb-6 shadow-[0_0_20px_rgba(184,156,92,0.3)]"
          />
          <h2 className="text-[#B89C5D] text-lg font-extrabold mb-2 tracking-wide font-arabic">
            {currentPageData.arabicSurah}
          </h2>
          <h3 className="text-xl font-bold text-white mb-2">{currentPageData.surah}</h3>
          <p className="text-sm font-medium text-emerald-400 font-urdu tracking-wide mb-1" dir="rtl">
            Aayat aur tarjuma load ho raha hai. Ek bhi aayat miss nahi hogi...
          </p>
          <p className="text-xs font-semibold text-slate-400">
            Loading all verses of {currentPageData.surah}. Not a single verse is missed!
          </p>
          {errorMessage && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs font-medium max-w-xs mx-auto">
                {errorMessage}
              </div>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setLoadedQuranData([...loadedQuranData]);
                }}
                className="mt-1 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-bold transition-all active:scale-95"
              >
                Phir Se Koshish Karein (Retry)
              </button>
            </div>
          )}
        </div>
      );
    }

    if (readingMode === 'arabic') {
      return (
        <div className="flex flex-col items-center justify-start min-h-full px-4 w-full">
          <div className="border-[2px] border-[#B89C5D]/50 rounded-xl p-5 w-full mb-6 bg-gradient-to-b from-[#B89C5D]/5 to-transparent relative shadow-inner">
             <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0A0D10] px-6 text-[#B89C5D] font-bold border border-[#B89C5D] rounded-full text-lg shadow-[0_0_15px_rgba(184,156,93,0.3)] whitespace-nowrap">
               {currentPageData.arabicSurah}
             </div>
             
             {renderUnifiedAauzuBismillah()}
             
             <div className="font-arabic leading-[3.2] text-white text-right w-full mt-6 pr-2 pl-2" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
                {renderedVerses.map((v: any, idx: number) => {
                  const verseIdx = v.id || (currentPageData.startIndex + idx + 1);
                  const isActive = currentPlayingVerseIdx === verseIdx;
                  const currentStop = isLastReadVerse(verseIdx);
                  return (
                    <span 
                      key={idx} 
                      id={`arabic-verse-${verseIdx}`}
                      className={`transition-all duration-300 rounded-xl px-2 py-0.5 inline-block ${
                        isActive 
                          ? "bg-yellow-400 text-slate-950 font-black scale-102 shadow-lg shadow-yellow-500/35" 
                          : currentStop
                          ? "border-b border-dashed border-[#B89C5D]/60 bg-[#B89C5D]/5 text-white"
                          : "text-white hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      {isActive ? (
                        <QuranWordHighlighter text={v.arabic} isActive={true} progressPercent={currentWordProgressPercent} colors={tajweedColors} />
                      ) : (
                        <TajweedText text={v.arabic} colors={tajweedColors} />
                      )}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRuko(verseIdx);
                        }}
                        title="Ayat Mark (Yahan tak padha hai)"
                        className={`inline-flex items-center gap-1 mx-1.5 text-[11px] font-mono select-none px-2.5 py-0.5 rounded-full cursor-pointer transition-all active:scale-95 align-middle font-bold ${
                          currentStop 
                            ? "bg-yellow-400 text-slate-950 border border-yellow-350 shadow-[0_0_10px_rgba(234,179,8,0.4)]" 
                            : "bg-[#B89C5D]/20 text-[#B89C5D] hover:bg-[#B89C5D]/40 hover:text-white border border-[#B89C5D]/10"
                        }`}
                      >
                        {currentStop && <Flag className="w-2.5 h-2.5 fill-current" />}
                        {verseIdx}
                      </span>
                    </span>
                  );
                })}
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-start min-h-full px-4 w-full">
         <div className="w-full mb-6 relative">
            <div className="text-center mb-8 pb-4 border-b border-white/10">
              <h1 className="font-arabic text-[#B89C5D] mb-2" style={{ fontSize: `${fontSize}px` }}>{currentPageData.arabicSurah}</h1>
              <p className="text-sm tracking-widest text-gray-400 uppercase">{currentPageData.surah}</p>
            </div>

            {renderUnifiedAauzuBismillah()}

            <div className="flex flex-col gap-8 w-full">
               {renderedVerses.map((v: any, i) => {
                 const verseIdx = v.id || (currentPageData.startIndex + i + 1);
                 const activeHighlight = false;
                 const currentStop = isLastReadVerse(verseIdx);
                 const isCurrentlyPlaying = currentPlayingVerseIdx === verseIdx;
                 return (
                   <div 
                     key={i} 
                     id={`verse-${verseIdx}`}
                     className={`flex flex-col border-b border-white/5 pb-6 pt-3 px-4 relative transition-all duration-300 rounded-2xl ${
                       isCurrentlyPlaying
                         ? 'bg-yellow-500/20 border border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20'
                         : activeHighlight 
                         ? 'bg-yellow-500/10 border border-yellow-500/25 shadow-inner' 
                         : 'hover:bg-white/[0.01]'
                     }`}
                   >
                     {/* Ruko marker and verse index controls header */}
                     <div className="flex items-center justify-between gap-2 mb-4">
                       <span className="text-white/30 font-extrabold text-[11px] tracking-widest uppercase">
                         Aayat {verseIdx}
                       </span>
                       
                       <button
                         onClick={() => handleMarkRuko(verseIdx)}
                         className={`px-3 py-1 flex items-center gap-1.5 rounded-full text-[10px] font-extrabold tracking-wide cursor-pointer transition-all active:scale-95 border ${
                           currentStop
                             ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                             : activeHighlight
                             ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                             : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                         }`}
                       >
                         <Flag className="w-3 h-3 fill-current" />
                         <span>{currentStop ? "Ayat Mark: Yahan Ruke Hain" : "Ayat Mark"}</span>
                       </button>
                     </div>
                     
                     {(readingMode === 'arabic_urdu' || readingMode === 'arabic_english' || readingMode === 'all') && (
                       <div className="font-arabic leading-[2.4] text-white text-right mb-4 drop-shadow-sm select-text" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
                         <QuranWordHighlighter 
                           text={v.arabic} 
                           isActive={isCurrentlyPlaying} 
                           progressPercent={currentWordProgressPercent} 
                           colors={tajweedColors} 
                         />
                       </div>
                     )}
                     
                     {(readingMode === 'urdu' || readingMode === 'arabic_urdu' || readingMode === 'all') && (
                       <p className="font-urdu leading-[2.4] text-green-400/95 text-right pr-4 select-text" dir="rtl" style={{ fontSize: `${Math.round(fontSize * 0.72)}px` }}>
                         {v.urdu}
                       </p>
                     )}

                     {(readingMode === 'english' || readingMode === 'arabic_english' || readingMode === 'all') && (
                       <p className="font-sans leading-[1.8] text-gray-300 pr-4 mt-3 select-text" style={{ fontSize: `${Math.round(fontSize * 0.54)}px` }}>
                         {v.english}
                       </p>
                     )}
                   </div>
                 );
               })}
            </div>
         </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#07090C] overflow-hidden flex flex-col"
    >
      {/* Warning/Confirmation modal for deselecting an ayah */}
      <AnimatePresence>
        {showDeselectConfirmFor !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeselectConfirmFor(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12161A] border border-[#B89C5D]/30 p-6 rounded-[24px] max-w-sm w-full mx-auto shadow-2xl relative z-20"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mb-2">
                  <Flag className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-white text-base font-extrabold">Deselect Verse Warning</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Aap is aayat ko unmark (deselect) kar rahe hain. Is Surah ki recitation progress peeche save ho jayegi. Kya aap sure hain?
                </p>
                
                <div className="flex items-center gap-3 w-full mt-4">
                  <button
                    onClick={() => setShowDeselectConfirmFor(null)}
                    className="flex-1 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    Nahi, Rehne Dein
                  </button>
                  <button
                    onClick={handleConfirmDeselect}
                    className="flex-1 py-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 transition-all text-xs font-bold cursor-pointer"
                  >
                    Haan, Deselect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {warningMessage !== null && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-4 right-4 z-[90] pointer-events-none flex justify-center"
          >
            <div className="bg-[#1A1212] border border-red-500/40 text-red-400 font-medium px-4 py-3 rounded-2xl text-[12px] shadow-lg max-w-md w-full flex items-center gap-2.5 backdrop-blur-md">
              <span className="text-red-500 font-extrabold text-sm">⚠️</span>
              <span>{warningMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surah Selection Modal */}
      <AnimatePresence>
        {isSurahSelectOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSurahSelectOpen(false);
                setSurahSearchQuery("");
              }}
              className="absolute inset-0 bg-white/20 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-3xl border border-white/70 rounded-[32px] max-w-md w-full mx-auto shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] relative z-[110] flex flex-col h-[75vh] ring-1 ring-black/5"
            >
              <div className="p-5 border-b border-slate-950/5 flex items-center justify-between bg-white/40 rounded-t-[32px]">
                <div>
                  <h3 className="text-slate-900 text-base font-extrabold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Quran Sharif Surahs
                  </h3>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Apni pasand ke mutabiq Surah select karein</p>
                </div>
                <button 
                  onClick={() => {
                    setIsSurahSelectOpen(false);
                    setSurahSearchQuery("");
                  }}
                  className="w-8 h-8 rounded-full bg-slate-950/5 text-slate-500 hover:text-slate-900 hover:bg-slate-950/10 flex items-center justify-center text-xs font-bold transition-all active:scale-95"
                >
                  ✕
                </button>
              </div>

              {/* iOS inspired translucent Search Bar */}
              <div className="px-5 py-3.5 border-b border-slate-950/5 bg-slate-50/50">
                <input
                  type="text"
                  placeholder="Surah search karein (e.g. Al-Baqarah, Imran)..."
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  className="w-full bg-white/90 border border-slate-950/10 rounded-2xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#B89C5D] transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar select-none">
                {loadedQuranData
                  .filter((s) => {
                    const query = surahSearchQuery.trim().toLowerCase();
                    if (!query) return true;
                    return (
                      s.surah.toLowerCase().includes(query) ||
                      s.arabicSurah.includes(query) ||
                      s.id.toString() === query
                    );
                  })
                  .map((s) => {
                    const savedRuko = localStorage.getItem(`noor_ai_ruko_verse_${s.surah}_${userEmail || 'guest'}`);
                    const lastReadVerse = savedRuko ? parseInt(savedRuko, 10) : 0;
                    const totalVerses = s.totalVerses || s.verses.length || 0;
                    const percentage = Math.min(100, Math.round((lastReadVerse / totalVerses) * 100));
                    const isCurrent = s.surah === currentPageData.surah;

                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          handleSelectSurah(s.surah);
                          setSurahSearchQuery("");
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-98 flex items-center justify-between gap-4 shadow-sm ${
                          isCurrent 
                            ? 'bg-[#B89C5D]/20 border-[#B89C5D] text-slate-950 ring-1 ring-[#B89C5D]/20 shadow-md' 
                            : 'bg-white/70 hover:bg-white/90 border-slate-950/5 text-slate-800 hover:border-slate-950/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            isCurrent ? 'bg-[#B89C5D] text-white animate-pulse' : 'bg-slate-950/5 text-slate-600'
                          }`}>
                            {s.id}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-black flex items-center gap-2 text-slate-900">
                              {s.surah}
                              <span className="text-[12px] font-bold text-[#9B7C3E] font-arabic leading-none mb-0.5" dir="rtl">
                                {s.arabicSurah}
                              </span>
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {totalVerses} Verses • Juz {s.juz}
                            </p>
                            
                            {/* Progress indicators */}
                            <div className="mt-2.5 flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-950/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-[#9B7C3E] font-extrabold font-mono whitespace-nowrap">
                                {lastReadVerse}/{totalVerses} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Select mark icon */}
                        {isCurrent && (
                          <div className="w-5 h-5 rounded-full bg-[#B89C5D] flex items-center justify-center text-white text-[10px] font-black shadow-sm shadow-[#B89C5D]/25">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ayah Selection Modal */}
      <AnimatePresence>
        {isAyahSelectOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAyahSelectOpen(false)}
              className="absolute inset-0 bg-white/20 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-3xl border border-white/70 rounded-[32px] max-w-md w-full mx-auto shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] relative z-[110] flex flex-col h-[75vh] ring-1 ring-black/5"
            >
              <div className="p-5 border-b border-slate-950/5 flex items-center justify-between bg-white/40 rounded-t-[32px]">
                <div>
                  <h3 className="text-slate-900 text-base font-extrabold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Surah {currentPageData.surah} Aayats
                  </h3>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Apni pasand ke mutabiq Aayat select karke wahan jump karein</p>
                </div>
                <button 
                  onClick={() => setIsAyahSelectOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-950/5 text-slate-500 hover:text-slate-900 hover:bg-slate-950/10 flex items-center justify-center text-xs font-bold transition-all active:scale-95"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar select-none bg-white/60">
                <div className="grid grid-cols-5 gap-3">
                  {Array.from(
                    { length: allSurahsMetadata.find(s => s.id === currentPageData.surahId)?.totalVerses || currentPageData.verses.length || 7 },
                    (_, i) => i + 1
                  ).map((num) => {
                    const savedRuko = localStorage.getItem(`noor_ai_ruko_verse_${currentPageData.surah}_${userEmail || 'guest'}`);
                    const rukoIndex = savedRuko ? parseInt(savedRuko, 10) : 0;
                    const isRead = num <= rukoIndex;
                    
                    return (
                      <button
                        key={num}
                        onClick={() => handleSelectAyah(num)}
                        className={`aspect-square w-full rounded-2xl font-black text-xs transition-all active:scale-95 border flex items-center justify-center shadow-sm ${
                          isRead 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.06)]' 
                            : 'bg-white hover:bg-slate-50 border-slate-200/70 text-slate-800 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 w-96 h-96 bg-green-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-[#B89C5D]/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-5 pb-4 bg-gradient-to-b from-[#0A0D10] via-[#0A0D10]/95 to-transparent backdrop-blur-sm pointer-events-auto gap-2">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md flex-shrink-0"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        {/* Side-by-side Selector Bar */}
        <div className="flex items-center gap-1 flex-1 max-w-[240px] justify-center bg-white/[0.03] border border-white/10 px-2 py-1 rounded-2xl">
          {/* Surah Selection on LEFT */}
          <div 
            onClick={() => setIsSurahSelectOpen(true)}
            className="flex-1 flex flex-col items-center cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded-xl active:scale-95 transition-all text-center select-none truncate min-w-0"
          >
            <span className="text-[#B89C5D] text-[8px] font-black uppercase tracking-wider mb-0.5">Surah</span>
            <span className="text-white font-black text-xs flex items-center gap-0.5 truncate w-full justify-center">
              {currentPageData.surah} <ChevronDown className="w-3 h-3 text-[#B89C5D] flex-shrink-0" />
            </span>
          </div>

          <div className="w-[1px] h-6 bg-white/10 flex-shrink-0" />

          {/* Ayah Selection on RIGHT */}
          <div 
            onClick={() => setIsAyahSelectOpen(true)}
            className="flex-1 flex flex-col items-center cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded-xl active:scale-95 transition-all text-center select-none truncate min-w-0"
          >
            <span className="text-[#B89C5D] text-[8px] font-black uppercase tracking-wider mb-0.5">Aayat</span>
            <span className="text-white font-black text-xs flex items-center gap-0.5 truncate w-full justify-center">
              {currentPageData.verses.length > 0 
                ? `${currentPageData.verses[0].id}-${currentPageData.verses[currentPageData.verses.length - 1].id}` 
                : "Aayat"} <ChevronDown className="w-3 h-3 text-[#B89C5D] flex-shrink-0" />
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md flex-shrink-0"
        >
          <Settings2 className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 z-40 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-20 right-4 z-50 w-64 bg-white/85 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-950/5">
                <h3 className="text-sm font-extrabold text-slate-800">Reading Preference</h3>
              </div>
              <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                {[
                  { id: 'arabic', label: 'Only Arabic' },
                  { id: 'urdu', label: 'Only Urdu' },
                  { id: 'english', label: 'Only English' },
                  { id: 'arabic_urdu', label: 'Arabic & Urdu' },
                  { id: 'arabic_english', label: 'Arabic & English' },
                  { id: 'all', label: 'Arabic, Urdu & English' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setReadingMode(mode.id as ReadingMode);
                      setIsSettingsOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      readingMode === mode.id 
                        ? 'bg-emerald-500/15 text-emerald-800 font-extrabold border border-emerald-500/20 shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-950/5 active:scale-98 border border-transparent'
                    }`}
                  >
                    {mode.label}
                    {readingMode === mode.id && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Swipeable Viewpager */}
      <div className="flex-1 relative w-full h-full overflow-hidden mt-10">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 }
            }}
            style={{ willChange: 'transform, opacity' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              // Right swipe (positive offset) goes to Next (+1) - Arabic layout
              const swipeThreshold = 50;
              const velocityThreshold = 500;
              
              if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                paginate(1);
              } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                paginate(-1);
              }
            }}
            id="quran-scroll-container"
            className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar touch-pan-y pt-14 pb-32"
          >
             {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0A0D10] via-[#0A0D10]/95 to-transparent flex flex-col items-center justify-end px-6 pb-6 z-30 pointer-events-auto">
         <div className="w-full flex items-center justify-center gap-8 mb-4">
            <button 
              onClick={() => paginate(-1)}
              disabled={page === 0}
              className={`text-[13px] font-medium px-5 py-2.5 rounded-full border transition-all ${page === 0 ? 'text-gray-600 border-gray-800' : 'text-[#B89C5D] border-[#B89C5D]/30 hover:bg-[#B89C5D]/10 active:scale-95 shadow-sm'}`}
            >
              Previous
            </button>
            <button 
              onClick={handleTogglePlay}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full border shadow-lg backdrop-blur-md cursor-pointer transition-all active:scale-95 ${
                isPlaying 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
               {isAudioLoading ? (
                 <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
               ) : isPlaying ? (
                 <PauseCircle className="w-5 h-5 text-emerald-400" />
               ) : (
                 <PlayCircle className="w-5 h-5 text-green-500" />
               )}
               <span className="text-white text-sm font-medium tracking-wide border-l border-white/20 pl-3">
                 {isAudioLoading ? "Loading..." : isPlaying ? "Pause" : "Play"}
               </span>
            </button>
            <button 
              onClick={() => paginate(1)}
              disabled={page === pagesData.length - 1}
              className={`text-[13px] font-medium px-5 py-2.5 rounded-full border transition-all ${page === pagesData.length - 1 ? 'text-gray-600 border-gray-800' : 'text-[#B89C5D] border-[#B89C5D]/30 hover:bg-[#B89C5D]/10 active:scale-95 shadow-sm'}`}
            >
              Next
            </button>
         </div>
         
         <div className="flex items-center gap-2 w-full justify-center opacity-80 mt-1">
           <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">
             Page {currentPageData.pageIndexForSurah} of {currentPageData.totalPagesForSurah}
           </span>
         </div>
      </div>
    </motion.div>
  );
}

