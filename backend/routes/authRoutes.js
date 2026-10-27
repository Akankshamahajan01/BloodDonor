/* =========================================================
   ROUTES — Auth
   Base: /api/auth
========================================================= */

const express        = require("express");
const router         = express.Router();
const authController = require("../controllers/authController");
const protect        = require("../middleware/protect");

// POST /api/auth/register  — Create a new account
router.post("/register", authController.register);

// POST /api/auth/login     — Login and receive JWT
router.post("/login",    authController.login);

// GET  /api/auth/me        — Get logged-in user profile (protected)
router.get("/me",        protect, authController.getMe);

module.exports = router;
