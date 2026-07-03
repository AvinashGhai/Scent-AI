const express = require("express");
const router = express.Router();
const perfumeController = require("../controllers/perfumeController");

router.get("/", perfumeController.getAll);
router.get("/search", perfumeController.search);
router.post("/semantic-search", perfumeController.semanticSearch);
router.post("/smart-recommend", perfumeController.smartRecommend);
router.post("/compare", perfumeController.compare);

module.exports = router;