import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowLeft, Zap, BrainCircuit, Infinity } from 'lucide-react';
import { auth } from "../../firebase.js";

// Plan config — yahan se hi pricing/labels change ho jaate hain dono jagah
const PLANS = {
    weekly: {
        endpoint: "/api/payments/checkout/weekly",
        title: "7-Day Pass",
        subtitle: "Perfect for binge-reading",
        price: "$5",
        priceNote: "Billed as ₹415 INR",
        renewLabel: "Auto-renews weekly, cancel anytime",
        badge: "Best Value",
    },
    monthly: {
        endpoint: "/api/payments/checkout/monthly",
        title: "30-Day Pass",
        subtitle: "For regular readers",
        price: "$15",
        priceNote: "Billed as ₹1245 INR",
        renewLabel: "Auto-renews monthly, cancel anytime",
        badge: "Most Popular",
    },
};

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const [subLoading, setSubLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("weekly"); // 👈 NAYA: weekly/monthly toggle

    const plan = PLANS[selectedPlan];

    // ==========================================
    // 💳 SUBSCRIBE HANDLER (ab dynamic endpoint use karta hai)
    // ==========================================
    const handleSubscribe = async () => {
        try {
            setSubLoading(true);
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(plan.endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                console.error("No checkout URL returned:", data);
            }
        } catch (err) {
            console.error("Subscribe Error:", err);
        } finally {
            setSubLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#010101] text-zinc-300 font-['Inter',sans-serif] relative overflow-hidden flex flex-col selection:bg-[#EC0618]/30">

            {/* ── CINEMATIC BACKGROUND ── */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#EC0618]/10 blur-[150px] rounded-full pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#EC0618]/5 blur-[150px] rounded-full pointer-events-none z-0 translate-x-1/3 translate-y-1/3" />

            {/* ── TOP NAVIGATION ── */}
            <div className="relative z-20 w-full p-6 lg:p-10 flex items-center justify-between max-w-[1400px] mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 group active:scale-95"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide">Back</span>
                </button>
            </div>

            {/* ── PAGE CONTENT (SPLIT LAYOUT) ── */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* ── LEFT COLUMN: VALUE PROP ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EC0618]/10 border border-[#EC0618]/20 text-[#EC0618] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 lg:mb-8">
                        <Sparkles size={14} />
                        Premium Access
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                        No limits.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EC0618] to-rose-400 drop-shadow-[0_0_15px_rgba(236,6,24,0.3)]">
                            Pure immersion.
                        </span>
                    </h1>

                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
                        Elevate your narrative. Remove the friction and let the AI remember every detail, every choice, forever.
                    </p>

                    {/* Feature Highlights */}
                    <div className="flex flex-col gap-6 w-full max-w-sm">
                        <div className="flex items-start gap-4 text-left">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                                <Infinity size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-[15px] mb-1">Unlimited Messages</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">Keep the story going without ever hitting a daily cap or paywall interrupt.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-[15px] mb-1">Zero Wait Times</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">Skip the queue. Get instant, high-speed priority generation for every response.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left">
                            <div className="p-2.5 rounded-xl bg-[#EC0618]/10 border border-[#EC0618]/20 text-[#EC0618] shrink-0">
                                <BrainCircuit size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold text-[15px] mb-1">Deeper Context Memory</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">Characters retain massive context windows, remembering past choices flawlessly.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: PRICING CARD ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end gap-6 pb-12 lg:pb-0">

                    {/* 👇 NAYA: Weekly / Monthly Toggle */}
                    <div className="w-full max-w-[420px] flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
                        <button
                            onClick={() => setSelectedPlan("weekly")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${selectedPlan === "weekly"
                                    ? "bg-white text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setSelectedPlan("monthly")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${selectedPlan === "monthly"
                                    ? "bg-white text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* Gradient Border Wrapper */}
                    <div className="w-full max-w-[420px] p-[1px] rounded-[2.5rem] bg-gradient-to-b from-[#EC0618]/50 via-white/10 to-transparent shadow-[0_20px_80px_rgba(236,6,24,0.15)] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_30px_100px_rgba(236,6,24,0.25)]">

                        {/* The Actual Card */}
                        <div className="bg-[#0a0a0c]/95 backdrop-blur-3xl w-full h-full rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">

                            {/* Inner Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EC0618]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 z-0 pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-white font-bold text-2xl mb-1">{plan.title}</h3>
                                        <p className="text-zinc-400 text-sm">{plan.subtitle}</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest">
                                        {plan.badge}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    <div className="flex items-end gap-1.5 mb-1">
                                        <span className="text-white font-black text-6xl tracking-tight leading-none">{plan.price}</span>
                                        <span className="text-zinc-400 font-medium text-lg pb-1">USD</span>
                                    </div>
                                    <div className="text-zinc-500 text-sm font-medium">
                                        {plan.priceNote}
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-4 mb-10 pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EC0618]/20 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-[#EC0618]" strokeWidth={3} />
                                        </div>
                                        <span className="text-zinc-200 text-[15px] font-medium">All Pro Features Included</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EC0618]/20 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-[#EC0618]" strokeWidth={3} />
                                        </div>
                                        <span className="text-zinc-200 text-[15px] font-medium">{plan.renewLabel}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#EC0618]/20 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-[#EC0618]" strokeWidth={3} />
                                        </div>
                                        <span className="text-zinc-200 text-[15px] font-medium">Cancel anytime</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-4 mt-auto">
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={subLoading}
                                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#EC0618] to-[#a00410] text-white text-[15px] font-bold tracking-wide hover:opacity-90 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(236,6,24,0.3)]"
                                    >
                                        {subLoading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Continue to Checkout
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => navigate(-1)}
                                        className="w-full text-center text-zinc-500 hover:text-white text-sm font-semibold pt-2 transition-colors duration-200"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SubscriptionPage;