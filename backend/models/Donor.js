/* =========================================================
   MODEL — Donor
   Stores registered blood donors
========================================================= */

const mongoose = require("mongoose");

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DonorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Donor name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
        },
        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [18, "Donor must be at least 18 years old"],
            max: [65, "Donor must be 65 years or younger"],
        },
        bloodGroup: {
            type: String,
            required: [true, "Blood group is required"],
            enum: {
                values: VALID_BLOOD_GROUPS,
                message: "Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
            },
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^[0-9]{10}$/, "Phone must be a 10-digit number"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },
        location: {
            type: String,
            required: [true, "Location (city) is required"],
            trim: true,
            minlength: [2, "Location must be at least 2 characters"],
        },
        lastDonationDate: {
            type: Date,
            default: null,
        },
        eligible: {
            type: Boolean,
            default: true,
        },
        nextEligibleDate: {
            type: Date,
            default: null,
        },
        daysRemaining: {
            type: Number,
            default: 0,
        },
        // Reference to the user who registered as a donor (optional)
        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/* ── Index for fast blood-group + location queries ───────── */
DonorSchema.index({ bloodGroup: 1, eligible: 1 });
DonorSchema.index({ location: 1 });

/* ── Virtual: compute eligibility before saving ─────────── */
DonorSchema.pre("save", function (next) {
    const COOLDOWN_DAYS = 56;

    if (!this.lastDonationDate) {
        this.eligible = true;
        this.nextEligibleDate = null;
        this.daysRemaining = 0;
        return next();
    }

    const lastDate = new Date(this.lastDonationDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + COOLDOWN_DAYS);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today >= nextDate) {
        this.eligible = true;
        this.nextEligibleDate = nextDate;
        this.daysRemaining = 0;
    } else {
        this.eligible = false;
        this.nextEligibleDate = nextDate;
        const diff = nextDate.getTime() - today.getTime();
        this.daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    next();
});

module.exports = mongoose.model("Donor", DonorSchema);
