// create/childComponents/ActionButton.jsx
import React from "react";
import { Toggle } from "./SharedUI.jsx";

const ActionButtons = ({ form, updateField, loading, handleSubmit, saved }) => {
  return (
    <>
      {/* VISIBILITY & SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Toggle
          label="Hide Description"
          hint="Keeps seed info private"
          checked={form.hideDescription}
          onChange={() => updateField("hideDescription", !form.hideDescription)}
        />
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("draft")}
            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#00e676]/60 text-zinc-100 hover:text-[#00e676] font-bold tracking-[0.15em] text-[11px] uppercase rounded-xl transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <span
            className={`text-center text-[11px] text-[#00e676]/80 transition-opacity duration-500 ${saved ? "opacity-100" : "opacity-0"}`}
          >
            Draft saved locally...
          </span>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit("published")}
          className="flex-1 py-4 bg-[#00e676] hover:bg-[#33ff99] text-black font-bold tracking-[0.15em] text-[11px] uppercase rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_24px_-6px_#00e676]"
        >
          {loading ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full"></span>
              Working...
            </>
          ) : (
            "Publish"
          )}
        </button>
      </div>
    </>
  );
};

export default ActionButtons;
