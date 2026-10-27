/* =========================================================
   CONTROLLER — Donor
   CRUD operations for blood donor registration & search
========================================================= */

const Donor = require("../models/Donor");

/* =========================================================
   POST /api/donors/register
   Register the current logged-in user as a donor.
   Body: { name, age, bloodGroup, phone, email, location, lastDonationDate }
========================================================= */
exports.registerDonor = async (req, res, next) => {
    try {
        const {
            name,
            age,
            bloodGroup,
            phone,
            email,
            location,
            lastDonationDate,
        } = req.body;

        // ── Check for existing donor by email or phone ──
        const existing = await Donor.findOne({
            $or: [
                { email: email ? email.toLowerCase().trim() : "" },
                { phone: phone ? phone.trim() : "" },
            ],
        });

        if (existing) {
            // Update the existing donor record instead of creating a duplicate
            existing.name  = name  || existing.name;
            existing.age   = age   || existing.age;
            existing.bloodGroup    = bloodGroup    || existing.bloodGroup;
            existing.phone         = phone         || existing.phone;
            existing.location      = location      || existing.location;
            existing.lastDonationDate = lastDonationDate
                ? new Date(lastDonationDate)
                : existing.lastDonationDate;
            existing.registeredBy = req.user ? req.user.id : existing.registeredBy;

            await existing.save(); // pre-save hook recalculates eligibility

            return res.status(200).json({
                success: true,
                message: "Donor profile updated successfully",
                donor:   existing,
            });
        }

        // ── Create new donor ──────────────────────────
        const donorData = {
            name,
            age,
            bloodGroup,
            phone,
            email,
            location,
            lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
            registeredBy: req.user ? req.user.id : null,
        };

        const donor = await Donor.create(donorData);

        res.status(201).json({
            success: true,
            message: donor.eligible
                ? "✓ You are currently eligible. Donor profile registered successfully."
                : `⚠ Donor profile saved. You can donate again in ${donor.daysRemaining} days.`,
            donor,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/donors
   Query params: bloodGroup, location, page, limit
   Returns eligible donors matching the criteria.
========================================================= */
exports.getDonors = async (req, res, next) => {
    try {
        const { bloodGroup, location, page = 1, limit = 20 } = req.query;

        // ── Build filter ──────────────────────────────
        const filter = { eligible: true };

        if (bloodGroup) {
            filter.bloodGroup = bloodGroup;
        }

        if (location) {
            // Case-insensitive partial match
            filter.location = { $regex: location, $options: "i" };
        }

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await Donor.countDocuments(filter);

        const donors = await Donor.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("-__v");

        res.status(200).json({
            success: true,
            count:   donors.length,
            total,
            page:    Number(page),
            pages:   Math.ceil(total / Number(limit)),
            donors,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/donors/:id
   Get a single donor by MongoDB _id
========================================================= */
exports.getDonorById = async (req, res, next) => {
    try {
        const donor = await Donor.findById(req.params.id).select("-__v");

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        res.status(200).json({ success: true, donor });
    } catch (error) {
        next(error);
    }
};

/* =========================================================
   GET /api/donors/search?bloodGroup=A%2B&location=Delhi
   Alias for getDonors — kept for frontend compatibility
========================================================= */
exports.searchDonors = async (req, res, next) => {
    // Delegate to the same logic
    return exports.getDonors(req, res, next);
};

/* =========================================================
   GET /api/donors/stats
   Returns aggregate counts used by the dashboard
========================================================= */
exports.getDonorStats = async (req, res, next) => {
    try {
        const total    = await Donor.countDocuments();
        const eligible = await Donor.countDocuments({ eligible: true });

        // Count unique cities
        const cities = await Donor.distinct("location");

        // Breakdown by blood group
        const byBloodGroup = await Donor.aggregate([
            {
                $group: {
                    _id:      "$bloodGroup",
                    total:    { $sum: 1 },
                    eligible: {
                        $sum: { $cond: ["$eligible", 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total,
                eligible,
                cities: cities.length,
                byBloodGroup,
            },
        });
    } catch (error) {
        next(error);
    }
};
