/* =========================================================
   BLOODCONNECT
   USER DASHBOARD CONTROLLER (VANILLA JS)
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    if (typeof requireLogin === "function") {
        if (!requireLogin()) {
            return;
        }
    }

    if (typeof getCurrentUser === "function") {
        const user = getCurrentUser();

        if (user) {
            const dashboardName = document.getElementById("dashboardName");
            const profileName = document.getElementById("profileName");
            const profileEmail = document.getElementById("profileEmail");
            const profilePhone = document.getElementById("profilePhone");

            if (dashboardName) dashboardName.textContent = (user.name || "User").split(" ")[0];
            if (profileName) profileName.textContent = user.name || "—";
            if (profileEmail) profileEmail.textContent = user.email || "—";
            if (profilePhone) profilePhone.textContent = user.phone || "—";
        }
    }

    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn && typeof logoutUser === "function") {
        logoutBtn.addEventListener("click", logoutUser);
    }
});
