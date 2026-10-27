/* =========================================================
   CONTROLLER — BloodRequest
   Create and retrieve blood requests; find matching donors
========================================================= */

const BloodRequest = require("../models/BloodRequest");
const Donor        = require("../models/Donor");

/* ── Blood-group compatibility matrix ──────────────────── */
const COMPATIBILITY = {
    "A+":  ["A+"],
    "A-":  ["A-"],
    "B+":  ["B+"],
    "B-":  ["B-"],
    "AB+": ["AB+"],
    "AB-": ["AB-"],
    "O+":  ["O+"],
    "O-":  ["O-"],
};

function isCompatible(donorGroup, requestedGroup) {
    const compatible = COMPATIBILITY[requestedGroup];
    return compatible ? compatible.includes(donorGroup) : false;
}

/* ── Calculate match score (0–100) ─────────────────────── */
function matchScore(donor, request) {
    let score = 0;
    if (donor.bloodGroup === request.bloodGroup) score += 70;
    if (donor.eligible === true) score += 20;
    if (
        donor.location &&
        request.location &&
        donor.location.trim().toLowerCase() === request.location.trim().toLowerCase()
    ) {
        score += 10;
    }
    return score;
}

/* =========================================================
   POST /api/requests
   Body: { patientName, bloodGroup, units, urgency, hospital, location }
   Creates a request and returns matching donors
========================================================= */
exports.createRequest = async (req, res, next) => {
    try {
        const { patientName, bloodGroup, units, urgency, hospital, location } = req.body;

        // ── Validation ────────────────────────────────
        if (!patientName || !bloodGroup || !units || !urgency || !hospital || !location) {
            return res.status(400).json({
                success: false,
                message:
                    "All fields are required: patientName, bloodGroup, units, urgency, hospital, location",
            });
        }

        // ── Create request ────────────────────────────
        const request = await BloodRequest.create({
            patientName,
            bloodGroup,
            units: Number(units),
            urgency,
            hospital,
            location,
            requestedBy: req.user ? req.user.id : null,
        });

        // ── Find matching eligible donors ─────────────
        const allDonors = await Donor.find({ eligible: true }).select("-__v");

        const matchingDonors = allDonors
            .filter((d) => isCompatible(d.bloodGroup, bloodGroup))
            .map((d) => ({
                ...d.toObject(),
                matchScore: matchScore(d, request),
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        res.status(201).json({
            success: true,
            message: "Blood request submitted successfully",
            request,
            matches: {
                count:  matchingDonors.length,
                donors: matchingDonors,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/requests
   Query params: bloodGroup, urgency, status, page, limit
========================================================= */
exports.getRequests = async (req, res, next) => {
    try {
        const { bloodGroup, urgency, status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (bloodGroup) filter.bloodGroup = bloodGroup;
        if (urgency)    filter.urgency    = urgency;
        if (status)     filter.status     = status;

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await BloodRequest.countDocuments(filter);

        const requests = await BloodRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("-__v");

        res.status(200).json({
            success: true,
            count:   requests.length,
            total,
            page:    Number(page),
            pages:   Math.ceil(total / Number(limit)),
            requests,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/requests/:id
   Get a single request and its current matching donors
========================================================= */
exports.getRequestById = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id).select("-__v");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
        }

        // Re-compute matches on demand
        const allDonors = await Donor.find({ eligible: true }).select("-__v");
        const matchingDonors = allDonors
            .filter((d) => isCompatible(d.bloodGroup, request.bloodGroup))
            .map((d) => ({
                ...d.toObject(),
                matchScore: matchScore(d, request),
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            request,
            matches: {
                count:  matchingDonors.length,
                donors: matchingDonors,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   PATCH /api/requests/:id/status
   Update request status: active | fulfilled | cancelled
   Protected route
========================================================= */
exports.updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const allowed = ["active", "fulfilled", "cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowed.join(", ")}`,
            });
        }

        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
        }

        res.status(200).json({
            success: true,
            message: `Request status updated to '${status}'`,
            request,
        });
    } catch (error) {
        next(error);
    }
};
