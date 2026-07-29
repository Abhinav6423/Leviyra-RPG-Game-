import React from "react";
import { createPortal } from "react-dom";
import { X, Users } from "lucide-react";

const FollowListModal = React.memo(
  ({ type, users, isLoading, accent, onClose, onUserClick }) => {
    const title = type === "followers" ? "Followers" : "Following";
    const emptyLabel =
      type === "followers" ? "No followers yet." : "Not following anyone yet.";

    return createPortal(
      <div className="fixed inset-0 z-[999999] flex items-center justify-center sm:p-6 bg-[#0a0a0b] sm:bg-black/70 sm:backdrop-blur-sm">
        <div className="hidden sm:block absolute inset-0" onClick={onClose} />
        <div className="relative w-full h-full sm:h-auto sm:max-h-[75vh] sm:max-w-md bg-[#0a0a0b] sm:border border-white/[0.08] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-none px-6 py-5 border-b border-white/[0.06] bg-[#0a0a0b] z-10 flex items-center justify-between pt-safe sm:pt-5">
            <h2 className="text-base font-semibold text-white tracking-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {isLoading && (
              <div className="flex flex-col gap-1 p-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                    <div className="h-3.5 w-32 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Users strokeWidth={1.5} className="text-zinc-700 w-10 h-10 mb-4" />
                <p className="text-zinc-500 text-sm">{emptyLabel}</p>
              </div>
            )}

            {!isLoading && users.length > 0 && (
              <div className="p-2">
                {users.map((u) => (
                  <button
                    key={u._id || u.id}
                    onClick={() => onUserClick(u)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <img
                      src={u.profilePicture || "https://via.placeholder.com/150"}
                      alt={u.username || "User"}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover bg-zinc-900 border border-white/[0.08] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {u.username || "Unknown user"}
                      </p>
                      {u.profileCustomizationSettings?.profileTag && (
                        <p className={`text-[11px] truncate ${accent.themeColor}`}>
                          {u.profileCustomizationSettings.profileTag}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);

export default FollowListModal;