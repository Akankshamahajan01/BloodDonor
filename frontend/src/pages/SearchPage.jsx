import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api, { API_ENDPOINTS }                               from "../services/api";
import { getDonorsByBloodGroup, getNearbyHospitals, getCityFromCoords } from "../services/bloodApi";
import { useAuth }     from "../context/AuthContext";
import DonorCard       from "../components/DonorCard";
import BloodPill       from "../components/BloodPill";
import AlertMessage    from "../components/AlertMessage";
import Footer          from "../components/Footer";

/** All valid blood groups */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * AutocompleteInput — reusable text input with dropdown suggestions
 *
 * Props:
 *   name         {string}   — input name
 *   value        {string}   — controlled value (from parent useState)
 *   onChange     {function} — updates parent state
 *   placeholder  {string}
 *   suggestions  {Array}    — list of suggestion strings or objects
 *   onSelect     {function} — called with the selected string
 *   renderItem   {function} — optional custom renderer for suggestion items
 *
 * Demonstrates:
 *   • Props receiving complex data (suggestions array)
 *   • Callback props (onChange, onSelect)
 *   • JSX conditional rendering for dropdown
 */
function AutocompleteInput({
  name,
  value,
  onChange,
  placeholder,
  suggestions = [],
  onSelect,
  renderItem,
  style = {},
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          border: "1.5px solid #e8e8e8", borderRadius: 10,
          padding: "12px 14px", fontSize: 15, outline: "none",
          width: "100%", ...style,
        }}
      />
      {/* JSX conditional: dropdown only when there are suggestions */}
      {suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((item, i) => (
            <div
              key={i}
              className="autocomplete-item"
              onClick={() => onSelect(item)}
            >
              {/* renderItem prop for custom display, or just the string */}
              {renderItem ? renderItem(item) : item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SearchPage — Search for blood donors
 *
 * State (useState):
 *   selectedGroup      — which blood group pill is active
 *   form               — { patientName, units, urgency, hospital, location }
 *   hospitalSuggestions — autocomplete suggestions for hospital field
 *   citySuggestions    — autocomplete suggestions for city field
 *   donors             — array of search results
 *   searched           — boolean: has a search been run?
 *   loading            — boolean: search in progress
 *   gpsLoading         — boolean: GPS lookup in progress
 *   error              — string | null: error message
 *
 * Props used:
 *   BloodPill receives: group, isActive, onClick
 *   DonorCard receives: donor, nearCity
 *   AlertMessage receives: type, message
 *   AutocompleteInput receives: name, value, onChange, suggestions, onSelect, renderItem
 */
export default function SearchPage() {
  const { isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();

  // ── useState: selected blood group (from URL param or empty) ─
  const [selectedGroup, setSelectedGroup] = useState(
    searchParams.get("group") || ""
  );

  // ── useState: form fields ─────────────────────────────────
  const [form, setForm] = useState({
    patientName: "",
    units:       "1",
    urgency:     "normal",
    hospital:    "",
    location:    "",
  });

  // ── useState: autocomplete suggestions ───────────────────
  const [hospitalSuggestions, setHospitalSuggestions] = useState([]);
  const [citySuggestions,     setCitySuggestions]     = useState([]);

  // ── useState: search results ──────────────────────────────
  const [donors,   setDonors]   = useState([]);
  const [searched, setSearched] = useState(false);

  // ── useState: loading flags ───────────────────────────────
  const [loading,    setLoading]    = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── useState: error message ───────────────────────────────
  const [error, setError] = useState(null);

  // Refs for debounce timers (not state — doesn't trigger re-render)
  const hospitalTimer = useRef(null);
  const cityTimer     = useRef(null);

  // Generic form change handler
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Hospital autocomplete — debounced useEffect
  useEffect(() => {
    clearTimeout(hospitalTimer.current);
    if (form.hospital.length < 2) { setHospitalSuggestions([]); return; }

    hospitalTimer.current = setTimeout(async () => {
      const results = await getNearbyHospitals(form.hospital, form.location);
      setHospitalSuggestions(results);
    }, 400);

    return () => clearTimeout(hospitalTimer.current);
  }, [form.hospital, form.location]);

  // City autocomplete — debounced useEffect
  useEffect(() => {
    clearTimeout(cityTimer.current);
    if (form.location.length < 2) { setCitySuggestions([]); return; }

    cityTimer.current = setTimeout(async () => {
      try {
        const q   = encodeURIComponent(form.location);
        const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&addressdetails=1&countrycodes=in`;
        const r   = await fetch(url, { headers: { "Accept-Language": "en" } });
        const res = await r.json();
        const cities = (res || [])
          .map((item) => {
            const a = item.address;
            return a.city || a.town || a.county || item.display_name.split(",")[0];
          })
          .filter(Boolean);
        setCitySuggestions([...new Set(cities)]);
      } catch { setCitySuggestions([]); }
    }, 400);

    return () => clearTimeout(cityTimer.current);
  }, [form.location]);

  // GPS button handler — updates location state
  async function handleGPS() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await getCityFromCoords(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (city) setForm((prev) => ({ ...prev, location: city }));
        setGpsLoading(false);
      },
      () => {
        setError("Could not get your location.");
        setGpsLoading(false);
      }
    );
  }

  // Form submit handler
  async function handleSubmit(e) {
    e.preventDefault();

    // Validation — updates error state
    if (!selectedGroup)    return setError("Please select a blood group.");
    if (!form.patientName) return setError("Please enter patient name.");
    if (!form.hospital)    return setError("Please enter hospital name.");
    if (!form.location)    return setError("Please enter your city.");

    setError(null);
    setLoading(true);
    setSearched(false);

    try {
      let backendDonors = [];

      // Save request to backend + get backend-matched donors
      if (isLoggedIn) {
        try {
          const { data } = await api.post(API_ENDPOINTS.REQUESTS, {
            patientName: form.patientName,
            bloodGroup:  selectedGroup,
            units:       Number(form.units),
            urgency:     form.urgency,
            hospital:    form.hospital,
            location:    form.location,
          });
          backendDonors = data.matches?.donors || [];
        } catch { /* continue with local search if backend fails */ }
      }

      // Also fetch from RandomUser API cache
      const apiDonors = await getDonorsByBloodGroup(selectedGroup);

      // Merge + deduplicate (backend donors have priority)
      const seen   = new Set();
      const merged = [];

      function addUnique(d) {
        const key = (d.email || d._id || d.id || "").toLowerCase();
        if (!seen.has(key)) { seen.add(key); merged.push(d); }
      }

      backendDonors.forEach(addUnique);
      apiDonors.forEach(addUnique);

      // Sort: city match first → eligible first → rest
      merged.sort((a, b) => {
        const city  = form.location.toLowerCase();
        const aCity = (a.location || "").toLowerCase() === city;
        const bCity = (b.location || "").toLowerCase() === city;
        if (aCity !== bCity)    return aCity ? -1 : 1;
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return 0;
      });

      // Update donors state → triggers re-render of card grid
      setDonors(merged);
      setSearched(true);

    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <>
      <div className="search-page">
        <div className="search-container">

          {/* Page heading */}
          <div className="search-hero">
            <h1>Find Blood Donors</h1>
            <p>Search for compatible donors near your hospital</p>
          </div>

          {/* ── Search Form Card ── */}
          <div className="search-form-card">
            <h3>🔍 Search Donors</h3>

            {/* Blood group pill selector — renders BloodPill for each group */}
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Select Blood Group <span style={{ color: "var(--red)" }}>*</span></label>
              <div className="blood-pills" style={{ marginTop: 8 }}>
                {BLOOD_GROUPS.map((bg) => (
                  /* BloodPill: group, isActive (from selectedGroup state), onClick */
                  <BloodPill
                    key={bg}
                    group={bg}
                    isActive={selectedGroup === bg}
                    onClick={(g) => setSelectedGroup(g)}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="search-form-grid">

                {/* Patient name */}
                <div className="form-group">
                  <label>Patient Name <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    name="patientName"
                    type="text"
                    placeholder="Patient's full name"
                    value={form.patientName}
                    onChange={handleChange}
                    style={{ border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "12px 14px", fontSize: 15, outline: "none", width: "100%" }}
                  />
                </div>

                {/* Units */}
                <div className="form-group">
                  <label>Units Required</label>
                  <input
                    name="units"
                    type="number"
                    min="1"
                    max="10"
                    value={form.units}
                    onChange={handleChange}
                    style={{ border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "12px 14px", fontSize: 15, outline: "none", width: "100%" }}
                  />
                </div>

                {/* Urgency */}
                <div className="form-group">
                  <label>Urgency Level</label>
                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={handleChange}
                    className="urgency-select"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Hospital — AutocompleteInput with suggestions prop */}
                <div className="form-group">
                  <label>Hospital Name <span style={{ color: "var(--red)" }}>*</span></label>
                  <AutocompleteInput
                    name="hospital"
                    value={form.hospital}
                    onChange={handleChange}
                    placeholder="Start typing hospital name…"
                    suggestions={hospitalSuggestions}
                    onSelect={(h) => {
                      setForm((prev) => ({ ...prev, hospital: h.name }));
                      setHospitalSuggestions([]);
                    }}
                    renderItem={(h) => (
                      <>
                        <strong>{h.name}</strong>
                        {h.address && (
                          <span style={{ color: "var(--grey)", fontSize: 12 }}>
                            {" — "}{h.address}
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>

              {/* City / Location row with GPS button */}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>City / Location <span style={{ color: "var(--red)" }}>*</span></label>
                <div className="location-row">
                  <div className="location-input-wrap">
                    {/* AutocompleteInput: city suggestions prop */}
                    <AutocompleteInput
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Delhi, Mumbai…"
                      suggestions={citySuggestions}
                      onSelect={(city) => {
                        setForm((prev) => ({ ...prev, location: city }));
                        setCitySuggestions([]);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="gps-btn"
                    onClick={handleGPS}
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? "…" : "📍 Near Me"}
                  </button>
                </div>
              </div>

              {/* AlertMessage: error state passed as prop */}
              <AlertMessage
                type="error"
                message={error}
                style={{ marginTop: 14 }}
              />

              <button
                type="submit"
                className="search-submit-btn"
                disabled={loading}
              >
                {loading ? "Searching…" : "🔍 Search Donors"}
              </button>
            </form>
          </div>

          {/* ── Results Section ── */}
          {/* JSX &&: only render when a search has been performed */}
          {searched && (
            <div className="results-section">
              <div className="results-header">
                <h3>Matching Donors</h3>
                <span className="results-count">{donors.length} found</span>
              </div>

              {donors.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">🩸</div>
                  <h4>No donors found</h4>
                  <p>Try a different blood group or city.</p>
                </div>
              ) : (
                <div className="donor-cards-grid">
                  {/* DonorCard: donor object + nearCity passed as props */}
                  {donors.map((d) => (
                    <DonorCard
                      key={d._id || d.id}
                      donor={d}
                      nearCity={form.location}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
