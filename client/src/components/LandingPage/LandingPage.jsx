import React from 'react';
import { Terminal, Users, BrainCircuit, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const theme = {
    bg: '#020503',
    primary: '#39ff14',
    secondary: '#22d3ee',
    textMain: '#e4e4e7',
    textMuted: '#71717a'
};

const features = [
    {
        icon: <BrainCircuit className="w-7 h-7" />,
        title: "UNBOUNDED STORIES",
        description: "No scripts. No rails. Every decision rewrites the world in real-time.",
        color: '#39ff14',
        delay: 'delay-[600ms]',
        borderColor: 'border-[#39ff14]/20 hover:border-[#39ff14]/50',
        cornerColor: 'border-[#39ff14]',
    },
    {
        icon: <Users className="w-7 h-7" />,
        title: "LIVING PERSONALITIES",
        description: "Characters with true memories and complex, evolving psyches.",
        color: '#22d3ee',
        delay: 'delay-[750ms]',
        borderColor: 'border-[#22d3ee]/15 hover:border-[#22d3ee]/40',
        cornerColor: 'border-[#22d3ee]',
    },
    {
        icon: <Terminal className="w-7 h-7" />,
        title: "SYSTEM GENERATED WORLD",
        description: "Dynamic environments that adapt physically to your narrative arc.",
        color: 'rgba(255,255,255,0.75)',
        delay: 'delay-[900ms]',
        borderColor: 'border-white/8 hover:border-white/22',
        cornerColor: 'border-white/40',
    }
];

export default function LandingPage() {
    return (
        <div
            style={{ backgroundColor: theme.bg, color: theme.textMain }}
            className="min-h-screen font-mono overflow-hidden relative selection:bg-[#39ff14]/20 selection:text-[#39ff14]"
        >
            {/* ── BACKGROUND LAYERS ── */}

            {/* Slow-drifting grid — CSS animation, zero JS */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none
                [background-image:linear-gradient(#39ff14_1px,transparent_1px),linear-gradient(90deg,#39ff14_1px,transparent_1px)]
                [background-size:48px_48px]
                animate-[gridDrift_8s_linear_infinite]" />

            {/* Scanline sweep */}
            <div className="absolute inset-x-0 top-0 h-[2px] pointer-events-none z-[1]
                bg-[linear-gradient(to_bottom,transparent,rgba(57,255,20,0.06),transparent)]
                animate-[scanline_6s_linear_infinite]" />

            {/* ── KEYFRAMES via Tailwind arbitrary — injected once ── */}
            <style>{`
                @keyframes gridDrift  { to { background-position: 48px 48px; } }
                @keyframes scanline   { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
                @keyframes fadeUp     { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes typewriter { from { width: 0; } to { width: 100%; } }
                @keyframes caretBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes ctaPulse   { 0%,100% { box-shadow: 0 0 0 0 rgba(57,255,20,.35); } 60% { box-shadow: 0 0 0 12px rgba(57,255,20,0); } }
                @keyframes cardIn     { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes lineDraw   { from { width: 0; } to { width: 40px; } }
                @keyframes pip        { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
                .animate-fadeUp       { animation: fadeUp .5s ease both; }
                .animate-ctaPulse     { animation: ctaPulse 2.5s 1.2s ease infinite; }
                .animate-cardIn       { animation: cardIn .5s ease both; opacity: 0; }
                .card-underline::after{ content:''; display:block; height:1px; background:currentColor;
                                        width:0; margin-top:4px; transition:width .3s ease; opacity:.4; }
                .group:hover .card-underline::after { width: 100%; }
            `}</style>

            {/* ── NAVBAR ── */}
            <header className="fixed top-0 left-0 w-full z-50 h-14 border-b border-white/5 bg-[#020503]/85
                before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-px before:bg-[#39ff14] before:opacity-40
                animate-fadeUp">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <h2 className="text-base font-black text-white tracking-[0.18em] uppercase">
                        LEVIYRA<span style={{ color: theme.primary }}>_OS</span>
                    </h2>
                    <Link to="/login">
                        <button className="flex items-center gap-2 px-5 py-2 border border-[#39ff14]/30 text-[#39ff14]
                            text-[10px] font-black uppercase tracking-[0.2em] bg-[#39ff14]/5
                            hover:bg-[#39ff14]/12 hover:border-[#39ff14] transition-all duration-200">
                            <Play size={12} className="fill-current" />
                            ENGAGE
                        </button>
                    </Link>
                </div>
            </header>

            {/* ── HERO ── */}
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-7 relative z-10">

                {/* Badge — fade up, delay 100ms */}
                <div className="animate-fadeUp [animation-delay:100ms] opacity-0
                    flex items-center gap-2.5 px-3.5 py-2 bg-[#020503]/70 border border-[#39ff14]/20">
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inset-0 rounded-full bg-[#39ff14] opacity-50 animate-ping" />
                        <span className="relative w-2 h-2 rounded-full bg-[#39ff14]" />
                    </span>
                    <span style={{ color: theme.primary }} className="text-[11px] font-black tracking-widest">340,000,000</span>
                    <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Real Interactions</span>
                </div>

                {/* Heading — fade up, delay 200ms */}
                <h1 className="animate-fadeUp [animation-delay:200ms] opacity-0
                    text-white font-black uppercase leading-[.92] tracking-tighter
                    text-[clamp(40px,7.5vw,86px)] max-w-4xl">
                    AI FORMS{' '}
                    <span style={{ color: theme.primary }}>REALITY</span>.<br />
                    YOU FORM THE STORY.
                </h1>

                {/* Typewriter status line — fade up delay 300ms, typewriter starts at 800ms */}
                <div className="animate-fadeUp [animation-delay:300ms] opacity-0
                    text-[#39ff14]/45 text-[11px] font-bold tracking-[.12em] uppercase
                    overflow-hidden whitespace-nowrap">
                    <span className="inline-block overflow-hidden whitespace-nowrap
                        border-r-2 border-[#39ff14]
                        [animation:typewriter_2.2s_.8s_steps(40)_forwards,caretBlink_.7s_3s_step-end_6]
                        w-0 max-w-full">
                        // NEURAL_LINK: ESTABLISHED · PROTOCOL: ACTIVE
                    </span>
                </div>

                {/* Body — fade up delay 400ms */}
                <p className="animate-fadeUp [animation-delay:400ms] opacity-0
                    text-[15px] leading-relaxed font-light text-zinc-400 max-w-[540px]">
                    Step into Leviyra_OS — the first endless AI RPG. A neural interface generates boundless
                    narratives, complex characters, and living worlds that react dynamically to your every
                    decision. No scripts. No limits.
                </p>

                {/* CTA — fade up delay 500ms, pulse loop after 1.2s */}
                <div className="animate-fadeUp [animation-delay:500ms] opacity-0 flex flex-col items-center gap-3 mt-2">
                    <Link to="/login" className="focus:outline-none">
                        <button
                            style={{ backgroundColor: theme.primary }}
                            className="animate-ctaPulse group relative flex items-center gap-3
                                px-10 py-4 text-[#020503] font-black text-[11px] uppercase tracking-[.25em]
                                hover:brightness-105 transition-all duration-200"
                        >
                            {/* Corner brackets */}
                            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#020503]/50" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#020503]/50" />
                            <Play size={14} className="fill-current" />
                            BEGIN YOUR PROTOCOL
                        </button>
                    </Link>
                    <span className="text-[9px] font-bold tracking-[.2em] uppercase text-zinc-700">
                        Neural Link: ESTABLISHED
                    </span>
                </div>
            </main>

            {/* ── FEATURE CARDS ── */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">

                {/* Divider that draws in */}
                <div className="h-px bg-[#39ff14]/25 mx-auto mb-14
                    [animation:lineDraw_.7s_1.1s_ease_forwards] w-0" />

                <div className="grid md:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            style={{ borderColor: 'transparent' }}
                            className={`group relative flex flex-col gap-5 bg-[#050f08]/80 border p-7
                                ${f.borderColor} ${f.delay}
                                animate-cardIn
                                hover:-translate-y-1 transition-all duration-250`}
                        >
                            {/* HUD corner bracket */}
                            <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${f.cornerColor}`} />

                            <div style={{ color: f.color }}>
                                <div className="p-2.5 border border-current w-fit bg-white/3">
                                    {f.icon}
                                </div>
                            </div>

                            <h3
                                style={{ color: f.color }}
                                className="card-underline text-[13px] font-black uppercase tracking-[.06em]"
                            >
                                {f.title}
                            </h3>

                            <p className="text-[13px] font-light leading-relaxed text-zinc-500 mt-auto">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER STATUS ── */}
            <div className="relative z-10 flex items-center justify-center gap-4 pb-8
                animate-fadeUp [animation-delay:1050ms] opacity-0">
                {['Neural_V.1.0.4', 'Server: PUBLIC', 'EXECUTE PROTOCOL'].map((s, i) => (
                    <React.Fragment key={s}>
                        <span className={`font-mono text-[9px] font-bold tracking-[.14em] uppercase
                            ${i === 2 ? 'text-[#39ff14]/55' : 'text-zinc-700'}`}>
                            {s}
                        </span>
                        {i < 2 && <span className="w-px h-3 bg-zinc-800 skew-x-[-20deg]" />}
                    </React.Fragment>
                ))}
            </div>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 bg-[#020503] relative z-20">
                <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p style={{ color: theme.textMuted }} className="text-[9px] tracking-widest uppercase">
                        © Leviyra_OS :: Neural Narrative Division. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6 text-[9px] text-zinc-500 tracking-widest uppercase">
                        <a href="/status" className="hover:text-[#39ff14] transition-colors">Network_Status</a>
                        <a href="/terms" className="hover:text-[#22d3ee] transition-colors">Security_Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}