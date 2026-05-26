import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Sparkles, Wind, Flame, Leaf, Star, ChevronRight, MapPin, Clock, Droplets } from "lucide-react";
import { perfumes, moods, occasions, seasons } from "../data/Perfume";

const MOOD_ICONS = {
  fresh: <Wind size={16} />,
  seductive: <Flame size={16} />,
  cozy: <Droplets size={16} />,
  bold: <Flame size={16} />,
  elegant: <Star size={16} />,
  playful: <Leaf size={16} />,
  mysterious: <Sparkles size={16} />,
  luxurious: <Star size={16} />,
  clean: <Wind size={16} />,
  sweet: <Droplets size={16} />,
};

const SEASON_GRADIENT = {
  spring: "from-rose-900/40 to-pink-900/20",
  summer: "from-amber-900/40 to-orange-900/20",
  fall: "from-orange-900/40 to-red-900/20",
  winter: "from-blue-900/40 to-indigo-900/20",
};

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

function PerfumeCard({ perfume, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group cursor-pointer"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-500 group-hover:border-amber-700/50">
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-zinc-950 flex items-center justify-center">
          {perfume.image ? (
            <motion.img
              src={perfume.image}
              alt={perfume.name}
              className="h-56 w-auto object-contain"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Droplets size={40} className="text-amber-400" />
              <span className="text-xs text-zinc-500 font-sans">{perfume.brand}</span>
            </div>
          )}

          {/* Overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"
            animate={{ opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
          />

          {/* Gender badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800/90 text-zinc-400 border border-zinc-700 font-sans uppercase tracking-widest">
              {perfume.gender}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-900/90 px-2 py-0.5 rounded-full border border-zinc-700">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] text-amber-300 font-sans">{perfume.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-xs text-amber-500/70 font-sans tracking-widest uppercase mb-1">
            {perfume.brand}
          </div>
          <h3 className="text-white text-lg leading-tight mb-2 font-light">{perfume.name}</h3>

          {/* Notes preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {[...perfume.topNotes.slice(0, 1), ...perfume.middleNotes.slice(0, 1), ...perfume.baseNotes.slice(0, 1)].map((note) => (
              <span key={note} className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded-full font-sans">
                {note}
              </span>
            ))}
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-sans">{PRICE_LABEL[perfume.priceCategory] || perfume.priceCategory}</span>
            <span className="text-xs text-zinc-600 font-sans">{perfume.type}</span>
          </div>
        </div>

        {/* Hover CTA */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-amber-900/80 to-transparent p-4 pt-8"
            >
              <button className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-sans tracking-wide hover:bg-amber-500/30 transition-colors">
                View Details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MoodChip({ mood, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all duration-300 font-sans ${
        active
          ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
      }`}
    >
      {MOOD_ICONS[mood]}
      <span className="capitalize">{mood}</span>
    </motion.button>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeMood, setActiveMood] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -60]);

  // Filter perfumes
  const filtered = perfumes.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.accords.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      [...p.topNotes, ...p.middleNotes, ...p.baseNotes].some((n) =>
        n.toLowerCase().includes(search.toLowerCase())
      );
    const matchMood = !activeMood || p.vibe.includes(activeMood);
    const matchSeason = !activeSeason || p.bestFor.seasons.includes(activeSeason);
    return matchSearch && matchMood && matchSeason;
  });

  // Trending = top rated with 1000+ votes
  const trending = [...perfumes]
    .filter((p) => p.totalVotes > 1000)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // Seasonal picks
  const currentSeason = activeSeason || "winter";
  const seasonalPicks = perfumes
    .filter((p) => p.bestFor.seasons.includes(currentSeason))
    .slice(0, 4);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      {/* Google Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-sans { font-family: 'DM Sans', sans-serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
      `}</style>

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-900/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-rose-900/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-zinc-900/50 blur-3xl" />
          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 inset-x-0 flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-amber-400" />
            <span className="text-xl tracking-widest text-white font-light">SCENTAI</span>
          </div>
          <div className="flex items-center gap-6 font-sans text-sm text-zinc-500">
            <a href="#discover" className="hover:text-zinc-200 transition-colors">Discover</a>
            <a href="#mix" className="hover:text-zinc-200 transition-colors">Mix Scents</a>
            <button className="px-4 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-amber-600/50 hover:text-amber-300 transition-all">
              Find Stores
            </button>
          </div>
        </motion.nav>

        {/* Hero text */}
        <div className="text-center max-w-3xl relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sans text-xs tracking-[0.4em] text-amber-500/70 uppercase mb-6"
          >
            AI-Powered Fragrance Discovery
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-6xl md:text-8xl font-light leading-none tracking-tight mb-6"
          >
            Find Your
            <span className="block italic text-amber-300/90">Signature</span>
            Scent
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-sans text-zinc-400 text-lg mb-12 font-light"
          >
            Describe your mood, occasion, or preferred notes —<br />
            let AI guide you to your perfect fragrance.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className={`relative max-w-xl mx-auto transition-all duration-300 ${
              searchFocused ? "scale-105" : ""
            }`}
          >
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 ${
              searchFocused
                ? "border-amber-500/50 shadow-lg shadow-amber-900/20"
                : "border-zinc-800"
            }`}>
              <Search size={18} className="text-zinc-500 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search by note, brand, mood..."
                className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none font-sans text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors font-sans text-xs"
                >
                  Clear
                </button>
              )}
              <button className="px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-sans hover:bg-amber-500/30 transition-colors">
                Search
              </button>
            </div>
          </motion.div>

          {/* Quick mood pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["fresh", "seductive", "cozy", "elegant", "bold"].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMood(activeMood === m ? null : m)}
                className={`px-3 py-1 rounded-full text-xs font-sans border transition-all ${
                  activeMood === m
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {m}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[10px] tracking-widest text-zinc-600 uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent"
          />
        </motion.div>
      </motion.section>

      {/* ── SEASON FILTER ── */}
      <section className="px-6 md:px-16 py-8 border-b border-zinc-900">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="font-sans text-xs text-zinc-600 uppercase tracking-widest shrink-0">Season</span>
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSeason(activeSeason === s ? null : s)}
              className={`px-4 py-1.5 rounded-full text-sm font-sans border transition-all shrink-0 capitalize ${
                activeSeason === s
                  ? "bg-zinc-800 border-zinc-600 text-white"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "spring" ? "🌸" : s === "summer" ? "☀️" : s === "fall" ? "🍂" : "❄️"} {s}
            </button>
          ))}
          <div className="h-4 w-px bg-zinc-800 shrink-0" />
          <span className="font-sans text-xs text-zinc-600 uppercase tracking-widest shrink-0">Mood</span>
          {moods.slice(0, 5).map((m) => (
            <MoodChip
              key={m}
              mood={m}
              active={activeMood === m}
              onClick={() => setActiveMood(activeMood === m ? null : m)}
            />
          ))}
          {(activeMood || activeSeason || search) && (
            <button
              onClick={() => { setActiveMood(null); setActiveSeason(null); setSearch(""); }}
              className="px-3 py-1.5 rounded-full text-xs font-sans text-red-400 border border-red-900/50 hover:bg-red-900/20 transition-colors shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* ── TRENDING ── */}
      {!search && !activeMood && !activeSeason && (
        <section className="px-6 md:px-16 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Community Favorites</p>
              <h2 className="text-4xl font-light">Trending Now</h2>
            </div>
            <button className="flex items-center gap-1 font-sans text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trending.map((p, i) => (
              <PerfumeCard key={p.id} perfume={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── SEARCH RESULTS / FILTERED ── */}
      {(search || activeMood || activeSeason) && (
        <section className="px-6 md:px-16 py-16">
          <div className="mb-10">
            <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">
              {filtered.length} results
            </p>
            <h2 className="text-4xl font-light">
              {search ? `"${search}"` : activeMood ? `${activeMood} fragrances` : `${activeSeason} picks`}
            </h2>
          </div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <PerfumeCard key={p.id} perfume={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Droplets size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="font-sans text-zinc-500">No fragrances match your search.</p>
              <button
                onClick={() => { setSearch(""); setActiveMood(null); setActiveSeason(null); }}
                className="mt-4 font-sans text-sm text-amber-500 hover:text-amber-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── SEASONAL PICKS ── */}
      {!search && !activeMood && !activeSeason && (
        <section className="px-6 md:px-16 py-16 border-t border-zinc-900">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Right Now</p>
              <h2 className="text-4xl font-light">Winter Picks</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seasonalPicks.map((p, i) => (
              <PerfumeCard key={p.id} perfume={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── AI ASSISTANT CTA ── */}
      {!search && !activeMood && !activeSeason && (
        <section className="px-6 md:px-16 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 p-12 text-center"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-900/20 blur-3xl" />
            </div>
            <Sparkles size={32} className="text-amber-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-light mb-4">
              Not sure where to start?
            </h2>
            <p className="font-sans text-zinc-400 mb-8 max-w-lg mx-auto">
              Tell our AI what you're looking for — a mood, occasion, or even a perfume you already love.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-8 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans hover:bg-amber-500/30 transition-all">
                <Sparkles size={14} className="inline mr-2" />
                Ask AI Assistant
              </button>
              <button className="px-8 py-3 rounded-2xl border border-zinc-700 text-zinc-400 font-sans hover:border-zinc-500 hover:text-zinc-200 transition-all">
                <Droplets size={14} className="inline mr-2" />
                Build My Scent
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-16 py-8 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-amber-400" />
          <span className="font-light tracking-widest text-sm text-zinc-500">SCENTAI</span>
        </div>
        <p className="font-sans text-xs text-zinc-700">AI-powered fragrance discovery</p>
      </footer>
    </div>
  );
}