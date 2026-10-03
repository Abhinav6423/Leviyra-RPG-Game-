import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Loader2,
  Palette,
  CircleDot,
  Circle,
  MousePointer2,
  Tag,
} from "lucide-react";
import ProfileAvatar from "./ProfileAvatar.jsx";
import CustomizationGroup from "./CustomizationsGroup.jsx";
import { CUSTOMIZATION_DATA } from "../logic/constants.js";

const renderRingColorSwatch = (item) => (
  <span
    className="w-3 h-3 rounded-full border border-white/20 shrink-0 shadow-sm"
    style={{ backgroundColor: item.color }}
  />
);

const renderRingThicknessSwatch = (item) => (
  <span
    className="w-3 h-3 rounded-full border-current shrink-0"
    style={{ borderWidth: `${Math.min(item.width, 4)}px`, borderStyle: "solid" }}
  />
);

const CustomizePanel = ({
  user,
  avatarRingStyle,
  hasCustomRing,
  accent,
  selections,
  subTier,
  onSelect,
  onClose,
  onApply,
  isApplying,
}) => {
  const handleClose = useCallback(() => {
    if (!isApplying) onClose();
  }, [isApplying, onClose]);

  console.log("subTier in CustomizePanel:", subTier); // Debugging line to check subTier value

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center sm:p-6 bg-[#0a0a0b] sm:bg-black/70 sm:backdrop-blur-sm">
      <div className="hidden sm:block absolute inset-0" onClick={handleClose} />
      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-[#0a0a0b] sm:border border-white/[0.08] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-none px-6 py-5 border-b border-white/[0.06] bg-[#0a0a0b] z-10 flex items-center justify-between pt-safe sm:pt-5">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Profile Studio
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize how your profile appears to others
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isApplying}
            className="p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="mb-8 pb-6 border-b border-white/[0.06] flex items-center gap-4">
            <ProfileAvatar
              src={
                user?.profileCustomizationSettings?.profilePicture ||
                user?.profilePicture
              }
              avatarRingStyle={avatarRingStyle}
              hasCustomRing={hasCustomRing}
              accent={accent}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {user?.username || "Your profile"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Changes preview live. Select "Apply" to save.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <CustomizationGroup
              categoryKey="theme"
              title="Color Theme"
              Icon={Palette}
              items={CUSTOMIZATION_DATA.theme}
              selections={selections}
              accent={accent}
              subTier={subTier}
              onSelect={onSelect}
            />
            <CustomizationGroup
              categoryKey="ringColor"
              title="Avatar Ring Color"
              Icon={CircleDot}
              items={CUSTOMIZATION_DATA.ringColor}
              selections={selections}
              accent={accent}
              subTier={subTier}
              onSelect={onSelect}
              renderSwatch={renderRingColorSwatch}
            />
            <CustomizationGroup
              categoryKey="ringThickness"
              title="Avatar Ring Thickness"
              Icon={Circle}
              items={CUSTOMIZATION_DATA.ringThickness}
              selections={selections}
              accent={accent}
              subTier={subTier}
              onSelect={onSelect}
              renderSwatch={renderRingThicknessSwatch}
            />
            <CustomizationGroup
              categoryKey="button"
              title="Button Style"
              Icon={MousePointer2}
              items={CUSTOMIZATION_DATA.button}
              selections={selections}
              accent={accent}
              subTier={subTier}
              onSelect={onSelect}
            />
            <CustomizationGroup
              categoryKey="tag"
              title="Profile Tag"
              Icon={Tag}
              items={CUSTOMIZATION_DATA.tag}
              selections={selections}
              accent={accent}
              subTier={subTier}
              onSelect={onSelect}
            />
          </div>
        </div>

        <div className="flex-none px-6 py-4 border-t border-white/[0.06] bg-[#0a0a0b] z-10 flex justify-end gap-3 pb-8 sm:pb-4">
          <button
            onClick={handleClose}
            disabled={isApplying}
            className="hidden sm:inline-flex px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            disabled={isApplying}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isApplying ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isApplying ? "Applying…" : "Apply Customizations"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomizePanel;