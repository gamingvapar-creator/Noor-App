import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Loader2, Edit2, Copy, RefreshCw, AlertTriangle, Coins, ChevronLeft, MoreVertical } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  status?: "sending" | "error" | "success";
}

interface NoorAIProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userTokens: number;
  setUserTokens: React.Dispatch<React.SetStateAction<number>>;
  isInfiniteTokens: boolean;
  onOpenBuy: () => void;
  onBack?: () => void;
  language: Language;
}

export function NoorAI({ 
  messages = [], 
  setMessages, 
  userTokens, 
  setUserTokens, 
  isInfiniteTokens, 
  onOpenBuy,
  onBack,
  language
}: NoorAIProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showCircleLogo, setShowCircleLogo] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "info" | "warning" } | null>(null);

  const [currentMode, setCurrentMode] = useState<"fast" | "thinking" | "pro">(() => {
    return (localStorage.getItem("noor_ai_chat_mode") as any) || "fast";
  });
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  // Pro features: live thinking logs state & effect
  const [thinkingLogIdx, setThinkingLogIdx] = useState(0);

  const proThinkingLogs = [
    "🔍 Pooray 114 Surahon mein se aayatein talaash kiye ja rahe hain...",
    "🤔 Swal par ghaur o fikr ke sath quranic hikmat aur scientific/theological context dekha ja raha hai...",
    "📖 Tafseer aur parhezgari ke pehluon ko shaamil kiya ja raha hai...",
    "✨ Emojis aur dilchasp mithaas wale andaz mein jawab tayyar kiya ja raha hai...",
    "💚 Mukammal scholarly aur authentic guidelines dhyan mein rakhi ja rahi hain..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading && currentMode === "pro") {
      setThinkingLogIdx(0);
      interval = setInterval(() => {
        setThinkingLogIdx((prev) => prev + 1);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, currentMode]);

  // Usage tracking helpers for fast / thinking / pro limits per day
  const getUsageStats = () => {
    const todayStr = new Date().toLocaleDateString('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const saved = localStorage.getItem(`noor_ai_usage_${todayStr}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Safe fallback
      }
    }
    return { fast: 0, thinking: 0, pro: 0 };
  };

  const updateUsageStats = (mode: "fast" | "thinking" | "pro") => {
    const todayStr = new Date().toLocaleDateString('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const stats = getUsageStats();
    stats[mode] = (stats[mode] || 0) + 1;
    localStorage.setItem(`noor_ai_usage_${todayStr}`, JSON.stringify(stats));
  };

  const modeLocales = {
    English: {
      fast: "Fast Answer",
      thinking: "Thinking Mode",
      pro: "Pro Mode",
      rem: "left to go",
      limitReached: "Daily limit reached for this mode! Try other settings."
    },
    Hindi: {
      fast: "तेज़ जवाब",
      thinking: "सोच मोड",
      pro: "प्रो मोड",
      rem: "आज बाकी",
      limitReached: "इस मोड की दैनिक सीमा समाप्त! दूसरा मोड आज़माएं।"
    },
    Urdu: {
      fast: "تیز جواب",
      thinking: "غور و فکر",
      pro: "پرو موڈ",
      rem: "آج کے باقی",
      limitReached: "اس موڈ کے لیے روزانہ کی حد پوری ہو گئی ہے! کوئی دوسرا موڈ آزمائیں۔"
    },
    Arabic: {
      fast: "إجابة سريعة",
      thinking: "وضع التفكير",
      pro: "الوضع الاحترافي",
      rem: "المتبقي اليوم",
      limitReached: "تم الوصول إلى الحد اليومي لهذا الوضع! جرب وضعًا آخر."
    }
  };

  const currentModeLocale = modeLocales[language] || modeLocales.English;

  const aiLocales = {
    English: {
      title: "Noor AI",
      sub: "Your AI assistant to answer all your religious and Quranic questions.",
      placeholder: "Ask Noor AI...",
      failedCoins: "No coins left! Please click Buy Coins to refill.",
      cost: "Question Cost:",
      buy: "Buy Coins",
      copied: "Message copied to clipboard!",
      retry: "Retry Answer",
      dhyan: "Reflect / Ponder:",
      sugLabel: "Suggested Questions:",
      offline: "You are offline. Please connect to the internet to ask Noor AI.",
      dismiss: "Dismiss"
    },
    Hindi: {
      title: "नूर एआई",
      sub: "आपके धार्मिक और कुरानिक सवालों के सही जवाब देने वाला एआई सहायक।",
      placeholder: "नूर एआई से पूछें...",
      failedCoins: "कौइन्स समाप्त! कृपया रिफिल के लिए कौइन्स खरीदें पर क्लिक करें।",
      cost: "सवाल की लागत:",
      buy: "कौइन्स खरीदें",
      copied: "संदेश क्लिपबोर्ड पर कॉपी किया गया!",
      retry: "फिर से प्रयास करें",
      dhyan: "ध्यान दें / गौर करें:",
      sugLabel: "सुझाए गए प्रश्न:",
      offline: "आप ऑफ़लाइन हैं। नूर एआई से पूछने के लिए कृपया इंटरनेट से जुड़ें।",
      dismiss: "खारिज करें"
    },
    Urdu: {
      title: "نور اے آئی",
      sub: "آپ کے دینی اور قرآنی سوالات کے درست جواب فراہم کرنے والا اے آئی اسسٹنٹ۔",
      placeholder: "نور اے آئی سے پوچھیں...",
      failedCoins: "کوائنز ختم! براہ کرم کوائنز دوبارہ خریدنے پر کلک کریں۔",
      cost: "سوال کی قیمت:",
      buy: "کوائنز خریدیں",
      copied: "پیغام کلپ بورڈ پر کاپی ہو گیا ہے!",
      retry: "دوبارہ جواب حاصل کریں",
      dhyan: "دھیان دیں / غور کریں:",
      sugLabel: "تجویز کردہ سوالات:",
      offline: "آپ آف لائن ہیں۔ نور اے آئی سے پوچھنے کے لیے براہ کرم انٹرنیٹ سے جڑیں۔",
      dismiss: "ہٹائیں"
    },
    Arabic: {
      title: "نور آي",
      sub: "مساعدك الذكي للإجابة على الأسئلة الدينية والقرآنية.",
      placeholder: "اسأل نور آي...",
      failedCoins: "انتهت العملات! يرجى الضغط على شراء عملات لإعادة الشحن.",
      cost: "تكلفة السؤال:",
      buy: "شراء عملات",
      copied: "تم نسخ الرسالة إلى الحافظة!",
      retry: "إعادة المحاولة",
      dhyan: "تأمل / تدبر:",
      sugLabel: "الأسئلة المقترحة:",
      offline: "أنت غير متصل بالإنترنت. يرجى الاتصال بالإنترنت لسؤال نور آي.",
      dismiss: "إغلاق"
    }
  };

  const currentLocale = aiLocales[language] || aiLocales.English;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimeout = useRef<any>(null);

  const showToast = (message: string, type: "error" | "success" | "info" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Deduct 5 tokens per message
  const hasEnoughTokens = isInfiniteTokens || userTokens >= 5;

  // Main sending handler
  const handleSendQuery = async (queryText: string, chatMode: "fast" | "thinking" | "pro" = currentMode) => {
    if (!queryText.trim() || isLoading) return;

    if (!isInfiniteTokens) {
      setUserTokens(prev => prev - 5);
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText.trim(), mode: chatMode }),
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now().toString(), role: "ai", content: data.reply, status: "success" }
        ]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now().toString(), role: "ai", content: "Sorry, I am unable to answer right now.", status: "error" }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString(), role: "ai", content: "Network error occurred. Please check your internet connection.", status: "error" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    if (!hasEnoughTokens) {
      onOpenBuy();
      return;
    }

    if (isOffline) {
      showToast(currentLocale.offline, "error");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim(), status: "success" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    // Update usage stats immediately on user click
    updateUsageStats(currentMode);

    handleSendQuery(userMsg.content, currentMode);
  };

  // 1. Edit Option Handler
  const handleEdit = (msg: Message) => {
    setInput(msg.content);
    // Remove the message and subsequent messages to allow seamless edit flow
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setActiveMenuId(null);
  };

  // 2. Copy Option Handler
  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    showToast(currentLocale.copied, "success");
    setActiveMenuId(null);
  };

  // 3. Retry Option Handler
  const handleRetry = (msg: Message) => {
    setActiveMenuId(null);

    if (isOffline) {
      showToast("Aap offline hain! Kripya internet connect karein.", "error");
      return;
    }

    // Remove any trailing AI responses with error to make conversational sequence pristine
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === msg.id);
      if (index !== -1) {
        return prev.slice(0, index + 1);
      }
      return prev;
    });
    handleSendQuery(msg.content);
  };

  // Touch handlers for mobile longpress detection
  const handleTouchStart = (msgId: string) => {
    longPressTimeout.current = setTimeout(() => {
      setActiveMenuId(msgId);
    }, 500); // 500ms
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
  };

  const renderInlineMarkdown = (text: string) => {
    if (!text.includes("**")) return text;
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-[#B89C5D]">{part}</strong>;
      }
      return part;
    });
  };

  const formatText = (text: string) => {
    const hasStructure = text.includes("[DIRECT_ANSWER]") || text.includes("[HEADLINE_QUESTION]");

    if (!hasStructure) {
      // Fallback formatting for classic text responses
      return text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        return (
          <span key={i} className="block mb-1.5 last:mb-0 text-slate-250 font-medium">
            {renderInlineMarkdown(line)}
          </span>
        );
      });
    }

    let directAnswer = "";
    let headlineQuestion = "";
    let detailedLines: string[] = [];
    let suggestionsList: string[] = [];

    const lines = text.split("\n");
    let currentSection: "direct" | "headline" | "detailed" | "suggestions" | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("[DIRECT_ANSWER]")) {
        currentSection = "direct";
        const content = trimmed.substring("[DIRECT_ANSWER]".length).trim();
        if (content) directAnswer += (directAnswer ? " " : "") + content;
        continue;
      } else if (trimmed.startsWith("[HEADLINE_QUESTION]")) {
        currentSection = "headline";
        const content = trimmed.substring("[HEADLINE_QUESTION]".length).trim();
        if (content) headlineQuestion += (headlineQuestion ? " " : "") + content;
        continue;
      } else if (trimmed.startsWith("[DETAILED_EXPLANATION]")) {
        currentSection = "detailed";
        const content = trimmed.substring("[DETAILED_EXPLANATION]".length).trim();
        if (content) detailedLines.push(content);
        continue;
      } else if (trimmed.startsWith("[SUGGESTIONS]")) {
        currentSection = "suggestions";
        continue;
      }

      if (currentSection === "direct") {
        if (trimmed) directAnswer += (directAnswer ? "\n" : "") + trimmed;
      } else if (currentSection === "headline") {
        if (trimmed) headlineQuestion += (headlineQuestion ? "\n" : "") + trimmed;
      } else if (currentSection === "detailed") {
        detailedLines.push(line);
      } else if (currentSection === "suggestions") {
        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          const item = trimmed.substring(1).trim();
          if (item) suggestionsList.push(item);
        } else if (trimmed) {
          suggestionsList.push(trimmed);
        }
      } else {
        detailedLines.push(line);
      }
    }

    const parts: React.ReactNode[] = [];

    // 1. Direct First Line Answer Block
    if (directAnswer) {
      parts.push(
        <div key="direct" className="mb-4 text-slate-900 dark:text-white font-black text-sm border-l-3 border-emerald-500 pl-3 py-1.5 leading-relaxed bg-emerald-500/5 rounded-r-xl pr-3">
          {renderInlineMarkdown(directAnswer)}
        </div>
      );
    }

    // 2. Beautiful Curiosity Headline Block
    if (headlineQuestion) {
      parts.push(
        <div key="headline" className="mb-4 bg-slate-200/40 dark:bg-gradient-to-r dark:from-[#B89C5D]/15 dark:to-transparent border border-slate-300 dark:border-[#B89C5D]/25 p-3.5 rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-[#B89C5D] mt-1.5 shrink-0 animate-pulse shadow-sm" />
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-600 dark:text-[#B89C5D]/90 mb-1">{currentLocale.dhyan}</h4>
            <p className="text-sm font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-[#B89C5D] transition-colors leading-snug">
              {headlineQuestion}
            </p>
          </div>
        </div>
      );
    }

    // 3. Beautifully Detailed Background Block
    if (detailedLines.length > 0) {
      parts.push(
        <div key="detailed" className="mb-4 text-slate-800 dark:text-slate-300 text-[13px] leading-relaxed flex flex-col gap-2.5">
          {detailedLines.map((l, idx) => {
            const tl = l.trim();
            if (!tl) return <div key={idx} className="h-1" />;
            
            // Stylize double-quoted text or verse translations
            if (tl.startsWith('"') || tl.startsWith('“')) {
              return (
                <blockquote key={idx} className="border-l-2 border-emerald-500/30 pl-3 py-1 italic text-slate-700 dark:text-slate-205 font-medium my-1.5 bg-[#B89C5D]/5 rounded-r-lg pr-2 text-xs">
                  {renderInlineMarkdown(l)}
                </blockquote>
              );
            }
            return (
              <p key={idx} className="font-semibold">
                {renderInlineMarkdown(l)}
              </p>
            );
          })}
        </div>
      );
    }

    // 4. Interactive Recommendation Chip pill buttons
    if (suggestionsList.length > 0) {
      parts.push(
        <div key="suggestions" className="mt-4 pt-3.5 border-t border-white/5">
          <div className="text-[10px] uppercase font-black tracking-widest text-[#B89C5D] mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#B89C5D]" />
            <span>{currentLocale.sugLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestionsList.map((sug, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  
                  if (isOffline) {
                    showToast(currentLocale.offline, "error");
                    return;
                  }

                  const stats = getUsageStats();
                  const modeLimits = { fast: 20, thinking: 15, pro: 10 };
                  if ((stats[currentMode] || 0) >= modeLimits[currentMode]) {
                    showToast(`${currentModeLocale.limitReached} (${modeLimits[currentMode]} max)`, "warning");
                    return;
                  }

                  setInput("");
                  
                  // Append to message list immediately
                  const userMsg: Message = { id: Date.now().toString(), role: "user", content: sug, status: "success" };
                  setMessages((prev) => [...prev, userMsg]);
                  
                  // Record usage stats
                  updateUsageStats(currentMode);

                  // Fire query execution
                  handleSendQuery(sug, currentMode);
                }}
                className="text-xs font-bold bg-[#B89C5D]/10 hover:bg-[#B89C5D]/20 active:bg-[#B89C5D]/30 text-[#B89C5D] hover:text-[#d3bb82] px-3.5 py-2 rounded-2xl border border-[#B89C5D]/20 transition-all duration-200 active:scale-95 text-left flex items-center gap-2 shadow-sm"
              >
                <span className="text-[#B89C5D] text-xs font-bold">✦</span>
                <span className="leading-tight">{sug}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return <div className="flex flex-col">{parts}</div>;
  };

  const handleScrollDetect = (e: React.UIEvent<HTMLDivElement>) => {
    const currentTop = e.currentTarget.scrollTop;
    if (currentTop < 35) {
      setShowCircleLogo(true);
    } else {
      setShowCircleLogo(false);
    }
  };

  const hasChatStarted = (messages || []).length > 1;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 select-none relative">
      
      {/* Toast Notification HUD */}
      {toast && (
        <div className="absolute top-4 inset-x-4 z-50 p-3.5 rounded-2xl border text-xs font-semibold shadow-md flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300 bg-slate-900 border-slate-800 text-white dark:bg-white dark:border-slate-200 dark:text-slate-900">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[10px] uppercase tracking-wider underline opacity-60">{currentLocale.dismiss}</button>
        </div>
      )}

      {/* Offline Banner at Top */}
      {isOffline && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-505 text-xs py-2.5 px-4 text-center tracking-wide font-semibold flex items-center justify-center gap-2 mt-2 mx-4 rounded-xl shadow-sm">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          {currentLocale.offline}
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#161C23] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-emerald-500 hover:border-emerald-500/50 active:scale-95 transition-all cursor-pointer shadow-md"
          title="Back to Home"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-gray-300 pointer-events-none" />
        </button>
      )}

      {/* Chat Messages and Header unified in scroll container with custom scroll tracking */}
      <div 
        onScroll={handleScrollDetect}
        className={`flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 px-4 pb-36 ${onBack ? "pt-24" : "pt-4"}`}
        onClick={() => {
          setActiveMenuId(null);
          setIsModeMenuOpen(false);
        }}
      >
        {/* Dynamic header inside scroll stream: hiding elements completely when chat has started, 
            except when scrolled back to top which reveals the beautiful circular logo again! */}
        {(!hasChatStarted || showCircleLogo) && (
          <div className="flex flex-col items-center py-6 transition-all duration-300">
            {/* Removing the icon below coins display as requested */}
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">{currentLocale.title}</h1>
            {!hasChatStarted && (
              <p className="text-slate-500 text-xs mt-1 text-center max-w-[250px] leading-relaxed">
                {currentLocale.sub}
              </p>
            )}
          </div>
        )}

        {/* Message bubbles list */}
        {(messages || []).map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1 w-full">
            <div
              className={`flex items-end gap-2 max-w-[85%] ${
                msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              {/* Profile Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/10"
                    : "bg-slate-200 dark:bg-[#161C23] text-emerald-600 dark:text-[#B89C5D] border border-slate-300 dark:border-white/5"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Chat Bubble Container with Touch Context Dialog */}
              <div className="relative group flex flex-col">
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (msg.role === "user") {
                      setActiveMenuId(msg.id);
                    }
                  }}
                  onTouchStart={() => msg.role === "user" && handleTouchStart(msg.id)}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (msg.role === "user") {
                      setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                    }
                  }}
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-pointer active:scale-[0.98] transition-all duration-300 select-text ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-100/90 dark:bg-[#161C23] border border-slate-250 dark:border-white/5 text-slate-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "ai" ? formatText(msg.content) : msg.content}
                </div>

                {/* Inline Action Submenu overlay for longpress / tap on user bubbles */}
                {activeMenuId === msg.id && msg.role === "user" && (
                  <div className="absolute top-full mt-2 right-0 z-50 flex items-center gap-1 p-1 bg-[#1a202c] border border-white/10 rounded-xl shadow-xl animate-in scale-in duration-200">
                    <button
                      onClick={() => handleEdit(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Edit</span>
                    </button>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <button
                      onClick={() => handleCopy(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      <span>Copy</span>
                    </button>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <button
                      onClick={() => handleRetry(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-green-400" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message retry row */}
            {msg.role === "ai" && msg.status === "error" && (
              <div className="ml-10 mt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    const userMsgs = (messages || []).filter((m) => m.role === "user");
                    if (userMsgs.length > 0) {
                      handleRetry(userMsgs[userMsgs.length - 1]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[11px] text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{currentLocale.retry}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-3 max-w-[85%] self-start animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#161C23] border border-slate-700/30 rounded-bl-none flex flex-col gap-1.5 shadow-lg max-w-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B89C5D] animate-pulse">
                  {currentMode === "pro" ? "Noor AI is Processing (Pro Mode)" : "Noor AI is Thinking"}
                </span>
              </div>
              {currentMode === "pro" ? (
                <p className="text-xs text-slate-300 italic font-medium leading-relaxed transition-all duration-500">
                  {proThinkingLogs[thinkingLogIdx % proThinkingLogs.length]}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Jawab ikhatta kiya ja raha hai...</p>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area: Perfectly nested within relative wrapper with transparent gradient top */}
      <div className="absolute bottom-[34px] left-0 right-0 px-4 z-40 bg-gradient-to-t from-white via-white dark:from-[#0A0D10] dark:via-[#0A0D10] to-transparent pt-4 pb-2 transition-colors duration-500">
        
        {/* Token information HUD inside input frame */}
        <div className="mb-2.5 mx-1 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentLocale.cost} <b className="text-emerald-700 dark:text-emerald-400">5 coins</b></span>
          </div>
          <button
            onClick={onOpenBuy}
            className="text-[10px] bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold px-2.5 py-1 rounded-full hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            {currentLocale.buy}
          </button>
        </div>

        <div className="relative flex items-center">
          {/* Chat Mode Overlay Dropdown Menu */}
          {isModeMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-16 left-2 z-50 w-64 bg-white dark:bg-[#12181F] border border-slate-250 dark:border-white/10 p-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="text-xs font-black text-slate-800 dark:text-[#B89C5D] pb-2 border-b border-slate-100 dark:border-white/5 mb-2.5 flex items-center justify-between">
                <span>Select Noor AI Mode:</span>
                <span className="text-[9px] font-mono tracking-wider font-extrabold text-[#B89C5D] bg-[#B89C5D]/10 px-1.5 py-0.5 rounded">COST/QUERY</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    id: "fast",
                    name: currentModeLocale.fast,
                    activeBg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
                    color: "border-slate-150 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
                    desc: "Super fast, direct and precise answers"
                  },
                  {
                    id: "thinking",
                    name: currentModeLocale.thinking,
                    activeBg: "bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-400",
                    color: "border-slate-150 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
                    desc: "Step-by-step deep analytical reflection"
                  },
                  {
                    id: "pro",
                    name: currentModeLocale.pro,
                    activeBg: "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400",
                    color: "border-slate-150 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
                    desc: "Ultimate authority-grade premium wisdom"
                  }
                ].map((m) => {
                  const isSelected = currentMode === m.id;
                  
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentMode(m.id as any);
                        localStorage.setItem("noor_ai_chat_mode", m.id);
                        setIsModeMenuOpen(false);
                        showToast(`Switched to ${m.name}`, "success");
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col gap-0.5 cursor-pointer hover:scale-[1.01] active:scale-98 ${
                        isSelected ? m.activeBg : m.color
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-extrabold">{m.name}</span>
                        <span className="text-[10px] font-mono opacity-90 px-1.5 py-0.5 rounded-md bg-slate-150 dark:bg-black/20 text-slate-600 dark:text-slate-400">
                          {isInfiniteTokens ? "FREE" : "5 Coins"}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-70 font-medium leading-normal">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3-Dot Mode Selector Button on the opposite side of Send */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModeMenuOpen(!isModeMenuOpen);
            }}
            className={`absolute left-2.5 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 active:scale-90 transition-all cursor-pointer z-10 ${
              isModeMenuOpen ? "bg-slate-200 dark:bg-white/10 text-[#B89C5D]" : ""
            }`}
            title="Choose Chat Mode"
          >
            <MoreVertical className="w-5 h-5 shrink-0" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!hasEnoughTokens}
            placeholder={hasEnoughTokens ? currentLocale.placeholder : currentLocale.failedCoins}
            className={`w-full bg-white dark:bg-[#161C23] border border-slate-200 dark:border-white/10 rounded-3xl py-4 pl-12 pr-14 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-green-500/50 resize-none h-[54px] max-h-[120px] overflow-y-auto no-scrollbar shadow-md placeholder:text-slate-400 dark:placeholder:text-gray-500 transition-colors duration-500 ${
              !hasEnoughTokens ? "opacity-60 bg-slate-100 dark:bg-slate-800" : ""
            }`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !hasEnoughTokens}
            className="absolute right-1.5 w-11 h-11 flex flex-col items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:bg-slate-200 dark:disabled:bg-white/10 active:scale-90 transition-all shadow-md cursor-pointer pt-0.5"
          >
            <Send className="w-3.5 h-3.5 ml-0.5 shrink-0" />
            <span className="text-[9px] font-extrabold leading-none tracking-tighter shrink-0 mt-0.5 select-none">5</span>
          </button>
        </div>
      </div>
    </div>
  );
}
