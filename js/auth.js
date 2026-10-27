/* =========================================================
   BLOODCONNECT
   AUTHENTICATION + PROTECTED NAVIGATION
   PHASE 1 — LOCAL STORAGE
========================================================= */


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    const storedUser =
        localStorage.getItem(
            "bloodConnectCurrentUser"
        );

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(storedUser);

    } catch (error) {

        return null;

    }
}


/* =========================================================
   LOGIN USER
========================================================= */

function loginUser(user) {

    localStorage.setItem(

        "bloodConnectCurrentUser",

        JSON.stringify(user)

    );

}


/* =========================================================
   LOGOUT USER
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        "bloodConnectCurrentUser"
    );

    window.location.href =
        "../index.html";

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isLoggedIn() {

    return getCurrentUser() !== null;

}


/* =========================================================
   PROTECTED NAVIGATION
========================================================= */

/*
    Used for:

    Find Blood
    Donate Blood
    Dashboard

    If user is logged in:
        → directly open page

    If user is logged out:
        → go to login page
        → remember where user wanted to go
*/


function protectedNavigation(
    destination
) {

    if (isLoggedIn()) {

        window.location.href =
            destination;

        return;

    }


    /*
        Save requested page
        so after login we can
        send the user there.
    */

    sessionStorage.setItem(

        "bloodConnectRedirect",

        destination

    );


    window.location.href =
        getLoginPath();

}


/* =========================================================
   LOGIN PATH
========================================================= */

/*
    This function handles links
    from both:

    index.html
    pages/*.html
*/


function getLoginPath() {

    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes("/pages/")
    ) {

        return "login.html";

    }


    return "pages/login.html";

}


/* =========================================================
   REDIRECT AFTER LOGIN
========================================================= */

function redirectAfterLogin() {

    const destination =
        sessionStorage.getItem(
            "bloodConnectRedirect"
        );


    /*
        Remove saved destination
        so it isn't reused later.
    */

    sessionStorage.removeItem(
        "bloodConnectRedirect"
    );


    if (destination) {

        window.location.href =
            destination;

        return;

    }


    /*
        Normal login
        → Dashboard
    */

    window.location.href =
        "dashboard.html";

}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

/*
    Put this on protected pages
    like:

    donor.html
    request.html
    dashboard.html
*/


function requireLogin() {

    if (isLoggedIn()) {

        return true;

    }


    /*
        Save current page
        before sending user to login.
    */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    sessionStorage.setItem(

        "bloodConnectRedirect",

        currentPage

    );


    window.location.href =
        "login.html";

    return false;

}


/* =========================================================
   UPDATE NAVBAR
========================================================= */

/*
    Navbar automatically changes:

    LOGGED OUT:

    Login | Register


    LOGGED IN:

    👤 User Name
*/


function updateNavbar() {

    const authArea =
        document.getElementById(
            "navbarAuth"
        );


    if (!authArea) {

        return;

    }


    const user =
        getCurrentUser();


    /* =====================================================
       LOGGED OUT
    ===================================================== */

    if (!user) {

        authArea.innerHTML = `

            <a
                href="${getLoginPath()}"
                class="navbar-login"
            >
                Login
            </a>


            <a
                href="${getRegisterPath()}"
                class="navbar-register"
            >
                Register
                <span>→</span>
            </a>

        `;

        return;

    }


    /* =====================================================
       LOGGED IN
    ===================================================== */

    const firstName =
        user.name
            .split(" ")[0];


    authArea.innerHTML = `

        <div class="profile-wrapper">

            <button
                type="button"
                class="profile-button"
                id="profileButton"
            >

                <span class="profile-avatar">
                    ${getInitials(user.name)}
                </span>

                <span class="profile-name">
                    ${escapeHTML(firstName)}
                </span>

                <span class="profile-arrow">
                    ▾
                </span>

            </button>


            <div
                class="profile-dropdown"
                id="profileDropdown"
            >

                <div class="profile-dropdown-header">

                    <div class="dropdown-avatar">
                        ${getInitials(user.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(user.name)}
                        </strong>

                        <span>
                            ${escapeHTML(user.email)}
                        </span>

                    </div>

                </div>


                <div class="dropdown-divider"></div>


                <a
                    href="${getDashboardPath()}"
                    class="dropdown-link"
                >

                    <span>→</span>

                    My Dashboard

                </a>


                <button
                    type="button"
                    class="dropdown-logout"
                    id="dropdownLogout"
                >

                    <span>↪</span>

                    Logout

                </button>

            </div>

        </div>

    `;


    /* =====================================================
       PROFILE DROPDOWN
    ===================================================== */

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    profileButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            profileDropdown.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        function () {

            profileDropdown.classList.remove(
                "show"
            );

        }
    );


    /* =====================================================
       LOGOUT BUTTON
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "dropdownLogout"
        );


    logoutButton.addEventListener(
        "click",
        logoutUser
    );

}


/* =========================================================
   REGISTER PATH
========================================================= */

function getRegisterPath() {

    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes("/pages/")
    ) {

        return "register.html";

    }


    return "pages/register.html";

}


/* =========================================================
   DASHBOARD PATH
========================================================= */

function getDashboardPath() {

    const currentPath =
        window.location.pathname;


    if (
        currentPath.includes("/pages/")
    ) {

        return "dashboard.html";

    }


    return "pages/dashboard.html";

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "U";

    }


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
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


/* =========================================================
   RUN NAVBAR UPDATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateNavbar();

    }
);