// create/components/NarrativeSection.jsx
import React from 'react';
import { SectionContainer, LimitedField } from './SharedUI.jsx';
import { LIMITS } from '../constantValues.js';

const NarrativeSection = ({ form, handleChange, updateListItem, removeListItem, addListItem }) => {
    return (
        <SectionContainer title="Narrative">
            <div className="mb-6">
                <LimitedField label="Personality" name="personality" value={form.personality} onChange={handleChange}
                    isTextArea rows={6} placeholder="Defines the character and their world" limit={LIMITS.personality} />
            </div>
            <div className="mb-8">
                <LimitedField label="Scenario" name="scenario" value={form.scenario} onChange={handleChange}
                    isTextArea rows={5} placeholder="The current situation the character is in" limit={LIMITS.scenario} />
            </div>

            <label className="block text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-widest">Opening Dialogues</label>
            <div className="space-y-4">
                {form.firstDialogues.map((msg, idx) => (
                    <div key={idx} className="relative pl-2">
                        <div className="absolute top-0 left-0 w-[3px] h-full bg-indigo-500/70 rounded-l-xl"></div>
                        <LimitedField label={`Dialogue #${idx + 1}`} value={msg}
                            onChange={(e) => updateListItem("firstDialogues", idx, e.target.value)}
                            isTextArea rows={3} placeholder="[Ding! The Absolute System has bound to the host.]" limit={LIMITS.dialogue} />
                        {form.firstDialogues.length > 1 && (
                            <button type="button" onClick={() => removeListItem("firstDialogues", idx)}
                                className="absolute top-6 right-3 text-zinc-500 hover:text-red-400 bg-[#12121a] rounded-full p-1">✕</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addListItem("firstDialogues", "")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2 mt-2">
                    + Add Another Dialogue
                </button>
            </div>
        </SectionContainer>
    );
};

export default NarrativeSection;