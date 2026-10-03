import React, { useState, useEffect } from "react";

const narrativePhases = [
    "Weaving narrative threads...",
    "Summoning character profiles...",
    "Generating dynamic environments...",
    "Rolling initial fate dice..."
];

export default function EnhancedLoader() {
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhaseIndex((prev) => (prev + 1) % narrativePhases.length);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden">
            
            {/* 1. Dynamic Aurora / Magical Mist Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/20 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[100px] animate-[pulse_8s_ease-in-out_infinite_alternate]" />
            </div>

            {/* 2. Glassmorphism Central Core */}
            <div className="relative z-10 flex flex-col items-center gap-10 p-12 rounded-3xl backdrop-blur-md border border-white/5 bg-black/20 shadow-2xl">
                
                {/* 3. Arcane / Neural Ring Animation */}
                <div className="relative flex items-center justify-center w-32 h-32">
                    {/* Outer slow spinning rune/tech ring */}
                    <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#00e676]/40 animate-[spin_8s_linear_infinite]" />
                    {/* Middle reverse spinning ring */}
                    <div className="absolute inset-2 rounded-full border border-[#00e676]/20 animate-[spin_4s_linear_infinite_reverse]" />
                    {/* Inner glowing pulse */}
                    <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#00e676]/20 to-transparent blur-md animate-pulse" />
                    
                    {/* Brand Core */}
                    <div className="absolute flex items-center justify-center w-12 h-12 bg-[#111] rounded-lg shadow-[0_0_20px_rgba(0,230,118,0.3)] border border-white/10 z-20">
                        <span className="text-3xl font-black text-white tracking-tighter">L</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5 w-full">
                    <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                        Leviyra
                    </h1>
                    
                    {/* 4. Elegant Glowing Track */}
                    <div className="relative w-72 h-[3px] bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-[#00e676] to-transparent w-full"
                            style={{ 
                                animation: "shimmer 1.5s infinite linear",
                            }}
                        />
                        {/* 
                          Add to your global CSS or Tailwind config:
                          @keyframes shimmer {
                              0% { transform: translateX(-100%); }
                              100% { transform: translateX(100%); }
                          }
                        */}
                    </div>

                    {/* 5. Animated Microcopy */}
                    <div className="h-6 overflow-hidden relative w-full text-center mt-2">
                        <p 
                            key={phaseIndex} 
                            className="text-sm font-medium text-gray-400 tracking-wide animate-[fadeInUp_0.3s_ease-out_forwards]"
                        >
                            {narrativePhases[phaseIndex]}
                        </p>
                        {/* 
                          Add to global CSS:
                          @keyframes fadeInUp {
                              0% { opacity: 0; transform: translateY(10px); }
                              100% { opacity: 1; transform: translateY(0); }
                          }
                        */}
                    </div>
                </div>
            </div>

            {/* 6. Monetization / Progression Teaser */}
            <div className="absolute bottom-8 z-10 flex flex-col items-center gap-3 transition-opacity hover:opacity-100 opacity-70">
                <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-semibold">
                    Skip the wait. Unlock endless realms.
                </p>
                <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8b6b22] to-[#d4af37] text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform">
                    Go Pro
                </button>
            </div>
        </div>
    );
}