
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Allowed frontend origins
const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || ""
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// CORS configuration — only ONE CORS middleware
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an Origin header, e.g. curl
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error("CORS blocked origin:", origin);

            return callback(
                new Error("Not allowed by CORS: " + origin)
            );
        },
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BloodConnect API is running 🩸",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            donors: "/api/donors",
            requests: "/api/requests"
        }
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(
                `BloodConnect server running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });

module.exports = app;
