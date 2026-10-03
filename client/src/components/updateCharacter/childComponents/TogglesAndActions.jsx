import React from "react";

const TOGGLES = [
  {
    name: "isPublic",
    label: "Public Discovery",
    hint: "Allow users to find and interact with this character.",
  },
  {
    name: "hideDescription",
    label: "Private Definitions",
    hint: "Hide backend narrative (personality, scenario) from public view.",
  },
];

const TogglesAndActions = ({
  formData,
  handleChange,
  handleSubmit,
  handleDiscard,
  isUnchanged,
  isSaving,
}) => {
  return (
    <>
      {/* TOGGLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOGGLES.map(({ name, label, hint }) => (
          <div
            key={name}
            className="flex justify-between items-center gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800"
          >
            <div>
              <p className="text-sm font-semibold text-zinc-100">{label}</p>
              <p className="text-xs text-zinc-500 mt-1">{hint}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name={name}
                checked={formData[name]}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full bg-zinc-800 border border-zinc-700 peer-checked:bg-[#00e676] peer-checked:border-[#00e676] transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-white peer-checked:after:bg-black after:transition-transform peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>

      {/* ACTION BAR */}
      <div className="sm:sticky sm:bottom-4 z-10 mb-24 sm:mb-0 flex flex-col-reverse sm:flex-row sm:items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
        <span
          className={`hidden sm:flex items-center gap-2 px-3 text-xs ${isUnchanged ? "text-zinc-600" : "text-[#00e676]"}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isUnchanged ? "bg-zinc-700" : "bg-[#00e676]"}`}
          />
          {isUnchanged ? "No changes" : "Unsaved changes"}
        </span>

        <button
          type="button"
          onClick={handleDiscard}
          disabled={isUnchanged || isSaving}
          className="sm:ml-auto px-6 py-3.5 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Discard Changes
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUnchanged || isSaving}
          title={isUnchanged ? "No changes to save" : "Save character updates"}
          className={`px-6 py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${
            isUnchanged
              ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
              : "bg-[#00e676] hover:bg-[#33ff99] text-black shadow-[0_0_24px_-6px_#00e676]"
          }`}
        >
          {isSaving ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
              Updating Profile...
            </>
          ) : (
            "Save & Update Character"
          )}
        </button>
      </div>
    </>
  );
};

export default TogglesAndActions;
