import { X } from 'lucide-react'; // Upar import mein 'X' add kar lena

// ==========================================
// 🛡️ PREMIUM UI: PLAYER STATUS SIDEBAR (Responsive)
// ==========================================
const PlayerStatusPanel = ({ worldState, isUpdating, showMobile, onClose }) => {
    // Basic Loader state
    if (!worldState || Object.keys(worldState).length === 0) {
        return (
            <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-[#07070a]/95 backdrop-blur-3xl border-l border-white/5 p-6 flex-col items-center justify-center text-center transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex ${showMobile ? 'translate-x-0 flex' : 'translate-x-full hidden'}`}>
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-4" />
                <p className="text-sm text-zinc-500">Establishing Neural Link...</p>
            </div>
        );
    }

    return (
        <>
            {/* Dark Overlay for Mobile */}
            {showMobile && (
                <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* The Actual Sidebar / Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-[#07070a]/95 backdrop-blur-3xl border-l border-white/5 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar transform transition-all duration-300 lg:relative lg:translate-x-0 lg:flex shadow-2xl ${showMobile ? 'translate-x-0 flex' : 'translate-x-full hidden'} ${isUpdating ? 'lg:opacity-50' : 'lg:opacity-100'}`}>
                
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rotate-45"></span> Player Status
                    </h3>
                    {/* Close Button Only on Mobile */}
                    <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-full bg-white/5">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Location */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <MapPin size={14} />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">Location</p>
                        </div>
                        <p className="text-sm font-medium text-zinc-100 leading-snug">{worldState.current_location || "Unknown Sector"}</p>
                    </div>

                    {/* Condition */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <HeartPulse size={14} className="text-rose-400" />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">Condition</p>
                        </div>
                        <p className="text-sm font-medium text-rose-300 leading-snug">{worldState.physical_condition || "Analyzing..."}</p>
                    </div>

                    {/* Reputation / Status */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Eye size={14} className="text-amber-400" />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">Reputation</p>
                        </div>
                        <p className="text-sm font-medium text-amber-300 leading-snug">{worldState.dynamic_status || "Unnoticed"}</p>
                    </div>

                    {/* Inventory */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-zinc-400">
                            <Backpack size={14} className="text-emerald-400" />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">Inventory</p>
                        </div>
                        {worldState.inventory && worldState.inventory.length > 0 ? (
                            <ul className="flex flex-col gap-2">
                                {worldState.inventory.map((item, idx) => (
                                    <li key={idx} className="bg-black/50 border border-emerald-500/20 text-emerald-200/80 px-3 py-2 rounded-lg text-xs font-medium tracking-wide">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-zinc-600 italic">Empty</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};