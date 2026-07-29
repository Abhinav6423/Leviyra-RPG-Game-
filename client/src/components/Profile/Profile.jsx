import React, { useState, useEffect, Suspense, lazy } from "react";
import { Plus, Settings2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// NOTE: adjust these two paths to wherever they actually live relative to
// this file — they were siblings/near-siblings of the original Profile.jsx.
import { useAuth } from "../../context/Authcontext.jsx";
import { auth } from "../../firebase.js";

import ProfileBanner from "./childComponents/ProfileBanner.jsx";
import ProfileAvatar from "./childComponents/ProfileAvatar.jsx";
import ProfileIdentity from "./childComponents/ProfileIdentitiy.jsx";
import ProfileActions from "./childComponents/ProfileActions.jsx";
import ProfileStats from "./childComponents/ProfileStats.jsx";
import ProfileBio from "./childComponents/ProfileBio.jsx";
import CharacterFilterTabs from "./childComponents/CharacterFilterTabs.jsx";
import CharacterGrid from "./childComponents/CharacterGrid.jsx";
import CustomizePanel from "./childComponents/CustomizePannel.jsx";
import FollowListModal from "./childComponents/FollowListModal.jsx";

import { useSubscriptionTier } from "./logic/useSubscriptionTier.js";
import { useProfileCustomization } from "./logic/useProfileCustomization.js";
import { useFollowSystem } from "./logic/useFollowSystem.js";
import { useBannerUpload } from "./logic/useBannerUpload.js";
import { useProfilePicUpload } from "./logic/userProfilePicUpload.js";
import { useMyCharacters } from "./logic/useMyCharacters.js";
import { useShareProfile } from "./logic/useShareProfile.js";
import { FILTER_TABS } from "./logic/constants.js";

// NOTE: adjust this path — it was "../Pop-ups/UpdateProfilePopup.jsx"
// relative to the original Profile.jsx location.
const UpdateProfilePopup = lazy(
  () => import("../Pop-ups/UpdateProfilePopup.jsx"),
);

const Profile = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);

  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  const { isPro, subTier } = useSubscriptionTier(user?.subscription);

  const {
    selections,
    handleSelect,
    handleApplyStyles,
    isApplying,
    accent,
    activeTheme,
    activeBackgroundClass,
    activeAmbientGlow,
    activeFontFamily,
    appliedButtonSetting,
    appliedProfileTag,
    avatarRingStyle,
    hasCustomRing,
  } = useProfileCustomization({ user, subTier, refetchUser });

  const {
    followCounts,
    followModalType,
    followListUsers,
    isFollowListLoading,
    openFollowModal,
    closeFollowModal,
    handleFollowListUserClick,
  } = useFollowSystem(user?._id, {
    onNavigateToUser: (id) => navigate(`/public-profile/${id}`),
  });

  const {
    bannerImage,
    isUploadingBanner,
    bannerInputRef,
    handleBannerEditClick,
    handleBannerFileChange,
  } = useBannerUpload({ user, isPro, refetchUser });

  const {
    avatarImage,
    isUploadingAvatar,
    avatarInputRef,
    handleAvatarEditClick,
    handleAvatarFileChange,
  } = useProfilePicUpload({ user, isPro, refetchUser });

  const {
    characterFilter,
    setCharacterFilter,
    characters,
    isLoading: isLoadingCharacters,
    handleCharacterDeleted,
  } = useMyCharacters();

  const handleShareProfile = useShareProfile(user);
  

  useEffect(() => {
    if (showCustomizePanel || followModalType) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCustomizePanel, followModalType]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Failed to log out.");
    }
  };

  return (
    <div
      className={`min-h-screen text-zinc-300 pb-24 sm:pb-20 pt-16 sm:pt-6 relative overflow-hidden transition-colors duration-500 ${activeBackgroundClass}`}
      style={{ fontFamily: activeFontFamily }}
    >
      {activeTheme && (
        <div
          className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[280px] sm:h-[420px] opacity-[0.05] blur-[120px] pointer-events-none rounded-[100%] transition-all duration-500"
          style={{ background: activeAmbientGlow }}
        />
      )}

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center relative z-10">
        <ProfileBanner
          bannerImage={bannerImage}
          isUploadingBanner={isUploadingBanner}
          isPro={isPro}
          bannerInputRef={bannerInputRef}
          onEditClick={handleBannerEditClick}
          onFileChange={handleBannerFileChange}
        />

        <div className="relative -mt-10 sm:-mt-16 md:-mt-20 mb-4 z-20 flex justify-center">
          <ProfileAvatar
            src={avatarImage}
            avatarRingStyle={avatarRingStyle}
            hasCustomRing={hasCustomRing}
            accent={accent}
            size="lg"
            wrapped
            editable
            isPro={isPro}
            isUploadingAvatar={isUploadingAvatar}
            avatarInputRef={avatarInputRef}
            onEditClick={handleAvatarEditClick}
            onFileChange={handleAvatarFileChange}
          />
        </div>

        <ProfileIdentity
          user={user}
          isPro={isPro}
          subTier={subTier}
          accent={accent}
          followCounts={followCounts}
          appliedProfileTag={appliedProfileTag}
          onOpenFollowModal={openFollowModal}
        />

        <ProfileActions
          accent={accent}
          appliedButtonSetting={appliedButtonSetting}
          subTier={subTier}
          onEditProfile={() => setOpenPopup(true)}
          onManageSubscription={() => navigate("/subscription")}
          onShare={handleShareProfile}
          onLogout={handleLogout}
          
        />

        <ProfileStats
          accent={accent}
          charactersCount={characters?.length}
          subTier={subTier}
          isPro={isPro}
          subscription={user?.subscription} // 👈 naya prop
          usage={user?.usage} // 👈 naya prop
        />

        <div className="w-full flex flex-col gap-8 sm:gap-12 pb-6 sm:pb-12 z-20">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-xl font-semibold text-white tracking-tight">
                Profile Studio
              </h2>
              {subTier === "free" && (
                <span className="bg-white/[0.03] text-zinc-500 text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06]">
                  Pro Features
                </span>
              )}
            </div>
            <button
              onClick={() => setShowCustomizePanel(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Settings2 size={16} /> Customize Profile
            </button>
          </div>

          <ProfileBio bio={user?.bio} accent={accent} />

          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-1">
              <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight px-1">
                My Characters
              </h2>

              <div className="flex items-center justify-between xl:justify-end gap-3 w-full xl:w-auto">
                <CharacterFilterTabs
                  tabs={FILTER_TABS}
                  activeFilter={characterFilter}
                  onChange={setCharacterFilter}
                />

                <div className="w-px h-7 bg-white/[0.06] shrink-0 hidden sm:block"></div>

                <button
                  onClick={() => navigate("/create")}
                  className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors"
                  title="Create New Character"
                >
                  <Plus size={18} strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <CharacterGrid
              isLoading={isLoadingCharacters}
              characters={characters}
              characterFilter={characterFilter}
              onCharacterDeleted={handleCharacterDeleted}
            />
          </div>
        </div>

        {openPopup && (
          <Suspense fallback={null}>
            <UpdateProfilePopup
              isOpen={openPopup}
              onClose={() => setOpenPopup(false)}
              currentData={user}
            />
          </Suspense>
        )}

        {followModalType && (
          <FollowListModal
            type={followModalType}
            users={followListUsers}
            isLoading={isFollowListLoading}
            accent={accent}
            onClose={closeFollowModal}
            onUserClick={handleFollowListUserClick}
          />
        )}

        {showCustomizePanel && (
          <CustomizePanel
            user={user}
            avatarRingStyle={avatarRingStyle}
            hasCustomRing={hasCustomRing}
            accent={accent}
            selections={selections}
            subTier={subTier}
            onSelect={handleSelect}
            onClose={() => setShowCustomizePanel(false)}
            onApply={() =>
              handleApplyStyles(() => setShowCustomizePanel(false))
            }
            isApplying={isApplying}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
