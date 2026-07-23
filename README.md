# ScentAI 🌸

An AI-powered fragrance discovery platform that helps you find your perfect scent through semantic search, explainable RAG-based recommendations, a conversational AI assistant, and a custom scent-mixing tool.

---

## What It Does

- **Discover** — Browse and filter fragrances by gender, season, occasion, vibe, price, longevity, brand, and notes
- **Smart Recommend** — Natural-language search ("something warm and woody for a winter date") powered by vector similarity search + RAG explanations for each result
- **AI Assistant** — Chat with a Groq-powered (Llama 3.3 70B) assistant that recommends perfumes from the live database based on mood, occasion, or preference
- **Scent Mixer** — Build a custom note pyramid (top, heart, base) and get AI-suggested complementary notes
- **Compare** — Side-by-side AI-generated comparison of two perfumes across freshness, longevity, versatility, and uniqueness
- **Perfume Pages** — Detailed pages with scent pyramids, accord breakdowns, and performance ratings

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- React Router

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose (native `$vectorSearch`)
- HuggingFace `sentence-transformers/all-MiniLM-L6-v2` for embeddings
- Groq API (Llama 3.3 70B Versatile) for RAG explanations, chat, and comparisons

---

## Project Structure

```
Scent-AI/
├── Backend/
│   ├── server.js                  # Express entry point
│   └── src/
│       ├── config/db.js           # MongoDB connection
│       ├── controllers/
│       │   ├── perfumeController.js   # CRUD, search, semantic search, compare
│       │   └── aiController.js        # chat, explain, suggest-notes
│       ├── routes/
│       │   ├── perfumeRoutes.js
│       │   └── aiRoutes.js
│       ├── services/
│       │   ├── embeddingService.js    # HuggingFace embedding calls
│       │   ├── vectorSearch.js        # $vectorSearch aggregation + filters
│       │   ├── ragService.js          # Groq explanations & comparisons
│       │   └── seedService.js         # DB seed data
│       ├── scripts/
│       │   ├── generateEmbeddings.js  # Backfills embeddings for perfumes
│       │   └── evaluateSearch.js      # Search quality evaluation
│       ├── models/Perfume.js
│       ├── middleware/                # errorHandler, notFound
│       ├── utils/filterExtractor.js   # Parses gender/price filters from query text
│       └── data/expandedPerfumes.js   # Perfume dataset
│
└── Frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Discover.jsx
        │   └── PerfumePage.jsx
        ├── components/
        │   ├── ai/
        │   │   ├── AIAssistant.jsx        # Chat widget + full-page assistant
        │   │   ├── AIRecommendationBox.jsx # Smart search UI
        │   │   └── ScentMixer.jsx         # Note pyramid builder
        │   ├── perfume/
        │   ├── filters/
        │   └── common/
        ├── context/AppContext.jsx     # Global perfume state
        ├── services/
        │   ├── aiService.js           # Calls /api/ai/* endpoints
        │   └── recommendationEngine.js # Client-side weighted scoring
        └── data/expandedPerfumes.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account with a `$vectorSearch` index named `perfume_vector_index` on the `embedding` field
- Groq API key ([console.groq.com](https://console.groq.com))
- HuggingFace API token (for embeddings)

### Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scentai
GROQ_API_KEY=your_groq_api_key
HF_API_TOKEN=your_huggingface_api_token
PORT=8000
```

Seed the database:
```bash
node src/services/seedService.js
```

Generate embeddings for semantic/smart search:
```bash
node src/scripts/generateEmbeddings.js
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the app:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

### Perfumes — `/api/perfumes`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all perfumes (query filters: `gender`, `season`, `occasion`, `priceCategory`) |
| GET | `/search?q=` | Regex search by name, brand, accords, vibe |
| POST | `/semantic-search` | Vector similarity search by natural-language query |
| POST | `/smart-recommend` | Vector search + Groq-generated explanation & downside per result |
| POST | `/compare` | AI comparison of two perfumes by `idA` / `idB` |

### AI — `/api/ai`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Conversational assistant (`message`, `history`, `perfumeData`) |
| POST | `/explain` | Poetic explanation for algorithm-matched perfumes |
| POST | `/suggest-notes` | Suggests 4 complementary fragrance notes for the Scent Mixer |

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Backend | Groq API key for chat, explanations, comparisons |
| `HF_API_TOKEN` | Backend | HuggingFace token for MiniLM-L6-v2 embeddings |
| `PORT` | Backend | Backend port (default: 8000) |
| `VITE_BACKEND_URL` | Frontend | Backend URL (default: http://localhost:8000) |

---

## Dataset

Fragrance dataset expanded from an initial 36 curated entries to 236 perfumes, based on the TidyTuesday Parfumo dataset. Each perfume includes:

- Top, heart, and base notes
- Main accords
- Longevity and sillage ratings
- Best seasons, occasions, and times
- Vibe tags and price category
- Community ratings and vote counts
- Vector embedding (for semantic search)

---

## Deployment Notes

- **Frontend** deployed on Vercel — environment variables must be set before build time since Vite bakes them into the static bundle
- **Backend** deployed on Render
- Watch for case-sensitivity issues between `server.js` filenames on local macOS vs. Linux-based hosting
- Ensure MongoDB Atlas network access allows your host's outbound IPs

---

## Roadmap

- [ ] User accounts and wishlists
- [ ] Community reviews
- [ ] Mobile app
