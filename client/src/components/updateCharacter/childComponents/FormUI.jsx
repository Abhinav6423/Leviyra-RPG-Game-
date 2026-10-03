import React from "react";

export const inputCls =
    "w-full bg-zinc-900/60 text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:border-[#00e676]/60 focus:outline-none transition-colors placeholder:text-zinc-600";

export const Section = ({ title, hint, children }) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-8">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00e676]" />{title}
        </h2>
        {hint && <p className="text-xs text-zinc-500 mt-2 max-w-2xl">{hint}</p>}
        <div className="mt-6">{children}</div>
    </div>
);

export const Field = ({ label, hint, count, limit, unit = "Words", children }) => {
    const over = count > limit;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-400">{label}</label>
                <span className={`text-[11px] ${over ? "text-red-400" : "text-zinc-500"}`}>{count}/{limit} {unit}</span>
            </div>
            {hint && <p className="text-xs text-zinc-500 mb-2">{hint}</p>}
            {children}
            <div className="h-1 mt-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : "bg-[#00e676]"}`}
                    style={{ width: `${Math.min(100, (count / limit) * 100)}%` }} />
            </div>
        </div>
    );
};