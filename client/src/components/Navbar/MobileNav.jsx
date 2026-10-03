import React, { useState } from "react";
import { Home, Plus, Grid, User, MessagesSquare, Crown } from "lucide-react";
import CategoryPopup from "../Pop-ups/CategoryPopup.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.jsx";

const MobileNav = () => {
  const [active, setActive] = useState("home");
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const { user } = useAuth();
  const authData = useAuth();
  const firebaseUser = authData?.firebaseUser;
  const dbUser = authData?.user;
  const loading = authData?.loading;

  // Check if the user has an active subscription
  const isPro = dbUser?.subscription?.status === "active";

  const navItems = [
    { id: "home", icon: Home, label: "Home", link: "/home" },
    { id: "create", icon: Plus, label: "Create", link: "/create" },
    { id: "chats", icon: MessagesSquare, label: "Chats", link: "/chats" },
    { id: "browse", icon: Grid, label: "Categories" },
    { id: "profile", icon: User, label: "Profile", link: "/profile" },
  ];

  const handleClick = (item) => {
    if (item.id === "browse") {
      setCategoryPopupOpen(true);
      return;
    }
    setActive(item.id);
  };

  // 1. GET THE PLAN
  const userPlan = user?.subscription?.plan || "weekly";

  return (
    <>
      {/* ✅ FIX APPLIED HERE: 
              Added transition-transform duration-300.
              When categoryPopupOpen is true, it translates down (translate-y-full) and fades out.
            */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 w-full z-40 h-[4.5rem] pb-[env(safe-area-inset-bottom)] transition-all duration-300 ease-in-out ${categoryPopupOpen ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      >
        {/* 🌐 PREMIUM GLASSMORPHISM BACKDROP - Darker, richer blur */}
        <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-[24px] border-t border-white/5" />

        {/* 🎛️ NAV CONTENT */}
        <div className="relative h-full flex justify-between items-center px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const isProfile = item.id === "profile";
            const showCrown = isProfile && isPro;
            const hasProfilePic = isProfile && firebaseUser?.photoURL;

            // 2. DEFINE THE COLOR THEMES FOR EACH TIER
            const proStyles =
              userPlan === "monthly"
                ? {
                    // 🏆 ROYAL GOLD (Monthly)
                    indicator:
                      "bg-[#FFC837] shadow-[0_3px_15px_rgba(255,200,55,0.8)]",
                    crown: "text-[#FFC837] fill-[#FFC837]",
                    ringActive:
                      "ring-2 ring-[#FFC837] ring-offset-2 ring-offset-[#050505] shadow-[0_0_20px_rgba(255,200,55,0.4)]",
                    ringInactive: "ring-1 ring-[#FFC837]/50",
                    iconActive:
                      "text-[#FFC837] drop-shadow-[0_0_12px_rgba(255,200,55,0.6)]",
                    iconInactive:
                      "text-[#FFC837]/60 group-hover:text-[#FFC837]",
                    label:
                      "text-[#FFC837] font-bold drop-shadow-[0_0_8px_rgba(255,200,55,0.5)]",
                  }
                : {
                    // 💎 ICE DIAMOND (Weekly)
                    indicator:
                      "bg-[#00E5FF] shadow-[0_3px_15px_rgba(0,229,255,0.8)]",
                    crown: "text-[#00E5FF] fill-[#00E5FF]",
                    ringActive:
                      "ring-2 ring-[#00E5FF] ring-offset-2 ring-offset-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.4)]",
                    ringInactive: "ring-1 ring-[#00E5FF]/50",
                    iconActive:
                      "text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]",
                    iconInactive:
                      "text-[#00E5FF]/60 group-hover:text-[#00E5FF]",
                    label:
                      "text-[#00E5FF] font-bold drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]",
                  };

            // 3. CLEAN UP JSX BY PRE-CALCULATING CLASSES
            const indicatorClass = `absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full transition-all duration-500 ease-out ${isProfile && isPro ? proStyles.indicator : "bg-[#EC0618] shadow-[0_3px_12px_rgba(236,6,24,0.7)]"}`;

            let picClass =
              "w-7 h-7 rounded-full overflow-hidden transition-all duration-400 ease-out relative z-10 ";
            if (isActive) {
              picClass +=
                "scale-105 " +
                (isPro
                  ? proStyles.ringActive
                  : "ring-2 ring-[#EC0618] ring-offset-2 ring-offset-[#050505] shadow-[0_0_12px_rgba(236,6,24,0.4)]");
            } else {
              picClass += isPro
                ? `scale-100 ${proStyles.ringInactive}`
                : "opacity-60 group-hover:opacity-100";
            }

            let iconClass =
              "transition-all duration-400 ease-out relative z-10 ";
            if (isActive) {
              iconClass +=
                "scale-110 " +
                (isPro
                  ? proStyles.iconActive
                  : "text-[#EC0618] drop-shadow-[0_0_10px_rgba(236,6,24,0.5)]");
            } else {
              iconClass +=
                isProfile && isPro
                  ? proStyles.iconInactive
                  : "text-zinc-500 group-hover:text-zinc-300";
            }

            let labelClass =
              "relative z-10 text-[9px] tracking-wider uppercase transition-colors duration-400 ";
            if (isActive) {
              labelClass +=
                isProfile && isPro
                  ? proStyles.label
                  : "text-[#EC0618] font-bold drop-shadow-[0_0_5px_rgba(236,6,24,0.3)]";
            } else {
              labelClass +=
                "text-zinc-500 group-hover:text-zinc-300 font-medium";
            }

            return (
              <Link
                to={item.link || "#"}
                key={item.id}
                className="flex-1 h-full"
              >
                <button
                  onClick={() => handleClick(item)}
                  className="relative w-full h-full flex flex-col items-center justify-center gap-1.5 group overflow-hidden"
                >
                  {/* ACTIVE TOP INDICATOR */}
                  {isActive && <div className={indicatorClass} />}

                  {/* ICON OR PROFILE PICTURE */}
                  <div className="relative z-10 flex items-center justify-center mt-1">
                    {/* Dynamic Crown */}
                    {showCrown && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md pointer-events-none">
                        <Crown
                          size={12}
                          strokeWidth={2.5}
                          className={proStyles.crown}
                        />
                      </div>
                    )}

                    {hasProfilePic ? (
                      <div className={picClass}>
                        <img
                          src={
                            dbUser?.profilePicture ||
                            firebaseUser?.photoURL ||
                            "https://i.pravatar.cc/40"
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <Icon
                        size={24}
                        strokeWidth={1.5}
                        fill="currentColor"
                        className={iconClass}
                      />
                    )}
                  </div>

                  {/* LABEL */}
                  <span className={labelClass}>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ✅ CATEGORY POPUP */}
      {categoryPopupOpen && (
        <CategoryPopup onClose={() => setCategoryPopupOpen(false)} />
      )}
    </>
  );
};

export default MobileNav;
