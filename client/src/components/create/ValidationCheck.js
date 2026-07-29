// create/ValidationCheck.js
import { LIMITS } from './constantValues.js';

// Helper function: Text mein words count karne ke liye. (Export kar rahe hain kyunki UI mein bhi chahiye hoga)
export const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// ==========================================
// ✅ VALIDATION LOGIC
// ==========================================
export const validateCharacter = (form, status) => {
    const errors = []; // Saari galtiyan is array mein store hongi

    if (!form.name.trim()) errors.push("Name is required");
    if (form.name.length > LIMITS.name) errors.push(`Name must be under ${LIMITS.name} characters`);

    // Draft save kar rahe hain toh aage check mat karo
    if (status === "draft") return errors;

    if (!form.shortDescription.trim()) errors.push("Short description is required");
    if (wordCount(form.shortDescription) > LIMITS.shortDescription)
        errors.push(`Short description must be under ${LIMITS.shortDescription} words`);

    if (!form.longDescription.trim()) errors.push("Long description is required");
    if (wordCount(form.longDescription) > LIMITS.longDescription)
        errors.push(`Long description must be under ${LIMITS.longDescription} words`);

    if (form.primaryTags.length === 0) errors.push("Pick at least one primary tag");

    if (!form.personality.trim()) errors.push("Personality is required");
    if (wordCount(form.personality) > LIMITS.personality)
        errors.push(`Personality must be under ${LIMITS.personality} words`);

    if (!form.scenario.trim()) errors.push("Scenario is required");
    if (wordCount(form.scenario) > LIMITS.scenario)
        errors.push(`Scenario must be under ${LIMITS.scenario} words`);

    const dialogues = form.firstDialogues.filter(d => d.trim());
    if (dialogues.length === 0) errors.push("Add at least one opening dialogue");
    dialogues.forEach((d, i) => {
        if (wordCount(d) > LIMITS.dialogue) errors.push(`Dialogue #${i + 1} must be under ${LIMITS.dialogue} words`);
    });

    if (form.images.length < LIMITS.minImages) errors.push(`Add at least ${LIMITS.minImages} image`);

    return errors;
};