import React, { useState } from "react";
import { PRIMARY_TAG_OPTIONS } from "../../../utils/primaryTags.js";
import { Section, inputCls } from "./FormUI.jsx";

const SUGGESTIONS = [
  "Grumpy",
  "Overpowered",
  "Mystery",
  "Regression",
  "Slow Burn",
  "Anti-Hero",
];
const pill = "px-3.5 py-1.5 rounded-full text-sm border transition-colors";

const Categorization = ({
  formData,
  togglePrimaryTag,
  handleAddSecondaryTag,
  handleRemoveSecondaryTag,
}) => {
  const [newTag, setNewTag] = useState("");

  const onAddTag = () => {
    handleAddSecondaryTag(newTag);
    setNewTag("");
  };

  return (
    <Section title="Categorization">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold text-zinc-400 mb-1">
            Primary tags
          </p>
          <p className="text-xs text-zinc-500 mb-3">
            Main tags for the character. They play a big role in moderation and
            discovery.
          </p>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_TAG_OPTIONS.map((tag) => {
              const tagName = typeof tag === "object" ? tag.name : tag;
              const isSelected = formData.primaryTags.includes(tagName);
              return (
                <button
                  key={tagName}
                  type="button"
                  onClick={() => togglePrimaryTag(tagName)}
                  className={`${pill} ${
                    isSelected
                      ? "bg-[#00e676] border-[#00e676] text-black font-semibold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {tagName}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-zinc-400 mb-1">
            Secondary tags (traits)
          </p>
          <p className="text-xs text-zinc-500 mb-3">Custom tags of your own.</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddTag()}
              placeholder="e.g. Overpowered, Flirty, Stoic..."
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={onAddTag}
              className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-100 hover:border-[#00e676] hover:text-[#00e676] transition-colors"
            >
              Add Trait
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.filter((t) => !formData.secondaryTags.includes(t)).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddSecondaryTag(t)}
                  className={`${pill} border-dashed border-zinc-700 text-zinc-400 hover:border-[#00e676] hover:text-[#00e676]`}
                >
                  + {t}
                </button>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 min-h-[64px]">
            {formData.secondaryTags.length === 0 && (
              <span className="text-sm text-zinc-600 w-full text-center">
                No traits added yet.
              </span>
            )}
            {formData.secondaryTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRemoveSecondaryTag(tag)}
                className={`${pill} bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-red-500/50 hover:text-red-400`}
              >
                {tag} ✕
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Categorization;
