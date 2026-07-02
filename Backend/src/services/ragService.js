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

For each perfume, write a 1-2 sentence explanation of why it fits the user's request, referencing specific notes, accords, or occasions from the data above. Only use facts given above, do not invent notes or details. Return the response as a JSON array of objects with fields "name" and "explanation". The "name" field must be exactly the perfume name only, exactly as written above, without the brand. Return nothing except the JSON array.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const raw = completion.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    return perfumes.map((p) => ({ name: p.name, explanation: null }));
  }
}

module.exports = { explainRecommendations };