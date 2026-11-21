import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }   from "../context/AuthContext";
import BloodPill     from "../components/BloodPill";
import Footer        from "../components/Footer";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMPATIBILITY_INFO = {
  "A+":  { canDonateTo: "A+, AB+",                      canReceiveFrom: "A+, A-, O+, O-" },
  "A-":  { canDonateTo: "A+, A-, AB+, AB-",             canReceiveFrom: "A-, O-" },
  "B+":  { canDonateTo: "B+, AB+",                      canReceiveFrom: "B+, B-, O+, O-" },
  "B-":  { canDonateTo: "B+, B-, AB+, AB-",             canReceiveFrom: "B-, O-" },
  "AB+": { canDonateTo: "AB+",                           canReceiveFrom: "Everyone (Universal Recipient)" },
  "AB-": { canDonateTo: "AB+, AB-",                     canReceiveFrom: "A-, B-, AB-, O-" },
  "O+":  { canDonateTo: "A+, B+, AB+, O+",              canReceiveFrom: "O+, O-" },
  "O-":  { canDonateTo: "Everyone (Universal Donor)",   canReceiveFrom: "O-" },
};

/**
 * HowStep — Single step in the "How it Works" section
 *
 * Props:
 *   number {string} — step number
 *   title  {string} — step heading
 *   desc   {string} — step description
 *
 * Demonstrates: simple presentational JSX component, all data via props
 */
function HowStep({ number, title, desc }) {
  return (
    <div className="how-step">
      <div className="how-step-num">{number}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/**
 * CompatibilityInfo — Shows blood group compatibility details
 *
 * Props:
 *   group {string} — selected blood group (from parent useState)
 *   info  {object} — { canDonateTo, canReceiveFrom }
 *
 * Demonstrates: props-only rendering, JSX conditional (null when no group)
 */
function CompatibilityInfo({ group, info }) {
  if (!group || !info) return null;

  return (
    <div className="blood-group-info" style={{ marginTop: 20 }}>
      <h4>Blood Group {group}</h4>
      <p><strong>Can donate to:</strong> {info.canDonateTo}</p>
      <p style={{ marginTop: 8 }}><strong>Can receive from:</strong> {info.canReceiveFrom}</p>
    </div>
  );
}

/**
 * HomePage — Landing page
 *
 * State (useState):
 *   activeGroup {string|null} — which blood group badge is selected
 *
 * Props used:
 *   BloodPill receives: group, isActive, onClick
 *   HowStep receives: number, title, desc
 *   CompatibilityInfo receives: group, info
 *
 * Context:
 *   useAuth() → isLoggedIn (drives protected navigation)
 */
export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();

  // ── useState: which blood group is selected in the grid ──
  const [activeGroup, setActiveGroup] = useState(null);

  // Derived from state — no extra useState needed
  const compatInfo = activeGroup ? COMPATIBILITY_INFO[activeGroup] : null;

  // Navigate to protected page or redirect to login
  function goProtected(path) {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  }

  // Toggle blood group selection — updates activeGroup state
  function handleGroupClick(group) {
    setActiveGroup((prev) => (prev === group ? null : group));
  }

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-pulse" />
            Blood Donor Network
          </div>
          <h1 className="hero-title">
            Save a Life,<br />
            {/* JSX: italic span changes color via CSS */}
            <span>Donate Blood</span>
          </h1>
          <p className="hero-desc">
            Connect with blood donors in your city within minutes.
            Every donation can save up to 3 lives.
          </p>

          <div className="hero-ctas">
            {/* onClick calls goProtected — checks isLoggedIn state from context */}
            <button className="btn-primary" onClick={() => goProtected("/donor")}>
              🩸 Become a Donor
            </button>
            <button className="btn-outline" onClick={() => goProtected("/search")}>
              🔍 Find Blood
            </button>
          </div>

          <div className="hero-benefits">
            {/* JSX: map over array to render benefit items */}
            {[
              "Free & easy donor registration",
              "Instant blood group matching",
              "Connect directly with donors",
            ].map((benefit) => (
              <div key={benefit} className="hero-benefit">
                <span className="benefit-dot" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <img src="/images/hero-blood.jpg" alt="Blood donation hero" />
        </div>
      </section>

      {/* ── Choice Cards ── */}
      <section className="choice-section">
        <div className="section-header">
          <p className="section-label">GET STARTED</p>
          <h2 className="section-title">What do you need?</h2>
        </div>
        <div className="choice-cards">
          {/* JSX: each card is a button that calls goProtected */}
          <button className="choice-card" onClick={() => goProtected("/donor")}>
            <div className="choice-card-img">
              <img src="/images/donate-blood.jpg" alt="Donate blood" />
            </div>
            <div className="choice-card-body">
              <h3>🩸 Donate Blood</h3>
              <p>Register as a donor and help patients in need. Check your eligibility instantly.</p>
              <span className="choice-card-link">Register as donor →</span>
            </div>
          </button>

          <button className="choice-card" onClick={() => goProtected("/search")}>
            <div className="choice-card-img">
              <img src="/images/need-blood.jpg" alt="Need blood" />
            </div>
            <div className="choice-card-body">
              <h3>🔍 Need Blood</h3>
              <p>Search for compatible donors near your hospital and get matched instantly.</p>
              <span className="choice-card-link">Search donors →</span>
            </div>
          </button>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <div className="section-header">
          <p className="section-label">HOW IT WORKS</p>
          <h2 className="section-title">Simple steps to save a life</h2>
        </div>
        <div className="how-steps">
          {/* HowStep: number, title, desc passed as props */}
          <HowStep number="1" title="Create Account"    desc="Register with your details in under 2 minutes." />
          <HowStep number="2" title="Check Eligibility" desc="Register as a donor and instantly see if you're eligible." />
          <HowStep number="3" title="Create Request"    desc="Post a blood requirement with patient details and urgency." />
          <HowStep number="4" title="Find Match"        desc="Get matched with compatible donors in your city immediately." />
        </div>
      </section>

      {/* ── Blood Groups ── */}
      <section className="blood-groups-section">
        <div className="section-header">
          <p className="section-label">COMPATIBILITY</p>
          <h2 className="section-title">Know Your Blood Type</h2>
          <p className="section-desc" style={{ marginTop: 10 }}>
            Click a blood group to see compatibility information.
          </p>
        </div>

        <div className="blood-groups-grid">
          {/* BloodPill: group, isActive (derived from activeGroup state), onClick */}
          {BLOOD_GROUPS.map((bg) => (
            <BloodPill
              key={bg}
              group={bg}
              isActive={activeGroup === bg}
              onClick={handleGroupClick}
            />
          ))}
        </div>

        {/* CompatibilityInfo: group + info passed as props from state */}
        <CompatibilityInfo group={activeGroup} info={compatInfo} />
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <h2>Ready to make a difference?</h2>
        <p>Join thousands of donors who are saving lives every day.</p>
        <button className="btn-white" onClick={() => goProtected("/donor")}>
          🩸 Become a Donor Today
        </button>
      </section>

      <Footer />
    </>
  );
}
