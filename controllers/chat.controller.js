import OpenAI from "openai";
import PQueue from "p-queue";
import Character from "../modals/Character.modal.js";
import Chat from "../modals/Chat.modal.js";
import Message from "../modals/message.modal.js";
import User from "../modals/User.modal.js";
import {
  MOODS,
  fillPlaceholders,
  generateSystemPrompt,
  buildCheckpointPrompt,
  MERGE_PROMPT,
} from "../utils/prompt.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";
import {
  getVersions,
  getActiveContent,
  pushNewVersion,
  truncateSafely,
  toPayloadMessages,
} from "../utils/message.helpers.js";

/* ============================================================
   CONFIG — everything you'll ever tune lives here.
   (Usage limits live in utils/usage.js.)
============================================================ */
const MODEL = "gemma-4-uncensored";
const WINDOW_SIZE = 40; // past messages sent as context (~20 user turns)
const CHECKPOINT_EVERY = 15; // new memory summary every N user turns (keep <= WINDOW_SIZE / 2)
const MAX_CHECKPOINTS = 6; // above this, the 3 oldest are merged into one
const LOCK_MS = 150_000; // per-user lock lifetime (must be > AI_TIMEOUT_MS)
const AI_TIMEOUT_MS = 90_000; // max time for one whole generation (incl. streaming)
const PRONOUNS = ["He/Him", "She/Her", "They/Them"]; // must match Chat schema enum

const GEN_PARAMS = {
  temperature: 0.88,
  top_p: 0.95,
  top_k: 64,
  max_tokens: 2560,
  repetition_penalty: 1.05,
};

const client = new OpenAI({
  apiKey: process.env.ARLIAI_API_KEY,
  baseURL: "https://api.venice.ai/api/v1",
});

/* ============================================================
   QUEUE + LOCKS (stored on `global` so dev hot-reloads don't duplicate)
============================================================ */
const aiQueue = global.aiQueue || new PQueue({ concurrency: 2 });
if (!global.aiQueue) global.aiQueue = aiQueue;

const userLocks = global.userLocks || new Map();
if (!global.userLocks) global.userLocks = userLocks;

setInterval(() => {
  const now = Date.now();
  for (const [id, ts] of userLocks)
    if (now - ts > LOCK_MS) userLocks.delete(id);
}, 180_000).unref();

const tryLock = (userId) => {
  const ts = userLocks.get(userId);
  if (ts && Date.now() - ts < LOCK_MS) return false;
  userLocks.set(userId, Date.now());
  return true;
};
const unlock = (userId) => userLocks.delete(userId);

/* ============================================================
   SMALL HELPERS
============================================================ */

// Throw an error WE want the client to see: fail(404, "Not found").
// `expose` separates our errors from provider/SDK errors (which also have .status).
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status, expose: true });
};

const sendError = (res, err) => {
  if (res.headersSent) return;
  if (err.name === "CastError")
    return res.status(400).json({ error: "Invalid ID." });
  if (err.expose) return res.status(err.status).json({ error: err.message });
  console.error(err);
  return res
    .status(500)
    .json({ error: "Something went wrong. Please try again." });
};

// Wrapper for normal (non-AI) routes: catches errors so each handler stays clean.
const route = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    sendError(res, err);
  }
};

// Wrapper for AI routes: one lock per user, always released, errors handled
// differently before/after the stream has started.
const withLock = async (req, res, fn) => {
  const userId = String(req.user._id);
  if (!tryLock(userId))
    return res
      .status(429)
      .json({ error: "Wait for the previous response to complete." });

  const state = { streaming: false, finished: false };
  try {
    await fn(state);
  } catch (err) {
    console.error(`${req.method} ${req.originalUrl} failed:`, err.message);
    if (state.streaming) {
      if (!state.finished) emergencyClose(res);
    } else if (!res.headersSent) {
      if (err.expose || err.name === "CastError") sendError(res, err);
      else
        res
          .status(500)
          .json({ error: "AI pipeline failure. Please try again." });
    }
  } finally {
    unlock(userId);
  }
};

// Run something after the response is sent; never crash the server.
const background = (label, fn) =>
  fn().catch((err) => console.error(`${label} failed:`, err.message));

const asText = (v) => (typeof v === "string" ? v.trim() : "");

const accountName = (user) => user?.name || user?.username || "User";

// How a user message (with optional dice roll) is sent to the model.
const userPayload = (content, diceRoll) => ({
  role: "user",
  content: diceRoll ? `Roll: ${diceRoll}\n${content}` : content,
});

// Chat schema requires displayName, pronouns and firstMessage — always build a valid one.
const buildPreloader = (input, char, user) => {
  const displayName =
    asText(input?.displayName).slice(0, 50) || accountName(user);
  const pronouns = PRONOUNS.includes(input?.pronouns)
    ? input.pronouns
    : "They/Them";
  const firstMessage =
    asText(input?.firstMessage) ||
    asText(char?.firstDialogues?.[0]) ||
    "*Silence.*";
  return {
    displayName,
    pronouns,
    firstMessage: fillPlaceholders(firstMessage, {
      userName: displayName,
      charName: char.name,
    }),
  };
};

const sortedCheckpoints = (chat) =>
  [...(chat?.checkpoints || [])].sort(
    (a, b) => a.atUserMessageCount - b.atUserMessageCount,
  );

// Chat as it WILL look after deleting later messages: only checkpoints that
// describe events that still exist. Used when generating BEFORE deleting.
const chatAsOf = (chat, userMessageCount) => ({
  ...chat,
  checkpoints: (chat.checkpoints || []).filter(
    (c) => c.atUserMessageCount < userMessageCount,
  ),
});

// Last WINDOW_SIZE messages, oldest first.
// excludeId: skip one message. before: only messages older than this date.
const recentMessages = async (
  chatId,
  { excludeId = null, before = null } = {},
) => {
  const filter = { chatId };
  if (excludeId) filter._id = { $ne: excludeId };
  if (before) filter.createdAt = { $lt: before };
  const docs = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(WINDOW_SIZE)
    .lean();
  return docs.reverse();
};

// Find a message AND make sure it belongs to the logged-in user.
const getOwnedMessage = async (messageId, userId) => {
  const msg = await Message.findById(messageId);
  if (!msg) fail(404, "Message not found.");
  const chat = await Chat.findOne({ _id: msg.chatId, userId }).lean();
  if (!chat) fail(404, "Message not found."); // same error on purpose: don't reveal it exists
  return { msg, chat };
};

// After deleting/editing messages: recount everything from the DB and drop
// checkpoints that describe events that no longer exist.
const resyncChat = async (chatId) => {
  const [messageCount, userMessageCount, last] = await Promise.all([
    Message.countDocuments({ chatId }),
    Message.countDocuments({ chatId, role: "user" }),
    Message.findOne({ chatId }).sort({ createdAt: -1 }).lean(),
  ]);

  const set = { messageCount, userMessageCount };
  if (last) {
    set.lastMessage = { text: getActiveContent(last), role: last.role };
    set.lastMessageAt = last.createdAt;
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: set,
      $pull: {
        checkpoints: { atUserMessageCount: { $gte: userMessageCount } },
      },
    },
    { returnDocument: "after" },
  ).lean();
  if (!chat) fail(404, "Chat not found.");
  return chat;
};

// Save a new assistant message + update the chat summary fields.
const saveAssistantReply = async (chatId, text, mood, extra = {}) => {
  await Message.create({
    chatId,
    role: "assistant",
    content: [text],
    ...extra,
  });
  await Chat.updateOne(
    { _id: chatId },
    {
      $set: {
        lastMessage: { text, role: "assistant" },
        lastMessageAt: new Date(),
        "worldState.currentMood": mood,
      },
      $inc: { messageCount: 1 },
    },
  );
};

/* ============================================================
   CHECKPOINTS (long-term memory)
============================================================ */
const checkpointing = new Set(); // chat ids currently being summarized

const summarize = async (system, userText) => {
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 700,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userText },
    ],
  });
  return truncateSafely(
    completion.choices[0]?.message?.content?.trim() || "",
    3000,
  );
};

// If there are too many checkpoints, merge the 3 oldest into one.
const compactCheckpoints = async (chatId) => {
  const chat = await Chat.findById(chatId).lean();
  const cps = sortedCheckpoints(chat);
  if (cps.length <= MAX_CHECKPOINTS) return;

  const oldest = cps.slice(0, 3);
  const merged = await summarize(
    MERGE_PROMPT,
    oldest.map((c) => c.text).join("\n\n---\n\n"),
  );
  if (!merged) return;

  // Mongo can't $pull and $push the same field in one update, so two steps.
  await Chat.updateOne(
    { _id: chatId },
    { $pull: { checkpoints: { _id: { $in: oldest.map((c) => c._id) } } } },
  );
  await Chat.updateOne(
    { _id: chatId },
    {
      $push: {
        checkpoints: {
          text: merged,
          atUserMessageCount: oldest[2].atUserMessageCount,
        },
      },
    },
  );
};

const maybeCreateCheckpoint = async (chatId, char) => {
  const key = String(chatId);
  if (checkpointing.has(key)) return; // already running for this chat
  checkpointing.add(key);

  try {
    const chat = await Chat.findById(chatId).lean();
    if (!chat) return;

    const cps = sortedCheckpoints(chat);
    const lastAt = cps.length ? cps[cps.length - 1].atUserMessageCount : 0;
    const newTurns = chat.userMessageCount - lastAt;
    if (newTurns < CHECKPOINT_EVERY) return;

    const recent = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .limit(Math.min(newTurns * 2 + 2, 200))
      .lean();

    const userName = chat.preloader?.displayName || "User";
    const transcript = toPayloadMessages(recent.reverse())
      .map((m) => `${m.role === "user" ? userName : char.name}: ${m.content}`)
      .join("\n\n");

    const text = await summarize(
      buildCheckpointPrompt(char, cps, userName),
      `Messages to summarize:\n\n${transcript}`,
    );
    if (!text) return;

    // Only save if the chat didn't change (edit/delete) while we were summarizing.
    await Chat.updateOne(
      { _id: chatId, userMessageCount: chat.userMessageCount },
      {
        $push: {
          checkpoints: { text, atUserMessageCount: chat.userMessageCount },
        },
      },
    );
    await compactCheckpoints(chatId);
  } finally {
    checkpointing.delete(key);
  }
};

/* ============================================================
   STREAMING
   The model's reply looks like:
       [mood: Pink]
       *story text...*
   The streamer swallows the first line (mood) and streams the rest.
   If the model forgets the tag, `defaultMood` (the previous mood) is used.
============================================================ */
const createStreamer = (onText, defaultMood = "Blue") => {
  let head = ""; // buffer while we look for the [mood: X] line
  let headDone = false;
  let started = false;
  let mood = defaultMood;
  let content = "";

  const emit = (t) => {
    if (!started) {
      t = t.trimStart(); // no leading blank lines
      if (!t) return;
      started = true;
    }
    if (!t) return;
    content += t;
    onText(t);
  };

  return {
    push(chunk) {
      if (headDone) return emit(chunk);

      head += chunk;
      const m = head.match(/^\s*\[mood:\s*(\w+)\s*\]\s*/i);
      if (m) {
        mood =
          MOODS.find((x) => x.toLowerCase() === m[1].toLowerCase()) || mood;
        headDone = true;
        return emit(head.slice(m[0].length));
      }

      // Keep waiting only while the buffer could still turn into "[mood: ...]"
      const t = head.trimStart().toLowerCase();
      const couldBeTag = t.length < 30 && "[mood:".startsWith(t.slice(0, 6));
      if (!couldBeTag) {
        headDone = true; // model skipped the tag — just show everything
        emit(head);
      }
    },
    finish() {
      if (!headDone) {
        headDone = true;
        emit(head);
      }
      return { content: content.trim(), mood };
    },
  };
};

// If the reply hit the token limit mid-sentence, cut back to the last full sentence.
const trimToSentence = (text) => {
  const end = Math.max(
    text.lastIndexOf("."),
    text.lastIndexOf("!"),
    text.lastIndexOf("?"),
    text.lastIndexOf("…"),
    text.lastIndexOf('"'),
    text.lastIndexOf("*"),
  );
  let out = end > text.length * 0.5 ? text.slice(0, end + 1) : text;
  if ((out.match(/\*/g) || []).length % 2 === 1) out += "*"; // close an open action
  return out;
};

// Two messages in a row with the same role -> merge into one.
const mergeSameRole = (msgs) =>
  msgs.reduce((acc, m) => {
    const last = acc[acc.length - 1];
    if (
      last &&
      last.role === m.role &&
      typeof last.content === "string" &&
      typeof m.content === "string"
    ) {
      last.content += "\n\n" + m.content;
    } else {
      acc.push({ ...m });
    }
    return acc;
  }, []);

const sse = (res, data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

const startSSE = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
};

// Call ONLY after the DB save is done (otherwise the frontend can reload old data).
const finishStream = (res, state, mood) => {
  sse(res, { mood });
  res.write("data: [DONE]\n\n");
  res.end();
  state.finished = true;
};

// Stream already started and then something failed: tell the frontend it FAILED
// (as an `error` event, not as fake AI text). Nothing was saved to the DB.
const emergencyClose = (res) => {
  try {
    sse(res, { error: "Generation failed. Please try again." });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (_) {}
};

// The whole generation (connect + stream) runs INSIDE the queue slot,
// so "concurrency: 2" really means 2 live generations.
// `onStart` is called right before the first text is sent (opens the SSE lazily).
const generate = (
  res,
  system,
  messages,
  priority,
  maxTokens,
  defaultMood,
  onStart,
) =>
  aiQueue.add(
    async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
      try {
        const stream = await client.chat.completions.create(
          {
            model: MODEL,
            messages: [system, ...messages],
            ...GEN_PARAMS,
            max_tokens: maxTokens,
            stream: true,
          },
          { signal: ctrl.signal },
        );

        const streamer = createStreamer((text) => {
          onStart();
          sse(res, { text });
        }, defaultMood);
        let finishReason = null;

        for await (const chunk of stream) {
          const choice = chunk.choices?.[0];
          if (choice?.finish_reason) finishReason = choice.finish_reason;
          if (choice?.delta?.content) streamer.push(choice.delta.content);
        }

        const out = streamer.finish();
        if (finishReason === "length")
          out.content = trimToSentence(out.content);
        return out;
      } finally {
        clearTimeout(timer);
      }
    },
    { priority },
  );

/**
 * The ONE place where a prompt is built and a reply is generated.
 * Every route uses it, so the user's name, checkpoints, etc. are always the same.
 * SSE opens only when the first token arrives, so failures BEFORE that
 * (provider down, empty reply) return a normal JSON error with a real status code.
 */
const generateReply = async ({
  req,
  res,
  state,
  char,
  chat,
  history,
  extra = [],
  diceRoll = null,
  maxTokens = GEN_PARAMS.max_tokens,
}) => {
  const system = generateSystemPrompt({
    char,
    userName: chat.preloader?.displayName || accountName(req.user),
    pronouns: chat.preloader?.pronouns,
    diceRoll,
    checkpoints: sortedCheckpoints(chat),
  });
  const messages = mergeSameRole([...toPayloadMessages(history), ...extra]);
  const priority = hasActivePaidPlan(req.user.subscription, req.user.usage)
    ? 10
    : 1;

  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    startSSE(res);
    state.streaming = true;
  };

  const out = await generate(
    res,
    system,
    messages,
    priority,
    maxTokens,
    chat.worldState?.currentMood || "Blue",
    open,
  );

  // Don't save a fake reply — treat it as a failure.
  if (!out.content)
    fail(502, "The AI returned an empty response. Please try again.");

  open(); // safety: make sure SSE is open before finishStream
  return out;
};

/* ============================================================
   USAGE TRACKING (counted ONLY after a successful generation;
   the limit middleware only checks, it never counts)
   - Monthly plan: unlimited, sirf analytics.
   - Pack plan: packMessagesLeft -1 har message par; 0 hote hi plan free.
   - Free plan: daily counter + lifetime counter.
============================================================ */
const DAY_MS = 24 * 60 * 60 * 1000;

const updateUserUsage = async (userId) => {
  const user = await User.findById(userId).select("usage subscription");
  if (!user) return;

  const sub = user.subscription;
  const isPaid = hasActivePaidPlan(sub, user.usage);
  const now = new Date();

  const inc = { "usage.lifetimeMessages": 1 };
  const set = { "usage.lastMessageAt": now };

  // ---------- MONTHLY: unlimited, sirf analytics ----------
  if (isPaid && sub.plan === "monthly") {
    await User.updateOne({ _id: userId }, { $inc: inc, $set: set });
    return;
  }

  // ---------- PACK: atomic decrement ----------
  if (isPaid && sub.plan === "pack") {
    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        "subscription.plan": "pack",
        "usage.packMessagesLeft": { $gt: 0 },
      },
      {
        $inc: { ...inc, "usage.packMessagesLeft": -1 },
        $set: set,
      },
      { returnDocument: "after" },
    ).select("usage");

    // Last message use ho gaya -> base (free) plan par wapas
    if (updated && updated.usage.packMessagesLeft <= 0) {
      await User.updateOne(
        { _id: userId, "subscription.plan": "pack" },
        {
          $set: {
            "subscription.plan": "free",
            "subscription.status": "expired",
          },
        },
      );
    }
    return;
  }

  // ---------- FREE (ya expired paid): 24h window ----------
  const resetAt = user.usage?.messagesResetAt
    ? new Date(user.usage.messagesResetAt)
    : null;
  inc["usage.totalMessages"] = 1;

  if (resetAt && now >= resetAt) {
    // Purana window khatam -> naya window, count 1 se
    set["usage.messagesToday"] = 1;
    set["usage.messagesResetAt"] = new Date(now.getTime() + DAY_MS);
  } else {
    inc["usage.messagesToday"] = 1;
    if (!resetAt)
      set["usage.messagesResetAt"] = new Date(now.getTime() + DAY_MS);
  }

  await User.updateOne({ _id: userId }, { $inc: inc, $set: set });
};

// Awaited BEFORE finishStream so the frontend's next usage fetch is accurate.
// A usage failure must never break an otherwise successful reply.
const trackUsage = (userId) =>
  updateUserUsage(userId).catch((err) =>
    console.error("updateUserUsage failed:", err.message),
  );

/* ============================================================
   1. SEND MESSAGE
   User + AI message are saved TOGETHER, only after the AI succeeded.
   If generation fails, nothing is saved and the client gets an error.
============================================================ */
export const sendMessage = (req, res) =>
  withLock(req, res, async (state) => {
    const { characterId } = req.params;
    const content = asText(req.body.content);
    const diceRoll =
      Number.isInteger(req.body.diceRoll) &&
      req.body.diceRoll >= 1 &&
      req.body.diceRoll <= 6
        ? req.body.diceRoll
        : null;

    if (!content) fail(400, "Message cannot be empty.");
    if (content.length > 6000) fail(400, "Message too long.");

    const char = await Character.findById(characterId).lean();
    if (!char) fail(404, "Character not found.");

    let chat = await Chat.findOne({ userId: req.user._id, characterId }).lean();

    // Brand-new chat (user skipped the Preloader): create it AND save the opening line.
    if (!chat) {
      const preloader = buildPreloader(req.body.preloader, char, req.user);
      const created = await Chat.create({
        userId: req.user._id,
        characterId,
        preloader,
      });
      chat = created.toObject();
      await Message.create({
        chatId: chat._id,
        role: "assistant",
        content: [preloader.firstMessage],
      });
    }

    const history = await recentMessages(chat._id);
    const { content: reply, mood } = await generateReply({
      req,
      res,
      state,
      char,
      chat,
      history,
      diceRoll,
      extra: [userPayload(content, diceRoll)],
    });

    // ---------- CRITICAL SAVE (before "[DONE]") ----------
    const now = Date.now();
    await Message.insertMany([
      {
        chatId: chat._id,
        role: "user",
        content: [content],
        diceRoll,
        createdAt: new Date(now - 1),
      },
      {
        chatId: chat._id,
        role: "assistant",
        content: [reply],
        createdAt: new Date(now),
      },
    ]);
    await Chat.updateOne(
      { _id: chat._id },
      {
        $set: {
          lastMessage: { text: reply, role: "assistant" },
          lastMessageAt: new Date(now),
          "worldState.currentMood": mood,
        },
        $inc: { messageCount: 2, userMessageCount: 1 },
      },
    );
    await trackUsage(req.user._id);

    finishStream(res, state, mood);

    background("post-send", async () => {
      await Character.updateOne(
        { _id: characterId },
        { $inc: { interactionsCount: 1 } },
      );
      await maybeCreateCheckpoint(chat._id, char);
    });
  });

/* ============================================================
   2. REPLAY (regenerate the last AI message as a new version)
============================================================ */
export const replayMessage = (req, res) =>
  withLock(req, res, async (state) => {
    const { characterId } = req.params;
    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ userId: req.user._id, characterId }).lean(),
    ]);
    if (!char || !chat) fail(404, "Chat not found.");

    const last = await Message.findOne({ chatId: chat._id }).sort({
      createdAt: -1,
    });
    if (!last || last.role !== "assistant") fail(400, "Nothing to replay.");

    const history = await recentMessages(chat._id, { excludeId: last._id });
    if (!history.length) fail(400, "Nothing to replay.");
    const diceRoll =
      [...history].reverse().find((m) => m.role === "user")?.diceRoll ?? null;

    const { content: reply, mood } = await generateReply({
      req,
      res,
      state,
      char,
      chat,
      history,
      diceRoll,
    });

    pushNewVersion(last, reply);
    await last.save();
    await Chat.updateOne(
      { _id: chat._id },
      { $set: { "worldState.currentMood": mood } },
    );
    await trackUsage(req.user._id);

    finishStream(res, state, mood);
  });

/* ============================================================
   3. SELECT ALTERNATE
============================================================ */
export const selectAlternate = route(async (req, res) => {
  const index = Number(req.body.alternateIndex);
  const { msg } = await getOwnedMessage(req.params.messageId, req.user._id);

  if (!Number.isInteger(index) || index < 0 || index >= getVersions(msg).length)
    fail(404, "Alternate not found.");

  msg.selectedAlternateIndex = index;
  await msg.save();
  res.status(200).json({ success: true, message: msg });
});

/* ============================================================
   4. CONTINUE
============================================================ */
export const continueMessage = (req, res) =>
  withLock(req, res, async (state) => {
    const { characterId } = req.params;
    const [char, chat] = await Promise.all([
      Character.findById(characterId).lean(),
      Chat.findOne({ userId: req.user._id, characterId }).lean(),
    ]);
    if (!char || !chat) fail(404, "Chat not found.");

    const history = await recentMessages(chat._id);
    if (!history.length || history[history.length - 1].role !== "assistant")
      fail(400, "Can only continue when the last message is from the AI.");

    const { content: reply, mood } = await generateReply({
      req,
      res,
      state,
      char,
      chat,
      history,
      maxTokens: 1500,
      extra: [
        {
          role: "user",
          content:
            "[Continue the previous narrative seamlessly. Do not repeat what was already said.]",
        },
      ],
    });

    await saveAssistantReply(chat._id, reply, mood, { isContinuation: true });
    await trackUsage(req.user._id);

    finishStream(res, state, mood);
  });

/* ============================================================
   5. EDIT MESSAGE
   - AI message: silent edit, no AI call.
   - User message: GENERATE FIRST, and only if it succeeds save the edit,
     delete everything after it and store the new reply.
     If the AI fails, the old conversation stays untouched.
============================================================ */
export const editMessage = async (req, res) => {
  try {
    const newContent = asText(req.body.content);
    if (!newContent) fail(400, "Content cannot be empty.");

    const { msg, chat } = await getOwnedMessage(
      req.params.messageId,
      req.user._id,
    );

    if (msg.role === "assistant") {
      pushNewVersion(msg, newContent);
      msg.isEdited = true;
      await msg.save();
      return res
        .status(200)
        .json({ success: true, regenerated: false, message: msg });
    }

    if (newContent.length > 6000) fail(400, "Message too long.");

    await withLock(req, res, async (state) => {
      const char = await Character.findById(chat.characterId).lean();
      if (!char) fail(404, "Character not found.");

      // The chat as it will be after the edit: user messages up to and
      // including this one, and only the checkpoints that still apply.
      const keepCount = await Message.countDocuments({
        chatId: msg.chatId,
        role: "user",
        createdAt: { $lte: msg.createdAt },
      });
      const history = await recentMessages(msg.chatId, {
        before: msg.createdAt,
      });

      const { content: reply, mood } = await generateReply({
        req,
        res,
        state,
        char,
        chat: chatAsOf(chat, keepCount),
        history,
        diceRoll: msg.diceRoll ?? null,
        extra: [userPayload(newContent, msg.diceRoll ?? null)],
      });

      // ---------- AI succeeded: NOW change the DB ----------
      pushNewVersion(msg, newContent);
      msg.isEdited = true;
      await msg.save();

      await Message.deleteMany({
        chatId: msg.chatId,
        createdAt: { $gt: msg.createdAt },
      });
      const fresh = await resyncChat(msg.chatId);

      await saveAssistantReply(fresh._id, reply, mood);
      await trackUsage(req.user._id);

      finishStream(res, state, mood);
      background("post-edit", async () => {
        await Character.updateOne(
          { _id: fresh.characterId },
          { $inc: { interactionsCount: 1 } },
        );
        await maybeCreateCheckpoint(fresh._id, char);
      });
    });
  } catch (err) {
    sendError(res, err);
  }
};

/* ============================================================
   6. DELETE MESSAGE (deletes it and everything after it).
   If an AI reply to a user message is deleted, a new reply is generated
   FIRST; the old messages are removed only after that succeeded.
============================================================ */
export const deleteMessage = (req, res) =>
  withLock(req, res, async (state) => {
    const { msg, chat } = await getOwnedMessage(
      req.params.messageId,
      req.user._id,
    );

    const history = await recentMessages(msg.chatId, { before: msg.createdAt });
    const previous = history[history.length - 1];
    const shouldRegen = msg.role === "assistant" && previous?.role === "user";

    // Plain delete: no AI call, nothing that can fail halfway.
    if (!shouldRegen) {
      await Message.deleteMany({
        chatId: msg.chatId,
        createdAt: { $gte: msg.createdAt },
      });
      await resyncChat(msg.chatId);
      return res.status(200).json({ success: true, regenerated: false });
    }

    const char = await Character.findById(chat.characterId).lean();
    if (!char) fail(404, "Character not found.");

    const keepCount = await Message.countDocuments({
      chatId: msg.chatId,
      role: "user",
      createdAt: { $lt: msg.createdAt },
    });

    const { content: reply, mood } = await generateReply({
      req,
      res,
      state,
      char,
      chat: chatAsOf(chat, keepCount),
      history,
      diceRoll: previous.diceRoll ?? null,
    });

    // ---------- AI succeeded: NOW delete + save ----------
    await Message.deleteMany({
      chatId: msg.chatId,
      createdAt: { $gte: msg.createdAt },
    });
    const fresh = await resyncChat(msg.chatId);

    await saveAssistantReply(fresh._id, reply, mood);
    await trackUsage(req.user._id);

    finishStream(res, state, mood);
  });

/* ============================================================
   7. CHECKPOINT MANAGEMENT (only the chat's owner can touch them)
============================================================ */
export const editCheckpoint = route(async (req, res) => {
  const { chatId, checkpointId } = req.params;
  const text = truncateSafely(asText(req.body.text), 3000);
  if (!text) fail(400, "Checkpoint text cannot be empty.");

  const result = await Chat.updateOne(
    { _id: chatId, userId: req.user._id, "checkpoints._id": checkpointId },
    { $set: { "checkpoints.$.text": text, "checkpoints.$.edited": true } },
  );
  if (!result.matchedCount) fail(404, "Checkpoint not found.");
  res.status(200).json({ success: true });
});

export const deleteCheckpoint = route(async (req, res) => {
  const { chatId, checkpointId } = req.params;
  const result = await Chat.updateOne(
    { _id: chatId, userId: req.user._id },
    { $pull: { checkpoints: { _id: checkpointId } } },
  );
  if (!result.matchedCount) fail(404, "Chat not found.");
  res.status(200).json({ success: true });
});

/* ============================================================
   8. READ-ONLY / HOUSEKEEPING
============================================================ */
export const getChatHistory = route(async (req, res) => {
  const { characterId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 50);

  const [chat, char] = await Promise.all([
    Chat.findOne({ userId: req.user._id, characterId }).lean(),
    Character.findById(characterId).select("name images firstDialogues").lean(),
  ]);

  // `characterName` kept too, in case the frontend still reads the old key.
  const characterData = {
    name: char?.name,
    characterName: char?.name,
    images: char?.images,
    startingMessage: char?.firstDialogues?.[0],
  };

  // History must never be served from a cache.
  res.setHeader("Cache-Control", "no-store");

  if (!chat) {
    return res
      .status(200)
      .json({ success: true, messages: [], hasMore: false, characterData });
  }

  const messages = await Message.find({ chatId: chat._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    chatId: chat._id,
    messages: messages.reverse(),
    hasMore: messages.length === limit,
    currentPage: page,
    checkpoints: sortedCheckpoints(chat),
    worldState: chat.worldState,
    characterData,
  });
});

export const getRecentChats = route(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id })
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .select("characterId lastMessage lastMessageAt")
    .populate({ path: "characterId", select: "name images" })
    .lean();
  res.status(200).json({ success: true, chats });
});

export const clearChatHistory = route(async (req, res) => {
  const chat = await Chat.findOne({
    userId: req.user._id,
    characterId: req.params.characterId,
  }).lean();

  if (!chat) {
    return res
      .status(200)
      .json({ success: true, message: "Chat is already empty." });
  }

  await Promise.all([
    Message.deleteMany({ chatId: chat._id }),
    Chat.findByIdAndDelete(chat._id),
  ]);
  res.status(200).json({
    success: true,
    message: "Story reset. Start fresh whenever you're ready.",
  });
});

/* ============================================================
   9. SELECT INITIAL MESSAGE (Preloader screen -> creates the chat)
============================================================ */
export const selectInitialMessage = route(async (req, res) => {
  const { characterId } = req.params;
  const { displayName, pronoun, firstMessage } = req.body?.preloader || {};

  const name = asText(displayName).slice(0, 50);
  if (!name || firstMessage === undefined || firstMessage === null)
    fail(400, "Missing required fields.");
  if (!PRONOUNS.includes(pronoun))
    fail(400, `pronoun must be one of: ${PRONOUNS.join(", ")}`);

  const char = await Character.findById(characterId).lean();
  if (!char) fail(404, "Character not found.");

  if (await Chat.exists({ userId: req.user._id, characterId }))
    fail(
      409,
      "A chat with this character already exists. Clear it to start over.",
    );

  // firstMessage is either custom text, or an index into char.firstDialogues
  let initialMessage;
  if (typeof firstMessage === "string") {
    initialMessage = firstMessage.trim();
  } else if (Number.isInteger(firstMessage) && firstMessage >= 0) {
    initialMessage = asText(char.firstDialogues?.[firstMessage]);
  } else {
    fail(400, "firstMessage must be a string or a non-negative index.");
  }
  if (!initialMessage || initialMessage.length > 6000)
    fail(
      400,
      "Could not resolve the initial message (empty, too long, or index out of range).",
    );

  initialMessage = fillPlaceholders(initialMessage, {
    userName: name,
    charName: char.name,
  });

  const chat = await Chat.create({
    userId: req.user._id,
    characterId,
    preloader: {
      displayName: name,
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

  res.status(201).json({
    success: true,
    message: "Initial message selected and chat created successfully.",
    chat,
    initialMessage,
  });
});
