/* =========================================================
   BLOODCONNECT — API CONFIG
   Change API_BASE_URL to your deployed backend URL
   before submitting / after deploying.
========================================================= */

const CONFIG = (function () {

    // ── Replace this with your Render / Railway deployed URL ──
    // Example: "https://bloodconnect-api.onrender.com"
    const API_BASE_URL = "http://localhost:5000";

    return {
        API_BASE_URL: API_BASE_URL,
        API: {
            REGISTER:        API_BASE_URL + "/api/auth/register",
            LOGIN:           API_BASE_URL + "/api/auth/login",
            ME:              API_BASE_URL + "/api/auth/me",
            DONORS:          API_BASE_URL + "/api/donors",
            DONOR_REGISTER:  API_BASE_URL + "/api/donors/register",
            DONOR_SEARCH:    API_BASE_URL + "/api/donors/search",
            DONOR_STATS:     API_BASE_URL + "/api/donors/stats",
            REQUESTS:        API_BASE_URL + "/api/requests",
        },
    };

})();
