import { X, Sword, User, Play } from 'lucide-react'; // Assuming you are using lucide-react

export default function CharDetailPopUp({ char, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

            {/* 🌫 BACKDROP */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
            />

            {/* 🧩 MODAL */}
            {/* Changed flex-col to md:flex-row, increased max-w to 4xl for breathing room */}
            <div className="relative z-10 w-full max-w-4xl max-h-[85vh] rounded-[2rem] overflow-hidden 
                bg-[#0a0a0c] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row
                ring-1 ring-white/10">

                {/* ❌ CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/20 backdrop-blur-md 
                    border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                >
                    <X size={18} />
                </button>

                {/* 🖼 SIDE/HEADER IMAGE */}
                {/* Mobile: acts as header (h-64). Desktop: acts as sidebar (w-2/5) taking full height */}
                <div className="relative h-64 md:h-auto md:w-2/5 lg:w-[45%] shrink-0">
                    <img
                        src={char.image}
                        alt={char.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Mobile: Bottom fade into text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/50 to-transparent md:hidden" />

                    {/* Desktop: Right fade into text area */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0c] hidden md:block" />

                    {/* Subtle top vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-24" />
                </div>

                {/* 📜 CONTENT (SCROLLABLE) */}
                {/* Removed -mt-8 on desktop so it aligns perfectly with the top */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 -mt-8 md:mt-0 z-10 space-y-8 no-scrollbar">

                    {/* TITLE AREA */}
                    <div className="space-y-2 mt-2 md:mt-0">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-emerald-500/50"></span>
                            <p className="text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase">
                                {char.world}
                            </p>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-sm">
                            {char.name}
                        </h2>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
                        {char.lore.desc}
                    </p>

                    {/* LORE BOOK */}
                    <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-transparent rounded-l-2xl opacity-60" />
                        <p className="text-sm sm:text-base text-zinc-300 italic font-light leading-relaxed">
                            "{char.lore.story}"
                        </p>
                    </div>

                    {/* TRAITS */}
                    <div className="space-y-3">
                        <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-semibold">
                            Attributes
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {char.traits.map((t, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full 
                    bg-white/[0.03] text-zinc-200 border border-white/10 shadow-sm"
                                >
                                    <Sword size={12} className="text-emerald-400" />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* RELATION */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-transparent border border-emerald-500/10">
                        <div className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                            <User size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-500/80 tracking-widest uppercase font-semibold mb-1">
                                Relation
                            </p>
                            <p className="text-sm text-zinc-300 font-light leading-relaxed">
                                {char.lore.relation}
                            </p>
                        </div>
                    </div>

                    {/* ✅ CTA BUTTON (CORRECT POSITION) */}
                    <div className="pt-4">
                        <button className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 
            rounded-xl bg-emerald-500 text-black font-semibold text-sm sm:text-base
            shadow-[0_10px_30px_rgba(16,185,129,0.25)]
            hover:bg-emerald-400 hover:scale-[1.02] active:scale-95
            transition-all duration-200">

                            <Play size={18} />
                            Enter the World
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}