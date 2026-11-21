import { useEffect } from "react";
import EligibilityBadge from "./EligibilityBadge";

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
}

/**
 * DetailRow — Small helper sub-component for label/value pairs
 *
 * Props:
 *   label {string}
 *   value {string|node}
 *
 * Demonstrates: simple props-only presentational JSX component
 */
function DetailRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--grey)", letterSpacing: ".8px", marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        {/* JSX expression: render value prop */}
        {value}
      </div>
    </div>
  );
}

/**
 * DonorModal — Full-detail overlay for a single donor
 *
 * Props:
 *   donor   {object}   — full donor object passed from DonorCard via props
 *   onClose {function} — callback to set showModal = false in DonorCard (useState)
 *
 * Demonstrates:
 *   • Props flowing down (donor data + callback)
 *   • useEffect for Escape key listener
 *   • JSX conditional rendering (avatarUrl check)
 *   • Passing props further down to EligibilityBadge and DetailRow
 */
export default function DonorModal({ donor, onClose }) {
  // useEffect: Escape key to close modal
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    // Cleanup on unmount
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // JSX: overlay click calls onClose prop
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h3>Donor Details</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Profile section */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div className="db-sid-avatar" style={{ width: 64, height: 64, fontSize: 24, flexShrink: 0 }}>
            {/* JSX conditional: avatar image or initials */}
            {donor.avatarUrl ? (
              <img
                src={donor.avatarUrl}
                alt={donor.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              getInitials(donor.name)
            )}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{donor.name}</div>
            <div style={{ fontSize: 14, color: "var(--grey)" }}>📍 {donor.location}</div>
            {/* EligibilityBadge: props passed down from donor object */}
            <div style={{ marginTop: 6 }}>
              <EligibilityBadge
                eligible={donor.eligible}
                daysRemaining={donor.daysRemaining}
              />
            </div>
          </div>
        </div>

        {/* Detail grid — uses DetailRow sub-component with props */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <DetailRow label="Blood Group"    value={donor.bloodGroup} />
          <DetailRow label="Age"            value={donor.age ? `${donor.age} years` : "N/A"} />
          <DetailRow label="Phone"          value={donor.phone || "N/A"} />
          <DetailRow label="Email"          value={donor.email || "N/A"} />
          <DetailRow label="Last Donation"  value={formatDate(donor.lastDonationDate)} />
          <DetailRow label="Location"       value={donor.location || "N/A"} />
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
          <a
            href={`tel:${donor.phone}`}
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            📞 Contact Donor
          </a>
          <button
            className="btn-outline"
            onClick={onClose}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
