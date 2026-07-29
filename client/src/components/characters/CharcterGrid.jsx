import React, { useEffect, lazy, Suspense } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getPublicCharacters } from '../../api-calls/getPublicCharacters.js';
import CharacterCard from './CharcterCard.jsx';
import { useAuth } from "../../context/Authcontext.jsx";

const PromoStrip = lazy(() => import('../promoStrips/PromoStrips.jsx'));

const CharacterGrid = () => {
    const { firebaseUser } = useAuth();


    // 1. Setup the intersection observer for infinite scroll
    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    // 2. Infinite Query
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["public-characters", "all"],
        queryFn: ({ pageParam = 1 }) => getPublicCharacters({ primaryTags: "all", page: pageParam, limit: 15 }),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 5,
    });

    // Trigger fetchNextPage when the user scrolls to the bottom 'ref' element
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten the pages into a single array for the grid
    const characters = data?.pages.flatMap(page => page.data) || [];

    const renderGrid = () => {
        if (isLoading) return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="rounded-xl bg-zinc-900/60 border border-white/5 animate-pulse h-56" />
                ))}
            </div>
        );

        if (isError) return <div className="text-red-400 py-12 text-center">Failed to load narratives.</div>;

        return (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                    {characters.map((char, i) => (
                        <CharacterCard
                            key={char._id}
                            char={char}
                            idx={i}
                            style={{ animationDelay: `${(i % 15) * 60}ms` }}
                        />
                    ))}
                </div>

                {/* The Invisible Trigger Element */}
                <div ref={ref} className="w-full h-20 mt-8 flex items-center justify-center">
                    {isFetchingNextPage && (
                        <div className="flex gap-2 items-center text-zinc-500">
                            <span className="w-2 h-2 rounded-full bg-zinc-500 animate-ping" />
                            <span className="text-sm">Loading more...</span>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <section className="relative w-full bg-[#0a0a0a] text-zinc-200 overflow-hidden font-sans selection:bg-white/10">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-overlay " />
            <div className="absolute top-0 left-[10%] w-[40vw] h-[40vw] max-w-[600px] bg-indigo-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pt-2 sm:pt-8 pb-20 animate-fade-up">



                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10 border-b border-zinc-800/80 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300" />
                            </span>
                            <span className="text-xs text-zinc-400 font-medium tracking-wide">
                                Story Library
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                            Explore <span className="text-zinc-500 font-medium">Narratives</span>
                        </h2>
                    </div>
                </div>

                <div className="relative w-full">
                    {renderGrid()}
                </div>
            </div>
        </section>
    );
};

export default CharacterGrid;