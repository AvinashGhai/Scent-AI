const Perfume = require("../models/Perfume");

const BUDGET_CATEGORIES = ["budget", "affordable", "budget-designer", "affordable-designer"];
const LUXURY_CATEGORIES = ["luxury", "niche-luxury", "designer-luxury", "designer-premium"];

async function findSimilarPerfumes(queryEmbedding, limit = 5, filters = {}) {
  const oversampleLimit = Math.max(limit * 6, 30);

  const results = await Perfume.aggregate([
    {
      $vectorSearch: {
        index: "perfume_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 150,
        limit: oversampleLimit,
      },
    },
    {
      $project: {
        name: 1,
        brand: 1,
        gender: 1,
        type: 1,
        accords: 1,
        topNotes: 1,
        middleNotes: 1,
        baseNotes: 1,
        vibe: 1,
        bestFor: 1,
        longevity: 1,
        sillage: 1,
        priceCategory: 1,
        image: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  let filtered = results;

  if (filters.gender) {
    if (filters.gender === "unisex") {
      filtered = filtered.filter((p) => p.gender === "unisex");
    } else {
      filtered = filtered.filter((p) => p.gender === filters.gender || p.gender === "unisex");
    }
  }

  if (filters.priceTier === "budget") {
    filtered = filtered.filter((p) => BUDGET_CATEGORIES.includes(p.priceCategory));
  } else if (filters.priceTier === "luxury") {
    filtered = filtered.filter((p) => LUXURY_CATEGORIES.includes(p.priceCategory));
  }

  if (filtered.length === 0) filtered = results;

  return filtered.slice(0, limit);
}

module.exports = { findSimilarPerfumes };