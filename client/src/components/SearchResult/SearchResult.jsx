import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CharacterCard from "../characters/CharcterCard.jsx";
import { getSearchedCharacters } from "../../api-calls/searchCharacters.js";

const SearchResult = () => {
    const { searchTerm } = useParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["search-characters", searchTerm],
        queryFn: async () => {
            const response = await getSearchedCharacters(searchTerm);
            return response.data; // unwrap { success, data } envelope from the API
        },
        enabled: !!searchTerm,
    });

    const characters = data ?? [];

    return (
        <div className="relative min-h-screen w-full bg-[#030303] font-sans selection:bg-[#00DC82]/20 selection:text-[#00DC82] mb-15 sm:mb-10">

            {/* ── Centered Premium Green Radial Glow ── */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(0,220,130,0.06),rgba(0,0,0,0))] pointer-events-none" />

            {/* Widened container with proper top padding to clear the navbar */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-2 pb-8">

                {/* ── Centered, Compact Header ── */}
                <header className="mb-10 md:mb-14 flex flex-col items-center text-center max-w-3xl mx-auto mt-10 sm:mt-5">
                    

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight capitalize leading-tight">
                        "{searchTerm}" <span className="text-[#00DC82] font-medium tracking-normal">Matches</span>
                    </h1>

                    <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
                        {isLoading
                            ? "Scanning the directory..."
                            : `${characters.length} ${characters.length === 1 ? "entity" : "entities"} found matching your query.`}
                    </p>

                    <div className="mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </header>

                {/* ── Standard 5-Column Loading Skeleton ── */}
                {isLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                        {Array.from({ length: 10 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-[#0A0A0A] border border-white/5 animate-pulse h-[280px] md:h-[320px] shadow-sm"
                            />
                        ))}
                    </div>
                )}

                {/* ── Error State (Kept red, but made sleek and premium) ── */}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-red-500/10 rounded-[2rem] bg-gradient-to-b from-[#0A0A0A] to-[#030303] shadow-xl max-w-2xl mx-auto mt-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)] rotate-3">
                            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
                            System Error
                        </h3>
                        <p className="text-sm text-zinc-500 max-w-sm font-medium leading-relaxed">
                            We couldn't load the search results right now. Please try again in a moment.
                        </p>
                    </div>
                )}

                {/* ── Results Grid ── */}
                {!isLoading && !isError && characters.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
                        {characters.map((char, idx) => (
                            <div
                                key={char._id}
                                className="group relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 transition-all duration-300 hover:border-[#00DC82]/30 hover:shadow-[0_8px_30px_rgba(0,220,130,0.08)] hover:-translate-y-1"
                            >
                                <CharacterCard char={char} idx={idx} />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Clean Empty State ── */}
                {!isLoading && !isError && characters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-white/5 rounded-[2rem] bg-gradient-to-b from-[#0A0A0A] to-[#030303] shadow-xl max-w-2xl mx-auto mt-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#00DC82]/5 border border-[#00DC82]/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,220,130,0.05)] rotate-3 transition-transform hover:rotate-0 duration-300">
                            <svg className="w-7 h-7 text-[#00DC82]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
                            No Matches Found
                        </h3>
                        <p className="text-sm text-zinc-500 max-w-sm font-medium leading-relaxed">
                            Nothing matches <span className="text-zinc-300">"{searchTerm}"</span> in the directory. Try using a different keyword or name.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResult;