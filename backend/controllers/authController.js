/* =========================================================
   CONTROLLER — Auth
   Handles user registration, login, and profile retrieval.
========================================================= */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/* ── Helper: generate a signed JWT ─────────────────────── */
function generateToken(userId) {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

/* =========================================================
   POST /api/auth/register
   Body: { name, email, phone, password }
========================================================= */
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // ── Basic presence validation ──────────────────
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: name, email, phone, password",
            });
        }

        // ── Strong password check ──────────────────────
        const pwErrors = [];
        if (password.length < 8)               pwErrors.push("at least 8 characters");
        if (!/[A-Z]/.test(password))           pwErrors.push("one uppercase letter");
        if (!/[a-z]/.test(password))           pwErrors.push("one lowercase letter");
        if (!/[0-9]/.test(password))           pwErrors.push("one number");
        if (!/[^A-Za-z0-9]/.test(password))   pwErrors.push("one special character");

        if (pwErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Password must include: " + pwErrors.join(", "),
            });
        }

        // ── Check duplicate email ──────────────────────
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        // ── Create user (password hashed via pre-save hook) ──
        const user = await User.create({ name, email, phone, password });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                id:        user._id,
                name:      user.name,
                email:     user.email,
                phone:     user.phone,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   POST /api/auth/login
   Body: { email, password }
========================================================= */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // ── Find user (explicitly select password) ─────
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        // ── Compare password ───────────────────────────
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id:        user._id,
                name:      user.name,
                email:     user.email,
                phone:     user.phone,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/auth/me
   Protected — requires valid JWT
========================================================= */
exports.getMe = async (req, res, next) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id:        user._id,
                name:      user.name,
                email:     user.email,
                phone:     user.phone,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};
