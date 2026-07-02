# ScentAI 🌸

An AI-powered fragrance discovery platform that helps you find your perfect scent through intelligent recommendations, note-based filtering, and a conversational AI assistant.

---

## What It Does

- **Discover** — Browse and filter 36 curated fragrances by gender, season, occasion, vibe, price, longevity, brand, and notes
- **AI Assistant** — Chat with a Groq-powered AI that recommends perfumes based on your mood, occasion, or preferences
- **Scent Mixer** — Build a custom note pyramid (top, heart, base) and find real perfumes that match your combination
- **Perfume Pages** — Detailed pages with scent pyramids, accord breakdowns, performance ratings, and similar perfume suggestions

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion
- React Router

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- Groq API (LLaMA 3)
- dotenv, cors, nodemon

---

## Project Structure
ScentAI/

├── Backend/

│   ├── src/

│   │   ├── config/         # MongoDB connection

│   │   ├── controllers/    # Route handlers

│   │   ├── middleware/     # Error handling

│   │   ├── models/         # Mongoose schemas

│   │   ├── routes/         # API routes

│   │   └── services/       # Seed script, AI logic

│   ├── server.js

│   └── .env

│

└── Frontend/

├── src/

│   ├── components/     # UI components (perfume, AI, filters, common)

│   ├── context/        # AppContext (global perfume state)

│   ├── data/           # Static constants and filter options

│   ├── hooks/          # Custom React hooks

│   ├── pages/          # Home, Discover, PerfumePage, ScentMixer, Assistant

│   ├── services/       # API calls (AI, recommendations, similarity)

│   └── utils/          # Helpers, scoring, constants

└── .env

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scentai

GROQ_API_KEY=your_groq_api_key

PORT=8000

Seed the database:
```bash
node src/services/seedService.js
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
VITE_BACKEND_URL=http://localhost:8000

Start the app:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/perfumes` | Get all perfumes (supports filters) |
| GET | `/api/perfumes/search?q=` | Search perfumes by name, brand, notes |
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/explain` | Get AI explanations for matches |
| POST | `/api/ai/suggest-notes` | Get AI note suggestions |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key for AI responses |
| `PORT` | Backend port (default: 8000) |
| `VITE_BACKEND_URL` | Backend URL for frontend (default: http://localhost:8000) |

---

## Dataset

36 hand-curated fragrances spanning budget to niche luxury, covering male, female, and unisex categories. Each perfume includes:

- Top, heart, and base notes
- Main accords
- Longevity and sillage ratings
- Best seasons, occasions, and times
- Vibe tags and price category
- Community ratings and vote counts

---

## Roadmap

- [ ] User accounts and wishlists
- [ ] More fragrances in the database
- [ ] Community reviews
- [ ] Mobile app

---

## Author

Built by Avinash Ghai
