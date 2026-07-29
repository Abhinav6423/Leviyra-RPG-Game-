import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Play, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrendingChar } from '../../api-calls/topTrendingChar.js';

// ─── Fallback data ────────────────────────────────────────────────────────────
const DEFAULT_CHARACTER_DATA = [
    {
        _id: "eileen-crow",
        characterName: "Eileen Crow",
        storyName: "The Last Hunt Before Dawn",
        characterDescription: "A silent executioner of corrupted hunters, walking the cursed streets before dawn.",
        traits: ["A-Rank Assassin", "Shadow Agile"],
        cta: "Enter the Hunt",
    },
    {
        _id: "kael-draven",
        characterName: "Kael Draven",
        storyName: "Ashes of the Fallen King",
        characterDescription: "A cursed warrior bound to a throne he never wanted. The flames demand a heavier price.",
        traits: ["Flame Bearer", "Cursed King"],
        cta: "Join the War",
    },
];

// ─── Normalize API → internal shape ──────────────────────────────────────────
const normalizeChar = (c) => ({
    id: c._id || c.id,
    name: c.characterName || c.name || "Unknown",
    storyTitle: c.storyName || c.storyTitle || "",
    description: c.characterDescription || c.description || "",
    traits: c.traits || [],
    image: c.profilePicture || "",
    cta: c.cta || "Read Story",
    interactionsCount: c.messageCount || 0,
});

// ─── Pure CSS Animations (GPU Accelerated) ───────────────────────────────────
const InjectStyles = memo(() => (
    <style>{`
        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translate3d(0, 15px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeSlideRight {
            from { opacity: 0; transform: translate3d(20px, 0, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-fade-up { 
            animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            will-change: opacity, transform;
        }
        .animate-fade-right { 
            animation: fadeSlideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            will-change: opacity, transform;
        }
    `}</style>
));

// ─── Sleek UI Components ─────────────────────────────────────────────────────
const PulsingDot = memo(() => (
    <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E676]"></span>
    </span>
));

const TraitPill = memo(({ trait }) => (
    <span className="px-3.5 py-1.5 rounded-sm bg-white/[0.03] border border-white/10 text-zinc-300 text-[10px] font-medium tracking-wide hover:bg-white/10 hover:text-white transition-colors cursor-default backdrop-blur-md uppercase">
        {trait}
    </span>
));

const Pips = memo(({ total, current, onSelect }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
            <button
                key={i}
                onClick={() => onSelect(i)}
                aria-label={`Go to character ${i + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ease-out ${i === current ? "w-8 bg-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.6)]" : "w-3 bg-white/30 hover:bg-white/60"
                    }`}
            />
        ))}
    </div>
));

// Optimized Native CSS Crossfade Image Component
const CharImage = memo(({ char, isActive, isAdjacent }) => {
    // Only mount the image if it is active, or right next to the active one to save DOM memory.
    if (!isActive && !isAdjacent) return null;

    return (
        <img
            src={char.image}
            alt={char.name}
            // Eager load only the active image. Lazy load adjacent ones.
            fetchpriority={isActive ? "high" : "low"}
            loading={isActive ? "eager" : "lazy"}
            decoding="async"
            style={{ willChange: "transform, opacity" }}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                }`}
        />
    );
});

// ─── Main component ───────────────────────────────────────────────────────────
const HeroChar = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["topTrendingChar"],
        queryFn: getTrendingChar,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const characterData = useMemo(() => {
        const raw = data?.data || data;
        const list = Array.isArray(raw) ? raw : DEFAULT_CHARACTER_DATA;
        return list.map(normalizeChar);
    }, [data]);

    const total = characterData.length;
    const activeChar = characterData[currentIndex] ?? characterData[0];

    const nameParts = activeChar?.name.trim().split(" ") ?? [];
    const nameFirst = nameParts[0] ?? "";
    const nameRest = nameParts.slice(1).join(" ");

    const traits = useMemo(() => {
        return (activeChar?.traits?.length > 0
            ? activeChar.traits
            : [activeChar?.storyTitle]
        ).filter(Boolean).slice(0, 3);
    }, [activeChar]);

    const interactionCount = useMemo(() =>
        ((activeChar?.interactionsCount || 0) * 10000).toLocaleString(),
        [activeChar]);

    const goTo = useCallback((index) => setCurrentIndex((index + total) % total), [total]);
    const handlePrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);
    const handleNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);

    // Offload preloading to not block the main thread animation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            [(currentIndex + 1) % total, (currentIndex - 1 + total) % total].forEach((i) => {
                if (characterData[i]?.image) {
                    const img = new Image();
                    img.src = characterData[i].image;
                }
            });
        }, 300); // Wait 300ms for slide animation to start cleanly
        return () => clearTimeout(timeoutId);
    }, [currentIndex, characterData, total]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleNext, handlePrev]);

    if (isLoading) return (
        <div className="h-[100dvh] bg-[#030303] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#00E676] animate-spin" />
        </div>
    );

    if (isError) return (
        <div className="h-[100dvh] bg-[#030303] flex items-center justify-center">
            <button onClick={refetch} className="text-red-500 uppercase text-xs font-bold tracking-widest">Retry Connection</button>
        </div>
    );

    const ctaLink = `/character/${activeChar?.id}`;
    const ctaLabel = activeChar?.cta || "Read Story";

    // Helper to determine if an image should be mounted in DOM
    const isAdjacent = (index) => {
        if (index === currentIndex) return true;
        if (index === (currentIndex + 1) % total) return true;
        if (index === (currentIndex - 1 + total) % total) return true;
        return false;
    };

    return (
        <section className="relative w-full bg-[#030303] overflow-hidden font-sans selection:bg-[#00E676]/30 selection:text-white">
            <InjectStyles />

            {/* ── MOBILE VIEW (OPTIMIZED FOR PERFORMANCE & UX) ── */}
            <div className="block lg:hidden relative w-full h-[100dvh] min-h-[600px]">

                {/* Images */}
                {characterData.map((char, i) => (
                    <CharImage
                        key={char.id}
                        char={char}
                        isActive={i === currentIndex}
                        isAdjacent={isAdjacent(i)}
                    />
                ))}

                {/* Performance-friendly Gradients (No backdrop-blurs) */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-10 pointer-events-none" />

                {/* Top Interactions Badge */}
                <div className="absolute top-safe pt-20 inset-x-5 z-30 flex justify-end items-center">
                    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/80 border border-white/10 shadow-md">
                        <PulsingDot />
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase mt-[1px]">
                            {interactionCount} <span className="text-zinc-400 font-medium">Interactions</span>
                        </span>
                    </div>
                </div>

                {/* 
                    FIX 1: z-[20] and pb-[100px] ensures the CTA is lifted safely above the bottom nav bar.
                    Adjust the 100px up or down slightly if your specific nav bar is taller/shorter. 
                */}
                <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[100px] flex flex-col">

                    {/* 
                        FIX 2: Removed the dynamic key={...} so React doesn't destroy and rebuild this div.
                        Added transition-opacity for smooth text swapping. 
                    */}
                    <div className="flex flex-col transition-opacity duration-300">
                        <div className="self-start px-2.5 py-1 mb-3 rounded-[3px] bg-[#00E676] text-[9px] font-bold tracking-widest uppercase text-black shadow-sm">
                            Trending #{currentIndex + 1}
                        </div>

                        <h1 className="text-[40px] leading-[0.95] font-black uppercase tracking-tight mb-3">
                            <span className="text-white drop-shadow-md">{nameFirst}</span>
                            <br />
                            {nameRest && <span className="text-zinc-400 drop-shadow-md">{nameRest}</span>}
                        </h1>

                        <p className="text-sm text-zinc-300 leading-relaxed font-light line-clamp-3 mb-6 drop-shadow-md pr-2">
                            {activeChar?.description}
                        </p>

                        <div className="flex items-center gap-3">
                            {/* Main CTA Button */}
                            <Link to={ctaLink} className="flex-1 flex justify-center items-center gap-2 px-4 py-4 rounded-xl bg-[#00E676] text-black text-xs font-bold tracking-widest uppercase hover:bg-[#00E676]/90 active:scale-[0.98] transition-all shadow-md">
                                <Play className="w-4 h-4 fill-current" />
                                {ctaLabel}
                            </Link>

                            {/* Nav Buttons (48x48px for perfect mobile touch targets) */}
                            <div className="flex gap-2">
                                <button onClick={handlePrev} aria-label="Previous" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/5 text-white active:bg-white/20 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={handleNext} aria-label="Next" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/5 text-white active:bg-white/20 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP MINIMAL VIEW ── */}
            <div className="hidden lg:grid grid-cols-[1fr_1.1fr] w-full h-[90vh] min-h-[700px] max-w-[1800px] mx-auto">
                <div className="relative overflow-hidden group">
                    {characterData.map((char, i) => (
                        <CharImage
                            key={char.id}
                            char={char}
                            isActive={i === currentIndex}
                            isAdjacent={isAdjacent(i)}
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#030303]/20 to-[#030303] z-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-90 z-20 pointer-events-none" />
                </div>

                <div className="relative flex flex-col justify-center px-16 xl:px-24 bg-[#030303] z-30">
                    <div key={`desktop-text-${currentIndex}`} className="relative max-w-2xl animate-fade-right">
                        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase mb-8">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white">
                                <PulsingDot />
                                {interactionCount} <span className="text-zinc-500">interactions</span>
                            </div>
                            <span className="text-zinc-500">
                                Global Rank <strong className="text-[#00E676]">#{currentIndex + 1}</strong>
                            </span>
                        </div>

                        <h1 className="font-black uppercase tracking-tighter leading-[0.9] text-[clamp(48px,6vw,84px)] mb-6 text-white">
                            {nameFirst}
                            <br />
                            {nameRest && <span className="text-zinc-500">{nameRest}</span>}
                        </h1>

                        <div className="relative pl-5 mb-10 border-l-2 border-[#00E676]">
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00E676] mb-3">Intelligence Profile</p>
                            <p className="text-base text-zinc-300 leading-relaxed font-light max-w-xl">
                                {activeChar?.description.slice(0, 300)}{activeChar?.description.length > 300 ? "..." : ""}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 mb-12">
                            {traits?.map((trait, i) => (
                                <TraitPill key={i} trait={trait} />
                            ))}
                        </div>

                        <div className="flex items-center gap-10">
                            <Link to={ctaLink} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-[4px] transition-all hover:bg-zinc-200 active:scale-[0.98]">
                                <Play className="relative w-4 h-4 fill-current z-10" />
                                <span className="relative text-[11px] font-bold tracking-widest uppercase z-10">{ctaLabel}</span>
                            </Link>

                            <div className="flex items-center gap-6">
                                <div className="flex gap-1">
                                    <button onClick={handlePrev} aria-label="Previous" className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all rounded-[4px]"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={handleNext} aria-label="Next" className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all rounded-[4px]"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10" />
                                <div className="flex flex-col gap-2 justify-center">
                                    <Pips total={total} current={currentIndex} onSelect={setCurrentIndex} />
                                    <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
                                        <strong className="text-zinc-300">{String(currentIndex + 1).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroChar;