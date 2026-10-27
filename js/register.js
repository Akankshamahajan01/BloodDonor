/* =========================================================
   BLOODCONNECT
   REGISTER — calls backend API
========================================================= */

const registerForm    = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document
        .getElementById("registerName")
        .value.trim();

    const email = document
        .getElementById("registerEmail")
        .value.trim()
        .toLowerCase();

    const phone = document
        .getElementById("registerPhone")
        .value.trim();

    const password = document
        .getElementById("registerPassword")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;

    /* ── Client-side validation ── */
    if (name.length < 2) {
        showRegisterMessage("error", "Please enter a valid name.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showRegisterMessage("error", "Please enter a valid email address.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showRegisterMessage("error", "Please enter a valid 10-digit phone number.");
        return;
    }

    const pwErrors = [];
    if (password.length < 8)               pwErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(password))           pwErrors.push("one uppercase letter");
    if (!/[a-z]/.test(password))           pwErrors.push("one lowercase letter");
    if (!/[0-9]/.test(password))           pwErrors.push("one number");
    if (!/[^A-Za-z0-9]/.test(password))   pwErrors.push("one special character (!@#$%^&*)");

    if (pwErrors.length > 0) {
        showRegisterMessage("error", "Password must include: " + pwErrors.join(", ") + ".");
        return;
    }

    if (password !== confirmPassword) {
        showRegisterMessage("error", "Passwords do not match.");
        return;
    }

    /* ── Call backend API ── */
    try {
        const response = await fetch(CONFIG.API.REGISTER, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            showRegisterMessage("error", data.message || "Registration failed.");
            return;
        }

        /* ── Save JWT token and user ── */
        localStorage.setItem("bloodConnectToken", data.token);
        localStorage.setItem(
            "bloodConnectCurrentUser",
            JSON.stringify(data.user)
        );

        showRegisterMessage("success", "Account created successfully! Redirecting...");
        registerForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);

    } catch (err) {
        showRegisterMessage(
            "error",
            "Could not connect to the server. Please try again."
        );
        console.error("Register error:", err);
    }
});

/* ── Show message helper ── */
function showRegisterMessage(type, message) {
    registerMessage.hidden    = false;
    registerMessage.className = "auth-message " + type;
    registerMessage.textContent = message;
}
