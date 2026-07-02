const Perfume = require("../models/Perfume");

/**
 * Given a query embedding, find the top-k most semantically similar perfumes.
 */
async function findSimilarPerfumes(queryEmbedding, limit = 5) {
  const results = await Perfume.aggregate([
    {
      $vectorSearch: {
        index: "perfume_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: limit,
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

  return results;
}

module.exports = { findSimilarPerfumes };