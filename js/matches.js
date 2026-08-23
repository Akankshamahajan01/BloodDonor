/* =========================================================
   BLOODCONNECT
   MATCHING RESULTS + DONOR RANKING
   PHASE 1
========================================================= */


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const matchesContainer =
    document.getElementById("matchesContainer");

const noMatches =
    document.getElementById("noMatches");

const requestSummary =
    document.getElementById("requestSummary");

const summaryBloodGroup =
    document.getElementById("summaryBloodGroup");

const summaryUnits =
    document.getElementById("summaryUnits");

const summaryUrgency =
    document.getElementById("summaryUrgency");

const summaryMatches =
    document.getElementById("summaryMatches");


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const donorModal =
    document.getElementById("donorModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModal =
    document.getElementById("closeModal");

const modalDonorName =
    document.getElementById("modalDonorName");

const modalAvatar =
    document.getElementById("modalAvatar");

const modalBloodGroup =
    document.getElementById("modalBloodGroup");

const modalMatchScore =
    document.getElementById("modalMatchScore");

const modalAge =
    document.getElementById("modalAge");

const modalLocation =
    document.getElementById("modalLocation");

const modalLastDonation =
    document.getElementById("modalLastDonation");

const modalPhone =
    document.getElementById("modalPhone");

const modalEmail =
    document.getElementById("modalEmail");

const modalContactButton =
    document.getElementById("modalContactButton");


/* =========================================================
   GET SAVED REQUEST + MATCHES
========================================================= */

const storedRequest =
    localStorage.getItem(
        "bloodConnectCurrentRequest"
    );

const storedMatches =
    localStorage.getItem(
        "bloodConnectCurrentMatches"
    );


/* =========================================================
   LOAD PAGE
========================================================= */

if (!storedRequest) {

    requestSummary.textContent =
        "No active blood request was found.";

    matchesContainer.innerHTML = "";

    noMatches.hidden = false;

} else {

    loadResults();

}


/* =========================================================
   LOAD MATCHING RESULTS
========================================================= */

function loadResults() {

    let request;
    let matches;


    try {

        request =
            JSON.parse(storedRequest);

        matches =
            storedMatches
                ? JSON.parse(storedMatches)
                : [];

    }

    catch (error) {

        requestSummary.textContent =
            "Unable to load matching results.";

        return;

    }


    /* =====================================================
       REQUEST SUMMARY
    ===================================================== */

    requestSummary.textContent =
        `Showing compatible donors for ${request.bloodGroup}
        blood at ${request.location}.`;


    summaryBloodGroup.textContent =
        request.bloodGroup;


    summaryUnits.textContent =
        request.units;


    summaryUrgency.textContent =
        capitalize(request.urgency);


    summaryMatches.textContent =
        matches.length;


    /* =====================================================
       NO MATCHES
    ===================================================== */

    if (matches.length === 0) {

        matchesContainer.innerHTML = "";

        noMatches.hidden = false;

        return;

    }


    noMatches.hidden = true;


    /* =====================================================
       RANK DONORS
    ===================================================== */

    matches.sort(function (a, b) {

        const scoreA =
            calculateMatchScore(
                a,
                request
            );

        const scoreB =
            calculateMatchScore(
                b,
                request
            );


        /*
           Highest score comes first.
        */

        return scoreB - scoreA;

    });


    /* =====================================================
       CLEAR OLD CARDS
    ===================================================== */

    matchesContainer.innerHTML = "";


    /* =====================================================
       CREATE DONOR CARDS
    ===================================================== */

    matches.forEach(function (donor, index) {


        const score =
            calculateMatchScore(
                donor,
                request
            );


        const card =
            document.createElement("div");


        card.className =
            "match-card";


        card.innerHTML = `

            <div class="match-rank">

                #${index + 1}

            </div>


            <div class="match-main">

                <div class="donor-avatar">

                    ${getInitials(donor.name)}

                </div>


                <div class="donor-details">

                    <h3>
                        ${escapeHTML(donor.name)}
                    </h3>

                    <span class="donor-location">

                        ${escapeHTML(
                            donor.location || "Location unavailable"
                        )}

                    </span>

                </div>

            </div>


            <div class="blood-type-box">

                <span>
                    BLOOD TYPE
                </span>

                <strong>
                    ${donor.bloodGroup}
                </strong>

            </div>


            <div class="eligibility-box">

                <span class="status-dot"></span>

                <div>

                    <strong>
                        Eligible
                    </strong>

                    <small>
                        Available to donate
                    </small>

                </div>

            </div>


            <div class="match-score">

                <span>
                    MATCH SCORE
                </span>

                <strong>
                    ${score}%
                </strong>

            </div>


            <div class="match-action">

                <button
                    type="button"
                    class="view-donor-button"
                    data-donor-id="${donor.id}"
                >

                    View Donor Details

                    <span>→</span>

                </button>

            </div>

        `;


        matchesContainer.appendChild(card);

    });


    /* =====================================================
       ADD BUTTON EVENTS
    ===================================================== */

    const donorButtons =
        document.querySelectorAll(
            ".view-donor-button"
        );


    donorButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const donorId =
                    button.dataset.donorId;


                openDonorModal(
                    donorId,
                    request
                );

            }
        );

    });

}


/* =========================================================
   MATCH SCORE
========================================================= */

/*
   SCORE BREAKDOWN

   Exact blood group      = 70 points
   Compatible blood       = 50 points
   Eligible               = 20 points
   Same location          = 10 points

   Maximum exact match:
   70 + 20 + 10 = 100%

   Compatible match:
   50 + 20 + 10 = 80%
*/


function calculateMatchScore(
    donor,
    request
) {

    let score = 0;


    /* =====================================================
       1. BLOOD GROUP
    ===================================================== */

    if (
        donor.bloodGroup ===
        request.bloodGroup
    ) {

        score += 70;

    }

    else {

        score += 50;

    }


    /* =====================================================
       2. ELIGIBILITY
    ===================================================== */

    if (
        donor.eligible === true
    ) {

        score += 20;

    }


    /* =====================================================
       3. SAME LOCATION
    ===================================================== */

    if (

        donor.location &&

        request.location &&

        donor.location
            .trim()
            .toLowerCase() ===

        request.location
            .trim()
            .toLowerCase()

    ) {

        score += 10;

    }


    return score;

}


/* =========================================================
   OPEN DONOR MODAL
========================================================= */

function openDonorModal(
    donorId,
    request
) {

    const storedDonors =
        localStorage.getItem(
            "bloodConnectDonors"
        );


    if (!storedDonors) {

        return;

    }


    let donors;


    try {

        donors =
            JSON.parse(storedDonors);

    }

    catch (error) {

        return;

    }


    const donor =
        donors.find(function (item) {

            return String(item.id) ===
                String(donorId);

        });


    if (!donor) {

        return;

    }


    /* =====================================================
       CALCULATE SCORE
    ===================================================== */

    const score =
        calculateMatchScore(
            donor,
            request
        );


    /* =====================================================
       FILL DONOR DETAILS
    ===================================================== */

    modalAvatar.textContent =
        getInitials(donor.name);


    modalDonorName.textContent =
        donor.name;


    modalBloodGroup.textContent =
        donor.bloodGroup;


    modalMatchScore.textContent =
        score + "%";


    modalAge.textContent =
        donor.age
            ? donor.age + " years"
            : "—";


    modalLocation.textContent =
        donor.location || "—";


    modalPhone.textContent =
        donor.phone || "Not available";


    modalEmail.textContent =
        donor.email || "Not available";


    /* =====================================================
       LAST DONATION
    ===================================================== */

    if (!donor.lastDonationDate) {

        modalLastDonation.textContent =
            "First-time donor";

    }

    else {

        modalLastDonation.textContent =
            formatDisplayDate(
                donor.lastDonationDate
            );

    }


    /* =====================================================
       CONTACT BUTTON
    ===================================================== */

    modalContactButton.onclick =
        function () {

            if (donor.phone) {

                window.location.href =
                    "tel:" + donor.phone;

            }

        };


    /* =====================================================
       SHOW MODAL
    ===================================================== */

    donorModal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE DONOR MODAL
========================================================= */

function closeDonorModal() {

    donorModal.hidden = true;

    document.body.classList.remove(
        "modal-open"
    );

}


closeModal.addEventListener(
    "click",
    closeDonorModal
);


modalOverlay.addEventListener(
    "click",
    closeDonorModal
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !donorModal.hidden
        ) {

            closeDonorModal();

        }

    }
);


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (

        words[0][0] +

        words[words.length - 1][0]

    ).toUpperCase();

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(text) {

    if (!text) {

        return "";

    }


    return (

        text.charAt(0).toUpperCase() +

        text.slice(1)

    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDisplayDate(dateString) {

    if (!dateString) {

        return "—";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


