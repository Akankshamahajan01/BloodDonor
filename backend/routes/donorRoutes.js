/* =========================================================
   ROUTES — Donors
   Base: /api/donors
========================================================= */

const express          = require("express");
const router           = express.Router();
const donorController  = require("../controllers/donorController");
const protect          = require("../middleware/protect");

// GET  /api/donors/stats          — Aggregate stats (public)
router.get("/stats",    donorController.getDonorStats);

// GET  /api/donors/search         — Search donors (public)
router.get("/search",   donorController.searchDonors);

// GET  /api/donors                — Get all eligible donors (public)
router.get("/",         donorController.getDonors);

// POST /api/donors/register       — Register as a donor (protected)
router.post("/register", protect, donorController.registerDonor);

// GET  /api/donors/:id            — Get single donor (public)
router.get("/:id",      donorController.getDonorById);

module.exports = router;
