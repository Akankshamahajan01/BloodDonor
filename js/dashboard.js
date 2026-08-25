/* =========================================================
   BLOODCONNECT — DASHBOARD CONTROLLER v2
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ─── AUTH GUARD ─── */
    if (typeof requireLogin === "function") {
        if (!requireLogin()) return;
    }

    /* ─── HELPERS ─── */
    function initials(name) {
        if (!name) return "?";
        return name.split(" ").slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    }

    function fmtDate(iso) {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        } catch (e) { return "—"; }
    }

    function get(id) { return document.getElementById(id); }

    function animateNum(el, target, duration) {
        if (!el) return;
        if (target === 0) { el.textContent = 0; return; }
        var start = null;
        duration = duration || 900;
        function step(ts) {
            if (!start) start = ts;
            var p    = Math.min((ts - start) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ─── TIME GREETING ─── */
    (function () {
        var h  = new Date().getHours();
        var g  = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
        var el = get("timeGreeting");
        if (el) el.textContent = g;
    })();

    /* ─── DATE ─── */
    (function () {
        var now    = new Date();
        var dayEl  = get("heroDay");
        var dateEl = get("heroDate");
        if (dayEl)  dayEl.textContent  = now.toLocaleDateString("en-IN", { weekday: "long" });
        if (dateEl) dateEl.textContent = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    })();

    /* ─── USER PROFILE ─── */
    var currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;

    if (currentUser) {
        var first = (currentUser.name || "User").split(" ")[0];
        if (get("dashboardName")) get("dashboardName").textContent = first;
        if (get("profileAvatar")) get("profileAvatar").textContent = initials(currentUser.name);
        if (get("profileName"))   get("profileName").textContent   = currentUser.name  || "—";
        if (get("profileEmail"))  get("profileEmail").textContent  = currentUser.email || "—";
        if (get("profilePhone"))  get("profilePhone").textContent  = currentUser.phone || "—";
        if (get("profileSince"))  get("profileSince").textContent  = fmtDate(currentUser.createdAt);
    }

    /* ─── LOGOUT (both buttons) ─── */
    ["logoutButton", "logoutButton2"].forEach(function (id) {
        var btn = get(id);
        if (btn && typeof logoutUser === "function") {
            btn.addEventListener("click", logoutUser);
        }
    });

    /* ─── STATS ─── */
    (function () {
        var donors   = typeof getAllDonors === "function" ? getAllDonors() : [];
        var eligible = donors.filter(function (d) { return d.eligible === true; });
        var cities   = new Set(donors.map(function (d) { return d.location; }).filter(Boolean));

        var requests = [];
        try {
            var r = localStorage.getItem("bloodConnectRequests");
            if (r) requests = JSON.parse(r) || [];
        } catch (e) {}

        animateNum(get("statDonors"),   donors.length,   900);
        animateNum(get("statRequests"), requests.length, 900);
        animateNum(get("statEligible"), eligible.length, 900);
        animateNum(get("statCities"),   cities.size,     900);
    })();

});
