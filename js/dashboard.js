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
    var allDonors = [];

    (function () {
        allDonors    = typeof getAllDonors === "function" ? getAllDonors() : [];
        var eligible = allDonors.filter(function (d) { return d.eligible === true; });
        var cities   = new Set(allDonors.map(function (d) { return d.location; }).filter(Boolean));

        var requests = [];
        try {
            var r = localStorage.getItem("bloodConnectRequests");
            if (r) requests = JSON.parse(r) || [];
        } catch (e) {}

        animateNum(get("statDonors"),   allDonors.length, 900);
        animateNum(get("statRequests"), requests.length,  900);
        animateNum(get("statEligible"), eligible.length,  900);
        animateNum(get("statCities"),   cities.size,      900);
    })();


    /* ─── DONORS MODAL ─── */
    (function () {
        var modal      = get("donorsModal");
        var closeBtn   = get("dmClose");
        var listEl     = get("dmList");
        var countEl    = get("dmCount");
        var subtitleEl = get("dmSubtitle");
        var searchEl   = get("dmSearch");
        var bloodSel   = get("dmBloodFilter");
        var eligSel    = get("dmEligFilter");
        var triggerBox = get("statDonorsBox");

        if (!modal || !triggerBox) return;

        /* Blood group badge colours */
        var bgColors = {
            "O-":  "#c0392b", "O+":  "#e74c3c",
            "A-":  "#8e44ad", "A+":  "#9b59b6",
            "B-":  "#2980b9", "B+":  "#3498db",
            "AB-": "#16a085", "AB+": "#1abc9c"
        };

        function badgeColor(bg) {
            return bgColors[bg] || "#555";
        }

        /* Render filtered list */
        function renderList(donors) {
            if (!listEl) return;

            if (donors.length === 0) {
                listEl.innerHTML = '<div class="dm-empty">No donors found matching your filters.</div>';
                if (countEl) countEl.textContent = "0";
                return;
            }

            var html = "";
            donors.forEach(function (d) {
                var eligClass = d.eligible ? "dm-tag dm-tag-green" : "dm-tag dm-tag-red";
                var eligText  = d.eligible ? "Eligible" : "Not Eligible";
                var color     = badgeColor(d.bloodGroup);

                html += '<div class="dm-card">' +
                    '<div class="dm-card-avatar" style="background:' + color + '">' +
                        (d.bloodGroup || "?") +
                    '</div>' +
                    '<div class="dm-card-body">' +
                        '<div class="dm-card-name">' + (d.name || "Unknown") + '</div>' +
                        '<div class="dm-card-meta">' +
                            '<span>📍 ' + (d.location || "—") + '</span>' +
                            (d.age ? '<span>Age ' + d.age + '</span>' : '') +
                        '</div>' +
                    '</div>' +
                    '<span class="' + eligClass + '">' + eligText + '</span>' +
                '</div>';
            });

            listEl.innerHTML = html;
            if (countEl) countEl.textContent = donors.length;
        }

        /* Apply all active filters */
        function applyFilters() {
            var query  = searchEl  ? searchEl.value.trim().toLowerCase()  : "";
            var blood  = bloodSel  ? bloodSel.value                        : "";
            var elig   = eligSel   ? eligSel.value                         : "";

            var filtered = allDonors.filter(function (d) {
                var matchSearch = !query ||
                    (d.name     && d.name.toLowerCase().includes(query)) ||
                    (d.location && d.location.toLowerCase().includes(query));
                var matchBlood = !blood || d.bloodGroup === blood;
                var matchElig  = !elig  ||
                    (elig === "eligible"   &&  d.eligible) ||
                    (elig === "ineligible" && !d.eligible);
                return matchSearch && matchBlood && matchElig;
            });

            renderList(filtered);
        }

        /* Open modal */
        function openModal() {
            var total    = allDonors.length;
            var eligible = allDonors.filter(function (d) { return d.eligible; }).length;
            if (subtitleEl) {
                subtitleEl.textContent = total + " donors registered · " + eligible + " currently eligible";
            }
            /* Reset filters */
            if (searchEl) searchEl.value = "";
            if (bloodSel) bloodSel.value = "";
            if (eligSel)  eligSel.value  = "";

            renderList(allDonors);
            modal.classList.add("dm-visible");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        }

        /* Close modal */
        function closeModal() {
            modal.classList.remove("dm-visible");
            document.body.style.overflow = "";
            if (triggerBox) triggerBox.focus();
        }

        /* Event listeners */
        triggerBox.addEventListener("click", openModal);
        triggerBox.setAttribute("tabindex", "0");
        triggerBox.setAttribute("role", "button");
        triggerBox.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(); }
        });

        closeBtn.addEventListener("click", closeModal);

        /* Close on overlay click */
        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });

        /* Close on Escape */
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal.classList.contains("dm-visible")) closeModal();
        });

        /* Live filter */
        if (searchEl) searchEl.addEventListener("input",  applyFilters);
        if (bloodSel) bloodSel.addEventListener("change", applyFilters);
        if (eligSel)  eligSel.addEventListener("change",  applyFilters);
    })();


    /* ─── REQUESTS MODAL ─── */
    (function () {
        var modal      = get("requestsModal");
        var closeBtn   = get("rmClose");
        var listEl     = get("rmList");
        var countEl    = get("rmCount");
        var subtitleEl = get("rmSubtitle");
        var searchEl   = get("rmSearch");
        var bloodSel   = get("rmBloodFilter");
        var urgSel     = get("rmUrgencyFilter");
        var triggerBox = get("statRequestsBox");

        if (!modal || !triggerBox) return;

        var allRequests = [];

        /* Load & deduplicate requests by id */
        function loadRequests() {
            try {
                var r   = localStorage.getItem("bloodConnectRequests");
                var raw = r ? JSON.parse(r) : [];
                if (!Array.isArray(raw)) return [];

                var seen   = new Set();
                var unique = [];
                for (var i = raw.length - 1; i >= 0; i--) {
                    var key = String(raw[i].id || i);
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push(raw[i]);
                    }
                }
                unique.reverse();
                return unique;
            } catch (e) { return []; }
        }

        /* Urgency badge config */
        var urgencyMap = {
            critical: { label: "Critical", cls: "dm-tag-red",    icon: "🔴" },
            urgent:   { label: "Urgent",   cls: "dm-tag-orange", icon: "🟠" },
            normal:   { label: "Normal",   cls: "dm-tag-green",  icon: "🟢" }
        };

        /* Blood group avatar colours */
        var bgColors = {
            "O-": "#c0392b", "O+": "#e74c3c",
            "A-": "#8e44ad", "A+": "#9b59b6",
            "B-": "#2980b9", "B+": "#3498db",
            "AB-": "#16a085", "AB+": "#1abc9c"
        };

        function fmtReqDate(iso) {
            if (!iso) return "—";
            try {
                return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            } catch (e) { return "—"; }
        }

        /* Render */
        function renderRequests(list) {
            if (!listEl) return;
            if (list.length === 0) {
                listEl.innerHTML = '<div class="dm-empty">No blood requests found.</div>';
                if (countEl) countEl.textContent = "0";
                return;
            }

            var html = "";
            list.forEach(function (req) {
                var urg   = urgencyMap[req.urgency] || { label: req.urgency || "—", cls: "dm-tag-green", icon: "📋" };
                var color = bgColors[req.bloodGroup] || "#888";

                html += '<div class="dm-card">' +
                    '<div class="dm-card-avatar" style="background:' + color + '">' +
                        (req.bloodGroup || "?") +
                    '</div>' +
                    '<div class="dm-card-body">' +
                        '<div class="dm-card-name">' + (req.patientName || "Unknown Patient") + '</div>' +
                        '<div class="dm-card-meta">' +
                            '<span>🏥 ' + (req.hospital || "—") + '</span>' +
                            '<span>📍 ' + (req.location || "—") + '</span>' +
                            '<span>💉 ' + (req.units || 1) + ' unit' + (req.units > 1 ? "s" : "") + '</span>' +
                            '<span>📅 ' + fmtReqDate(req.createdAt) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="dm-tag ' + urg.cls + '">' + urg.icon + ' ' + urg.label + '</span>' +
                '</div>';
            });

            listEl.innerHTML = html;
            if (countEl) countEl.textContent = list.length;
        }

        /* Filter */
        function applyReqFilters() {
            var query = searchEl ? searchEl.value.trim().toLowerCase() : "";
            var blood = bloodSel ? bloodSel.value : "";
            var urg   = urgSel   ? urgSel.value   : "";

            var filtered = allRequests.filter(function (req) {
                var matchSearch = !query ||
                    (req.patientName && req.patientName.toLowerCase().includes(query)) ||
                    (req.location    && req.location.toLowerCase().includes(query))    ||
                    (req.hospital    && req.hospital.toLowerCase().includes(query));
                var matchBlood = !blood || req.bloodGroup === blood;
                var matchUrg   = !urg   || req.urgency   === urg;
                return matchSearch && matchBlood && matchUrg;
            });

            renderRequests(filtered);
        }

        /* Open */
        function openReqModal() {
            allRequests = loadRequests();
            if (subtitleEl) {
                subtitleEl.textContent = allRequests.length + " request" + (allRequests.length !== 1 ? "s" : "") + " submitted";
            }
            if (searchEl) searchEl.value = "";
            if (bloodSel) bloodSel.value = "";
            if (urgSel)   urgSel.value   = "";

            renderRequests(allRequests);
            modal.classList.add("dm-visible");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        }

        /* Close */
        function closeReqModal() {
            modal.classList.remove("dm-visible");
            document.body.style.overflow = "";
            if (triggerBox) triggerBox.focus();
        }

        /* Bindings */
        triggerBox.addEventListener("click", openReqModal);
        triggerBox.setAttribute("tabindex", "0");
        triggerBox.setAttribute("role", "button");
        triggerBox.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openReqModal(); }
        });

        closeBtn.addEventListener("click", closeReqModal);
        modal.addEventListener("click", function (e) { if (e.target === modal) closeReqModal(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal.classList.contains("dm-visible")) closeReqModal();
        });

        if (searchEl) searchEl.addEventListener("input",  applyReqFilters);
        if (bloodSel) bloodSel.addEventListener("change", applyReqFilters);
        if (urgSel)   urgSel.addEventListener("change",   applyReqFilters);
    })();


    /* ─── ELIGIBLE DONORS MODAL ─── */
    (function () {
        var modal      = get("eligibleModal");
        var closeBtn   = get("emClose");
        var listEl     = get("emList");
        var countEl    = get("emCount");
        var subtitleEl = get("emSubtitle");
        var searchEl   = get("emSearch");
        var bloodSel   = get("emBloodFilter");
        var triggerBox = get("statEligibleBox");

        if (!modal || !triggerBox) return;

        var eligibleDonors = [];

        /* Blood group avatar colours */
        var bgColors = {
            "O-": "#c0392b", "O+": "#e74c3c",
            "A-": "#8e44ad", "A+": "#9b59b6",
            "B-": "#2980b9", "B+": "#3498db",
            "AB-": "#16a085", "AB+": "#1abc9c"
        };

        /* Render */
        function renderEligible(list) {
            if (!listEl) return;
            if (list.length === 0) {
                listEl.innerHTML = '<div class="dm-empty">No eligible donors found matching your filters.</div>';
                if (countEl) countEl.textContent = "0";
                return;
            }

            var html = "";
            list.forEach(function (d) {
                var color = bgColors[d.bloodGroup] || "#555";

                html += '<div class="dm-card">' +
                    '<div class="dm-card-avatar" style="background:' + color + '">' +
                        (d.bloodGroup || "?") +
                    '</div>' +
                    '<div class="dm-card-body">' +
                        '<div class="dm-card-name">' + (d.name || "Unknown") + '</div>' +
                        '<div class="dm-card-meta">' +
                            '<span>📍 ' + (d.location || "—") + '</span>' +
                            (d.age ? '<span>Age ' + d.age + '</span>' : '') +
                            (d.phone ? '<span>📞 ' + d.phone + '</span>' : '') +
                        '</div>' +
                    '</div>' +
                    '<span class="dm-tag dm-tag-green">✅ Eligible</span>' +
                '</div>';
            });

            listEl.innerHTML = html;
            if (countEl) countEl.textContent = list.length;
        }

        /* Filter */
        function applyEligFilters() {
            var query = searchEl ? searchEl.value.trim().toLowerCase() : "";
            var blood = bloodSel ? bloodSel.value : "";

            var filtered = eligibleDonors.filter(function (d) {
                var matchSearch = !query ||
                    (d.name     && d.name.toLowerCase().includes(query)) ||
                    (d.location && d.location.toLowerCase().includes(query));
                var matchBlood = !blood || d.bloodGroup === blood;
                return matchSearch && matchBlood;
            });

            renderEligible(filtered);
        }

        /* Open */
        function openEligModal() {
            /* Deduplicated eligible donors from allDonors (already deduped) */
            eligibleDonors = allDonors.filter(function (d) { return d.eligible === true; });

            if (subtitleEl) {
                subtitleEl.textContent = eligibleDonors.length + " donor" + (eligibleDonors.length !== 1 ? "s" : "") + " currently eligible to donate";
            }
            if (searchEl) searchEl.value = "";
            if (bloodSel) bloodSel.value = "";

            renderEligible(eligibleDonors);
            modal.classList.add("dm-visible");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        }

        /* Close */
        function closeEligModal() {
            modal.classList.remove("dm-visible");
            document.body.style.overflow = "";
            if (triggerBox) triggerBox.focus();
        }

        /* Bindings */
        triggerBox.addEventListener("click", openEligModal);
        triggerBox.setAttribute("tabindex", "0");
        triggerBox.setAttribute("role", "button");
        triggerBox.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEligModal(); }
        });

        closeBtn.addEventListener("click", closeEligModal);
        modal.addEventListener("click", function (e) { if (e.target === modal) closeEligModal(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal.classList.contains("dm-visible")) closeEligModal();
        });

        if (searchEl) searchEl.addEventListener("input",  applyEligFilters);
        if (bloodSel) bloodSel.addEventListener("change", applyEligFilters);
    })();


    /* ─── CITIES MODAL ─── */
    (function () {
        var modal      = get("citiesModal");
        var closeBtn   = get("cmClose");
        var listEl     = get("cmList");
        var countEl    = get("cmCount");
        var subtitleEl = get("cmSubtitle");
        var searchEl   = get("cmSearch");
        var triggerBox = get("statCitiesBox");

        if (!modal || !triggerBox) return;

        var cityData = []; // [{city, donors, eligible}]

        /* Build unique city list with donor counts from allDonors */
        function buildCityData() {
            var map = {};
            allDonors.forEach(function (d) {
                var city = (d.location || "").trim();
                if (!city) return;
                var key = city.toLowerCase();
                if (!map[key]) {
                    map[key] = { city: city, total: 0, eligible: 0 };
                }
                map[key].total++;
                if (d.eligible) map[key].eligible++;
            });
            /* Sort alphabetically */
            return Object.values(map).sort(function (a, b) {
                return a.city.localeCompare(b.city);
            });
        }

        /* Render */
        function renderCities(list) {
            if (!listEl) return;
            if (list.length === 0) {
                listEl.innerHTML = '<div class="dm-empty">No cities found.</div>';
                if (countEl) countEl.textContent = "0";
                return;
            }

            var html = "";
            list.forEach(function (c) {
                html += '<div class="dm-card dm-city-card">' +
                    '<div class="dm-city-avatar">🏙️</div>' +
                    '<div class="dm-card-body">' +
                        '<div class="dm-card-name">' + c.city + '</div>' +
                        '<div class="dm-card-meta">' +
                            '<span>👥 ' + c.total + ' donor' + (c.total !== 1 ? 's' : '') + '</span>' +
                            '<span>✅ ' + c.eligible + ' eligible</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="dm-tag dm-tag-blue">' + c.total + ' donor' + (c.total !== 1 ? 's' : '') + '</span>' +
                '</div>';
            });

            listEl.innerHTML = html;
            if (countEl) countEl.textContent = list.length;
        }

        /* Filter */
        function applyCityFilters() {
            var query = searchEl ? searchEl.value.trim().toLowerCase() : "";
            var filtered = cityData.filter(function (c) {
                return !query || c.city.toLowerCase().includes(query);
            });
            renderCities(filtered);
        }

        /* Open */
        function openCityModal() {
            cityData = buildCityData();
            if (subtitleEl) {
                subtitleEl.textContent = cityData.length + " cit" + (cityData.length !== 1 ? "ies" : "y") + " with registered donors";
            }
            if (searchEl) searchEl.value = "";
            renderCities(cityData);
            modal.classList.add("dm-visible");
            document.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        }

        /* Close */
        function closeCityModal() {
            modal.classList.remove("dm-visible");
            document.body.style.overflow = "";
            if (triggerBox) triggerBox.focus();
        }

        /* Bindings */
        triggerBox.addEventListener("click", openCityModal);
        triggerBox.setAttribute("tabindex", "0");
        triggerBox.setAttribute("role", "button");
        triggerBox.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCityModal(); }
        });

        closeBtn.addEventListener("click", closeCityModal);
        modal.addEventListener("click", function (e) { if (e.target === modal) closeCityModal(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal.classList.contains("dm-visible")) closeCityModal();
        });

        if (searchEl) searchEl.addEventListener("input", applyCityFilters);
    })();

});
