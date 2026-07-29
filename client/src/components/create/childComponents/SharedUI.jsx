// create/components/SharedUI.jsx
import React from 'react';
import { wordCount } from '../ValidationCheck.js';

export const SectionContainer = ({ title, children }) => (
    <div className="bg-[#0c0c12]/80 backdrop-blur-2xl border border-indigo-500/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rotate-45 bg-indigo-500"></span> {title}
        </h2>
        {children}
    </div>
);

export const LimitedField = ({ label, name, value, onChange, placeholder, isTextArea, rows = 3, limit, unit = "words" }) => {
    const count = unit === "words" ? wordCount(value || "") : (value || "").length;
    const over = count > limit;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
                <span className={`text-[10px] font-medium ${over ? "text-red-400" : "text-slate-500"}`}>
                    {count}/{limit} {unit}
                </span>
            </div>
            {isTextArea ? (
                <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
                    className="w-full bg-[#12121a] border border-white/5 rounded-xl px-4 py-3 text-sm text-indigo-50 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none shadow-inner" />
            ) : (
                <input name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={unit === "chars" ? limit : undefined}
                    className="w-full bg-[#12121a] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-indigo-50 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 shadow-inner" />
            )}
        </div>
    );
};

export const Toggle = ({ label, hint, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
        <div>
            <p className="text-sm font-semibold text-zinc-200">{label}</p>
            <p className="text-[10px] font-medium tracking-widest text-zinc-500 mt-1 uppercase">{hint}</p>
        </div>
        <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors border ${checked ? "bg-indigo-500 border-indigo-500" : "bg-zinc-800 border-zinc-700"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? "translate-x-5" : ""}`} />
        </button>
    </div>
);