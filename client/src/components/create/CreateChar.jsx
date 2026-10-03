// create/CreateChar.jsx
import React, { useState, useEffect } from "react";
import { useCharacterForm } from "./hooks.js";
import { PRIMARY_TAG_OPTIONS } from "../../utils/primaryTags.js";

// Child Components Import
import CoreFeatures from "./childComponents/CoreFeature.jsx";
import TagsSection from "./childComponents/TagSection.jsx";
import NarrativeSection from "./childComponents/NarrativeSection.jsx";
import ImageSection from "./childComponents/ImageSection.jsx";
import ActionButtons from "./childComponents/ActionButton.jsx";

const STEPS = ["Basics", "Tags", "Story", "Art & Publish"];
const DRAFT_KEY = "character-draft";

const CreateCharacter = () => {
  // 🧠 Saara logic hook handle kar raha hai
  const {
    form,
    loading,
    updateField,
    handleChange,
    addListItem,
    updateListItem,
    removeListItem,
    togglePrimaryTag,
    handleImageUpload,
    removeImage,
    handleSubmit,
  } = useCharacterForm();

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false); // "Draft saved locally..." indicator

  // 💾 Local auto-save: form change ke 2 sec baad localStorage me save
  // (images/previewImages skip - File objects aur blob URLs store nahi ho sakte)
  useEffect(() => {
    let hideTimer;
    const timer = setTimeout(() => {
      try {
        const { images, previewImages, ...savable } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(savable));
        setSaved(true);
        hideTimer = setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.warn("Draft auto-save failed", err);
      }
    }, 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [form]);

  // 👀 Live preview data (same central `form` state se)
  const primaryTagNames = PRIMARY_TAG_OPTIONS.filter((t) =>
    form.primaryTags.includes(t.id),
  ).map((t) => t.name);
  const previewTags = [...primaryTagNames, ...form.secondaryTags];
  const cover = form.previewImages[0];

  const isLast = step === STEPS.length - 1;

  return (
    <div className="relative min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8 font-sans text-zinc-300 mt-10 mb-10 sm:mb-2 selection:bg-[#00e676]/30">
      <div className="relative max-w-[1200px] mx-auto z-10">
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            <span className="text-white">Create</span>
            <br />
            <span className="text-zinc-500">Character</span>
          </h1>
        </div>

        {/* STEPPER */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors ${
                i === step
                  ? "bg-[#00e676] border-[#00e676] text-black"
                  : i < step
                    ? "bg-zinc-900 border-[#00e676]/40 text-[#00e676]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* 1. Basic Details */}
            {step === 0 && (
              <CoreFeatures form={form} handleChange={handleChange} />
            )}

            {/* 2. Tags Logic */}
            {step === 1 && (
              <TagsSection
                form={form}
                togglePrimaryTag={togglePrimaryTag}
                addListItem={addListItem}
                removeListItem={removeListItem}
              />
            )}

            {/* 3. Story & Personality */}
            {step === 2 && (
              <NarrativeSection
                form={form}
                handleChange={handleChange}
                updateListItem={updateListItem}
                removeListItem={removeListItem}
                addListItem={addListItem}
              />
            )}

            {/* 4. Images Upload + 5. Toggles & Buttons */}
            {isLast && (
              <>
                <ImageSection
                  form={form}
                  loading={loading}
                  handleImageUpload={handleImageUpload}
                  removeImage={removeImage}
                />
                <ActionButtons
                  form={form}
                  updateField={updateField}
                  loading={loading}
                  handleSubmit={handleSubmit}
                  saved={saved}
                />
              </>
            )}

            {/* NEXT / BACK */}
            <div className="flex justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                Back
              </button>
              {!isLast && (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-[#00e676] hover:bg-[#33ff99] text-black text-sm font-bold rounded-xl transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </form>

          {/* LIVE PREVIEW CARD */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-black">
              <div className="relative aspect-[2/3] bg-zinc-900">
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-black text-zinc-800">
                    {(form.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00e676] text-black text-xs font-bold">
                  Preview
                </span>
                <div className="absolute bottom-0 w-full p-5">
                  <h3 className="text-3xl font-black text-white uppercase leading-none break-words">
                    {form.name || "Character name"}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                    {form.shortDescription || "Your one-line hook shows here."}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {previewTags.slice(0, 6).map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-[11px] rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {form.firstDialogues[0] && (
                <p className="p-4 text-xs text-zinc-500 border-t border-zinc-800 line-clamp-3">
                  {form.firstDialogues[0]}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
