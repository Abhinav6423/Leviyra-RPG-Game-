import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import CharacterCard from "../characters/CharcterCard";
import { getPublicCharacters } from "../../api-calls/getPublicCharacters.js";

const SKELETON_ITEMS = Array.from({ length: 10 });

// Per-category mood: a soft background glow + accent color, so the page feels
// different before you even look at the cards. Falls back to a neutral indigo.
const CATEGORY_THEMES = {
    "slice-of-life": {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251,146,60,0.14), rgba(0,0,0,0))",
        accent: "text-orange-400",
        divider: "via-orange-500/40",
    },
    cyberpunk: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.16), rgba(0,0,0,0))",
        accent: "text-emerald-400",
        divider: "via-emerald-500/40",
    },
    fantasy: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(168,85,247,0.14), rgba(0,0,0,0))",
        accent: "text-purple-400",
        divider: "via-purple-500/40",
    },
    romance: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(244,63,94,0.14), rgba(0,0,0,0))",
        accent: "text-rose-400",
        divider: "via-rose-500/40",
    },
    horror: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(220,38,38,0.16), rgba(0,0,0,0))",
        accent: "text-red-500",
        divider: "via-red-500/40",
    },
    "sci-fi": {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(56,189,248,0.16), rgba(0,0,0,0))",
        accent: "text-sky-400",
        divider: "via-sky-500/40",
    },
    action: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.16), rgba(0,0,0,0))",
        accent: "text-orange-500",
        divider: "via-orange-500/40",
    },
    historical: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,119,6,0.14), rgba(0,0,0,0))",
        accent: "text-amber-500",
        divider: "via-amber-500/40",
    },
    anime: {
        glow: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(236,72,153,0.14), rgba(0,0,0,0))",
        accent: "text-pink-400",
        divider: "via-pink-500/40",
    },
};

const DEFAULT_THEME = {
    glow: "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(99,102,241,0.08), rgba(0,0,0,0))",
    accent: "text-indigo-400",
    divider: "via-zinc-800/80",
};

const getTheme = (category) => {
    const key = (category || "").toLowerCase().trim().replace(/\s+/g, "-");
    return CATEGORY_THEMES[key] || DEFAULT_THEME;
};

// The end-of-grid (and empty-state) card that turns "didn't find who I wanted"
// into someone building it themselves.
const CreateCharacterCard = ({ category, accent }) => (
    <Link
        to={`/create?category=${encodeURIComponent(category || "")}`}
        className={`group flex flex-col items-center justify-center gap-3 h-full min-h-[280px] md:min-h-[320px] rounded-2xl border-2 border-dashed border-zinc-700/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-current ${accent} transition-all duration-300 text-center p-6`}
    >
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-current/10 transition-colors">
            <Plus className="w-6 h-6 text-zinc-400 group-hover:text-current transition-colors" />
        </div>
        <p className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors capitalize">
            Create a {category} Character
        </p>
        <p className="text-xs text-zinc-500 max-w-[180px]">
            Didn't find who you're looking for? Build them yourself.
        </p>
    </Link>
);

const CategorySearchResult = () => {
    const { category } = useParams();
    const primaryTags = category;
    const theme = getTheme(category);

    const {
        data: characters = [],
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ["characters", category],
        queryFn: () => getPublicCharacters({ primaryTags }).then((res) => res.data),
        staleTime: 1000 * 60 * 5,
    });

    // Loading covers both the very first load AND switching to a new category
    // (new query key = no cached data yet) — either way we want the skeleton,
    // never a blank page.
    const showSkeleton = isLoading || (isFetching && characters.length === 0);

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0a] font-sans selection:bg-white/10 selection:text-white mb-19 sm:mb-5">
            {/* Thematic banner glow — renders immediately, even before data arrives */}
            <div
                className="absolute top-0 inset-x-0 h-[600px] pointer-events-none"
                style={{ background: theme.glow }}
            />

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-15 md:pt-2 pb-5">
                {/* Header Section — always visible, so switching categories never looks blank */}
                <header className="mb-10 md:mb-14 flex flex-col items-center text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:mt-5 md:text-4xl lg:text-5xl font-semibold text-white mb-4 tracking-tight capitalize leading-tight flex items-center gap-3">
                        {category} <span className={`${theme.accent} font-medium`}>Realm</span>
                        {isFetching && !showSkeleton && (
                            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                        )}
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
                        Explore powerful entities and unique beings aligned with the{" "}
                        <span className="text-zinc-200 font-medium">{category}</span> domain.
                    </p>
                    <div className={`mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent ${theme.divider} to-transparent`} />
                </header>

                {isError ? (
                    <div className="w-full max-w-3xl mx-auto pb-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-zinc-200 font-semibold tracking-wide text-lg">Failed to load this realm</p>
                        <p className="text-zinc-500 text-sm">Our servers encountered an anomaly. Please try again later.</p>
                    </div>
                ) : showSkeleton ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {SKELETON_ITEMS.map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl bg-[#0A0A0A] border border-white/5 animate-pulse h-[280px] md:h-[320px] shadow-sm"
                            />
                        ))}
                    </div>
                ) : characters.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {characters.map((char) => (
                            <CharacterCard key={char._id} char={char} />
                        ))}
                        {/* Growth loop: last tile in the grid always invites creation */}
                        <CreateCharacterCard category={category} accent={theme.accent} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800/60 rounded-[2rem] bg-gradient-to-b from-zinc-900/20 to-[#0a0a0a] shadow-xl max-w-md mx-auto">
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-200 mb-2">
                            No Profiles Found
                        </h3>
                        <p className="text-sm text-zinc-500 max-w-sm font-medium leading-relaxed mb-6">
                            There are currently no entities available in this realm directory.
                        </p>
                        <div className="w-full max-w-[260px]">
                            <CreateCharacterCard category={category} accent={theme.accent} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategorySearchResult;