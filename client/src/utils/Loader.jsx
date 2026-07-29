import { Terminal } from "lucide-react"; // Make sure your icon is imported

export default function Loader() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#020503] flex flex-col items-center justify-center font-mono overflow-hidden">
            
            {/* 1. Subtle Tech Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(#39ff14_1px,transparent_1px),linear-gradient(90deg,#39ff14_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            {/* 2. CRT/Scanline Overlay for vintage tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-0 pointer-events-none opacity-20" />

            {/* Ambient Core Glow */}
            <div className="absolute w-[300px] h-[300px] bg-[#39ff14]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                
                {/* 3. Gamified HUD Core */}
                <div className="relative flex items-center justify-center w-24 h-24">
                    {/* Outer spinning targeting ring */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#39ff14]/30 animate-[spin_6s_linear_infinite]" />
                    {/* Inner pulsing energy ring */}
                    <div className="absolute inset-2 rounded-full border border-[#39ff14]/20 bg-[#39ff14]/5 animate-ping opacity-50 duration-1000" />
                    {/* Core Icon */}
                    <Terminal size={32} className="text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]" />
                </div>
                
                <div className="flex flex-col items-center gap-3">
                    {/* 4. Two-Tone System Title */}
                    <h1 className="text-white font-black tracking-[0.3em] text-2xl sm:text-3xl uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        LEVIYRA<span className="text-[#39ff14]">_OS</span>
                    </h1>
                    
                    {/* 5. Minimalist Cyberpunk Progress Bar */}
                    <div className="w-56 h-[2px] bg-white/10 relative overflow-hidden mt-1">
                        {/* Note: This uses arbitrary Tailwind values for a simulated load animation */}
                        <div className="absolute top-0 left-0 h-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] w-full origin-left animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animation: "pulse 1.5s ease-in-out infinite, scale-x 2s ease-in-out infinite alternate" }} />
                    </div>
                    
                    {/* Subtext with strict Terminal blinking cursor */}
                    <div className="flex items-center text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#39ff14]/70 mt-2">
                        <span>Initializing_Neural_Link</span>
                        <span className="inline-block w-2 h-3.5 bg-[#39ff14] ml-2 animate-[pulse_0.8s_step-end_infinite] shadow-[0_0_5px_#39ff14]" />
                    </div>
                </div>
            </div>
            
            {/* Corner Decorative Elements */}
            <div className="absolute bottom-6 right-6 text-[8px] text-[#39ff14]/40 font-mono tracking-widest uppercase">
                SYS.V.1.0.4
            </div>
        </div>
    );
}