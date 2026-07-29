import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSubscriptionStatus } from "./../../hooks/userSubscriptionStatus.js";

const SubscriptionBanner = () => {
    // API hook se saari states nikal rahe hain
    const { status, loading, error } = useSubscriptionStatus();

    // Debugging ke liye (Jab sab sahi chalne lage, tab isko hata sakte ho)
    useEffect(() => {
        console.log("Loading state:", loading);
        console.log("Payment status:", status);
        if (error) {
            console.error("API Error details:", error);
        }
    }, [status, loading, error]);

    // Agar loading chal rahi hai, data nahi aaya, ya 401 jaisa koi error hai, toh kuch mat dikhao
    if (loading || !status || error) return null;

    // ── SCENARIO 1: Paid Plan hai aur 2 ya usse kam din bache hain (Red Premium Theme) ──
    if (status.isPaidActive && status.daysLeft <= 2) {
        return (
            <div className="fixed top-20 left-0 w-full z-[9999] bg-[#0A0505] border-b border-red-500/20 backdrop-blur-xl shadow-[0_4px_30px_rgba(239,68,68,0.15)] flex justify-center items-center px-4 py-3">
                <div className="flex items-center gap-3 text-sm font-medium text-red-400 tracking-wide">
                    <span className="animate-pulse text-lg">⚠️</span>
                    <p>
                        Your plan is expiring in <span className="font-bold text-red-300">{status.daysLeft} days</span>.
                    </p>
                    <Link
                        to="/subscription"
                        className="ml-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-full border border-red-500/20 transition-all duration-300 text-xs font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                        Renew Now
                    </Link>
                </div>
            </div>
        );
    }

    // ── SCENARIO 2: Free Plan hai aur sirf 10 ya usse kam messages bache hain (Green Premium Theme) ──
    if (!status.isPaidActive && status.usage && status.usage.totalMessages >= status.usage.totalLimit - 10) {
        const remaining = status.usage.totalLimit - status.usage.totalMessages;

        return (
            <div className="fixed bottom-20 sm:bottom-0 left-0 w-full z-[9999] bg-[#030A05] border-b border-[#00DC82]/20 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,220,130,0.1)] flex justify-center items-center px-4 py-3">
                <div className="flex items-center gap-3 text-sm font-medium text-zinc-300 tracking-wide">
                    <span className="text-[#00DC82] text-lg">⚡</span>
                    <p>
                        Only <span className="font-bold text-[#00DC82]">{remaining > 0 ? remaining : 0} free messages</span> left in your free plan.
                    </p>
                    <Link
                        to="/subscription"
                        className="ml-2 px-4 py-1.5 bg-[#00DC82]/10 hover:bg-[#00DC82]/20 text-[#00DC82] rounded-full border border-[#00DC82]/20 transition-all duration-300 text-xs font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,220,130,0.2)]"
                    >
                        Upgrade
                    </Link>
                </div>
            </div>
        );
    }

    // Default fallback (agar limits thik hain toh kuch mat dikhao)
    return null;
};

export default SubscriptionBanner;