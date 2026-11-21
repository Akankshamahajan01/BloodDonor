import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }   from "../context/AuthContext";
import api, { API_ENDPOINTS } from "../services/api";
import StatCard      from "../components/StatCard";
import Modal         from "../components/Modal";
import EligibilityBadge from "../components/EligibilityBadge";

/** Returns greeting based on current hour */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/**
 * DashboardPage — Protected user dashboard
 *
 * State (useState):
 *   stats      — { total, eligible, cities, requests } numbers for stat cards
 *   donors     — array of all donors from API
 *   requests   — array of all blood requests from API
 *   modal      — string | null: which modal is open ("donors"|"requests"|"eligible"|"cities")
 *   donorSearch / donorBg      — filter state for donors modal
 *   reqSearch / reqBg / reqUrgency — filter state for requests modal
 *
 * Props used:
 *   StatCard receives: icon, value, label, hint, onClick
 *   Modal receives: title, onClose, children
 *   EligibilityBadge receives: eligible, daysRemaining
 */
export default function DashboardPage() {
  const { user, logout, getInitials } = useAuth();
  const navigate = useNavigate();

  // ── useState: dashboard statistics ───────────────────────
  const [stats, setStats] = useState({
    total: 0, eligible: 0, cities: 0, requests: 0,
  });

  // ── useState: data arrays from API ────────────────────────
  const [donors,   setDonors]   = useState([]);
  const [requests, setRequests] = useState([]);

  // ── useState: which modal is currently open (null = none) ─
  const [modal, setModal] = useState(null);

  // ── useState: filter inputs for Donors modal ─────────────
  const [donorSearch, setDonorSearch] = useState("");
  const [donorBg,     setDonorBg]     = useState("");

  // ── useState: filter inputs for Requests modal ───────────
  const [reqSearch,  setReqSearch]  = useState("");
  const [reqBg,      setReqBg]      = useState("");
  const [reqUrgency, setReqUrgency] = useState("");

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, donorsRes, reqsRes] = await Promise.allSettled([
          api.get(API_ENDPOINTS.DONOR_STATS),
          api.get(`${API_ENDPOINTS.DONORS}?limit=100`),
          api.get(`${API_ENDPOINTS.REQUESTS}?limit=100`),
        ]);

        if (statsRes.status === "fulfilled") {
          const s = statsRes.value.data;
          setStats((prev) => ({
            ...prev,
            total:    s.total    || 0,
            eligible: s.eligible || 0,
            cities:   s.cities   || 0,
          }));
        }
        if (donorsRes.status === "fulfilled") {
          setDonors(donorsRes.value.data.donors || []);
        }
        if (reqsRes.status === "fulfilled") {
          const reqs = reqsRes.value.data.requests || [];
          setRequests(reqs);
          // Update requests count in stats state
          setStats((prev) => ({ ...prev, requests: reqs.length }));
        }
      } catch { /* silently continue on network error */ }
    }
    fetchData();
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  // ── Derived / filtered lists (computed from state, no extra useState) ──

  const filteredDonors = donors.filter((d) => {
    const q = donorSearch.toLowerCase();
    return (
      (!q || d.name?.toLowerCase().includes(q) || d.location?.toLowerCase().includes(q)) &&
      (!donorBg || d.bloodGroup === donorBg)
    );
  });

  const eligibleDonors = donors.filter((d) => d.eligible);

  const filteredReqs = requests.filter((r) => {
    const q = reqSearch.toLowerCase();
    return (
      (!q || r.patientName?.toLowerCase().includes(q) || r.hospital?.toLowerCase().includes(q)) &&
      (!reqBg      || r.bloodGroup === reqBg) &&
      (!reqUrgency || r.urgency    === reqUrgency)
    );
  });

  // Cities breakdown: { CityName: count }
  const cityMap = donors.reduce((acc, d) => {
    if (d.location) acc[d.location] = (acc[d.location] || 0) + 1;
    return acc;
  }, {});
  const citiesList = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);

  // StatCard data — onClick updates modal state
  const statCards = [
    { key: "donors",   icon: "🩸", value: stats.total,    label: "Total Donors",    hint: "Click to view all" },
    { key: "requests", icon: "📋", value: stats.requests,  label: "Blood Requests",  hint: "Click to view all" },
    { key: "eligible", icon: "✅", value: stats.eligible,  label: "Eligible Donors", hint: "Ready to donate now" },
    { key: "cities",   icon: "🏙️", value: stats.cities,    label: "Cities Covered",  hint: "Across India" },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <>
      <div className="db-body">
        <div className="db-shell">

          {/* ── Sidebar ── */}
          <aside className="db-sidebar">
            <div className="db-sid-profile">
              <div className="db-sid-avatar">{getInitials(user?.name || "")}</div>
              <div className="db-sid-info">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="db-sid-divider" />

            <nav className="db-sid-nav">
              <Link to="/donor"  className="db-sid-link"><span>🩸</span> Donate Blood</Link>
              <Link to="/search" className="db-sid-link"><span>🔍</span> Search Donors</Link>
              <Link to="/about"  className="db-sid-link"><span>ℹ️</span> About Us</Link>
            </nav>

            <div className="db-sid-divider" />

            <div className="db-sid-fields">
              <div className="db-sid-field">
                <span>PHONE</span>
                <strong>{user?.phone || "—"}</strong>
              </div>
              <div className="db-sid-field">
                <span>MEMBER SINCE</span>
                <strong>{formatDate(user?.createdAt)}</strong>
              </div>
            </div>

            <button className="db-sid-logout" onClick={handleLogout}>
              <span>↪</span> Sign Out
            </button>
          </aside>

          {/* ── Main Content ── */}
          <main className="db-main">

            {/* Hero banner */}
            <div className="db-hero">
              <p className="db-hero-label">MY BLOODCONNECT</p>
              <h1 className="db-hero-title">
                Good {getGreeting()},<br />
                {user?.name?.split(" ")[0] || "User"} 👋
              </h1>
              <p className="db-hero-sub">Your dashboard is ready. Here's today's overview.</p>
              <p className="db-hero-date">{today}</p>
            </div>

            {/* Stats grid — StatCard receives icon, value, label, hint, onClick as props */}
            <div className="db-stats">
              {statCards.map((card) => (
                <StatCard
                  key={card.key}
                  icon={card.icon}
                  value={card.value}
                  label={card.label}
                  hint={card.hint}
                  onClick={() => setModal(card.key)}
                />
              ))}
            </div>

            {/* Quick action links */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link to="/donor"   className="btn-primary">🩸 Register as Donor</Link>
              <Link to="/request" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                📋 New Blood Request
              </Link>
              <Link to="/search"  className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                🔍 Search Donors
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* ── Donors / Eligible Modal ── */}
      {/* JSX conditional: only render when modal state matches */}
      {(modal === "donors" || modal === "eligible") && (
        <Modal
          title={modal === "eligible" ? "Eligible Donors" : "All Registered Donors"}
          onClose={() => setModal(null)}
        >
          {/* Filter controls — update donorSearch / donorBg state */}
          <div className="modal-filters">
            <input
              className="modal-filter-input"
              placeholder="Search by name or city…"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
            />
            <select
              className="modal-filter-select"
              value={donorBg}
              onChange={(e) => setDonorBg(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="modal-list">
            {(modal === "eligible" ? eligibleDonors : filteredDonors)
              .slice(0, 50)
              .map((d) => (
                <div key={d._id} className="modal-donor-item">
                  <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                    {getInitials(d.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: "var(--grey)" }}>📍 {d.location}</div>
                  </div>
                  <span className="badge badge-blood">{d.bloodGroup}</span>
                  {/* EligibilityBadge: eligible + daysRemaining props */}
                  <EligibilityBadge
                    eligible={d.eligible}
                    daysRemaining={d.daysRemaining}
                  />
                </div>
              ))}
            {filteredDonors.length === 0 && (
              <p style={{ color: "var(--grey)", textAlign: "center", padding: 20 }}>
                No donors found.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Blood Requests Modal ── */}
      {modal === "requests" && (
        <Modal title="Blood Requests" onClose={() => setModal(null)}>
          <div className="modal-filters">
            <input
              className="modal-filter-input"
              placeholder="Search patient or hospital…"
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
            />
            <select
              className="modal-filter-select"
              value={reqBg}
              onChange={(e) => setReqBg(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <select
              className="modal-filter-select"
              value={reqUrgency}
              onChange={(e) => setReqUrgency(e.target.value)}
            >
              <option value="">All Urgency</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="modal-list">
            {filteredReqs.slice(0, 50).map((r) => (
              <div key={r._id} className="modal-donor-item" style={{ flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{r.patientName}</div>
                  <div style={{ fontSize: 13, color: "var(--grey)" }}>
                    🏥 {r.hospital} · 📍 {r.location}
                  </div>
                </div>
                <span className="badge badge-blood">{r.bloodGroup}</span>
                <span
                  className="badge"
                  style={{
                    background: r.urgency === "critical" ? "#fff1f2"
                              : r.urgency === "urgent"   ? "#fff7ed"
                              : "#f0fdf4",
                    color:      r.urgency === "critical" ? "#991b1b"
                              : r.urgency === "urgent"   ? "#9a3412"
                              : "#166534",
                  }}
                >
                  {r.urgency}
                </span>
              </div>
            ))}
            {filteredReqs.length === 0 && (
              <p style={{ color: "var(--grey)", textAlign: "center", padding: 20 }}>
                No requests found.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Cities Modal ── */}
      {modal === "cities" && (
        <Modal title="Cities Covered" onClose={() => setModal(null)}>
          <div className="modal-list">
            {citiesList.map(([city, count]) => (
              <div
                key={city}
                className="modal-donor-item"
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ fontWeight: 600 }}>📍 {city}</div>
                <span className="badge badge-blood">
                  {count} donor{count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
            {citiesList.length === 0 && (
              <p style={{ color: "var(--grey)", textAlign: "center", padding: 20 }}>
                No data yet.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
