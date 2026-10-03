import React, { useState } from "react";
import { deleteCharacter } from "../../api-calls/deleteChar.js";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Trash2, MoreVertical, AlertTriangle, Edit } from "lucide-react";

const MyCharCard = ({ char, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await deleteCharacter(id);
      if (res.success) {
        toast.success(res.message ?? "Character deleted.");
        onDelete?.(id);
      } else {
        toast.error(res.message ?? "Failed to delete character.");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error("Failed to delete character. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const secondaryTags = (char.secondaryTags || []).slice(0, 3);

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden group border border-[#2a2a2a] hover:border-[#00c875]/40 hover:shadow-xl hover:shadow-[#00c875]/5 transition-all duration-300 bg-[#1a1a1a] flex flex-col">

        {/* Clickable Area */}
        <Link
          to={`/character/${char._id}`}
          className="flex flex-col h-full w-full cursor-pointer"
        >
          {/* Image Section */}
          <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
            {char?.images?.[0]?.url ? (
              <img
                src={char.images[0].url}
                alt={char.name || "Character"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                <span className="text-zinc-600 font-bold uppercase text-sm">
                  No Image
                </span>
              </div>
            )}

            {/* Primary Tag */}
            <div className="absolute top-0 right-0 bg-[#00d27a] text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-bl-xl z-20">
              {char?.primaryTags?.[0] || "MYSTERY"}
            </div>

            {/* Name Gradient */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/90 to-transparent px-4 pb-3 pt-16 z-10">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {char?.name || "Unknown"}
              </h3>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col px-4 pb-4 pt-3 flex-grow">
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
              {char?.shortDescription || "No description available."}
            </p>

            {secondaryTags.length > 0 && (
              <div className="flex gap-1.5 mt-auto">
                {secondaryTags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#00c875]/15 text-[#00c875] text-[10px] font-semibold px-2.5 py-1 rounded-md truncate max-w-[80px]"
                    title={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* 3-Dot Menu */}
        <div className="absolute top-3 left-3 z-30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <MoreVertical size={15} strokeWidth={2.5} />
          </button>

          {menuOpen && (
            <div className="absolute top-10 left-0 min-w-[130px] bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {/* Edit */}
              <Link
                to={`/update-character/${char._id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 px-4 py-3 text-[12px] font-medium text-white hover:bg-white/5 transition-colors"
              >
                <Edit size={14} strokeWidth={2.2} />
                Edit
              </Link>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} strokeWidth={2.2} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle size={24} className="text-red-500" strokeWidth={2} />
            </div>

            <h4 className="text-white text-lg font-bold mb-2">
              Delete Character?
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">
                {char?.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 font-medium text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(char._id)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyCharCard;