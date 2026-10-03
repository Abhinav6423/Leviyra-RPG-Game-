import React, { useState, useCallback } from "react";
import { Play, ChevronLeft, ChevronRight, Loader2, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrendingChar } from "../../api-calls/topTrendingChar.js";

// ─── Fallback data ──────────────────────────────────────────────────────────
const DEFAULT_CHARACTER_DATA = [
    {
        _id: "eileen-crow",
        characterName: "Eileen Crow",
        storyName: "The Last Hunt Before Dawn",
        characterDescription:
            "A silent executioner of corrupted hunters, walking the cursed streets before dawn.",
        traits: ["A-Rank Assassin", "Shadow Agile"],
        cta: "Enter the Hunt",
    },
    {
        _id: "kael-draven",
        characterName: "Kael Draven",
        storyName: "Ashes of the Fallen King",
        characterDescription:
            "A cursed warrior bound to a throne he never wanted. The flames demand a heavier price.",
        traits: ["Flame Bearer", "Cursed King"],
        cta: "Join the War",
    },
];

const normalizeChar = (c) => ({
    id: c._id || c.id,
    name: c.characterName || c.name || "Unknown",
    description: c.characterDescription || c.description || "",
    traits: c.traits || [],
    image: c.profilePicture || "",
    cta: c.cta || "Begin Adventure",
    interactions: c.messageCount || 0,
});

// ─── Small presentational pieces ────────────────────────────────────────────
const TraitPill = ({ trait }) => (
    <span className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-medium backdrop-blur-sm">
        {trait}
    </span>
);

const Pips = ({ total, current, onSelect }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
            <button
                key={i}
                onClick={() => onSelect(i)}
                aria-label={`Go to character ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                    i === current ? "w-7 bg-[#00E676]" : "w-3 bg-white/25 hover:bg-white/50"
                }`}
            />
        ))}
    </div>
);

// The trending / interaction badge — one bold, sleek chip instead of two tiny ones.
const StatusBar = ({ rank, interactions }) => (
    <div className="inline-flex items-center gap-3 sm:gap-4 mb-5 lg:mb-7">
        <div className="flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-full bg-[#00E676] text-black">
            <Flame className="w-4 h-4 fill-black" />
            <span className="text-xs sm:text-sm font-extrabold">#{rank} Trending</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]" />
            </span>
            <span className="text-white text-xs sm:text-sm font-bold">
                {(interactions * 10000).toLocaleString()}
                <span className="text-zinc-400 font-medium"> interacting</span>
            </span>
        </div>
    </div>
);

// ─── Main component ─────────────────────────────────────────────────────────
const HeroChar = () => {
    const [index, setIndex] = useState(0);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["topTrendingChar"],
        queryFn: getTrendingChar,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const raw = data?.data || data;
    const characters = (Array.isArray(raw) && raw.length ? raw : DEFAULT_CHARACTER_DATA).map(
        normalizeChar
    );
    const total = characters.length;
    const char = characters[index];

    const goTo = useCallback((i) => setIndex((i + total) % total), [total]);

    if (isLoading) {
        return (
            <div className="h-[100dvh] bg-[#030303] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#00E676] animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-[100dvh] bg-[#030303] flex items-center justify-center">
                <button
                    onClick={refetch}
                    className="text-red-500 uppercase text-xs font-bold tracking-widest"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const [first, ...rest] = char.name.trim().split(" ");
    const last = rest.join(" ");

    return (
        <section className="relative w-full bg-[#030303] overflow-hidden font-sans selection:bg-[#00E676]/30 selection:text-white">
            <style>{`
                @keyframes heroFadeIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
                .hero-image { animation: heroFadeIn .5s ease-out both; }
                @keyframes heroTextIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .hero-text { animation: heroTextIn .5s ease-out both; }
            `}</style>

            <div className="relative w-full h-[100dvh] min-h-[600px] lg:h-[90vh] lg:min-h-[700px] lg:grid lg:grid-cols-[1fr_1.1fr] lg:max-w-[1800px] lg:mx-auto">
                {/* ── Image (single shared layer, one request at a time) ── */}
                <div className="absolute inset-0 lg:relative lg:h-full overflow-hidden bg-[#0a0a0a]">
                    <img
                        key={char.id}
                        src={char.image}
                        alt={char.name}
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        className="hero-image absolute inset-0 w-full h-full object-cover object-top"
                    />
                    {/* mobile overlay */}
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent lg:hidden" />
                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent lg:hidden" />
                    {/* desktop overlay */}
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-[#030303]/10 to-[#030303]" />
                </div>

                {/* ── Content (shared markup, responsive sizing) ── */}
                <div
                    key={char.id}
                    className="hero-text absolute inset-x-0 bottom-0 z-20 px-5 pb-28 sm:pb-32 lg:static lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-24 lg:pb-0 lg:bg-[#030303]"
                >
                    <div className="lg:max-w-2xl">
                        <StatusBar rank={index + 1} interactions={char.interactions} />

                        <h1 className="font-black uppercase tracking-tight leading-[0.92] text-white text-[38px] sm:text-[46px] lg:text-[clamp(48px,6vw,84px)] mb-4">
                            {first}
                            {last && <span className="text-zinc-500"> {last}</span>}
                        </h1>

                        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light line-clamp-3 lg:line-clamp-none max-w-xl mb-6 lg:mb-8">
                            {char.description}
                        </p>

                        {char.traits.length > 0 && (
                            <div className="hidden lg:flex flex-wrap gap-2 mb-10">
                                {char.traits.slice(0, 3).map((t) => (
                                    <TraitPill key={t} trait={t} />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 lg:gap-8">
                            <Link
                                to={`/character/${char.id}`}
                                className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl lg:rounded-[4px] bg-[#00E676] text-black text-xs sm:text-sm font-bold tracking-wide uppercase hover:bg-[#00E676]/90 active:scale-[0.98] transition-all"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                {char.cta}
                            </Link>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goTo(index - 1)}
                                    aria-label="Previous"
                                    className="w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl lg:rounded-[4px] bg-white/10 border border-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => goTo(index + 1)}
                                    aria-label="Next"
                                    className="w-12 h-12 lg:w-11 lg:h-11 flex items-center justify-center rounded-xl lg:rounded-[4px] bg-white/10 border border-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="hidden lg:flex items-center gap-6 ml-2">
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col gap-2">
                                    <Pips total={total} current={index} onSelect={setIndex} />
                                    <span className="font-mono text-[10px] tracking-widest text-zinc-600">
                                        <strong className="text-zinc-300">
                                            {String(index + 1).padStart(2, "0")}
                                        </strong>{" "}
                                        / {String(total).padStart(2, "0")}
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