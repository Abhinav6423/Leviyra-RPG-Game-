import React, { useState } from 'react';
import { X, RotateCcw, Trash2, Edit3, Check, Type, SunMoon, ChevronDown } from 'lucide-react';
import { FONT_ORDER, FONT_LABELS } from '../logic/constants';



const CheckpointCard = ({ cp, isEditing, value, setValue, onStart, onCancel, onSave, onDelete, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = cp.text?.length > 120;
    
    const wordCount = value?.trim() ? value.trim().split(/\s+/).length : 0;
    const MAX_WORDS = 500;
    const isOverLimit = wordCount > MAX_WORDS;

    return (
        <div className="relative group bg-gradient-to-b from-[#18181A] to-[#141415] hover:from-[#1C1C1E] hover:to-[#18181A] border border-white/[0.05] hover:border-white/[0.08] rounded-2xl p-4 transition-all duration-300 ease-out shadow-sm hover:shadow-md">
            {isEditing ? (
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            rows={4}
                            autoFocus
                            className={`w-full bg-black/30 border ${
                                isOverLimit 
                                ? "border-red-500/50 focus:border-red-500/80" 
                                : "border-white/10 focus:border-white/30"
                            } rounded-xl p-3 pb-8 text-[13.5px] text-zinc-200 focus:outline-none focus:bg-black/50 focus:ring-4 focus:ring-white/[0.02] transition-all resize-none placeholder:text-zinc-600 leading-relaxed`}
                        />
                        <div
                            className={`absolute bottom-3 right-3 text-[10px] select-none pointer-events-none transition-colors ${
                                isOverLimit ? "text-red-400" : "text-zinc-500"
                            }`}
                        >
                            {wordCount} / {MAX_WORDS}
                        </div>
                    </div>

                    <div className="flex gap-2 self-end mt-1">
                        <button 
                            onClick={onCancel} 
                            className="text-[12px] font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
                        >
                            <X size={14} strokeWidth={2} /> Cancel
                        </button>
                        <button 
                            onClick={onSave} 
                            disabled={isOverLimit || !value?.trim()}
                            title={isOverLimit ? "Word limit exceeded" : "Save checkpoint"}
                            className="text-[12px] font-medium text-black bg-zinc-200 hover:bg-white rounded-lg flex items-center gap-1.5 px-4 py-1.5 transition-all shadow-sm disabled:opacity-50 disabled:hover:bg-zinc-200"
                        >
                            <Check size={14} strokeWidth={2.5} /> Save
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={onStart} title="Edit checkpoint" className="text-zinc-400 hover:text-white bg-[#202022]/80 hover:bg-[#2A2A2D] backdrop-blur-md p-1.5 rounded-md border border-white/[0.04] transition-all">
                            <Edit3 size={13} strokeWidth={2} />
                        </button>
                        <button onClick={onDelete} title="Delete checkpoint" className="text-zinc-400 hover:text-red-400 bg-[#202022]/80 hover:bg-red-500/10 backdrop-blur-md p-1.5 rounded-md border border-white/[0.04] hover:border-red-500/20 transition-all">
                            <Trash2 size={13} strokeWidth={2} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors" />
                        <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-0.5">
                            Checkpoint {index}
                        </span>
                    </div>
                    
                    <div 
                        onClick={() => isLongText && setIsExpanded(!isExpanded)}
                        className={`text-[13.5px] text-zinc-300 leading-relaxed pr-6 transition-all duration-300 ${isLongText ? 'cursor-pointer' : ''} ${!isExpanded ? 'line-clamp-3' : ''}`}
                    >
                        {cp.text}
                    </div>

                    {isLongText && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[11px] text-zinc-500 hover:text-white mt-3 font-medium transition-colors flex items-center gap-1"
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

const SidebarControls = ({ fontSize, showFontMenu, setShowFontMenu, setFontSize, moodLightOn, toggleMoodLight, glowColor }) => (
    <div className="flex flex-col gap-2 w-full">
        <div className="relative w-full">
            <button
                onClick={() => setShowFontMenu((v) => !v)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all duration-200 text-[13px] font-medium group
                    ${showFontMenu ? 'bg-white/[0.05] border-white/10 text-white' : 'bg-transparent border-white/[0.04] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02]'}`}
            >
                <div className="flex items-center gap-2.5">
                    <Type size={15} strokeWidth={2} className={showFontMenu ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400 transition-colors'} />
                    Text size
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                    <span className="text-[12px]">{FONT_LABELS[fontSize]}</span>
                    <ChevronDown size={14} strokeWidth={2} className={`transition-transform duration-300 ${showFontMenu ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {showFontMenu && (
                <div className="mt-2 bg-[#121214]/95 border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl absolute w-full z-20 p-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {FONT_ORDER.map((size) => (
                        <button
                            key={size}
                            onClick={() => {
                                setFontSize(size);
                                setShowFontMenu(false);
                            }}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                                fontSize === size 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                            }`}
                        >
                            {FONT_LABELS[size]}
                            {fontSize === size && <Check size={14} strokeWidth={2.5} />}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-white/[0.04] bg-transparent hover:bg-white/[0.02] transition-colors duration-200 group">
            <div className="flex items-center gap-2.5">
                <SunMoon 
                    size={15} 
                    strokeWidth={2} 
                    style={moodLightOn ? { color: glowColor } : {}}
                    className={!moodLightOn ? "text-zinc-500 group-hover:text-zinc-400 transition-colors" : "transition-colors"} 
                />
                <span className={`text-[13px] font-medium transition-colors ${moodLightOn ? 'text-zinc-200' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    Ambient light
                </span>
            </div>
            
            <button 
                onClick={toggleMoodLight}
                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition-all duration-300"
                style={{ backgroundColor: moodLightOn ? glowColor : 'rgba(255, 255, 255, 0.1)' }}
                aria-pressed={moodLightOn}
            >
                <span className="sr-only">Toggle Ambient Light</span>
                <span 
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${moodLightOn ? 'translate-x-2' : '-translate-x-2'}`} 
                />
            </button>
        </div>
    </div>
);

const SidePanelSection = ({ title, children }) => (
    <div className="flex flex-col gap-3 w-full">
        <h3 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-zinc-500 px-1">{title}</h3>
        <div className="flex flex-col gap-2">
            {children}
        </div>
    </div>
);

const SidePanel = ({
    open, onClose,
    fontSize, showFontMenu, setShowFontMenu, setFontSize, moodLightOn, toggleMoodLight,
    checkpoints, editingCheckpointId, checkpointEditValue, setCheckpointEditValue,
    startCheckpointEdit, cancelCheckpointEdit, saveCheckpointEdit, removeCheckpoint,
    setShowClearModal, glowColor
}) => (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-400 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-400 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
        
        <div
            className={`relative w-full max-w-[360px] h-full bg-[#0A0A0B] border-l border-white/[0.06] flex flex-col overflow-hidden transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1) ${open ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ boxShadow: moodLightOn ? `-30px 0 100px -30px ${glowColor}15` : '-30px 0 100px -30px rgba(0,0,0,0.5)' }}
        >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-[#0A0A0B]/80 backdrop-blur-xl z-10">
                <h2 className="text-[15px] font-semibold text-zinc-100 tracking-wide">Chat Details</h2>
                <button 
                    onClick={onClose} 
                    className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] active:bg-white/[0.12] transition-all bg-white/[0.02]"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-7 flex flex-col gap-9 scrollbar-hide">
                
                <SidePanelSection title="Display Preferences">
                    <SidebarControls
                        fontSize={fontSize} showFontMenu={showFontMenu} setShowFontMenu={setShowFontMenu}
                        setFontSize={setFontSize} moodLightOn={moodLightOn} toggleMoodLight={toggleMoodLight} glowColor={glowColor}
                    />
                </SidePanelSection>

                <SidePanelSection title="Saved Checkpoints">
                    {(!checkpoints || checkpoints.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-white/[0.02] bg-white/[0.01] rounded-2xl border-dashed">
                            <p className="text-[13px] text-zinc-500 font-medium">No checkpoints yet.</p>
                            <p className="text-[12px] text-zinc-600 mt-1">Save important points in your conversation.</p>
                        </div>
                    )}
                    <div className="space-y-3 mt-1">
                        {checkpoints?.map((cp, idx) => (
                            <CheckpointCard
                                key={cp._id} 
                                index={idx + 1}
                                cp={cp} 
                                isEditing={editingCheckpointId === cp._id}
                                value={checkpointEditValue} 
                                setValue={setCheckpointEditValue}
                                onStart={() => startCheckpointEdit(cp)} 
                                onCancel={cancelCheckpointEdit}
                                onSave={() => saveCheckpointEdit(cp._id)} 
                                onDelete={() => removeCheckpoint(cp._id)}
                            />
                        ))}
                    </div>
                </SidePanelSection>
            </div>

            <div className="px-6 py-5 border-t border-white/[0.04] bg-[#0A0A0B]">
                <button
                    onClick={() => setShowClearModal(true)}
                    className="group w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-[13px] font-semibold transition-all text-zinc-400 bg-white/[0.02] border border-white/[0.04] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                >
                    <RotateCcw size={15} strokeWidth={2.5} className="group-hover:-rotate-90 transition-transform duration-300" />
                    Clear Conversation
                </button>
            </div>
        </div>
    </div>
);

export default SidePanel;