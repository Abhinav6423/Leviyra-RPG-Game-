import React from "react";
import { getWordCount } from "../utils";
import { Section, Field, inputCls } from "./FormUI.jsx";

const IdentitySection = ({ formData, handleChange }) => {
  return (
    <Section title="Identity">
      <div className="space-y-6">
        <Field
          label="Character name *"
          hint="Publicly visible by default."
          count={formData.name?.length || 0}
          limit={30}
          unit="Letters"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={30}
            className={inputCls}
            placeholder="e.g. Kael the Ashen Knight"
          />
        </Field>

        <Field
          label="Short description"
          hint="Shown on the explore tab to hint at the plot."
          count={getWordCount(formData.shortDescription)}
          limit={25}
        >
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className={inputCls}
            placeholder="e.g. A rogue knight looking for redemption"
          />
        </Field>

        <Field
          label="Long description (detailed lore)"
          hint="Main text on the full character page: story, background, anything you want to say."
          count={getWordCount(formData.longDescription)}
          limit={2000}
        >
          <textarea
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows={6}
            className={`${inputCls} resize-none leading-relaxed`}
            placeholder="Expand on their background, motives, and world..."
          />
        </Field>
      </div>
    </Section>
  );
};

export default IdentitySection;
