import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Grid3X3, List, Sparkles, Droplets, Star
} from "lucide-react";
import PerfumeCard from "../components/perfume/PerfumeCard";
import { useNavigate } from "react-router-dom";
import { notesByFamily, moods, occasions, seasons, genders, priceCategories } from "../data/Perfume";
import { useApp } from "../context/AppContext";

// ── CONSTANTS ────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "votes", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "A → Z" },
];

const PRICE_LABEL = {
  budget: "₹ Budget",
  affordable: "₹₹ Affordable",
  "budget-designer": "₹₹ Value",
  "affordable-designer": "₹₹ Mid",
  designer: "₹₹₹ Designer",
  "designer-premium": "₹₹₹ Premium",
  luxury: "₹₹₹₹ Luxury",
  "niche-luxury": "₹₹₹₹ Niche",
  "designer-luxury": "₹₹₹₹ Elite",
};

const SEASON_EMOJI = { spring: "🌸", summer: "☀️", fall: "🍂", winter: "❄️" };

// ── SMALL HELPERS ────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-sans"
    >
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <X size={10} />
      </button>
    </motion.span>
  );
}

function SectionToggle({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-zinc-800 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="font-sans text-xs tracking-widest text-zinc-400 uppercase">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-zinc-600" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiChip({ options, active, onToggle, labelMap }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-3 py-1 rounded-full text-xs font-sans border transition-all capitalize ${
            active.includes(opt)
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
              : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
          }`}
        >
          {labelMap ? labelMap[opt] ?? opt : opt}
        </button>
      ))}
    </div>
  );
}

// ── FILTER SIDEBAR ───────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onReset, totalResults, perfumes }) {
  function toggle(key, val) {
    const current = filters[key];
    onChange(
      key,
      current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
    );
  }

  const allBrands = [...new Set(perfumes.map((p) => p.brand))].sort();

  return (
    <div className="w-64 shrink-0 sticky top-6 self-start">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-amber-400" />
            <span className="font-sans text-sm text-white font-medium">Filters</span>
          </div>
          <button onClick={onReset} className="font-sans text-xs text-zinc-500 hover:text-amber-400 transition-colors">
            Reset all
          </button>
        </div>

        <p className="font-sans text-xs text-zinc-600 mb-5">
          {totalResults} perfume{totalResults !== 1 ? "s" : ""} found
        </p>

        <SectionToggle title="Gender">
          <MultiChip options={genders} active={filters.gender} onToggle={(v) => toggle("gender", v)} />
        </SectionToggle>

        <SectionToggle title="Season">
          <MultiChip
            options={seasons}
            active={filters.seasons}
            onToggle={(v) => toggle("seasons", v)}
            labelMap={Object.fromEntries(seasons.map((s) => [s, `${SEASON_EMOJI[s]} ${s}`]))}
          />
        </SectionToggle>

        <SectionToggle title="Occasion">
          <MultiChip options={occasions} active={filters.occasions} onToggle={(v) => toggle("occasions", v)} />
        </SectionToggle>

        <SectionToggle title="Vibe">
          <MultiChip options={moods} active={filters.vibes} onToggle={(v) => toggle("vibes", v)} />
        </SectionToggle>

        <SectionToggle title="Price Range">
          <MultiChip options={priceCategories} active={filters.price} onToggle={(v) => toggle("price", v)} labelMap={PRICE_LABEL} />
        </SectionToggle>

        <SectionToggle title="Longevity">
          <MultiChip
            options={["moderate", "long lasting", "moderate-long lasting", "eternal"]}
            active={filters.longevity}
            onToggle={(v) => toggle("longevity", v)}
          />
        </SectionToggle>

        <SectionToggle title="Brand">
          <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-1">
            {allBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggle("brands", brand)}
                className={`text-left px-2 py-1 rounded-lg text-xs font-sans transition-all ${
                  filters.brands.includes(brand) ? "bg-amber-500/15 text-amber-300" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </SectionToggle>

        <SectionToggle title="Notes">
          {Object.entries(notesByFamily).map(([family, notes]) => (
            <div key={family} className="mb-3">
              <p className="font-sans text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5 capitalize">{family}</p>
              <div className="flex flex-wrap gap-1">
                {notes.slice(0, 6).map((note) => (
                  <button
                    key={note}
                    onClick={() => toggle("notes", note)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-sans border transition-all ${
                      filters.notes.includes(note)
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </SectionToggle>
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  gender: [],
  seasons: [],
  occasions: [],
  vibes: [],
  price: [],
  longevity: [],
  brands: [],
  notes: [],
};

export default function Discover() {
  const { perfumes, loading } = useApp();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("rating");
  const [view, setView] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-sans">
      Loading fragrances...
    </div>
  );

  function updateFilter(key, val) {
    setFilters((prev) => ({ ...prev, [key]: val }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  }

  const activeChips = [
    ...filters.gender.map((v) => ({ key: "gender", val: v, label: v })),
    ...filters.seasons.map((v) => ({ key: "seasons", val: v, label: `${SEASON_EMOJI[v]} ${v}` })),
    ...filters.occasions.map((v) => ({ key: "occasions", val: v, label: v })),
    ...filters.vibes.map((v) => ({ key: "vibes", val: v, label: v })),
    ...filters.price.map((v) => ({ key: "price", val: v, label: PRICE_LABEL[v] ?? v })),
    ...filters.longevity.map((v) => ({ key: "longevity", val: v, label: v })),
    ...filters.brands.map((v) => ({ key: "brands", val: v, label: v })),
    ...filters.notes.map((v) => ({ key: "notes", val: v, label: v })),
  ];

  function removeChip(key, val) {
    setFilters((prev) => ({ ...prev, [key]: prev[key].filter((v) => v !== val) }));
  }

  const results = useMemo(() => {
    let list = perfumes.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const inName = p.name.toLowerCase().includes(q);
        const inBrand = p.brand.toLowerCase().includes(q);
        const inAccords = p.accords.some((a) => a.toLowerCase().includes(q));
        const inNotes = [...p.topNotes, ...p.middleNotes, ...p.baseNotes].some((n) => n.toLowerCase().includes(q));
        if (!inName && !inBrand && !inAccords && !inNotes) return false;
      }
      if (filters.gender.length && !filters.gender.includes(p.gender)) return false;
      if (filters.seasons.length && !filters.seasons.some((s) => p.bestFor.seasons.includes(s))) return false;
      if (filters.occasions.length && !filters.occasions.some((o) => p.bestFor.occasions.includes(o))) return false;
      if (filters.vibes.length && !filters.vibes.some((v) => p.vibe.includes(v))) return false;
      if (filters.price.length && !filters.price.includes(p.priceCategory)) return false;
      if (filters.longevity.length && !filters.longevity.includes(p.longevity)) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.notes.length) {
        const all = [...p.topNotes, ...p.middleNotes, ...p.baseNotes];
        if (!filters.notes.some((n) => all.includes(n))) return false;
      }
      return true;
    });

    switch (sort) {
      case "rating":  list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "votes":   list = [...list].sort((a, b) => b.totalVotes - a.totalVotes); break;
      case "newest":  list = [...list].sort((a, b) => b.launchYear - a.launchYear); break;
      case "oldest":  list = [...list].sort((a, b) => a.launchYear - b.launchYear); break;
      case "name":    list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return list;
  }, [search, filters, sort, perfumes]);

  const hasFilters = activeChips.length > 0 || search;

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-sans { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
      `}</style>

      <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
        <div className="px-6 md:px-10 py-4 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <Droplets size={16} className="text-amber-400" />
            <span className="text-base tracking-widest text-white font-light">SCENTAI</span>
          </a>
          <div className="h-5 w-px bg-zinc-800 shrink-0" />
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-amber-600/50 transition-all">
            <Search size={14} className="text-zinc-600 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search perfumes, brands, notes..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none font-sans"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-600 hover:text-zinc-400">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-sans outline-none cursor-pointer hover:border-zinc-700 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-zinc-700 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>
              <Grid3X3 size={13} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-zinc-700 text-white" : "text-zinc-600 hover:text-zinc-400"}`}>
              <List size={13} />
            </button>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0 p-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all md:hidden">
            <SlidersHorizontal size={14} />
          </button>
        </div>

        <AnimatePresence>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 md:px-10 pb-3 flex items-center gap-2 overflow-x-auto"
            >
              <span className="font-sans text-[10px] text-zinc-600 uppercase tracking-widest shrink-0">Active:</span>
              {activeChips.map((chip) => (
                <FilterChip key={`${chip.key}-${chip.val}`} label={chip.label} onRemove={() => removeChip(chip.key, chip.val)} />
              ))}
              <button onClick={resetFilters} className="font-sans text-[10px] text-red-400 border border-red-900/40 px-2.5 py-1 rounded-full hover:bg-red-900/20 transition-colors shrink-0">
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-6 px-6 md:px-10 py-8">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="hidden md:block"
            >
              <FilterSidebar
                filters={filters}
                onChange={updateFilter}
                onReset={resetFilters}
                totalResults={results.length}
                perfumes={perfumes}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light">
                {search ? `"${search}"` : hasFilters ? "Filtered Results" : "All Fragrances"}
              </h1>
              <p className="font-sans text-sm text-zinc-500 mt-1">
                {results.length} perfume{results.length !== 1 ? "s" : ""}
                {sort === "rating" && " · sorted by rating"}
                {sort === "votes" && " · sorted by popularity"}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all font-sans text-xs"
            >
              <SlidersHorizontal size={12} />
              {sidebarOpen ? "Hide filters" : "Show filters"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col divide-y divide-zinc-900"}
              >
                {results.map((p, i) => (
                  <PerfumeCard key={p.id} perfume={p} variant={view === "list" ? "list" : "default"} index={i} onClick={() => navigate(`/perfume/${p.id}`)} />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
                <Droplets size={48} className="text-zinc-800 mb-4" />
                <h3 className="text-2xl font-light text-zinc-500 mb-2">No fragrances found</h3>
                <p className="font-sans text-sm text-zinc-600 mb-6">Try adjusting your filters or search query</p>
                <button onClick={resetFilters} className="px-6 py-2 rounded-xl border border-zinc-700 text-zinc-400 font-sans text-sm hover:border-zinc-500 hover:text-zinc-200 transition-all">
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {results.length > 0 && results.length < 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 md:mx-10 mb-8 p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center gap-4"
          >
            <Sparkles size={20} className="text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-sans text-sm text-zinc-300">Not finding what you're looking for?</p>
              <p className="font-sans text-xs text-zinc-500 mt-0.5">Let AI suggest perfumes based on your preferences.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans text-sm hover:bg-amber-500/25 transition-colors shrink-0">
              Ask AI
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}