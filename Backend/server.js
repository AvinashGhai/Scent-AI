const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./src/config/db");
const perfumeRoutes = require("./src/routes/perfumeRoutes");
const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");
const aiRoutes = require("./src/routes/aiRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

app.use("/api/perfumes", perfumeRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ status: "ScentAI Backend Running " });
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});