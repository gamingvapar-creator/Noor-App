import { Home, Sparkles, Download, User, BookOpen } from 'lucide-react';
import { translations, Language } from '../utils/i18n';

interface BottomNavigationProps {
  onOpenQuran?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language?: Language;
}

export function BottomNavigation({ onOpenQuran, activeTab, setActiveTab, language = 'English' }: BottomNavigationProps) {
  const tSet = translations[language];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none" id="bottom-navigation-wrapper">
      <div className="max-w-md mx-auto w-full relative pointer-events-auto h-[90px]">
        
        {/* Glow behind FAB */}
        <div className="absolute left-1/2 -top-10 -ml-[50px] w-[100px] h-[100px] bg-emerald-500/10 dark:bg-green-500/20 rounded-full blur-[25px]"></div>
        <div className="absolute left-1/2 -top-6 -ml-[35px] w-[70px] h-[70px] bg-amber-500/5 dark:bg-yellow-500/10 rounded-full blur-[20px]"></div>
        
        {/* FAB */}
        <div 
          onClick={onOpenQuran}
          className="absolute left-1/2 -top-8 -ml-[42px] w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-[#B89C5D] p-[1.5px] shadow-[0_4px_22px_rgba(16,185,129,0.15)] dark:shadow-[0_4px_25px_rgba(16,185,129,0.45)] cursor-pointer group z-20 active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-[#F4F6F4] dark:from-[#12161A] dark:to-[#0A0D10] border border-emerald-500/30 dark:border-green-500/50 p-2 flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/60 dark:group-hover:border-green-400 transition-colors duration-300">
             
             {/* Inner glowing ring */}
             <div className="absolute inset-0 rounded-full border border-emerald-500/15 dark:border-yellow-500/20 m-1.5 opacity-50"></div>
             <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-md"></div>
             
             {/* Center icon container */}
             <div className="w-full h-full rounded-full bg-emerald-50/80 dark:bg-gradient-to-br dark:from-green-900/60 dark:to-transparent flex items-center justify-center border border-amber-500/20 dark:border-[#B89C5D]/30 relative z-10 shadow-inner">
                  <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400 fill-emerald-600/10 dark:fill-emerald-400/20 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
             </div>
          </div>
        </div>

        {/* Navigation Bar Base - Adapts dynamically to light/dark system */}
        <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-[#FCFCFC]/96 dark:bg-[#12161A]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.05] rounded-t-[36px] px-8 flex justify-between items-center pb-safe overflow-hidden shadow-[0_-10px_35px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
           
           {/* Navigation Items - Left */}
           <div className="flex justify-between items-center w-full max-w-[110px] pt-1">
              <div 
                onClick={() => setActiveTab('Home')}
                className={`flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all ${activeTab === 'Home' ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                 <Home className={`w-[22px] h-[22px] ${activeTab === 'Home' ? 'text-emerald-600 dark:text-green-500 fill-emerald-600/5 dark:fill-green-500/20' : 'text-slate-700 dark:text-white'}`} />
                 <span className={`text-[10px] font-black tracking-tight ${activeTab === 'Home' ? 'text-emerald-700 dark:text-green-500' : 'text-slate-500 dark:text-gray-450'}`}>{tSet.nav_home}</span>
              </div>
              <div 
                onClick={() => setActiveTab('Noor AI')}
                className={`flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all ${activeTab === 'Noor AI' ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                 <Sparkles className={`w-[22px] h-[22px] ${activeTab === 'Noor AI' ? 'text-emerald-600 dark:text-green-500 fill-emerald-600/5 dark:fill-green-500/20' : 'text-slate-700 dark:text-white'}`} />
                 <span className={`text-[10px] font-black tracking-tight ${activeTab === 'Noor AI' ? 'text-emerald-700 dark:text-green-500' : 'text-slate-500 dark:text-gray-450'}`}>{tSet.nav_ai}</span>
              </div>
           </div>

           {/* Empty Space for FAB */}
           <div className="w-[90px] flex-shrink-0"></div>

           {/* Navigation Items - Right */}
           <div className="flex justify-between items-center w-full max-w-[110px] pt-1">
              <div 
                onClick={() => setActiveTab('Downloads')}
                className={`flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all ${activeTab === 'Downloads' ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                 <Download className={`w-[22px] h-[22px] ${activeTab === 'Downloads' ? 'text-emerald-600 dark:text-green-500 fill-emerald-600/5 dark:fill-green-500/20' : 'text-slate-700 dark:text-white'}`} />
                 <span className={`text-[10px] font-black tracking-tight ${activeTab === 'Downloads' ? 'text-emerald-700 dark:text-green-500' : 'text-slate-500 dark:text-gray-450'}`}>{tSet.nav_downloads}</span>
              </div>
              <div 
                onClick={() => setActiveTab('Me')}
                className={`flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all ${activeTab === 'Me' ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                 <User className={`w-[22px] h-[22px] ${activeTab === 'Me' ? 'text-emerald-600 dark:text-green-500 fill-emerald-600/5 dark:fill-green-500/20' : 'text-slate-700 dark:text-white'}`} />
                 <span className={`text-[10px] font-black tracking-tight ${activeTab === 'Me' ? 'text-emerald-700 dark:text-green-500' : 'text-slate-500 dark:text-gray-450'}`}>{tSet.nav_me}</span>
              </div>
           </div>
           
        </div>
      </div>
    </div>
  );
}
