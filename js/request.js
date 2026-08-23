/* =========================================================
   BLOODCONNECT
   BLOOD REQUEST + MATCHING SYSTEM
   PHASE 1 — VANILLA JS + LOCALSTORAGE
========================================================= */


/* =========================================================
   GET FORM
========================================================= */

const requestForm =
    document.getElementById("requestForm");


/* =========================================================
   FORM SUBMIT
========================================================= */

requestForm.addEventListener("submit", function (event) {

    event.preventDefault();


    /* =====================================================
       GET VALUES
    ===================================================== */

    const patientName =
        document
            .getElementById("patientName")
            .value
            .trim();


    const bloodGroup =
        document
            .getElementById("requiredBloodGroup")
            .value;


    /*
       IMPORTANT:
       Your HTML uses "unitsRequired"
    */

    const units =
        Number(
            document
                .getElementById("unitsRequired")
                .value
        );


    const urgency =
        document
            .getElementById("urgency")
            .value;


    const hospital =
        document
            .getElementById("hospital")
            .value
            .trim();


    /*
       IMPORTANT:
       Your HTML uses "requestLocation"
    */

    const location =
        document
            .getElementById("requestLocation")
            .value
            .trim();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (patientName.length < 2) {

        alert(
            "Please enter the patient's name."
        );

        return;
    }


    if (!bloodGroup) {

        alert(
            "Please select the required blood group."
        );

        return;
    }


    if (!units || units < 1 || units > 10) {

        alert(
            "Please enter between 1 and 10 units."
        );

        return;
    }


    if (!urgency) {

        alert(
            "Please select the urgency."
        );

        return;
    }


    if (hospital.length < 2) {

        alert(
            "Please enter the hospital name."
        );

        return;
    }


    if (location.length < 2) {

        alert(
            "Please enter the location."
        );

        return;
    }


    /* =====================================================
       CREATE REQUEST OBJECT
    ===================================================== */

    const request = {

        id: Date.now(),

        patientName:
            patientName,

        bloodGroup:
            bloodGroup,

        units:
            units,

        urgency:
            urgency,

        hospital:
            hospital,

        location:
            location,

        status:
            "active",

        createdAt:
            new Date().toISOString()

    };


    /* =====================================================
       SAVE CURRENT REQUEST
    ===================================================== */

    localStorage.setItem(

        "bloodConnectCurrentRequest",

        JSON.stringify(request)

    );


    /* =====================================================
       SAVE REQUEST TO REQUEST LIST
    ===================================================== */

    saveRequest(request);


    /* =====================================================
       FIND MATCHING DONORS
    ===================================================== */

    const matches =
        findMatchingDonors(request);


    /* =====================================================
       SAVE MATCHES
    ===================================================== */

    localStorage.setItem(

        "bloodConnectCurrentMatches",

        JSON.stringify(matches)

    );


    /* =====================================================
       GO TO MATCHES PAGE
    ===================================================== */

    window.location.href =
        "matches.html";

});



/* =========================================================
   SAVE REQUEST
========================================================= */

function saveRequest(request) {


    let requests = [];


    const storedRequests =
        localStorage.getItem(
            "bloodConnectRequests"
        );


    if (storedRequests) {

        try {

            requests =
                JSON.parse(storedRequests);

        }

        catch (error) {

            requests = [];

        }

    }


    if (!Array.isArray(requests)) {

        requests = [];

    }


    requests.push(request);


    localStorage.setItem(

        "bloodConnectRequests",

        JSON.stringify(requests)

    );

}



/* =========================================================
   FIND MATCHING DONORS
========================================================= */

function findMatchingDonors(request) {


    const storedDonors =
        localStorage.getItem(
            "bloodConnectDonors"
        );


    /*
       If there are no registered donors,
       return an empty array.
    */

    if (!storedDonors) {

        return [];

    }


    let donors;


    try {

        donors =
            JSON.parse(storedDonors);

    }

    catch (error) {

        return [];

    }


    if (!Array.isArray(donors)) {

        return [];

    }



    /* =====================================================
       FILTER DONORS
    ===================================================== */

    const matchingDonors =
        donors.filter(function (donor) {


            /* =============================================
               CHECK EXACT BLOOD GROUP
            ============================================= */

            const compatible =
                isBloodCompatible(

                    donor.bloodGroup,

                    request.bloodGroup

                );


            /* =============================================
               CHECK DONOR ELIGIBILITY
            ============================================= */

            const eligible =
                donor.eligible === true;


            /*
               Donor will appear ONLY if:

               1. Blood group is EXACTLY the same
               2. Donor is eligible
            */

            return compatible && eligible;

        });



    return matchingDonors;

}



/* =========================================================
   EXACT BLOOD GROUP MATCHING
========================================================= */

const compatibilityMatrix = {


    /* A positive */

    "A+": [
        "A+"
    ],


    /* A negative */

    "A-": [
        "A-"
    ],


    /* B positive */

    "B+": [
        "B+"
    ],


    /* B negative */

    "B-": [
        "B-"
    ],


    /* AB positive */

    "AB+": [
        "AB+"
    ],


    /* AB negative */

    "AB-": [
        "AB-"
    ],


    /* O positive */

    "O+": [
        "O+"
    ],


    /* O negative */

    "O-": [
        "O-"
    ]

};



/* =========================================================
   CHECK BLOOD COMPATIBILITY
========================================================= */

function isBloodCompatible(

    donorBloodGroup,

    requiredBloodGroup

) {


    const compatibleDonors =
        compatibilityMatrix[
            requiredBloodGroup
        ];


    /*
       If the requested blood group
       does not exist in our matrix.
    */

    if (!compatibleDonors) {

        return false;

    }


    /*
       EXACT MATCH CHECK

       Example:

       Request = A+
       Donor  = A+

       TRUE

       Request = A+
       Donor  = A-

       FALSE
    */

    return compatibleDonors.includes(
        donorBloodGroup
    );

}



/* =========================================================
   CHECK DONOR ELIGIBILITY
========================================================= */

function isDonorEligible(donor) {

    return donor.eligible === true;

}