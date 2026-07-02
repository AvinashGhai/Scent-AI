const axios = require("axios");

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";
const HF_TOKEN = process.env.HF_API_TOKEN;

async function getEmbedding(text) {
  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: text, options: { wait_for_model: true } },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Embedding generation failed:", err.message);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Builds embedding text with season/occasion/vibe weighted more heavily.
 * Previously all fields were mentioned once, so "smoky" in accords could
 * outweigh an explicit "summer" season tag. Now context (when/where to wear
 * it) is stated up front AND repeated, so it carries proportionally more
 * signal in the resulting vector.
 */
function buildPerfumeEmbeddingText(perfume) {
  const {
    name, brand, gender, type,
    accords = [], topNotes = [], middleNotes = [], baseNotes = [],
    longevity, sillage, vibe = [], bestFor = {}, priceCategory,
  } = perfume;

  const { seasons = [], time = [], occasions = [] } = bestFor;

  const contextLine = `This is a ${seasons.join("/")} fragrance, best worn during ${time.join("/")} for ${occasions.join(", ")}. It feels ${vibe.join(", ")}.`;

  return [
    // Context stated first AND repeated at the end = weighted ~2x vs a single mention
    contextLine,
    `${name} by ${brand}, a ${gender} ${type}.`,
    `Top notes: ${topNotes.join(", ")}.`,
    `Middle notes: ${middleNotes.join(", ")}.`,
    `Base notes: ${baseNotes.join(", ")}.`,
    `Accords: ${accords.join(", ")}.`,
    `Longevity: ${longevity}. Sillage: ${sillage}. Price category: ${priceCategory}.`,
    contextLine, // repeated deliberately
  ].join(" ");
}

module.exports = { getEmbedding, buildPerfumeEmbeddingText };