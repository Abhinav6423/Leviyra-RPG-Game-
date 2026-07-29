import React from 'react';
import { Menu } from 'lucide-react';

const ChatHeader = ({ avatarSrc, displayCharName, currentSituation, onOpenDrawer }) => (
    <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/[0.06] bg-[#09090B]/60 backdrop-blur-2xl z-20 relative">
        <div className="flex items-center gap-3 min-w-0">
            {avatarSrc && (
                <img src={avatarSrc} alt={displayCharName} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
            )}
            <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate">
                    {displayCharName !== "this character" ? displayCharName : "Chat"}
                </p>
                {currentSituation && (
                    <p className="text-[12px] text-stone-400 truncate">{currentSituation}</p>
                )}
            </div>
        </div>
        <button onClick={onOpenDrawer} className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0" aria-label="Open chat details">
            <Menu size={19} strokeWidth={1.75} />
        </button>
    </div>
);

export default ChatHeader;