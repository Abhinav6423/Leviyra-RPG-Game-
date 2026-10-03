import React from "react";
import { Send, Repeat, FastForward, Dices } from "lucide-react";
import { IconButton } from "../ChildComponents/Shared.jsx";

const MAX_WORDS = 1000;

// Every icon button needed the same "h-[44px] flex items-center" wrapper to
// line up with the textarea — pulled into one place instead of repeating it.
const ToolButton = ({ children, ...props }) => (
  <div className="h-[44px] flex items-center">
    <IconButton {...props}>{children}</IconButton>
  </div>
);

const Composer = ({
  inputValue,
  setInputValue,
  onSend,
  onReplay,
  onContinue,
  onRollDice,
  diceRoll,
  isSending,
  hasMessages,
  actionError,
  onDismissError,
}) => {
  const wordCount = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > MAX_WORDS;
  const isNearLimit = wordCount > MAX_WORDS * 0.8;
  const canSend = !isSending && !!inputValue.trim() && !isOverLimit;

  const counterColor = isOverLimit
    ? "text-red-400"
    : isNearLimit
    ? "text-amber-400"
    : "text-stone-500";

  return (
    <div className="bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent px-4 sm:px-8 pt-10 pb-6 relative">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
        {actionError && (
          <div className="text-[13px] text-red-400/90 flex items-center justify-between bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            <span>{actionError}</span>
            <button onClick={onDismissError} className="text-stone-400 hover:text-white text-xs transition-colors">
              Dismiss
            </button>
          </div>
        )}

        {/* items-end keeps everything bottom-aligned as the textarea grows */}
        <div className="flex items-end gap-2">
          <ToolButton onClick={() => onReplay(hasMessages)} disabled={isSending || !hasMessages} title="Replay last response">
            <Repeat size={17} strokeWidth={1.75} />
          </ToolButton>

          <ToolButton onClick={() => onContinue(hasMessages)} disabled={isSending || !hasMessages} title="Continue">
            <FastForward size={17} strokeWidth={1.75} />
          </ToolButton>

          <div className="flex-1 relative flex">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message..."
              disabled={isSending}
              className={`w-full block m-0 bg-[#121214]/80 border ${
                isOverLimit ? "border-red-500/50 focus:border-red-500/80" : "border-white/[0.08] focus:border-emerald-500/40"
              } rounded-xl py-3 pl-4 pr-16 text-[14px] text-white/90 focus:outline-none focus:bg-[#18181B] transition-colors disabled:opacity-50 placeholder:text-stone-600 resize-none min-h-[44px] max-h-[150px] overflow-y-auto`}
            />
            <div className={`absolute bottom-[13px] right-4 text-[10px] font-medium select-none pointer-events-none transition-colors ${counterColor}`}>
              {wordCount}/{MAX_WORDS}
            </div>
          </div>

          {/* Lights up green and glows once there's something to send — a small
              "ready" cue instead of a flat grey button at all times. */}
          <button
            onClick={onSend}
            disabled={!canSend}
            title={isOverLimit ? "Word limit exceeded" : "Send"}
            className={`w-[44px] h-[44px] rounded-xl border shrink-0 flex items-center justify-center transition-all ${
              canSend
                ? "bg-emerald-500 border-emerald-400/60 text-black hover:bg-emerald-400 shadow-[0_0_16px_-2px_rgba(16,185,129,0.6)]"
                : "bg-[#121214]/80 border-white/[0.08] text-stone-500"
            }`}
          >
            <Send size={17} strokeWidth={1.75} />
          </button>

          <ToolButton onClick={onRollDice} title={diceRoll ? `Roll: ${diceRoll}` : "Roll dice"} active={!!diceRoll}>
            <Dices size={17} strokeWidth={1.75} />
          </ToolButton>
        </div>
      </div>
    </div>
  );
};

export default Composer;