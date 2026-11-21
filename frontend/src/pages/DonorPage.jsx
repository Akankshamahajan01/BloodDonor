import { useState } from "react";
import api, { API_ENDPOINTS } from "../services/api";
import FormInput    from "../components/FormInput";
import AlertMessage from "../components/AlertMessage";
import Footer       from "../components/Footer";

/** All valid blood group options */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
}

/**
 * EligibilityResult — sub-component that shows registration outcome
 *
 * Props:
 *   type {string} — "success" | "warning" | "error"
 *   msg  {string} — message text
 *
 * Demonstrates: presentational component driven entirely by props
 */
function EligibilityResult({ type, msg }) {
  if (!type || !msg) return null;

  return (
    <div className={`eligibility-result ${type}`}>
      {/* JSX conditional expression for icon */}
      <div className="result-icon">
        {type === "success" ? "✓" : "!"}
      </div>
      <div>{msg}</div>
    </div>
  );
}

/**
 * InfoPoint — single bullet point in the info panel
 *
 * Props:
 *   text {string}
 */
function InfoPoint({ text }) {
  return (
    <div className="donor-info-point">
      <span className="donor-info-point-icon">✓</span>
      {text}
    </div>
  );
}

/**
 * DonorPage — Donor Registration page (protected route)
 *
 * State (useState):
 *   form    — all form field values as one object
 *   loading — boolean for submit spinner
 *   result  — { type, msg } | null for eligibility result
 *
 * Props used:
 *   FormInput receives: label, name, type, value, onChange, placeholder, required, min, max
 *   EligibilityResult receives: type, msg
 *   InfoPoint receives: text
 *   AlertMessage receives: type, message
 */
export default function DonorPage() {

  // ── useState: all controlled form fields ──────────────────
  const [form, setForm] = useState({
    fullName:         "",
    age:              "",
    bloodGroup:       "",
    phone:            "",
    email:            "",
    location:         "",
    lastDonationDate: "",
  });

  // ── useState: API call loading state ─────────────────────
  const [loading, setLoading] = useState(false);

  // ── useState: eligibility result after submission ─────────
  const [result, setResult] = useState(null);

  // Generic change handler for all form inputs
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);

    const age = Number(form.age);

    // Client-side validation
    if (form.fullName.trim().length < 2)
      return setResult({ type: "error", msg: "Please enter a valid name." });
    if (age < 18 || age > 65)
      return setResult({ type: "error", msg: "Age must be between 18 and 65." });
    if (!form.bloodGroup)
      return setResult({ type: "error", msg: "Please select your blood group." });
    if (!/^[0-9]{10}$/.test(form.phone))
      return setResult({ type: "error", msg: "Please enter a valid 10-digit phone number." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setResult({ type: "error", msg: "Please enter a valid email address." });
    if (form.location.trim().length < 2)
      return setResult({ type: "error", msg: "Please enter your location." });

    setLoading(true);
    try {
      const { data } = await api.post(API_ENDPOINTS.DONOR_REGISTER, {
        name:             form.fullName.trim(),
        age,
        bloodGroup:       form.bloodGroup,
        phone:            form.phone.trim(),
        email:            form.email.trim(),
        location:         form.location.trim(),
        lastDonationDate: form.lastDonationDate || null,
      });

      const donor = data.donor;

      // Update result state based on API response
      if (donor.eligible) {
        setResult({
          type: "success",
          msg: `✓ You are eligible to donate blood! Profile registered successfully. Blood Group: ${donor.bloodGroup}`,
        });
      } else {
        setResult({
          type: "warning",
          msg: `⚠ Not currently eligible. You can donate again in ${donor.daysRemaining} days (Next eligible: ${formatDate(donor.nextEligibleDate)}).`,
        });
      }

      // Reset form state after successful submission
      setForm({
        fullName: "", age: "", bloodGroup: "", phone: "",
        email: "", location: "", lastDonationDate: "",
      });

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not connect to the server. Please try again.";
      setResult({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <>
      <div className="donor-page">
        <div className="donor-container">

          {/* ── Left: Registration Form ── */}
          <div className="donor-form-card">
            <h2>Donor Registration</h2>
            <p className="subtitle">Register to donate blood and save lives</p>

            <form className="donor-form" onSubmit={handleSubmit}>

              {/* Name + Age in a row */}
              <div className="form-row">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  type="text"
                  placeholder="Dr. Rajesh Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Age"
                  name="age"
                  type="number"
                  placeholder="18 – 65"
                  value={form.age}
                  onChange={handleChange}
                  min="18"
                  max="65"
                  required
                />
              </div>

              {/* Blood Group — select via FormInput children prop */}
              <FormInput
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
                {/* children prop → FormInput renders a <select> */}
                <option value="">— Select blood group —</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </FormInput>

              {/* Phone + Email in a row */}
              <div className="form-row">
                <FormInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <FormInput
                label="Location (City)"
                name="location"
                type="text"
                placeholder="Delhi, Mumbai…"
                value={form.location}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Last Donation Date (optional)"
                name="lastDonationDate"
                type="date"
                value={form.lastDonationDate}
                onChange={handleChange}
              />

              {/* disabled prop driven by loading state */}
              <button
                type="submit"
                className="donor-submit-btn"
                disabled={loading}
              >
                {loading ? "Registering…" : "Register as Donor →"}
              </button>
            </form>

            {/* EligibilityResult: result state passed as props */}
            <EligibilityResult type={result?.type} msg={result?.msg} />
          </div>

          {/* ── Right: Info Panel ── */}
          <div className="donor-info-card">
            <img src="/images/donate-blood.jpg" alt="Donate blood" />
            <div className="donor-info-body">
              <h3>Why Donate Blood?</h3>
              <p>Your blood donation can save up to 3 lives. Here's what you need to know:</p>
              <div className="donor-info-points">
                {/* InfoPoint: text passed as prop */}
                {[
                  "Must be 18–65 years old",
                  "Weight at least 50 kg",
                  "Wait 56 days between donations",
                  "No major illness in last 6 months",
                  "No tattoo / piercing in last 6 months",
                ].map((point) => (
                  <InfoPoint key={point} text={point} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
