import { useState, useEffect, useCallback } from "react";
import { openCharDetails } from "../../../api-calls/openCharDetails";
import {
  fetchChatHistory,
  sendMessage,
  replayMessage,
  continueMessage,
  deleteMessage,
  editMessage,
  selectAlternate,
  selectInitialMessage,
  editCheckpoint,
  deleteCheckpoint,
  clearChat,
  LimitReachedError,
} from "../../../api-calls/handleChat.js";
import { STORAGE_KEYS } from "./constants.js";
import { getMessageVersions, getActiveContent } from "./helpers.jsx";

export function useChatSession(characterId) {
  const [character, setCharacter] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [worldState, setWorldState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPreloader, setNeedsPreloader] = useState(false);
  const [loadError, setLoadError] = useState("");

  const unwrapEnvelope = (raw) => {
    let value = raw;
    let guard = 0;
    while (value && typeof value === "object" && guard < 5) {
      if (
        "name" in value ||
        "characterName" in value ||
        "firstDialogues" in value
      )
        break;
      if ("data" in value && value.data) {
        value = value.data;
        guard += 1;
      } else break;
    }
    return value;
  };

  const reload = useCallback(
    async (showSpinner = true) => {
      if (!characterId) return;
      if (showSpinner) setLoading(true);
      try {
        const [charResponse, historyData] = await Promise.all([
          openCharDetails(characterId),
          fetchChatHistory(characterId),
        ]);
        setCharacter(unwrapEnvelope(charResponse));
        setChatId(historyData.chatId || null);
        setMessages(historyData.messages || []);
        setCheckpoints(historyData.checkpoints || []);
        setWorldState(historyData.worldState || null);
        setNeedsPreloader(!historyData.chatId);
        setLoadError("");
      } catch (err) {
        console.error("Failed to load chat:", err);
        setLoadError("Couldn't load this chat. Please refresh.");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [characterId],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    character,
    chatId,
    messages,
    checkpoints,
    worldState,
    loading,
    needsPreloader,
    loadError,
    setMessages,
    reload,
  };
}

export function useMessageActions({ characterId, setMessages, reload }) {
  const [inputValue, setInputValue] = useState("");
  const [diceRoll, setDiceRoll] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [limitError, setLimitError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);

  const runStream = async (streamFn, rollbackFn) => {
    setIsSending(true);
    setStreamingText("");
    setActionError("");
    try {
      await streamFn(
        (chunk) => setStreamingText((prev) => prev + chunk),
        () => {},
      );
      await reload(false);
    } catch (err) {
      rollbackFn?.();
      if (err instanceof LimitReachedError) {
        setLimitError(err.message || "You've reached your message limit.");
      } else {
        console.error(err);
        setActionError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSending(false);
      setStreamingText("");
    }
  };

  const handleSend = () => {
    const content = inputValue.trim();
    if (!content || isSending) return;
    setInputValue("");
    const rollToSend = diceRoll;
    setDiceRoll(null);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { _id: tempId, role: "user", content: [content] },
    ]);

    const rollback = () => {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInputValue(content);
      setDiceRoll(rollToSend);
    };

    runStream(
      (onChunk, onMood) =>
        sendMessage(characterId, content, rollToSend, onChunk, onMood),
      rollback,
    );
  };

  const handleReplay = (hasMessages) => {
    if (isSending || !hasMessages) return;
    runStream((onChunk, onMood) => replayMessage(characterId, onChunk, onMood));
  };

  const handleContinue = (hasMessages) => {
    if (isSending || !hasMessages) return;
    runStream((onChunk, onMood) =>
      continueMessage(characterId, onChunk, onMood),
    );
  };

  const requestDelete = (messageId) => {
    if (isSending) return;
    setPendingDelete(messageId);
  };
  const cancelDelete = () => setPendingDelete(null);
  const confirmDelete = () => {
    const messageId = pendingDelete;
    setPendingDelete(null);
    if (!messageId) return;

    setMessages((prev) => {
      const targetIndex = prev.findIndex((m) => m._id === messageId);
      if (targetIndex === -1) return prev;
      return prev.slice(0, targetIndex);
    });

    runStream((onChunk, onMood) =>
      deleteMessage(characterId, messageId, onChunk, onMood),
    );
  };

  const handleRollDice = () =>
    setDiceRoll((prev) => (prev ? null : Math.floor(Math.random() * 6) + 1));

  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditValue(getActiveContent(msg));
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const performEdit = async (messageId, value) => {
    if (!value.trim()) return;
    try {
      await editMessage(messageId, value.trim());
      cancelEdit();
      await reload(false);
    } catch (err) {
      console.error(err);
      setActionError("Couldn't save the edit.");
    }
  };

  const performUserEdit = (messageId, value) => {
    if (!value.trim()) return;
    cancelEdit();

    setMessages((prev) => {
      const targetIndex = prev.findIndex((m) => m._id === messageId);
      if (targetIndex === -1) return prev;
      const updatedMessages = prev.slice(0, targetIndex + 1);
      updatedMessages[targetIndex] = {
        ...updatedMessages[targetIndex],
        content: [value.trim()],
        isEdited: true,
      };
      return updatedMessages;
    });

    runStream((onChunk, onMood) =>
      editMessage(messageId, value.trim(), onChunk, onMood),
    );
  };

  const saveEdit = (msg) => {
    if (!editValue.trim()) return;
    if (msg.role === "user") {
      setPendingEdit({ messageId: msg._id, content: editValue });
    } else {
      performEdit(msg._id, editValue);
    }
  };
  const cancelEditConfirm = () => setPendingEdit(null);
  const confirmEdit = () => {
    if (!pendingEdit) return;
    const { messageId, content } = pendingEdit;
    setPendingEdit(null);
    performUserEdit(messageId, content);
  };

  const cycleAlternate = async (msg, newIndex) => {
    const versions = getMessageVersions(msg);
    if (versions.length < 2) return;
    if (newIndex < 0 || newIndex >= versions.length) return;

    const currentIndex =
      typeof msg.selectedAlternateIndex === "number" &&
      msg.selectedAlternateIndex >= 0
        ? msg.selectedAlternateIndex
        : versions.length - 1;

    if (newIndex === currentIndex) return;

    try {
      await selectAlternate(msg._id, newIndex);
      await reload(false);
    } catch (err) {
      console.error(err);
      setActionError("Couldn't switch to that version.");
    }
  };

  return {
    inputValue,
    setInputValue,
    diceRoll,
    streamingText,
    isSending,
    actionError,
    setActionError,
    limitError,
    setLimitError,
    editingId,
    editValue,
    setEditValue,
    handleSend,
    handleReplay,
    handleContinue,
    handleRollDice,
    requestDelete,
    cancelDelete,
    confirmDelete,
    pendingDelete,
    startEdit,
    cancelEdit,
    saveEdit,
    cycleAlternate,
    pendingEdit,
    cancelEditConfirm,
    confirmEdit,
  };
}

export function useCheckpoints({
  characterId,
  chatId,
  reload,
  setActionError,
  onCleared,
}) {
  const [editingCheckpointId, setEditingCheckpointId] = useState(null);
  const [checkpointEditValue, setCheckpointEditValue] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  const startCheckpointEdit = (cp) => {
    setEditingCheckpointId(cp._id);
    setCheckpointEditValue(cp.text);
  };
  const cancelCheckpointEdit = () => {
    setEditingCheckpointId(null);
    setCheckpointEditValue("");
  };

  const saveCheckpointEdit = async (checkpointId) => {
    if (!checkpointEditValue.trim() || !chatId) return;
    try {
      await editCheckpoint(chatId, checkpointId, checkpointEditValue.trim());
      cancelCheckpointEdit();
      await reload(false);
    } catch (err) {
      console.error(err);
      setActionError("Couldn't save the checkpoint.");
    }
  };

  const removeCheckpoint = async (checkpointId) => {
    if (!chatId) return;
    try {
      await deleteCheckpoint(chatId, checkpointId);
      await reload(false);
    } catch (err) {
      console.error(err);
      setActionError("Couldn't delete the checkpoint.");
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChat(characterId);
      setShowClearModal(false);
      onCleared?.();
      await reload();
    } catch (err) {
      console.error(err);
      setActionError("Couldn't clear the chat.");
    }
  };

  return {
    editingCheckpointId,
    checkpointEditValue,
    setCheckpointEditValue,
    startCheckpointEdit,
    cancelCheckpointEdit,
    saveCheckpointEdit,
    removeCheckpoint,
    showClearModal,
    setShowClearModal,
    handleClearChat,
  };
}

export function usePreferences() {
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.fontSize) || "base",
  );
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [moodLightOn, setMoodLightOn] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.moodLight);
    return stored === null ? true : stored === "true";
  });

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEYS.fontSize, size);
    setShowFontMenu(false);
  };

  const toggleMoodLight = () => {
    setMoodLightOn((prev) => {
      localStorage.setItem(STORAGE_KEYS.moodLight, String(!prev));
      return !prev;
    });
  };

  return {
    fontSize,
    setFontSize,
    showFontMenu,
    setShowFontMenu,
    moodLightOn,
    toggleMoodLight,
  };
}
