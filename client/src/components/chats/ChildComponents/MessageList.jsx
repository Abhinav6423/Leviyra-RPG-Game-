import React from "react";
import {
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  getMessageVersions,
  getActiveContent,
  renderMessageContent,
  getBubbleGlowStyle,
} from "../logic/helpers";

const VersionNavigator = ({ current, total, onPrev, onNext }) => (
  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium tracking-wide select-none">
    <button
      onClick={onPrev}
      disabled={current === 0}
      className="p-0.5 rounded hover:bg-white/[0.1] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      aria-label="Previous response"
    >
      <ChevronLeft size={13} strokeWidth={2} />
    </button>
    <span className="tabular-nums">
      {current + 1}/{total}
    </span>
    <button
      onClick={onNext}
      disabled={current === total - 1}
      className="p-0.5 rounded hover:bg-white/[0.1] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      aria-label="Next response"
    >
      <ChevronRight size={13} strokeWidth={2} />
    </button>
  </div>
);

const MessageActions = ({
  onDelete,
  onEdit,
  canCycle,
  current,
  total,
  onPrev,
  onNext,
}) => (
  <div className="flex items-center gap-2 mt-2 px-1">
    {/* Version Navigation Pill (Only visible if there are multiple versions) */}
    {total > 1 && (
      <div className="flex items-center gap-1 bg-[#121214]/60 backdrop-blur-md border border-white/[0.08] rounded-full px-1.5 py-1 text-xs text-stone-400 shadow-sm">
        <button
          onClick={onPrev}
          disabled={current === 0}
          title="Previous version"
          className="p-1 rounded-full hover:bg-white/[0.1] hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        <span className="px-1.5 font-medium select-none tracking-wide text-[11px]">
          {current + 1} / {total}
        </span>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          title="Next version"
          className="p-1 rounded-full hover:bg-white/[0.1] hover:text-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    )}

    {/* Action Buttons Pill */}
    <div className="flex items-center bg-[#121214]/60 backdrop-blur-md border border-white/[0.08] rounded-full px-1 py-1 shadow-sm">
      <button
        onClick={onEdit}
        title="Edit message"
        className="p-1.5 rounded-full text-stone-500 hover:bg-white/[0.1] hover:text-stone-200 transition-all"
      >
        <Edit3 size={13} strokeWidth={2} />
      </button>

      {/* Subtle Divider */}
      <div className="w-[1px] h-3.5 bg-white/[0.08] mx-0.5"></div>

      <button
        onClick={onDelete}
        title="Delete message"
        className="p-1.5 rounded-full text-stone-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
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
  onCycle, // (msg, newIndex) => void
  glowColor,
  moodLightOn,
}) => {
  const isUser = msg.role === "user";

  const versions = getMessageVersions(msg);
  const activeContent = getActiveContent(msg);
  const formattedContent = activeContent.replace(/\\n/g, "\n");
  const canCycle = msg.role === "assistant" && versions.length > 1;

  const activeIndex =
    typeof msg.selectedAlternateIndex === "number" &&
    msg.selectedAlternateIndex >= 0
      ? msg.selectedAlternateIndex
      : versions.length - 1;

  const goToVersion = (newIndex) => {
    if (newIndex < 0 || newIndex >= versions.length) return;
    onCycle(msg, newIndex);
  };

  return (
    <div
      className={`flex flex-col w-full ${isUser ? "items-end" : "items-start"}`}
    >
      {(msg.diceRoll || msg.isContinuation) && (
        <div className="text-[11px] text-stone-500 mb-1.5 px-2 font-medium tracking-wide uppercase shadow-sm">
          {msg.diceRoll ? `Roll ${msg.diceRoll}/6` : "Continued"}
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-3 w-full max-w-2xl bg-[#09090B]/40 p-1.5 rounded-2xl border border-white/[0.04]">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            autoFocus
            className={`bg-[#121214]/80 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 ${bubbleTextClass} text-stone-200 focus:outline-none focus:border-white/20 focus:bg-[#18181B] resize-none transition-all`}
          />
          <div className="flex gap-2 self-end pr-1 pb-1">
            <button
              onClick={onCancelEdit}
              className="text-xs font-medium text-stone-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
            >
              <X size={14} strokeWidth={2} /> Cancel
            </button>
            <button
              onClick={onSaveEdit}
              className="text-xs font-medium text-[#09090B] bg-stone-200 hover:bg-white flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all shadow-sm"
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
            className={`px-5 py-4 ${bubbleTextClass} leading-relaxed whitespace-pre-wrap transition-all duration-300
                    ${
                      isUser
                        ? "bg-white/[0.08] backdrop-blur-md border border-white/[0.05] text-stone-200 rounded-2xl rounded-br-sm shadow-md hover:bg-white/[0.1]"
                        : "bg-[#09090B]/80 backdrop-blur-3xl border border-white/[0.08] text-stone-300 rounded-2xl z-10 relative shadow-2xl"
                    }`}
            style={
              !isUser ? getBubbleGlowStyle(moodLightOn, glowColor) : undefined
            }
          >
            {isUser ? formattedContent : renderMessageContent(activeContent)}
            {msg.isEdited && (
              <span className="text-[11px] text-stone-500 ml-2 font-medium">
                (edited)
              </span>
            )}
          </div>

          <MessageActions
            onDelete={onDelete}
            onEdit={onStartEdit}
            canCycle={canCycle}
            current={activeIndex}
            total={versions.length}
            onPrev={() => goToVersion(activeIndex - 1)}
            onNext={() => goToVersion(activeIndex + 1)}
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
  cycleAlternate, // (msg, newIndex) => void
  isSending,
  streamingText,
  needsPreloader,
  glowColor,
  moodLightOn,
}) => (
  <div
    ref={scrollRef}
    className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6 scrollbar-hide relative z-10"
  >
    <div className="max-w-3xl mx-auto w-full space-y-6">
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
            className={`px-5 py-4 max-w-[90%] md:max-w-[75%] ${bubbleTextClass} leading-relaxed bg-[#09090B]/80 backdrop-blur-3xl border border-white/[0.08] text-stone-300 rounded-2xl z-10 relative shadow-2xl whitespace-pre-wrap`}
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
        <p className="text-center text-sm text-stone-600 mt-12 relative z-10">
          No messages yet. Say something to begin.
        </p>
      )}
    </div>
  </div>
);

export default MessageList;
