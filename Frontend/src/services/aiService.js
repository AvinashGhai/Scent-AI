// ─────────────────────────────────────────────────────────────────────
// aiService.js
// ScentAI — Claude API Integration
// All AI calls go through here — never call API directly from components
// ─────────────────────────────────────────────────────────────────────

import { buildMatchPrompt } from "./recommendationEngine";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL   = "claude-sonnet-4-20250514";

// ── CORE FETCHER ─────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// Safe JSON parse — strips markdown fences if present
function safeJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return null; }
}

// ── 1. EXPLAIN MATCHES ───────────────────────────────────────────────
/**
 * Given top matches from recommendationEngine, ask Claude to explain
 * why each one suits the user. Returns array of { name, explanation }.
 *
 * @param {Object[]} matches    Scored perfumes from getRecommendations
 * @param {Object}   userNotes  { top, middle, base }
 * @param {Object}   filters    { vibes, seasons, occasions }
 */
export async function explainMatches(matches, userNotes, filters = {}) {
  if (!matches?.length) return [];

  const prompt = buildMatchPrompt(matches, userNotes, filters);

  const system = `You are a world-class fragrance expert with deep knowledge of perfumery. 
You write evocative, poetic but concise descriptions. Always respond in valid JSON only.`;

  const raw = await callClaude(system, prompt, 800);
  const parsed = safeJSON(raw);

  if (!parsed?.explanations) return matches.map((m) => ({ name: m.name, explanation: "" }));
  return parsed.explanations;
}

// ── 2. SUGGEST COMPLEMENTARY NOTES ───────────────────────────────────
/**
 * Given a note the user just added, suggest 4 complementary notes
 * for the other layers. Used in ScentMixer as user builds their profile.
 *
 * @param {string} note       Note just added e.g. "Cinnamon"
 * @param {string} layer      Which layer it's in: "top" | "middle" | "base"
 * @param {Object} current    Current notes { top, middle, base }
 */
export async function suggestComplementaryNotes(note, layer, current = {}) {
  const system = `You are a perfumer. Suggest complementary fragrance notes. 
Always respond in valid JSON only. No extra text.`;

  const alreadySelected = [
    ...(current.top    ?? []),
    ...(current.middle ?? []),
    ...(current.base   ?? []),
  ].filter((n) => n !== note);

  const user = `The user added "${note}" as a ${layer} note.
Already selected: ${alreadySelected.length ? alreadySelected.join(", ") : "none"}.

Suggest 4 complementary notes for the other layers. 
Pick real perfumery notes only (e.g. Bergamot, Jasmine, Sandalwood).
Avoid repeating already selected notes.

Reply ONLY in this JSON format:
{
  "suggestions": [
    { "note": "note name", "layer": "top|middle|base", "reason": "one short sentence" }
  ]
}`;

  const raw = await callClaude(system, user, 500);
  const parsed = safeJSON(raw);
  return parsed?.suggestions ?? [];
}

// ── 3. AI ASSISTANT (CONVERSATIONAL) ─────────────────────────────────
/**
 * General purpose fragrance assistant.
 * Handles prompts like:
 * - "Suggest a sweet winter perfume for parties"
 * - "I like Dior Sauvage, what's similar but cheaper?"
 * - "What notes are in a chypre fragrance?"
 *
 * @param {string}   message      User's message
 * @param {Object[]} history      Previous messages [{ role, content }]
 * @param {Object[]} perfumeData  Your perfumes array (for RAG context)
 */
export async function chatWithAssistant(message, history = [], perfumeData = []) {
  const system = `You are ScentAI, a friendly and knowledgeable fragrance assistant. 
You help users discover perfumes, understand fragrance notes, and find their perfect scent.

You have access to this perfume database:
${JSON.stringify(
    perfumeData.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      gender: p.gender,
      topNotes: p.topNotes,
      middleNotes: p.middleNotes,
      baseNotes: p.baseNotes,
      vibe: p.vibe,
      seasons: p.bestFor?.seasons,
      occasions: p.bestFor?.occasions,
      priceCategory: p.priceCategory,
      rating: p.rating,
    })),
    null,
    2
  )}

Rules:
- Only recommend perfumes from the database above. Never invent perfume names.
- If the user asks for something not in the database, say so honestly.
- Keep responses concise — 2-4 sentences max unless explaining notes.
- Be warm, knowledgeable, and slightly poetic in tone.
- When recommending, always mention the perfume name, brand, and one key reason.`;

  const messages = [
    ...history,
    { role: "user", content: message },
  ];

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "Sorry, I couldn't process that. Please try again.";
}

// ── 4. QUICK PERFUME DESCRIPTION ─────────────────────────────────────
/**
 * Generate a short poetic description for a perfume detail page.
 * Shows under the perfume name on PerfumePage.
 *
 * @param {Object} perfume  A perfume object from your dataset
 */
export async function generatePerfumeDescription(perfume) {
  const system = `You are a luxury perfume copywriter. Write evocative, sensory descriptions. 
2 sentences max. No marketing clichés. Respond with plain text only.`;

  const user = `Write a 2-sentence poetic description for this perfume:
Name: ${perfume.name} by ${perfume.brand}
Top notes: ${perfume.topNotes.join(", ")}
Heart notes: ${perfume.middleNotes.join(", ")}
Base notes: ${perfume.baseNotes.join(", ")}
Vibe: ${perfume.vibe.join(", ")}
Best for: ${perfume.bestFor.occasions.join(", ")} in ${perfume.bestFor.seasons.join(", ")}`;

  return callClaude(system, user, 200);
}