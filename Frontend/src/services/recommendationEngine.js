// ─────────────────────────────────────────────────────────────────────
// recommendationEngine.js
// ScentAI — Core Recommendation & Scoring Logic
// No external dependencies — pure JS, works with your Perfume.js data
// ─────────────────────────────────────────────────────────────────────

import { perfumes } from "../data/Perfume";

// ── WEIGHTS ──────────────────────────────────────────────────────────
const WEIGHTS = {
  // Note layer weights
  baseNote:    5,   // Base notes define character — highest weight
  middleNote:  3,   // Heart notes — core personality
  topNote:     2,   // Top notes — first impression

  // Bonus weights
  vibeMatch:    3,
  seasonMatch:  2,
  occasionMatch: 2,
  genderMatch:  1,
  accordMatch:  1,
};

// ── UTILITY ──────────────────────────────────────────────────────────

// Normalize strings for comparison (lowercase, trimmed)
function norm(str) {
  return str?.toLowerCase().trim() ?? "";
}

// How many items from array A are in array B
function countMatches(a = [], b = []) {
  const setB = new Set(b.map(norm));
  return a.filter((item) => setB.has(norm(item))).length;
}

// Which items from array A are in array B (returns matched items)
function getMatches(a = [], b = []) {
  const setB = new Set(b.map(norm));
  return a.filter((item) => setB.has(norm(item)));
}

// Max possible score for a given user input
function maxPossibleScore(userNotes, filters = {}) {
  let max = 0;
  max += (userNotes?.top?.length    ?? 0) * WEIGHTS.topNote;
  max += (userNotes?.middle?.length ?? 0) * WEIGHTS.middleNote;
  max += (userNotes?.base?.length   ?? 0) * WEIGHTS.baseNote;
  if (filters.vibes?.length)    max += WEIGHTS.vibeMatch;
  if (filters.seasons?.length)  max += WEIGHTS.seasonMatch;
  if (filters.occasions?.length) max += WEIGHTS.occasionMatch;
  if (filters.gender)           max += WEIGHTS.genderMatch;
  return max || 1; // prevent divide-by-zero
}

// ── CORE SCORER ──────────────────────────────────────────────────────
/**
 * Score a single perfume against user input.
 * Returns { rawScore, matchPercent, breakdown }
 *
 * userNotes: { top: [], middle: [], base: [] }
 * filters:   { vibes: [], seasons: [], occasions: [], gender: "" }
 */
function scorePerfume(perfume, userNotes = {}, filters = {}) {
  const breakdown = {
    topNoteMatches:    [],
    middleNoteMatches: [],
    baseNoteMatches:   [],
    vibeMatches:       [],
    seasonMatches:     [],
    occasionMatches:   [],
    genderMatch:       false,
    accordMatches:     [],
  };

  let score = 0;

  // ── Note matching ──
  const topMatches = getMatches(userNotes.top ?? [], perfume.topNotes);
  score += topMatches.length * WEIGHTS.topNote;
  breakdown.topNoteMatches = topMatches;

  const middleMatches = getMatches(userNotes.middle ?? [], perfume.middleNotes);
  score += middleMatches.length * WEIGHTS.middleNote;
  breakdown.middleNoteMatches = middleMatches;

  const baseMatches = getMatches(userNotes.base ?? [], perfume.baseNotes);
  score += baseMatches.length * WEIGHTS.baseNote;
  breakdown.baseNoteMatches = baseMatches;

  // ── Vibe / mood matching ──
  if (filters.vibes?.length) {
    const vibeMatches = getMatches(filters.vibes, perfume.vibe ?? []);
    if (vibeMatches.length > 0) {
      score += WEIGHTS.vibeMatch;
      breakdown.vibeMatches = vibeMatches;
    }
  }

  // ── Season matching ──
  if (filters.seasons?.length) {
    const seasonMatches = getMatches(filters.seasons, perfume.bestFor?.seasons ?? []);
    if (seasonMatches.length > 0) {
      score += WEIGHTS.seasonMatch;
      breakdown.seasonMatches = seasonMatches;
    }
  }

  // ── Occasion matching ──
  if (filters.occasions?.length) {
    const occasionMatches = getMatches(filters.occasions, perfume.bestFor?.occasions ?? []);
    if (occasionMatches.length > 0) {
      score += WEIGHTS.occasionMatch;
      breakdown.occasionMatches = occasionMatches;
    }
  }

  // ── Gender matching ──
  if (filters.gender && filters.gender !== "all") {
    if (
      norm(perfume.gender) === norm(filters.gender) ||
      norm(perfume.gender) === "unisex"
    ) {
      score += WEIGHTS.genderMatch;
      breakdown.genderMatch = true;
    }
  }

  // ── Accord matching (bonus) ──
  const allUserNotes = [
    ...(userNotes.top ?? []),
    ...(userNotes.middle ?? []),
    ...(userNotes.base ?? []),
  ];
  const accordMatches = getMatches(allUserNotes, perfume.accords ?? []);
  score += accordMatches.length * WEIGHTS.accordMatch;
  breakdown.accordMatches = accordMatches;

  const max = maxPossibleScore(userNotes, filters);
  const matchPercent = Math.min(100, Math.round((score / max) * 100));

  return { rawScore: score, matchPercent, breakdown };
}

// ── PUBLIC API ────────────────────────────────────────────────────────

/**
 * getRecommendations
 * Main function — call this from ScentMixer, Discover, AI assistant
 *
 * @param {Object} userNotes   { top: [], middle: [], base: [] }
 * @param {Object} filters     { vibes, seasons, occasions, gender, priceCategories }
 * @param {number} limit       How many results to return (default 5)
 * @returns Array of perfume objects with { ...perfume, matchPercent, breakdown }
 */
export function getRecommendations(userNotes = {}, filters = {}, limit = 5) {
  const allNotes = [
    ...(userNotes.top ?? []),
    ...(userNotes.middle ?? []),
    ...(userNotes.base ?? []),
  ];

  // Nothing to score against
  if (allNotes.length === 0) return [];

  let pool = [...perfumes];

  // Hard filter by price if specified
  if (filters.priceCategories?.length) {
    pool = pool.filter((p) => filters.priceCategories.includes(p.priceCategory));
  }

  // Hard filter by gender if specified
  if (filters.gender && filters.gender !== "all") {
    pool = pool.filter(
      (p) => norm(p.gender) === norm(filters.gender) || norm(p.gender) === "unisex"
    );
  }

  // Score every perfume in the pool
  const scored = pool
    .map((p) => {
      const { rawScore, matchPercent, breakdown } = scorePerfume(p, userNotes, filters);
      return { ...p, rawScore, matchPercent, breakdown };
    })
    .filter((p) => p.rawScore > 0) // Only return actual matches
    .sort((a, b) => {
      // Primary: raw score
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      // Tiebreak: community rating
      return b.rating - a.rating;
    })
    .slice(0, limit);

  return scored;
}

/**
 * getSimilarPerfumes
 * Given a perfume, find the most similar ones from the database
 * Used on PerfumePage "You May Also Like" section
 *
 * @param {Object} perfume   A perfume object from your dataset
 * @param {number} limit     How many to return (default 4)
 */
export function getSimilarPerfumes(perfume, limit = 4) {
  if (!perfume) return [];

  const userNotes = {
    top:    perfume.topNotes,
    middle: perfume.middleNotes,
    base:   perfume.baseNotes,
  };

  return perfumes
    .filter((p) => p.id !== perfume.id)
    .map((p) => {
      const { rawScore, matchPercent, breakdown } = scorePerfume(p, userNotes, {
        vibes: perfume.vibe,
      });

      // Extra bonus: same fragrance family (via accords overlap)
      const accordOverlap = countMatches(perfume.accords, p.accords);
      const finalScore = rawScore + accordOverlap * WEIGHTS.accordMatch;

      return { ...p, rawScore: finalScore, matchPercent, breakdown };
    })
    .filter((p) => p.rawScore > 0)
    .sort((a, b) => {
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

/**
 * getByMoodAndSeason
 * Quick filter for Home page mood chips and seasonal sections
 *
 * @param {string[]} vibes     e.g. ["fresh", "clean"]
 * @param {string[]} seasons   e.g. ["summer"]
 * @param {number}   limit
 */
export function getByMoodAndSeason(vibes = [], seasons = [], limit = 6) {
  return perfumes
    .filter((p) => {
      const matchVibe   = vibes.length === 0   || vibes.some((v) => p.vibe.includes(v));
      const matchSeason = seasons.length === 0 || seasons.some((s) => p.bestFor.seasons.includes(s));
      return matchVibe && matchSeason;
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * getTrending
 * Top-rated perfumes with enough community votes to be trustworthy
 *
 * @param {number} minVotes  Minimum votes threshold (default 1000)
 * @param {number} limit
 */
export function getTrending(minVotes = 1000, limit = 6) {
  return [...perfumes]
    .filter((p) => p.totalVotes >= minVotes)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * searchPerfumes
 * Text search across name, brand, notes, accords, vibe
 *
 * @param {string} query
 * @param {number} limit
 */
export function searchPerfumes(query = "", limit = 20) {
  if (!query.trim()) return [...perfumes].sort((a, b) => b.rating - a.rating).slice(0, limit);

  const q = norm(query);

  return perfumes
    .map((p) => {
      let score = 0;
      if (norm(p.name).includes(q))  score += 10;
      if (norm(p.brand).includes(q)) score += 8;
      if (p.accords.some((a) => norm(a).includes(q))) score += 5;
      if (p.vibe.some((v) => norm(v).includes(q)))    score += 4;
      const allNotes = [...p.topNotes, ...p.middleNotes, ...p.baseNotes];
      if (allNotes.some((n) => norm(n).includes(q)))  score += 6;
      if (p.bestFor.occasions.some((o) => norm(o).includes(q))) score += 3;
      return { ...p, searchScore: score };
    })
    .filter((p) => p.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit);
}

/**
 * explainMatch
 * Returns a human-readable explanation string for why a perfume matched
 * Use this as context when calling Claude API
 *
 * @param {Object} scoredPerfume   A perfume returned by getRecommendations
 */
export function explainMatch(scoredPerfume) {
  const { breakdown, name, brand } = scoredPerfume;
  const parts = [];

  const allNoteMatches = [
    ...breakdown.topNoteMatches,
    ...breakdown.middleNoteMatches,
    ...breakdown.baseNoteMatches,
  ];

  if (allNoteMatches.length > 0) {
    parts.push(`shares ${allNoteMatches.join(", ")} with your selection`);
  }
  if (breakdown.vibeMatches?.length > 0) {
    parts.push(`matches your ${breakdown.vibeMatches.join(", ")} vibe`);
  }
  if (breakdown.seasonMatches?.length > 0) {
    parts.push(`ideal for ${breakdown.seasonMatches.join(", ")}`);
  }
  if (breakdown.occasionMatches?.length > 0) {
    parts.push(`suits ${breakdown.occasionMatches.join(", ")}`);
  }

  if (parts.length === 0) return `${brand} ${name} is a close match based on fragrance profile.`;
  return `${brand} ${name} ${parts.join(", ")}.`;
}

// ── CLAUDE API PROMPT BUILDER ─────────────────────────────────────────
/**
 * buildMatchPrompt
 * Builds the RAG prompt to send to Claude API
 * Claude explains WHY each match fits — it doesn't do the matching
 *
 * @param {Object[]} matches     Top matches from getRecommendations
 * @param {Object}   userNotes   { top, middle, base }
 * @param {Object}   filters     { vibes, seasons, occasions }
 */
export function buildMatchPrompt(matches, userNotes, filters = {}) {
  const notesSummary = [
    userNotes.top?.length    ? `Top: ${userNotes.top.join(", ")}` : null,
    userNotes.middle?.length ? `Heart: ${userNotes.middle.join(", ")}` : null,
    userNotes.base?.length   ? `Base: ${userNotes.base.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const filtersSummary = [
    filters.vibes?.length    ? `Vibe: ${filters.vibes.join(", ")}` : null,
    filters.seasons?.length  ? `Season: ${filters.seasons.join(", ")}` : null,
    filters.occasions?.length ? `Occasion: ${filters.occasions.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const matchesSummary = matches
    .map(
      (m, i) =>
        `${i + 1}. ${m.brand} ${m.name} (${m.matchPercent}% match)
   Notes: Top=${m.topNotes.join(", ")} | Heart=${m.middleNotes.join(", ")} | Base=${m.baseNotes.join(", ")}
   Vibe: ${m.vibe.join(", ")} | Seasons: ${m.bestFor.seasons.join(", ")}`
    )
    .join("\n\n");

  return `You are a fragrance expert. A user built a custom scent profile and our algorithm found their top matches.

User's selected notes:
${notesSummary}
${filtersSummary ? `User preferences: ${filtersSummary}` : ""}

Top matches found by our algorithm:
${matchesSummary}

For each match, write a 2-sentence explanation of why it suits this user's profile. Focus on the emotional experience and scent character — not just the notes list. Be poetic but concise.

Reply ONLY in this JSON format, no extra text:
{
  "explanations": [
    { "id": 1, "name": "perfume name", "explanation": "..." },
    { "id": 2, "name": "perfume name", "explanation": "..." },
    { "id": 3, "name": "perfume name", "explanation": "..." }
  ]
}`;
}