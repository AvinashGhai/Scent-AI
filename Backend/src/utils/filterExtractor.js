const GENDER_MALE_WORDS = ["male", "for men", "for him", "masculine", "men's"];
const GENDER_FEMALE_WORDS = ["female", "for women", "for her", "feminine", "women's"];
const GENDER_UNISEX_WORDS = ["unisex", "gender neutral", "gender-neutral"];

const PRICE_BUDGET_WORDS = ["budget", "cheap", "affordable", "inexpensive", "low cost", "low-cost", "pocket friendly"];
const PRICE_LUXURY_WORDS = ["luxury", "premium", "expensive", "high-end", "high end"];

function extractFilters(query) {
  const q = query.toLowerCase();
  const filters = {};

  if (GENDER_UNISEX_WORDS.some((w) => q.includes(w))) {
    filters.gender = "unisex";
  } else if (GENDER_MALE_WORDS.some((w) => q.includes(w))) {
    filters.gender = "male";
  } else if (GENDER_FEMALE_WORDS.some((w) => q.includes(w))) {
    filters.gender = "female";
  }

  if (PRICE_BUDGET_WORDS.some((w) => q.includes(w))) {
    filters.priceTier = "budget";
  } else if (PRICE_LUXURY_WORDS.some((w) => q.includes(w))) {
    filters.priceTier = "luxury";
  }

  return filters;
}

module.exports = { extractFilters };