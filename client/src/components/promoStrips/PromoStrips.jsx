import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const PromoStrip = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/subscription")}
      className="group relative w-full rounded-2xl overflow-hidden cursor-pointer mb-8 sm:mb-12
                 bg-[#0c0c0e] border border-white/[0.06]
                 hover:border-[#EC0618]/25
                 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]
                 hover:shadow-[0_8px_32px_-4px_rgba(236,6,24,0.12)]
                 transition-all duration-500"
    >
      {/* Soft ambient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#EC0618]/[0.03] via-transparent to-[#EC0618]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#EC0618]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-4.5">
        {/* Left content */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                          bg-[#EC0618]/10 border border-[#EC0618]/20
                          text-[#EC0618]
                          group-hover:bg-[#EC0618]/15 group-hover:scale-105
                          transition-all duration-400"
          >
            <Sparkles size={18} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <h4 className="text-[14px] sm:text-[15px] font-semibold text-zinc-100 tracking-tight">
                Elevate the Narrative
              </h4>
              <span
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full
                               bg-[#EC0618] text-white text-[9px] font-bold uppercase tracking-wider
                               shadow-[0_0_12px_rgba(236,6,24,0.35)]"
              >
                Pro
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-zinc-500 leading-snug">
              Zero wait times · Infinite memory · Unrestricted scenarios
            </p>
          </div>
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-1.5 pl-13 sm:pl-0 shrink-0
                        text-[13px] font-medium text-zinc-400
                        group-hover:text-white transition-colors duration-300"
        >
          Upgrade Now
          <ArrowRight
            size={15}
            className="text-[#EC0618] group-hover:translate-x-1 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoStrip;
