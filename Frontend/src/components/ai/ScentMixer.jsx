import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Sparkles, X, Plus, ArrowRight,
  RotateCcw, ShoppingBag, MapPin, ChevronDown, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { perfumes, notesByFamily } from "../../data/Perfume";

// ── CONSTANTS ────────────────────────────────────────────────────────
const LAYER_CONFIG = {
  top: {
    label: "Top Notes",
    hint: "First impression — citrus, fresh, light",
    color: "rose",
    bg: "bg-rose-900/20",
    border: "border-rose-800/40",
    text: "text-rose-300",
    glow: "shadow-rose-900/40",
    blobColor: "#fda4af",
    maxNotes: 4,
  },
  middle: {
    label: "Heart Notes",
    hint: "The soul — floral, spicy, fruity",
    color: "amber",
    bg: "bg-amber-900/20",
    border: "border-amber-800/40",
    text: "text-amber-300",
    glow: "shadow-amber-900/40",
    blobColor: "#fbbf24",
    maxNotes: 4,
  },
  base: {
    label: "Base Notes",
    hint: "The foundation — woody, musky, warm",
    color: "blue",
    bg: "bg-blue-900/20",
    border: "border-blue-800/40",
    text: "text-blue-300",
    glow: "shadow-blue-900/40",
    blobColor: "#93c5fd",
    maxNotes: 4,
  },
};

const WEIGHTS = { base: 5, middle: 3, top: 2 };
const MOOD_BONUS = 3;
const SEASON_BONUS = 2;

// ── SCORING ENGINE ───────────────────────────────────────────────────
function scoreMatch(userNotes, perfume) {
  let score = 0;
  const layers = ["top", "middle", "base"];
  layers.forEach((layer) => {
    const key = layer + "Notes";
    userNotes[layer].forEach((note) => {
      if (perfume[key].includes(note)) score += WEIGHTS[layer];
    });
  });
  return score;
}

function getMatches(userNotes) {
  const allUserNotes = [
    ...userNotes.top,
    ...userNotes.middle,
    ...userNotes.base,
  ];
  if (allUserNotes.length === 0) return [];

  return perfumes
    .map((p) => {
      const raw = scoreMatch(userNotes, p);
      const totalPossible =
        userNotes.top.length * WEIGHTS.top +
        userNotes.middle.length * WEIGHTS.middle +
        userNotes.base.length * WEIGHTS.base;
      const pct = totalPossible > 0 ? Math.round((raw / totalPossible) * 100) : 0;
      return { ...p, matchScore: pct, rawScore: raw };
    })
    .filter((p) => p.rawScore > 0)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3);
}

// ── OIL BLOB SVG ANIMATION ───────────────────────────────────────────
function OilBlob({ color, size = 80, delay = 0, x = 0, y = 0 }) {
  return (
    <motion.div
  animate={{
    x: [x, x + 12, x - 8, x + 5, x],
    y: [y, y - 10, y + 8, y - 5, y],
    scale: [1, 1.08, 0.95, 1.05, 1],
    rotate: [0, 10, -8, 5, 0],
  }}
  transition={{
    duration: 4 + delay,
    repeat: Infinity,
    ease: "easeInOut",
    delay,
  }}
  className="absolute rounded-full blur-sm opacity-70 mix-blend-screen"
  style={{ width: size, height: size, backgroundColor: color }}
/>
  );
}

function MixingAnimation({ topColor, middleColor, baseColor, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center"
    >
      {/* Blobs */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <OilBlob color={topColor}    size={90}  delay={0}   x={-40} y={-40} />
        <OilBlob color={middleColor} size={110} delay={0.5} x={20}  y={10}  />
        <OilBlob color={baseColor}   size={80}  delay={1}   x={-20} y={30}  />

        {/* Central merge effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-xl"
        />

        {/* Sparkle ring */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.8, 1.4], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 1.8 }}
          className="absolute w-24 h-24 rounded-full border border-amber-400/40"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-sans text-sm text-zinc-400 tracking-widest uppercase"
      >
        Blending your scent...
      </motion.p>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }}
        className="mt-4 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        onAnimationComplete={onDone}
      />
    </motion.div>
  );
}

// ── NOTE PICKER ──────────────────────────────────────────────────────
function NotePicker({ layer, selected, onAdd, onRemove }) {
  const [search, setSearch] = useState("");
  const [openFamily, setOpenFamily] = useState(null);
  const cfg = LAYER_CONFIG[layer];

  const filtered = Object.entries(notesByFamily).reduce((acc, [fam, notes]) => {
    const match = notes.filter(
      (n) =>
        n.toLowerCase().includes(search.toLowerCase()) &&
        !selected.includes(n)
    );
    if (match.length) acc[fam] = match;
    return acc;
  }, {});

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className={`font-sans text-sm font-medium ${cfg.text}`}>{cfg.label}</h3>
        <span className="font-sans text-[10px] text-zinc-600">
          {selected.length}/{cfg.maxNotes}
        </span>
      </div>
      <p className="font-sans text-[11px] text-zinc-600 mb-4">{cfg.hint}</p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {selected.map((note) => (
              <motion.div
                key={note}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.text} text-xs font-sans`}
              >
                {note}
                <button onClick={() => onRemove(note)} className="hover:text-white transition-colors">
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Search */}
      {selected.length < cfg.maxNotes && (
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${cfg.label.toLowerCase()}...`}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 font-sans outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      )}

      {/* Note families */}
      {selected.length < cfg.maxNotes && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {Object.entries(filtered).map(([family, notes]) => (
            <div key={family}>
              <button
                onClick={() => setOpenFamily(openFamily === family ? null : family)}
                className="flex items-center justify-between w-full px-2 py-1 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <span className="font-sans text-[10px] text-zinc-500 uppercase tracking-widest capitalize">
                  {family}
                </span>
                <motion.div
                  animate={{ rotate: openFamily === family ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={11} className="text-zinc-700" />
                </motion.div>
              </button>
              <AnimatePresence>
                {(openFamily === family || search) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 px-2 py-2">
                      {notes.map((note) => (
                        <button
                          key={note}
                          onClick={() => { onAdd(note); setSearch(""); }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans border border-zinc-800 text-zinc-500 hover:${cfg.text} hover:${cfg.border} transition-all`}
                        >
                          <Plus size={9} />
                          {note}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {Object.keys(filtered).length === 0 && search && (
            <p className="font-sans text-xs text-zinc-600 px-2 py-3">No notes match "{search}"</p>
          )}
        </div>
      )}

      {selected.length >= cfg.maxNotes && (
        <p className="font-sans text-[11px] text-zinc-600 mt-2">
          Max {cfg.maxNotes} notes per layer reached.
        </p>
      )}
    </div>
  );
}

// ── MATCH CARD ───────────────────────────────────────────────────────
function MatchCard({ perfume, rank, index }) {
  const navigate = useNavigate();
  const buyUrl = `https://www.amazon.in/s?k=${encodeURIComponent(perfume.name + " " + perfume.brand)}`;
  const RANK_STYLES = [
    "border-amber-500/50 bg-amber-900/10",
    "border-zinc-600/50 bg-zinc-900/50",
    "border-orange-800/40 bg-orange-900/10",
  ];
  const RANK_LABELS = ["Best Match", "2nd Match", "3rd Match"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={`rounded-2xl border p-5 ${RANK_STYLES[rank]}`}
    >
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="w-20 h-24 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-800">
          {perfume.image ? (
            <img src={perfume.image} alt={perfume.name} className="h-20 w-auto object-contain" />
          ) : (
            <Droplets size={24} className="text-zinc-700" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] text-amber-500/70 uppercase tracking-widest">
              {RANK_LABELS[rank]}
            </span>
            <span className={`font-sans text-xs font-semibold ${rank === 0 ? "text-amber-300" : "text-zinc-400"}`}>
              {perfume.matchScore}% match
            </span>
          </div>
          <p className="font-sans text-[11px] text-zinc-500 mb-0.5">{perfume.brand}</p>
          <h3
            className="text-white text-lg font-light leading-snug mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {perfume.name}
          </h3>

          {/* Match score bar */}
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${perfume.matchScore}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              className={`h-full rounded-full ${rank === 0 ? "bg-amber-400" : "bg-zinc-500"}`}
            />
          </div>

          {/* Notes that matched */}
          <div className="flex flex-wrap gap-1 mb-3">
            {[...perfume.topNotes.slice(0, 1), ...perfume.middleNotes.slice(0, 1), ...perfume.baseNotes.slice(0, 1)].map((n) => (
              <span key={n} className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-400 font-sans">
                {n}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="font-sans text-xs text-amber-300">{perfume.rating}</span>
            <span className="font-sans text-[10px] text-zinc-600">
              ({perfume.totalVotes.toLocaleString()} votes)
            </span>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/perfume/${perfume.id}`)}
              className="px-3 py-1.5 rounded-xl border border-zinc-700 text-zinc-400 font-sans text-xs hover:border-zinc-500 hover:text-zinc-200 transition-all"
            >
              View Details
            </button>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans text-xs hover:bg-amber-500/25 transition-all"
            >
              <ShoppingBag size={10} />
              Buy
            </a>
            <button
              onClick={() => navigate(`/stores?q=${encodeURIComponent(perfume.name)}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-500 font-sans text-xs hover:text-zinc-300 hover:border-zinc-700 transition-all"
            >
              <MapPin size={10} />
              Nearby
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── PYRAMID VISUALIZER ───────────────────────────────────────────────
function PyramidVisual({ notes }) {
  const layers = [
    { key: "top",    ...LAYER_CONFIG.top,    notes: notes.top },
    { key: "middle", ...LAYER_CONFIG.middle, notes: notes.middle },
    { key: "base",   ...LAYER_CONFIG.base,   notes: notes.base },
  ];
  const totalNotes = notes.top.length + notes.middle.length + notes.base.length;

  return (
    <div className="flex flex-col items-center gap-1">
      {layers.map((layer, i) => (
        <motion.div
          key={layer.key}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: layer.notes.length > 0 ? 1 : 0.3,
            opacity: layer.notes.length > 0 ? 1 : 0.3,
          }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`flex items-center justify-center gap-2 py-2 px-4
            ${i === 0 ? "w-1/2 rounded-t-2xl" : ""}
            ${i === 1 ? "w-3/4" : ""}
            ${i === 2 ? "w-full rounded-b-2xl" : ""}
            ${layer.bg} border ${layer.border} min-h-[44px]`}
        >
          {layer.notes.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1">
              {layer.notes.map((n) => (
                <span key={n} className={`text-[10px] font-sans ${layer.text}`}>{n}</span>
              ))}
            </div>
          ) : (
            <span className="font-sans text-[10px] text-zinc-700">{layer.label}</span>
          )}
        </motion.div>
      ))}
      {totalNotes === 0 && (
        <p className="font-sans text-[10px] text-zinc-700 mt-2 text-center">
          Add notes to see your pyramid
        </p>
      )}
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────
export default function ScentMixer() {
  const [notes, setNotes] = useState({ top: [], middle: [], base: [] });
  const [mixing, setMixing] = useState(false);
  const [matches, setMatches] = useState(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  const totalNotes = notes.top.length + notes.middle.length + notes.base.length;
  const canMix = notes.top.length > 0 || notes.middle.length > 0 || notes.base.length > 0;

  function addNote(layer, note) {
    if (notes[layer].length >= LAYER_CONFIG[layer].maxNotes) return;
    setNotes((prev) => ({ ...prev, [layer]: [...prev[layer], note] }));
    setMatches(null);
  }

  function removeNote(layer, note) {
    setNotes((prev) => ({ ...prev, [layer]: prev[layer].filter((n) => n !== note) }));
    setMatches(null);
  }

  function reset() {
    setNotes({ top: [], middle: [], base: [] });
    setMatches(null);
  }

  function handleMix() {
    if (!canMix) return;
    setMixing(true);
  }

  function handleMixDone() {
    setMixing(false);
    const result = getMatches(notes);
    setMatches(result);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-sans { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
      `}</style>

      {/* Mixing animation overlay */}
      <AnimatePresence>
        {mixing && (
          <MixingAnimation
            topColor={LAYER_CONFIG.top.blobColor}
            middleColor={LAYER_CONFIG.middle.blobColor}
            baseColor={LAYER_CONFIG.base.blobColor}
            onDone={handleMixDone}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="px-6 md:px-16 pt-10 pb-6 border-b border-zinc-900">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-sans text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Droplets size={16} className="text-amber-400" />
            <span className="tracking-widest text-white font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              SCENTAI
            </span>
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 font-sans text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">
          Custom Scent Builder
        </p>
        <h1 className="text-5xl md:text-6xl font-light">Scent Mixer</h1>
        <p className="font-sans text-zinc-500 mt-3 max-w-lg">
          Select your preferred notes layer by layer. We'll find the real perfumes that best match your combination.
        </p>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="px-6 md:px-16 py-10 grid md:grid-cols-2 gap-10">

        {/* LEFT — Note Pickers */}
        <div className="space-y-4">
          <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-4">
            Build your scent profile
          </p>

          {/* Layer pickers */}
          {["top", "middle", "base"].map((layer) => (
            <NotePicker
              key={layer}
              layer={layer}
              selected={notes[layer]}
              onAdd={(note) => addNote(layer, note)}
              onRemove={(note) => removeNote(layer, note)}
            />
          ))}

          {/* Mix button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleMix}
            disabled={!canMix}
            className={`w-full py-4 rounded-2xl font-sans text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
              canMix
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <Sparkles size={16} />
            {canMix
              ? `Mix My Scent (${totalNotes} note${totalNotes !== 1 ? "s" : ""} selected)`
              : "Add at least one note to mix"}
          </motion.button>
        </div>

        {/* RIGHT — Live Pyramid + Info */}
        <div className="space-y-6">
          {/* Pyramid preview */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
            <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-5">
              Your Scent Pyramid
            </p>
            <PyramidVisual notes={notes} />
          </div>

          {/* Scoring info */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-4">
              How matching works
            </p>
            <div className="space-y-3">
              {[
                { layer: "Base Notes", weight: "50%", color: "text-blue-400", desc: "Strongest match signal" },
                { layer: "Heart Notes", weight: "30%", color: "text-amber-400", desc: "Core character match" },
                { layer: "Top Notes", weight: "20%", color: "text-rose-400", desc: "First impression match" },
              ].map(({ layer, weight, color, desc }) => (
                <div key={layer} className="flex items-center gap-3">
                  <span className={`font-sans text-xs font-semibold ${color} w-16 shrink-0`}>{weight}</span>
                  <div>
                    <p className="font-sans text-xs text-zinc-300">{layer}</p>
                    <p className="font-sans text-[10px] text-zinc-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested combos */}
          {!matches && totalNotes === 0 && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
              <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-4">
                Try these combos
              </p>
              <div className="space-y-3">
                {[
                  {
                    name: "Fresh & Clean",
                    top: ["Bergamot", "Lemon"],
                    middle: ["Jasmine"],
                    base: ["Sandalwood"],
                  },
                  {
                    name: "Dark & Seductive",
                    top: ["Cinnamon"],
                    middle: ["Rose"],
                    base: ["Vanilla", "Amber"],
                  },
                  {
                    name: "Aquatic Summer",
                    top: ["Grapefruit"],
                    middle: ["Sea Notes"],
                    base: ["Musk"],
                  },
                ].map((combo) => (
                  <button
                    key={combo.name}
                    onClick={() => {
                      setNotes({ top: combo.top, middle: combo.middle, base: combo.base });
                      setMatches(null);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs text-zinc-300 group-hover:text-white transition-colors">
                        {combo.name}
                      </span>
                      <ArrowRight size={12} className="text-zinc-700 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="font-sans text-[10px] text-zinc-600">
                      {[...combo.top, ...combo.middle, ...combo.base].join(" · ")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <AnimatePresence>
        {matches !== null && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="px-6 md:px-16 py-12 border-t border-zinc-900"
          >
            <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">
              Your Results
            </p>
            <h2 className="text-4xl font-light mb-8">
              {matches.length > 0 ? "Your Matches" : "No Close Matches"}
            </h2>

            {matches.length > 0 ? (
              <div className="grid md:grid-cols-1 gap-4 max-w-2xl">
                {matches.map((p, i) => (
                  <MatchCard key={p.id} perfume={p} rank={i} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Droplets size={40} className="text-zinc-800 mx-auto mb-4" />
                <p className="font-sans text-zinc-500 mb-2">
                  No perfumes in our database match these notes.
                </p>
                <p className="font-sans text-xs text-zinc-600 mb-6">
                  Try different notes or fewer notes per layer.
                </p>
                <button
                  onClick={reset}
                  className="px-6 py-2 rounded-xl border border-zinc-700 text-zinc-400 font-sans text-sm hover:border-zinc-500 hover:text-zinc-200 transition-all"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Mix again */}
            {matches.length > 0 && (
              <button
                onClick={reset}
                className="mt-8 flex items-center gap-2 font-sans text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <RotateCcw size={14} />
                Mix a new combination
              </button>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-16 py-8 border-t border-zinc-900 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-amber-400" />
          <span className="font-light tracking-widest text-sm text-zinc-500">SCENTAI</span>
        </div>
        <p className="font-sans text-xs text-zinc-700">AI-powered fragrance discovery</p>
      </footer>
    </div>
  );
}