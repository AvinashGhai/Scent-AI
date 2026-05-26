import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Droplets, Wind, Flame, Leaf, Heart } from "lucide-react";

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

const LONGEVITY_COLOR = {
  "moderate": "text-yellow-500",
  "long lasting": "text-green-500",
  "moderate-long lasting": "text-lime-500",
  "eternal": "text-emerald-400",
  "long lasting-eternal": "text-emerald-400",
};

const SILLAGE_DOTS = {
  "light": 1,
  "moderate": 2,
  "moderate-strong": 3,
  "strong": 4,
  "strong-enormous": 5,
  "enormous": 5,
};

// How many filled dots to show for sillage
function SillageDots({ sillage }) {
  const count = SILLAGE_DOTS[sillage] ?? 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < count ? "bg-amber-400" : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

// The 3 preview notes (one from each layer)
function NotesPyramidPreview({ topNotes, middleNotes, baseNotes }) {
  const layers = [
    { label: "T", note: topNotes[0], color: "text-rose-300 bg-rose-900/20 border-rose-800/30" },
    { label: "M", note: middleNotes[0], color: "text-amber-300 bg-amber-900/20 border-amber-800/30" },
    { label: "B", note: baseNotes[0], color: "text-blue-300 bg-blue-900/20 border-blue-800/30" },
  ];
  return (
    <div className="flex flex-col gap-1">
      {layers.map(({ label, note, color }) =>
        note ? (
          <div key={label} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-sans ${color}`}>
            <span className="opacity-50 font-medium">{label}</span>
            <span className="truncate">{note}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

// ── CARD VARIANTS ────────────────────────────────────────────────────

// Default card — used in grids
function DefaultCard({ perfume, onClick, onWishlist, wishlisted, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-zinc-900 border transition-all duration-500 ${
          hovered ? "border-amber-700/50 shadow-xl shadow-amber-950/30" : "border-zinc-800"
        }`}
      >
        {/* ── Image ── */}
        <div className="relative h-56 bg-zinc-950 flex items-center justify-center overflow-hidden">
          {perfume.image ? (
            <motion.img
              src={perfume.image}
              alt={perfume.name}
              className="h-48 w-auto object-contain drop-shadow-2xl"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20">
              <Droplets size={36} className="text-amber-400" />
              <span className="font-sans text-[10px] text-zinc-500">{perfume.brand}</span>
            </div>
          )}

          {/* Fade to card bg */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-900 to-transparent" />

          {/* Gender badge */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] rounded-full bg-zinc-900/90 text-zinc-500 border border-zinc-800 font-sans uppercase tracking-widest">
            {perfume.gender} · {perfume.type}
          </span>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.stopPropagation(); onWishlist?.(); }}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 transition-all hover:border-rose-700/50"
          >
            <Heart
              size={12}
              className={wishlisted ? "text-rose-400 fill-rose-400" : "text-zinc-600"}
            />
          </button>
        </div>

        {/* ── Info ── */}
        <div className="p-3.5">
          {/* Brand */}
          <p className="font-sans text-[10px] tracking-widest text-amber-500/60 uppercase mb-0.5">
            {perfume.brand}
          </p>

          {/* Name */}
          <h3
            className="text-white text-base leading-snug mb-2.5 font-light line-clamp-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {perfume.name}
          </h3>

          {/* Notes preview */}
          <NotesPyramidPreview
            topNotes={perfume.topNotes}
            middleNotes={perfume.middleNotes}
            baseNotes={perfume.baseNotes}
          />

          {/* Divider */}
          <div className="my-3 border-t border-zinc-800" />

          {/* Bottom meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="font-sans text-[11px] text-amber-300">{perfume.rating}</span>
              <span className="font-sans text-[10px] text-zinc-600 ml-0.5">
                ({perfume.totalVotes.toLocaleString()})
              </span>
            </div>
            <span className="font-sans text-[10px] text-zinc-500">
              {PRICE_LABEL[perfume.priceCategory] ?? perfume.priceCategory}
            </span>
          </div>
        </div>

        {/* ── Hover overlay CTA ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent"
            >
              <button className="w-full py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-sans tracking-wide hover:bg-amber-500/25 transition-colors">
                View Details →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Compact card — used in horizontal scroll / trending row
function CompactCard({ perfume, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="flex-shrink-0 w-36 cursor-pointer"
    >
      <div className={`rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 ${hovered ? "border-amber-700/40" : "border-zinc-800"}`}>
        <div className="h-40 bg-zinc-950 flex items-center justify-center overflow-hidden">
          {perfume.image ? (
            <motion.img
              src={perfume.image}
              alt={perfume.name}
              className="h-32 w-auto object-contain"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <Droplets size={24} className="text-zinc-700" />
          )}
        </div>
        <div className="p-2.5">
          <p className="font-sans text-[9px] text-amber-500/60 tracking-widest uppercase truncate">{perfume.brand}</p>
          <p className="text-white text-sm font-light leading-tight truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{perfume.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={9} className="text-amber-400 fill-amber-400" />
            <span className="font-sans text-[10px] text-amber-300">{perfume.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Horizontal list card — used in search results list view
function ListCard({ perfume, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
        hovered ? "bg-zinc-900 border-zinc-700" : "border-transparent"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-800">
        {perfume.image ? (
          <img src={perfume.image} alt={perfume.name} className="h-12 w-auto object-contain" />
        ) : (
          <Droplets size={18} className="text-zinc-700" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[10px] text-amber-500/60 tracking-widest uppercase">{perfume.brand}</p>
        <p className="text-white text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{perfume.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <SillageDots sillage={perfume.sillage} />
          <span className={`font-sans text-[10px] ${LONGEVITY_COLOR[perfume.longevity] ?? "text-zinc-500"}`}>
            {perfume.longevity}
          </span>
        </div>
      </div>

      {/* Right meta */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="font-sans text-xs text-amber-300">{perfume.rating}</span>
        </div>
        <span className="font-sans text-[10px] text-zinc-600">{perfume.type}</span>
      </div>
    </motion.div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
// variant: "default" | "compact" | "list"
export default function PerfumeCard({
  perfume,
  variant = "default",
  index = 0,
  onClick,
  onWishlist,
  wishlisted = false,
}) {
  if (!perfume) return null;

  if (variant === "compact") return <CompactCard perfume={perfume} onClick={onClick} index={index} />;
  if (variant === "list") return <ListCard perfume={perfume} onClick={onClick} index={index} />;
  return (
    <DefaultCard
      perfume={perfume}
      onClick={onClick}
      onWishlist={onWishlist}
      wishlisted={wishlisted}
      index={index}
    />
  );
}