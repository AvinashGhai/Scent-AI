import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { smartRecommend } from "../../services/aiService";

export default function AIRecommendationBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await smartRecommend(query);
      setResults(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── HEADER ── */}
      <div className="px-6 md:px-16 py-5 border-b border-zinc-900 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors font-sans text-sm"
        >
          <Droplets size={16} className="text-amber-400" />
          <span className="tracking-widest text-white font-light">SCENTAI</span>
        </button>
        <div className="h-5 w-px bg-zinc-800" />
        <span className="font-sans text-sm text-zinc-500">AI Fragrance Concierge</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="font-sans text-xs tracking-[0.4em] text-amber-500/70 uppercase mb-4">
            AI Fragrance Concierge
          </p>
          <h1 className="text-4xl md:text-5xl font-light">
            Describe what you're <span className="italic text-amber-300/90">looking for</span>
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-3 mb-12">
          <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 focus-within:border-amber-500/50 transition-all">
            <Search size={16} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. something smoky for winter nights"
              className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none font-sans text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans text-sm hover:bg-amber-500/30 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </form>

        {error && (
          <p className="font-sans text-sm text-red-400 text-center mb-8">{error}</p>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16 text-zinc-500"
            >
              <Sparkles size={24} className="text-amber-400 mb-3 animate-pulse" />
              <p className="font-sans text-sm">Finding your perfect match...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {results.map((perfume, i) => (
            <motion.div
              key={perfume._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all"
            >
              {perfume.image ? (
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-28 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Droplets size={20} className="text-zinc-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-xl font-light text-white">{perfume.name}</h3>
                  <span className="font-sans text-[10px] text-amber-500/70 shrink-0 ml-3">
                    {Math.round(perfume.score * 100)}% match
                  </span>
                </div>
                <p className="font-sans text-xs text-zinc-500 mb-3">{perfume.brand}</p>
                {perfume.explanation && (
                  <p className="font-sans text-sm text-zinc-400 leading-relaxed">{perfume.explanation}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <Droplets size={40} className="text-zinc-800 mx-auto mb-4" />
            <p className="font-sans text-zinc-500">No matches found — try describing it differently.</p>
          </div>
        )}
      </div>
    </div>
  );
}