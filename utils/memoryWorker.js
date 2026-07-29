import Chat from "../modals/Chat.modal.js";
import Message from "../modals/message.modal.js";
import OpenAI from "openai";

const ai = new OpenAI({
    apiKey: process.env.ARLIAI_API_KEY,
    baseURL: "https://api.venice.ai/api/v1",
});

// How many summaries / emotive memories to keep before old ones are dropped
const MAX_SUMMARIES = 10;
const MAX_EMOTIVE = 20;
const MAX_STORY_FACTS = 20;

export const processBackgroundMemory = async (chatId, characterId) => {
    try {
        console.log(`[Memory Worker] Triggered for chat: ${chatId}`);

        // ── 1. Fetch recent messages (skip regenerated ones for accuracy) ──
        const recentMessages = await Message.find({
            chatId,
            regenerated: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        if (recentMessages.length === 0) return;

        const chatText = recentMessages
            .reverse()
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

        // ── 2. Load existing world state so AI updates it, not replaces it ──
        const existingChat = await Chat.findById(chatId, { worldState: 1 }).lean();
        const ws = existingChat?.worldState || {};

        // ── 3. Prompt — aligned with the new Chat schema fields ─────────────
        const prompt = `
You are a story memory engine for a roleplay app. Analyze the conversation below.

EXISTING WORLD STATE (only change what actually changed in this conversation):
- Location: ${ws.location || "Unknown"}
- Time: ${ws.time || "Unknown"}
- Weather: ${ws.weather || "Unknown"}
- Situation: ${ws.currentSituation || "Unknown"}

CONVERSATION:
${chatText}

Respond ONLY with valid JSON — no markdown fences, no extra text.
{
  "summary": "2 sentences max describing what just happened.",
  "emotion": "One specific emotion the AI character felt (e.g. Jealous, Elated, Anxious).",
  "trigger": "One sentence: what caused that emotion.",
  "moodIntensity": 7,
  "location": "Where the scene is set. Keep existing value if it didn't change.",
  "time": "Time of day or era. Keep existing value if it didn't change.",
  "weather": "Weather or ambient atmosphere. Keep existing if unchanged.",
  "currentSituation": "One sentence: what is actively happening in the story right now.",
  "currentMood": "Overall tone/mood of the story at this point.",
  "newCharacters": [
    { "name": "...", "role": "...", "personality": "...", "status": "active", "location": "..." }
  ],
  "newInventoryItems": ["item1", "item2"],
  "importantMemory": "One critical fact the AI must never forget from this exchange, or null."
}
`;

        const response = await ai.chat.completions.create({
            model: "gemma-4-uncensored",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3, // Low temperature = more reliable JSON
        });

        // ── 4. Safe JSON parse — abort cleanly on bad output ────────────────
        let aiOutput;
        try {
            const raw = response.choices[0].message.content
                .replace(/```json|```/g, "")
                .trim();
            aiOutput = JSON.parse(raw);
        } catch (parseErr) {
            console.error("[Memory Worker] JSON parse failed:", parseErr.message);
            return; // Don't corrupt the DB with broken data
        }

        // ── 5. Build the MongoDB update ──────────────────────────────────────
        const updateOps = {
            // $slice keeps arrays from growing forever
            $push: {
                pastSummaries: {
                    $each: [{ text: aiOutput.summary, createdAt: new Date() }],
                    $slice: -MAX_SUMMARIES
                },
                emotiveMemory: {
                    $each: [{ emotion: aiOutput.emotion, trigger: aiOutput.trigger, createdAt: new Date() }],
                    $slice: -MAX_EMOTIVE
                },
            },
            $set: {
                "worldState.location": aiOutput.location,
                "worldState.time": aiOutput.time,
                "worldState.weather": aiOutput.weather,
                "worldState.currentSituation": aiOutput.currentSituation,
                "worldState.currentMood": aiOutput.currentMood,
                "worldState.intensityOfTheMood": Number(aiOutput.moodIntensity) || 5,
            },
        };

        // Only push new characters if the AI actually found some
        if (Array.isArray(aiOutput.newCharacters) && aiOutput.newCharacters.length > 0) {
            updateOps.$push["worldState.introducedCharacters"] = {
                $each: aiOutput.newCharacters
            };
        }

        // Only push new inventory items if any appeared
        if (Array.isArray(aiOutput.newInventoryItems) && aiOutput.newInventoryItems.length > 0) {
            updateOps.$push["worldState.inventory"] = {
                $each: aiOutput.newInventoryItems
            };
        }

        // Only push a story memory if the AI flagged something important
        if (aiOutput.importantMemory) {
            updateOps.$push["worldState.storyMemory"] = {
                $each: [aiOutput.importantMemory],
                $slice: -MAX_STORY_FACTS
            };
        }

        await Chat.findByIdAndUpdate(chatId, updateOps);

        console.log(`[Memory Worker] ✅ Memory updated for chat: ${chatId}`);

    } catch (err) {
        console.error("[Memory Worker] Failed:", err.message);
    }
};