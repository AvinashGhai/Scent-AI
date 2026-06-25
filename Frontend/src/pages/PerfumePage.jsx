import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, Heart, Share2, ShoppingBag,
  Droplets, Sparkles,
  Clock, Volume2, ChevronRight
} from "lucide-react";
import PerfumeCard from "../components/perfume/PerfumeCard";
import { perfumes } from "../data/Perfume";
import { getSimilarPerfumes } from "../services/recommendationEngine"

const SEASON_EMOJI = { spring: "🌸", summer: "☀️", fall: "🍂", winter: "❄️" };

const LONGEVITY_STEPS = [
  "weak", "moderate", "moderate-long lasting", "long lasting",
  "long lasting-eternal", "eternal"
];

const SILLAGE_STEPS = [
  "light", "moderate", "moderate-strong", "strong", "strong-enormous", "enormous"
];

const NOTE_LAYER_CONFIG = {
  top: {
    label: "Top Notes",
    sub: "First impression · 0–30 min",
    color: "rose",
    bg: "bg-rose-900/20",
    border: "border-rose-800/30",
    text: "text-rose-300",
    dot: "bg-rose-400",
    width: "w-1/2",
  },
  middle: {
    label: "Heart Notes",
    sub: "The soul of the scent · 30 min–4 hrs",
    color: "amber",
    bg: "bg-amber-900/20",
    border: "border-amber-800/30",
    text: "text-amber-300",
    dot: "bg-amber-400",
    width: "w-3/4",
  },
  base: {
    label: "Base Notes",
    sub: "The lasting trail · 4+ hrs",
    color: "blue",
    bg: "bg-blue-900/20",
    border: "border-blue-800/30",
    text: "text-blue-300",
    dot: "bg-blue-400",
    width: "w-full",
  },
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

function ScaleBar({ steps, value, color }) {
  const idx = steps.findIndex((s) => s === value);
  const pct = idx === -1 ? 0 : Math.round(((idx + 1) / steps.length) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between font-sans text-[10px] text-zinc-600 mb-1">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-${color}-400`}
        />
      </div>
      <p className={`font-sans text-xs mt-1 text-${color}-400 capitalize`}>{value}</p>
    </div>
  );
}

function ScentPyramid({ topNotes, middleNotes, baseNotes }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const layers = [
    { key: "top",    notes: topNotes,    ...NOTE_LAYER_CONFIG.top },
    { key: "middle", notes: middleNotes, ...NOTE_LAYER_CONFIG.middle },
    { key: "base",   notes: baseNotes,   ...NOTE_LAYER_CONFIG.base },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-0 mb-6">
        {layers.map((layer, li) => (
          <motion.div
            key={layer.key}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: li * 0.15, ease: "easeOut" }}
            onClick={() => setActiveLayer(activeLayer === layer.key ? null : layer.key)}
            className={`cursor-pointer ${layer.width} py-3 px-4 flex items-center justify-center gap-2
              ${layer.bg} border ${layer.border} transition-all duration-300
              ${li === 0 ? "rounded-t-2xl" : ""}
              ${li === layers.length - 1 ? "rounded-b-2xl" : ""}
              ${activeLayer === layer.key ? "brightness-125" : "hover:brightness-110"}
            `}
          >
            <span className={`font-sans text-xs font-medium ${layer.text}`}>{layer.label}</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {layer.notes.map((n) => (
                <span key={n} className={`px-2 py-0.5 rounded-full text-[10px] font-sans ${layer.bg} ${layer.text} border ${layer.border}`}>
                  {n}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeLayer && (() => {
          const layer = layers.find((l) => l.key === activeLayer);
          return (
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-2xl ${layer.bg} border ${layer.border}`}
            >
              <p className={`font-sans text-xs font-semibold ${layer.text} mb-0.5`}>{layer.label}</p>
              <p className="font-sans text-[10px] text-zinc-500 mb-3">{layer.sub}</p>
              <div className="flex flex-wrap gap-2">
                {layer.notes.map((n, i) => (
                  <motion.span
                    key={n}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-3 py-1 rounded-full text-xs font-sans ${layer.bg} ${layer.text} border ${layer.border}`}
                  >
                    {n}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function AccordBars({ accords }) {
  return (
    <div className="space-y-2">
      {accords.map((accord, i) => {
        const pct = Math.max(30, 100 - i * 8);
        return (
          <div key={accord} className="flex items-center gap-3">
            <span className="font-sans text-xs text-zinc-400 w-24 shrink-0 capitalize">{accord}</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              />
            </div>
            <span className="font-sans text-[10px] text-zinc-600 w-6 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PerfumePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const perfume = perfumes.find((p) => p.id === Number(id));
  const similar = getSimilarPerfumes(perfume, 4);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!perfume) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Droplets size={40} className="text-zinc-700" />
        <p className="font-sans text-zinc-500">Perfume not found.</p>
        <button onClick={() => navigate("/discover")} className="font-sans text-sm text-amber-400 hover:text-amber-300">
          ← Back to Discover
        </button>
      </div>
    );
  }

  const buyUrl = `https://www.amazon.in/s?k=${encodeURIComponent(perfume.name + " " + perfume.brand)}`;
  const sephUrl = `https://www.sephora.com/search?keyword=${encodeURIComponent(perfume.name)}`;

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: perfume.name,
        text: `Check out ${perfume.name} by ${perfume.brand} on ScentAI`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

      <div className="relative min-h-[70vh] flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-900/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-rose-900/8 blur-3xl" />
        </div>

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm text-zinc-400 font-sans text-sm hover:text-white hover:border-zinc-600 transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </motion.button>

        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="relative p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <Share2 size={14} />
            {copied && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-sans text-[10px] text-green-400 whitespace-nowrap bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={() => setWishlisted(!wishlisted)}
            className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all ${
              wishlisted
                ? "bg-rose-900/30 border-rose-700/50 text-rose-400"
                : "bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-rose-400"
            }`}
          >
            <Heart size={14} className={wishlisted ? "fill-rose-400" : ""} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 flex-1 px-6 md:px-16 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative shrink-0"
          >
            <div className="relative w-56 h-72 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-900/20 blur-2xl scale-75" />
              {perfume.image ? (
                <motion.img
                  src={perfume.image}
                  alt={perfume.name}
                  onLoad={() => setImageLoaded(true)}
                  animate={imageLoaded ? { y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 h-64 w-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-3 opacity-30">
                  <Droplets size={64} className="text-amber-400" />
                  <span className="font-sans text-sm text-zinc-500">{perfume.brand}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans text-xs tracking-widest text-amber-500/70 uppercase">{perfume.brand}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-sans text-xs text-zinc-600">{perfume.type}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="font-sans text-xs text-zinc-600 capitalize">{perfume.gender}</span>
              {perfume.launchYear && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="font-sans text-xs text-zinc-600">{perfume.launchYear}</span>
                </>
              )}
            </div>

            <h1 className="text-5xl md:text-6xl font-light leading-tight mb-4">{perfume.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(perfume.rating) ? "text-amber-400 fill-amber-400" : "text-zinc-700"}
                  />
                ))}
                <span className="font-sans text-sm text-amber-300 ml-1">{perfume.rating}</span>
              </div>
              <span className="font-sans text-xs text-zinc-600">{perfume.totalVotes.toLocaleString()} ratings</span>
              {perfume.reviews > 0 && (
                <span className="font-sans text-xs text-zinc-600">· {perfume.reviews.toLocaleString()} reviews</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {perfume.vibe.map((v) => (
                <span key={v} className="px-3 py-1 rounded-full text-xs font-sans bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
                  {v}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-zinc-600" />
                <span className="font-sans text-xs text-zinc-500">{perfume.bestFor.time.join(", ")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {perfume.bestFor.seasons.map((s) => (
                  <span key={s} className="font-sans text-xs text-zinc-500">{SEASON_EMOJI[s]}</span>
                ))}
                <span className="font-sans text-xs text-zinc-500 capitalize">{perfume.bestFor.seasons.join(", ")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-xs text-zinc-500 capitalize">
                  {perfume.bestFor.occasions.slice(0, 2).join(", ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans text-sm hover:bg-amber-500/30 transition-all"
              >
                <ShoppingBag size={14} />
                Buy on Amazon
              </a>

              <a
                href={sephUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-700 text-zinc-400 font-sans text-sm hover:border-zinc-500 hover:text-zinc-200 transition-all"
              >
                Sephora
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-y border-zinc-900 px-6 md:px-16">
        <div className="flex gap-6">
          {["notes", "accords", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-4 font-sans text-sm capitalize transition-colors ${
                activeTab === tab ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 inset-x-0 h-px bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-16 py-12">
        <AnimatePresence mode="wait">
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-12"
            >
              <div>
                <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Fragrance Pyramid</p>
                <h2 className="text-3xl font-light mb-8">The Notes</h2>
                <ScentPyramid topNotes={perfume.topNotes} middleNotes={perfume.middleNotes} baseNotes={perfume.baseNotes} />
              </div>
              <div>
                <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Performance</p>
                <h2 className="text-3xl font-light mb-8">How It Wears</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-amber-400" />
                      <span className="font-sans text-sm text-zinc-300">Longevity</span>
                    </div>
                    <ScaleBar steps={LONGEVITY_STEPS} value={perfume.longevity} color="amber" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 size={14} className="text-blue-400" />
                      <span className="font-sans text-sm text-zinc-300">Sillage (Projection)</span>
                    </div>
                    <ScaleBar steps={SILLAGE_STEPS} value={perfume.sillage} color="blue" />
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-3">Best worn</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ...perfume.bestFor.seasons.map((s) => `${SEASON_EMOJI[s]} ${s}`),
                        ...perfume.bestFor.time,
                        ...perfume.bestFor.occasions,
                      ].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-sans bg-zinc-800 text-zinc-400 capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "accords" && (
            <motion.div
              key="accords"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-lg"
            >
              <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Scent Character</p>
              <h2 className="text-3xl font-light mb-8">Main Accords</h2>
              <AccordBars accords={perfume.accords} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">Details</p>
                <h2 className="text-3xl font-light mb-6">Full Profile</h2>
                {[
                  { label: "Brand", value: perfume.brand },
                  { label: "Name", value: perfume.name },
                  { label: "Type", value: perfume.type },
                  { label: "Gender", value: perfume.gender },
                  { label: "Launch Year", value: perfume.launchYear ?? "Unknown" },
                  { label: "Price Range", value: PRICE_LABEL[perfume.priceCategory] ?? perfume.priceCategory },
                  { label: "Longevity", value: perfume.longevity },
                  { label: "Sillage", value: perfume.sillage },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-zinc-900">
                    <span className="font-sans text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
                    <span className="font-sans text-sm text-zinc-300 capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">AI</p>
                <h2 className="text-3xl font-light mb-6">Ask About This</h2>
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <Sparkles size={20} className="text-amber-400 mb-3" />
                  <p className="font-sans text-sm text-zinc-400 mb-4">
                    Want to know if this suits your skin, style, or occasion? Ask the AI assistant.
                  </p>
                  <div className="space-y-2">
                    {[
                      `Is ${perfume.name} good for office?`,
                      `What's similar to ${perfume.name} but cheaper?`,
                      `Best season to wear ${perfume.name}?`,
                    ].map((q) => (
                      <button
                        key={q}
                        className="w-full text-left px-3 py-2 rounded-xl border border-zinc-800 text-zinc-500 font-sans text-xs hover:border-zinc-700 hover:text-zinc-300 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans text-sm hover:bg-amber-500/25 transition-colors">
                    <Sparkles size={12} className="inline mr-2" />
                    Open AI Assistant
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {similar.length > 0 && (
        <section className="px-6 md:px-16 py-12 border-t border-zinc-900">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-sans text-xs tracking-widest text-amber-500/70 uppercase mb-2">You May Also Like</p>
              <h2 className="text-3xl font-light">Similar Fragrances</h2>
            </div>
            <button
              onClick={() => navigate("/discover")}
              className="flex items-center gap-1 font-sans text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Explore all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p, i) => (
              <PerfumeCard key={p.id} perfume={p} index={i} onClick={() => navigate(`/perfume/${p.id}`)} />
            ))}
          </div>
        </section>
      )}

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