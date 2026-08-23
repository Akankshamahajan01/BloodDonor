/* =========================================================
   BLOODCONNECT
   API MODULE — Fetch donor data from randomuser.me API
   Cache in localStorage, merge with local donors
========================================================= */

const BloodAPI = (function () {

    const API_URL         = "https://randomuser.me/api/";
    const CACHE_KEY       = "bloodConnect_apiCache";
    const CACHE_TIME_KEY  = "bloodConnect_apiCacheTime";
    const CACHE_TTL_MS    = 60 * 60 * 1000; // 1 hour

    /* -------------------------------------------------------
       BLOOD GROUPS LIST (for random assignment)
    ------------------------------------------------------- */
    const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    /* -------------------------------------------------------
       Indian cities for realistic location
    ------------------------------------------------------- */
    const CITIES = [
        "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad",
        "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh",
        "Kolkata", "Surat", "Bhopal", "Kochi", "Nagpur",
        "Indore", "Patna", "Vadodara", "Coimbatore", "Visakhapatnam",
        "Gurgaon", "Noida", "Agra", "Varanasi", "Meerut",
        "Rajkot", "Nashik", "Aurangabad", "Jodhpur", "Mysore",
        "Amritsar", "Faridabad", "Ghaziabad", "Ranchi", "Thiruvananthapuram"
    ];

    /* -------------------------------------------------------
       Read cached API donors
    ------------------------------------------------------- */
    function readCache() {
        try {
            const timeStr = localStorage.getItem(CACHE_TIME_KEY);
            if (!timeStr) return null;

            const age = Date.now() - parseInt(timeStr, 10);
            if (age > CACHE_TTL_MS) return null; // stale

            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;

            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : null;
        } catch (e) {
            return null;
        }
    }

    /* -------------------------------------------------------
       Write donors to cache
    ------------------------------------------------------- */
    function writeCache(donors) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(donors));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (e) {
            console.warn("BloodAPI: could not write cache", e);
        }
    }

    /* -------------------------------------------------------
       Transform a randomuser.me result into a donor object
    ------------------------------------------------------- */
    function transformUser(user, index) {
        const bloodGroup = ALL_BLOOD_GROUPS[index % ALL_BLOOD_GROUPS.length];
        const city       = CITIES[Math.floor(Math.random() * CITIES.length)];

        // generate a plausible last donation date (2–18 months ago)
        const monthsAgo = Math.floor(Math.random() * 16) + 2;
        const lastDate  = new Date();
        lastDate.setMonth(lastDate.getMonth() - monthsAgo);
        const lastDonationDate = lastDate.toISOString().split("T")[0];

        // eligible if last donation >= 56 days ago (which is always true here)
        const eligible = true;

        return {
            id:               "api_" + user.login.uuid,
            name:             user.name.first + " " + user.name.last,
            age:              user.dob.age,
            bloodGroup:       bloodGroup,
            phone:            user.phone.replace(/[^0-9]/g, "").slice(-10).padStart(10, "9"),
            email:            user.email,
            location:         city,
            lastDonationDate: lastDonationDate,
            eligible:         eligible,
            source:           "api",
            avatarUrl:        user.picture.medium,
            createdAt:        new Date().toISOString()
        };
    }

    /* -------------------------------------------------------
       Fetch 40 random users from randomuser.me
       Returns Promise<Array>
    ------------------------------------------------------- */
    function fetchFromAPI() {
        return fetch(API_URL + "?results=40&nat=in&inc=name,email,phone,dob,picture,login")
            .then(function (res) {
                if (!res.ok) throw new Error("API response not OK");
                return res.json();
            })
            .then(function (data) {
                if (!data.results || !Array.isArray(data.results)) return [];
                const donors = data.results.map(transformUser);
                writeCache(donors);
                return donors;
            })
            .catch(function (err) {
                console.warn("BloodAPI fetch failed:", err);
                return [];
            });
    }

    /* -------------------------------------------------------
       PUBLIC: getDonorsByBloodGroup(bloodGroup)
       Returns Promise<Array> — merged API + local donors
    ------------------------------------------------------- */
    function getDonorsByBloodGroup(bloodGroup) {
        const cached = readCache();

        const mergeAndFilter = function (apiDonors) {
            // Get local donors of this blood group
            const localDonors = (typeof window.getDonorsByBloodGroup === "function")
                ? window.getDonorsByBloodGroup(bloodGroup)
                : [];

            // Filter API donors to matching blood group
            const apiFiltered = bloodGroup
                ? apiDonors.filter(function (d) { return d.bloodGroup === bloodGroup; })
                : apiDonors;

            // Merge: local first (priority), then API, remove duplicates by email
            const seen   = new Set();
            const merged = [];

            function addDonor(d) {
                const key = (d.email || d.id || "").toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(d);
                }
            }

            localDonors.forEach(addDonor);
            apiFiltered.forEach(addDonor);

            return merged;
        };

        if (cached) {
            return Promise.resolve(mergeAndFilter(cached));
        }

        return fetchFromAPI().then(mergeAndFilter);
    }

    /* -------------------------------------------------------
       PUBLIC: getAllDonorsFromAPI()
       Returns Promise<Array> of all API donors (raw, cached)
    ------------------------------------------------------- */
    function getAllDonorsFromAPI() {
        const cached = readCache();
        if (cached) return Promise.resolve(cached);
        return fetchFromAPI();
    }

    /* -------------------------------------------------------
       PUBLIC: refreshCache()
       Force re-fetch regardless of cache age
    ------------------------------------------------------- */
    function refreshCache() {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);
        return fetchFromAPI();
    }

    /* -------------------------------------------------------
       PUBLIC: isCacheValid()
    ------------------------------------------------------- */
    function isCacheValid() {
        const timeStr = localStorage.getItem(CACHE_TIME_KEY);
        if (!timeStr) return false;
        return (Date.now() - parseInt(timeStr, 10)) < CACHE_TTL_MS;
    }

    /* -------------------------------------------------------
       PUBLIC: getNearbyHospitals(query, city)
       Calls Nominatim to search hospitals near a city
       Returns Promise<Array> of { name, address }
    ------------------------------------------------------- */
    function getNearbyHospitals(query, city) {
        const cityPart = city ? " " + city : "";
        const q        = encodeURIComponent("hospital " + query + cityPart);
        const url      = "https://nominatim.openstreetmap.org/search" +
                         "?q=" + q +
                         "&format=json&limit=6&addressdetails=1&countrycodes=in";

        return fetch(url, { headers: { "Accept-Language": "en" } })
            .then(function (r) { return r.json(); })
            .then(function (results) {
                return (results || []).map(function (item) {
                    const parts = item.display_name.split(",");
                    return {
                        name:    parts[0].trim(),
                        address: parts.slice(1, 3).join(",").trim(),
                        lat:     item.lat,
                        lon:     item.lon
                    };
                });
            })
            .catch(function () { return []; });
    }

    // Expose public API
    return {
        getDonorsByBloodGroup: getDonorsByBloodGroup,
        getAllDonorsFromAPI:   getAllDonorsFromAPI,
        refreshCache:          refreshCache,
        isCacheValid:          isCacheValid,
        getNearbyHospitals:   getNearbyHospitals
    };

})();
