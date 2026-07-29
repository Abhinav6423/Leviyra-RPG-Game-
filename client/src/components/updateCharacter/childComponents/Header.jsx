import React from "react";
import { PencilLine, Globe2 } from "lucide-react";

const Header = ({ status, handleChange }) => {
    const isPublished = status === "published";

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-4 sm:p-6">

            {/* Background Glow (Desktop Only) */}
            <div className="hidden md:block absolute -top-20 -right-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="hidden md:block absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative">

                {/* Header */}
                <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                        <PencilLine className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>

                    <div className="min-w-0 flex-1">

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Update Character
                        </h1>

                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-400 max-w-xl">
                            Refine your character's personality, dialogues and settings before publishing.
                        </p>

                        <span
                            className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isPublished
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                }`}
                        >
                            <span
                                className={`mr-2 h-2 w-2 rounded-full ${isPublished
                                    ? "bg-emerald-400"
                                    : "bg-amber-400"
                                    }`}
                            />
                            {isPublished ? "Published" : "Draft"}
                        </span>

                    </div>

                </div>

                {/* Divider */}
                <div className="my-5 border-t border-white/10" />

                {/* Status */}
                <div className="flex flex-col gap-2">

                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        <Globe2 className="h-4 w-4 text-indigo-400" />
                        Publishing Status
                    </label>

                    <select
                        name="status"
                        value={status}
                        onChange={handleChange}
                        className="w-full sm:w-64 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition-all duration-200 outline-none hover:border-zinc-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    >
                        <option value="draft"> Draft</option>
                        <option value="published"> Published</option>
                    </select>

                </div>

            </div>

        </div>
    );
};

export default Header;