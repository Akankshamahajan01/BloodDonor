/* =========================================================
   MIDDLEWARE — protect
   Verifies JWT token from Authorization header.
   Attaches req.user on success.
========================================================= */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    // ── Extract token from "Authorization: Bearer <token>" header ──
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Please log in.",
        });
    }

    try {
        // ── Verify token ──────────────────────────────
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ── Attach user to request ────────────────────
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again.",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again.",
        });
    }
};

module.exports = protect;
