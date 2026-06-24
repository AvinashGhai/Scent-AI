const Perfume = require("../models/Perfume");

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