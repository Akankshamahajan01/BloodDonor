import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }       from "../context/AuthContext";
import FormInput         from "../components/FormInput";
import AlertMessage      from "../components/AlertMessage";

/** Password rules — array of { label, test } objects */
const PASSWORD_RULES = [
  { label: "At least 8 characters",  test: (p) => p.length >= 8 },
  { label: "One uppercase letter",   test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",   test: (p) => /[a-z]/.test(p) },
  { label: "One number",             test: (p) => /[0-9]/.test(p) },
  { label: "One special character",  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(pw) {
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  if (passed <= 2) return "weak";
  if (passed <= 4) return "medium";
  return "strong";
}

/**
 * PasswordStrengthMeter — sub-component, receives password as prop
 *
 * Props:
 *   password {string} — current password value from parent useState
 */
function PasswordStrengthMeter({ password }) {
  const strength = getStrength(password);

  return (
    <>
      {/* Three-segment strength bar */}
      <div className="pw-strength">
        {["weak", "medium", "strong"].map((level, i) => {
          // Determine if this bar segment should be filled
          const filled =
            (level === "weak"   && strength !== "") ||
            (level === "medium" && (strength === "medium" || strength === "strong")) ||
            (level === "strong" && strength === "strong");

          return (
            <div
              key={i}
              className={`pw-strength-bar${filled ? " " + level : ""}`}
            />
          );
        })}
      </div>

      {/* Rules checklist — each rule gets a pass/fail class via JSX */}
      <div className="pw-rules">
        {PASSWORD_RULES.map((rule) => (
          <div
            key={rule.label}
            className={`pw-rule${rule.test(password) ? " pass" : ""}`}
          >
            <span className="pw-rule-dot" />
            {rule.label}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * RegisterPage
 *
 * State (useState):
 *   form    — { name, email, phone, password, confirm } controlled fields
 *   showPw  — boolean  password visibility toggle
 *   loading — boolean  submit spinner
 *   message — { type, text } | null  feedback message
 *
 * Props used:
 *   FormInput receives: label, name, type, value, onChange, placeholder, required
 *   AlertMessage receives: type, message
 *   PasswordStrengthMeter receives: password (from form state)
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  // ── useState: all form fields in one object ───────────────
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });

  // ── useState: show/hide password ──────────────────────────
  const [showPw, setShowPw] = useState(false);

  // ── useState: loading state ───────────────────────────────
  const [loading, setLoading] = useState(false);

  // ── useState: feedback message ────────────────────────────
  const [message, setMessage] = useState(null);

  // Derived state (no useState needed — computed from form state)
  const strength = getStrength(form.password);

  // Generic change handler — updates form state by field name
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    // Client-side validations
    if (form.name.trim().length < 2)
      return setMessage({ type: "error", text: "Please enter a valid name (min 2 chars)." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setMessage({ type: "error", text: "Please enter a valid email address." });
    if (!/^[0-9]{10}$/.test(form.phone))
      return setMessage({ type: "error", text: "Phone must be a 10-digit number." });
    if (strength !== "strong")
      return setMessage({ type: "error", text: "Please use a stronger password (all 5 rules must pass)." });
    if (form.password !== form.confirm)
      return setMessage({ type: "error", text: "Passwords do not match." });

    setLoading(true);
    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.password
      );
      setMessage({ type: "success", text: "Account created successfully! Redirecting to login…" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const text =
        err?.response?.data?.message || "Registration failed. Please try again.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <div className="auth-wrapper">

      {/* Left marketing panel */}
      <div className="auth-left">
        <span className="auth-left-badge">🩸 BloodConnect</span>
        <h1>Join the<br />Network.</h1>
        <p>Register to become a donor or search for blood when it's needed most.</p>
        <div className="auth-left-features">
          {[
            { icon: "🩸", text: "Register as donor" },
            { icon: "🔍", text: "Search for donors" },
            { icon: "📊", text: "Personal dashboard" },
          ].map((f) => (
            <div key={f.text} className="auth-left-feature">
              <span className="auth-left-feature-icon">{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join thousands of blood heroes</p>

          {/* AlertMessage: message state passed as prop */}
          <AlertMessage
            type={message?.type}
            message={message?.text}
            style={{ marginBottom: 18 }}
          />

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">

            {/* FormInput components — props: label, name, type, value, onChange */}
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="Dr. Rajesh Sharma"
              value={form.name}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            {/* Password — custom pw-wrapper for show/hide toggle */}
            <div className="form-group">
              <label htmlFor="password">
                Password <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div className="pw-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>

              {/* JSX &&: only show meter when user has typed something */}
              {form.password && (
                /* PasswordStrengthMeter receives password as prop */
                <PasswordStrengthMeter password={form.password} />
              )}
            </div>

            <FormInput
              label="Confirm Password"
              name="confirm"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            {/* disabled prop driven by loading state */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="auth-alt" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
