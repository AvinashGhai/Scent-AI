const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/chat", aiController.chat);
router.post("/explain", aiController.explain);
router.post("/suggest-notes", aiController.suggestNotes);

module.exports = router;