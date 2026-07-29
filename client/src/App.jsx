import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// ⚡ EAGER IMPORTS: Keep these standard so the initial paint is INSTANT.
// We want the layout, auth guard, and landing/login pages to load without delay.
import MainLayout from "./layouts/Layout/MainLayout.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import LandingPage from "./components/LandingPage/LandingPage.jsx";
import LoginPage from "./components/Authentication/Login.jsx";
import Loader from "./utils/Loader.jsx";

// 🚀 LAZY IMPORTS: These are only downloaded when the user actually navigates to them.
const RegisterPage = lazy(() => import("./components/Authentication/Register.jsx"));
const HomeLayout = lazy(() => import("./layouts/Home/HomeLayout.jsx"));
const CategorySearchResult = lazy(() => import("./components/CategorySearchResult/CategorySearchResult"));
const CreateCharacter = lazy(() => import("./components/create/CreateChar.jsx"));
const CharDetailPage = lazy(() => import("./components/CharacterDetails/CharDetailsPage.jsx"));
const Profile = lazy(() => import("./components/Profile/Profile.jsx"));
const PublicProfile = lazy(() => import("./components/Profile/PublicProfile.jsx"));
const ChatArea = lazy(() => import("./components/chats/ChatArea.jsx"));
const AllChats = lazy(() => import("./components/AllChats/allChats.jsx"));
const SearchResult = lazy(() => import("./components/SearchResult/SearchResult.jsx"));
const PaymentSuccess = lazy(() => import("./components/payments/PaymentSuccess.jsx"));
const SubscriptionPage = lazy(() => import("./components/subscription/SubscriptionPage.jsx"));
const UpdateCharacter = lazy(() => import("./components/updateCharacter/UpdateCharacter.jsx"));

// 🌀 FALLBACK LOADER: Shown briefly while a lazy component is downloading
const FallbackLoader = () => (
  <Loader />
);

const App = () => {
  return (
    <>
      {/* 🔥 SONNER TOASTER (GLOBAL) - Neon Green Theme */}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: "rgba(5, 5, 7, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(57, 255, 20, 0.5)",
            color: "#39ff14",
            boxShadow: "0 0 15px rgba(57, 255, 20, 0.15)",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          },
        }}
      />

      {/* Wrap all routes in Suspense to handle the loading states of lazy components */}
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 🔐 PROTECTED ROUTES (WITH MAIN LAYOUT) */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomeLayout />} />
            <Route path="/search/:category" element={<CategorySearchResult />} />
            <Route path="/create" element={<CreateCharacter />} />
            <Route path="/character/:id" element={<CharDetailPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chats" element={<AllChats />} />
            <Route path="/search-results/:searchTerm" element={<SearchResult />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            
            <Route path="/update-character/:characterId" element={<UpdateCharacter />} />
          </Route>

          {/* 🔐 PROTECTED ROUTES (WITHOUT MAIN LAYOUT) */}
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatArea />
              </ProtectedRoute>
            }
          />

          <Route path="/public-profile/:userId" element={<PublicProfile />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;