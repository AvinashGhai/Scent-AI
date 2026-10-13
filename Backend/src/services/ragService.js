const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function explainRecommendations(query, perfumes) {
  const context = perfumes.map((p, i) => {
    return `${i + 1}. ${p.name} by ${p.brand} (${p.gender}, ${p.type})
Top notes: ${p.topNotes.join(", ")}
Middle notes: ${p.middleNotes.join(", ")}
Base notes: ${p.baseNotes.join(", ")}
Accords: ${p.accords.join(", ")}
Vibe: ${p.vibe.join(", ")}
Best for: ${p.bestFor.occasions.join(", ")} in ${p.bestFor.seasons.join("/")}, worn ${p.bestFor.time.join("/")}
Longevity: ${p.longevity}, Sillage: ${p.sillage}, Price: ${p.priceCategory}`;
  }).join("\n\n");

  const prompt = `User is looking for: "${query}"

Here are ${perfumes.length} candidate perfumes retrieved by semantic search:

${context}

For each perfume, write:
1. "explanation": 1-2 sentences on why it fits the user's request, referencing specific notes, accords, or occasions from the data above.
2. "downside": 1 honest sentence on a real limitation or tradeoff for this specific request — e.g. weaker sillage, wrong season fit, higher price, or a note that might not suit everyone. Only use facts given above, do not invent anything. If there is genuinely no meaningful downside for this request, say "No significant downside for this request."

Only use facts given above, do not invent notes or details. Return a JSON object with a single field "results", which is an array of objects each with "name", "explanation", and "downside". The "name" field must be exactly the perfume name only, exactly as written above, without the brand.`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;

  try {
    const parsed = JSON.parse(raw);
    return parsed.results ?? [];
  } catch (err) {
    console.error("Explain JSON parse failed:", err.message);
    return perfumes.map((p) => ({ name: p.name, explanation: null, downside: null }));
  }
}

async function comparePerfumes(perfumeA, perfumeB) {
  const describe = (p) => `${p.name} by ${p.brand} (${p.gender}, ${p.type})
Top notes: ${p.topNotes.join(", ")}
Middle notes: ${p.middleNotes.join(", ")}
Base notes: ${p.baseNotes.join(", ")}
Accords: ${p.accords.join(", ")}
Vibe: ${p.vibe.join(", ")}
Best for: ${p.bestFor.occasions.join(", ")} in ${p.bestFor.seasons.join("/")}, worn ${p.bestFor.time.join("/")}
Longevity: ${p.longevity}, Sillage: ${p.sillage}, Price: ${p.priceCategory}`;

  const prompt = `Compare these two perfumes for someone deciding between them:

PERFUME A:
${describe(perfumeA)}

PERFUME B:
${describe(perfumeB)}

Return a JSON object with these fields, all values must be valid JSON strings wrapped in double quotes:
- "freshness": which is fresher and why (1 sentence)
- "longevity": which lasts longer, based on the longevity/sillage data given
- "versatility": which is more versatile across occasions/seasons
- "uniqueness": which has a more distinctive/unique profile
- "verdict": a 2-sentence overall recommendation on who should pick which one

Only use facts given above, do not invent details.`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  console.log("RAW COMPARE OUTPUT:", raw);

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Compare JSON parse failed:", err.message);
    return { error: "Failed to generate comparison" };
  }
}

module.exports = { explainRecommendations, comparePerfumes };