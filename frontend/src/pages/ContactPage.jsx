/**
 * ContactPage
 * ─────────────────────────────────────────────────────────
 * Lecture 48 — Event Handling in React, Forms, Controlled Components
 * Lecture 49 — Conditional Rendering, Lists and Keys
 * Lecture 56 — Tailwind CSS Basics, Responsive Layouts
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPTS DEMONSTRATED:
 *
 * 1. CONTROLLED COMPONENTS
 *    Every <input> value is tied to React state.
 *    React "controls" the input — the DOM never holds truth.
 *
 * 2. EVENT HANDLING
 *    onChange  → updates state on every keystroke
 *    onSubmit  → handles form submission, prevents default reload
 *    onFocus   → marks a field as "touched" (shows validation)
 *    onBlur    → same as onFocus (fires when user leaves field)
 *
 * 3. CONDITIONAL RENDERING (Lecture 49)
 *    - && operator  → show error only when touched + invalid
 *    - ternary      → switch button text between "Send" / "Sending…"
 *    - if/return    → show success screen after submit
 *
 * 4. LISTS AND KEYS (Lecture 49)
 *    - subject dropdown built by mapping over an array
 *    - submitted messages list rendered with key prop
 *
 * 5. TAILWIND CSS (Lecture 56)
 *    - All styling done with Tailwind utility classes
 *    - Responsive layout: single column on mobile, two columns on md+
 */

import { useState } from "react";

// ── Static data for the subject dropdown list ───────────────
const SUBJECTS = [
  "General Inquiry",
  "Donor Registration Help",
  "Blood Request Support",
  "Technical Issue",
  "Partnership / NGO",
  "Other",
];

// ── Initial form state ──────────────────────────────────────
const INITIAL_FORM = {
  name:    "",
  email:   "",
  phone:   "",
  subject: "",
  message: "",
};

// ── Validation rules per field ──────────────────────────────
function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (form.phone && !/^[0-9]{10}$/.test(form.phone))
    errors.phone = "Phone must be 10 digits (optional).";
  if (!form.subject)
    errors.subject = "Please select a subject.";
  if (form.message.trim().length < 10)
    errors.message = "Message must be at least 10 characters.";
  return errors;
}

export default function ContactPage() {
  // ── useState: controlled form fields ───────────────────────
  const [form, setForm] = useState(INITIAL_FORM);

  // ── useState: which fields user has touched (for validation) ─
  const [touched, setTouched] = useState({});

  // ── useState: loading + success states ─────────────────────
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── useState: list of past messages (Lists & Keys demo) ────
  const [messages, setMessages] = useState([]);

  // Derived: run validation on current form
  const errors  = validate(form);
  const isValid = Object.keys(errors).length === 0;

  // ── EVENT HANDLER: onChange — updates form state ────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── EVENT HANDLER: onBlur — marks field as touched ─────────
  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  // ── EVENT HANDLER: onFocus (also can mark as touched) ──────
  function handleFocus(e) {
    // Could auto-clear an error on focus — here we just track it
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  // ── EVENT HANDLER: onSubmit ─────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault(); // prevent default page reload

    // Mark all fields as touched to show all errors
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });

    if (!isValid) return; // stop if validation fails

    setLoading(true);

    // Simulate async send (1.5s)
    setTimeout(() => {
      // Add to messages list (Lists & Keys demo)
      setMessages((prev) => [
        {
          id:      Date.now(),           // unique key
          name:    form.name,
          subject: form.subject,
          message: form.message,
          time:    new Date().toLocaleTimeString("en-IN"),
        },
        ...prev,
      ]);

      setForm(INITIAL_FORM);       // reset controlled form
      setTouched({});
      setLoading(false);
      setSubmitted(true);          // conditional render: show success screen
    }, 1500);
  }

  // ── CONDITIONAL RENDERING: success screen ──────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-soft-red flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Message Sent!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for contacting BloodConnect. We'll get back to you soon.
          </p>

          {/* LISTS AND KEYS — render submitted messages list */}
          {messages.length > 0 && (
            <div className="text-left mt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Your Messages
              </h3>
              <ul className="space-y-3">
                {messages.map((msg) => (
                  /* key prop — required for list items in React */
                  <li
                    key={msg.id}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-700">
                        {msg.subject}
                      </span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{msg.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 w-full bg-blood text-white rounded-xl py-3 font-bold hover:bg-blood-dark transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  // ── Helper: render an error message conditionally ───────────
  // Shows only when field is "touched" AND has an error
  function FieldError({ name }) {
    return touched[name] && errors[name] ? (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    ) : null;
  }

  /* ── JSX: Main Contact Form ── */
  return (
    <div className="min-h-screen bg-cream py-12 px-4">

      {/* Page heading */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <p className="text-blood text-sm font-bold tracking-widest uppercase mb-2">
          GET IN TOUCH
        </p>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
          Contact BloodConnect
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto">
          Have a question or need help? Fill out the form below — we respond within 24 hours.
        </p>
      </div>

      {/*
        TAILWIND RESPONSIVE LAYOUT (Lecture 56)
        - md:grid-cols-2  → two columns on medium+ screens
        - single column on mobile
      */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Left: Contact Form ── */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Send a Message</h2>

          {/*
            CONTROLLED FORM
            Every input is "controlled" — value comes from React state,
            onChange updates state on every keystroke
          */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name — controlled input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Full Name <span className="text-blood">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}           /* controlled: value from state */
                onChange={handleChange}     /* event: updates state */
                onBlur={handleBlur}         /* event: marks as touched */
                onFocus={handleFocus}       /* event: also fires on focus */
                placeholder="Your full name"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                  ${touched.name && errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-blood"
                  }`}
              />
              {/* CONDITIONAL RENDERING: show error only when touched */}
              <FieldError name="name" />
            </div>

            {/* Email — controlled input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Email <span className="text-blood">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                  ${touched.email && errors.email
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-blood"
                  }`}
              />
              <FieldError name="email" />
            </div>

            {/* Phone — optional controlled input */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit mobile number"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                  ${touched.phone && errors.phone
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-blood"
                  }`}
              />
              <FieldError name="phone" />
            </div>

            {/*
              LISTS AND KEYS — subject dropdown built from SUBJECTS array
              Each <option> needs a key prop
            */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Subject <span className="text-blood">*</span>
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors
                  ${touched.subject && errors.subject
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-blood"
                  }`}
              >
                <option value="">— Select a subject —</option>
                {/* LISTS AND KEYS: map array → JSX elements with key */}
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FieldError name="subject" />
            </div>

            {/* Message — controlled textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Message <span className="text-blood">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe your query…"
                rows={4}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none
                  ${touched.message && errors.message
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-blood"
                  }`}
              />
              {/* CONDITIONAL RENDERING: char count + error */}
              <div className="flex justify-between items-center mt-1">
                <FieldError name="message" />
                {/* && operator: only show count when user has typed */}
                {form.message.length > 0 && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {form.message.length} chars
                  </span>
                )}
              </div>
            </div>

            {/*
              CONDITIONAL RENDERING: button text changes based on loading state
              disabled attribute prevents double-submit
            */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blood hover:bg-blood-dark"
                }`}
            >
              {/* TERNARY: different text when loading */}
              {loading ? "Sending…" : "Send Message →"}
            </button>
          </form>
        </div>

        {/* ── Right: Info Cards (Tailwind responsive layout) ── */}
        <div className="space-y-5">

          {/* Info card: location */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-4">
            <div className="text-3xl">📍</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Our Location</h3>
              <p className="text-sm text-gray-500">
                BloodConnect HQ, Sector 15, Chandigarh, India — 160015
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-4">
            <div className="text-3xl">📞</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
              <p className="text-sm text-gray-500">+91 98765 43210</p>
              <p className="text-xs text-gray-400 mt-1">Mon–Sat, 9am–6pm IST</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-4">
            <div className="text-3xl">✉️</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
              <p className="text-sm text-gray-500">support@bloodconnect.in</p>
            </div>
          </div>

          {/*
            TAILWIND: bg-blood uses custom color from tailwind.config
            Responsive card — full width on all screens
          */}
          <div className="bg-blood rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Emergency?</h3>
            <p className="text-sm opacity-85 mb-4">
              For urgent blood requirements, go directly to Search Donors.
            </p>
            <a
              href="/search"
              className="inline-block bg-white text-blood font-bold text-sm rounded-xl px-5 py-2 hover:bg-soft-red transition-colors"
            >
              🔍 Find Blood Now
            </a>
          </div>

          {/* LISTS AND KEYS: FAQ list */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-4">Common Questions</h3>
            <ul className="space-y-3">
              {[
                { q: "How do I register as a donor?",    a: "Go to Donate Blood and fill the form." },
                { q: "Who can donate blood?",            a: "Anyone aged 18–65, weight ≥50 kg." },
                { q: "How often can I donate?",          a: "Once every 56 days (every ~2 months)." },
              ].map((faq, index) => (
                /* key prop required when rendering lists */
                <li key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-gray-700">{faq.q}</p>
                  <p className="text-sm text-gray-400 mt-1">{faq.a}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
