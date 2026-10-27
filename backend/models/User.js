/* =========================================================
   MODEL — User
   Stores registered user accounts
========================================================= */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^[0-9]{10}$/, "Phone must be a 10-digit number"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // never returned in queries by default
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

/* ── Hash password before saving ────────────────────────── */
UserSchema.pre("save", async function (next) {
    // Only hash if the password field was modified
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/* ── Instance method: compare plain password with hash ─── */
UserSchema.methods.matchPassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

/* ── Exclude password from JSON output ──────────────────── */
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("User", UserSchema);
