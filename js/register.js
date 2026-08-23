/* =========================================================
   BLOODCONNECT
   REGISTER
   PHASE 1 — LOCALSTORAGE
========================================================= */


const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");



registerForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                .value
                .trim();


        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim()
                .toLowerCase();


        const phone =
            document
                .getElementById("registerPhone")
                .value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;



        /* ================= VALIDATION ================= */

        if (name.length < 2) {

            showRegisterMessage(
                "error",
                "Please enter a valid name."
            );

            return;

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            showRegisterMessage(
                "error",
                "Please enter a valid email address."
            );

            return;

        }


        if (!/^[0-9]{10}$/.test(phone)) {

            showRegisterMessage(
                "error",
                "Please enter a valid 10-digit phone number."
            );

            return;

        }


        if (password.length < 6) {

            showRegisterMessage(
                "error",
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            showRegisterMessage(
                "error",
                "Passwords do not match."
            );

            return;

        }



        /* ================= GET USERS ================= */

        let users =
            JSON.parse(
                localStorage.getItem(
                    "bloodConnectUsers"
                )
            ) || [];


        if (!Array.isArray(users)) {

            users = [];

        }



        /* ================= DUPLICATE EMAIL ================= */

        const existingUser =
            users.find(function (user) {

                return user.email === email;

            });


        if (existingUser) {

            showRegisterMessage(
                "error",
                "An account with this email already exists."
            );

            return;

        }



        /* ================= CREATE USER ================= */

        const user = {

            id: Date.now(),

            name: name,

            email: email,

            phone: phone,

            password: password,

            createdAt:
                new Date().toISOString()

        };



        users.push(user);



        /* ================= SAVE ================= */

        localStorage.setItem(

            "bloodConnectUsers",

            JSON.stringify(users)

        );



        /* ================= SUCCESS ================= */

        showRegisterMessage(

            "success",

            "Account created successfully! Redirecting to login..."

        );


        registerForm.reset();



        setTimeout(function () {

            window.location.href =
                "login.html";

        }, 1200);

    }
);



/* =========================================================
   SHOW MESSAGE
========================================================= */

function showRegisterMessage(
    type,
    message
) {

    registerMessage.hidden = false;

    registerMessage.className =
        "auth-message " + type;

    registerMessage.textContent =
        message;

}