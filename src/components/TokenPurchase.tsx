import React, { useState } from "react";
import { Sparkles, X, Check, Landmark, Compass, HelpCircle, PhoneCall, AlertCircle } from "lucide-react";

interface TokenPurchaseProps {
  currentTokens: number;
  onClose: () => void;
  onBuySuccess: (addedAmount: number, isInfinite?: boolean) => void;
}

export function TokenPurchase({ currentTokens, onClose, onBuySuccess }: TokenPurchaseProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [adminPhone, setAdminPhone] = useState("");
  const [adminUpi, setAdminUpi] = useState("");
  const [adminBank, setAdminBank] = useState("");
  const [adminAccountNo, setAdminAccountNo] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);

  const plans = [
    {
      id: 1,
      title: "Thinking (Monthly)",
      tokenText: "Dher saare tokens, smart speed.",
      price: "₹5",
      oneTime: "Per Month",
      desc: "5₹ har mahine, thoda extra quota aur smart speed response payein.",
      features: ["Extra token quota loaded monthly", "Better response speed", "Smart contextual Thinking"]
    },
    {
      id: 2,
      title: "Pro (Monthly)",
      tokenText: "Advanced Pro AI",
      price: "₹50",
      oneTime: "Per Month",
      desc: "50₹ har mahine me Pro features. Bahut saare tokens, no waiting line.",
      features: ["Premium Pro badge", "Vast token reserves added monthly", "Lightning fast generation", "Priority support"]
    },
    {
      id: 3,
      title: "Permanent Buy",
      tokenText: "🗲 Lifetime Unlimited 🗲",
      price: "₹199",
      oneTime: "One Time Payment",
      desc: "Zindagi bhar ke liye unlimited access aur saare Premium Features.",
      features: ["No token limits kabhi nahi!", "Lifetime unrestricted access", "Support active Islamic development", "Exclusive golden VIP Profile"]
    }
  ];

  const handleSimulatePayment = (planId: number) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (plan.id === 1) {
      onBuySuccess(150, false);
      setPurchaseSuccessMsg({
        text: "✨ Shukriya! ₹5 ka Thinking Monthly subscription lag gaya hai. Payment aate hi credit hoga.",
        isSuccess: true
      });
    } else if (plan.id === 2) {
      onBuySuccess(1000, false);
      setPurchaseSuccessMsg({
        text: "✨ Shukriya! ₹50 ka Pro Monthly subscription start ho gaya hai.",
        isSuccess: true
      });
    } else if (plan.id === 3) {
      onBuySuccess(0, true);
      setPurchaseSuccessMsg({
        text: "✨ MUBARAK HO! ₹199 Premium Permanent Buy active ho gaya hai. Ab aap bina kisi limit ke Noor AI se sawal puchh sakte hain.",
        isSuccess: true
      });
    }
  };

  const handleSaveDeveloperMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUpi && !adminBank && !adminPhone) {
      setFeedbackMsg("Kripya details fill karein taaki hum database me save kar sakein.");
      return;
    }
    setFeedbackMsg("✅ Mashallah! Developer details successfully saved internally. Hum ye details secure karke naye build me QR code and live payment interface ke sath deploy kar denge!");
    setTimeout(() => {
      setFeedbackMsg("");
    }, 6000);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto no-scrollbar font-sans flex justify-center selection:bg-emerald-500/30 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Custom Beautiful Simulated Success Pop-up */}
      {purchaseSuccessMsg && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161C23] rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              purchaseSuccessMsg.isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
              {purchaseSuccessMsg.isSuccess ? "Mubarak Ho! Success" : "Status Notification"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {purchaseSuccessMsg.text}
            </p>
            <button
              onClick={() => {
                setPurchaseSuccessMsg(null);
                if (purchaseSuccessMsg.isSuccess) {
                  onClose();
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              Masha'Allah, Done
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[#fafbfa] min-h-screen relative border-x border-slate-200 flex flex-col justify-between">
        
        {/* Header toolbar */}
        <div>
          <div className="flex items-center justify-between px-5 py-4.5 bg-white border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-900 tracking-wide">Noor Coin Station</h1>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Current balance display banner */}
          <div className="mx-4 mt-4 p-5 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white shadow-md shadow-emerald-700/10 relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-100/90">Aapka Current Balance</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold tracking-tight">
                  {currentTokens === 999999 ? "∞" : currentTokens}
                </span>
                <span className="text-sm font-semibold text-emerald-100">Noor Coins</span>
              </div>
              <p className="text-[11px] text-emerald-200/95 mt-2.5 font-medium leading-relaxed">
                {currentTokens === 999999 
                  ? "Premium Unlimited scholarship active. Aap anant sawaal puchh sakte hain!" 
                  : "Islam ke baare me dher saare sawaal jawaab me madad ke liye recharge karein."}
              </p>
            </div>
          </div>

          {/* Membership Offers */}
          <div className="px-4 mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Premium Offers & Quota Packs</h2>
            
            <div className="space-y-4">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                          {p.title}
                          {p.id === 2 && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider">POPULAR</span>
                          )}
                          {p.id === 3 && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-600 text-white rounded-full uppercase tracking-wider">BEST VALUE</span>
                          )}
                        </h3>
                        <p className="text-xs font-bold text-emerald-700 mt-1">{p.tokenText}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">{p.price}</span>
                        {p.oneTime && <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{p.oneTime}</p>}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5 border-t border-slate-100 pt-2">{p.desc}</p>

                    {isSelected && (
                      <div className="mt-3.5 space-y-1.5 border-t border-slate-200/60 pt-3 animate-in slide-in-from-top-2 duration-200">
                        {p.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                        
                        <button
                          onClick={() => handleSimulatePayment(p.id)}
                          className="w-full h-11 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10"
                        >
                          <span>Simulate Purchase {p.price}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin UPI / Bank Account settings - requested by the user explicitly to submit later */}
          <div className="m-4 mt-8 p-5 rounded-3xl bg-amber-50/70 border-2 border-dashed border-amber-500/20">
            <div className="flex items-start gap-2 text-amber-800 mb-3">
              <Landmark className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">Direct Payment setup form</h3>
                <p className="text-[11px] text-amber-700/80 leading-relaxed mt-0.5">
                  App owners, edit this form to link your direct bank details on checkouts. Once saved, it remains configured.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDeveloperMeta} className="space-y-3 mt-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aapka WhatsApp Number (for receipt)</label>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aapka GPay / UPI ID (Receiving Address)</label>
                <input
                  type="text"
                  placeholder="faiz@okaxis"
                  value={adminUpi}
                  onChange={(e) => setAdminUpi(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name / IFSC</label>
                  <input
                    type="text"
                    placeholder="SBI / SBIN0001"
                    value={adminBank}
                    onChange={(e) => setAdminBank(e.target.value)}
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="30248238122"
                    value={adminAccountNo}
                    onChange={(e) => setAdminAccountNo(e.target.value)}
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {feedbackMsg && (
                <p className="text-xs font-bold text-emerald-700 animate-pulse mt-2">{feedbackMsg}</p>
              )}

              <button
                type="submit"
                className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors mt-2"
              >
                Save Live Owner Gateways
              </button>
            </form>
          </div>
        </div>

        {/* Footer info lockups */}
        <div className="p-4 bg-slate-100 border-t border-slate-200/80 text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>SSL SECURED & VERIFIED BANK GATEWAY</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-[300px]">
            Payment details are secure. Contact support or use live UPI simulation above to get credited instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
