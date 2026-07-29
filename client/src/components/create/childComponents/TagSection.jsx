// create/components/TagsSection.jsx
import React, { useState } from 'react';
import { SectionContainer } from './SharedUI.jsx';
import { PRIMARY_TAG_OPTIONS } from "../../../utils/primaryTags.js";
import { LIMITS } from '../constantValues.js';

const TagsSection = ({ form, togglePrimaryTag, addListItem, removeListItem }) => {
    const [newSecondaryTag, setNewSecondaryTag] = useState("");

    const addSecondaryTag = () => {
        const value = newSecondaryTag.trim();
        if (value && !form.secondaryTags.includes(value)) {
            addListItem("secondaryTags", value);
            setNewSecondaryTag(""); 
        }
    };

    return (
        <SectionContainer title="Tags">
            <label className="block text-[10px] font-semibold text-zinc-400 mb-2.5 uppercase tracking-widest">
                Primary Tags (up to {LIMITS.maxPrimaryTags})
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
                {PRIMARY_TAG_OPTIONS.map(tag => (
                    <button key={tag.id} type="button" onClick={() => togglePrimaryTag(tag.id)}
                        className={`px-3 py-1.5 text-[11px] font-medium rounded-md border transition-all ${form.primaryTags.includes(tag.id)
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                            : "bg-zinc-800/40 border-zinc-700/50 text-zinc-300 hover:border-zinc-500"
                            }`}>
                        {tag.name}
                    </button>
                ))}
            </div>

            <label className="block text-[10px] font-semibold text-zinc-400 mb-2.5 uppercase tracking-widest">Secondary Tags</label>
            <div className="flex gap-3 mb-5">
                <input value={newSecondaryTag} onChange={(e) => setNewSecondaryTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryTag())}
                    placeholder="e.g. Overpowered, Regression"
                    className="flex-1 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500/80" />
                <button type="button" onClick={addSecondaryTag}
                    className="px-5 py-3 bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-200 hover:text-zinc-900 text-xs font-semibold text-zinc-300 rounded-xl transition-all">
                    Add Tag
                </button>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-zinc-900/20 border border-zinc-800/50 rounded-xl min-h-[70px]">
                {form.secondaryTags.length === 0 && <span className="text-sm text-zinc-600 w-full text-center mt-2">Add some custom tags above.</span>}
                {form.secondaryTags.map((t, i) => (
                    <span key={i} onClick={() => removeListItem("secondaryTags", i)}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-zinc-300 text-[11px] rounded-md cursor-pointer">
                        {t} <span className="opacity-40 group-hover:opacity-100">✕</span>
                    </span>
                ))}
            </div>
        </SectionContainer>
    );
};

export default TagsSection;