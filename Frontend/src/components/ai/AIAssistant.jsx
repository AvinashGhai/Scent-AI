// src/components/ai/AIAssistant.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, X, Droplets,
  RotateCcw, Loader2, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatWithAssistant } from "../../services/aiService";
import { perfumes } from "../../data/Perfume";

const SUGGESTIONS = [
  "Suggest a sweet winter perfume for parties 🎉",
  "I want something fresh for the office 💼",
  "What's similar to Sauvage Elixir but cheaper?",
  "Best perfume for a first date 🌹",
  "Recommend a unisex fragrance",
  "What are base notes and why do they matter?",
];

const WELCOME = {
  role: "assistant",
  content: "Hello! I'm your ScentAI fragrance assistant 🌸\n\nTell me what you're looking for — a mood, an occasion, notes you love, or a perfume you already like — and I'll guide you to your perfect scent.",
};

// ── MESSAGE BUBBLE ────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-800/40 flex items-center justify-center shrink-0 mb-0.5">
          <Sparkles size={13} className="text-amber-400" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl font-sans text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "bg-amber-500/15 border border-amber-500/25 text-amber-50 rounded-br-sm"
            : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm"
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ── TYPING INDICATOR ──────────────────────────────────────────────────
function Typing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-800/40 flex items-center justify-center shrink-0">
        <Sparkles size={13} className="text-amber-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-zinc-500"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── FULL PAGE ─────────────────────────────────────────────────────────
export function AIAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setError(null);

    const history = messages
      .slice(1)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const reply = await chatWithAssistant(msg, history, perfumes);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError("Something went wrong. Make sure your backend is running on port 5000.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function reset() {
    setMessages([{
      role: "assistant",
      content: "Fresh start! What fragrance are you looking for today? 🌸",
    }]);
    setError(null);
    setInput("");
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white flex flex-col"
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
      <div className="shrink-0 px-6 md:px-16 py-5 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors font-sans text-sm"
          >
            <Droplets size={16} className="text-amber-400" />
            <span className="tracking-widest text-white font-light" style={{ fontFamily: "inherit" }}>
              SCENTAI
            </span>
          </button>
          <div className="h-5 w-px bg-zinc-800" />
          <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-base font-light leading-none">AI Assistant</p>
            <p className="font-sans text-[10px] text-zinc-600 mt-0.5">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 font-sans text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          <RotateCcw size={11} />
          New chat
        </button>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8 space-y-5">

        {/* Suggested prompts */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <p className="font-sans text-xs text-zinc-600 uppercase tracking-widest mb-3">
                Try asking...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => send(s)}
                    className="text-left p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-sans text-xs transition-all leading-relaxed"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg, i) => (
          <Bubble key={i} msg={msg} />
        ))}

        <AnimatePresence>{loading && <Typing />}</AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-900/40"
            >
              <p className="font-sans text-xs text-red-400 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-400">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="shrink-0 px-6 md:px-16 py-5 border-t border-zinc-900">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-amber-600/40 transition-all">
          <Droplets size={14} className="text-zinc-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about a scent, mood, or occasion..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none font-sans disabled:opacity-50"
          />
          {input && !loading && (
            <button onClick={() => setInput("")} className="text-zinc-600 hover:text-zinc-400 transition-colors">
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-xl transition-all ${
              input.trim() && !loading
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                : "text-zinc-700 cursor-not-allowed"
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="font-sans text-[10px] text-zinc-700 text-center mt-2">
          Only recommends from ScentAI's curated database · Powered by Gemini
        </p>
      </div>
    </div>
  );
}

// ── FLOATING WIDGET ───────────────────────────────────────────────────
export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! Looking for a fragrance? Tell me your mood or occasion 🌸",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, open, loading]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const reply = await chatWithAssistant(msg, history, perfumes);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Make sure the backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/50 hover:bg-amber-500/30 transition-all"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={18} className="text-amber-300" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles size={18} className="text-amber-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "420px", fontFamily: "'DM Sans', sans-serif" }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
                  <Sparkles size={11} className="text-amber-400" />
                </div>
                <span className="text-sm text-white font-medium">ScentAI</span>
                <span className="font-sans text-[10px] text-zinc-600">· Gemini</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-500/15 border border-amber-500/20 text-amber-100 rounded-br-sm"
                      : "bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                    <div className="bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-xl rounded-bl-sm flex gap-1">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <motion.div key={i} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: d }} className="w-1 h-1 rounded-full bg-zinc-500" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-3 py-3 border-t border-zinc-800 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className={`p-1.5 rounded-xl transition-all ${
                  input.trim() && !loading
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    : "text-zinc-700 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}