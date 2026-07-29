import React, { useState, useEffect, useRef } from "react";
import { LogOut, Grid, Plus, Search, Sparkles, Crown, Menu, MessageSquare } from "lucide-react";
import CategoryPopup from "../Pop-ups/CategoryPopup.jsx";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.js";
import { useAuth } from "../../context/Authcontext.jsx";

const Navbar = () => {
    const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Dropdown state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const desktopSearchInputRef = useRef(null);

    const navigate = useNavigate();
    const authData = useAuth();

    const firebaseUser = authData?.firebaseUser;
    const dbUser = authData?.user;
    const { user } = useAuth();
    const userPlan = user?.subscription?.plan || "weekly";

    const loading = authData?.loading;
    const isPro = dbUser?.subscription?.status === "active";

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Body Scroll Lock for Popup
    useEffect(() => {
        document.body.style.overflow = categoryPopupOpen ? "hidden" : "auto";
        // Cleanup function to ensure scroll is restored if component unmounts
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [categoryPopupOpen]);

    // Handle Escape Key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setCategoryPopupOpen(false);
                setIsSearchOpen(false);
                setIsMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const runSearch = (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        navigate(`/search-results/${encodeURIComponent(trimmed)}`);
        query && setSearchQuery("");
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
        desktopSearchInputRef.current?.blur();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            runSearch(searchQuery);
        }
        if (e.key === "Escape") {
            setIsSearchOpen(false);
            e.currentTarget.blur();
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error("Logout Error:", err);
        }
    };

    if (loading) {
        return <nav className="fixed top-0 left-0 w-full h-16 sm:h-20" />;
    }

    const proStyles = userPlan === "monthly"
        ? {
            badgeBg: "bg-[#FFC837]/10 border-[#FFC837]/20 hover:bg-[#FFC837]/20 hover:border-[#FFC837]/40",
            badgeText: "text-[#FFC837] group-hover:text-[#FFD700]",
            crown: "text-[#FFC837] fill-[#FFC837]",
            pillBorder: "border-[#FFC837]/30 hover:border-[#FFC837]/60 hover:bg-[#FFC837]/5 shadow-[0_0_15px_rgba(255,200,55,0.08)]",
            avatarBorder: "border border-[#FFC837]/80 shadow-[0_0_10px_rgba(255,200,55,0.3)] group-hover:border-[#FFC837]",
            pillLabel: "text-[#FFC837]"
        }
        : {
            badgeBg: "bg-[#00E5FF]/10 border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40",
            badgeText: "text-[#00E5FF] group-hover:text-[#66FFFF]",
            crown: "text-[#00E5FF] fill-[#00E5FF]",
            pillBorder: "border-[#00E5FF]/30 hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 shadow-[0_0_15px_rgba(0,229,255,0.08)]",
            avatarBorder: "border border-[#00E5FF]/80 shadow-[0_0_10px_rgba(0,229,255,0.3)] group-hover:border-[#00E5FF]",
            pillLabel: "text-[#00E5FF]"
        };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-40 h-16 sm:h-[4.5rem] bg-transparent sm:bg-[#050505]/90 sm:backdrop-blur-2xl sm:border-b sm:border-white/5 transition-all duration-300 font-sans">
                <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
                    {/* ── LOGO (Left) ── */}
                    <div className="flex-1 flex justify-start">
                        <Link to="/home" className="focus:outline-none block group shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-white/5 group-hover:border-zinc-500/50 shadow-sm transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="font-sans text-zinc-100 text-xl font-bold tracking-tight group-hover:text-white transition-colors duration-300">
                                    L
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* ── MOBILE: SEARCH & GO PRO ── */}
                    <div className="flex md:hidden flex-1 justify-end items-center gap-2">
                        {!isPro && (
                            <div className={`transition-all duration-300 ease-out overflow-hidden flex items-center ${isSearchOpen ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                                <Link to="/subscription" className="focus:outline-none mr-1">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${proStyles.badgeBg}`}>
                                        <Sparkles size={12} className={proStyles.badgeText} />
                                        <span className={`text-[10px] font-semibold uppercase tracking-widest mt-[1px] ${proStyles.badgeText}`}>Pro</span>
                                    </div>
                                </Link>
                            </div>
                        )}

                        <div
                            className={`flex items-center bg-zinc-900/50 border backdrop-blur-xl transition-all duration-300 ease-out overflow-hidden shadow-sm shrink-0 ${isSearchOpen
                                ? "w-full max-w-[220px] px-4 py-2.5 rounded-full border-zinc-500/50 shadow-lg"
                                : "w-10 h-10 rounded-full border-white/5 justify-center cursor-pointer hover:bg-zinc-800/60"
                                }`}
                            onClick={() => {
                                if (!isSearchOpen) setIsSearchOpen(true);
                            }}
                        >
                            <Search
                                className={`shrink-0 transition-colors ${isSearchOpen ? "w-4 h-4 text-zinc-300 mr-2.5" : "w-4.5 h-4.5 text-zinc-400"}`}
                                strokeWidth={isSearchOpen ? 2.5 : 2}
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Search..."
                                className={`bg-transparent text-sm font-medium text-zinc-100 placeholder:text-zinc-500 outline-none transition-all duration-300 ${isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0 px-0"}`}
                                onBlur={() => setIsSearchOpen(false)}
                            />
                        </div>
                    </div>

                    {/* ── DESKTOP: SEARCH BAR ── */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[420px] lg:max-w-[550px] z-20">
                        <div className="group relative flex items-center bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-sm overflow-hidden transition-all duration-400 ease-out w-full hover:border-zinc-700/60 focus-within:border-zinc-500/80 focus-within:bg-[#0a0a0a] focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-focus-within:via-white/15" />
                            <div className="flex items-center w-full px-5 py-3 gap-3.5">
                                <Search
                                    className="shrink-0 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-300"
                                    strokeWidth={2}
                                />
                                <input
                                    ref={desktopSearchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Search by character name, tags..."
                                    className="bg-transparent text-sm lg:text-[15px] font-medium text-zinc-100 placeholder:text-zinc-500 outline-none w-full"
                                />
                                <div className="hidden lg:flex items-center justify-center px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-zinc-500 font-medium tracking-widest shrink-0">
                                    ⌘K
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── DESKTOP: RIGHT NAVIGATION ── */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-2 lg:gap-4 z-30">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 focus:outline-none ${isMenuOpen ? "bg-zinc-800/60 border-zinc-500/50 text-white" : "border-transparent hover:border-white/5 hover:bg-zinc-800/40 text-zinc-400 hover:text-white"}`}
                            >
                                <Menu size={20} strokeWidth={1.5} />
                            </button>

                            <div className={`absolute right-0 top-[120%] w-52 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden py-1.5 z-50 ${isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-3"}`}>
                                <Link
                                    to="/create"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                                >
                                    <Plus size={16} className="text-zinc-400" /> Write Story
                                </Link>
                                <Link
                                    to="/chats"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                                >
                                    <MessageSquare size={16} className="text-zinc-400" /> Recent Chats
                                </Link>
                                <div className="h-px bg-zinc-800/80 my-1 mx-2" />
                                <button
                                    onClick={() => {
                                        setCategoryPopupOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors text-left"
                                >
                                    <Grid size={16} className="text-zinc-400" /> Browse Categories
                                </button>
                            </div>
                        </div>

                        <div className="w-[1px] h-5 bg-zinc-800/80 mx-1"></div>

                        {!isPro && (
                            <Link to="/subscription" className="focus:outline-none group">
                                <div className={`h-10 flex items-center gap-2 px-4 rounded-full border shadow-sm transition-all duration-300 relative ${proStyles.badgeBg}`}>
                                    <Sparkles size={14} className={proStyles.badgeText} />
                                    <span className={`hidden lg:block text-[11px] font-semibold uppercase tracking-widest transition-colors mt-[1px] ${proStyles.badgeText}`}>
                                        Go Pro
                                    </span>
                                </div>
                            </Link>
                        )}

                        <Link to="/profile" className="focus:outline-none">
                            <div className={`group h-10 flex items-center gap-2.5 p-1 pr-3 lg:pr-4 rounded-full border bg-zinc-900/30 transition-all duration-300 cursor-pointer ${isPro ? proStyles.pillBorder : "border-white/5 hover:border-zinc-500/50 hover:bg-zinc-800/50"}`}>
                                <div className="relative shrink-0 mt-[1px]">
                                    {isPro && (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
                                            <Crown size={12} strokeWidth={2.5} className={proStyles.crown} />
                                        </div>
                                    )}
                                    <img
                                        src={dbUser?.profilePicture || firebaseUser?.photoURL || "https://i.pravatar.cc/40"}
                                        alt={`${firebaseUser?.displayName || dbUser?.username || "User"}'s avatar`}
                                        className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover transition-all duration-300 relative z-0 ${isPro ? proStyles.avatarBorder : "border border-transparent group-hover:border-zinc-400"}`}
                                    />
                                    {!isPro && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050505]" />
                                    )}
                                </div>
                                <div className="hidden xl:flex flex-col justify-center">
                                    <span className={`text-[9px] font-semibold uppercase tracking-widest leading-none mb-1 ${isPro ? proStyles.pillLabel : "text-zinc-500"}`}>
                                        {isPro ? `${userPlan} Pro` : "Profile"}
                                    </span>
                                    <span className="text-zinc-200 text-xs font-medium tracking-wide group-hover:text-white transition-colors leading-none truncate max-w-[90px]">
                                        {firebaseUser?.displayName || dbUser?.username || "Reader"}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🔴 HERE IS THE FIX: Actually rendering the Popup! */}
            {categoryPopupOpen && (
                <CategoryPopup onClose={() => setCategoryPopupOpen(false)} />
            )}
        </>
    );
};

export default Navbar;