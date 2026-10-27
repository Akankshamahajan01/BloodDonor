/* =========================================================
   BLOODCONNECT
   BLOOD REQUEST — calls backend API
========================================================= */

const requestForm = document.getElementById("requestForm");

requestForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const patientName = document.getElementById("patientName").value.trim();
    const bloodGroup  = document.getElementById("requiredBloodGroup").value;
    const units       = Number(document.getElementById("unitsRequired").value);
    const urgency     = document.getElementById("urgency").value;
    const hospital    = document.getElementById("hospital").value.trim();
    const location    = document.getElementById("requestLocation").value.trim();

    /* ── Validation ── */
    if (patientName.length < 2) { alert("Please enter the patient's name."); return; }
    if (!bloodGroup)             { alert("Please select the required blood group."); return; }
    if (!units || units < 1 || units > 10) { alert("Please enter between 1 and 10 units."); return; }
    if (!urgency)                { alert("Please select the urgency."); return; }
    if (hospital.length < 2)    { alert("Please enter the hospital name."); return; }
    if (location.length < 2)    { alert("Please enter the location."); return; }

    /* ── Auth token ── */
    const token = localStorage.getItem("bloodConnectToken");
    if (!token) {
        alert("You must be logged in to submit a blood request.");
        window.location.href = "login.html";
        return;
    }

    /* ── Call backend API ── */
    try {
        const response = await fetch(CONFIG.API.REQUESTS, {
            method:  "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify({ patientName, bloodGroup, units, urgency, hospital, location }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to submit request. Please try again.");
            return;
        }

        const request = data.request;
        const matches = data.matches.donors;

        /* ── Save to localStorage for matches.html ── */
        try {
            localStorage.setItem("bloodConnectCurrentRequest", JSON.stringify({
                id:          request._id,
                patientName: request.patientName,
                bloodGroup:  request.bloodGroup,
                units:       request.units,
                urgency:     request.urgency,
                hospital:    request.hospital,
                location:    request.location,
                status:      request.status,
                createdAt:   request.createdAt,
            }));

            localStorage.setItem("bloodConnectCurrentMatches", JSON.stringify(
                matches.map((d) => ({
                    id:               d._id,
                    name:             d.name,
                    age:              d.age,
                    bloodGroup:       d.bloodGroup,
                    phone:            d.phone,
                    email:            d.email,
                    location:         d.location,
                    lastDonationDate: d.lastDonationDate ? d.lastDonationDate.split("T")[0] : null,
                    eligible:         d.eligible,
                    source:           "api",
                }))
            ));

            /* Also append to requests list for dashboard */
            let allReqs = [];
            try { allReqs = JSON.parse(localStorage.getItem("bloodConnectRequests") || "[]"); } catch (e) { allReqs = []; }
            if (!Array.isArray(allReqs)) allReqs = [];
            allReqs.push({
                id:          request._id,
                patientName: request.patientName,
                bloodGroup:  request.bloodGroup,
                units:       request.units,
                urgency:     request.urgency,
                hospital:    request.hospital,
                location:    request.location,
                status:      request.status,
                createdAt:   request.createdAt,
            });
            localStorage.setItem("bloodConnectRequests", JSON.stringify(allReqs));
        } catch (e) { /* best effort */ }

        /* ── Navigate to matches ── */
        window.location.href = "matches.html";

    } catch (err) {
        alert("Could not connect to the server. Please try again.");
        console.error("Request error:", err);
    }
});
