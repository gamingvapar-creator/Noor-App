import React, { useState, useRef } from "react";
import { Sparkles, ArrowLeft, Bell, HardDrive, Mic, CheckCircle2, Mail, LogIn, ChevronRight } from "lucide-react";
import { loginWithGoogle } from "../lib/firebase";

interface WelcomeFlowProps {
  onLoginComplete: (name: string, email: string) => void;
  onSkipLogin: () => void;
}

export function WelcomeFlow({ onLoginComplete, onSkipLogin }: WelcomeFlowProps) {
  const [step, setStep] = useState<"welcome" | "login" | "permissions">("welcome");
  const [activeSlide, setActiveSlide] = useState(1); // Default to center slide
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Ref for horizontal scroll tracking of slide snap cards
  const scrollRef = useRef<HTMLDivElement>(null);

  // Realistic toggle states for permission sliders
  const [notifGranted, setNotifGranted] = useState(true);
  const [storageGranted, setStorageGranted] = useState(true);
  const [micGranted, setMicGranted] = useState(true);

  const slides = [
    {
      id: 0,
      title: "Listen & Learn",
      desc: "Immerse in renowned Imams like Mishary Al-Afasy and Al-Sudais.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2"/>
          <rect x="10" y="22" width="7" height="13" rx="3" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8"/>
          <rect x="31" y="22" width="7" height="13" rx="3" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8"/>
          <path d="M13 22C13 14 18 8 24 8C30 8 35 14 35 22" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M21 24H22.5M24.5 24H27M18 28H19.5M28.5 28H30M20 32H28" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
        </svg>
      )
    },
    {
      id: 1,
      title: "Explore & Search",
      desc: "Discover specific Surahs, Ayahs, and Juz easily with powerful search and filters.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2"/>
          <circle cx="24" cy="24" r="16" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.3"/>
          <path d="M14 28C17 24.5 22 24.5 24 28C26 24.5 31 24.5 34 28V16C31 12.5 26 12.5 24 16C22 12.5 17 12.5 14 16V28Z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8"/>
          <circle cx="29" cy="18" r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.8" />
          <line x1="32.5" y1="21.5" x2="38" y2="27" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Personalized Plan",
      desc: "Track your progress, save bookmarks, and resume where you left off with a personalized plan.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" fill="#10B981" fillOpacity="0.08" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2"/>
          <path d="M17 12H31V34L24 29L17 34V12Z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round"/>
          <rect x="13" y="38" width="22" height="3" rx="1.5" fill="#10B981" fillOpacity="0.2"/>
          <rect x="13" y="38" width="14" height="3" rx="1.5" fill="#10B981" />
        </svg>
      )
    }
  ];

  const handleScrollDetect = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollLeft = scrollContainer.scrollLeft;
    const index = Math.round(scrollLeft / 260); 
    const clampIdx = Math.max(0, Math.min(slides.length - 1, index));
    setActiveSlide(clampIdx);
  };

  const scrollToSlide = (idx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: idx * (240 + 16),
        behavior: "smooth"
      });
      setActiveSlide(idx);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLoginComplete(user.displayName || "Mubarak User", user.email || "");
      }
    } catch (err: any) {
      console.error("Google Signin Error: ", err);
      if (err?.code === "auth/popup-closed-by-user" || err?.message?.includes("popup-closed-by-user")) {
        setAuthError(
          "Google Sign-In popup aapne band (close) kar diya ya block ho gaya. Koi fikar nahi! Aap niche diye gaye 'Email ke zariye login karein' option ko select karke apna email enter karein, aapka saara progress automatic save ho jayega."
        );
        setShowEmailFields(true); // Automatically expand direct email login for maximum convenience!
      } else {
        setAuthError(
          "Google Sign In popup block ya cancel ho gaya. Aap niche direct Email/Name option use karke asani se save/restore kar sakte hain!"
        );
        setShowEmailFields(true);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDirectEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setAuthError("Kayi koshishon ke liye valid email lazmi hai.");
      return;
    }
    const derivedName = nameInput.trim() || emailInput.trim().split("@")[0];
    onLoginComplete(derivedName, emailInput.trim().toLowerCase());
  };

  return (
    <div className="flex-1 w-full h-full bg-[#FAFBF9] text-slate-900 flex flex-col justify-between select-none animate-in fade-in duration-500 overflow-y-auto no-scrollbar relative">
      
      {/* Absolute ambient soft glow backdrops to give premium light aura */}
      <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-yellow-500/5 blur-[90px] pointer-events-none" />

      {/* Symmetrical Mosque Dome Architectural Illustration - Beautiful Soft Green/Gold outline */}
      <div className="w-full shrink-0 relative flex items-center justify-center pt-2">
        <svg className="w-full max-w-[380px] h-[190px]" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="mosqueRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="domeFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F4F5F2" />
            </linearGradient>
            <linearGradient id="glowBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B89C5D" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#B89C5D" />
            </linearGradient>
            <linearGradient id="bookGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B89C5D" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="115" r="95" fill="url(#mosqueRing)" opacity="0.4" />

          {/* Majestic Mosque dome contour framework to match screenshot perfectly */}
          <path d="M90,200 L90,185 C90,140 130,115 165,100 C178,95 186,85 200,68 C214,85 222,95 235,100 C270,115 310,140 310,185 L310,200" fill="none" stroke="url(#glowBorderGrad)" strokeWidth="1.6" strokeOpacity="0.4" />
          <path d="M60,200 C60,155 105,115 152,80 C172,65 190,40 200,20 C210,40 228,65 248,80 C295,115 340,155 340,200 Z" fill="url(#domeFillGrad)" stroke="url(#glowBorderGrad)" strokeWidth="1" strokeOpacity="0.25" />

          <path d="M200,19 L200,8 M197,11 C197,14 199,16 200,16 C201,16 203,14 203,11" stroke="url(#bookGoldGrad)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Golden Quran medallion on table stand */}
          <g transform="translate(200, 120)">
            <circle cx="0" cy="0" r="44" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" className="shadow-sm" />
            <circle cx="0" cy="0" r="41" stroke="#B89C5D" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="5 2" />
            <path d="M-20,16 L0,0 L20,16" stroke="url(#bookGoldGrad)" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M-13,20 L0,0 L13,20" stroke="url(#bookGoldGrad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M-24,-2 C-16,-10 -4,-10 0,-1 C4,-10 16,-10 24,-2 L21,8 C14,1 4,1 0,8 C-4,1 -14,1 -21,8 Z" fill="#FBFDFA" stroke="url(#bookGoldGrad)" strokeWidth="2.2" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      {step === "welcome" ? (
        <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pb-6 mt-[-10px]">
          {/* Welcome Screen Info Header */}
          <div className="text-center">
            <p className="text-emerald-600 font-extrabold text-[12.5px] uppercase tracking-[0.25em] mb-1">
              Assalamu Alaikum
            </p>
            <h2 className="text-[27px] font-black tracking-tight text-slate-900 mb-1 leading-none">
              Welcome to <span className="text-emerald-600">Noor AI</span>
            </h2>
            <p className="text-slate-500 text-[12.5px] font-medium tracking-wide">
              Begin your beautiful journey with the Divine Revelation.
            </p>
          </div>

          {/* Feature Carousel */}
          <div className="my-6">
            <div 
              ref={scrollRef}
              onScroll={handleScrollDetect}
              className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-8 py-2 w-full"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {slides.map((s) => {
                const isActive = activeSlide === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => scrollToSlide(s.id)}
                    className={`snap-center shrink-0 w-[240px] h-[175px] rounded-[26px] p-5 flex flex-col justify-between text-left transition-all duration-300 border cursor-pointer select-none ${
                      isActive
                        ? "bg-white border-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.12)] scale-100 opacity-100"
                        : "bg-white/60 border-slate-200/60 scale-95 opacity-55 hover:opacity-85"
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="mb-1">{s.icon}</div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 tracking-wide leading-tight">
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium pr-1">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Dots */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {[0, 1, 2].map((dotVal) => {
                const isSelected = activeSlide === dotVal;
                return (
                  <button
                    key={dotVal}
                    onClick={() => scrollToSlide(dotVal)}
                    className={`h-2 transition-all rounded-full duration-300 cursor-pointer ${
                      isSelected 
                        ? "w-5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    title={`Slide dot ${dotVal}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Row: Skip or Log In */}
          <div className="w-full flex items-center justify-between gap-4 mt-1.5 px-1 pb-2">
            <button
              onClick={onSkipLogin}
              className="w-[110px] h-13 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95 font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center shadow-sm"
            >
              Skip
            </button>

            <button
              onClick={() => setStep("login")}
              className="flex-1 h-13 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-105 active:scale-97 text-white font-extrabold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)] relative overflow-hidden group"
            >
              <span>Get Started</span>
              <Sparkles className="w-4 h-4 fill-white/20 text-white animate-pulse" />
            </button>
          </div>
        </div>
      ) : step === "login" ? (
        /* GOOGLE & EMAIL BEAUTIFUL LOGIN PAGE - LOOKING EXACTLY LIKE EXQUISITE WELCOME PAGE */
        <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pb-6 mt-[-10px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="text-center">
            <p className="text-[#B89C5D] font-extrabold text-[12px] uppercase tracking-[0.25em] mb-1">
              Data Cloud Sync
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">
              Sign In to <span className="text-emerald-600">Save Progress</span>
            </h2>
            <p className="text-[12px] text-slate-500 font-semibold leading-relaxed max-w-[280px] mx-auto">
              Apna email connect karein taaki bookmarks, reading history aur coins hamesha safe rahein!
            </p>
          </div>

          {/* Login choices */}
          <div className="my-auto py-4 space-y-4 max-w-sm mx-auto w-full">
            
            {/* Elegant Google Sign In Trigger */}
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleGoogleSignIn}
              className="w-full h-[54px] rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 flex items-center justify-center gap-3.5 transition-all active:scale-[0.98] shadow-sm select-none cursor-pointer group"
            >
              <svg className="w-5.5 h-5.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.307 2.62 1.277 6.467l3.99 3.298z"
                />
                <path
                  fill="#4285F4"
                  d="M24 12.273c0-.873-.078-1.714-.22-2.523H12v4.773h6.73a5.753 5.753 0 0 1-2.497 3.774l3.87 3.003C22.37 19.349 24 16.036 24 12.273z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235A7.16 7.16 0 0 1 4.91 12c0-.791.13-1.55.356-2.235l-3.99-3.298A11.96 11.96 0 0 0 0 12c0 2.05.518 3.982 1.276 5.673l3.99-3.438z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.955-1.077 7.94-2.918l-3.87-3.003c-1.072.718-2.445 1.145-4.07 1.145-3.141 0-5.804-2.123-6.755-4.99l-3.99 3.438A11.964 11.964 0 0 0 12 24z"
                />
              </svg>
              <span className="text-[14px] font-extrabold text-slate-800 group-hover:text-emerald-700">
                {isAuthenticating ? "Authenticating..." : "Continue with Google"}
              </span>
            </button>

            <div className="flex items-center justify-center gap-3">
              <span className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ya Phir</span>
              <span className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Direct Email form options for Iframe and direct logins */}
            {!showEmailFields ? (
              <button
                type="button"
                onClick={() => setShowEmailFields(true)}
                className="w-full h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-transparent text-slate-700 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email ke zariye login karein</span>
              </button>
            ) : (
              <form onSubmit={handleDirectEmailSignIn} className="space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Apna Email Likhein (e.g. gamingvapar@gmail.com)"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs font-semibold focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Apna Naam Likhein (Optional)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs font-semibold focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-[46px] rounded-xl bg-[#B89C5D] text-white hover:brightness-105 active:scale-95 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Dakhil Hoon (Login)</span>
                </button>
              </form>
            )}

            {authError && (
              <p className="text-[11px] text-red-500 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center leading-relaxed">
                {authError}
              </p>
            )}

          </div>

          {/* Action Row: Guest Skip OR back */}
          <div className="w-full flex items-center justify-between gap-4 mt-1.5 px-1 pb-2">
            <button
              onClick={() => setStep("welcome")}
              className="w-[100px] h-10 hover:bg-slate-100 text-slate-500 active:scale-95 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Piche</span>
            </button>

            <button
              onClick={() => setStep("permissions")}
              className="flex-1 h-11 bg-white hover:bg-slate-50 border border-slate-200 text-emerald-700 font-black text-[11px] uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>Permissions Set Karein</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Sawaal Setup Screen 2: Beautiful Permission Selection */
        <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pb-6 mt-[-10px] animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 leading-none mb-1">
              App <span className="text-emerald-600">Permissions</span>
            </h2>
            <p className="text-[12px] text-slate-500 font-semibold leading-relaxed max-w-[280px] mx-auto">
              Behtareen offline recitation, customized checkpoints aur daily verses ke liye permissions den.
            </p>
          </div>

          {/* Beautiful interactive switch/permission controls list */}
          <div className="space-y-3.5 my-5 w-full max-w-sm mx-auto">
            
            {/* Permission 1: Notifications */}
            <div 
              onClick={() => setNotifGranted(!notifGranted)}
              className={`p-3.5 rounded-[22px] border transition-all duration-300 flex items-center justify-between gap-3.5 cursor-pointer ${
                notifGranted 
                  ? "bg-emerald-50 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.06)]" 
                  : "bg-white border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  notifGranted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left-align flex-1">
                  <h4 className="text-xs font-black tracking-wide text-slate-900">Daily Remembrance Alerts</h4>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-normal">
                    Daily Aayat motivation aur Prayer reminders.
                  </p>
                </div>
              </div>
              {/* iOS style premium visual Switch toggle */}
              <div className={`w-10 h-6 pl-0.5 pr-0.5 rounded-full flex items-center transition-all duration-300 ${
                notifGranted ? "bg-emerald-500" : "bg-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 transform ${
                  notifGranted ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </div>

            {/* Permission 2: Offline Media Storage */}
            <div 
              onClick={() => setStorageGranted(!storageGranted)}
              className={`p-3.5 rounded-[22px] border transition-all duration-300 flex items-center justify-between gap-3.5 cursor-pointer ${
                storageGranted 
                  ? "bg-emerald-50 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.06)]" 
                  : "bg-white border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  storageGranted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="text-left-align flex-1">
                  <h4 className="text-xs font-black tracking-wide text-slate-900">Offline Audio Recitation</h4>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-normal">
                    Purana reading aur high-quality offline storage data save rakhen.
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 pl-0.5 pr-0.5 rounded-full flex items-center transition-all duration-300 ${
                storageGranted ? "bg-emerald-500" : "bg-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 transform ${
                  storageGranted ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </div>

            {/* Permission 3: Microphone */}
            <div 
              onClick={() => setMicGranted(!micGranted)}
              className={`p-3.5 rounded-[22px] border transition-all duration-300 flex items-center justify-between gap-3.5 cursor-pointer ${
                micGranted 
                  ? "bg-emerald-50 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.06)]" 
                  : "bg-white border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  micGranted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div className="text-left-align flex-1">
                  <h4 className="text-xs font-black tracking-wide text-slate-900">Pronunciation Feedback</h4>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-normal">
                    Smart Voice feedback se Tajweed aaram se seekhen.
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 pl-0.5 pr-0.5 rounded-full flex items-center transition-all duration-300 ${
                micGranted ? "bg-emerald-500" : "bg-slate-200"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 transform ${
                  micGranted ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </div>

          </div>

          {/* Bottom Action buttons */}
          <div className="w-full flex flex-col gap-2.5 max-w-sm mx-auto">
            {/* Primary confirmation triggers direct login/home transition */}
            <button
              onClick={() => onLoginComplete("Gaming Vapar", "gamingvapar@gmail.com")}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-105 active:scale-97 text-white font-black text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Allow All & Shuru Karein</span>
            </button>

            {/* Back button */}
            <button
              onClick={() => setStep("login")}
              className="w-full h-10 bg-transparent hover:bg-slate-100 text-slate-550 active:scale-95 transition-all text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
