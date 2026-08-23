/* =========================================================
   BLOODCONNECT — SEARCH PAGE CONTROLLER
   Powers search.html
   Features:
     • Patient form (name, blood group, units, urgency, hospital, city)
     • Nominatim hospital autocomplete
     • Nominatim city autocomplete + GPS "Near Me"
     • BloodAPI donor search with location-aware ranking
     • Donor card grid + detail modal
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const form            = document.getElementById("searchDonorForm");
    const pillBtns        = document.querySelectorAll(".blood-pill-btn");
    const pillsContainer  = document.getElementById("bloodGroupPills");
    const submitBtn       = document.getElementById("searchSubmitBtn");
    const gpsBtn          = document.getElementById("gpsBtn");

    const hospitalInput   = document.getElementById("searchHospital");
    const hospitalList    = document.getElementById("hospitalAutocomplete");
    const locationInput   = document.getElementById("searchLocation");
    const locationList    = document.getElementById("locationAutocomplete");

    const resultsSection  = document.getElementById("searchResultsSection");
    const resultsGrid     = document.getElementById("searchResultsGrid");
    const noResults       = document.getElementById("searchNoResults");
    const loadingEl       = document.getElementById("searchLoading");
    const resultsTitle    = document.getElementById("searchResultsTitle");
    const resultsSubtitle = document.getElementById("searchResultsSubtitle");
    const statTotal       = document.getElementById("statTotal");
    const statNearby      = document.getElementById("statNearby");
    const statLocal       = document.getElementById("statLocal");


    /* =========================================================
       STATE
    ========================================================= */

    let selectedBloodGroup = null;
    let isSearching        = false;
    let userCity           = "";      // resolved city from GPS or typed input


    /* =========================================================
       BLOOD GROUP PILLS
    ========================================================= */

    pillBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            pillBtns.forEach(function (b) { b.classList.remove("active"); });
            this.classList.add("active");
            selectedBloodGroup = this.dataset.group;
        });
    });


    /* =========================================================
       NOMINATIM HOSPITAL AUTOCOMPLETE
    ========================================================= */

    let hospitalTimeout = null;

    hospitalInput.addEventListener("input", function () {
        clearTimeout(hospitalTimeout);
        const query = this.value.trim();
        if (query.length < 3) { closeList(hospitalList); return; }

        hospitalTimeout = setTimeout(function () {
            searchHospitals(query);
        }, 400);
    });

    hospitalInput.addEventListener("blur", function () {
        setTimeout(function () { closeList(hospitalList); }, 200);
    });

    function searchHospitals(query) {
        // Build Nominatim URL — search hospitals/clinics globally, bias toward India
        const city    = locationInput.value.trim();
        const cityQ   = city ? " " + city : "";
        const encoded = encodeURIComponent("hospital " + query + cityQ);
        const url     = "https://nominatim.openstreetmap.org/search" +
                        "?q=" + encoded +
                        "&format=json&limit=6&addressdetails=1" +
                        "&featuretype=settlement" +
                        "&countrycodes=in";

        fetch(url, {
            headers: { "Accept-Language": "en" }
        })
        .then(function (r) { return r.json(); })
        .then(function (results) {
            renderAutocomplete(hospitalList, results, function (item) {
                hospitalInput.value = item.display_name.split(",")[0];
                closeList(hospitalList);
            }, "🏥");
        })
        .catch(function () { closeList(hospitalList); });
    }


    /* =========================================================
       NOMINATIM LOCATION (CITY) AUTOCOMPLETE
    ========================================================= */

    let locationTimeout = null;

    locationInput.addEventListener("input", function () {
        clearTimeout(locationTimeout);
        userCity = this.value.trim();
        const query = userCity;
        if (query.length < 2) { closeList(locationList); return; }

        locationTimeout = setTimeout(function () {
            searchCities(query);
        }, 400);
    });

    locationInput.addEventListener("blur", function () {
        setTimeout(function () { closeList(locationList); }, 200);
    });

    function searchCities(query) {
        const encoded = encodeURIComponent(query);
        const url     = "https://nominatim.openstreetmap.org/search" +
                        "?q=" + encoded +
                        "&format=json&limit=5&addressdetails=1" +
                        "&featuretype=city,town,village" +
                        "&countrycodes=in";

        fetch(url, {
            headers: { "Accept-Language": "en" }
        })
        .then(function (r) { return r.json(); })
        .then(function (results) {
            renderAutocomplete(locationList, results, function (item) {
                // Prefer city/town name, fallback to first segment
                const addr   = item.address || {};
                const chosen = addr.city || addr.town || addr.village || addr.state_district || item.display_name.split(",")[0];
                locationInput.value = chosen;
                userCity = chosen;
                closeList(locationList);
            }, "📍");
        })
        .catch(function () { closeList(locationList); });
    }


    /* =========================================================
       GENERIC AUTOCOMPLETE RENDERER
    ========================================================= */

    function renderAutocomplete(listEl, results, onSelect, icon) {
        listEl.innerHTML = "";

        if (!results || results.length === 0) {
            closeList(listEl);
            return;
        }

        results.forEach(function (item) {
            const parts   = item.display_name.split(",");
            const name    = parts[0].trim();
            const subName = parts.slice(1, 3).join(",").trim();

            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.innerHTML =
                "<span class=\"autocomplete-item-icon\">" + icon + "</span>" +
                "<div>" +
                  "<span class=\"autocomplete-item-name\">" + escapeHTML(name) + "</span>" +
                  "<span class=\"autocomplete-item-sub\">"  + escapeHTML(subName) + "</span>" +
                "</div>";

            div.addEventListener("mousedown", function (e) {
                e.preventDefault(); // don't fire blur before click
                onSelect(item);
            });

            listEl.appendChild(div);
        });

        listEl.classList.add("open");
    }

    function closeList(listEl) {
        listEl.classList.remove("open");
        listEl.innerHTML = "";
    }


    /* =========================================================
       GPS — "NEAR ME" BUTTON
    ========================================================= */

    gpsBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.");
            return;
        }

        gpsBtn.textContent  = "Locating…";
        gpsBtn.classList.add("loading");
        gpsBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            function (pos) {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                // Reverse geocode with Nominatim
                const url = "https://nominatim.openstreetmap.org/reverse" +
                            "?lat=" + lat + "&lon=" + lon +
                            "&format=json&addressdetails=1";

                fetch(url, { headers: { "Accept-Language": "en" } })
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        const addr   = data.address || {};
                        const city   = addr.city || addr.town || addr.village ||
                                       addr.county || addr.state_district || "";
                        if (city) {
                            locationInput.value = city;
                            userCity = city;
                            showToast("📍 Location set to " + city);
                        } else {
                            showToast("Could not determine city from your location.");
                        }
                    })
                    .catch(function () {
                        showToast("Could not reverse geocode your location.");
                    })
                    .finally(function () {
                        resetGpsBtn();
                    });
            },
            function (err) {
                showToast("Location access denied. Please enter your city manually.");
                resetGpsBtn();
            },
            { timeout: 8000 }
        );
    });

    function resetGpsBtn() {
        gpsBtn.textContent = "📍 Near Me";
        gpsBtn.classList.remove("loading");
        gpsBtn.disabled = false;
    }


    /* =========================================================
       FORM SUBMIT
    ========================================================= */

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (isSearching) return;

        // Validate blood group
        if (!selectedBloodGroup) {
            showToast("Please select a blood group first.");
            pillsContainer.classList.add("shake");
            setTimeout(function () { pillsContainer.classList.remove("shake"); }, 600);
            return;
        }

        // Validate location
        const location = locationInput.value.trim();
        if (!location) {
            showToast("Please enter a city or use 'Near Me'.");
            locationInput.focus();
            return;
        }

        userCity = location;

        // Save search / request details to localStorage
        const patientName = (document.getElementById("patientName") ? document.getElementById("patientName").value.trim() : "") || "Patient";
        const units = Number(document.getElementById("unitsRequired") ? document.getElementById("unitsRequired").value : 1) || 1;
        const urgency = (document.getElementById("urgency") ? document.getElementById("urgency").value : "") || "normal";
        const hospital = (document.getElementById("searchHospital") ? document.getElementById("searchHospital").value.trim() : "") || "";

        const requestData = {
            id: Date.now(),
            patientName: patientName,
            bloodGroup: selectedBloodGroup,
            units: units,
            urgency: urgency,
            hospital: hospital,
            location: userCity,
            status: "active",
            createdAt: new Date().toISOString()
        };

        try {
            localStorage.setItem("bloodConnectCurrentRequest", JSON.stringify(requestData));
            let allReqs = JSON.parse(localStorage.getItem("bloodConnectRequests") || "[]");
            if (!Array.isArray(allReqs)) allReqs = [];
            allReqs.push(requestData);
            localStorage.setItem("bloodConnectRequests", JSON.stringify(allReqs));
        } catch (err) {
            console.warn("Could not save request to localStorage:", err);
        }

        runSearch(selectedBloodGroup, userCity);
    });


    /* =========================================================
       AUTO-SEARCH from URL param  ?group=A%2B
    ========================================================= */

    const urlParams  = new URLSearchParams(window.location.search);
    const groupParam = urlParams.get("group");

    if (groupParam) {
        pillBtns.forEach(function (btn) {
            if (btn.dataset.group === groupParam) { btn.click(); }
        });
    }


    /* =========================================================
       MAIN SEARCH
    ========================================================= */

    function runSearch(bloodGroup, city) {

        isSearching = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>⏳</span> Searching…";

        resultsSection.hidden = false;
        showLoading(true);
        resultsGrid.innerHTML = "";
        noResults.hidden = true;

        resultsTitle.innerHTML = "Donors for <span>" + escapeHTML(bloodGroup) + "</span>";
        if (city) {
            resultsTitle.innerHTML += " near <span>" + escapeHTML(city) + "</span>";
        }
        resultsSubtitle.textContent = "Fetching from database and local registry…";

        BloodAPI.getDonorsByBloodGroup(bloodGroup)
            .then(function (donors) {

                showLoading(false);
                isSearching = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = "<span>🔍</span> Find Matching Donors <span>→</span>";

                if (!donors || donors.length === 0) {
                    resultsSubtitle.textContent = "No donors found for this blood group.";
                    noResults.hidden = false;
                    updateStats(0, 0, 0);
                    return;
                }

                // Location-aware sorting
                const cityLower = city.toLowerCase();

                donors.sort(function (a, b) {
                    const aNear = (a.location || "").toLowerCase().includes(cityLower);
                    const bNear = (b.location || "").toLowerCase().includes(cityLower);
                    if (aNear && !bNear) return -1;
                    if (!aNear && bNear) return  1;
                    // Then local before API
                    if (a.source === "local" && b.source !== "local") return -1;
                    if (b.source === "local" && a.source !== "local") return  1;
                    return (a.name || "").localeCompare(b.name || "");
                });

                const nearbyCount = donors.filter(function (d) {
                    return (d.location || "").toLowerCase().includes(cityLower);
                }).length;

                const localCount = donors.filter(function (d) { return d.source === "local"; }).length;

                updateStats(donors.length, nearbyCount, localCount);
                resultsSubtitle.textContent =
                    "Found " + donors.length + " eligible donor" +
                    (donors.length !== 1 ? "s" : "") +
                    " for blood group " + bloodGroup +
                    (city ? " · " + nearbyCount + " near " + city : "") + ".";

                noResults.hidden = true;
                renderDonorCards(donors, cityLower);

            })
            .catch(function (err) {
                showLoading(false);
                isSearching = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = "<span>🔍</span> Find Matching Donors <span>→</span>";
                resultsSubtitle.textContent = "An error occurred while searching. Please try again.";
                console.error("Search error:", err);
            });
    }


    /* =========================================================
       RENDER DONOR CARDS
    ========================================================= */

    function renderDonorCards(donors, cityLower) {

        resultsGrid.innerHTML = "";

        donors.forEach(function (donor, index) {

            const card       = document.createElement("div");
            card.className   = "search-donor-card";
            card.style.animationDelay = (index * 0.04) + "s";

            const initials = getInitials(donor.name || "?");
            const isLocal  = donor.source === "local";
            const isNearby = cityLower && (donor.location || "").toLowerCase().includes(cityLower);
            const lastDon  = donor.lastDonationDate
                ? formatDate(donor.lastDonationDate)
                : "First-time donor";

            const avatarHtml = donor.avatarUrl
                ? "<img src=\"" + escapeHTML(donor.avatarUrl) + "\" " +
                  "alt=\"" + escapeHTML(donor.name) + "\" " +
                  "class=\"donor-card-avatar-img\" " +
                  "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex'\">" +
                  "<div class=\"donor-card-avatar\" style=\"display:none\">" + escapeHTML(initials) + "</div>"
                : "<div class=\"donor-card-avatar\">" + escapeHTML(initials) + "</div>";

            const badgesHtml =
                (isNearby ? "<span class=\"donor-badge donor-badge-nearby\">📍 Near You</span> " : "") +
                (isLocal
                    ? "<span class=\"donor-badge donor-badge-local\">✓ Registered</span>"
                    : "<span class=\"donor-badge donor-badge-api\">⬦ Database</span>");

            card.innerHTML = `
                <div class="donor-card-top">
                    <div class="donor-card-avatar-wrap">${avatarHtml}</div>
                    <div class="donor-card-info">
                        <h3 class="donor-card-name">${escapeHTML(donor.name || "Unknown Donor")}</h3>
                        <span class="donor-card-location">📍 ${escapeHTML(donor.location || "Location not available")}</span>
                        <div style="margin-top:4px;">${badgesHtml}</div>
                    </div>
                    <div class="donor-card-blood">
                        <span class="donor-blood-label">BLOOD</span>
                        <strong class="donor-blood-group">${escapeHTML(donor.bloodGroup)}</strong>
                    </div>
                </div>

                <div class="donor-card-divider"></div>

                <div class="donor-card-meta">
                    <div class="donor-meta-item">
                        <span>AGE</span>
                        <strong>${donor.age ? donor.age + " yrs" : "—"}</strong>
                    </div>
                    <div class="donor-meta-item">
                        <span>LAST DONATED</span>
                        <strong>${escapeHTML(lastDon)}</strong>
                    </div>
                    <div class="donor-meta-item">
                        <span>STATUS</span>
                        <strong class="eligible-text">✓ Eligible</strong>
                    </div>
                </div>

                <div class="donor-card-actions">
                    <a href="tel:${escapeHTML(donor.phone || "")}" class="donor-contact-btn" id="contact-btn-${index}" title="Call ${escapeHTML(donor.name || "donor")}">
                        ☎ Call Donor
                    </a>
                    <button type="button" class="donor-details-btn" id="details-btn-${index}" data-index="${index}">
                        View Details →
                    </button>
                </div>
            `;

            resultsGrid.appendChild(card);
        });


        /* Details button events */
        resultsGrid.querySelectorAll(".donor-details-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const donor = donors[parseInt(this.dataset.index, 10)];
                if (donor) showDonorModal(donor);
            });
        });

    }


    /* =========================================================
       DONOR DETAIL MODAL
    ========================================================= */

    const modal = document.createElement("div");
    modal.id        = "searchDonorModal";
    modal.className = "search-donor-modal";
    modal.hidden    = true;
    modal.innerHTML = `
        <div class="sdm-overlay" id="sdmOverlay"></div>
        <div class="sdm-card">
            <button type="button" class="sdm-close" id="sdmClose">×</button>
            <div class="sdm-header">
                <div class="sdm-avatar-wrap" id="sdmAvatarWrap"></div>
                <div>
                    <span class="modal-label">DONOR PROFILE</span>
                    <h2 id="sdmName">—</h2>
                    <div class="modal-status"><span></span> Eligible Donor</div>
                </div>
            </div>
            <div class="sdm-blood-highlight">
                <div><span>BLOOD GROUP</span><strong id="sdmBloodGroup">—</strong></div>
                <div><span>SOURCE</span><strong id="sdmSource">—</strong></div>
            </div>
            <div class="modal-details">
                <div class="modal-detail"><span>AGE</span><strong id="sdmAge">—</strong></div>
                <div class="modal-detail"><span>LOCATION</span><strong id="sdmLocation">—</strong></div>
                <div class="modal-detail"><span>LAST DONATION</span><strong id="sdmLastDonation">—</strong></div>
                <div class="modal-detail"><span>STATUS</span><strong class="green-text">Currently Eligible</strong></div>
            </div>
            <div class="modal-contact-section">
                <span class="modal-section-title">CONTACT INFORMATION</span>
                <div class="contact-row">
                    <div class="contact-icon">☎</div>
                    <div><span>PHONE</span><strong id="sdmPhone">—</strong></div>
                </div>
                <div class="contact-row">
                    <div class="contact-icon">@</div>
                    <div><span>EMAIL</span><strong id="sdmEmail">—</strong></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" id="sdmContactBtn" class="modal-primary-button">
                    Contact Donor <span>→</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);


    function showDonorModal(donor) {
        const avatarWrap = document.getElementById("sdmAvatarWrap");
        avatarWrap.innerHTML = donor.avatarUrl
            ? "<img src=\"" + escapeHTML(donor.avatarUrl) + "\" alt=\"" + escapeHTML(donor.name) + "\" class=\"sdm-avatar-img\">"
            : "<div class=\"modal-avatar\">" + escapeHTML(getInitials(donor.name || "?")) + "</div>";

        document.getElementById("sdmName").textContent         = donor.name || "—";
        document.getElementById("sdmBloodGroup").textContent   = donor.bloodGroup || "—";
        document.getElementById("sdmSource").textContent       = donor.source === "local" ? "Registered" : "Database";
        document.getElementById("sdmAge").textContent          = donor.age ? donor.age + " years" : "—";
        document.getElementById("sdmLocation").textContent     = donor.location || "—";
        document.getElementById("sdmPhone").textContent        = donor.phone || "Not available";
        document.getElementById("sdmEmail").textContent        = donor.email || "Not available";
        document.getElementById("sdmLastDonation").textContent =
            donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "First-time donor";

        document.getElementById("sdmContactBtn").onclick = function () {
            if (donor.phone) window.location.href = "tel:" + donor.phone;
        };

        modal.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeDonorModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    document.getElementById("sdmClose").addEventListener("click", closeDonorModal);
    document.getElementById("sdmOverlay").addEventListener("click", closeDonorModal);
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) closeDonorModal();
    });


    /* =========================================================
       HELPERS
    ========================================================= */

    function showLoading(show) {
        loadingEl.hidden = !show;
        if (show) {
            resultsGrid.innerHTML = "";
            noResults.hidden = true;
        }
    }

    function updateStats(total, nearby, local) {
        statTotal.textContent  = total;
        statNearby.textContent = nearby;
        statLocal.textContent  = local;
    }

    function getInitials(name) {
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    function formatDate(dateString) {
        if (!dateString) return "—";
        const date  = new Date(dateString + "T00:00:00");
        const day   = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year  = date.getFullYear();
        return day + "/" + month + "/" + year;
    }

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = String(value || "");
        return div.innerHTML;
    }

    function showToast(message) {
        let toast = document.getElementById("searchPageToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "searchPageToast";
            toast.style.cssText = [
                "position:fixed", "bottom:24px", "left:50%", "transform:translateX(-50%)",
                "background:#171717", "color:#fff", "padding:12px 28px",
                "border-radius:30px", "font-size:14px", "font-weight:600",
                "box-shadow:0 8px 30px rgba(0,0,0,0.3)", "z-index:9999",
                "transition:opacity 0.3s ease", "max-width:90%", "text-align:center"
            ].join(";");
            document.body.appendChild(toast);
        }
        toast.textContent   = message;
        toast.style.opacity = "1";
        clearTimeout(window._searchToastTimeout);
        window._searchToastTimeout = setTimeout(function () {
            toast.style.opacity = "0";
        }, 3500);
    }


});
