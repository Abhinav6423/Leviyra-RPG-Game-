import React from 'react';
import { X } from 'lucide-react';

export const PopupModal = ({ isOpen, title, message, onClose, primaryAction, primaryText, isDestructive, showUpgradeCTA, glowColor = "#9B6BFF" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div
                className="bg-[#09090B]/90 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300 border border-white/5"
                style={{ boxShadow: `0 0 40px -10px ${glowColor}60, inset 0 0 20px -10px ${glowColor}30` }}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-[16px] font-semibold text-white mb-1.5">{title}</h3>
                        <p className="text-[13px] text-stone-400 leading-relaxed">{message}</p>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {showUpgradeCTA && (
                    <div className="mt-2 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-md">
                        <p className="text-[13px] text-stone-300 mb-4 leading-relaxed">
                            Come back tomorrow for more messages, or get a <strong className="text-white font-semibold">Pro Subscription</strong> for unlimited chats.
                        </p>
                        <a href="/subscriptions" className="flex items-center justify-center w-full py-2.5 bg-white text-black hover:bg-stone-200 rounded-lg text-[13px] font-semibold transition-colors">
                            Upgrade to Pro
                        </a>
                    </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-stone-300 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white transition-all">
                        {primaryAction ? "Cancel" : "Close"}
                    </button>
                    {primaryAction && (
                        <button
                            onClick={primaryAction}
                            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all
                                ${isDestructive ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-white text-black hover:bg-stone-200'}`}
                        >
                            {primaryText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const IconButton = ({ onClick, disabled, title, active, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2.5 rounded-lg border transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed
            ${active
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/[0.03] backdrop-blur-md border-white/[0.08] text-stone-400 hover:text-white hover:bg-white/[0.08]'}`}
    >
        {children}
    </button>
);


export const MoodLighting = ({ color }) => (
    <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-1000"
        style={{

            background: `
                radial-gradient(ellipse 60% 100% at 0% 50%, ${color}40 0%, ${color}15 30%, transparent 75%),
                radial-gradient(ellipse 60% 100% at 100% 50%, ${color}40 0%, ${color}15 30%, transparent 75%)
            `,
        }}
    />
);