
import React from 'react';
import { Toggle } from './SharedUI.jsx';

const ActionButtons = ({ form, updateField, loading, handleSubmit }) => {
    return (
        <>
            {/* VISIBILITY & SETTINGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Toggle label="Public Library" hint="Global Discovery" checked={form.isPublic}
                    onChange={() => updateField("isPublic", !form.isPublic)} />
                <Toggle label="Hide Description" hint="Keeps seed info private" checked={form.hideDescription}
                    onChange={() => updateField("hideDescription", !form.hideDescription)} />
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" disabled={loading} onClick={() => handleSubmit("draft")}
                    className="flex-1 py-4 bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold tracking-[0.15em] text-[11px] uppercase rounded-xl transition-all disabled:opacity-50">
                    Save Draft
                </button>
                <button type="button" disabled={loading} onClick={() => handleSubmit("published")}
                    className="flex-1 py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold tracking-[0.15em] text-[11px] uppercase rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? <><span className="animate-spin w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full"></span>Working...</> : "Publish"}
                </button>
            </div>
        </>
    );
};

export default ActionButtons;