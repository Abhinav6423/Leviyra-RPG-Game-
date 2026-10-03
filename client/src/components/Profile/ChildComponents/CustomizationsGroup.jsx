import React, { useCallback } from "react";
import { Lock, Check } from "lucide-react";

const TIER_RANK = { free: 0, pack: 1, monthly: 2 };

const CustomizationGroup = React.memo(
  ({
    categoryKey,
    title,
    Icon,
    items,
    selections,
    accent,
    subTier,
    onSelect,
    renderSwatch,
  }) => {
    // monthly -> sab unlocked, pack -> sirf pack items, free -> sab locked
    const isLocked = useCallback(
      (requiredTier) =>
        (TIER_RANK[subTier] ?? 0) < (TIER_RANK[requiredTier] ?? 0),
      [subTier]
    );

    return (
      <div className="mb-6 sm:mb-8 last:mb-0 border-b border-white/[0.06] pb-6 sm:pb-8 last:border-0 last:pb-0">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className={`p-1.5 sm:p-2 rounded-lg bg-white/[0.04] ${accent.themeColor}`}>
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <h3 className="text-white font-medium text-sm sm:text-base tracking-tight">
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => {
            const locked = isLocked(item.tier);
            const isSelected = selections[categoryKey] === item.name;

            return (
              <button
                key={idx}
                onClick={() => onSelect(categoryKey, item.name, locked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 border
                  ${
                    locked
                      ? "bg-white/[0.015] text-zinc-600 border-white/[0.05] cursor-not-allowed"
                      : isSelected
                        ? `${accent.bgHighlight} text-white border-transparent shadow-[0_0_12px_rgba(255,255,255,0.1)]`
                        : `bg-white/[0.03] text-zinc-300 border-white/[0.08] hover:bg-white/[0.06] hover:text-white`
                  }`}
              >
                {locked && <Lock size={11} className="text-zinc-600" />}
                {!locked && isSelected && <Check size={12} />}
                {renderSwatch && !locked && renderSwatch(item)}
                {item.name}
                <span
                  className={`text-[9px] uppercase tracking-wider ml-0.5 ${isSelected ? "opacity-90 font-bold" : "opacity-40"}`}
                >
                  {item.tier === "monthly" ? "Pro" : "Plus"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

export default CustomizationGroup;