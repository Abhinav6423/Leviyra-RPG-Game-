import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// API Calls (Verify exact path)
import { selectInitialMessage } from '../../api-calls/handleChat.js';

// Custom Hooks
import { useChatSession, useMessageActions, useCheckpoints, usePreferences } from './logic/hooks.js';

// Helpers & Constants
import { getFirstDialogues, resolveCharacterName, resolveAvatarSrc } from './logic/helpers.jsx';
import { MOOD_COLORS, FONT_SIZES } from './logic/constants.js';

// Child Components
import PreloaderScreen from './childComponents/PreloaderScreen.jsx';
import ChatHeader from './childComponents/ChatHeader.jsx';
import MessageList from './childComponents/MessageList.jsx';
import Composer from './childComponents/Composer.jsx';
import SidePanel from './childComponents/SidePanel.jsx';
import { MoodLighting, PopupModal } from './childComponents/Shared.jsx';

const ChatArea = () => {
    const { id: characterId } = useParams();
    const scrollRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Form states for Preloader
    const [displayName, setDisplayName] = useState("");
    const [pronouns, setPronouns] = useState("He/Him");
    const [scenarioMode, setScenarioMode] = useState(0);
    const [customFirstMessage, setCustomFirstMessage] = useState("");
    const [startingChat, setStartingChat] = useState(false);
    const [preloaderError, setPreloaderError] = useState("");

    // Hook Initializations
    const session = useChatSession(characterId);
    const { character, chatId, messages, checkpoints, worldState, loading, needsPreloader, setMessages, reload } = session;

    const messageActions = useMessageActions({ characterId, setMessages, reload });
    const checkpointActions = useCheckpoints({
        characterId, chatId, reload,
        setActionError: messageActions.setActionError,
        onCleared: () => setDrawerOpen(false),
    });
    const prefs = usePreferences();

    // Derived State
    const firstDialogues = getFirstDialogues(character);
    const displayCharName = resolveCharacterName(character);
    const avatarSrc = resolveAvatarSrc(character);

    const moodColor = MOOD_COLORS[worldState?.currentMood] || MOOD_COLORS.Pink;
    const bubbleTextClass = FONT_SIZES[prefs.fontSize];

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, messageActions.streamingText]);

    useEffect(() => {
        if (character && firstDialogues.length === 0) setScenarioMode("custom");
    }, [character]);

    const handleStartChat = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return setPreloaderError("Please enter a name.");
        if (scenarioMode === "custom" && !customFirstMessage.trim()) {
            return setPreloaderError("Please enter your custom starting scenario.");
        }

        setStartingChat(true);
        setPreloaderError("");
        try {
            await selectInitialMessage(characterId, {
                displayName: displayName.trim(),
                pronoun: pronouns,
                firstMessage: scenarioMode === "custom" ? customFirstMessage.trim() : scenarioMode,
            });
            await reload();
        } catch (err) {
            console.error(err);
            setPreloaderError(err.message || "Couldn't start the chat. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#09090B] text-stone-500">
                <Loader2 className="animate-spin" size={28} />
            </div>
        );
    }

    return (
        <div className="relative flex h-[100dvh] w-full text-stone-200 font-sans overflow-hidden transition-colors duration-1000 bg-[#030303]">
            <style>{`
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; width: 0; height: 0; }
            `}</style>

            {/* Ambient Lighting Layer */}
            {prefs.moodLightOn && <MoodLighting color={moodColor} />}

            {needsPreloader && (
                <PreloaderScreen
                    displayCharName={displayCharName} avatarSrc={avatarSrc} firstDialogues={firstDialogues}
                    displayName={displayName} setDisplayName={setDisplayName}
                    pronouns={pronouns} setPronouns={setPronouns}
                    scenarioMode={scenarioMode} setScenarioMode={setScenarioMode}
                    customFirstMessage={customFirstMessage} setCustomFirstMessage={setCustomFirstMessage}
                    startingChat={startingChat} preloaderError={preloaderError}
                    onSubmit={handleStartChat}
                    glowColor={moodColor}
                />
            )}

            {/* Chat Content Layer */}
            <div className="relative z-10 flex flex-col flex-1 min-w-0">
                <ChatHeader
                    avatarSrc={avatarSrc} displayCharName={displayCharName}
                    currentSituation={worldState?.currentSituation}
                    onOpenDrawer={() => setDrawerOpen(true)}
                />

                <MessageList
                    scrollRef={scrollRef} messages={messages} bubbleTextClass={bubbleTextClass}
                    editingId={messageActions.editingId} editValue={messageActions.editValue}
                    setEditValue={messageActions.setEditValue}
                    startEdit={messageActions.startEdit} cancelEdit={messageActions.cancelEdit}
                    saveEdit={messageActions.saveEdit} requestDelete={messageActions.requestDelete}
                    cycleAlternate={messageActions.cycleAlternate}
                    isSending={messageActions.isSending} streamingText={messageActions.streamingText}
                    needsPreloader={needsPreloader}
                    glowColor={moodColor} moodLightOn={prefs.moodLightOn}
                />

                <Composer
                    inputValue={messageActions.inputValue} setInputValue={messageActions.setInputValue}
                    onSend={messageActions.handleSend} onReplay={messageActions.handleReplay}
                    onContinue={messageActions.handleContinue} onRollDice={messageActions.handleRollDice}
                    diceRoll={messageActions.diceRoll} isSending={messageActions.isSending}
                    hasMessages={!!messages.length} actionError={messageActions.actionError}
                    onDismissError={() => messageActions.setActionError("")}
                />
            </div>

            <SidePanel
                open={drawerOpen} onClose={() => setDrawerOpen(false)}
                fontSize={prefs.fontSize} showFontMenu={prefs.showFontMenu} setShowFontMenu={prefs.setShowFontMenu}
                setFontSize={prefs.setFontSize} moodLightOn={prefs.moodLightOn} toggleMoodLight={prefs.toggleMoodLight}
                checkpoints={checkpoints} editingCheckpointId={checkpointActions.editingCheckpointId}
                checkpointEditValue={checkpointActions.checkpointEditValue} setCheckpointEditValue={checkpointActions.setCheckpointEditValue}
                startCheckpointEdit={checkpointActions.startCheckpointEdit} cancelCheckpointEdit={checkpointActions.cancelCheckpointEdit}
                saveCheckpointEdit={checkpointActions.saveCheckpointEdit} removeCheckpoint={checkpointActions.removeCheckpoint}
                worldState={worldState} setShowClearModal={checkpointActions.setShowClearModal} glowColor={moodColor}
            />

            <PopupModal
                isOpen={!!messageActions.limitError} title="Limit Reached" message={messageActions.limitError}
                onClose={() => messageActions.setLimitError("")} showUpgradeCTA={true} glowColor={moodColor}
            />
            <PopupModal
                isOpen={checkpointActions.showClearModal} title="Clear Conversation"
                message="Are you sure you want to delete all messages? This action cannot be undone."
                onClose={() => checkpointActions.setShowClearModal(false)}
                primaryAction={checkpointActions.handleClearChat} primaryText="Clear Chat" isDestructive={true} glowColor={moodColor}
            />
            <PopupModal
                isOpen={!!messageActions.pendingEdit} title="Edit Message"
                message="Editing this message will delete everything that came after it in the conversation, and the AI will generate a brand new response starting from here. This can't be undone."
                onClose={messageActions.cancelEditConfirm}
                primaryAction={messageActions.confirmEdit} primaryText="Edit & Regenerate" isDestructive={true} glowColor={moodColor}
            />
            <PopupModal
                isOpen={!!messageActions.pendingDelete} title="Delete Message"
                message="Are you sure you want to delete this message?"
                onClose={messageActions.cancelDelete}
                primaryAction={messageActions.confirmDelete} primaryText="Delete" isDestructive={true} glowColor={moodColor}
            />
        </div>
    );
};

export default ChatArea;