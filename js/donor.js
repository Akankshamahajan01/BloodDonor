/* =========================================================
   BLOODCONNECT
   DONOR REGISTRATION + ELIGIBILITY
========================================================= */


/* =========================================================
   GET FORM ELEMENTS
========================================================= */

const donorForm =
    document.getElementById("donorForm");


const eligibilityResult =
    document.getElementById("eligibilityResult");



/* =========================================================
   FORM SUBMIT
========================================================= */

donorForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* =================================================
           GET VALUES
        ================================================= */

        const name =
            document
                .getElementById("fullName")
                .value
                .trim();


        const age =
            Number(
                document
                    .getElementById("age")
                    .value
            );


        const bloodGroup =
            document
                .getElementById("bloodGroup")
                .value;


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const location =
            document
                .getElementById("location")
                .value
                .trim();


        /*
            IMPORTANT:
            This ID now matches donor.html
        */

        const lastDonationDate =
            document
                .getElementById("lastDonationDate")
                .value;



        /* =================================================
           VALIDATION
        ================================================= */


        if (name.length < 2) {

            showResult(
                "error",
                "Please enter a valid name."
            );

            return;
        }



        if (age < 18 || age > 65) {

            showResult(
                "error",
                "Age must be between 18 and 65."
            );

            return;
        }



        if (!bloodGroup) {

            showResult(
                "error",
                "Please select your blood group."
            );

            return;
        }



        if (!/^[0-9]{10}$/.test(phone)) {

            showResult(
                "error",
                "Please enter a valid 10-digit phone number."
            );

            return;
        }



        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            showResult(
                "error",
                "Please enter a valid email address."
            );

            return;
        }



        if (location.length < 2) {

            showResult(
                "error",
                "Please enter your location."
            );

            return;
        }



        /* =================================================
           CALCULATE ELIGIBILITY
        ================================================= */

        const result =
            calculateEligibility(
                lastDonationDate
            );



        /* =================================================
           CREATE DONOR OBJECT
        ================================================= */

        const donor = {

            id: Date.now(),

            name: name,

            age: age,

            bloodGroup: bloodGroup,

            phone: phone,

            email: email,

            location: location,

            lastDonationDate:
                lastDonationDate || null,

            eligible:
                result.eligible,

            nextEligibleDate:
                result.nextEligibleDate,

            daysRemaining:
                result.daysRemaining,

            registeredAt:
                new Date().toISOString()

        };



        /* =================================================
           SAVE DONOR
        ================================================= */

        saveDonor(donor);



        /* =================================================
           SHOW ELIGIBILITY RESULT
        ================================================= */

        if (result.eligible) {

            showResult(

                "success",

                `
                    <strong>
                        ✓ You are currently eligible.
                    </strong>

                    <p>
                        Your donor profile has been
                        registered successfully.
                    </p>

                    <small>
                        Blood Group:
                        ${bloodGroup}
                    </small>
                `

            );

        }


        else {

            showResult(

                "warning",

                `
                    <strong>
                        ⚠ You are not currently eligible.
                    </strong>

                    <p>
                        You can donate again in
                        <strong>
                            ${result.daysRemaining} days.
                        </strong>
                    </p>

                    <small>
                        Next eligible date:
                        ${formatDisplayDate(
                            result.nextEligibleDate
                        )}
                    </small>
                `

            );

        }

    }
);



/* =========================================================
   ELIGIBILITY CALCULATION
========================================================= */

function calculateEligibility(
    lastDonationDate
) {


    /*
        FIRST-TIME DONOR

        Empty date = eligible
    */

    if (!lastDonationDate) {

        return {

            eligible: true,

            nextEligibleDate: null,

            daysRemaining: 0

        };

    }



    /* =================================================
       LAST DONATION DATE
    ================================================= */

    const lastDate =
        new Date(
            lastDonationDate + "T00:00:00"
        );



    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );



    /* =================================================
       56-DAY DONATION COOLDOWN
    ================================================= */

    const nextDate =
        new Date(lastDate);


    nextDate.setDate(
        nextDate.getDate() + 56
    );



    /* =================================================
       ELIGIBLE
    ================================================= */

    if (today >= nextDate) {

        return {

            eligible: true,

            nextEligibleDate:
                formatStorageDate(
                    nextDate
                ),

            daysRemaining: 0

        };

    }



    /* =================================================
       NOT ELIGIBLE
    ================================================= */

    const difference =
        nextDate.getTime() -
        today.getTime();


    const daysRemaining =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    return {

        eligible: false,

        nextEligibleDate:
            formatStorageDate(
                nextDate
            ),

        daysRemaining:
            daysRemaining

    };

}



/* =========================================================
   SAVE DONOR (SMART UPDATE / DEDUPLICATION)
========================================================= */

function saveDonor(donor) {

    let donors = [];

    const stored =
        localStorage.getItem(
            "bloodConnectDonors"
        );

    if (stored) {
        try {
            donors = JSON.parse(stored);
        } catch (error) {
            donors = [];
        }
    }

    if (!Array.isArray(donors)) {
        donors = [];
    }

    // Check if donor already exists by email, phone, or name
    const existingIndex = donors.findIndex(function (d) {
        return (
            (donor.email && d.email && d.email.toLowerCase() === donor.email.toLowerCase()) ||
            (donor.phone && d.phone && d.phone === donor.phone) ||
            (donor.name && d.name && d.name.toLowerCase() === donor.name.toLowerCase() && d.bloodGroup === donor.bloodGroup)
        );
    });

    if (existingIndex !== -1) {
        // Update existing donor profile with latest details
        donors[existingIndex] = {
            ...donors[existingIndex],
            ...donor,
            id: donors[existingIndex].id || donor.id
        };
    } else {
        // Add new unique donor
        donors.push(donor);
    }

    localStorage.setItem(
        "bloodConnectDonors",
        JSON.stringify(donors)
    );

}




/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(
    type,
    message
) {


    eligibilityResult.hidden =
        false;


    eligibilityResult.style.display =
        "flex";


    eligibilityResult.className =
        "eligibility-result " + type;


    eligibilityResult.innerHTML = `

        <div class="result-icon">

            ${
                type === "success"
                    ? "✓"
                    : "!"
            }

        </div>


        <div>

            ${message}

        </div>

    `;


    eligibilityResult.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}



/* =========================================================
   FORMAT DATE FOR LOCAL STORAGE
========================================================= */

function formatStorageDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}



/* =========================================================
   FORMAT DATE FOR DISPLAY
========================================================= */

function formatDisplayDate(
    dateString
) {

    if (!dateString) {

        return "";

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