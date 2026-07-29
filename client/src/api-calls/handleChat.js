import api from "../lib/axios.js";
import { getAuth, signOut } from "firebase/auth";

const BASE_URL = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

// ==========================================
// LIMIT REACHED ERROR
// ==========================================
export class LimitReachedError extends Error {
    constructor(message) {
        super(message || "You've used your free messages. Upgrade to keep chatting.");
        this.name = "LimitReachedError";
        this.code = "limit_reached";
        this.limitType = message === "today" ? "daily" : "total";
    }
}

const authHeaders = async () => {
    const user = getAuth().currentUser;
    if (!user) throw new Error("User is not authenticated with Firebase.");
    const token = await user.getIdToken();

    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) headers["X-Session-Id"] = sessionId;

    return headers;
};

const throwForBadResponse = async (response) => {
    if (response.status === 402) {
        let message;
        try {
            message = (await response.json()).message;
        } catch (_) { }
        throw new LimitReachedError(message);
    }

    const body = await response.json().catch(() => ({}));

    if (body.code === "SESSION_INVALID") {
        localStorage.removeItem("sessionId");
        try {
            await signOut(getAuth());
        } catch (_) { }
        window.location.href = "/login";
    }

    throw new Error(body.error || `API Error: ${response.status}`);
};

// ==========================================
// SHARED SSE READER (Updated & Bulletproof)
// ==========================================
const streamRequest = async (url, method, body, onChunk, onMood) => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}${url}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (!response.ok) await throwForBadResponse(response);

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/event-stream")) {
        const data = await response.json().catch(() => null);
        if (data?.mood && onMood) onMood(data.mood);
        if (data?.text && onChunk) onChunk(data.text);
        return data;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");

        buffer = events.pop();

        for (const event of events) {
            const trimmedEvent = event.trim();

            if (!trimmedEvent.startsWith("data:")) continue;

            const raw = trimmedEvent.replace(/^data:\s*/, "");
            if (raw === "[DONE]") return;

            try {
                const parsed = JSON.parse(raw);
                if (parsed.text) onChunk(parsed.text);
                else if (parsed.mood && onMood) onMood(parsed.mood);
            } catch (err) {
                console.warn("Failed to parse SSE chunk:", raw);
            }
        }
    }
};

// ==========================================
// EXPORTED API METHODS
// ==========================================
export const sendMessage = (characterId, content, diceRoll, onChunk, onMood) =>
    streamRequest(`/chat/${characterId}`, "POST", { content, diceRoll }, onChunk, onMood);

export const replayMessage = (characterId, onChunk, onMood) =>
    streamRequest(`/chat/${characterId}/replay`, "POST", null, onChunk, onMood);

export const continueMessage = (characterId, onChunk, onMood) =>
    streamRequest(`/chat/${characterId}/continue`, "POST", null, onChunk, onMood);

export const deleteMessage = (characterId, messageId, onChunk, onMood) =>
    streamRequest(`/chat/${characterId}/message/${messageId}`, "DELETE", null, onChunk, onMood);

export const editMessage = (messageId, content, onChunk, onMood) =>
    streamRequest(`/chat/message/${messageId}`, "PATCH", { content }, onChunk, onMood);

export const selectAlternate = async (messageId, alternateIndex) => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/chat/message/${messageId}/alternate`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ alternateIndex })
    });
    if (!response.ok) await throwForBadResponse(response);
    return response.json();
};

export const editCheckpoint = async (chatId, checkpointId, text) => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/chat/${chatId}/checkpoint/${checkpointId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ text })
    });
    if (!response.ok) await throwForBadResponse(response);
    return response.json();
};

export const deleteCheckpoint = async (chatId, checkpointId) => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/chat/${chatId}/checkpoint/${checkpointId}`, {
        method: "DELETE",
        headers
    });
    if (!response.ok) await throwForBadResponse(response);
    return response.json();
};

export const fetchChatHistory = async (characterId) => {
    try {
        const response = await api.get(`/chat/history/${characterId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat history:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchRecentChats = async () => {
    const response = await api.get(`/chat/recent`);
    return response.data;
};

export const clearChat = async (characterId) => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/chat/${characterId}`, { method: "DELETE", headers });
    if (!response.ok) await throwForBadResponse(response);
    return response.json();
};

export const selectInitialMessage = async (characterId, preloader) => {
    if (!characterId) throw new Error("Character ID is required to start a chat.");
    try {
        const response = await api.post(`/chat/initial/${characterId}`, { preloader });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred.";
        throw new Error(errorMessage);
    }
};