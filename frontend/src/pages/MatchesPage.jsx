import { useLocation, useNavigate } from "react-router-dom";
import DonorCard from "../components/DonorCard";
import Footer from "../components/Footer";

function matchScore(donor, request) {
  let score = 0;
  if (donor.bloodGroup === request.bloodGroup) score += 70;
  if (donor.eligible === true)                 score += 20;
  if ((donor.location || "").toLowerCase() === (request.location || "").toLowerCase()) score += 10;
  return score;
}

const URGENCY_LABELS = { normal: "Normal", urgent: "🚨 Urgent", critical: "🔴 Critical" };

export default function MatchesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { request, matches } = location.state || {};

  if (!request) {
    return (
      <>
        <div className="matches-page">
          <div className="matches-container">
            <div className="empty-state">
              <div className="empty-state-icon">🩸</div>
              <h2>No Request Found</h2>
              <p>Submit a blood request to see matching donors.</p>
              <button className="btn-primary" onClick={() => navigate("/request")}>
                Make a Request
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const scored = [...matches]
    .map((d) => ({ ...d, score: matchScore(d, request) }))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="matches-page">
        <div className="matches-container">
          {/* Hero strip */}
          <div className="matches-hero">
            <h1>Matching Donors Found</h1>
            <p>Donors compatible with your blood request, ranked by match score</p>
            <div className="matches-strip">
              <div className="matches-strip-item">
                <span>BLOOD GROUP</span>
                <strong>{request.bloodGroup}</strong>
              </div>
              <div className="matches-strip-item">
                <span>UNITS</span>
                <strong>{request.units}</strong>
              </div>
              <div className="matches-strip-item">
                <span>URGENCY</span>
                <strong>{URGENCY_LABELS[request.urgency] || request.urgency}</strong>
              </div>
              <div className="matches-strip-item">
                <span>DONORS FOUND</span>
                <strong>{scored.length}</strong>
              </div>
            </div>
          </div>

          {scored.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">😔</div>
              <h2>No matches found</h2>
              <p>No eligible donors found for {request.bloodGroup} in {request.location}.</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/search")}>
                Try searching manually
              </button>
            </div>
          ) : (
            <div className="matches-grid">
              {scored.map((donor, i) => (
                <div key={donor._id || donor.id} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="match-card">
                    <div className="match-score-label">Match Score: {donor.score}/100</div>
                    <div className="match-score-bar">
                      <div className="match-score-fill" style={{ width: `${donor.score}%` }} />
                    </div>
                    <DonorCard donor={donor} nearCity={request.location} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
