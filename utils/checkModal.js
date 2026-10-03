// check.js
const BASE_URL = "https://api.runware.ai/v1";
const MODEL_ID = "zai:glm@5.3-flash";
const API_KEY = process.env.RUNWARE_API_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

async function listModels() {
  console.log("Fetching models...\n");
  const res = await fetch(`${BASE_URL}/models`, { headers });
  const data = await res.json();

  if (!res.ok || data.error) {
    console.log("Models endpoint failed:", res.status, data.error || data);
    return;
  }

  data.data.forEach((m, i) => console.log(`${i + 1}. ${m.id}`));
}

async function testModel() {
  console.log(`\nTesting model: ${MODEL_ID}\n`);
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL_ID,
      messages: [{ role: "user", content: "Say hello in one short sentence." }],
      max_tokens: 50,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.log("Chat request failed:", res.status, data.error || data);
    return;
  }

  console.log("Reply:", data.choices?.[0]?.message?.content);
}

async function check() {
  if (!API_KEY) {
    console.log("RUNWARE_API_KEY is not set.");
    return;
  }

  try {
    await listModels();
    await testModel();
  } catch (err) {
    console.log("Network or fetch error:", err.message);
  }
}

check();
