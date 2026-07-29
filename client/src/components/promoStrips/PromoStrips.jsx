import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const PromoStrip = () => {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate('/subscription')}
            className="group relative w-full rounded-2xl bg-[#0a0a0c] border border-white/5 hover:border-[#EC0618]/30 overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(236,6,24,0.1)] transition-all duration-500 mb-8 sm:mb-12"
        >
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EC0618]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#EC0618]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 md:px-6 gap-4">
                
                {/* Left Side: Icon & Copy */}
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[#EC0618]/10 text-[#EC0618] border border-[#EC0618]/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="text-zinc-100 font-semibold text-sm md:text-[15px] tracking-wide flex items-center gap-2 mb-0.5">
                            Elevate the Narrative
                            <span className="px-2 py-0.5 rounded-full bg-[#EC0618] text-white text-[9px] font-black uppercase tracking-widest hidden sm:inline-block shadow-[0_0_10px_rgba(236,6,24,0.4)]">
                                Pro
                            </span>
                        </h4>
                        <p className="text-zinc-500 text-xs md:text-sm">
                            Zero wait times, infinite character memory, and unrestricted scenarios.
                        </p>
                    </div>
                </div>
                
                {/* Right Side: Call to Action */}
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors ml-14 sm:ml-0 shrink-0">
                    Upgrade Now
                    <ArrowRight size={16} className="text-[#EC0618] group-hover:translate-x-1 transition-transform" />
                </div>
                
            </div>
        </div>
    );
};

export default PromoStrip;