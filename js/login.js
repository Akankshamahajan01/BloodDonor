/* =========================================================
   BLOODCONNECT
   LOGIN
========================================================= */


const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");



loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById("loginPassword")
                .value;



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



        /* ================= FIND USER ================= */

        const user =
            users.find(function (item) {

                return (

                    item.email === email &&

                    item.password === password

                );

            });



        /* ================= INVALID ================= */

        if (!user) {

            showLoginMessage(

                "error",

                "Incorrect email or password."

            );

            return;

        }



        /* ================= LOGIN ================= */

        loginUser(user);



        showLoginMessage(

            "success",

            "Login successful! Opening your dashboard..."

        );



        /* ================= REDIRECT ================= */

        setTimeout(function () {

            redirectAfterLogin();

        }, 700);

    }
);



/* =========================================================
   SHOW MESSAGE
========================================================= */

function showLoginMessage(
    type,
    message
) {

    loginMessage.hidden = false;

    loginMessage.className =
        "auth-message " + type;

    loginMessage.textContent =
        message;

}