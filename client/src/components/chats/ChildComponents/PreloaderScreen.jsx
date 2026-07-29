import React from 'react';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import { PRONOUN_OPTIONS } from '../logic/constants.js';

const PreloaderScreen = ({
    displayCharName, avatarSrc, firstDialogues,
    displayName, setDisplayName, pronouns, setPronouns,
    scenarioMode, setScenarioMode, customFirstMessage, setCustomFirstMessage,
    startingChat, preloaderError, onSubmit, glowColor
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md">
        <div
            className="w-full h-full sm:max-w-5xl sm:h-[80vh] bg-[#09090B]/90 backdrop-blur-3xl sm:border sm:border-white/[0.08] sm:rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
            style={{ boxShadow: `0 0 60px -20px ${glowColor}40` }}
        >
            <div className="flex flex-col w-full h-44 md:h-full md:w-[40%] relative bg-black shrink-0">
                {avatarSrc && (
                    <img src={avatarSrc} alt={displayCharName} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent md:bg-gradient-to-r md:from-transparent md:via-[#09090B]/60 md:to-[#09090B]" />
                <div className="relative z-10 mt-auto p-6 md:p-9">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 tracking-tight drop-shadow-lg">
                        {displayCharName}
                    </h1>
                    <p className="text-stone-400 text-[13px]">Set the scene before you start.</p>
                </div>
            </div>

            <div className="w-full md:w-[60%] p-6 md:p-10 overflow-y-auto scrollbar-hide flex flex-col relative z-10">
                <form onSubmit={onSubmit} className="flex flex-col gap-7 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-bold text-stone-500 mb-2 tracking-[0.08em] uppercase">Your name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                                maxLength={40}
                                className="w-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-lg px-4 py-3 text-white text-[14px] focus:outline-none focus:border-white/40 transition-colors placeholder:text-stone-600 shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-stone-500 mb-2 tracking-[0.08em] uppercase">Pronouns</label>
                            <div className="flex flex-wrap gap-2">
                                {PRONOUN_OPTIONS.map((p) => (
                                    <button
                                        key={p} type="button" onClick={() => setPronouns(p)}
                                        className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all border shadow-sm
                                            ${pronouns === p
                                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                                : 'bg-white/[0.02] border-white/[0.08] text-stone-400 hover:bg-white/[0.08] hover:text-white'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="block text-[11px] font-bold text-stone-500 mb-3 tracking-[0.08em] uppercase">Starting scenario</label>
                        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 pb-2 scrollbar-hide">
                            {firstDialogues.length === 0 && (
                                <p className="text-[13px] text-stone-500 p-4 bg-white/[0.02] backdrop-blur-md rounded-xl border border-white/[0.06]">
                                    This character has no preset scenarios. Write your own to begin.
                                </p>
                            )}
                            {firstDialogues.map((dialogue, index) => (
                                <div
                                    key={index} onClick={() => setScenarioMode(index)}
                                    className={`relative p-4 rounded-xl cursor-pointer transition-all border backdrop-blur-md
                                        ${scenarioMode === index
                                            ? 'bg-white/[0.05] border-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[12.5px] font-semibold ${scenarioMode === index ? 'text-white' : 'text-stone-400'}`}>Scenario {index + 1}</span>
                                        {scenarioMode === index && <Check size={15} className="text-white" />}
                                    </div>
                                    <p className={`text-[13px] leading-relaxed line-clamp-3 ${scenarioMode === index ? 'text-stone-200' : 'text-stone-500'}`}>{dialogue}</p>
                                </div>
                            ))}
                            <div
                                onClick={() => setScenarioMode("custom")}
                                className={`relative p-4 rounded-xl cursor-pointer transition-all border backdrop-blur-md
                                    ${scenarioMode === "custom"
                                        ? 'bg-white/[0.05] border-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`text-[12.5px] font-semibold ${scenarioMode === "custom" ? 'text-white' : 'text-stone-400'}`}>Write your own</span>
                                    {scenarioMode === "custom" && <Check size={15} className="text-white" />}
                                </div>
                                <div className={`grid transition-all duration-300 ${scenarioMode === "custom" ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
                                    <div className="overflow-hidden">
                                        <textarea
                                            value={customFirstMessage}
                                            onChange={(e) => setCustomFirstMessage(e.target.value)}
                                            placeholder="Describe how the story should open..."
                                            rows={4}
                                            className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3.5 py-3 text-[13px] text-white focus:outline-none focus:border-white/30 resize-none placeholder:text-stone-600 shadow-inner"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 mt-auto border-t border-white/[0.06] flex flex-col items-center gap-3">
                        {preloaderError && <p className="text-[13px] text-red-400">{preloaderError}</p>}
                        <button
                            type="submit" disabled={startingChat}
                            className="w-full bg-white hover:bg-stone-200 disabled:bg-white/[0.06] disabled:text-stone-600 text-black rounded-lg py-3.5 text-[14px] font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:shadow-none"
                        >
                            {startingChat ? <Loader2 size={17} className="animate-spin" /> : <>Start chat <ChevronRight size={16} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);

export default PreloaderScreen;