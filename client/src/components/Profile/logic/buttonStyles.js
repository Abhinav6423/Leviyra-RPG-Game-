// Builds the className for the primary/secondary profile action buttons
// based on the user's chosen button style + current accent palette.
export const getDynamicButtonStyle = (pref, accent, isPrimary) => {
  // Added active:scale-[0.97] for that physical "press" feeling on click
  const layout =
    "flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.97]";
  
  const baseColor = isPrimary ? accent.buttonSolid : accent.buttonOutline;
  
  // Default Minimal Style
  const defaultStyle = `${layout} rounded-xl border ${baseColor} hover:opacity-90`;

  if (!pref) return defaultStyle;

  switch (pref) {
    case "Soft Rounded":
      // Fully pill-shaped, bounces up slightly on hover (friendly feel)
      return `${layout} rounded-full border ${baseColor} hover:scale-[1.03] shadow-sm`;

    case "Outline":
      // Crisp outline that gets a subtle neon-style glow of its own color on hover
      return `${layout} rounded-xl bg-transparent border border-current hover:bg-white/10 hover:shadow-[0_0_12px_currentColor] ${accent.themeColor}`;

    case "Ghost":
      // Barely there, no border. On hover, background fills slightly and text spaces out (sleek feel)
      return `${layout} rounded-xl bg-transparent border border-transparent hover:bg-white/10 hover:tracking-wide ${accent.themeColor}`;

    case "Elevated":
      // True 3D feel. Heavy shadow, lifts up distinctly (-translate-y-1) on hover
      return `${layout} rounded-xl border ${baseColor} shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.6)] hover:-translate-y-1`;

    case "Glass":
      // Proper frosted glass: strong blur, inner top-light reflection (inset shadow), and dynamic border
      return `${layout} rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] ${
        isPrimary ? "text-white" : accent.themeColor
      }`;

    default:
      return defaultStyle;
  }
};