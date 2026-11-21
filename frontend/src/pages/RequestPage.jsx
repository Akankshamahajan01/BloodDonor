import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_ENDPOINTS } from "../services/api";
import FormInput    from "../components/FormInput";
import AlertMessage from "../components/AlertMessage";
import Footer       from "../components/Footer";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * RequestPage — Submit a blood request (protected route)
 *
 * State (useState):
 *   form    — { patientName, bloodGroup, units, urgency, hospital, location }
 *   loading — boolean for submit spinner
 *   error   — string | null for error message
 *
 * Props used:
 *   FormInput receives: label, name, type, value, onChange, required, children (for select)
 *   AlertMessage receives: type, message
 *
 * On success → navigates to /matches with request + matches in router state
 */
export default function RequestPage() {
  const navigate = useNavigate();

  // ── useState: all form fields ─────────────────────────────
  const [form, setForm] = useState({
    patientName: "",
    bloodGroup:  "",
    units:       "1",
    urgency:     "normal",
    hospital:    "",
    location:    "",
  });

  // ── useState: loading spinner ─────────────────────────────
  const [loading, setLoading] = useState(false);

  // ── useState: error message ───────────────────────────────
  const [error, setError] = useState(null);

  // Generic change handler — updates form state
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validation — sets error state if any field is missing
    if (!form.patientName) return setError("Patient name is required.");
    if (!form.bloodGroup)  return setError("Please select a blood group.");
    if (!form.hospital)    return setError("Hospital name is required.");
    if (!form.location)    return setError("Location (city) is required.");

    setLoading(true);
    try {
      const { data } = await api.post(API_ENDPOINTS.REQUESTS, {
        patientName: form.patientName,
        bloodGroup:  form.bloodGroup,
        units:       Number(form.units),
        urgency:     form.urgency,
        hospital:    form.hospital,
        location:    form.location,
      });

      // Pass data to MatchesPage via React Router state (no localStorage needed)
      navigate("/matches", {
        state: {
          request: data.request,
          matches: data.matches?.donors || [],
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <>
      <div className="request-page">
        <div className="request-container">
          <div className="request-card">
            <h2>Blood Request</h2>
            <p className="request-subtitle">
              Submit a blood requirement and find matching donors instantly
            </p>

            {/* AlertMessage: error state passed as prop */}
            <AlertMessage
              type="error"
              message={error}
              style={{ marginBottom: 18 }}
            />

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              {/* Patient name — FormInput with label, name, type, value, onChange props */}
              <FormInput
                label="Patient Name"
                name="patientName"
                type="text"
                placeholder="Full name of the patient"
                value={form.patientName}
                onChange={handleChange}
                required
              />

              {/* Blood Group — FormInput with children prop → renders <select> */}
              <FormInput
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">— Select blood group —</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </FormInput>

              {/* Units + Urgency side by side */}
              <div className="form-row">
                <FormInput
                  label="Units Required"
                  name="units"
                  type="number"
                  value={form.units}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />

                {/* Urgency — also uses children prop for select */}
                <FormInput
                  label="Urgency Level"
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </FormInput>
              </div>

              <FormInput
                label="Hospital Name"
                name="hospital"
                type="text"
                placeholder="Hospital name"
                value={form.hospital}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Location (City)"
                name="location"
                type="text"
                placeholder="City"
                value={form.location}
                onChange={handleChange}
                required
              />

              {/* disabled prop driven by loading state */}
              <button
                type="submit"
                className="request-submit-btn"
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit Request & Find Donors →"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
