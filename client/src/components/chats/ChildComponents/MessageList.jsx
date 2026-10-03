import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Check,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
} from "lucide-react";
import {
  getMessageVersions,
  getActiveContent,
  renderMessageContent,
  getBubbleGlowStyle,
} from "../logic/helpers";

// Shared bubble styles — defined once, used by both the real messages and the
// "assistant is typing" placeholder below, instead of two copies drifting apart.
const USER_BUBBLE =
  "bg-white/[0.08] border border-white/[0.05] text-stone-200 rounded-2xl rounded-br-sm shadow-md hover:bg-white/[0.1]";
const ASSISTANT_BUBBLE =
  "bg-[#09090B]/80 backdrop-blur-md border border-white/[0.08] text-stone-300 rounded-2xl shadow-xl";

// --- Dice roll badge: bold, color-coded by tier so the result reads like a game mechanic ---
const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const getDiceTheme = (value) => {
  if (value <= 2)
    return {
      text: "text-red-400",
      ring: "ring-red-500/50",
      gradient: "from-red-500/25 via-red-500/10 to-transparent",
      glow: "shadow-[0_0_20px_-2px_rgba(239,68,68,0.55)]",
    };
  if (value <= 4)
    return {
      text: "text-blue-400",
      ring: "ring-blue-500/50",
      gradient: "from-blue-500/25 via-blue-500/10 to-transparent",
      glow: "shadow-[0_0_20px_-2px_rgba(59,130,246,0.55)]",
    };
  return {
    text: "text-emerald-400",
    ring: "ring-emerald-500/50",
    gradient: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    glow: "shadow-[0_0_20px_-2px_rgba(16,185,129,0.55)]",
  };
};

const DiceBadge = ({ value }) => {
  const theme = getDiceTheme(value);
  const Icon = DICE_ICONS[value - 1] || Dice1;
  return (
    <div
      className={`dice-pop inline-flex items-center gap-2.5 mb-2 pl-2 pr-4 py-2 rounded-xl bg-gradient-to-br ${theme.gradient} ring-1 ${theme.ring} ${theme.glow}`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg bg-black/50 ${theme.text}`}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <span className={`text-lg font-black tracking-wide ${theme.text}`}>
        {value}
        <span className="text-stone-400 font-bold text-xs">/6</span>
      </span>
    </div>
  );
};

const MessageActions = ({
  onDelete,
  onEdit,
  current,
  total,
  onPrev,
  onNext,
  switching,
}) => (
  <div className="flex items-center gap-2 mt-2 px-1">
    {total > 1 && (
      <div className="flex items-center gap-1 bg-[#121214]/60 border border-white/[0.08] rounded-full px-1.5 py-1 text-xs text-stone-400">
        <button
          onClick={onPrev}
          disabled={switching || current === 0}
          title="Previous version"
          className="p-1 rounded-full hover:bg-white/[0.1] hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        <span className="px-1.5 font-medium select-none tracking-wide text-[11px] flex items-center gap-1">
          {current + 1} / {total}
          {switching && (
            <Loader2 size={10} className="animate-spin text-stone-500" />
          )}
        </span>
        <button
          onClick={onNext}
          disabled={switching || current === total - 1}
          title="Next version"
          className="p-1 rounded-full hover:bg-white/[0.1] hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    )}

    <div className="flex items-center bg-[#121214]/60 border border-white/[0.08] rounded-full px-1 py-1">
      <button
        onClick={onEdit}
        title="Edit message"
        className="p-1.5 rounded-full text-stone-500 hover:bg-white/[0.1] hover:text-stone-200 transition-colors"
      >
        <Edit3 size={13} strokeWidth={2} />
      </button>
      <div className="w-[1px] h-3.5 bg-white/[0.08] mx-0.5" />
      <button
        onClick={onDelete}
        title="Delete message"
        className="p-1.5 rounded-full text-stone-500 hover:bg-red-500/15 hover:text-red-400 transition-colors"
      >
        <Trash2 size={13} strokeWidth={2} />
      </button>
    </div>
  </div>
);

const MessageBubble = ({
  msg,
  bubbleTextClass,
  isEditing,
  editValue,
  setEditValue,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onCycle, // (msg, newIndex) => void | Promise<void>
  glowColor,
  moodLightOn,
}) => {
  const isUser = msg.role === "user";
  const versions = getMessageVersions(msg);

  const activeIndex =
    typeof msg.selectedAlternateIndex === "number" &&
    msg.selectedAlternateIndex >= 0
      ? msg.selectedAlternateIndex
      : versions.length - 1;

  // Optimistic version switch: the UI jumps to the new version immediately,
  // while onCycle (which may hit the server) finishes in the background.
  const [pendingIndex, setPendingIndex] = useState(null);
  const isSwitching = pendingIndex !== null;
  const displayIndex = isSwitching ? pendingIndex : activeIndex;

  // Parent caught up with our optimistic index -> we're done.
  useEffect(() => {
    if (pendingIndex !== null && pendingIndex === activeIndex) {
      setPendingIndex(null);
    }
  }, [activeIndex, pendingIndex]);

  // Safety net: never leave the buttons locked if the parent never confirms.
  useEffect(() => {
    if (pendingIndex === null) return undefined;
    const t = setTimeout(() => setPendingIndex(null), 8000);
    return () => clearTimeout(t);
  }, [pendingIndex]);

  const displayContent = useMemo(
    () =>
      isSwitching
        ? getActiveContent({ ...msg, selectedAlternateIndex: pendingIndex })
        : getActiveContent(msg),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [msg, pendingIndex],
  );

  // Parsing/rendering message content can be heavy — only redo it when the text changes.
  const renderedContent = useMemo(
    () =>
      isUser
        ? displayContent.replace(/\\n/g, "\n")
        : renderMessageContent(displayContent),
    [isUser, displayContent],
  );

  const goToVersion = (newIndex) => {
    if (isSwitching) return;
    if (newIndex < 0 || newIndex >= versions.length) return;

    setPendingIndex(newIndex); // instant UI update

    let result;
    try {
      result = onCycle(msg, newIndex);
    } catch (err) {
      console.error("CYCLE VERSION ERROR:", err);
      setPendingIndex(null);
      return;
    }

    if (result && typeof result.then === "function") {
      result
        .catch((err) => console.error("CYCLE VERSION ERROR:", err))
        // On success the parent already updated msg; on failure this reverts to the old version.
        .finally(() => setPendingIndex(null));
    }
  };

  return (
    <div
      className={`flex flex-col w-full ${isUser ? "items-end" : "items-start"}`}
    >
      {msg.diceRoll ? (
        <div className="px-2">
          <DiceBadge value={msg.diceRoll} />
        </div>
      ) : (
        msg.isContinuation && (
          <div className="text-[11px] text-stone-500 mb-1.5 px-2 font-medium tracking-wide uppercase">
            Continued
          </div>
        )
      )}

      {isEditing ? (
        <div className="flex flex-col gap-3 w-full max-w-2xl bg-[#09090B]/40 p-1.5 rounded-2xl border border-white/[0.04]">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            autoFocus
            className={`bg-[#121214]/80 border border-white/[0.08] rounded-xl p-4 ${bubbleTextClass} text-stone-200 focus:outline-none focus:border-white/20 focus:bg-[#18181B] resize-none transition-colors`}
          />
          <div className="flex gap-2 self-end pr-1 pb-1">
            <button
              onClick={onCancelEdit}
              className="text-xs font-medium text-stone-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X size={14} strokeWidth={2} /> Cancel
            </button>
            <button
              onClick={onSaveEdit}
              className="text-xs font-medium text-[#09090B] bg-stone-200 hover:bg-white flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors"
            >
              <Check size={14} strokeWidth={2} /> Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[90%] md:max-w-[75%]`}
        >
          <div
            className={`px-5 py-4 ${bubbleTextClass} leading-relaxed whitespace-pre-wrap transition-opacity duration-150 ${
              isUser ? USER_BUBBLE : ASSISTANT_BUBBLE
            } ${isSwitching ? "opacity-80" : "opacity-100"}`}
            style={
              !isUser ? getBubbleGlowStyle(moodLightOn, glowColor) : undefined
            }
          >
            {renderedContent}
            {msg.isEdited && (
              <span className="text-[11px] text-stone-500 ml-2 font-medium">
                (edited)
              </span>
            )}
          </div>

          <MessageActions
            onDelete={onDelete}
            onEdit={onStartEdit}
            current={displayIndex}
            total={versions.length}
            switching={isSwitching}
            onPrev={() => goToVersion(displayIndex - 1)}
            onNext={() => goToVersion(displayIndex + 1)}
          />
        </div>
      )}
    </div>
  );
};

const MessageList = ({
  scrollRef,
  messages,
  bubbleTextClass,
  editingId,
  editValue,
  setEditValue,
  startEdit,
  cancelEdit,
  saveEdit,
  requestDelete,
  cycleAlternate, // (msg, newIndex) => void | Promise<void>
  isSending,
  streamingText,
  needsPreloader,
  glowColor,
  moodLightOn,
}) => (
  <div
    ref={scrollRef}
    className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6 scrollbar-hide"
  >
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes dicePop {
              0% { opacity: 0; transform: scale(0.6); }
              60% { opacity: 1; transform: scale(1.08); }
              100% { opacity: 1; transform: scale(1); }
            }
            .dice-pop { animation: dicePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          `,
        }}
      />
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          msg={msg}
          bubbleTextClass={bubbleTextClass}
          isEditing={editingId === msg._id}
          editValue={editValue}
          setEditValue={setEditValue}
          onStartEdit={() => startEdit(msg)}
          onCancelEdit={cancelEdit}
          onSaveEdit={() => saveEdit(msg)}
          onDelete={() => requestDelete(msg._id)}
          onCycle={cycleAlternate}
          glowColor={glowColor}
          moodLightOn={moodLightOn}
        />
      ))}

      {isSending && (
        <div className="flex flex-col items-start w-full">
          <div
            className={`px-5 py-4 max-w-[90%] md:max-w-[75%] ${bubbleTextClass} leading-relaxed whitespace-pre-wrap ${ASSISTANT_BUBBLE}`}
            style={getBubbleGlowStyle(moodLightOn, glowColor)}
          >
            {streamingText ? (
              renderMessageContent(streamingText)
            ) : (
              <Loader2 size={16} className="animate-spin text-stone-500" />
            )}
          </div>
        </div>
      )}

      {!messages.length && !needsPreloader && (
        <p className="text-center text-sm text-stone-600 mt-12">
          No messages yet. Say something to begin.
        </p>
      )}
    </div>
  </div>
);

export default MessageList;
