/* =========================================================
   MODEL — BloodRequest
   Stores blood requirement requests from patients/hospitals
========================================================= */

const mongoose = require("mongoose");

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VALID_URGENCY      = ["normal", "urgent", "critical"];
const VALID_STATUS       = ["active", "fulfilled", "cancelled"];

const BloodRequestSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: [true, "Patient name is required"],
            trim: true,
            minlength: [2, "Patient name must be at least 2 characters"],
        },
        bloodGroup: {
            type: String,
            required: [true, "Blood group is required"],
            enum: {
                values: VALID_BLOOD_GROUPS,
                message: "Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
            },
        },
        units: {
            type: Number,
            required: [true, "Number of units is required"],
            min: [1, "Minimum 1 unit required"],
            max: [10, "Maximum 10 units allowed"],
        },
        urgency: {
            type: String,
            required: [true, "Urgency level is required"],
            enum: {
                values: VALID_URGENCY,
                message: "Urgency must be: normal, urgent, or critical",
            },
            default: "normal",
        },
        hospital: {
            type: String,
            required: [true, "Hospital name is required"],
            trim: true,
            minlength: [2, "Hospital name must be at least 2 characters"],
        },
        location: {
            type: String,
            required: [true, "Location (city) is required"],
            trim: true,
            minlength: [2, "Location must be at least 2 characters"],
        },
        status: {
            type: String,
            enum: {
                values: VALID_STATUS,
                message: "Status must be: active, fulfilled, or cancelled",
            },
            default: "active",
        },
        // The user who submitted the request (optional)
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

/* ── Index for fast blood-group + status lookups ──────────── */
BloodRequestSchema.index({ bloodGroup: 1, status: 1 });
BloodRequestSchema.index({ location: 1 });

module.exports = mongoose.model("BloodRequest", BloodRequestSchema);
