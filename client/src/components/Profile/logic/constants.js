import { LayoutGrid, PenTool, Globe, Eye, Lock } from "lucide-react";

// ---- Vibrant, highly visible background tints ----
export const THEME_BACKGROUNDS = {
  Slate: "bg-gradient-to-b from-slate-800/60 via-[#0a0a0b] to-[#0a0a0b]",
  Graphite: "bg-gradient-to-b from-zinc-800/60 via-[#0a0a0b] to-[#0a0a0b]",
  Pearl: "bg-gradient-to-b from-stone-700/60 via-[#0a0a0b] to-[#0a0a0b]",
  Obsidian: "bg-gradient-to-b from-neutral-800/70 via-[#0a0a0b] to-[#0a0a0b]",
  Indigo: "bg-gradient-to-b from-indigo-900/70 via-[#0a0a0b] to-[#0a0a0b]",
};

export const THEME_AMBIENT_GLOW = {
  Slate: "#94a3b8",
  Graphite: "#a1a1aa",
  Pearl: "#d6d3d1",
  Obsidian: "#737373",
  Indigo: "#6366f1",
};

// Every theme drives its own full accent palette with boosted visibility and glows
export const THEME_ACCENT = {
  Slate: {
    themeColor: "text-slate-200",
    bgHighlight: "bg-slate-400",
    buttonSolid:
      "bg-slate-300 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.3)]",
    buttonOutline: "border-slate-400 text-slate-200 hover:bg-slate-400/20",
    statBox: "border-slate-400/40 bg-slate-400/10",
    bioBox: "bg-slate-400/10 border border-slate-400/40",
    avatarRing: "border-slate-400",
  },
  Graphite: {
    themeColor: "text-zinc-200",
    bgHighlight: "bg-zinc-400",
    buttonSolid:
      "bg-zinc-300 hover:bg-zinc-200 text-zinc-900 border-zinc-300 shadow-[0_0_12px_rgba(161,161,170,0.3)]",
    buttonOutline: "border-zinc-400 text-zinc-200 hover:bg-zinc-400/20",
    statBox: "border-zinc-400/40 bg-zinc-400/10",
    bioBox: "bg-zinc-400/10 border border-zinc-400/40",
    avatarRing: "border-zinc-400",
  },
  Pearl: {
    themeColor: "text-stone-200",
    bgHighlight: "bg-stone-400",
    buttonSolid:
      "bg-stone-300 hover:bg-stone-200 text-stone-900 border-stone-300 shadow-[0_0_12px_rgba(214,211,209,0.3)]",
    buttonOutline: "border-stone-400 text-stone-200 hover:bg-stone-400/20",
    statBox: "border-stone-400/40 bg-stone-400/10",
    bioBox: "bg-stone-400/10 border border-stone-400/40",
    avatarRing: "border-stone-400",
  },
  Obsidian: {
    themeColor: "text-neutral-100",
    bgHighlight: "bg-neutral-300",
    buttonSolid:
      "bg-neutral-200 hover:bg-white text-neutral-900 border-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]",
    buttonOutline:
      "border-neutral-300 text-neutral-100 hover:bg-neutral-300/20",
    statBox: "border-neutral-400/50 bg-neutral-400/15",
    bioBox: "bg-neutral-400/15 border border-neutral-400/50",
    avatarRing: "border-neutral-300",
  },
  Indigo: {
    themeColor: "text-indigo-400 font-medium",
    bgHighlight: "bg-indigo-500",
    buttonSolid:
      "bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]",
    buttonOutline:
      "border-indigo-500 text-indigo-400 hover:bg-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    statBox:
      "border-indigo-500/50 bg-indigo-500/15 shadow-[0_4px_20px_rgba(99,102,241,0.1)]",
    bioBox:
      "bg-indigo-500/15 border border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.1)]",
    avatarRing: "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]",
  },
};

export const CUSTOMIZATION_DATA = {
  theme: [
    { name: "Slate", tier: "weekly" },
    { name: "Graphite", tier: "weekly" },
    { name: "Pearl", tier: "weekly" },
    { name: "Obsidian", tier: "monthly" },
    { name: "Indigo", tier: "monthly" },
  ],
  button: [
    { name: "Soft Rounded", tier: "weekly" },
    { name: "Outline", tier: "weekly" },
    { name: "Ghost", tier: "weekly" },
    { name: "Elevated", tier: "monthly" },
    { name: "Glass", tier: "monthly" },
  ],
  tag: [
    { name: "Creator", tier: "weekly" },
    { name: "Storyteller", tier: "weekly" },
    { name: "Contributor", tier: "weekly" },
    { name: "Verified Creator", tier: "monthly" },
    { name: "Featured Author", tier: "monthly" },
  ],
  ringColor: [
    { name: "Classic White", tier: "weekly", color: "#ffffff" },
    { name: "Ice Blue", tier: "weekly", color: "#38bdf8" },
    { name: "Emerald", tier: "weekly", color: "#10b981" },
    { name: "Gold", tier: "monthly", color: "#d4a054" },
    { name: "Royal Purple", tier: "monthly", color: "#a855f7" },
  ],
  ringThickness: [
    { name: "Thin", tier: "weekly", width: 2 },
    { name: "Medium", tier: "weekly", width: 3 },
    { name: "Bold", tier: "monthly", width: 5 },
  ],
};

export const DEFAULT_ACCENT_BY_TIER = {
  monthly: {
    themeColor: "text-amber-400",
    bgHighlight: "bg-amber-400",
    buttonSolid: "bg-amber-400 hover:bg-amber-300 text-black border-amber-400",
    buttonOutline: "border-amber-400/50 text-amber-400 hover:bg-amber-400/20",
    statBox: "border-white/10 bg-white/[0.03]",
    bioBox: "bg-white/[0.03] border border-amber-400/30",
    avatarRing: "border-amber-400/90",
  },
  weekly: {
    themeColor: "text-slate-200",
    bgHighlight: "bg-slate-300",
    buttonSolid: "bg-white hover:bg-zinc-200 text-black border-white",
    buttonOutline: "border-white/30 text-zinc-200 hover:bg-white/10",
    statBox: "border-white/10 bg-white/[0.02]",
    bioBox: "bg-white/[0.02] border border-white/20",
    avatarRing: "border-white/50",
  },
  free: {
    themeColor: "text-zinc-300",
    bgHighlight: "bg-zinc-400",
    buttonSolid: "bg-white hover:bg-zinc-200 text-black border-white",
    buttonOutline: "border-white/20 text-zinc-300 hover:bg-white/10",
    statBox: "border-white/10 bg-white/[0.01]",
    bioBox: "border border-white/10 bg-white/[0.01]",
    avatarRing: "border-white/30",
  },
};

export const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

export const DEFAULT_AVATAR = "https://via.placeholder.com/150";

export const SELECTION_TO_SCHEMA_FIELD = {
  theme: "colorTheme",
  button: "buttonStyles",
  tag: "profileTag",
  ringColor: "avatarRingColor",
  ringThickness: "avatarRingThickness",
};

export const FILTER_TABS = [
  { id: "All", icon: LayoutGrid, label: "All" },
  { id: "Draft", icon: PenTool, label: "Drafts" },
  { id: "Published", icon: Globe, label: "Published" },
  { id: "Public", icon: Eye, label: "Public" },
  { id: "Private", icon: Lock, label: "Private" },
];
