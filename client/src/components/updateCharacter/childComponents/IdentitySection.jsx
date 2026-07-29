import React from "react";
import { getWordCount } from "../utils";

const IdentitySection = ({ formData, handleChange }) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-indigo-400 font-semibold text-xs tracking-widest uppercase flex items-center mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                Identity
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                        <span>CHARACTER NAME <span className="text-rose-500">*</span></span>
                        <span className={formData.name?.length > 30 ? "text-rose-400" : "text-zinc-500"}>
                            {formData.name?.length || 0}/30 Letters
                        </span>
                    </label>
                    <p className="text-[11px] text-zinc-500 mb-2">Name of the character. This will be publicly visible by default.</p>
                    <input
                        type="text" name="name" value={formData.name} onChange={handleChange} maxLength={30}
                        className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-zinc-600"
                        placeholder="e.g. Aetherius"
                    />
                </div>
                <div>
                    <label className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                        <span>SHORT DESCRIPTION</span>
                        <span className={getWordCount(formData.shortDescription) > 25 ? "text-rose-400" : "text-zinc-500"}>
                            {getWordCount(formData.shortDescription)}/25 Words
                        </span>
                    </label>
                    <p className="text-[11px] text-zinc-500 mb-2">Visible on the explore tab to give a rough idea of plot.</p>
                    <input
                        type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange}
                        className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-zinc-600"
                        placeholder="A brief tagline or hook..."
                    />
                </div>
                <div>
                    <label className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
                        <span>LONG DESCRIPTION (DETAILED LORE)</span>
                        <span className={getWordCount(formData.longDescription) > 2000 ? "text-rose-400" : "text-zinc-500"}>
                            {getWordCount(formData.longDescription)}/2000 Words
                        </span>
                    </label>
                    <p className="text-[11px] text-zinc-500 mb-2">Main description visible on the full character page. Explain the story and whatever you wish to say about the character.</p>
                    <textarea
                        name="longDescription" value={formData.longDescription} onChange={handleChange} rows={6}
                        className="w-full bg-zinc-950/50 text-zinc-100 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none placeholder:text-zinc-600 leading-relaxed"
                        placeholder="Expand on their background, motives, and world..."
                    />
                </div>
            </div>
        </div>
    );
};

export default IdentitySection;