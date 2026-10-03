import api from "../lib/axios.js";
import { getAuth, signOut } from "firebase/auth";

const BASE_URL = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

// Tells the Profile usage card to re-fetch.
// Backend ab usage [DONE] se PEHLE count karta hai, isliye delay ki zaroorat nahi.
const notifyUsageChanged = (delay = 0) =>
  setTimeout(() => window.dispatchEvent(new Event("usage:refresh")), delay);

// ==========================================
// LIMIT REACHED ERROR
// ==========================================
// Backend codes: DAILY_LIMIT_REACHED, TOTAL_LIMIT_REACHED, PACK_EXHAUSTED
const LIMIT_CODES = [
  "DAILY_LIMIT_REACHED",
  "TOTAL_LIMIT_REACHED",
  "PACK_EXHAUSTED",
];

export class LimitReachedError extends Error {
  constructor(message, code) {
    super(
      message || "You've used your free messages. Upgrade to keep chatting.",
    );
    this.name = "LimitReachedError";
    this.code = "limit_reached";
    this.serverCode = code || null;
    this.limitType =
      code === "DAILY_LIMIT_REACHED" || /today|daily/i.test(message || "")
        ? "daily"
        : "total";
  }
}

// Generation fail hui (provider error, empty reply, network cut).
// Server ne DB me kuch save nahi kiya -> UI ko rollback karna chahiye.
export class GenerationError extends Error {
  constructor(message) {
    super(message || "Generation failed. Please try again.");
    this.name = "GenerationError";
  }
}

const authHeaders = async () => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User is not authenticated with Firebase.");
  const token = await user.getIdToken();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) headers["X-Session-Id"] = sessionId;

  return headers;
};

const throwForBadResponse = async (response) => {
  const body = await response.json().catch(() => ({}));

  // Limit hit: purana 402 ya naye backend codes (403 / 429 with code)
  if (response.status === 402 || LIMIT_CODES.includes(body.code)) {
    notifyUsageChanged(0);
    throw new LimitReachedError(body.error || body.message, body.code);
  }

  if (body.code === "SESSION_INVALID") {
    localStorage.removeItem("sessionId");
    try {
      await signOut(getAuth());
    } catch (_) {}
    window.location.href = "/login";
  }

  throw new Error(body.error || `API Error: ${response.status}`);
};

// ==========================================
// SHARED SSE READER
// Success = server ne {mood} event + [DONE] bheja (matlab DB save ho chuka).
// Kuch bhi aur -> error throw hota hai, caller ko rollback karna hai.
// ==========================================
const streamRequest = async (url, method, body, onChunk, onMood) => {
  const headers = await authHeaders();
  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) await throwForBadResponse(response);

  const contentType = response.headers.get("content-type") || "";

  // Plain JSON response (AI message ka silent edit, ya user message ka simple delete)
  if (!contentType.includes("text/event-stream")) {
    const data = await response.json().catch(() => null);
    if (data?.mood && onMood) onMood(data.mood);
    if (data?.text && onChunk) onChunk(data.text);
    return data;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let gotMood = false;
  let gotDone = false;
  let serverError = null;

  const handleEvent = (event) => {
    const trimmed = event.trim();
    if (!trimmed.startsWith("data:")) return;

    const raw = trimmed.replace(/^data:\s*/, "");
    if (raw === "[DONE]") {
      gotDone = true;
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse SSE chunk:", raw);
      return;
    }

    if (parsed.error) serverError = parsed.error;
    else if (parsed.text) onChunk?.(parsed.text);
    else if (parsed.mood) {
      gotMood = true;
      onMood?.(parsed.mood);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop();

    for (const event of events) handleEvent(event);
  }
  if (buffer.trim()) handleEvent(buffer); // last leftover event

  // 1) Server ne bataya ki generation fail hui
  if (serverError) throw new GenerationError(serverError);

  // 2) Stream beech me kat gayi (network drop etc.) -> save nahi hua
  if (!gotDone || !gotMood)
    throw new GenerationError("Connection lost. Please try again.");

  // 3) Success: usage server pe already count ho chuka hai
  notifyUsageChanged(0);
};

// ==========================================
// EXPORTED API METHODS
// ==========================================
export const sendMessage = (characterId, content, diceRoll, onChunk, onMood) =>
  streamRequest(
    `/chat/${characterId}`,
    "POST",
    { content, diceRoll },
    onChunk,
    onMood,
  );

export const replayMessage = (characterId, onChunk, onMood) =>
  streamRequest(`/chat/${characterId}/replay`, "POST", null, onChunk, onMood);

export const continueMessage = (characterId, onChunk, onMood) =>
  streamRequest(`/chat/${characterId}/continue`, "POST", null, onChunk, onMood);

export const deleteMessage = (characterId, messageId, onChunk, onMood) =>
  streamRequest(
    `/chat/${characterId}/message/${messageId}`,
    "DELETE",
    null,
    onChunk,
    onMood,
  );

export const editMessage = (messageId, content, onChunk, onMood) =>
  streamRequest(
    `/chat/message/${messageId}`,
    "PATCH",
    { content },
    onChunk,
    onMood,
  );

export const selectAlternate = async (messageId, alternateIndex) => {
  const headers = await authHeaders();
  const response = await fetch(
    `${BASE_URL}/chat/message/${messageId}/alternate`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ alternateIndex }),
    },
  );
  if (!response.ok) await throwForBadResponse(response);
  return response.json();
};

export const editCheckpoint = async (chatId, checkpointId, text) => {
  const headers = await authHeaders();
  const response = await fetch(
    `${BASE_URL}/chat/${chatId}/checkpoint/${checkpointId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ text }),
    },
  );
  if (!response.ok) await throwForBadResponse(response);
  return response.json();
};

export const deleteCheckpoint = async (chatId, checkpointId) => {
  const headers = await authHeaders();
  const response = await fetch(
    `${BASE_URL}/chat/${chatId}/checkpoint/${checkpointId}`,
    {
      method: "DELETE",
      headers,
    },
  );
  if (!response.ok) await throwForBadResponse(response);
  return response.json();
};

export const fetchChatHistory = async (characterId) => {
  try {
    const response = await api.get(`/chat/history/${characterId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching chat history:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const fetchRecentChats = async () => {
  const response = await api.get(`/chat/recent`);
  return response.data;
};

export const clearChat = async (characterId) => {
  const headers = await authHeaders();
  const response = await fetch(`${BASE_URL}/chat/${characterId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) await throwForBadResponse(response);
  return response.json();
};

export const selectInitialMessage = async (characterId, preloader) => {
  if (!characterId)
    throw new Error("Character ID is required to start a chat.");
  try {
    const response = await api.post(`/chat/initial/${characterId}`, {
      preloader,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred.";
    throw new Error(errorMessage);
  }
};
