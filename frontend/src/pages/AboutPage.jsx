import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <div className="about-page">
        <div className="about-hero">
          <h1>About BloodConnect</h1>
          <p>We connect blood donors with patients in need, making the life-saving process faster and simpler.</p>
        </div>

        <div className="about-content">
          {/* Mission */}
          <div className="about-grid">
            <img src="/images/about-network.jpg" alt="Blood donor network" />
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                BloodConnect was built with a single purpose: to eliminate the gap between blood donors
                and patients in critical need. By using technology, we make it possible for anyone to
                find compatible donors in their city within minutes.
              </p>
              <p style={{ marginTop: 16 }}>
                Every year, millions of patients need blood transfusions. With BloodConnect, donors can
                register once and be found whenever a compatible patient needs help nearby.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-value">3</div>
              <div className="about-stat-label">Lives saved per donation</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-value">56</div>
              <div className="about-stat-label">Days between donations</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-value">8</div>
              <div className="about-stat-label">Blood group types supported</div>
            </div>
          </div>

          {/* How it works */}
          <div className="about-text" style={{ marginBottom: 60 }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, marginBottom: 24 }}>How BloodConnect Works</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { n: "01", title: "Register & Create Profile", desc: "Create a free account and register as a donor with your blood group and city." },
                { n: "02", title: "Check Eligibility", desc: "The system automatically checks your eligibility based on your last donation date (56-day cooldown)." },
                { n: "03", title: "Post Blood Requests", desc: "Hospitals or family members can post urgent blood requirements with patient details." },
                { n: "04", title: "Instant Matching", desc: "Our algorithm instantly matches requests with compatible, eligible donors in the same city." },
              ].map((s) => (
                <div key={s.n} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 44, height: 44, borderRadius: "50%", background: "var(--soft-red)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 15, color: "var(--grey)", lineHeight: 1.65 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility criteria */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, marginBottom: 20 }}>Donor Eligibility Criteria</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Age", "18 to 65 years"],
                ["Weight", "Minimum 50 kg"],
                ["Donation Interval", "At least 56 days since last donation"],
                ["Health", "No major illness in last 6 months"],
                ["Tattoos / Piercings", "None in last 6 months"],
                ["Medication", "No blood-thinning medications"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--red)", fontWeight: 700, marginTop: 2 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                    <div style={{ fontSize: 14, color: "var(--grey)" }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
