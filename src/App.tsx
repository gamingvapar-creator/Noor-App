/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Coins } from 'lucide-react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TabRow } from './components/TabRow';
import { CategoryList } from './components/CategoryList';
import { PopularSurahs } from './components/PopularSurahs';
import { TrendingNow } from './components/TrendingNow';
import { DailyVerse } from './components/DailyVerse';
import { ContinueReading } from './components/ContinueReading';
import { BottomNavigation } from './components/BottomNavigation';
import { QuranReader } from './components/QuranReader';
import { ProfileScreen } from './components/ProfileScreen';
import { NoorAI } from './components/NoorAI';
import { WelcomeFlow } from './components/WelcomeFlow';
import { TokenPurchase } from './components/TokenPurchase';
import { DownloadsScreen } from './components/DownloadsScreen';
import { Language } from './utils/i18n';
import { PreferencesSetup } from './components/PreferencesSetup';
import { allSurahsMetadata } from './data/allSurahs';
import { saveUserProgressToCloud, getUserProgressFromCloud } from './lib/firebase';

const MEDINAN_IDS = [2, 3, 4, 5, 8, 9, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110];

const getSurahRukuCount = (surahId: number): number => {
  const rukus: Record<number, number> = {
    1: 1, 2: 40, 3: 20, 4: 24, 5: 16, 6: 20, 7: 24, 8: 10, 9: 17, 10: 11,
    11: 10, 12: 12, 13: 6, 14: 7, 15: 6, 16: 16, 17: 12, 18: 12, 19: 6, 20: 8,
    21: 7, 22: 10, 23: 6, 24: 9, 25: 6, 26: 17, 27: 7, 28: 9, 29: 7, 30: 3,
    31: 4, 32: 3, 33: 9, 34: 6, 35: 4, 36: 5, 37: 5, 38: 5, 39: 8, 40: 9,
    41: 6, 42: 5, 43: 7, 44: 3, 45: 4, 46: 4, 47: 4, 48: 4, 49: 2, 50: 3,
    51: 3, 52: 2, 53: 3, 54: 3, 55: 3, 56: 3, 57: 4, 58: 3, 59: 3, 60: 2,
    61: 2, 62: 2, 63: 2, 64: 2, 65: 2, 66: 2, 67: 2, 68: 2, 69: 2, 70: 2,
    71: 2, 72: 2, 73: 2, 74: 2, 75: 2, 76: 2, 77: 3, 78: 2, 79: 2, 80: 1,
    81: 1, 82: 1, 83: 1, 84: 1, 85: 1, 86: 1, 87: 1, 88: 1, 89: 1, 90: 1,
    91: 1, 92: 1, 93: 1, 94: 1, 95: 1, 96: 1, 97: 1, 98: 1, 99: 1, 100: 1,
    101: 1, 102: 1, 103: 1, 104: 1, 105: 1, 106: 1, 107: 1, 108: 1, 109: 1, 110: 1,
    111: 1, 112: 1, 113: 1, 114: 1
  };
  return rukus[surahId] || 1;
};

const JUZ_METADATA = [
  { num: 1, name: "Alif Lam Meem", Arabic: "آلم", startSurah: "Al-Faatiha", startSurahId: 1 },
  { num: 2, name: "Sayaqool", Arabic: "سيقول", startSurah: "Al-Baqarah", startSurahId: 2 },
  { num: 3, name: "Tilkal Rusul", Arabic: "تلك الرسل", startSurah: "Al-Baqarah", startSurahId: 2 },
  { num: 4, name: "Lan Tanaloo", Arabic: "لن تنالوا", startSurah: "Al-E-Imran", startSurahId: 3 },
  { num: 5, name: "Wal Muhsanat", Arabic: "والمحصنات", startSurah: "An-Nisa", startSurahId: 4 },
  { num: 6, name: "La Yuhibbullah", Arabic: "لا يحب الله", startSurah: "An-Nisa", startSurahId: 4 },
  { num: 7, name: "Wa Iza Sami'oo", Arabic: "وإذا سمعوا", startSurah: "Al-Ma'idah", startSurahId: 5 },
  { num: 8, name: "Wa Lau Annana", Arabic: "ولو أننا", startSurah: "Al-An'am", startSurahId: 6 },
  { num: 9, name: "Qal Al-Mala'u", Arabic: "قال الملأ", startSurah: "Al-A'raf", startSurahId: 7 },
  { num: 10, name: "Wa'lamoo", Arabic: "واعلموا", startSurah: "Al-Anfal", startSurahId: 8 },
  { num: 11, name: "Ya'taziroon", Arabic: "يعتذرون", startSurah: "At-Tawbah", startSurahId: 9 },
  { num: 12, name: "Wa Ma Min Dabbatin", Arabic: "وما من دابة", startSurah: "Hud", startSurahId: 11 },
  { num: 13, name: "Wa Ma Ubarri'u", Arabic: "وما أبرئ", startSurah: "Yusuf", startSurahId: 12 },
  { num: 14, name: "Rubama", Arabic: "ربما", startSurah: "Al-Hijr", startSurahId: 15 },
  { num: 15, name: "Subhanallazi", Arabic: "سبحان الذي", startSurah: "Al-Isra", startSurahId: 17 },
  { num: 16, name: "Qal Alam", Arabic: "قال ألم", startSurah: "Al-Kahf", startSurahId: 18 },
  { num: 17, name: "Aqtaraba", Arabic: "اقترب", startSurah: "Al-Anbiya", startSurahId: 21 },
  { num: 18, name: "Qad Aflaha", Arabic: "قد أفلح", startSurah: "Al-Mu'minun", startSurahId: 23 },
  { num: 19, name: "Wa Qalallazina", Arabic: "وقال الذين", startSurah: "Al-Furqan", startSurahId: 25 },
  { num: 20, name: "Amman Khalaqa", Arabic: "أمن خلق", startSurah: "An-Naml", startSurahId: 27 },
  { num: 21, name: "Utlu Ma Oohiya", Arabic: "اتل ما أوحي", startSurah: "Al-Ankabut", startSurahId: 29 },
  { num: 22, name: "Wa Man Yaqnut", Arabic: "ومن يقنت", startSurah: "Al-Ahzab", startSurahId: 33 },
  { num: 23, name: "Wa Maliya", Arabic: "ومالي", startSurah: "Ya-Sin", startSurahId: 36 },
  { num: 24, name: "Faman Azlam", Arabic: "फमन अज़लम", startSurah: "Az-Zumar", startSurahId: 39 },
  { num: 25, name: "Ilayhi Yuraddu", Arabic: "إليه يرد", startSurah: "Fussilat", startSurahId: 41 },
  { num: 26, name: "Ha Meem", Arabic: "حم", startSurah: "Al-Ahqaf", startSurahId: 46 },
  { num: 27, name: "Qala Fama Khatbukum", Arabic: "قال فما خطبكم", startSurah: "Adh-Dhariyat", startSurahId: 51 },
  { num: 28, name: "Qad Sami'allah", Arabic: "قد سمع الله", startSurah: "Al-Mujadilah", startSurahId: 58 },
  { num: 29, name: "Tabarakallazi", Arabic: "تبارك الذي", startSurah: "Al-Mulk", startSurahId: 67 },
  { num: 30, name: "Amma", Arabic: "عم", startSurah: "An-Naba", startSurahId: 78 }
];

export default function App() {
  const [isQuranOpen, setIsQuranOpen] = useState(false);
  
  // Home Page Audio states
  const [homePlayingSurahId, setHomePlayingSurahId] = useState<number | null>(null);
  const [isHomePlaying, setIsHomePlaying] = useState<boolean>(false);
  const homeAudioRef = useRef<HTMLAudioElement | null>(null);

  const [quranInitialSurahId, setQuranInitialSurahId] = useState<number | undefined>(undefined);
  const [quranAutoPlay, setQuranAutoPlay] = useState<boolean>(false);

  const handlePlayHomeSurah = (surahId: number) => {
    if (homePlayingSurahId === surahId) {
      if (isHomePlaying) {
        homeAudioRef.current?.pause();
        setIsHomePlaying(false);
      } else {
        homeAudioRef.current?.play().catch(e => console.log("Audio play error", e));
        setIsHomePlaying(true);
      }
    } else {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
      }
      
      const surahIdStr = String(surahId).padStart(3, '0');
      const audioUrl = surahId === 1
        ? `https://www.image2url.com/r2/default/audio/1782127158574-c1c666e9-206e-4269-b51d-f43159885651.mp3`
        : `https://server8.mp3quran.net/afs/${surahIdStr}.mp3`;
        
      const audio = new Audio(audioUrl);
      homeAudioRef.current = audio;
      setHomePlayingSurahId(surahId);
      setIsHomePlaying(true);
      
      audio.play().catch(e => console.log("Audio play error", e));
      
      audio.addEventListener('ended', () => {
        setIsHomePlaying(false);
        setHomePlayingSurahId(null);
      });
    }
  };

  const handleStopHomeAudio = () => {
    if (homeAudioRef.current) {
      homeAudioRef.current.pause();
    }
    setIsHomePlaying(false);
    setHomePlayingSurahId(null);
  };

  const handleOpenQuranWithSurah = (surahId?: number, autoplay: boolean = false) => {
    if (homeAudioRef.current) {
      homeAudioRef.current.pause();
    }
    setIsHomePlaying(false);
    setHomePlayingSurahId(null);

    // If opening without a specific surah (like from bottom tab), jump directly to last seen place!
    if (surahId === undefined) {
      const savedSurahId = localStorage.getItem(`noor_ai_last_read_surah_id_${userEmail || 'guest'}`);
      if (savedSurahId) {
        surahId = parseInt(savedSurahId, 10);
      } else {
        surahId = 1; // Default to Fatiha if nothing read yet
      }
    }

    setQuranInitialSurahId(surahId);
    setQuranAutoPlay(autoplay);
    setIsQuranOpen(true);
  };

  useEffect(() => {
    if (isQuranOpen && homeAudioRef.current) {
      homeAudioRef.current.pause();
      setIsHomePlaying(false);
    }
  }, [isQuranOpen]);

  useEffect(() => {
    return () => {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
      }
    };
  }, []);
  const [activeTab, setActiveTab] = useState('Home');
  const [homeTab, setHomeTab] = useState<number>(0); // 0=Trending, 1=Surah, 2=Juz, 3=Audio, 4=Bookmarks
  const [homeCategory, setHomeCategory] = useState<number>(0); // 0=All, 1=Meccan, 2=Medinan, 3=Para, 4=Ruku
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleHomeCategoryChange = (idx: number) => {
    setHomeCategory(idx);
    if (idx === 3) {
      setHomeTab(2); // Juz/Para selected, redirect to Juz tab
      setHomeCategory(0);
    } else if (idx !== 0 && homeTab === 0) {
      setHomeTab(1); // Filter selected on Trending tab, redirect to Surah tab
    }
  };

  const [fontSize, setFontSize] = useState(24);
  const [isDarkMode, setIsDarkMode] = useState(false); // Locked to light theme as requested!
  const [isBuyScreenOpen, setIsBuyScreenOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('noor_ai_language') as Language) || 'English';
  });
  const [showPreferencesSetup, setShowPreferencesSetup] = useState<boolean>(() => {
    return localStorage.getItem('noor_ai_preferences_set') !== 'true';
  });

  // Authentication State
  const [welcomeState, setWelcomeState] = useState<'welcome' | 'login' | 'app'>(() => {
    return localStorage.getItem('noor_ai_has_logged_in') === 'true' ? 'app' : 'welcome';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('noor_ai_user_name') || 'Faiz';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('noor_ai_user_email') || 'faiz@gmail.com';
  });

  // Token Quota and permanent premium setup
  const [userTokens, setUserTokens] = useState<number>(() => {
    const savedTokens = localStorage.getItem('noor_ai_tokens');
    return savedTokens !== null ? Number(savedTokens) : 25; // default 25 daily quota
  });

  const [isInfiniteTokens, setIsInfiniteTokens] = useState<boolean>(() => {
    return localStorage.getItem('noor_ai_is_infinite_tokens') === 'true';
  });

  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "1",
      role: "ai",
      content: "Assalamu Alaikum! I am Noor AI. You can ask me anything about Islam, and I will find the answers from the Quran for you.",
    },
  ]);
  const [tajweedColors, setTajweedColors] = useState({
    ghunnah: '#22c55e',
    qalqalah: '#3b82f6',
    ikhfa: '#ef4444',
    idgham: '#f97316',
    iqlab: '#8b5cf6',
    madd: '#ec4899',
    silent: '#9ca3af',
  });

  // Google Cloud Synchronizer Engine
  const syncProgressToCloud = async (overrideTokens?: number, overrideInfinite?: boolean) => {
    if (!userEmail || userEmail === "guest") return;
    try {
      const bookmarks: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("noor_ai_ruko_") || key.startsWith("noor_ai_last_read_"))) {
          const val = localStorage.getItem(key);
          if (val) bookmarks[key] = val;
        }
      }
      await saveUserProgressToCloud(userEmail, {
        userName,
        tokens: overrideTokens !== undefined ? overrideTokens : userTokens,
        isInfinite: overrideInfinite !== undefined ? overrideInfinite : isInfiniteTokens,
        bookmarks
      });
    } catch (err) {
      console.error("Cloud sync failed in background", err);
    }
  };

  // Pull progress from Cloud Firestore upon authentication / load
  useEffect(() => {
    if (userEmail && userEmail !== "guest" && welcomeState === 'app') {
      const loadProfileFromCloud = async () => {
        try {
          const cloudData = await getUserProgressFromCloud(userEmail);
          if (cloudData) {
            if (cloudData.tokens !== undefined) {
              setUserTokens(cloudData.tokens);
              localStorage.setItem('noor_ai_tokens', cloudData.tokens.toString());
            }
            if (cloudData.isInfinite !== undefined) {
              setIsInfiniteTokens(cloudData.isInfinite);
              localStorage.setItem('noor_ai_is_infinite_tokens', cloudData.isInfinite.toString());
            }
            if (cloudData.bookmarks) {
              Object.entries(cloudData.bookmarks).forEach(([key, val]) => {
                localStorage.setItem(key, String(val));
              });
            }
            if (cloudData.userName) {
              setUserName(cloudData.userName);
              localStorage.setItem('noor_ai_user_name', cloudData.userName);
            }
          }
        } catch (err) {
          console.error("Failed to recover cloud progress:", err);
        }
      };
      loadProfileFromCloud();
    }
  }, [userEmail, welcomeState]);

  // Back up progress on key updates
  useEffect(() => {
    if (welcomeState === 'app') {
      syncProgressToCloud();
    }
  }, [userTokens, isInfiniteTokens, welcomeState]);

  useEffect(() => {
    // ALWAYS force light theme
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    
    // Update theme-color meta tag for mobile notification and navigation bar
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    // Change to #ffffff for light mode
    themeColorMeta.setAttribute('content', '#ffffff');
  }, [isDarkMode]);

  // Synchronize dynamic user settings back to localStorage
  useEffect(() => {
    localStorage.setItem('noor_ai_tokens', userTokens.toString());
  }, [userTokens]);

  useEffect(() => {
    localStorage.setItem('noor_ai_is_infinite_tokens', isInfiniteTokens.toString());
  }, [isInfiniteTokens]);

  // Daily token reset check: if calendar day changes, reset token to exactly 25 for free users (no rollover)
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastResetDate = localStorage.getItem('noor_ai_last_reset_date');
    if (lastResetDate !== todayStr) {
      if (!isInfiniteTokens) {
        setUserTokens(25);
        localStorage.setItem('noor_ai_tokens', '25');
      }
      localStorage.setItem('noor_ai_last_reset_date', todayStr);
    }
  }, [isInfiniteTokens]);

  const handleLoginSuccess = async (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    localStorage.setItem('noor_ai_user_name', name);
    localStorage.setItem('noor_ai_user_email', email);
    localStorage.setItem('noor_ai_is_guest', 'false');
    localStorage.setItem('noor_ai_has_logged_in', 'true');
    setWelcomeState('app');

    // Pre-emptively restore if cloud has better data or sync immediately
    try {
      const cloudData = await getUserProgressFromCloud(email);
      if (cloudData) {
        if (cloudData.tokens !== undefined) {
          setUserTokens(cloudData.tokens);
          localStorage.setItem('noor_ai_tokens', cloudData.tokens.toString());
        }
        if (cloudData.isInfinite !== undefined) {
          setIsInfiniteTokens(cloudData.isInfinite);
          localStorage.setItem('noor_ai_is_infinite_tokens', cloudData.isInfinite.toString());
        }
        if (cloudData.bookmarks) {
          Object.entries(cloudData.bookmarks).forEach(([key, val]) => {
            localStorage.setItem(key, String(val));
          });
        }
        if (cloudData.userName) {
          setUserName(cloudData.userName);
          localStorage.setItem('noor_ai_user_name', cloudData.userName);
        }
      } else {
        // First-time sync
        await saveUserProgressToCloud(email, {
          userName: name,
          tokens: userTokens,
          isInfinite: isInfiniteTokens,
          bookmarks: {}
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkipLogin = () => {
    setUserName("Mehmaan (Guest)");
    setUserEmail("guest");
    localStorage.setItem('noor_ai_user_name', "Mehmaan (Guest)");
    localStorage.setItem('noor_ai_user_email', "guest");
    localStorage.setItem('noor_ai_is_guest', 'true');
    localStorage.setItem('noor_ai_has_logged_in', 'true');
    setWelcomeState('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('noor_ai_has_logged_in');
    localStorage.removeItem('noor_ai_user_name');
    localStorage.removeItem('noor_ai_user_email');
    localStorage.removeItem('noor_ai_tokens');
    localStorage.removeItem('noor_ai_is_guest');
    localStorage.removeItem('noor_ai_is_infinite_tokens');
    setWelcomeState('welcome');
    setUserTokens(25);
    setIsInfiniteTokens(false);
  };

  const handleBuySuccess = (added: number, infinite?: boolean) => {
    if (infinite) {
      setIsInfiniteTokens(true);
      setUserTokens(999999); // infinity threshold
    } else {
      setUserTokens((prev) => prev + added);
    }
  };

  // Filter core surahs in real-time based on search query, Meccan/Medinan types, and sorting rules
  const filteredSurahs = allSurahsMetadata.filter((s) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = s.surah.toLowerCase().includes(q);
      const matchAr = s.arabicSurah.includes(q);
      const matchId = String(s.id) === q;
      if (!matchName && !matchAr && !matchId) return false;
    }
    if (homeCategory === 1) { // Meccan filter
      return !MEDINAN_IDS.includes(s.id);
    }
    if (homeCategory === 2) { // Medinan filter
      return MEDINAN_IDS.includes(s.id);
    }
    return true;
  });

  // If Ruku filter (4) is chosen, sort surahs by their Rukus counts so they are in premium sorted lists
  const sortedFilteredSurahs = [...filteredSurahs];
  if (homeCategory === 4) {
    sortedFilteredSurahs.sort((a, b) => getSurahRukuCount(b.id) - getSurahRukuCount(a.id));
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-black dark:text-white selection:bg-green-500/30 font-sans flex items-center justify-center transition-colors duration-500">
      <div className="w-full max-w-md mx-auto relative bg-white dark:bg-[#0A0D10] h-[100dvh] shadow-2xl overflow-hidden border-x border-slate-200 dark:border-white/5 sm:rounded-2xl sm:h-[90vh] transition-colors duration-500 flex flex-col">
        
        {welcomeState !== 'app' ? (
          <WelcomeFlow onLoginComplete={handleLoginSuccess} onSkipLogin={handleSkipLogin} />
        ) : (
          <>
            <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden pt-safe pb-safe">
              <AnimatePresence mode="wait">
                {activeTab !== 'Noor AI' ? (
                  <motion.div
                    key="normal-tabs"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 35, transition: { duration: 0.25 } }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="w-full h-full flex-1 overflow-y-auto no-scrollbar pb-32"
                  >
                    {activeTab === 'Home' && (
                      <>
                        <Header userName={userName} language={language} />
                        <SearchBar language={language} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        <TabRow language={language} activeTab={homeTab} setActiveTab={(idx) => { setHomeTab(idx); setHomeCategory(0); }} />
                        <CategoryList language={language} activeIdx={homeCategory} setActiveIdx={handleHomeCategoryChange} />
                        
                        <div className="px-4 pb-12">
                          {/* Tab 0: Trending dashboard */}
                          {homeTab === 0 && (
                            <>
                              <PopularSurahs 
                                language={language} 
                                onPlaySurah={handlePlayHomeSurah}
                                playingSurahId={homePlayingSurahId}
                                isHomePlaying={isHomePlaying}
                              />
                              <TrendingNow 
                                language={language} 
                                onPlaySurah={handlePlayHomeSurah}
                                playingSurahId={homePlayingSurahId}
                                isHomePlaying={isHomePlaying}
                              />
                              <DailyVerse language={language} />
                              <ContinueReading onOpenQuran={() => handleOpenQuranWithSurah(undefined, false)} userEmail={userEmail} language={language} />
                            </>
                          )}

                          {/* Tab 1: Surah Tab (Line by Line list of 114 Surahs with Play actions and Quran reader links) */}
                          {homeTab === 1 && (
                            <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-500 dark:text-[#B89C5D] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span>📖</span> {language === 'Hindi' ? "सभी सुराह" : language === 'Urdu' ? "تمام سورتیں" : language === 'Arabic' ? "السور" : "All Surahs"}
                                <span className="bg-slate-200 dark:bg-white/10 text-[10px] font-black px-2 py-0.5 rounded-full text-slate-700 dark:text-gray-300">
                                  {sortedFilteredSurahs.length}
                                </span>
                              </h3>
                              {sortedFilteredSurahs.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-white dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                  <p className="text-sm text-slate-400 font-bold">No Surahs match your filters/search.</p>
                                </div>
                              ) : (
                                sortedFilteredSurahs.map((surah) => {
                                  const isCurrentPlaying = homePlayingSurahId === surah.id && isHomePlaying;
                                  return (
                                    <div 
                                      key={surah.id} 
                                      className="relative flex items-center justify-between p-4 bg-white dark:bg-[#161C23] border border-slate-100 dark:border-white/5 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-sm mb-3 group"
                                    >
                                      <div 
                                        className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0" 
                                        onClick={() => handleOpenQuranWithSurah(surah.id, false)}
                                      >
                                        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                                          <div className="absolute inset-0 bg-emerald-500/10 dark:bg-[#B89C5D]/10 border-2 border-emerald-600/70 dark:border-[#B89C5D]/40 rounded-xl transform rotate-45 transition-transform group-hover:rotate-90 duration-500" />
                                          <span className="relative text-xs font-black text-slate-800 dark:text-white z-10">{surah.id}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 font-sans">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{surah.surah}</h4>
                                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 dark:bg-[#B89C5D]/20 text-emerald-800 dark:text-[#B89C5D] font-black uppercase tracking-wider">
                                              {!MEDINAN_IDS.includes(surah.id) ? "Meccan" : "Medinan"}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-none mt-1 uppercase tracking-wider">
                                            {surah.totalVerses} Ayahs • Juz {surah.juz} • {getSurahRukuCount(surah.id)} Rukus
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 pl-2 flex-shrink-0">
                                        <span className="text-lg font-arabic text-[#B89C5D] font-medium leading-none drop-shadow-sm">{surah.arabicSurah}</span>
                                        <button 
                                          onClick={() => handlePlayHomeSurah(surah.id)}
                                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 cursor-pointer shadow-md ${
                                            isCurrentPlaying
                                              ? "bg-emerald-500 text-white border-emerald-500"
                                              : "bg-emerald-600/10 hover:bg-emerald-600 dark:bg-green-500/20 dark:hover:bg-green-500 text-emerald-750 hover:text-white dark:text-green-500 dark:hover:text-black border-emerald-500/30"
                                          }`}
                                        >
                                          {isCurrentPlaying ? (
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                            </svg>
                                          ) : (
                                            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z"/>
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* Tab 2: Juz Tab (Para list 1 to 30 with smart jump points) */}
                          {homeTab === 2 && (
                            <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-500 dark:text-[#B89C5D] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span>🕋</span> {language === 'Hindi' ? "सभी जुज़ / पारा" : language === 'Urdu' ? "تمام پارے" : language === 'Arabic' ? "الأجزاء" : "All Juz / Paras"}
                              </h3>
                              {JUZ_METADATA.filter(juz => {
                                if (searchQuery.trim() === "") return true;
                                const q = searchQuery.toLowerCase();
                                return juz.name.toLowerCase().includes(q) || juz.Arabic.includes(q) || String(juz.num) === q || juz.startSurah.toLowerCase().includes(q);
                              }).map((juz) => {
                                const isCurrentPlaying = homePlayingSurahId === juz.startSurahId && isHomePlaying;
                                return (
                                  <div 
                                    key={juz.num} 
                                    className="relative flex items-center justify-between p-4 bg-white dark:bg-[#161C23] border border-slate-100 dark:border-white/5 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-sm mb-3 group"
                                  >
                                    <div 
                                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0" 
                                      onClick={() => handleOpenQuranWithSurah(juz.startSurahId, false)}
                                    >
                                      <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <div className="absolute inset-0 bg-[#B89C5D]/10 dark:bg-yellow-500/10 border border-[#B89C5D]/40 dark:border-yellow-500/55 rounded-full" />
                                        <span className="relative text-xs font-black text-[#B89C5D] dark:text-yellow-500 z-10">{juz.num}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{juz.name}</h4>
                                        <p className="text-[10px] text-emerald-605 dark:text-green-500 font-bold leading-none mt-1 uppercase tracking-wider">
                                          Starts at {juz.startSurah}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 pl-2 flex-shrink-0">
                                      <span className="text-lg font-arabic text-slate-705 dark:text-gray-300 leading-none">{juz.Arabic}</span>
                                      <button 
                                        onClick={() => handlePlayHomeSurah(juz.startSurahId)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 cursor-pointer shadow-md ${
                                          isCurrentPlaying
                                            ? "bg-emerald-500 text-white border-emerald-500"
                                            : "bg-emerald-600/10 hover:bg-emerald-600 dark:bg-green-500/20 dark:hover:bg-green-500 text-emerald-755 hover:text-white dark:text-green-500 dark:hover:text-black border-emerald-500/30"
                                        }`}
                                      >
                                        {isCurrentPlaying ? (
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                          </svg>
                                        ) : (
                                          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Tab 3: Audio Tab (Optimized audio listing of Suras starting from Fatiha) */}
                          {homeTab === 3 && (
                            <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-500 dark:text-[#B89C5D] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span>🎧</span> {language === 'Hindi' ? "ऑडियो कुरान" : language === 'Urdu' ? "آڈیو قرآن" : language === 'Arabic' ? "القرآن المسموع" : "Audio Quran Player"}
                              </h3>
                              {sortedFilteredSurahs.map((surah) => {
                                const isCurrentPlaying = homePlayingSurahId === surah.id && isHomePlaying;
                                return (
                                  <div 
                                    key={surah.id} 
                                    className={`relative flex items-center justify-between p-4 border rounded-3xl transition-all duration-300 shadow-sm mb-3 group cursor-pointer ${
                                      isCurrentPlaying
                                        ? "bg-emerald-500/[0.04] dark:bg-green-500/[0.04] border-emerald-500/40"
                                        : "bg-white dark:bg-[#161C23] border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                                    }`}
                                    onClick={() => handlePlayHomeSurah(surah.id)}
                                  >
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                      {/* Audio Disc Visual Animation or Track Num */}
                                      <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        {isCurrentPlaying ? (
                                          <div className="flex items-end gap-0.5 h-4">
                                            <div className="w-1 bg-emerald-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                                            <div className="w-1 bg-emerald-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }} />
                                            <div className="w-1 bg-emerald-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
                                            <div className="w-1 bg-emerald-500 rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }} />
                                          </div>
                                        ) : (
                                          <>
                                            <div className="absolute inset-0 bg-slate-100 dark:bg-black/40 rounded-full border border-slate-200/50 dark:border-white/5" />
                                            <span className="relative text-xs font-mono font-bold text-slate-500 dark:text-gray-400 z-10">{surah.id}</span>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black truncate ${isCurrentPlaying ? "text-emerald-600 dark:text-green-500" : "text-slate-900 dark:text-white"}`}>{surah.surah}</h4>
                                        <p className="text-[10px] text-gray-505 dark:text-gray-400 font-bold leading-none mt-1 uppercase tracking-wider">
                                          Mishary Al-Afasy Recitation • {surah.totalVerses} Ayahs
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3.5 pl-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                      <span className="text-lg font-arabic text-[#B89C5D] drop-shadow-sm">{surah.arabicSurah}</span>
                                      <button 
                                        onClick={() => handlePlayHomeSurah(surah.id)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 cursor-pointer shadow-md ${
                                          isCurrentPlaying
                                            ? "bg-emerald-500 text-white border-emerald-500"
                                            : "bg-emerald-600/10 hover:bg-emerald-600 dark:bg-green-500/20 dark:hover:bg-green-500 text-emerald-750 hover:text-white dark:text-green-500 dark:hover:text-black border-emerald-500/30"
                                        }`}
                                      >
                                        {isCurrentPlaying ? (
                                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                          </svg>
                                        ) : (
                                          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Tab 4: Bookmarks Tab (Fully functional user bookmarks based on marked positions!) */}
                          {homeTab === 4 && (
                            <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-500 dark:text-[#B89C5D] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span>🔖</span> {language === 'Hindi' ? "आपके बुकमार्क" : language === 'Urdu' ? "آپ کے بک مارکس" : language === 'Arabic' ? "علاماتك المرجعية" : "Your Saved Quran Bookmarks"}
                              </h3>
                              {(() => {
                                // Accumulate all surahs that have saved progress inside localStorage
                                const bookmarkedSuras = allSurahsMetadata.map(s => {
                                  const savedRuko = localStorage.getItem(`noor_ai_ruko_verse_${s.surah}_${userEmail || 'guest'}`);
                                  return {
                                    ...s,
                                    savedVerseIndex: savedRuko ? parseInt(savedRuko, 10) : null
                                  };
                                }).filter(item => {
                                  if (item.savedVerseIndex === null) return false;
                                  if (searchQuery.trim() === "") return true;
                                  return item.surah.toLowerCase().includes(searchQuery.toLowerCase());
                                });

                                if (bookmarkedSuras.length === 0) {
                                  return (
                                    <div className="text-center py-12 px-6 bg-white dark:bg-[#161C23] border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm">
                                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                      </div>
                                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">No Bookmarks Saved Yet</h4>
                                      <p className="text-[11px] text-slate-500 dark:text-gray-400 max-w-[240px] mx-auto mb-4 font-bold leading-normal">
                                        Jab aap Quran read karein, to verse index block par tap karke green ruko mark karein. Aapka read-history yahan dikhega!
                                      </p>
                                      <button 
                                        onClick={() => { setHomeTab(1); }}
                                        className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95 text-center mt-2"
                                      >
                                        Start Reading Now
                                      </button>
                                    </div>
                                  );
                                }

                                return bookmarkedSuras.map((bm) => {
                                  const isCurrentPlaying = homePlayingSurahId === bm.id && isHomePlaying;
                                  return (
                                    <div 
                                      key={bm.id} 
                                      className="relative flex items-center justify-between p-4 bg-white dark:bg-[#161C23] border border-emerald-500/15 dark:border-green-500/15 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-300 shadow-sm mb-3 group"
                                    >
                                      <div 
                                        className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0" 
                                        onClick={() => handleOpenQuranWithSurah(bm.id, false)}
                                      >
                                        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0 bg-emerald-500/10 dark:bg-green-500/10 rounded-2xl">
                                          <svg className="w-5 h-5 text-emerald-600 dark:text-green-500 fill-emerald-500/20" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                          </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{bm.surah}</h4>
                                          <p className="text-[10px] text-[#B89C5D] dark:text-[#B89C5D] font-bold leading-none mt-1 uppercase tracking-wider">
                                            Read upto: Ayah {bm.savedVerseIndex}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <button 
                                          onClick={() => handleOpenQuranWithSurah(bm.id, false)}
                                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-550 text-white text-[11px] font-black shadow-md cursor-pointer transition-transform active:scale-95"
                                        >
                                          Resume
                                        </button>
                                        <button 
                                          onClick={() => handlePlayHomeSurah(bm.id)}
                                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 cursor-pointer shadow-md ${
                                            isCurrentPlaying
                                              ? "bg-emerald-500 text-white border-emerald-500"
                                              : "bg-emerald-600/10 hover:bg-emerald-600 dark:bg-green-500/20 dark:hover:bg-green-500 text-emerald-755 hover:text-white dark:text-green-500 dark:hover:text-black border-emerald-500/30"
                                          }`}
                                        >
                                          {isCurrentPlaying ? (
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                            </svg>
                                          ) : (
                                            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z"/>
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {activeTab === 'Me' && (
                      <ProfileScreen 
                        userName={userName}
                        userEmail={userEmail}
                        onLogout={handleLogout}
                        fontSize={fontSize} 
                        setFontSize={setFontSize} 
                        tajweedColors={tajweedColors}
                        setTajweedColors={setTajweedColors}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                        language={language}
                        setLanguage={setLanguage}
                      />
                    )}
                    {activeTab === 'Downloads' && (
                      <DownloadsScreen language={language} />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="noor-ai-fullscreen"
                    initial={{ opacity: 0, y: 150 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 150 }}
                    transition={{ type: "spring", damping: 28, stiffness: 240 }}
                    className="w-full h-full flex-1 overflow-hidden"
                  >
                    <NoorAI 
                      messages={chatMessages} 
                      setMessages={setChatMessages} 
                      userTokens={userTokens}
                      setUserTokens={setUserTokens}
                      isInfiniteTokens={isInfiniteTokens}
                      onOpenBuy={() => setIsBuyScreenOpen(true)}
                      onBack={() => setActiveTab('Home')}
                      language={language}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <AnimatePresence>
              {activeTab !== 'Noor AI' && (
                <motion.div
                  key="bottom-bar-nav"
                  initial={{ y: 95, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 95, opacity: 0 }}
                  transition={{ type: "spring", damping: 24, stiffness: 220 }}
                  className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
                >
                  <BottomNavigation 
                    onOpenQuran={() => handleOpenQuranWithSurah(undefined, false)} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Bottom Player for Home Page Playing */}
            <AnimatePresence>
              {homePlayingSurahId !== null && activeTab === 'Home' && (
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 50, opacity: 0, scale: 0.9 }}
                  className="absolute bottom-24 left-4 right-4 z-40 bg-zinc-900 border border-white/10 dark:bg-zinc-950 p-3 rounded-2xl flex items-center justify-between text-white shadow-xl pointer-events-auto"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" 
                    onClick={() => handleOpenQuranWithSurah(homePlayingSurahId, true)}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center relative overflow-hidden flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }}>
                      <div className="absolute w-2 h-2 rounded-full bg-zinc-900 border border-white/25 z-10" />
                      <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12.5px] font-black truncate text-white">
                        {allSurahsMetadata.find(s => s.id === homePlayingSurahId)?.surah || 'Quran Recitation'}
                      </h4>
                      <p className="text-[9.5px] text-gray-400 font-bold truncate leading-none mt-0.5 uppercase tracking-wider">
                        Mishary Al-Afasy • Tap to read / listen
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button 
                      onClick={() => handlePlayHomeSurah(homePlayingSurahId)}
                      className="w-8 h-8 rounded-full bg-emerald-600/90 text-white hover:bg-emerald-500 active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-md"
                    >
                      {isHomePlaying ? (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={handleStopHomeAudio}
                      className="w-8 h-8 rounded-full bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        <AnimatePresence>
          {isQuranOpen && (
            <QuranReader 
              onClose={() => setIsQuranOpen(false)} 
              fontSize={fontSize} 
              userEmail={userEmail} 
              tajweedColors={tajweedColors} 
              initialSurahId={quranInitialSurahId}
              autoPlay={quranAutoPlay}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPreferencesSetup && (
            <PreferencesSetup 
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              language={language}
              setLanguage={setLanguage}
              onComplete={() => setShowPreferencesSetup(false)}
            />
          )}
        </AnimatePresence>

        {isBuyScreenOpen && (
          <TokenPurchase 
            currentTokens={isInfiniteTokens ? 999999 : userTokens} 
            onClose={() => setIsBuyScreenOpen(false)} 
            onBuySuccess={handleBuySuccess} 
          />
        )}
      </div>
    </div>
  );
}
