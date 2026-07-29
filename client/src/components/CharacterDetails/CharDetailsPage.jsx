import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
} from "react";
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

// --- HELPER: Progressive Image with Skeleton Loader + Error/Timeout handling ---
const IMAGE_TIMEOUT_MS = 8000;

const ProgressiveImage = memo(
  ({ src, alt, priority = false, className = "" }) => {
    const [status, setStatus] = useState("loading");
    const timeoutRef = useRef(null);

    const armTimeout = useCallback(() => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setStatus((prev) => (prev === "loading" ? "error" : prev));
      }, IMAGE_TIMEOUT_MS);
    }, []);

    useEffect(() => {
      setStatus(src ? "loading" : "error");
      if (src) armTimeout();
      return () => clearTimeout(timeoutRef.current);
    }, [src, armTimeout]);

    if (status === "error") {
      return (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden rounded-[4px] flex flex-col items-center justify-center gap-3">
          <ImageOff size={28} className="text-zinc-700" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatus("loading");
              armTimeout();
            }}
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-[#00E676] transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-[#111111] overflow-hidden rounded-[4px]">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] transition-opacity duration-500 ${status === "loaded" ? "opacity-0" : "opacity-100"}`}
        />
        {src && (
          <img
            key={src}
            src={src}
            alt={alt}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={() => {
              clearTimeout(timeoutRef.current);
              setStatus("loaded");
            }}
            onError={() => {
              clearTimeout(timeoutRef.current);
              setStatus("error");
            }}
            className={`${className} transition-opacity duration-700 ease-out ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
    );
  },
);

// --- HELPER: Expandable Text ---
const ExpandableSection = memo(
  ({ title, icon: Icon, text, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    if (!text) return null;

    const isLong = text.length > 160;
    const displayText =
      isExpanded || !isLong ? text : `${text.substring(0, 160)}...`;

    return (
      <div className="relative bg-[#030303] border border-white/5 rounded-[4px] p-5 lg:p-6 backdrop-blur-md overflow-hidden group hover:border-[#00E676]/30 transition-all duration-500 transform-gpu shadow-inner">
        <div className="flex items-center gap-2 mb-3 text-[10px] text-[#00E676] tracking-[0.2em] uppercase font-bold">
          {Icon && <Icon size={14} />} {title}
        </div>
        <p className="font-sans text-[13px] lg:text-sm text-zinc-400 font-light leading-relaxed relative z-10 whitespace-pre-wrap">
          {displayText}
        </p>
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 px-5 py-2 bg-white/5 hover:bg-[#00E676] text-zinc-300 hover:text-[#030303] text-[9px] font-bold uppercase tracking-widest rounded-[2px] transition-all duration-300 relative z-10 active:scale-95 transform-gpu"
          >
            {isExpanded ? "Collapse Data" : "Decrypt More"}
          </button>
        )}
      </div>
    );
  },
);

// --- HELPER: Avatar (handles missing image AND deleted/left-the-app users in one place) ---
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

// --- COMPONENT: Comments Log ---
const CommunicationsLog = memo(({ charId, totalCommentsCount }) => {
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

  const handleTransmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await commentOnCharacter(charId, newComment);
      setNewComment("");
      toast.success("Log entry transmitted.");
      queryClient.invalidateQueries({
        queryKey: ["characterComments", charId],
      });
      queryClient.invalidateQueries({ queryKey: ["character", charId] });
    } catch {
      toast.error("Transmission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/[0.02] p-5 lg:p-8 rounded-[4px] border border-white/5 mt-6 lg:mt-8 transform-gpu">
      <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 lg:pb-6 border-b border-white/5">
        <h3 className="text-xs lg:text-[14px] font-black text-white tracking-[0.1em] uppercase">
          Communications Log
        </h3>
        <span className="text-[9px] lg:text-[10px] text-black font-bold bg-[#00E676] px-2.5 py-1 rounded-[2px] tracking-widest uppercase">
          {totalCommentsCount || 0} Entries
        </span>
      </div>

      <div className="flex gap-2 lg:gap-3 mb-6 lg:mb-8 relative">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTransmit()}
          placeholder="Transmit to the log..."
          className="flex-1 bg-black/50 border border-white/10 rounded-[3px] pl-4 lg:pl-5 pr-12 lg:pr-14 py-3 lg:py-4 text-[13px] lg:text-sm text-zinc-200 outline-none focus:border-[#00E676]/50 focus:bg-[#030303] transition-all font-light"
        />
        <button
          onClick={handleTransmit}
          disabled={!newComment.trim() || isSubmitting}
          className="absolute right-1.5 lg:right-2 top-1.5 lg:top-2 bottom-1.5 lg:bottom-2 aspect-square bg-[#00E676] hover:bg-[#00c968] disabled:bg-white/5 disabled:text-zinc-600 text-black rounded-[2px] transition-colors flex items-center justify-center transform-gpu"
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
              Failed to sync logs.
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 lg:py-20 border border-dashed border-white/5 rounded-[4px]">
            <MessageSquare
              size={20}
              className="mx-auto text-zinc-700 mb-3 lg:mb-4 lg:w-6 lg:h-6"
            />
            <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              Log is empty.
            </p>
          </div>
        ) : (
          <>
            {comments.map((c) => (
              <div
                key={c._id}
                className="flex gap-3 lg:gap-4 p-4 lg:p-5 hover:bg-white/[0.03] rounded-[4px] border border-transparent hover:border-white/5 transition-colors transform-gpu"
              >
                {/* Link wrap kiya image ke around */}
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
                    // Added 'cursor-pointer hover:opacity-80 transition-opacity' for better UX
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-[2px] object-cover flex-shrink-0 border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>

                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-1.5">
                    <Link
                      to={`/public-profile/${c.user?._id || c.user?.id}`}
                      className="text-[11px] lg:text-xs font-bold text-zinc-200 uppercase tracking-wide hover:underline cursor-pointer"
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
                {isFetchingNextPage
                  ? "Decrypting Data..."
                  : "Load Older Entries"}
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
  }, [id]);

  const optimizedActiveImg = useMemo(
    () => getOptimizedImage(activeImg, 800),
    [activeImg],
  );

  const isDataHidden =
    !char?.personality &&
    !char?.scenario &&
    (!char?.firstDialogues || char?.firstDialogues.length === 0);

  const allTags = useMemo(() => {
    if (!char) return [];
    return [...(char.primaryTags || []), ...(char.secondaryTags || [])];
  }, [char]);

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
          Return to Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent text-zinc-300 font-sans pt-8 lg:pt-12 overflow-hidden mt-10 sm:mt-0">
      <div className="hidden sm:block absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] max-w-[800px] bg-[#00E676]/[0.03] blur-[150px] rounded-full contain-strict pointer-events-none" />

      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto relative lg:gap-16 z-10 px-5 lg:px-10 pb-32 lg:pb-24">
        {/* LEFT COLUMN: Media */}
        <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-7 flex flex-col items-center pb-6 lg:pb-10 h-fit">
          <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-[4px] shadow-[0_30px_60px_rgba(0,0,0,0.9)] transform-gpu group">
            {activeImg ? (
              <>
                <ProgressiveImage
                  src={optimizedActiveImg}
                  alt={char?.name}
                  priority={true}
                  className="w-full h-full object-cover object-top transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 via-transparent to-black/30 pointer-events-none contain-strict" />
              </>
            ) : (
              <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center">
                <User size={48} className="opacity-40" />
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[4px] pointer-events-none group-hover:ring-[#00E676]/30 transition-colors duration-500" />
          </div>

          {char?.images?.length > 1 && (
            <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-6 overflow-x-auto custom-scrollbar py-2 w-full max-w-[420px] justify-center contain-inline-size">
              {char.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setManualImg(img.url)}
                  className={`relative flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-[3px] transition-all transform-gpu ${activeImg === img.url ? "ring-1 ring-[#00E676] scale-100 opacity-100" : "ring-1 ring-white/10 opacity-40 hover:opacity-100"}`}
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
            <div className="flex flex-col gap-4 lg:gap-5 mb-6 lg:mb-8">
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  {allTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white/[0.03] border border-white/10 text-[8.5px] lg:text-[9px] font-bold px-3 lg:px-3.5 py-1.5 rounded-sm uppercase tracking-widest text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-start">
                <div
                  className={`inline-flex items-center gap-2 text-[8.5px] lg:text-[10px] font-bold px-3.5 py-1.5 rounded-sm uppercase tracking-widest transform-gpu ${char?.status === "draft" ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20"}`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className={`animate-ping absolute h-full w-full rounded-full opacity-75 ${char?.status === "draft" ? "bg-amber-500" : "bg-[#00E676]"}`}
                    />
                    <span
                      className={`relative rounded-full h-1.5 w-1.5 ${char?.status === "draft" ? "bg-amber-500" : "bg-[#00E676]"}`}
                    />
                  </span>
                  {char?.status || "Active"}
                </div>
              </div>
            </div>

            <h1 className="text-[clamp(34px,8vw,72px)] leading-[1.1] lg:leading-tight font-black tracking-tighter text-white mb-4 lg:mb-5 uppercase">
              {char?.name || "Unnamed Entity"}
            </h1>

            {char?.shortDescription && (
              <p className="text-[13.5px] lg:text-sm text-zinc-100 font-bold mt-2 mb-6 lg:mb-8 max-w-2xl leading-relaxed break-words w-full pr-4 lg:pr-0">
                {char.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[10px] lg:text-[11px] text-zinc-500 font-bold uppercase border-b border-white/10 pb-6 lg:pb-8">
              {/* Creator — plain text (not a link) if they left the app */}
              {creatorDeleted ? (
                <div className="flex items-center gap-2 lg:gap-3 border-r border-white/10 pr-4 lg:pr-6">
                  <Avatar user={char?.creator} size="w-6 h-6 lg:w-7 lg:h-7" />
                  <span className="text-zinc-600 italic">Left the app</span>
                </div>
              ) : (
                <Link
                  to={`/public-profile/${char?.creator?._id}`}
                  className="flex items-center gap-2 lg:gap-3 group border-r border-white/10 pr-4 lg:pr-6"
                >
                  <Avatar user={char?.creator} size="w-6 h-6 lg:w-7 lg:h-7" />
                  <span className="text-zinc-200 group-hover:text-[#00E676] transition-colors">
                    {char?.creator?.username || "unknown"}
                  </span>
                </Link>
              )}

              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex items-center gap-1.5 lg:gap-2 text-zinc-400">
                  <Heart size={14} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span>{(char?.likesCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-zinc-400">
                  <Activity size={14} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span>{(char?.interactionsCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2 text-[#00E676]">
                  <MessageSquare
                    size={14}
                    className="w-3.5 h-3.5 lg:w-4 lg:h-4"
                  />
                  <span>{(char?.commentsCount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Link to={`/chat/${char?._id}`} className="block focus:outline-none">
            <button className="group relative w-full py-3.5 lg:py-4 bg-[#00E676] hover:bg-[#00c968] rounded-[4px] text-black font-bold text-[11px] lg:text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 transform-gpu">
              <Zap size={16} className="w-4 h-4" /> Initiate Link
            </button>
          </Link>

          <div className="space-y-3 lg:space-y-4">
            {char?.longDescription && (
              <ExpandableSection
                title="longDescription"
                icon={ScrollText}
                text={char.longDescription}
              />
            )}
            {char?.personality && (
              <ExpandableSection
                title="personality"
                icon={User}
                text={char.personality}
              />
            )}
            {char?.scenario && (
              <ExpandableSection
                title="scenario"
                icon={Sparkles}
                text={char.scenario}
              />
            )}

            {char?.firstDialogues?.length > 0 && (
              <div className="bg-[#050505] border border-white/[0.05] rounded-xl p-5 lg:p-7 w-full shadow-sm">
                <div className="flex items-center gap-3 mb-5 border-b border-white/[0.05] pb-4">
                  <MessageSquare size={18} className="text-[#00E676]" />
                  <h3 className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.2em] text-zinc-200">
                    First Dialogues
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {char.firstDialogues.map((dialogue, index) => (
                    <div
                      key={index}
                      className="relative pl-5 pr-4 py-3 group bg-white/[0.02] hover:bg-white/[0.04] rounded-r-lg border border-transparent hover:border-white/[0.05] transition-all duration-300"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/10 rounded-full group-hover:bg-[#00E676] group-hover:shadow-[0_0_10px_rgba(0,230,118,0.5)] transition-all duration-300" />
                      <p className="text-[13.5px] lg:text-[14px] text-zinc-400 font-medium leading-relaxed italic group-hover:text-zinc-200 transition-colors duration-300 break-words">
                        "{dialogue}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isDataHidden && (
              <div className="relative bg-[#030303] border border-red-500/10 rounded-[4px] p-6 lg:p-8 backdrop-blur-md flex flex-col items-center justify-center gap-2 lg:gap-3 shadow-inner">
                <Lock
                  size={24}
                  className="text-red-500/50 w-5 h-5 lg:w-6 lg:h-6"
                />
                <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/70">
                  Data Encrypted
                </p>
                <p className="text-[11px] lg:text-xs text-zinc-500 font-light text-center max-w-sm">
                  The creator has restricted access to this entity's detailed
                  files.
                </p>
              </div>
            )}
          </div>

          <CommunicationsLog
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
                .contain-strict { contain: strict; }
                .contain-content { contain: content; }
                .contain-inline-size { contain: inline-size; }
            `,
        }}
      />
    </div>
  );
};

export default CharDetailPage;
