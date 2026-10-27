/* =========================================================
   BLOODCONNECT — MATCHING RESULTS v2
========================================================= */

/* ── DOM refs ── */
var matchesContainer  = document.getElementById("matchesContainer");
var noMatches         = document.getElementById("noMatches");
var requestDetail     = document.getElementById("requestDetail");
var summaryBloodGroup = document.getElementById("summaryBloodGroup");
var summaryUnits      = document.getElementById("summaryUnits");
var summaryUrgency    = document.getElementById("summaryUrgency");
var summaryMatches    = document.getElementById("summaryMatches");

/* modal refs */
var donorModal         = document.getElementById("donorModal");
var modalOverlay       = document.getElementById("modalOverlay");
var closeModalBtn      = document.getElementById("closeModal");
var modalDonorName     = document.getElementById("modalDonorName");
var modalAvatar        = document.getElementById("modalAvatar");
var modalBloodGroup    = document.getElementById("modalBloodGroup");
var modalMatchScore    = document.getElementById("modalMatchScore");
var modalAge           = document.getElementById("modalAge");
var modalLocation      = document.getElementById("modalLocation");
var modalLastDonation  = document.getElementById("modalLastDonation");
var modalPhone         = document.getElementById("modalPhone");
var modalEmail         = document.getElementById("modalEmail");
var modalContactButton = document.getElementById("modalContactButton");

/* ── Stored data ── */
var storedRequest = localStorage.getItem("bloodConnectCurrentRequest");
var storedMatches = localStorage.getItem("bloodConnectCurrentMatches");

/* ── Bootstrap ── */
if (!storedRequest) {
    if (requestDetail)     requestDetail.textContent = "No active blood request found.";
    if (matchesContainer)  matchesContainer.innerHTML = "";
    if (noMatches)         noMatches.hidden = false;
} else {
    loadResults();
}

/* =========================================================
   LOAD RESULTS
========================================================= */
function loadResults() {

    var request, matches;

    try {
        request = JSON.parse(storedRequest);
        matches = storedMatches ? JSON.parse(storedMatches) : [];
    } catch (e) {
        if (requestDetail) requestDetail.textContent = "Unable to load matching results.";
        return;
    }

    /* ── hero subtitle ── */
    if (requestDetail) {
        requestDetail.textContent =
            "Showing compatible donors for " + request.bloodGroup +
            " blood at " + (request.location || "your location") + ".";
    }

    /* ── summary strip ── */
    if (summaryBloodGroup) summaryBloodGroup.textContent = request.bloodGroup;
    if (summaryUnits)      summaryUnits.textContent      = request.units;
    if (summaryUrgency)    summaryUrgency.textContent    = capitalize(request.urgency);
    if (summaryMatches)    summaryMatches.textContent    = matches.length;

    /* ── no matches ── */
    if (!matches.length) {
        if (matchesContainer) matchesContainer.innerHTML = "";
        if (noMatches)        noMatches.hidden = false;
        return;
    }

    if (noMatches) noMatches.hidden = true;

    /* ── rank donors ── */
    matches.sort(function (a, b) {
        return calculateMatchScore(b, request) - calculateMatchScore(a, request);
    });

    /* ── build cards ── */
    matchesContainer.innerHTML = "";

    matches.forEach(function (donor, i) {
        var score = calculateMatchScore(donor, request);
        var card  = document.createElement("div");
        card.className = "match-card";
        card.style.animationDelay = (i * 0.05) + "s";

        card.innerHTML =
            '<div class="match-rank">#' + (i + 1) + '</div>' +

            '<div class="match-main">' +
            '  <div class="donor-avatar">' + getInitials(donor.name) + '</div>' +
            '  <div class="donor-details">' +
            '    <h3>' + escapeHTML(donor.name) + '</h3>' +
            '    <span class="donor-location">' + escapeHTML(donor.location || "Location unavailable") + '</span>' +
            '  </div>' +
            '</div>' +

            '<div class="blood-type-box">' +
            '  <span>BLOOD TYPE</span>' +
            '  <strong>' + donor.bloodGroup + '</strong>' +
            '</div>' +

            '<div class="eligibility-box">' +
            '  <span class="status-dot"></span>' +
            '  <div>' +
            '    <strong>Eligible</strong>' +
            '    <small>Available to donate</small>' +
            '  </div>' +
            '</div>' +

            '<div class="match-score">' +
            '  <span>MATCH SCORE</span>' +
            '  <strong>' + score + '%</strong>' +
            '</div>' +

            '<div class="match-action">' +
            '  <button type="button" class="view-donor-button" data-donor-id="' + donor.id + '">' +
            '    View Details <span>→</span>' +
            '  </button>' +
            '</div>';

        matchesContainer.appendChild(card);
    });

    /* ── button events ── */
    matchesContainer.querySelectorAll(".view-donor-button").forEach(function (btn) {
        btn.addEventListener("click", function () {
            openDonorModal(btn.dataset.donorId, request);
        });
    });
}

/* =========================================================
   MATCH SCORE
========================================================= */
function calculateMatchScore(donor, request) {
    var score = 0;

    if (donor.bloodGroup === request.bloodGroup) score += 70;
    else score += 50;

    if (donor.eligible === true) score += 20;

    if (donor.location && request.location &&
        donor.location.trim().toLowerCase() === request.location.trim().toLowerCase()) {
        score += 10;
    }

    return score;
}

/* =========================================================
   OPEN MODAL
========================================================= */
function openDonorModal(donorId, request) {
    var stored = localStorage.getItem("bloodConnectDonors");
    if (!stored) return;

    var donors;
    try { donors = JSON.parse(stored); } catch (e) { return; }

    var donor = donors.find(function (d) { return String(d.id) === String(donorId); });
    if (!donor) return;

    var score = calculateMatchScore(donor, request);

    modalAvatar.textContent       = getInitials(donor.name);
    modalDonorName.textContent    = donor.name;
    modalBloodGroup.textContent   = donor.bloodGroup;
    modalMatchScore.textContent   = score + "%";
    modalAge.textContent          = donor.age ? donor.age + " years" : "—";
    modalLocation.textContent     = donor.location || "—";
    modalPhone.textContent        = donor.phone || "Not available";
    modalEmail.textContent        = donor.email || "Not available";
    modalLastDonation.textContent = donor.lastDonationDate
        ? formatDate(donor.lastDonationDate)
        : "First-time donor";

    modalContactButton.onclick = function () {
        if (donor.phone) window.location.href = "tel:" + donor.phone;
    };

    donorModal.hidden = false;
    document.body.classList.add("modal-open");
}

/* =========================================================
   CLOSE MODAL
========================================================= */
function closeDonorModal() {
    donorModal.hidden = true;
    document.body.classList.remove("modal-open");
}

closeModalBtn.addEventListener("click", closeDonorModal);
modalOverlay.addEventListener("click",  closeDonorModal);

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !donorModal.hidden) closeDonorModal();
});

/* =========================================================
   HELPERS
========================================================= */
function getInitials(name) {
    var words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function capitalize(text) {
    if (!text) return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        });
    } catch (e) { return "—"; }
}

function escapeHTML(value) {
    var d = document.createElement("div");
    d.textContent = value;
    return d.innerHTML;
}
