import React from "react";
import { getWordCount } from "../utils";

const NarrativeSection = ({ formData, handleChange, handleDialogueChange, addDialogue, removeDialogue }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-indigo-400 font-semibold text-xs tracking-widest uppercase flex items-center mb-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                Narrative & Definitions
            </h2>
            <p className="text-xs text-zinc-400 mb-6 max-w-2xl">
                Define the key characteristics of a character and world. Visibility to the general public can be toggled at the bottom via "Private Definitions".
            </p>
            
            <div className="space-y-6">
                <div>
                    <label className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                        <span>PERSONALITY</span>
                        <span className={getWordCount(formData.personality) > 3000 ? "text-rose-400" : "text-zinc-500"}>
                            {getWordCount(formData.personality)}/3000 Words
                        </span>
                    </label>
                    <p className="text-[11px] text-zinc-500 mb-2">Defines the personality of a character and in part the associated world.</p>
                    <textarea
                        name="personality" value={formData.personality} onChange={handleChange} rows={5}
                        className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
                        placeholder="Define how they act, speak, and react..."
                    />
                </div>
                <div>
                    <label className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                        <span>SCENARIO</span>
                        <span className={getWordCount(formData.scenario) > 3000 ? "text-rose-400" : "text-zinc-500"}>
                            {getWordCount(formData.scenario)}/3000 Words
                        </span>
                    </label>
                    <p className="text-[11px] text-zinc-500 mb-2">Defines the current scenario. You can mention a few additional needs inside here.</p>
                    <textarea
                        name="scenario" value={formData.scenario} onChange={handleChange} rows={4}
                        className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
                        placeholder="The setting or immediate situation when a chat starts..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">FIRST DIALOGUES</label>
                    <p className="text-[11px] text-zinc-500 mb-2">Acts as the first seed of convo. Max 1000 words per dialogue.</p>
                    <div className="space-y-3">
                        {formData.firstDialogues.map((dialogue, idx) => (
                            <div key={idx} className="relative group">
                                <textarea
                                    value={dialogue} onChange={(e) => handleDialogueChange(idx, e.target.value)} rows={3}
                                    className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none pr-10"
                                    placeholder="Write a creative opening message..."
                                />
                                <div className={`absolute bottom-3 right-12 text-[10px] ${getWordCount(dialogue) > 1000 ? 'text-rose-400' : 'text-zinc-600'}`}>
                                    {getWordCount(dialogue)}/1000 W
                                </div>
                                {formData.firstDialogues.length > 1 && (
                                    <button
                                        className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={(e) => { e.preventDefault(); removeDialogue(idx); }}
                                        title="Delete dialogue"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addDialogue(); }} className="flex items-center text-indigo-400 text-sm font-medium mt-3 hover:text-indigo-300 transition-colors">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add alternative greeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NarrativeSection;