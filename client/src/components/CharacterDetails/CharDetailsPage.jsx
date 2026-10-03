import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
  User,
  MessageSquare,
  Zap,
  ScrollText,
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  ImageOff,
  Lock,
  AlertTriangle,
  Heart,
  Activity,
  UserX,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { openCharDetails } from "../../api-calls/openCharDetails.js";
import { commentOnCharacter } from "../../api-calls/commentOnChar.js";
import { getCharacterComments } from "../../api-calls/getCharComments.js";

// --- HELPER: ImageKit CDN Optimizer ---
const getOptimizedImage = (url, width = 600) => {
  if (!url) return "";
  return url.includes("ik.imagekit.io")
    ? `${url}${url.includes("?") ? "&" : "?"}tr=w-${width},f-auto,q-80`
    : url;
};

// --- HELPER: Progressive Image (skeleton + simple error/retry, no timeout machinery) ---
const ProgressiveImage = memo(
  ({ src, alt, priority = false, className = "" }) => {
    const [status, setStatus] = useState(src ? "loading" : "error");

    useEffect(() => {
      setStatus(src ? "loading" : "error");
    }, [src]);

    if (status === "error") {
      return (
        <div className="relative w-full h-full bg-[#111111] rounded-[4px] flex flex-col items-center justify-center gap-3">
          <ImageOff size={28} className="text-zinc-700" />
          {src && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatus("loading");
              }}
              className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-[#00E676] transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-[#111111] overflow-hidden rounded-[4px]">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] transition-opacity duration-500 ${status === "loaded" ? "opacity-0" : "opacity-100"}`}
        />
        <img
          key={src}
          src={src}
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`${className} transition-opacity duration-700 ease-out ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    );
  },
);

// --- HELPER: Avatar (handles missing image and deleted/left-the-app users) ---
const Avatar = ({ user, size = "w-8 h-8" }) => {
  const isDeleted = user?.deleted;

  if (isDeleted || !user?.profilePicture) {
    return (
      <div
        className={`${size} rounded-[2px] flex-shrink-0 border border-white/10 bg-white/5 flex items-center justify-center`}
      >
        {isDeleted ? (
          <UserX size={16} className="text-zinc-600" />
        ) : (
          <User size={16} className="text-zinc-600" />
        )}
      </div>
    );
  }

  return (
    <img
      src={getOptimizedImage(user.profilePicture, 100)}
      alt={user.username || "User"}
      loading="lazy"
      decoding="async"
      className={`${size} rounded-[2px] object-cover flex-shrink-0 border border-white/10`}
    />
  );
};

// --- HELPER: Stat chip with a real label instead of a bare icon+number ---
const StatChip = ({ icon: Icon, value, label, accent = false }) => (
  <div
    className={`flex items-center gap-1.5 lg:gap-2 ${accent ? "text-[#00E676]" : "text-zinc-400"}`}
  >
    <Icon size={14} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
    <span className="text-zinc-200 font-bold">
      {(value || 0).toLocaleString()}
    </span>
    <span className="text-zinc-600 font-medium normal-case">{label}</span>
  </div>
);

// --- COMPONENT: Community (comments) ---
const CommunitySection = memo(({ charId, totalCommentsCount }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["characterComments", charId],
      queryFn: ({ pageParam = 1 }) => getCharacterComments(charId, pageParam),
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextPage : undefined,
      enabled: !!charId,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  const handlePost = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await commentOnCharacter(charId, newComment);
      setNewComment("");
      toast.success("Comment posted.");
      queryClient.invalidateQueries({
        queryKey: ["characterComments", charId],
      });
      queryClient.invalidateQueries({ queryKey: ["character", charId] });
    } catch {
      toast.error("Couldn't post your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/[0.02] p-5 lg:p-8 rounded-[4px] border border-white/5 mt-6 lg:mt-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-white/5">
        <h3 className="text-xs lg:text-[14px] font-black text-white tracking-[0.1em] uppercase">
          Community
        </h3>
        <span className="text-[9px] lg:text-[10px] text-black font-bold bg-[#00E676] px-2.5 py-1 rounded-[2px] tracking-widest uppercase">
          {totalCommentsCount || 0} Comments
        </span>
      </div>

      <div className="flex gap-2 lg:gap-3 mb-6 lg:mb-8 relative">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          placeholder="Share your thoughts on this character..."
          className="flex-1 bg-black/50 border border-white/10 rounded-[3px] pl-4 lg:pl-5 pr-12 lg:pr-14 py-3 lg:py-4 text-[13px] lg:text-sm text-zinc-200 outline-none focus:border-[#00E676]/50 focus:bg-[#030303] transition-all font-light"
        />
        <button
          onClick={handlePost}
          disabled={!newComment.trim() || isSubmitting}
          className="absolute right-1.5 lg:right-2 top-1.5 lg:top-2 bottom-1.5 lg:bottom-2 aspect-square bg-[#00E676] hover:bg-[#00c968] disabled:bg-white/5 disabled:text-zinc-600 text-black rounded-[2px] transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin lg:w-4 lg:h-4" />
          ) : (
            <Send size={14} className="lg:w-4 lg:h-4" />
          )}
        </button>
      </div>

      <div className="space-y-2 max-h-[350px] lg:max-h-[400px] overflow-y-auto custom-scrollbar pr-2 contain-content">
        {status === "pending" ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-[#00E676]" />
          </div>
        ) : status === "error" ? (
          <div className="text-center py-16 lg:py-20 border border-dashed border-white/5 rounded-[4px]">
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              Failed to load comments.
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 lg:py-20 border border-dashed border-white/5 rounded-[4px]">
            <MessageSquare
              size={20}
              className="mx-auto text-zinc-700 mb-3 lg:mb-4 lg:w-6 lg:h-6"
            />
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              No comments yet. Be the first.
            </p>
          </div>
        ) : (
          <>
            {comments.map((c) => (
              <div
                key={c._id}
                className="flex gap-3 lg:gap-4 p-4 lg:p-5 hover:bg-white/[0.03] rounded-[4px] border border-transparent hover:border-white/5 transition-colors"
              >
                <Link
                  to={`/public-profile/${c.user?._id || c.user?.id}`}
                  className="shrink-0"
                >
                  <img
                    src={
                      getOptimizedImage(c.user?.profilePicture, 100) ||
                      "https://via.placeholder.com/40"
                    }
                    alt="user"
                    loading="lazy"
                    decoding="async"
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-[2px] object-cover flex-shrink-0 border border-white/10 hover:opacity-80 transition-opacity"
                  />
                </Link>

                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-1.5">
                    <Link
                      to={`/public-profile/${c.user?._id || c.user?.id}`}
                      className="text-[11px] lg:text-xs font-bold text-zinc-200 uppercase tracking-wide hover:underline"
                    >
                      {c.user?.username || "Unknown"}
                    </Link>
                    <span className="text-[8px] lg:text-[9px] text-zinc-600 font-bold tracking-widest uppercase">
                      {c.time ? new Date(c.time).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-[13px] lg:text-sm text-zinc-400 font-light whitespace-pre-wrap leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 lg:py-3 mt-3 lg:mt-4 text-[9px] lg:text-[10px] font-bold text-zinc-400 hover:text-[#00E676] uppercase border border-dashed border-white/10 hover:border-[#00E676]/30 rounded-[4px] transition-colors"
              >
                {isFetchingNextPage ? "Loading..." : "Load more comments"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});

// --- MAIN COMPONENT: Character Details ---
const CharDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manualImg, setManualImg] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isTabExpanded, setIsTabExpanded] = useState(false);

  const {
    data: char,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", id],
    queryFn: () => openCharDetails(id).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!id,
  });

  const activeImg = manualImg || char?.images?.[0]?.url || null;

  useEffect(() => {
    setManualImg(null);
    setActiveTab(0);
    setIsTabExpanded(false);
  }, [id]);

  useEffect(() => {
    setIsTabExpanded(false);
  }, [activeTab]);

  const optimizedActiveImg = useMemo(
    () => getOptimizedImage(activeImg, 800),
    [activeImg],
  );

  // Description is locked when the API says hideDescription === true.
  // Optional: pass `isOwner` from the backend so creators can still see their own text.
  const isDescriptionLocked = Boolean(char?.hideDescription) && !char?.isOwner;

  // All tags, shown right under the name.
  const allTags = useMemo(() => {
    if (!char) return [];
    return [...(char.primaryTags || []), ...(char.secondaryTags || [])];
  }, [char]);

  // Build tabs only from sections that actually have content.
  // If the description is locked, no tabs are built at all.
  const tabs = useMemo(() => {
    if (!char || isDescriptionLocked) return [];
    return [
      char.longDescription && {
        label: "Story",
        icon: ScrollText,
        text: char.longDescription,
      },
      char.personality && {
        label: "Personality",
        icon: User,
        text: char.personality,
      },
      char.scenario && {
        label: "Scenario",
        icon: Sparkles,
        text: char.scenario,
      },
    ].filter(Boolean);
  }, [char, isDescriptionLocked]);

  const creatorDeleted = Boolean(char?.creator?.deleted);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#00E676]" />
      </div>
    );
  }

  if (error || !char) {
    const errorMsg =
      error?.response?.data?.message || "Entity Not Found or Access Restricted";
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center flex-col gap-6 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white tracking-[0.1em] uppercase">
          Access Denied
        </h2>
        <p className="font-mono text-zinc-500 text-xs tracking-[0.1em] uppercase max-w-sm">
          {errorMsg}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-bold text-black uppercase bg-[#00E676] hover:bg-[#00c968] transition-colors px-8 py-3 rounded-[3px] mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent text-zinc-300 font-sans pt-8 lg:pt-12 mt-10 sm:mt-0">
      <div className="hidden sm:block absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] max-w-[800px] bg-[#00E676]/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto relative lg:gap-16 z-10 px-5 lg:px-10 pb-32 lg:pb-24">
        {/* LEFT COLUMN: Media — pinned so it stays visible while the text scrolls */}
        <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-7 lg:self-start flex flex-col items-center pb-6 lg:pb-10">
          <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-[4px] shadow-[0_30px_60px_rgba(0,0,0,0.9)] group">
            {activeImg ? (
              <>
                <ProgressiveImage
                  src={optimizedActiveImg}
                  alt={char?.name}
                  priority={true}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 via-transparent to-black/30 pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center">
                <User size={48} className="opacity-40" />
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[4px] pointer-events-none" />
          </div>

          {char?.images?.length > 1 && (
            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6 overflow-x-auto custom-scrollbar py-2 w-full max-w-[420px] justify-center">
              {char.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setManualImg(img.url)}
                  className={`relative flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-[3px] transition-all ${activeImg === img.url ? "ring-1 ring-[#00E676] opacity-100" : "ring-1 ring-white/10 opacity-40 hover:opacity-100"}`}
                >
                  <ProgressiveImage
                    src={getOptimizedImage(img.url, 150)}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Data */}
        <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col gap-6 lg:gap-10">
          <div>
            {char?.status === "draft" && (
              <div className="inline-flex items-center gap-2 text-[8.5px] lg:text-[10px] font-bold px-3.5 py-1.5 rounded-sm uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute h-full w-full rounded-full opacity-75 bg-amber-500" />
                  <span className="relative rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                Draft
              </div>
            )}

            <h1 className="text-[clamp(34px,8vw,72px)] leading-[1.1] lg:leading-tight font-black tracking-tighter text-white mb-3 uppercase">
              {char?.name || "Unnamed Entity"}
            </h1>

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mb-5 lg:mb-6">
                {allTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-white/[0.03] border border-white/10 text-[8px] lg:text-[9px] font-bold px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-sm uppercase tracking-wide text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {char?.shortDescription && (
              <p className="text-[13.5px] lg:text-sm text-zinc-100 font-bold mb-6 lg:mb-8 max-w-2xl leading-relaxed break-words w-full pr-4 lg:pr-0">
                {char.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[10px] lg:text-[11px] font-bold border-b border-white/10 pb-6 lg:pb-8">
              {creatorDeleted ? (
                <div className="flex items-center gap-2 lg:gap-3 border-r border-white/10 pr-4 lg:pr-6">
                  <Avatar user={char?.creator} size="w-6 h-6 lg:w-7 lg:h-7" />
                  <span className="text-zinc-600 italic normal-case">
                    Creator left the platform
                  </span>
                </div>
              ) : (
                <Link
                  to={`/public-profile/${char?.creator?._id}`}
                  className="flex items-center gap-2 lg:gap-3 group border-r border-white/10 pr-4 lg:pr-6 uppercase tracking-wide"
                >
                  <Avatar user={char?.creator} size="w-6 h-6 lg:w-7 lg:h-7" />
                  <span className="text-zinc-200 group-hover:text-[#00E676] transition-colors">
                    {char?.creator?.username || "unknown"}
                  </span>
                </Link>
              )}

              <div className="flex items-center gap-3 lg:gap-4">
                <StatChip
                  icon={Heart}
                  value={char?.likesCount}
                  label="Favorites"
                />
                <StatChip
                  icon={Activity}
                  value={char?.interactionsCount}
                  label="Active Chats"
                />
                <StatChip
                  icon={MessageSquare}
                  value={char?.commentsCount}
                  label="Comments"
                  accent
                />
              </div>
            </div>
          </div>

          {/* CTA — first thing visible after the essentials, no scrolling needed */}
          <Link to={`/chat/${char?._id}`} className="block focus:outline-none">
            <button className="w-full py-3.5 lg:py-4 bg-[#00E676] hover:bg-[#00c968] rounded-[4px] text-black font-bold text-[11px] lg:text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3">
              <Zap size={16} className="w-4 h-4" /> Begin Adventure
            </button>
          </Link>

          <div className="space-y-3 lg:space-y-4">
            {tabs.length > 0 && (
              <div className="bg-[#030303] border border-white/5 rounded-[4px] overflow-hidden">
                <div className="flex border-b border-white/5">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest transition-colors ${
                        i === activeTab
                          ? "text-[#00E676] bg-white/[0.03] border-b-2 border-[#00E676]"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-5 lg:p-6">
                  <p
                    className={`text-[13px] lg:text-sm text-zinc-400 font-light leading-relaxed whitespace-pre-wrap ${
                      !isTabExpanded ? "line-clamp-5" : ""
                    }`}
                  >
                    {tabs[activeTab]?.text}
                  </p>
                  {tabs[activeTab]?.text?.length > 260 && (
                    <button
                      onClick={() => setIsTabExpanded((v) => !v)}
                      className="mt-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-[#00E676] hover:underline"
                    >
                      {isTabExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {isDescriptionLocked && (
              <div className="relative bg-[#030303] border border-red-500/10 rounded-[4px] p-6 lg:p-8 flex flex-col items-center justify-center gap-2 lg:gap-3">
                <Lock
                  size={24}
                  className="text-red-500/50 w-5 h-5 lg:w-6 lg:h-6"
                />
                <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70">
                  Description Locked
                </p>
                <p className="text-[11px] lg:text-xs text-zinc-500 font-light text-center max-w-sm">
                  The creator has hidden the story, personality and scenario of
                  this character.
                </p>
              </div>
            )}

            {char?.firstDialogues?.length > 0 && (
              <div className="bg-[#050505] border border-white/[0.05] rounded-xl p-5 lg:p-7 w-full shadow-sm">
                <div className="flex items-center gap-3 mb-5 border-b border-white/[0.05] pb-4">
                  <MessageSquare size={18} className="text-[#00E676]" />
                  <h3 className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.2em] text-zinc-200">
                    First Dialogues
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {char.firstDialogues.map((dialogue, index) => (
                    <div
                      key={index}
                      className="relative pl-5 pr-4 py-3 bg-white/[0.02] rounded-r-lg border border-transparent"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/10 rounded-full" />
                      <p className="text-[13.5px] lg:text-[14px] text-zinc-400 font-medium leading-relaxed italic break-words">
                        "{dialogue}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CommunitySection
            charId={char?._id}
            totalCommentsCount={char?.commentsCount}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 230, 118, 0.4); }
            `,
        }}
      />
    </div>
  );
};

export default CharDetailPage;
