import React, { useState } from 'react'
import { deleteCharacter } from "../../api-calls/deleteChar.js";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { LogIn, Trash2, MoreVertical, AlertTriangle ,Edit } from "lucide-react";

const MyCharCard = ({ char, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✅ New state for popup

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            const res = await deleteCharacter(id);
            if (res.success) {
                toast.success(res.message ?? "Character deleted.");
                onDelete?.(id);
            } else {
                toast.error(res.message ?? "Failed to delete character.");
                setShowDeleteConfirm(false); // Close popup on failure
            }
        } catch (error) {
            toast.error("Failed to delete character. Please try again.");
            setShowDeleteConfirm(false); // Close popup on failure
        } finally {
            setDeleting(false);
        }
    };

    const secondaryTags = (char.secondaryTags || []).slice(0, 3);

    return (
        <>
            <div className="relative w-full rounded-xl overflow-hidden group border border-[#2a2a2a] hover:border-gray-500 hover:shadow-lg transition-all duration-300 bg-[#1a1a1a] flex flex-col">

                {/* The entire card is clickable, wrapped in a Link */}
                <Link to={`/character/${char._id}`} className="flex flex-col h-full w-full cursor-pointer">

                    {/* --- IMAGE SECTION --- */}
                    <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
                        {char?.images?.[0]?.url ? (
                            <img
                                src={char.images[0].url}
                                alt={char.characterName || "Character Image"}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-zinc-600 font-bold uppercase">
                                    No Image
                                </span>
                            </div>
                        )}

                        {/* Category Tag — Top Right */}
                        <div className="absolute top-0 right-0 bg-[#00d27a] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-lg z-20 shadow-md">
                            {char?.primaryTags[0] || "MYSTERY"}
                        </div>

                        {/* Smooth Gradient Overlay + Character Name (Matches Image 1) */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent px-5 pb-3 pt-14 z-10">
                            <h3 className="text-xl sm:text-2xl font-bold text-white truncate drop-shadow-md">
                                {char?.name || "Unknown"}
                            </h3>
                        </div>
                    </div>

                    {/* --- BOTTOM TEXT SECTION --- */}
                    <div className="flex flex-col px-5 pb-5 pt-3 flex-grow">

                        {/* Description */}
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                            {char?.shortDescription || "Lorem Ipsum is simply dummy text of the printing and typesetting..."}
                        </p>

                        {/* Tags — Bottom (Removed flex-1 so they don't stretch) */}
                        {secondaryTags.length > 0 && (
                            <div className="flex gap-2 mt-1">
                                {secondaryTags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="flex-1 bg-[#00c875] text-black text-[10px] font-bold px-2.5 py-1 rounded-sm text-center uppercase tracking-wide truncate"
                                        title={tag}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Link>

                {/* --- 3-DOT MENU (ABSOLUTE POSITIONED OUTSIDE THE LINK) --- */}
                <div className="absolute top-3 left-3 z-30">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuOpen(prev => !prev);
                        }}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors hover:bg-black/80 shadow-md"
                    >
                        <MoreVertical size={15} strokeWidth={2.5} />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div className="absolute top-10 left-0 min-w-[120px] bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-50">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true);
                                    setMenuOpen(false);
                                }}
                                className="flex items-center gap-2.5 px-4 py-3 text-[11px] font-bold tracking-widest text-red-400 hover:text-red-500 hover:bg-red-500/10 uppercase transition-colors text-left"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                                Delete
                            </button>

                            <button>
                                <Link
                                    to={`/update-character/${char._id}`}
                                    className="flex items-center gap-2.5 px-4 py-3 text-[11px] font-bold tracking-widest text-white hover:bg-[#00c875]/10 uppercase transition-colors text-left"
                                >
                                    <Edit size={14} strokeWidth={2.5} />
                                    Edit Character
                                </Link>
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* ✅ DELETE CONFIRMATION POPUP (Unchanged) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    {/* Modal Card */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 w-full max-w-xs shadow-[0_0_40px_rgba(236,6,24,0.1)] flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">

                        {/* Warning Icon */}
                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <AlertTriangle size={24} className="text-[#EC0618]" strokeWidth={2} />
                        </div>

                        {/* Text Content */}
                        <h4 className="text-white text-lg font-black uppercase tracking-wide mb-2">Delete Character?</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                            Are you sure you want to delete <span className="text-white font-bold">{char?.characterName}</span>? This action is permanent and cannot be undone.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-2xl border border-white/10 text-zinc-300 font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(char._id)}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-2xl bg-[#EC0618] hover:bg-[#d00515] text-white font-bold uppercase text-[10px] tracking-widest transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? (
                                    <>
                                        <Trash2 size={14} className="animate-spin" />
                                        Wait...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyCharCard;