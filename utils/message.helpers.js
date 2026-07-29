/* ============================================================
   MESSAGE HELPERS
   ------------------------------------------------------------
   WHY THIS FILE EXISTS:
   In the DB, `content` is NOT a plain string. It's an ARRAY of
   strings:

       content: ["first version of the reply", "regenerated version"]

   This is what lets "Replay" / "Regenerate" work — instead of
   overwriting the old reply, we just push a new version into
   the array, and `selectedAlternateIndex` remembers which one
   is currently being shown to the user.

   Every place in the controller that reads or writes message
   text should go through the functions below, so we never
   again accidentally save a raw string where an array is
   expected (or vice versa). That mismatch was the exact bug
   that caused the frontend crash.
============================================================ */

/**
 * Returns the array of all saved versions for a message.
 * Falls back to a 1-item array if something weird got saved
 * (defensive — should never actually be needed after this fix).
 */
export const getVersions = (msg) => {
    if (Array.isArray(msg?.content)) return msg.content;
    if (msg?.content) return [String(msg.content)];
    return [""];
};

/**
 * Returns the single string that should currently be shown
 * for this message — i.e. the "active" version.
 *
 * - If selectedAlternateIndex is set, use that version.
 * - Otherwise, default to the LATEST version (last in array).
 */
export const getActiveContent = (msg) => {
    const versions = getVersions(msg);
    const idx =
        typeof msg?.selectedAlternateIndex === "number" &&
        msg.selectedAlternateIndex >= 0 &&
        msg.selectedAlternateIndex < versions.length
            ? msg.selectedAlternateIndex
            : versions.length - 1;
    return versions[idx] ?? "";
};

/**
 * Adds a brand-new version to a message (used by Replay).
 * Mutates the mongoose doc in place — caller still needs to
 * call `.save()`.
 * Automatically points selectedAlternateIndex at the new version,
 * since a freshly-generated reply should be the one shown.
 */
export const pushNewVersion = (msg, text) => {
    msg.content.push(text);
    msg.selectedAlternateIndex = msg.content.length - 1;
};

/**
 * Dice roll text is never mixed into the stored content — we
 * keep it in its own `diceRoll` field. But the AI itself needs
 * to see it, so when building the payload we send to the model,
 * we glue "Roll: X" onto the front of the text just for that
 * one API call (this never touches the database).
 */
export const formatForPayload = (msg) => {
    const text = getActiveContent(msg);
    return msg.diceRoll != null ? `Roll: ${msg.diceRoll}\n${text}` : text;
};

/**
 * Safely shortens a string to `limit` characters without
 * cutting a word in half. Used before sending text to the AI
 * (keeps prompts from ballooning) and before saving checkpoints.
 */
export const truncateSafely = (str, limit) => {
    if (!str) return "";
    if (str.length <= limit) return str.trim();
    const cut = str.slice(0, limit);
    return cut.slice(0, cut.lastIndexOf(" ")) + "...";
};

/**
 * Converts a list of Message docs into the {role, content}
 * shape the AI API expects. Always a plain string per message,
 * truncated so we don't blow past the model's context window.
 */
export const toPayloadMessages = (msgs) =>
    msgs.map((m) => ({
        role: m.role,
        content: truncateSafely(formatForPayload(m), 1500),
    }));