import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.jsx";
import MobileNav from "../../components/Navbar/MobileNav.jsx";
import SubscriptionBanner from "../../components/promoStrips/SubscriptionBanner.jsx";
const MainLayout = () => {
    return (
        <div className="relative bg-[#0a0a0a] text-zinc-300 min-h-screen overflow-hidden">

            {/* Global Subtle Tech Grid Background */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(#39ff14_1px,transparent_1px),linear-gradient(90deg,#39ff14_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0 fixed" />

            <Navbar />

            {/* no pt on mobile — hero bleeds under transparent navbar */}
            <main className="relative z-10 md:pt-0 sm:mt-12">
                <Outlet />
            </main>

            <MobileNav />
            <SubscriptionBanner />
        </div>
    );
};

export default MainLayout;