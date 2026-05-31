// src/services/aiService.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function chatWithAssistant(message, history = [], perfumeData = []) {
  const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, perfumeData }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.reply;
}

export async function explainMatches(matches, userNotes, filters = {}) {
  const res = await fetch(`${BACKEND_URL}/api/ai/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matches, userNotes, filters }),
  });
  if (!res.ok) throw new Error("Explain failed");
  const data = await res.json();
  return data.explanations ?? [];
}

export async function suggestNotes(note, layer, currentNotes = {}) {
  const res = await fetch(`${BACKEND_URL}/api/ai/suggest-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note, layer, currentNotes }),
  });
  if (!res.ok) throw new Error("Suggest failed");
  const data = await res.json();
  return data.suggestions ?? [];
}