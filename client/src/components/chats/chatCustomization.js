
export const PRO_TIERS = { FREE: 'free', WEEKLY: 'weekly', MONTHLY: 'monthly' };


export const FONT_SIZES = {
    sm: { label: 'Small', userText: 'text-[13px]', aiText: 'text-[14px]' },
    md: { label: 'Standard', userText: 'text-[15px]', aiText: 'text-[16px]' },
    lg: { label: 'Large', userText: 'text-[17px]', aiText: 'text-[18px]' },
    xl: { label: 'Extra Large', userText: 'text-[19px]', aiText: 'text-[20px]' },
    xxl: { label: 'Extra Extra Large', userText: 'text-[21px]', aiText: 'text-[22px]' },
};

export const THEMES = [
    // FREE TIER
    { id: 'free-void', name: 'Abyssal Void', tier: PRO_TIERS.FREE, type: 'free', bgClass: 'bg-[#0a0a0a]', mockBubble: 'from-zinc-800/80 border-zinc-500', userBubble: 'bg-white/10 text-white rounded-[1.25rem] rounded-tr-sm', aiBubble: null, dialogue: 'text-zinc-100 font-semibold', scene: 'text-zinc-500 italic', regular: 'text-zinc-300' },
    { id: 'free-slate', name: 'Slate Core', tier: PRO_TIERS.FREE, type: 'free', bgClass: 'bg-slate-900', mockBubble: 'from-slate-700/80 border-slate-400', userBubble: 'bg-white/10 text-white rounded-[1.25rem] rounded-tr-sm', aiBubble: null, dialogue: 'text-slate-200 font-semibold', scene: 'text-slate-500 italic', regular: 'text-slate-300' },
    { id: 'free-midnight', name: 'Midnight Blue', tier: PRO_TIERS.FREE, type: 'free', bgClass: 'bg-blue-950', mockBubble: 'from-blue-800/80 border-blue-400', userBubble: 'bg-white/10 text-white rounded-[1.25rem] rounded-tr-sm', aiBubble: null, dialogue: 'text-blue-200 font-semibold', scene: 'text-blue-400/70 italic', regular: 'text-blue-100/90' },
    { id: 'free-forest', name: 'Deep Forest', tier: PRO_TIERS.FREE, type: 'free', bgClass: 'bg-emerald-950', mockBubble: 'from-emerald-900/80 border-emerald-500', userBubble: 'bg-white/10 text-white rounded-[1.25rem] rounded-tr-sm', aiBubble: null, dialogue: 'text-emerald-200 font-semibold', scene: 'text-emerald-400/70 italic', regular: 'text-emerald-100/90' },
    { id: 'free-crimson', name: 'Crimson Dust', tier: PRO_TIERS.FREE, type: 'free', bgClass: 'bg-rose-950', mockBubble: 'from-rose-900/80 border-rose-500', userBubble: 'bg-white/10 text-white rounded-[1.25rem] rounded-tr-sm', aiBubble: null, dialogue: 'text-rose-200 font-semibold', scene: 'text-rose-400/70 italic', regular: 'text-rose-100/90' },

    // WEEKLY PREMIUM
    {
        id: 'prem-glass', name: 'Frosted Glass', tier: PRO_TIERS.WEEKLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617]',
        userBubble: 'bg-white/20 backdrop-blur-md border border-white/40 text-white rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.4)]',
        aiBubble: 'bg-white/[0.05] backdrop-blur-2xl border border-white/12 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [background-image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]',
        dialogue: 'text-white font-semibold tracking-[0.01em] drop-shadow-[0_1px_12px_rgba(255,255,255,0.25)]',
        scene: 'text-white/50 italic', regular: 'text-white/90'
    },
    {
        id: 'prem-neon', name: 'Neon Void', tier: PRO_TIERS.WEEKLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#4a044e] via-[#1e0b2e] to-[#070310]',
        userBubble: 'bg-[#0d0116]/70 backdrop-blur-md border border-fuchsia-500/40 text-fuchsia-50 rounded-2xl shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_0_20px_rgba(217,70,239,0.25)]',
        aiBubble: 'bg-black/60 backdrop-blur-xl border-t border-fuchsia-500/30 border-b border-cyan-500/30 rounded-2xl',
        dialogue: 'bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent font-bold tracking-wide',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },
    {
        id: 'prem-obsidian', name: 'Obsidian Gold', tier: PRO_TIERS.WEEKLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#451a03] via-[#1f0d02] to-[#080401]',
        userBubble: 'bg-[#141008]/70 backdrop-blur-md border-t-2 border-amber-500/70 text-amber-100 rounded-b-2xl rounded-tr-2xl shadow-[0_4px_20px_rgba(217,119,6,0.15)]',
        aiBubble: 'bg-black/65 backdrop-blur-xl border-t border-amber-600/30 rounded-b-2xl',
        dialogue: 'text-amber-300 font-semibold tracking-[0.05em] uppercase text-[0.92em]',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },
    {
        id: 'prem-crimson-eclipse', name: 'Crimson Eclipse', tier: PRO_TIERS.WEEKLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#4c0519] via-[#200309] to-[#080103]',
        userBubble: 'bg-[#1a0509]/70 backdrop-blur-md border border-rose-800/40 text-rose-100 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md shadow-[0_0_30px_-5px_rgba(190,18,60,0.35)]',
        aiBubble: 'bg-black/65 backdrop-blur-xl border border-white/5 rounded-tr-3xl rounded-bl-3xl [background:radial-gradient(circle_at_15%_20%,rgba(190,18,60,0.14),transparent_50%)]',
        dialogue: 'text-rose-300 font-bold italic tracking-wide',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },
    {
        id: 'prem-abyssal-glow', name: 'Abyssal Glow', tier: PRO_TIERS.WEEKLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#164e63] via-[#082f3d] to-[#020a0f]',
        userBubble: 'bg-[#031820]/70 backdrop-blur-md border border-cyan-600/40 text-cyan-50 rounded-2xl shadow-[0_0_20px_-2px_rgba(6,182,212,0.3)]',
        aiBubble: 'bg-black/65 backdrop-blur-xl border border-cyan-900/30 rounded-2xl [background-image:radial-gradient(rgba(6,182,212,0.15)_1px,transparent_1px)] [background-size:16px_16px]',
        dialogue: 'text-cyan-300 font-semibold tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },

    // MONTHLY PREMIUM
    {
        id: 'prem-arcane', name: 'Arcane Library', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#2e1065] via-[#150836] to-[#050209]',
        userBubble: 'bg-[#180b2e]/85 backdrop-blur-lg border-2 border-purple-500/50 text-purple-100 rounded-2xl shadow-[inset_0_0_0_1px_rgba(147,51,234,0.2),0_0_25px_-5px_rgba(147,51,234,0.4)]',
        aiBubble: 'bg-black/70 backdrop-blur-3xl border-2 border-purple-700/25 rounded-2xl shadow-[inset_0_0_0_1px_rgba(147,51,234,0.08),inset_0_0_50px_rgba(147,51,234,0.05)]',
        dialogue: 'text-purple-200 font-extrabold tracking-[0.08em] [text-shadow:0_0_20px_rgba(147,51,234,0.5)]',
        scene: 'text-white/45 italic', regular: 'text-white/90'
    },
    {
        id: 'prem-blood', name: 'Vampire Court', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#4c0519] via-[#26030d] to-[#0a0103]',
        userBubble: 'bg-gradient-to-bl from-[#4a0918] via-[#1a0209] to-black backdrop-blur-lg border-r-[3px] border-rose-600 text-rose-100 rounded-l-3xl rounded-tr-md rounded-br-md shadow-[0_0_30px_-8px_rgba(225,29,72,0.45)]',
        aiBubble: 'bg-black/75 backdrop-blur-3xl border-l-[3px] border-rose-800/70 rounded-r-3xl rounded-tl-md rounded-bl-md [background:linear-gradient(115deg,rgba(225,29,72,0.06),transparent_40%)]',
        dialogue: 'text-rose-400 font-bold uppercase tracking-[0.15em] text-[0.9em] [text-shadow:0_0_12px_rgba(225,29,72,0.4)]',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },
    {
        id: 'prem-gold', name: 'Executive Suite', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#451a03] via-[#241004] to-[#0a0501]',
        userBubble: 'bg-gradient-to-br from-amber-400 via-yellow-600 to-amber-800 text-black border border-amber-300/50 rounded-md font-bold shadow-[0_4px_25px_-5px_rgba(217,119,6,0.5)]',
        aiBubble: 'bg-black/80 backdrop-blur-3xl ring-1 ring-amber-500/25 rounded-md shadow-[inset_0_1px_0_rgba(251,191,36,0.15)]',
        dialogue: 'text-amber-300 font-bold tracking-[0.1em] uppercase text-[0.9em]',
        scene: 'text-white/40 italic', regular: 'text-white/85'
    },
    {
        id: 'prem-fire', name: 'Inferno Core', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-t from-[#7c2d12] via-[#3d1206] to-[#0d0301]',
        userBubble: 'bg-[#2a0805]/85 backdrop-blur-lg border border-orange-500/50 text-orange-100 rounded-2xl shadow-[0_0_20px_-4px_rgba(234,88,12,0.5),0_0_45px_-10px_rgba(220,38,38,0.35)]',
        aiBubble: 'bg-black/80 backdrop-blur-3xl border border-red-900/30 rounded-2xl shadow-[inset_0_-20px_40px_-20px_rgba(234,88,12,0.15)]',
        dialogue: 'text-orange-400 font-extrabold [text-shadow:0_0_15px_rgba(234,88,12,0.6)]',
        scene: 'text-white/40 italic', regular: 'text-white/85 font-medium'
    },
    {
        id: 'prem-ice', name: 'Glacial Rift', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#083344] via-[#042330] to-[#020a10]',
        userBubble: 'bg-[#04141c]/85 backdrop-blur-lg border border-cyan-400/50 text-cyan-50 [clip-path:polygon(0_8px,8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%)] shadow-[0_0_25px_-5px_rgba(6,182,212,0.5)]',
        aiBubble: 'bg-black/80 backdrop-blur-3xl border border-cyan-800/25 [clip-path:polygon(8px_0,100%_0,100%_100%,8px_100%,0_calc(100%-8px),0_8px)]',
        dialogue: 'text-cyan-300 font-extrabold tracking-wide [text-shadow:0_0_15px_rgba(6,182,212,0.5)]',
        scene: 'text-white/40 italic', regular: 'text-white/85 font-medium'
    },
    {
        id: 'prem-trees', name: 'Sylvan Forest', tier: PRO_TIERS.MONTHLY, type: 'premium',
        bgClass: 'bg-gradient-to-br from-[#064e3b] via-[#03301f] to-[#010a06]',
        userBubble: 'bg-[#04140a]/85 backdrop-blur-lg border border-emerald-500/50 text-emerald-50 rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl shadow-[0_0_25px_-5px_rgba(16,185,129,0.45)]',
        aiBubble: 'bg-black/80 backdrop-blur-3xl border border-emerald-800/25 rounded-tr-3xl rounded-bl-3xl rounded-tl-xl rounded-br-xl [background-image:radial-gradient(rgba(16,185,129,0.08)_1px,transparent_1px)] [background-size:14px_14px]',
        dialogue: 'text-emerald-400 font-extrabold tracking-wide [text-shadow:0_0_12px_rgba(16,185,129,0.4)]',
        scene: 'text-white/40 italic', regular: 'text-white/85 font-medium'
    },
];

export const TYPOGRAPHY = [
    { id: 'font-inter', name: 'Inter (Default)', tier: PRO_TIERS.FREE, style: { fontFamily: "'Inter', sans-serif" } },
    { id: 'font-merriweather', name: 'Classic Serif', tier: PRO_TIERS.WEEKLY, style: { fontFamily: "'Merriweather', serif" } },
    { id: 'font-mono', name: 'System Mono', tier: PRO_TIERS.WEEKLY, style: { fontFamily: "monospace" } },
    { id: 'font-outfit', name: 'Modern Minimal', tier: PRO_TIERS.WEEKLY, style: { fontFamily: "'Outfit', sans-serif" } },
    { id: 'font-lora', name: 'Elegant Journal', tier: PRO_TIERS.WEEKLY, style: { fontFamily: "'Lora', serif" } },
    { id: 'font-space', name: 'Space Grotesk', tier: PRO_TIERS.WEEKLY, style: { fontFamily: "'Space Grotesk', sans-serif" } },
    { id: 'font-cinzel', name: 'Cinematic Epilogue', tier: PRO_TIERS.MONTHLY, style: { fontFamily: "'Cinzel', serif" } },
    { id: 'font-crimson', name: 'Arcane Manuscript', tier: PRO_TIERS.MONTHLY, style: { fontFamily: "'Crimson Text', serif" } },
    { id: 'font-rajdhani', name: 'Cyber HUD', tier: PRO_TIERS.MONTHLY, style: { fontFamily: "'Rajdhani', sans-serif" } },
    { id: 'font-cormorant', name: 'Vampire Court', tier: PRO_TIERS.MONTHLY, style: { fontFamily: "'Cormorant Garamond', serif" } },
    { id: 'font-grenze', name: 'Dark Fantasy', tier: PRO_TIERS.MONTHLY, style: { fontFamily: "'Grenze', serif" } },
];


export const AVATAR_RINGS = [
    { id: 'ring-none', name: 'Default', tier: PRO_TIERS.FREE, class: "ring-2 ring-white/10 ring-offset-2 ring-offset-black" },
    { id: 'ring-neon', name: 'Neon Pulse', tier: PRO_TIERS.WEEKLY, class: "ring-2 ring-fuchsia-500/80 ring-offset-2 ring-offset-black shadow-[0_0_10px_rgba(217,70,239,0.5)]" },
    { id: 'ring-cyan', name: 'Cyber Blue', tier: PRO_TIERS.WEEKLY, class: "ring-2 ring-cyan-500/80 ring-offset-2 ring-offset-black shadow-[0_0_10px_rgba(6,182,212,0.5)]" },
    { id: 'ring-emerald', name: 'Emerald Glow', tier: PRO_TIERS.WEEKLY, class: "ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-black shadow-[0_0_10px_rgba(16,185,129,0.5)]" },
    { id: 'ring-amber', name: 'Golden Edge', tier: PRO_TIERS.WEEKLY, class: "ring-2 ring-amber-500/80 ring-offset-2 ring-offset-black shadow-[0_0_10px_rgba(245,158,11,0.5)]" },
    { id: 'ring-rose', name: 'Crimson Thread', tier: PRO_TIERS.WEEKLY, class: "ring-2 ring-rose-500/80 ring-offset-2 ring-offset-black shadow-[0_0_10px_rgba(225,29,72,0.5)]" },
    { id: 'ring-arcane', name: 'Arcane Void', tier: PRO_TIERS.MONTHLY, class: "ring-[4px] ring-purple-600 ring-offset-[3px] ring-offset-[#0a0510] shadow-[0_0_20px_rgba(147,51,234,0.6)]" },
    { id: 'ring-blood', name: 'Blood Onyx', tier: PRO_TIERS.MONTHLY, class: "ring-[4px] ring-rose-800 ring-offset-[3px] ring-offset-[#080103] shadow-[0_0_20px_rgba(225,29,72,0.6)]" },
    { id: 'ring-inferno', name: 'Inferno Core', tier: PRO_TIERS.MONTHLY, class: "ring-[4px] ring-orange-600 ring-offset-[3px] ring-offset-[#0a0202] shadow-[0_0_20px_rgba(234,88,12,0.6)]" },
    { id: 'ring-glacial', name: 'Glacial Rift', tier: PRO_TIERS.MONTHLY, class: "ring-[4px] ring-cyan-400 ring-offset-[3px] ring-offset-[#01050a] shadow-[0_0_20px_rgba(34,211,238,0.6)]" },
    { id: 'ring-sylvan', name: 'Sylvan Wreath', tier: PRO_TIERS.MONTHLY, class: "ring-[4px] ring-emerald-600 ring-offset-[3px] ring-offset-[#020805] shadow-[0_0_20px_rgba(5,150,105,0.6)]" },
];


export const CHAT_BUBBLES = [
    { id: 'bubble-default', name: 'Theme Default', tier: PRO_TIERS.FREE, userBubble: null, aiBubble: null },
    { id: 'bubble-glass', name: 'Clear Glass', tier: PRO_TIERS.WEEKLY, userBubble: 'bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-3xl', aiBubble: 'bg-white/[0.06] backdrop-blur-2xl border border-white/12 rounded-3xl' },
    { id: 'bubble-neon-wire', name: 'Neon Wireframe', tier: PRO_TIERS.WEEKLY, userBubble: 'bg-[#120524]/80 backdrop-blur-md border border-fuchsia-500/60 text-fuchsia-50 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.2)]', aiBubble: 'bg-black/70 backdrop-blur-xl border border-white/12 rounded-xl' },
    { id: 'bubble-cyber', name: 'Cyberpunk', tier: PRO_TIERS.WEEKLY, userBubble: 'bg-yellow-500/10 backdrop-blur-sm border-l-4 border-yellow-500 text-yellow-50 rounded-none', aiBubble: 'bg-black/60 backdrop-blur-sm border-r-4 border-white/20 rounded-none' },
    { id: 'bubble-minimal', name: 'Minimalist', tier: PRO_TIERS.WEEKLY, userBubble: 'bg-zinc-800 text-white rounded-md border border-zinc-700', aiBubble: 'bg-zinc-900/90 border-l-2 border-zinc-600 rounded-r-md' },
    { id: 'bubble-hologram', name: 'Hologram', tier: PRO_TIERS.WEEKLY, userBubble: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-400/40 text-blue-50 rounded-full', aiBubble: 'bg-black/60 backdrop-blur-xl border border-white/12 rounded-full' },
    { id: 'bubble-arcane', name: 'Arcane Scroll', tier: PRO_TIERS.MONTHLY, userBubble: 'bg-[#2a134a]/90 backdrop-blur-md border border-purple-500/50 text-purple-100 rounded-sm shadow-[4px_4px_0px_rgba(147,51,234,0.4)]', aiBubble: 'bg-black/80 backdrop-blur-3xl border border-white/12 rounded-sm shadow-[-4px_4px_0px_rgba(255,255,255,0.04)]' },
    { id: 'bubble-blood', name: 'Vampiric Edge', tier: PRO_TIERS.MONTHLY, userBubble: 'bg-gradient-to-br from-[#40071a]/90 to-black backdrop-blur-md border-r-4 border-rose-700 text-rose-100 rounded-l-2xl rounded-tr-sm rounded-br-sm', aiBubble: 'bg-black/85 backdrop-blur-3xl border-l-4 border-white/12 rounded-r-2xl rounded-tl-sm rounded-bl-sm' },
    { id: 'bubble-gold', name: 'Executive Gold', tier: PRO_TIERS.MONTHLY, userBubble: 'bg-gradient-to-r from-amber-600/85 to-yellow-700/85 backdrop-blur-md text-amber-50 border border-amber-400/40 rounded-lg', aiBubble: 'bg-black/85 backdrop-blur-3xl border border-white/12 rounded-lg shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]' },
    { id: 'bubble-obsidian', name: 'Obsidian Shard', tier: PRO_TIERS.MONTHLY, userBubble: 'bg-black/85 backdrop-blur-md border-b-2 border-r-2 border-zinc-600 text-zinc-100 rounded-tl-[2rem] rounded-br-[2rem]', aiBubble: 'bg-zinc-950/90 backdrop-blur-3xl border-b-2 border-l-2 border-white/10 rounded-tr-[2rem] rounded-bl-[2rem]' },
    { id: 'bubble-ethereal', name: 'Ethereal Mist', tier: PRO_TIERS.MONTHLY, userBubble: 'bg-white/12 backdrop-blur-2xl border border-white/30 text-white rounded-[2rem]', aiBubble: 'bg-white/[0.04] backdrop-blur-3xl border border-white/15 rounded-[2rem] shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]' },
];


export const canEquip = (userTier, itemTier) => {
    if (userTier === PRO_TIERS.MONTHLY) return true;
    if (userTier === PRO_TIERS.WEEKLY && (itemTier === PRO_TIERS.FREE || itemTier === PRO_TIERS.WEEKLY)) return true;
    return itemTier === PRO_TIERS.FREE;
};

export const getAmbientGlow = (mood) => {
    const glows = {
        tension: "239, 68, 68", mystery: "139, 92, 246", horror: "127, 29, 29",
        gloom: "75, 85, 99", betrayal: "185, 28, 28", calm: "16, 185, 129",
        suspense: "245, 158, 11", melancholy: "59, 130, 246", triumph: "16, 185, 129",
        intimacy: "236, 72, 153", awe: "6, 182, 212", spite: "217, 119, 6"
    };
    return glows[mood] || glows.calm;
};


export const getChatBubbleStyles = (mood) => {
    const base = 'backdrop-blur-2xl border transition-all duration-700 ease-out rounded-[1.5rem] border-l-4';
    const styles = {
        neutral: `${base} bg-gradient-to-br from-[#0a0e0c]/98 to-[#010201]/98 border-gray-500/20   border-l-[#9CA3AF]`,
        calm: `${base} bg-gradient-to-br from-[#0a0e0c]/98 to-[#010201]/98 border-emerald-500/20 border-l-[#10B981]`,
        tension: `${base} bg-gradient-to-br from-[#1a0505]/98 to-[#010201]/98 border-red-500/20     border-l-[#EF4444]`,
        betrayal: `${base} bg-gradient-to-br from-[#1a0202]/98 to-[#010201]/98 border-red-700/30     border-l-[#B91C1C]`,
        horror: `${base} bg-gradient-to-br from-[#120303]/98 to-[#010201]/98 border-red-900/40     border-l-[#7F1D1D]`,
        mystery: `${base} bg-gradient-to-br from-[#0e051a]/98 to-[#010201]/98 border-purple-500/20  border-l-[#8B5CF6]`,
        suspense: `${base} bg-gradient-to-br from-[#1a0f05]/98 to-[#010201]/98 border-amber-500/20  border-l-[#F59E0B]`,
        triumph: `${base} bg-gradient-to-br from-[#051a10]/98 to-[#010201]/98 border-emerald-500/20 border-l-[#10B981]`,
        melancholy: `${base} bg-gradient-to-br from-[#05101a]/98 to-[#010201]/98 border-blue-500/20    border-l-[#3B82F6]`,
        gloom: `${base} bg-gradient-to-br from-[#08090a]/98 to-[#010201]/98 border-gray-600/20    border-l-[#4B5563]`,
        intimacy: `${base} bg-gradient-to-br from-[#1a0510]/98 to-[#010201]/98 border-pink-500/20    border-l-[#EC4899]`,
        awe: `${base} bg-gradient-to-br from-[#05161a]/98 to-[#010201]/98 border-cyan-500/20    border-l-[#06B6D4]`,
        spite: `${base} bg-gradient-to-br from-[#1a0a02]/98 to-[#010201]/98 border-orange-600/20  border-l-[#D97706]`,
    };
    return styles[mood] || styles.neutral;
};

export const isDangerMood = (mood) => ['tension', 'betrayal', 'horror', 'spite'].includes(mood);
