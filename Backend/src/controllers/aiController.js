// backend/src/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = "gemini-1.5-flash";

function safeJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return null; }
}

// ── CHAT ─────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { message, history = [], perfumeData = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: `You are ScentAI, a friendly fragrance assistant.
You help users discover perfumes based on mood, occasion, and notes.

Perfume database (ONLY recommend from this list, never invent names):
${JSON.stringify(
  perfumeData.slice(0, 20).map((p) => ({
    id: p.id, name: p.name, brand: p.brand, gender: p.gender,
    topNotes: p.topNotes, middleNotes: p.middleNotes, baseNotes: p.baseNotes,
    vibe: p.vibe, seasons: p.bestFor?.seasons,
    occasions: p.bestFor?.occasions, priceCategory: p.priceCategory, rating: p.rating,
  })), null, 2
)}

Rules:
- Only recommend perfumes from the list above. Never invent names.
- If nothing matches, say so honestly.
- Keep replies to 2-4 sentences.
- Be warm and slightly poetic.
- Always mention perfume name, brand, and one key reason when recommending.`
    });

    // Convert history to Gemini format
    const chatHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Chat failed. Check GEMINI_API_KEY in .env" });
  }
};

// ── EXPLAIN MATCHES ───────────────────────────────────────────────────
exports.explain = async (req, res) => {
  try {
    const { matches = [], userNotes = {} } = req.body;
    if (!matches.length) return res.json({ explanations: [] });

    const notesSummary = [
      userNotes.top?.length    ? `Top: ${userNotes.top.join(", ")}` : null,
      userNotes.middle?.length ? `Heart: ${userNotes.middle.join(", ")}` : null,
      userNotes.base?.length   ? `Base: ${userNotes.base.join(", ")}` : null,
    ].filter(Boolean).join(" | ");

    const matchesSummary = matches.map((m, i) =>
      `${i + 1}. ${m.brand} ${m.name} (${m.matchPercent}% match)
   Notes: Top=${m.topNotes.join(", ")} | Heart=${m.middleNotes.join(", ")} | Base=${m.baseNotes.join(", ")}
   Vibe: ${m.vibe.join(", ")}`
    ).join("\n\n");

    const prompt = `You are a fragrance expert. Our algorithm matched these perfumes to a user's scent profile.

User's notes: ${notesSummary}

Matches:
${matchesSummary}

Write a 2-sentence poetic explanation for why each perfume suits this user.
Focus on emotional experience, not just listing notes.

Reply ONLY in this exact JSON, no extra text:
{
  "explanations": [
    { "name": "perfume name", "explanation": "..." },
    { "name": "perfume name", "explanation": "..." },
    { "name": "perfume name", "explanation": "..." }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = safeJSON(raw);
    res.json({ explanations: parsed?.explanations ?? [] });

  } catch (err) {
    console.error("Explain error:", err.message);
    res.status(500).json({ error: "Explain failed" });
  }
};

// ── SUGGEST NOTES ─────────────────────────────────────────────────────
exports.suggestNotes = async (req, res) => {
  try {
    const { note, layer, currentNotes = {} } = req.body;
    if (!note) return res.status(400).json({ error: "Note is required" });

    const already = [
      ...(currentNotes.top ?? []),
      ...(currentNotes.middle ?? []),
      ...(currentNotes.base ?? []),
    ].filter((n) => n !== note);

    const prompt = `User added "${note}" as a ${layer} note in a custom perfume.
Already selected: ${already.length ? already.join(", ") : "none"}.

Suggest 4 complementary real fragrance notes for the other layers.
Only use real perfumery notes. Do not repeat already selected notes.

Reply ONLY in this exact JSON:
{
  "suggestions": [
    { "note": "note name", "layer": "top", "reason": "one short sentence" },
    { "note": "note name", "layer": "middle", "reason": "one short sentence" },
    { "note": "note name", "layer": "base", "reason": "one short sentence" },
    { "note": "note name", "layer": "base", "reason": "one short sentence" }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = safeJSON(raw);
    res.json({ suggestions: parsed?.suggestions ?? [] });

  } catch (err) {
    console.error("Suggest error:", err.message);
    res.status(500).json({ error: "Suggest notes failed" });
  }
};