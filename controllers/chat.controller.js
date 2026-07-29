import OpenAI from "openai";
import PQueue from "p-queue";
import Character from "../modals/Character.modal.js";
import Chat from "../modals/Chat.modal.js";
import Message from "../modals/message.modal.js";
import User from "../modals/User.modal.js";
import { generateSystemPrompt, CHECKPOINT_PROMPT } from "../utils/prompt.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";
import {
  getVersions,
  getActiveContent,
  pushNewVersion,
  truncateSafely,
  toPayloadMessages,
} from "../utils/message.helpers.js";

/* ============================================================
   CONFIG — only numbers/settings you'll ever need to tune live
   here. Everything else in the file reads from these constants,
   so you never have to hunt through the code to change a value.
============================================================ */
const MODEL = "gemma-4-uncensored"; // which AI model to call
const WINDOW_SIZE = 40; // how many past messages we send as context
const CHECKPOINT_EVERY = 30; // make a new memory-summary every N user messages
const LOCK_MS = 60_000; // how long a user's "lock" lasts (stops double-sends)
const AI_TIMEOUT_MS = 45_000; // give up waiting on the AI after this long

const GEN_PARAMS = {
  temperature: 0.88,
  top_p: 0.95,
  top_k: 64,
  max_tokens: 2560,
  repetition_penalty: 1.05,
};

// Tells the AI: "reply with this exact JSON shape"
// { content: "story text", mood: "one of these colors" }
const MOOD_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "reply_with_mood",
    strict: true,
    schema: {
      type: "object",
      properties: {
        content: { type: "string" },
        mood: {
          type: "string",
          enum: [
            "Red",
            "Orange",
            "Yellow",
            "Violet",
            "Blue",
            "Pink",
            "HotPink",
          ],
        },
      },
      required: ["content", "mood"],
      additionalProperties: false,
    },
  },
};

// OpenAI-compatible client, but it's actually pointed at Venice AI
const client = new OpenAI({
  apiKey: process.env.ARLIAI_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
});

/* ============================================================
   GLOBAL QUEUE + LOCKS
   ------------------------------------------------------------
   - aiQueue: only 2 AI requests run at the same time, server-wide.
   - userLocks: stops ONE user from sending 2 messages at once
     (e.g. double-clicking send).
   Both are stored on `global` so hot-reloads / restarts in dev
   don't create duplicate queues.
============================================================ */
const aiQueue =
  global.aiQueue ||
  new PQueue({ concurrency: 2, timeout: 60_000, throwOnTimeout: true });
if (!global.aiQueue) global.aiQueue = aiQueue;

const userLocks = global.userLocks || new Map();
if (!global.userLocks) global.userLocks = userLocks;

// Every 3 minutes, clear out any locks that are older than LOCK_MS
// (protects against a memory leak if a lock never got released)
setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of userLocks) {
    if (now - ts > LOCK_MS) userLocks.delete(id);
  }
}, 180_000);

/**
 * Try to lock a user. Returns false if they already have an
 * active lock (i.e. "please wait, your last message is still processing").
 */
const tryLock = (userId) => {
  const ts = userLocks.get(userId);
  if (ts && Date.now() - ts < LOCK_MS) return false;
  userLocks.set(userId, Date.now());
  return true;
};
const unlock = (userId) => userLocks.delete(userId);

/* ============================================================
   OPENING LINE RESOLVER
   ------------------------------------------------------------
   Figures out what the character's very first message should be
   when a brand-new chat is auto-created (e.g. user messages a
   character directly without going through the Preloader screen
   first). Priority order:

     1. User's own custom opening line (saved on chat.preloader.firstMessage
        by selectInitialMessage, or passed inline in the sendMessage body)
     2. Character's first preset dialogue (char.firstDialogues[0])
     3. Hard fallback string, so we never save `undefined` to the DB

   NOTE: the schema field is `firstDialogues` (Character.modal.js).
   There is NO `startingMessage` field on the Character model — using
   that name here was the bug that caused new chats to open with
   "*Silence.*" instead of the character's real greeting or the
   user's custom one.
============================================================ */
const resolveOpeningLine = (char, activeChat) =>
  activeChat?.preloader?.firstMessage?.trim() ||
  char?.firstDialogues?.[0]?.trim() ||
  "*Silence.*";

/* ============================================================
   CHECKPOINTS
   ------------------------------------------------------------
   A "checkpoint" is a short AI-written summary of what's
   happened in the story so far. We inject these into every
   future AI call (as fake "assistant" messages) so the AI
   remembers events that are too old to fit in the normal
   context window.
============================================================ */

// Turns saved checkpoints into fake assistant messages, oldest first,
// so the AI reads them in the order the story actually happened.
const checkpointMessages = (chat) =>
  (chat?.checkpoints || [])
    .slice()
    .sort((a, b) => a.atUserMessageCount - b.atUserMessageCount)
    .map((c) => ({
      role: "assistant",
      content: `SYSTEM CHECKPOINT: ${c.text}`,
    }));

// Runs in the background after a reply is sent — does NOT block
// the user from seeing their response. Only fires every
// CHECKPOINT_EVERY user messages.
const maybeCreateCheckpoint = async (chat, char) => {
  if (
    chat.userMessageCount === 0 ||
    chat.userMessageCount % CHECKPOINT_EVERY !== 0
  )
    return;

  try {
    const recent = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(CHECKPOINT_EVERY * 2)
      .lean();

    const checkpointPrompt = {
      role: "system",
      content: `${CHECKPOINT_PROMPT}\n\nPERSONALITY: ${char.personality}\nSCENARIO: ${char.scenario}\n\n[SYSTEM CHECKPOINTS]\n${(
        chat.checkpoints || []
      )
        .map((c) => c.text)
        .join("\n---\n")}`,
    };

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [checkpointPrompt, ...toPayloadMessages(recent.reverse())],
      max_tokens: 500,
    });

    const text = truncateSafely(
      completion.choices[0]?.message?.content?.trim() || "",
      3000,
    );
    if (!text) return;

    await Chat.updateOne(
      { _id: chat._id },
      {
        $push: {
          checkpoints: { text, atUserMessageCount: chat.userMessageCount },
        },
      },
    );
  } catch (err) {
    console.error("Checkpoint generation failed:", err.message);
  }
};

/* ============================================================
   STREAMING HELPERS
   ------------------------------------------------------------
   The AI always replies with one JSON blob:
       {"content": "story text...", "mood": "Pink"}

   But we want to show the user the story text AS IT'S BEING
   TYPED, not wait for the whole JSON blob to finish. So this
   streamer reads the raw tokens character-by-character, finds
   the "content" field, and streams ONLY that part to the user —
   the JSON wrapper itself (mood, etc.) is never shown, and never
   leaks into the visible text.
============================================================ */

function createContentStreamer() {
  let raw = ""; // everything received from the AI so far (used to extract "mood" later)
  let started = false; // have we found the start of the "content" field yet?
  let done = false; // have we hit the closing quote of "content" yet?

  return {
    // Feed in one chunk of streamed text, get back only the
    // clean story text that's ready to show the user.
    push(chunk) {
      raw += chunk;
      if (done) return "";

      if (!started) {
        const match = raw.match(/"content"\s*:\s*"/);
        if (!match) return ""; // "content" field hasn't started yet
        started = true;
        const matchIndex = raw.indexOf(match[0]);
        raw = raw.slice(matchIndex + match[0].length);
      }

      let out = "";
      let i = 0;
      while (i < raw.length) {
        const ch = raw[i];

        if (ch === "\\") {
          // Escape sequences can be split across two different
          // stream chunks (e.g. chunk A ends in "\" and chunk B
          // starts with "r"). If the backslash is the very last
          // character we've received so far, we don't yet know
          // what it's escaping — stop processing this chunk and
          // leave the lone "\" in `raw` so the next push() call
          // can resolve it correctly. Without this, a dangling
          // "\" falls through to the default branch below and
          // gets flushed as a literal backslash, and the escaped
          // char that follows (e.g. "r") gets flushed right after
          // it as plain text — which is what was producing the
          // literal "\r" showing up in the UI.
          if (i + 1 >= raw.length) break;

          const next = raw[i + 1];
          // NOTE: \r is mapped to \n (not dropped) — otherwise a
          // JSON "\r" escape would leave a stray literal "r"
          // character in the visible text.
          out +=
            next === "n"
              ? "\n"
              : next === "t"
                ? "\t"
                : next === "r"
                  ? "\n"
                  : next;
          i += 2;
          continue;
        }

        if (ch === '"') {
          done = true; // reached the closing quote of "content"
          i++;
          break;
        }

        out += ch;
        i++;
      }

      raw = raw.slice(i);
      return out;
    },

    // Once streaming is done, pull the "mood" value out of the
    // full raw JSON we accumulated.
    mood(fullRaw) {
      const match = fullRaw.match(/"mood"\s*:\s*"(\w+)"/);
      return match ? match[1] : "Blue";
    },
  };
}

// Sets the headers needed to start a Server-Sent-Events (SSE) stream
const startSSE = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
};

// Actually calls the AI. Races the real response against a timeout —
// whichever finishes first wins. If the timeout wins, we throw.
const runGeneration = (
  systemPrompt,
  history,
  priority,
  maxTokens = GEN_PARAMS.max_tokens,
) =>
  Promise.race([
    aiQueue.add(
      () =>
        client.chat.completions.create({
          model: MODEL,
          messages: [systemPrompt, ...history],
          temperature: GEN_PARAMS.temperature,
          top_p: GEN_PARAMS.top_p,
          max_tokens: maxTokens,
          response_format: MOOD_SCHEMA,
          stream: true,
        }),
      { priority }, // paid users get priority (processed sooner in the queue)
    ),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI Timeout")), AI_TIMEOUT_MS),
    ),
  ]);

/**
 * Streams the AI's reply to the client as it arrives.
 * IMPORTANT: this does NOT close the connection or send "[DONE]".
 * That happens later in `finishStream`, AFTER we've saved to the DB —
 * this ordering matters, see the comment above `finishStream`.
 */
const streamToClient = async (res, stream) => {
  const streamer = createContentStreamer();
  let raw = ""; // full raw JSON (needed to extract mood at the end)
  let content = ""; // clean story text only (what the user actually sees)

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (!text) continue;
    raw += text;
    const out = streamer.push(text);
    if (out) {
      content += out;
      res.write(`data: ${JSON.stringify({ text: out })}\n\n`);
    }
  }

  const mood = streamer.mood(raw);
  return { content: content.trim(), mood };
};

/**
 * Sends the final "mood" event + "[DONE]" and closes the connection.
 *
 * ⚠️ ALWAYS call this AFTER the DB save is finished, never before.
 * If we told the client "done" before saving, the frontend's
 * reload() could fire and fetch OLD data — a race condition.
 */
const finishStream = (res, mood) => {
  res.write(`data: ${JSON.stringify({ mood })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
};

// If something breaks mid-stream, tell the user gracefully instead
// of just hanging or crashing.
const emergencyClose = (res) => {
  try {
    res.write(
      `data: ${JSON.stringify({ text: "\n*(The telepathic link severed unexpectedly...)*" })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (_) {}
};

/* ============================================================
   USAGE TRACKING
   ------------------------------------------------------------
   - Free plan: original daily/total counters (usage.totalMessages,
     usage.messagesToday, usage.messagesResetAt) — untouched logic.
   - Weekly plan: SEPARATE counter (usage.weeklyMessagesUsed), capped
     at WEEKLY_MESSAGE_LIMIT messages per billing cycle — NOT a 7-day
     time window. Never reads/writes the free-tier fields, so the two
     never mix even if a user switches plans.
   - Monthly plan: fully unlimited — nothing to track, we return early
     without touching the DB at all.

   Cycle-reset detection: usage.weeklyUsageCycleEnd stores a snapshot
   of subscription.currentPeriodEnd. When the live currentPeriodEnd no
   longer matches the stored snapshot, that means the subscription
   renewed (new week started) — the counter resets to 1 automatically,
   no cron job needed.
============================================================ */
const getTodayDateString = () => new Date().toISOString().split("T")[0];

const FREE_DAILY_LIMIT = 5; // keep in sync with frontend

// Weekly plan cap — keep in sync with WEEKLY_MESSAGE_LIMIT in
// checkMessageLimit.middleware.js.
const WEEKLY_MESSAGE_LIMIT = 1000;

const updateUserUsage = async (userId) => {
  const user = await User.findById(userId).select("usage subscription");
  if (!user) return;

  const sub = user.subscription;
  const isPaid = hasActivePaidPlan(sub);

  // Monthly = fully unlimited, no counter to maintain at all.
  if (isPaid && sub.plan === "monthly") return;

  // Weekly = separate counter, capped, tied to the current billing cycle.
  if (isPaid && sub.plan === "weekly") {
    const currentPeriodEnd = sub.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd).getTime()
      : null;
    const storedCycleEnd = user.usage?.weeklyUsageCycleEnd
      ? new Date(user.usage.weeklyUsageCycleEnd).getTime()
      : null;

    // The stored cycle marker doesn't match the live subscription period
    // -> the plan just renewed (new week started). Reset the counter
    // instead of letting it carry over from the previous cycle.
    if (currentPeriodEnd && currentPeriodEnd !== storedCycleEnd) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          "usage.weeklyMessagesUsed": 1,
          "usage.weeklyUsageCycleEnd": sub.currentPeriodEnd,
        },
      });
      return;
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { "usage.weeklyMessagesUsed": 1 },
    });
    return;
  }

  // Free plan (or an expired/cancelled paid plan) -> original free-tier logic.
  const now = new Date();
  const resetAt = user.usage?.messagesResetAt;
  const cycleExpired = resetAt && now >= new Date(resetAt);

  // Previous 24h cycle (started when the limit was hit) has expired —
  // wipe today's counter and clear the reset timestamp.
  if (cycleExpired) {
    await User.findByIdAndUpdate(userId, {
      $set: { "usage.messagesToday": 1, "usage.messagesResetAt": null },
      $inc: { "usage.totalMessages": 1 },
    });
    return;
  }

  const currentToday = user.usage?.messagesToday || 0;
  const newToday = currentToday + 1;

  const updateQuery = {
    $inc: { "usage.totalMessages": 1, "usage.messagesToday": 1 },
  };

  // This message just pushed them to the limit — start the 24h countdown
  // from THIS moment, but only if a cycle isn't already running.
  if (newToday === FREE_DAILY_LIMIT && !resetAt) {
    updateQuery.$set = {
      "usage.messagesResetAt": new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  await User.findByIdAndUpdate(userId, updateQuery);
};

/* ============================================================
   1. SEND MESSAGE
============================================================ */
export const sendMessage = async (req, res) => {
  const userId = String(req.user._id);
  const { characterId } = req.params;
  const content = (req.body.content || "").trim();

  const diceRoll =
    Number.isInteger(req.body.diceRoll) &&
    req.body.diceRoll >= 1 &&
    req.body.diceRoll <= 6
      ? req.body.diceRoll
      : null;

  if (!content)
    return res.status(400).json({ error: "Message cannot be empty." });
  if (content.length > 6000)
    return res.status(400).json({ error: "Message too long." });
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  let headersSent = false;
  let streamEnded = false;
  const onClose = () => unlock(userId);
  res.on("close", onClose);

  try {
    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ userId, characterId }),
    ]);
    if (!char) {
      unlock(userId);
      return res.status(404).json({ error: "Character not found" });
    }

    const isNewChat = !chat;
    const activeChat =
      chat ||
      (await Chat.create({
        userId,
        characterId,
        preloader: req.body.preloader || {},
      }));

    const openingLine = isNewChat ? resolveOpeningLine(char, activeChat) : null;

    const history = isNewChat
      ? [{ role: "assistant", content: [openingLine] }]
      : await Message.find({ chatId: activeChat._id })
          .sort({ createdAt: -1 })
          .limit(WINDOW_SIZE)
          .lean()
          .then((r) => r.reverse());

    const systemPrompt = generateSystemPrompt({
      char,
      user: activeChat.preloader?.displayName || req.user,
      pronouns: activeChat.preloader?.pronouns,
      diceRoll,
    });

    const priority = hasActivePaidPlan(req.user.subscription) ? 10 : 1;

    const payload = [
      ...checkpointMessages(activeChat),
      ...toPayloadMessages(history),
      {
        role: "user",
        content: diceRoll ? `Roll: ${diceRoll}\n${content}` : content,
      },
    ];

    startSSE(res);
    headersSent = true;

    const stream = await runGeneration(systemPrompt, payload, priority);
    const { content: reply, mood } = await streamToClient(res, stream);

    // ---------- CRITICAL DB SAVE (must happen before "[DONE]") ----------
    const finalReply = reply || "*The connection was lost...*";
    const now = Date.now();

    if (isNewChat) {
      await Message.create({
        chatId: activeChat._id,
        role: "assistant",
        content: [openingLine],
        createdAt: new Date(now - 2000),
      });
    }

    await Message.insertMany([
      {
        chatId: activeChat._id,
        role: "user",
        content: [content],
        diceRoll,
        createdAt: new Date(now - 1000),
      },
      {
        chatId: activeChat._id,
        role: "assistant",
        content: [finalReply],
        createdAt: new Date(now),
      },
    ]);

    const updated = await Chat.findByIdAndUpdate(
      activeChat._id,
      {
        $set: {
          lastMessage: { text: finalReply, role: "assistant" },
          lastMessageAt: new Date(now),
          "worldState.currentMood": mood,
        },
        $inc: { messageCount: 2, userMessageCount: 1 },
      },
      { returnDocument: "after" },
    );

    res.off("close", onClose);
    finishStream(res, mood);
    streamEnded = true;
    unlock(userId);

    (async () => {
      try {
        await Character.findByIdAndUpdate(characterId, {
          $inc: { interactionsCount: 1 },
        });
        await updateUserUsage(req.user._id);
        await maybeCreateCheckpoint(updated, char);
      } catch (err) {
        console.error(
          "Post-send non-critical persistence failed:",
          err.message,
        );
      }
    })();
  } catch (error) {
    console.error("sendMessage failed:", error.message);
    unlock(userId);
    if (!headersSent)
      return res
        .status(500)
        .json({ error: "AI pipeline failure. Please try again." });
    if (!streamEnded) emergencyClose(res);
  }
};

/* ============================================================
   2. REPLAY (a.k.a. "Regenerate")
============================================================ */
export const replayMessage = async (req, res) => {
  const userId = String(req.user._id);
  const { characterId } = req.params;
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  let headersSent = false;
  let streamEnded = false;

  try {
    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ userId, characterId }).lean(),
    ]);

    if (!char || !chat) {
      unlock(userId);
      return res.status(404).json({ error: "Chat not found." });
    }

    const last = await Message.findOne({ chatId: chat._id }).sort({
      createdAt: -1,
    });
    if (!last || last.role !== "assistant") {
      unlock(userId);
      return res.status(400).json({ error: "Nothing to replay." });
    }

    const priorHistory = await Message.find({
      chatId: chat._id,
      _id: { $ne: last._id },
    })
      .sort({ createdAt: -1 })
      .limit(WINDOW_SIZE)
      .lean()
      .then((r) => r.reverse());

    const precedingUserTurn = [...priorHistory]
      .reverse()
      .find((m) => m.role === "user");
    const diceRoll = precedingUserTurn?.diceRoll ?? null;

    const systemPrompt = generateSystemPrompt({
      char,
      user: req.user,
      pronouns: chat.preloader?.pronouns,
      diceRoll,
    });
    const payload = [
      ...checkpointMessages(chat),
      ...toPayloadMessages(priorHistory),
    ];
    const priority = hasActivePaidPlan(req.user.subscription) ? 10 : 1;

    startSSE(res);
    headersSent = true;

    const stream = await runGeneration(systemPrompt, payload, priority);
    const { content: reply, mood } = await streamToClient(res, stream);

    // ---------- CRITICAL DB SAVE ----------
    pushNewVersion(last, reply);
    await last.save();

    await Chat.updateOne(
      { _id: chat._id },
      { $set: { "worldState.currentMood": mood } },
    );

    finishStream(res, mood);
    streamEnded = true;
  } catch (error) {
    console.error("replayMessage failed:", error.message);
    if (!headersSent)
      return res
        .status(500)
        .json({ error: "AI pipeline failure. Please try again." });
    if (!streamEnded) emergencyClose(res);
  } finally {
    unlock(userId);
  }
};

/* ============================================================
   3. SELECT ALTERNATE
============================================================ */
export const selectAlternate = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { alternateIndex } = req.body;

    const msg = await Message.findById(messageId);
    const versions = getVersions(msg);

    if (!msg || alternateIndex < 0 || alternateIndex >= versions.length) {
      return res.status(404).json({ error: "Alternate not found." });
    }

    msg.selectedAlternateIndex = alternateIndex;
    await msg.save();

    return res.status(200).json({ success: true, message: msg });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to select alternate.", detail: error.message });
  }
};

/* ============================================================
   4. CONTINUE
============================================================ */
export const continueMessage = async (req, res) => {
  const userId = String(req.user._id);
  const { characterId } = req.params;
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  let headersSent = false;
  let streamEnded = false;
  const onClose = () => unlock(userId);
  res.on("close", onClose);

  try {
    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ userId, characterId }).lean(),
    ]);
    if (!char || !chat) {
      unlock(userId);
      return res.status(404).json({ error: "Chat not found." });
    }

    const history = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(WINDOW_SIZE)
      .lean()
      .then((r) => r.reverse());

    if (!history.length || history[history.length - 1].role !== "assistant") {
      unlock(userId);
      return res.status(400).json({
        error: "Can only continue when the last message is from the AI.",
      });
    }

    const systemPrompt = generateSystemPrompt({
      char,
      user: req.user,
      pronouns: chat.preloader?.pronouns,
      diceRoll: null,
    });
    const payload = [
      ...checkpointMessages(chat),
      ...toPayloadMessages(history),
      {
        role: "user",
        content:
          "[Continue the previous narrative seamlessly. Do not repeat what was already said.]",
      },
    ];
    const priority = hasActivePaidPlan(req.user.subscription) ? 10 : 1;

    startSSE(res);
    headersSent = true;

    const stream = await runGeneration(systemPrompt, payload, priority, 1500);
    const { content: reply, mood } = await streamToClient(res, stream);

    // ---------- CRITICAL DB SAVE ----------
    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: [reply],
      isContinuation: true,
    });

    await Chat.updateOne(
      { _id: chat._id },
      {
        $set: {
          lastMessage: { text: reply, role: "assistant" },
          lastMessageAt: new Date(),
          "worldState.currentMood": mood,
        },
        $inc: { messageCount: 1 },
      },
    );

    res.off("close", onClose);
    finishStream(res, mood);
    streamEnded = true;
    unlock(userId);

    (async () => {
      try {
        await updateUserUsage(req.user._id);
      } catch (err) {
        console.error("Continue non-critical persistence failed:", err.message);
      }
    })();
  } catch (error) {
    console.error("continueMessage failed:", error.message);
    unlock(userId);
    if (!headersSent)
      return res
        .status(500)
        .json({ error: "AI pipeline failure. Please try again." });
    if (!streamEnded) emergencyClose(res);
  }
};

/* ============================================================
   5. EDIT MESSAGE
============================================================ */
export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const newContent = (req.body.content || "").trim();
  if (!newContent)
    return res.status(400).json({ error: "Content cannot be empty." });

  let msg;
  try {
    msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found." });

    pushNewVersion(msg, newContent);
    msg.isEdited = true;
    await msg.save();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to edit message.", detail: error.message });
  }

  if (msg.role === "assistant") {
    return res
      .status(200)
      .json({ success: true, regenerated: false, message: msg });
  }

  /* ---------- User message was edited → everything after it is stale ---------- */
  const userId = String(req.user._id);
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  let headersSent = false;
  let streamEnded = false;
  const onClose = () => unlock(userId);
  res.on("close", onClose);

  try {
    await Message.deleteMany({
      chatId: msg.chatId,
      createdAt: { $gt: msg.createdAt },
    });

    const userTurns = await Message.countDocuments({
      chatId: msg.chatId,
      role: "user",
    });
    const chat = await Chat.findOneAndUpdate(
      { _id: msg.chatId },
      { $set: { userMessageCount: userTurns } },
      { returnDocument: "after" },
    ).lean();

    if (!chat) {
      unlock(userId);
      return res.status(404).json({ error: "Chat not found." });
    }

    const char = await Character.findById(chat.characterId).lean();
    if (!char) {
      unlock(userId);
      return res.status(404).json({ error: "Character not found." });
    }

    const history = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(WINDOW_SIZE)
      .lean()
      .then((r) => r.reverse());

    const diceRoll = msg.diceRoll ?? null;
    const systemPrompt = generateSystemPrompt({
      char,
      user: chat.preloader?.displayName || req.user,
      pronouns: chat.preloader?.pronouns,
      diceRoll,
    });
    const payload = [
      ...checkpointMessages(chat),
      ...toPayloadMessages(history),
    ];
    const priority = hasActivePaidPlan(req.user.subscription) ? 10 : 1;

    startSSE(res);
    headersSent = true;

    const stream = await runGeneration(systemPrompt, payload, priority);
    const { content: reply, mood } = await streamToClient(res, stream);

    // ---------- CRITICAL DB SAVE ----------
    const finalReply = reply || "*The connection was lost...*";
    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: [finalReply],
    });

    const updated = await Chat.findByIdAndUpdate(
      chat._id,
      {
        $set: {
          lastMessage: { text: finalReply, role: "assistant" },
          lastMessageAt: new Date(),
          "worldState.currentMood": mood,
        },
        $inc: { messageCount: 1 },
      },
      { returnDocument: "after" },
    );

    res.off("close", onClose);
    finishStream(res, mood);
    streamEnded = true;
    unlock(userId);

    (async () => {
      try {
        await Character.findByIdAndUpdate(chat.characterId, {
          $inc: { interactionsCount: 1 },
        });
        await updateUserUsage(req.user._id);
        await maybeCreateCheckpoint(updated, char);
      } catch (err) {
        console.error(
          "Post-edit non-critical persistence failed:",
          err.message,
        );
      }
    })();
  } catch (error) {
    console.error("editMessage regeneration failed:", error.message);
    unlock(userId);
    if (!headersSent)
      return res.status(500).json({
        error: "AI pipeline failure. Please try again.",
        detail: error.message,
      });
    if (!streamEnded) emergencyClose(res);
  }
};

/* ============================================================
   6. DELETE MESSAGE
============================================================ */
export const deleteMessage = async (req, res) => {
  const userId = String(req.user._id);
  const { characterId, messageId } = req.params;
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  let headersSent = false;
  let streamEnded = false;

  try {
    const msg = await Message.findById(messageId);
    if (!msg) {
      unlock(userId);
      return res.status(404).json({ error: "Message not found." });
    }

    const previous = await Message.findOne({
      chatId: msg.chatId,
      createdAt: { $lt: msg.createdAt },
    }).sort({ createdAt: -1 });
    await Message.deleteMany({
      chatId: msg.chatId,
      createdAt: { $gte: msg.createdAt },
    });

    const userTurns = await Message.countDocuments({
      chatId: msg.chatId,
      role: "user",
    });
    await Chat.updateOne(
      { _id: msg.chatId },
      { $set: { userMessageCount: userTurns } },
    );

    const shouldAutoRegen =
      msg.role === "assistant" && (!previous || previous.role === "user");
    if (!shouldAutoRegen) {
      unlock(userId);
      return res.status(200).json({ success: true, regenerated: false });
    }

    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ _id: msg.chatId }).lean(),
    ]);
    const history = await Message.find({ chatId: msg.chatId })
      .sort({ createdAt: -1 })
      .limit(WINDOW_SIZE)
      .lean()
      .then((r) => r.reverse());

    const precedingUserTurn = [...history]
      .reverse()
      .find((m) => m.role === "user");
    const diceRoll = precedingUserTurn?.diceRoll ?? null;

    const systemPrompt = generateSystemPrompt({
      char,
      user: req.user,
      pronouns: chat.preloader?.pronouns,
      diceRoll,
    });
    const payload = [
      ...checkpointMessages(chat),
      ...toPayloadMessages(history),
    ];
    const priority = hasActivePaidPlan(req.user.subscription) ? 10 : 1;

    startSSE(res);
    headersSent = true;

    const stream = await runGeneration(systemPrompt, payload, priority);
    const { content: reply, mood } = await streamToClient(res, stream);

    // ---------- CRITICAL DB SAVE ----------
    await Message.create({
      chatId: msg.chatId,
      role: "assistant",
      content: [reply],
    });

    await Chat.updateOne(
      { _id: msg.chatId },
      {
        $set: {
          lastMessage: { text: reply, role: "assistant" },
          lastMessageAt: new Date(),
          "worldState.currentMood": mood,
        },
        $inc: { messageCount: 1 },
      },
    );

    finishStream(res, mood);
    streamEnded = true;
  } catch (error) {
    console.error("deleteMessage failed:", error.message);
    if (!headersSent)
      return res
        .status(500)
        .json({ error: "Failed to delete message.", detail: error.message });
    if (!streamEnded) emergencyClose(res);
  } finally {
    unlock(userId);
  }
};

/* ============================================================
   7. CHECKPOINT MANAGEMENT (edit / delete from the side drawer)
============================================================ */
export const editCheckpoint = async (req, res) => {
  try {
    const { chatId, checkpointId } = req.params;
    const text = truncateSafely((req.body.text || "").trim(), 3000);
    if (!text)
      return res
        .status(400)
        .json({ error: "Checkpoint text cannot be empty." });

    await Chat.updateOne(
      { _id: chatId, "checkpoints._id": checkpointId },
      { $set: { "checkpoints.$.text": text } },
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to edit checkpoint.", detail: error.message });
  }
};

export const deleteCheckpoint = async (req, res) => {
  try {
    const { chatId, checkpointId } = req.params;
    await Chat.updateOne(
      { _id: chatId },
      { $pull: { checkpoints: { _id: checkpointId } } },
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete checkpoint.", detail: error.message });
  }
};

/* ============================================================
   8. READ-ONLY / HOUSEKEEPING ENDPOINTS
============================================================ */

export const getChatHistory = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user._id.toString();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const [chat, char] = await Promise.all([
      Chat.findOne({ userId, characterId }).lean(),
      Character.findById(characterId)
        .select("characterName images firstDialogues")
        .lean(),
    ]);

    if (!chat) {
      return res.status(200).json({
        success: true,
        messages: [],
        hasMore: false,
        characterData: {
          characterName: char?.characterName,
          images: char?.images,
          startingMessage: char?.firstDialogues?.[0],
        },
      });
    }

    const messages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      messages: messages.reverse(),
      hasMore: messages.length === limit,
      currentPage: page,
      checkpoints: (chat.checkpoints || []).sort(
        (a, b) => a.atUserMessageCount - b.atUserMessageCount,
      ),
      worldState: chat.worldState,
      characterData: {
        characterName: char?.characterName,
        images: char?.images,
        startingMessage: char?.firstDialogues?.[0],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history.",
      error: error.message,
    });
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .select("characterId lastMessage lastMessageAt")
      .populate({
        path: "characterId",
        select: "name images",
      })
      .lean();

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get recent chats.",
      error: error.message,
    });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const { characterId } = req.params;
    const chat = await Chat.findOne({
      userId: req.user._id,
      characterId,
    }).lean();
    if (!chat)
      return res
        .status(200)
        .json({ success: true, message: "Chat is already empty." });

    await Promise.all([
      Message.deleteMany({ chatId: chat._id }),
      Chat.findByIdAndDelete(chat._id),
    ]);
    return res.status(200).json({
      success: true,
      message: "Story reset. Start fresh whenever you're ready.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to clear chat.",
      error: error.message,
    });
  }
};

/* ============================================================
   9. SELECT INITIAL MESSAGE
============================================================ */
export const selectInitialMessage = async (req, res) => {
  try {
    const { characterId } = req.params;

    const userId = req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized request." });
    }

    const { displayName, pronoun, firstMessage } = req.body?.preloader || {};

    if (
      !displayName ||
      displayName.trim() === "" ||
      !pronoun ||
      firstMessage === undefined ||
      firstMessage === null
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (typeof firstMessage === "number" && firstMessage < 0) {
      return res
        .status(400)
        .json({ error: "Invalid first message index. Must be 0 or greater." });
    } else if (
      typeof firstMessage !== "string" &&
      typeof firstMessage !== "number"
    ) {
      return res
        .status(400)
        .json({ error: "firstMessage must be a string or a number (index)." });
    }

    const char = await Character.findById(characterId).lean();
    if (!char) {
      return res.status(404).json({ error: "Character not found." });
    }

    let initialMessage;
    if (typeof firstMessage === "string") {
      initialMessage = firstMessage.trim();
    } else {
      const FIRST_DIALOGUE_KEYS = [
        "firstDialogues",
        "firstMessages",
        "greetings",
        "dialogues",
      ];
      let dialoguesArray = [];
      for (const key of FIRST_DIALOGUE_KEYS) {
        if (Array.isArray(char[key]) && char[key].length > 0) {
          dialoguesArray = char[key];
          break;
        }
      }
      initialMessage = dialoguesArray[firstMessage]?.trim();
    }

    if (!initialMessage) {
      return res.status(400).json({
        error:
          "Could not resolve the initial message. The index provided may be out of bounds or empty.",
      });
    }

    const chat = await Chat.create({
      userId,
      characterId,
      preloader: {
        displayName: displayName.trim(),
        pronouns: pronoun,
        firstMessage: initialMessage,
      },
      checkpoints: [],
      worldState: {},
    });

    await Message.create({
      chatId: chat._id,
      role: "assistant",
      content: [initialMessage],
    });

    return res.status(201).json({
      success: true,
      message: "Initial message selected and chat created successfully.",
      chat,
      initialMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to select initial message.",
      error: error.message,
    });
  }
};