import React, { useState } from "react";
import { PRIMARY_TAG_OPTIONS } from "../../../utils/primaryTags.js";

const Categorization = ({ formData, togglePrimaryTag, handleAddSecondaryTag, handleRemoveSecondaryTag }) => {
    const [newTag, setNewTag] = useState("");

    const onAddTag = (e) => {
        e.preventDefault();
        handleAddSecondaryTag(newTag);
        setNewTag("");
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-indigo-400 font-semibold text-xs tracking-widest uppercase flex items-center mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                Categorization
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">PRIMARY TAGS</label>
                    <p className="text-[11px] text-zinc-500 mb-3">Main Tags for the character. These have a huge role for moderation and discovery.</p>
                    <div className="flex flex-wrap gap-2">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">PRIMARY TAGS</label>
                            <p className="text-[11px] text-zinc-500 mb-3">Main Tags for the character. These have a huge role for moderation and discovery.</p>
                            <div className="flex flex-wrap gap-2">
                                {PRIMARY_TAG_OPTIONS.map(tag => {
                                    // Yahan hum ensure kar rahe hain ki chahe tag object ho ya string, hume sirf string (name) mile
                                    const tagName = typeof tag === 'object' ? tag.name : tag;

                                    // Ab check ekdum sahi hoga
                                    const isSelected = formData.primaryTags.includes(tagName);

                                    return (
                                        <button
                                            key={tagName}
                                            onClick={(e) => { e.preventDefault(); togglePrimaryTag(tagName); }}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isSelected
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-[1.02]" // 🔥 Naya, ekdum clear Highlight
                                                : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700 hover:border-zinc-500 hover:text-zinc-200"
                                                }`}
                                        >
                                            {tagName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-white/5" />

                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">SECONDARY TAGS (TRAITS)</label>
                    <p className="text-[11px] text-zinc-500 mb-3">Custom tags you may give, essentially novel tags.</p>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                            placeholder="e.g. Overpowered, Flirty, Stoic..."
                            className="flex-1 bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-zinc-600"
                            onKeyDown={(e) => e.key === 'Enter' && onAddTag(e)}
                        />
                        <button onClick={onAddTag} className="bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap">
                            Add Trait
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {formData.secondaryTags.map((tag, idx) => (
                            <span key={idx} className="group bg-zinc-800/50 border border-white/10 text-zinc-300 px-3.5 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-zinc-800 hover:border-zinc-500 transition-colors">
                                {tag}
                                <button
                                    onClick={(e) => { e.preventDefault(); handleRemoveSecondaryTag(tag); }}
                                    className="text-zinc-500 group-hover:text-rose-400 transition-colors ml-1 focus:outline-none"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </span>
                        ))}
                        {formData.secondaryTags.length === 0 && (
                            <span className="text-sm text-zinc-600 italic">No traits added yet.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categorization;