const Perfume = require("../models/Perfume");
const { getEmbedding } = require("../services/embeddingService");
const { findSimilarPerfumes } = require("../services/vectorSearch");
const { explainRecommendations } = require("../services/ragService");

exports.getAll = async (req, res) => {
  try {
    const { gender, season, occasion, priceCategory } = req.query;
    const filter = {};
    if (gender) filter.gender = gender;
    if (season) filter["bestFor.seasons"] = season;
    if (occasion) filter["bestFor.occasions"] = occasion;
    if (priceCategory) filter.priceCategory = priceCategory;

    const perfumes = await Perfume.find(filter);
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch perfumes" });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });

    const perfumes = await Perfume.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { accords: { $regex: q, $options: "i" } },
        { vibe: { $regex: q, $options: "i" } },
      ],
    });
    res.json(perfumes);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};

exports.semanticSearch = async (req, res) => {
  try {
    const { query, limit } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query text is required" });
    }

    const queryEmbedding = await getEmbedding(query);
    const results = await findSimilarPerfumes(queryEmbedding, limit || 5);

    res.status(200).json({
      query,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("Semantic search error:", err.message);
    res.status(500).json({ error: "Semantic search failed" });
  }
};

exports.smartRecommend = async (req, res) => {
  try {
    const { query, limit } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query text is required" });
    }

    const queryEmbedding = await getEmbedding(query);
    const perfumes = await findSimilarPerfumes(queryEmbedding, limit || 5);
    const explanations = await explainRecommendations(query, perfumes);

    const merged = perfumes.map((p) => {
      const match = explanations.find(
        (e) => e.name === p.name || e.name.includes(p.name) || p.name.includes(e.name)
      );
      return { ...p, explanation: match ? match.explanation : null };
    });

    res.status(200).json({
      query,
      count: merged.length,
      results: merged,
    });
  } catch (err) {
    console.error("Smart recommend error:", err.message);
    res.status(500).json({ error: "Smart recommendation failed" });
  }
};