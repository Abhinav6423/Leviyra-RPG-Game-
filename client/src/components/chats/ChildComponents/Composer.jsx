import React from "react";
import { Send, Repeat, FastForward, Dices } from "lucide-react";
import { IconButton } from "../ChildComponents/Shared.jsx";

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
  const MAX_WORDS = 1000;
  const isOverLimit = wordCount > MAX_WORDS;

  return (
    <div className="bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent px-4 sm:px-8 pt-10 pb-6 z-20 relative">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
        {actionError && (
          <div className="text-[13px] text-red-400/90 flex items-center justify-between bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg backdrop-blur-md">
            <span>{actionError}</span>
            <button
              onClick={onDismissError}
              className="text-stone-400 hover:text-white text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* items-end ensures everything stays at the bottom when the text box expands */}
        <div className="flex items-end gap-2">
          
          {/* Wrap buttons in h-[44px] flex items-center to force perfect centering with the single-line textarea */}
          <div className="h-[44px] flex items-center">
            <IconButton
              onClick={() => onReplay(hasMessages)}
              disabled={isSending || !hasMessages}
              title="Replay last response"
            >
              <Repeat size={17} strokeWidth={1.75} />
            </IconButton>
          </div>
          
          <div className="h-[44px] flex items-center">
            <IconButton
              onClick={() => onContinue(hasMessages)}
              disabled={isSending || !hasMessages}
              title="Continue"
            >
              <FastForward size={17} strokeWidth={1.75} />
            </IconButton>
          </div>

          {/* Adding flex to the wrapper removes the weird baseline gap under textareas */}
          <div className="flex-1 relative flex">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message..."
              disabled={isSending}
              className={`w-full block m-0 bg-[#121214]/80 backdrop-blur-md border ${
                isOverLimit
                  ? "border-red-500/50 focus:border-red-500/80"
                  : "border-white/[0.08] focus:border-white/20"
              } rounded-xl py-3 pl-4 pr-16 text-[14px] text-white/90 focus:outline-none focus:bg-[#18181B] transition-all disabled:opacity-50 placeholder:text-stone-600 shadow-sm resize-none min-h-[44px] max-h-[150px] overflow-y-auto`}
            />
            
            {/* Counter */}
            <div
              className={`absolute bottom-[13px] right-4 text-[10px] select-none pointer-events-none transition-colors ${
                isOverLimit ? "text-red-400" : "text-stone-500"
              }`}
            >
              {wordCount}/{MAX_WORDS}
            </div>
          </div>

          {/* Fixed dimensions for Send button to match textarea min-height exactly */}
          <button
            onClick={onSend}
            disabled={isSending || !inputValue.trim() || isOverLimit}
            title={isOverLimit ? "Word limit exceeded" : "Send"}
            className="w-[44px] h-[44px] rounded-xl bg-[#121214]/80 backdrop-blur-md border border-white/[0.08] hover:bg-[#1f1f22] hover:border-white/20 text-stone-400 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-[#121214]/80 disabled:hover:border-white/[0.08] shrink-0 flex items-center justify-center"
          >
            <Send size={17} strokeWidth={1.75} />
          </button>

          <div className="h-[44px] flex items-center">
            <IconButton
              onClick={onRollDice}
              title={diceRoll ? `Roll: ${diceRoll}` : "Roll dice"}
              active={!!diceRoll}
            >
              <Dices size={17} strokeWidth={1.75} />
            </IconButton>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Composer;