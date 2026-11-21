import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput   from "../components/FormInput";
import AlertMessage from "../components/AlertMessage";

/**
 * LoginPage
 *
 * State (useState):
 *   form    — { email, password }   controlled form fields
 *   showPw  — boolean               password visibility toggle
 *   loading — boolean               submit spinner
 *   message — { type, text } | null feedback message
 *
 * Props used:
 *   FormInput receives: label, name, type, value, onChange, placeholder
 *   AlertMessage receives: type, message
 *
 * Context:
 *   useAuth() → login() function (calls backend API)
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // After login, redirect back to the page user was trying to visit
  const from = location.state?.from?.pathname || "/dashboard";

  // ── useState: form field values ──────────────────────────
  const [form, setForm] = useState({ email: "", password: "" });

  // ── useState: show/hide password toggle ──────────────────
  const [showPw, setShowPw] = useState(false);

  // ── useState: loading spinner during API call ─────────────
  const [loading, setLoading] = useState(false);

  // ── useState: feedback message (error / success) ──────────
  const [message, setMessage] = useState(null);

  // Single change handler — updates the right key in form state
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Client-side validation before API call
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await login(form.email.trim(), form.password);
      // On success: navigate back to protected route
      navigate(from, { replace: true });
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <div className="auth-wrapper">

      {/* Left panel — purely presentational */}
      <div className="auth-left">
        <span className="auth-left-badge">🩸 BloodConnect</span>
        <h1>Welcome Back,<br />Hero.</h1>
        <p>Your login helps keep the blood supply flowing. Every donor matters.</p>
        <div className="auth-left-features">
          {/* JSX: array of feature items rendered via map */}
          {[
            { icon: "🔒", text: "Secure & private" },
            { icon: "⚡", text: "Instant access" },
            { icon: "🏥", text: "Save lives today" },
          ].map((f) => (
            <div key={f.text} className="auth-left-feature">
              <span className="auth-left-feature-icon">{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Sign In</h2>
          <p className="auth-subtitle">Enter your credentials to continue</p>

          {/* AlertMessage component — receives type + message props */}
          <AlertMessage
            type={message?.type}
            message={message?.text}
            style={{ marginBottom: 18 }}
          />

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">

            {/* FormInput: each field passes label, name, type, value, onChange as props */}
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            {/* Password field — has custom show/hide toggle, so built inline */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="pw-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                />
                {/* onClick updates showPw state */}
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit button — disabled prop driven by loading state */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="auth-alt" style={{ marginTop: 20 }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
