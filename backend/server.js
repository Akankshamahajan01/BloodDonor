/* =========================================================
   BLOODCONNECT — SERVER ENTRY POINT
   Node.js + Express + MongoDB (Mongoose)
   MVC Architecture
========================================================= */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// ── Load environment variables ──────────────────────────
dotenv.config();

// ── Import routes ───────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const donorRoutes   = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");

// ── Import error middleware ──────────────────────────────
const errorHandler = require("./middleware/errorHandler");

// ── Create Express app ──────────────────────────────────
const app = express();

// ── CORS configuration ──────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["*"];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (Postman, Thunder Client, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error("Not allowed by CORS: " + origin));
        },
        credentials: true,
    })
);

// ── Body parsers ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check route ───────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BloodConnect API is running 🩸",
        version: "1.0.0",
        endpoints: {
            auth:     "/api/auth",
            donors:   "/api/donors",
            requests: "/api/requests",
        },
    });
});

// ── API routes ───────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/donors",   donorRoutes);
app.use("/api/requests", requestRoutes);

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

// ── Connect to MongoDB and start server ─────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 BloodConnect API running on port ${PORT}`);
            console.log(`   Local: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });

module.exports = app;
