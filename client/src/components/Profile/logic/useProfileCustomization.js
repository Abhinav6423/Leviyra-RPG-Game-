import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { updateProfileCustomization } from "../../../api-calls/profileCustomizationSettings.js";
import {
  CUSTOMIZATION_DATA,
  THEME_ACCENT,
  THEME_BACKGROUNDS,
  THEME_AMBIENT_GLOW,
  DEFAULT_ACCENT_BY_TIER,
  SELECTION_TO_SCHEMA_FIELD,
} from "./constants.js";

// Owns: current (unsaved) selections, the derived live-preview accent
// palette/background, and persisting the selections on "Apply".
export const useProfileCustomization = ({ user, subTier, refetchUser }) => {
  const [selections, setSelections] = useState({
    theme: null,
    button: null,
    tag: null,
    ringColor: null,
    ringThickness: null,
  });
  const [isApplying, setIsApplying] = useState(false);

  const savedSettings = user?.profileCustomizationSettings;

  useEffect(() => {
    if (!savedSettings) return;
    setSelections({
      theme: savedSettings.colorTheme || null,
      button: savedSettings.buttonStyles || null,
      tag: savedSettings.profileTag || null,
      ringColor: savedSettings.avatarRingColor || null,
      ringThickness: savedSettings.avatarRingThickness || null,
    });
  }, [savedSettings]);

  const handleSelect = useCallback(
    (category, itemName, locked) => {
      if (locked) {
        toast.error(
          `This option requires a ${subTier === "free" ? "Pack or Monthly" : "Monthly"} plan.`,
        );
        return;
      }
      setSelections((prev) => ({ ...prev, [category]: itemName }));
    },
    [subTier],
  );

  const handleApplyStyles = useCallback(
    async (onSuccess) => {
      const payload = {};
      Object.entries(selections).forEach(([key, value]) => {
        if (value) payload[SELECTION_TO_SCHEMA_FIELD[key]] = value;
      });

      if (Object.keys(payload).length === 0) {
        toast.info("No new styles selected to apply.");
        return;
      }

      setIsApplying(true);
      toast.loading("Applying your customizations...", { id: "apply-toast" });

      try {
        await updateProfileCustomization(payload);
        toast.success("Profile updated successfully!", { id: "apply-toast" });
        if (typeof refetchUser === "function") await refetchUser();
        onSuccess?.();
      } catch (error) {
        console.error("Failed to apply styles:", error);
        toast.error("Something went wrong while applying styles.", {
          id: "apply-toast",
        });
      } finally {
        setIsApplying(false);
      }
    },
    [selections, refetchUser],
  );

  // activeTheme = live preview (unsaved selection) > applied theme > none
  const activeTheme = selections.theme || savedSettings?.colorTheme;

  const accent = useMemo(
    () => THEME_ACCENT[activeTheme] || DEFAULT_ACCENT_BY_TIER[subTier],
    [activeTheme, subTier],
  );

  const activeBackgroundClass = useMemo(
    () => THEME_BACKGROUNDS[activeTheme] || "bg-[#0a0a0b]",
    [activeTheme],
  );

  const activeAmbientGlow = useMemo(
    () => THEME_AMBIENT_GLOW[activeTheme] || "transparent",
    [activeTheme],
  );

  const appliedButtonSetting = savedSettings?.buttonStyles;
  const appliedProfileTag = savedSettings?.profileTag;

  const avatarRingStyle = useMemo(() => {
    const selectedRingColor = CUSTOMIZATION_DATA.ringColor.find(
      (r) => r.name === selections.ringColor,
    );
    const selectedRingThickness = CUSTOMIZATION_DATA.ringThickness.find(
      (r) => r.name === selections.ringThickness,
    );

    if (!selectedRingColor && !selectedRingThickness) return undefined;

    return {
      borderColor: selectedRingColor?.color,
      borderWidth: selectedRingThickness
        ? `${selectedRingThickness.width}px`
        : undefined,
    };
  }, [selections.ringColor, selections.ringThickness]);

  return {
    selections,
    handleSelect,
    handleApplyStyles,
    isApplying,
    accent,
    activeTheme,
    activeBackgroundClass,
    activeAmbientGlow,
    appliedButtonSetting,
    appliedProfileTag,
    avatarRingStyle,
    hasCustomRing: !!avatarRingStyle,
  };
};
