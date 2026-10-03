import React from "react";
import { getWordCount } from "../utils";
import { Section, Field, inputCls } from "./FormUI.jsx";

const NarrativeSection = ({
  formData,
  handleChange,
  handleDialogueChange,
  addDialogue,
  removeDialogue,
}) => {
  return (
    <Section
      title="Narrative & Definitions"
      hint={
        'Define the character and their world. You can hide this from the public with "Private Definitions" at the bottom.'
      }
    >
      <div className="space-y-6">
        <Field
          label="Personality"
          hint="How they act and speak, and in part the world around them."
          count={getWordCount(formData.personality)}
          limit={3000}
        >
          <textarea
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            rows={5}
            className={`${inputCls} resize-none`}
            placeholder="What is their biggest fear? What do they hide behind a smile?"
          />
        </Field>

        <Field
          label="Scenario"
          hint="The current situation. You can add a few extra needs here."
          count={getWordCount(formData.scenario)}
          limit={3000}
        >
          <textarea
            name="scenario"
            value={formData.scenario}
            onChange={handleChange}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="What situation are they stuck in right now?"
          />
        </Field>

        <div>
          <p className="text-xs font-semibold text-zinc-400 mb-1">
            First dialogues
          </p>
          <p className="text-xs text-zinc-500 mb-3">
            The first seed of the conversation. Max 1000 words each.
          </p>
          <div className="space-y-4">
            {formData.firstDialogues.map((dialogue, idx) => (
              <div
                key={idx}
                className="relative pl-3 border-l-2 border-[#00e676]/60"
              >
                <Field
                  label={`Dialogue ${idx + 1}`}
                  count={getWordCount(dialogue)}
                  limit={1000}
                >
                  <textarea
                    value={dialogue}
                    onChange={(e) => handleDialogueChange(idx, e.target.value)}
                    rows={3}
                    className={`${inputCls} resize-none pr-10`}
                    placeholder="Write a creative opening message..."
                  />
                </Field>
                {formData.firstDialogues.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDialogue(idx)}
                    title="Delete dialogue"
                    className="absolute top-9 right-3 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addDialogue}
            className="mt-4 text-sm font-semibold text-[#00e676] hover:underline"
          >
            + Add alternative greeting
          </button>
        </div>
      </div>
    </Section>
  );
};

export default NarrativeSection;
