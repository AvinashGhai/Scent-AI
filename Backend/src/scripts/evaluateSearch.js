require("dotenv").config();

const TEST_QUERIES = [
  "something smoky for winter nights",
  "fresh scent for the office",
  "sweet fragrance for a first date",
  "luxury perfume for special occasions",
  "casual everyday summer scent",
  "unisex fragrance for daily wear",
  "strong long-lasting perfume for a party",
  "budget-friendly fresh cologne",
];

async function runEval() {
  const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:8000";

  for (const query of TEST_QUERIES) {
    console.log("\n" + "=".repeat(70));
    console.log(`QUERY: "${query}"`);
    console.log("=".repeat(70));

    try {
      const res = await fetch(`${BASE_URL}/api/perfumes/smart-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 3 }),
      });

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        console.log("  No results returned.");
        continue;
      }

      data.results.forEach((p, i) => {
        console.log(`\n  ${i + 1}. ${p.name} (${p.brand}) — score: ${p.score?.toFixed(3)}`);
        console.log(`     Season/Occasion: ${p.bestFor?.seasons?.join(", ")} / ${p.bestFor?.occasions?.join(", ")}`);
        console.log(`     Why: ${p.explanation}`);
        console.log(`     Downside: ${p.downside}`);
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("Eval complete. Review each query's results above for relevance.");
  console.log("=".repeat(70));
}

runEval();
