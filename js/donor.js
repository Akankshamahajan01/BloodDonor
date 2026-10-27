/* =========================================================
   BLOODCONNECT
   DONOR REGISTRATION — calls backend API
========================================================= */

const donorForm        = document.getElementById("donorForm");
const eligibilityResult = document.getElementById("eligibilityResult");

donorForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name             = document.getElementById("fullName").value.trim();
    const age              = Number(document.getElementById("age").value);
    const bloodGroup       = document.getElementById("bloodGroup").value;
    const phone            = document.getElementById("phone").value.trim();
    const email            = document.getElementById("email").value.trim();
    const location         = document.getElementById("location").value.trim();
    const lastDonationDate = document.getElementById("lastDonationDate").value;

    /* ── Client-side validation ── */
    if (name.length < 2)              { showResult("error", "Please enter a valid name.");                         return; }
    if (age < 18 || age > 65)         { showResult("error", "Age must be between 18 and 65.");                     return; }
    if (!bloodGroup)                  { showResult("error", "Please select your blood group.");                    return; }
    if (!/^[0-9]{10}$/.test(phone))   { showResult("error", "Please enter a valid 10-digit phone number.");       return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showResult("error", "Please enter a valid email address."); return; }
    if (location.length < 2)          { showResult("error", "Please enter your location.");                        return; }

    /* ── Get auth token ── */
    const token = localStorage.getItem("bloodConnectToken");
    if (!token) {
        showResult("error", "You must be logged in to register as a donor.");
        return;
    }

    /* ── Call backend API ── */
    try {
        const response = await fetch(CONFIG.API.DONOR_REGISTER, {
            method:  "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify({
                name,
                age,
                bloodGroup,
                phone,
                email,
                location,
                lastDonationDate: lastDonationDate || null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showResult("error", data.message || "Registration failed. Please try again.");
            return;
        }

        const donor = data.donor;

        /* ── Also save locally for offline fallback ── */
        try {
            if (typeof saveDonor === "function") {
                saveDonor({
                    id:               donor._id,
                    name:             donor.name,
                    age:              donor.age,
                    bloodGroup:       donor.bloodGroup,
                    phone:            donor.phone,
                    email:            donor.email,
                    location:         donor.location,
                    lastDonationDate: donor.lastDonationDate ? donor.lastDonationDate.split("T")[0] : null,
                    eligible:         donor.eligible,
                    nextEligibleDate: donor.nextEligibleDate,
                    daysRemaining:    donor.daysRemaining,
                    registeredAt:     donor.createdAt,
                    source:           "local",
                });
            }
        } catch (e) { /* localStorage save is best-effort */ }

        /* ── Show result ── */
        if (donor.eligible) {
            showResult(
                "success",
                `<strong>✓ You are currently eligible.</strong>
                 <p>Your donor profile has been registered successfully.</p>
                 <small>Blood Group: ${donor.bloodGroup}</small>`
            );
        } else {
            showResult(
                "warning",
                `<strong>⚠ You are not currently eligible.</strong>
                 <p>You can donate again in <strong>${donor.daysRemaining} days.</strong></p>
                 <small>Next eligible date: ${formatDisplayDate(donor.nextEligibleDate)}</small>`
            );
        }

        donorForm.reset();

    } catch (err) {
        showResult("error", "Could not connect to the server. Please try again.");
        console.error("Donor registration error:", err);
    }
});

/* ── Show result ── */
function showResult(type, message) {
    eligibilityResult.hidden        = false;
    eligibilityResult.style.display = "flex";
    eligibilityResult.className     = "eligibility-result " + type;
    eligibilityResult.innerHTML     = `
        <div class="result-icon">${type === "success" ? "✓" : "!"}</div>
        <div>${message}</div>
    `;
    eligibilityResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ── Format date for display ── */
function formatDisplayDate(dateString) {
    if (!dateString) return "";
    try {
        const date  = new Date(dateString);
        const day   = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year  = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}

/* ── Kept for local-storage compatibility ── */
function saveDonor(donor) {
    let donors = [];
    const stored = localStorage.getItem("bloodConnectDonors");
    if (stored) {
        try { donors = JSON.parse(stored); } catch (e) { donors = []; }
    }
    if (!Array.isArray(donors)) donors = [];

    const existingIndex = donors.findIndex(function (d) {
        return (
            (donor.email && d.email && d.email.toLowerCase() === donor.email.toLowerCase()) ||
            (donor.phone && d.phone && d.phone === donor.phone)
        );
    });

    if (existingIndex !== -1) {
        donors[existingIndex] = { ...donors[existingIndex], ...donor, id: donors[existingIndex].id || donor.id };
    } else {
        donors.push(donor);
    }

    localStorage.setItem("bloodConnectDonors", JSON.stringify(donors));
}
