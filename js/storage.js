/* =========================================================
   BLOODCONNECT
   STORAGE ENGINE & INITIAL SEED DATA (VANILLA JS)
========================================================= */

(function () {
    const DONOR_STORAGE_KEY = "bloodConnectDonors";

    // -------------------------------------------------------
    // SEED DONORS — All 8 blood groups covered
    // -------------------------------------------------------
    const SAMPLE_DONORS = [
        {
            id: 101,
            name: "Dr. Rajesh Sharma",
            age: 34,
            bloodGroup: "O-",
            phone: "9876543210",
            email: "rajesh.sharma@example.com",
            location: "Delhi",
            lastDonationDate: "2025-11-10",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 102,
            name: "Ananya Verma",
            age: 26,
            bloodGroup: "O+",
            phone: "9812345678",
            email: "ananya.v@example.com",
            location: "Mumbai",
            lastDonationDate: "2025-12-05",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 103,
            name: "Vikram Malhotra",
            age: 29,
            bloodGroup: "A+",
            phone: "9765432109",
            email: "vikram.m@example.com",
            location: "Chandigarh",
            lastDonationDate: "2025-10-20",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 104,
            name: "Pooja Deshmukh",
            age: 24,
            bloodGroup: "B+",
            phone: "9654321098",
            email: "pooja.d@example.com",
            location: "Pune",
            lastDonationDate: "2025-09-15",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 105,
            name: "Kabir Singh",
            age: 31,
            bloodGroup: "AB+",
            phone: "9543210987",
            email: "kabir.s@example.com",
            location: "Bangalore",
            lastDonationDate: "2025-11-28",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 106,
            name: "Simran Kaur",
            age: 27,
            bloodGroup: "A-",
            phone: "9432109876",
            email: "simran.k@example.com",
            location: "Delhi",
            lastDonationDate: "2025-10-01",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 107,
            name: "Arjun Nair",
            age: 32,
            bloodGroup: "B-",
            phone: "9321098765",
            email: "arjun.n@example.com",
            location: "Kochi",
            lastDonationDate: "2025-08-22",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 108,
            name: "Meera Pillai",
            age: 28,
            bloodGroup: "AB-",
            phone: "9210987654",
            email: "meera.p@example.com",
            location: "Chennai",
            lastDonationDate: "2025-07-18",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 109,
            name: "Suresh Patel",
            age: 35,
            bloodGroup: "O+",
            phone: "9109876543",
            email: "suresh.p@example.com",
            location: "Ahmedabad",
            lastDonationDate: "2025-06-10",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 110,
            name: "Divya Menon",
            age: 23,
            bloodGroup: "A+",
            phone: "9098765432",
            email: "divya.m@example.com",
            location: "Hyderabad",
            lastDonationDate: "2025-05-30",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 111,
            name: "Rohit Joshi",
            age: 30,
            bloodGroup: "B+",
            phone: "9987654321",
            email: "rohit.j@example.com",
            location: "Jaipur",
            lastDonationDate: "2025-04-15",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        },
        {
            id: 112,
            name: "Kavya Reddy",
            age: 25,
            bloodGroup: "O-",
            phone: "9876012345",
            email: "kavya.r@example.com",
            location: "Bangalore",
            lastDonationDate: "2025-03-20",
            eligible: true,
            source: "local",
            createdAt: new Date().toISOString()
        }
    ];

    // -------------------------------------------------------
    // INIT — seed if empty
    // -------------------------------------------------------
    function initSeedData() {
        try {
            const existingDonors = localStorage.getItem(DONOR_STORAGE_KEY);
            if (!existingDonors || JSON.parse(existingDonors).length === 0) {
                localStorage.setItem(DONOR_STORAGE_KEY, JSON.stringify(SAMPLE_DONORS));
            }
        } catch (e) {
            console.warn("Storage initialization notice:", e);
        }
    }

    // -------------------------------------------------------
    // Run on DOM ready
    // -------------------------------------------------------
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSeedData);
    } else {
        initSeedData();
    }
})();


/* =========================================================
   GLOBAL STORAGE UTILITIES
   Available on window for use by other scripts
========================================================= */

/**
 * Get ALL donors from localStorage, deduplicated by id → email → phone
 * @returns {Array}
 */
function getAllDonors() {
    try {
        const stored = localStorage.getItem("bloodConnectDonors");
        if (!stored) return [];
        const donors = JSON.parse(stored);
        if (!Array.isArray(donors)) return [];

        // Deduplicate: keep last occurrence wins for same id/email/phone
        const seen = { ids: new Set(), emails: new Set(), phones: new Set() };
        const unique = [];

        // Traverse in reverse so the latest entry (most up-to-date) is kept
        for (let i = donors.length - 1; i >= 0; i--) {
            const d = donors[i];
            const id    = d.id    ? String(d.id)                        : null;
            const email = d.email ? d.email.toLowerCase().trim()        : null;
            const phone = d.phone ? String(d.phone).trim()              : null;

            if (
                (id    && seen.ids.has(id))    ||
                (email && seen.emails.has(email)) ||
                (phone && seen.phones.has(phone))
            ) {
                continue; // duplicate — skip
            }

            if (id)    seen.ids.add(id);
            if (email) seen.emails.add(email);
            if (phone) seen.phones.add(phone);
            unique.push(d);
        }

        // Restore original order (oldest first)
        unique.reverse();

        // Also persist the cleaned list back so duplicates don't keep accumulating
        try {
            localStorage.setItem("bloodConnectDonors", JSON.stringify(unique));
        } catch (e) { /* storage full — ignore */ }

        return unique;
    } catch (e) {
        return [];
    }
}


/**
 * Get donors filtered by a specific blood group
 * @param {string} bloodGroup  e.g. "A+", "O-"
 * @returns {Array}
 */
function getDonorsByBloodGroup(bloodGroup) {
    const all = getAllDonors();
    if (!bloodGroup) return all;
    return all.filter(function (d) {
        return d.bloodGroup === bloodGroup && d.eligible !== false;
    });
}


/**
 * Save a bulk array of donors (API donors) into localStorage,
 * avoiding duplicates by email or phone.
 * @param {Array} newDonors
 */
function saveDonorsBulk(newDonors) {
    if (!Array.isArray(newDonors) || newDonors.length === 0) return;

    let existing = getAllDonors();

    newDonors.forEach(function (nd) {
        const alreadyExists = existing.some(function (d) {
            return (
                (nd.email && d.email && d.email.toLowerCase() === nd.email.toLowerCase()) ||
                (nd.phone && d.phone && d.phone === nd.phone)
            );
        });

        if (!alreadyExists) {
            existing.push(nd);
        }
    });

    try {
        localStorage.setItem("bloodConnectDonors", JSON.stringify(existing));
    } catch (e) {
        console.warn("Could not save bulk donors:", e);
    }
}


/**
 * Get total donor count
 * @returns {number}
 */
function getDonorCount() {
    return getAllDonors().length;
}


/**
 * Clear the API cache (for debugging / manual refresh)
 */
function clearApiCache() {
    localStorage.removeItem("bloodConnect_apiCache");
    localStorage.removeItem("bloodConnect_apiCacheTime");
}
