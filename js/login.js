/* =========================================================
   BLOODCONNECT
   LOGIN — calls backend API
========================================================= */

const loginForm    = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document
        .getElementById("loginEmail")
        .value.trim()
        .toLowerCase();

    const password = document
        .getElementById("loginPassword")
        .value;

    if (!email || !password) {
        showLoginMessage("error", "Email and password are required.");
        return;
    }

    /* ── Call backend API ── */
    try {
        const response = await fetch(CONFIG.API.LOGIN, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            showLoginMessage("error", data.message || "Incorrect email or password.");
            return;
        }

        /* ── Save token + user ── */
        localStorage.setItem("bloodConnectToken", data.token);
        localStorage.setItem(
            "bloodConnectCurrentUser",
            JSON.stringify(data.user)
        );

        // Also call loginUser for navbar compatibility
        if (typeof loginUser === "function") {
            loginUser(data.user);
        }

        showLoginMessage("success", "Login successful! Opening your dashboard...");

        setTimeout(function () {
            if (typeof redirectAfterLogin === "function") {
                redirectAfterLogin();
            } else {
                window.location.href = "dashboard.html";
            }
        }, 700);

    } catch (err) {
        showLoginMessage(
            "error",
            "Could not connect to the server. Please try again."
        );
        console.error("Login error:", err);
    }
});

function showLoginMessage(type, message) {
    loginMessage.hidden    = false;
    loginMessage.className = "auth-message " + type;
    loginMessage.textContent = message;
}
