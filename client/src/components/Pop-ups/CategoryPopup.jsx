import React, { useEffect, useRef } from "react";
import { X, Library } from "lucide-react";
import { PRIMARY_TAG_OPTIONS } from "../../utils/primaryTags.js";
import { Link } from "react-router-dom";

const CategoryPopup = ({ onClose }) => {
    const popupRef = useRef();

    // CLOSE ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-3 sm:px-4">

            {/* BACKDROP */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* MODAL CONTAINER */}
            <div
                ref={popupRef}
                className="
          no-scrollbar
          relative w-full max-w-4xl
          max-h-[85vh] overflow-y-auto
          p-6 sm:p-8
          bg-[#050505]/95 backdrop-blur-xl
          rounded-[2rem]
          border border-white/10
          shadow-[0_0_40px_rgba(236,6,24,0.1)]
          z-10
        "
            >
                {/* Top cinematic red glow */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#EC0618]/10 to-transparent pointer-events-none rounded-t-[2rem]" />

                {/* HEADER */}
                <div className="relative flex justify-between items-start mb-8 sm:mb-10 border-b border-white/10 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#EC0618]/10 border border-[#EC0618]/20 mt-1 shadow-[0_0_15px_rgba(236,6,24,0.15)]">
                            <Library className="w-5 h-5 text-[#EC0618]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">
                                Discover
                            </span>
                            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">
                                Story Genres
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all focus:outline-none"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-zinc-400 group-hover:text-[#EC0618] transition-colors" />
                    </button>
                </div>

                {/* GENRE GRID */}
                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {PRIMARY_TAG_OPTIONS.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                to={`/search/${cat.name.toLowerCase()}`}
                                onClick={onClose}
                                key={cat.id}
                            >
                                <div
                                    className="
                                group relative
                                p-4 sm:p-5
                                cursor-pointer
                                bg-white/5
                                border border-white/5
                                rounded-2xl
                                hover:bg-[#EC0618]/5
                                hover:border-[#EC0618]/40
                                transition-all duration-300 ease-out
                                flex items-center gap-4
                                hover:-translate-y-1
                                hover:shadow-[0_8px_20px_rgba(236,6,24,0.1)]
                            "
                                >
                                    <div
                                        className="
                                    relative z-10 flex items-center justify-center shrink-0
                                    w-10 h-10 rounded-full
                                    bg-black/60 border border-white/10
                                    text-zinc-400 group-hover:text-[#EC0618] group-hover:bg-[#EC0618]/10 group-hover:border-[#EC0618]/30
                                    transition-all duration-300
                                "
                                    >
                                        <Icon size={18} strokeWidth={2} />
                                    </div>

                                    <div className="relative z-10 flex flex-col">
                                        <p className="text-sm font-bold tracking-wide text-zinc-200 group-hover:text-white transition-colors">
                                            {cat.name}
                                        </p>
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1 group-hover:text-[#EC0618] transition-colors tracking-widest">
                                            Explore &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* FOOTER */}
                <div className="relative mt-8 pt-6 border-t border-white/5 flex justify-center items-center text-zinc-600 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                    Seek the path that calls to your soul
                </div>
            </div>
        </div>
    );
};

export default CategoryPopup;