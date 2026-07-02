require("dotenv").config();
const mongoose = require("mongoose");
const Perfume = require("../models/Perfume");
const { getEmbedding, buildPerfumeEmbeddingText } = require("../services/embeddingService");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

 
  const perfumes = await Perfume.find({});
  console.log(`Re-embedding ${perfumes.length} perfumes with updated weighting`);

  for (const [i, perfume] of perfumes.entries()) {
    const text = buildPerfumeEmbeddingText(perfume);
    try {
      const embedding = await getEmbedding(text);
      perfume.embedding = embedding;
      await perfume.save();
      console.log(`[${i + 1}/${perfumes.length}] Re-embedded: ${perfume.name}`);
    } catch (err) {
      console.error(`Failed on ${perfume.name}:`, err.message);
    }
    await new Promise((res) => setTimeout(res, 300));
  }

  console.log("Done.");
  await mongoose.disconnect();
}

run();