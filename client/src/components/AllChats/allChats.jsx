import React, { useEffect, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { recentChats } from "../../api-calls/recentChats.js";
import { Link } from "react-router-dom";

const AllChats = () => {
    const [search, setSearch] = useState("");
    const [activeId, setActiveId] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const data = await recentChats();
                console.log("Fetched recent chats you have interacted with:", data);

                if (isMounted) {
                    setChats(Array.isArray(data) ? data : data?.chats || []);
                }
            } catch {
                if (isMounted) setError("Couldn't load your chats.");
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => { isMounted = false; };
    }, []);

    // FIX: Safely fallback to an empty string to prevent .includes() from crashing
    const filtered = chats.filter(c => {
        const charName = c.characterId?.characterName || c.characterId?.name || "";
        return charName.toLowerCase().includes(search.toLowerCase());
    });

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white antialiased flex overflow-hidden">
            <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col h-screen border-r border-white/[0.06] bg-[#0a0a0a] relative z-10">

                {/* Header & Search */}
                <div className="px-5 mt-3 pt-10 pb-5 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-20">
                    <div className="relative group mt-5">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#121212] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:bg-[#1a1a1a] focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 transition-all shadow-inner"
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <div className="w-5 h-5 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin" />
                            <p className="text-zinc-500 text-sm">Loading chats...</p>
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500/80 text-sm mt-10 px-4">{error}</p>
                    ) : filtered?.length === 0 ? (
                        <p className="text-center text-zinc-600 text-sm mt-10">No messages found</p>
                    ) : (
                        <div className="px-2 space-y-0.5">
                            {filtered.map(chat => {
                                const character = chat.characterId;
                                if (!character) return null;

                                // FIX: Extract name safely (checks both characterName and name, defaults to "Unknown")
                                const displayName = character.characterName || character.name || "Unknown";
                                const avatarUrl = character.images?.length > 0 ? character.images[0].url : null;
                                const isActive = activeId === character._id;

                                return (
                                    <Link to={`/chat/${character._id}`} key={chat._id} className="block">
                                        <button
                                            onClick={() => setActiveId(character._id)}
                                            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-all duration-200 group
                                            ${isActive
                                                    ? "bg-red-500/10 border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]"
                                                    : "border border-transparent hover:bg-white/[0.03]"}`}
                                        >
                                            {/* Avatar with Status Indicator */}
                                            <div className="relative shrink-0 w-12 h-12">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt={displayName}
                                                        className="w-full h-full rounded-full object-cover border border-white/10 group-hover:border-white/20 transition-colors"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-medium text-zinc-400 uppercase tracking-wider">
                                                        {displayName.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-sm truncate font-medium ${isActive ? "text-red-400" : "text-zinc-200"}`}>
                                                        {displayName}
                                                    </span>
                                                    <span className="text-[11px] shrink-0 ml-2 text-zinc-500 font-medium">
                                                        12:30 PM
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm truncate text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                                        {chat.lastMessage?.text || "Active conversation..."}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA (Desktop Only Placeholder) */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center relative bg-[#050505]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative flex flex-col items-center text-center max-w-sm px-6">
                    <div className="w-16 h-16 mb-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shadow-2xl">
                        <MessageSquare className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h2 className="text-xl font-medium text-zinc-200 mb-2">Select a message</h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Choose a conversation from the sidebar to start chatting, or search for a specific character.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AllChats;