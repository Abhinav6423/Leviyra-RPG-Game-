import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CharacterCard from "../characters/CharcterCard";
import { getPublicCharacters } from "../../api-calls/getPublicCharacters.js";


const SKELETON_ITEMS = Array.from({ length: 10 });

const CategorySearchResult = () => {
    const { category } = useParams();

    const primaryTags = category

    console.log("CategorySearchResult rendered with category:", primaryTags);


    const { data: characters = [], isLoading, isError } = useQuery({
        queryKey: ["characters", category],
        queryFn: () => getPublicCharacters({ primaryTags }).then(res => res.data),
        staleTime: 1000 * 60 * 5,

    });


    if (isLoading) {
        return (
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                    {SKELETON_ITEMS.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-[#0A0A0A] border border-white/5 animate-pulse h-[280px] md:h-[320px] shadow-sm"
                        />
                    ))}
                </div>
            </div>
        );
    }


    if (isError) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 pt-40 pb-20 flex flex-col items-center justify-center gap-4 text-center ">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-zinc-200 font-semibold tracking-wide text-lg">Failed to load this realm</p>
                <p className="text-zinc-500 text-sm">Our servers encountered an anomaly. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0a] font-sans selection:bg-white/10 selection:text-white mb-19 sm:mb-5">
            {/* Centered Premium Radial Glow */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(99,102,241,0.03),rgba(0,0,0,0))] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-15 md:pt-2 pb-5">
                {/* Header Section */}
                <header className="mb-10 md:mb-14 flex flex-col items-center text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:mt-5 md:text-4xl lg:text-5xl font-semibold text-white mb-4 tracking-tight capitalize leading-tight">
                        {category} <span className="text-zinc-500 font-medium">Realm</span>
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
                        Explore powerful entities and unique beings aligned with the <span className="text-zinc-200 font-medium">{category}</span> domain.
                    </p>
                    <div className="mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />
                </header>

                {/* Grid Results or Empty State */}
                {characters.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {characters.map((char, idx) => (
                            <CharacterCard key={char._id} char={char} idx={idx} />
                        ))}
                    </div>
                ) : (
                    /* Clean Empty State */
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-zinc-800/60 rounded-[2rem] bg-gradient-to-b from-zinc-900/20 to-[#0a0a0a] shadow-xl max-w-2xl mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-md rotate-3 transition-transform hover:rotate-0 duration-300">
                            <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight text-zinc-200 mb-2">
                            No Profiles Found
                        </h3>
                        <p className="text-sm text-zinc-500 max-w-sm font-medium leading-relaxed">
                            There are currently no entities available in this realm directory. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategorySearchResult;