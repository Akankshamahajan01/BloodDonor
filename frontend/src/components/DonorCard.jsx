import { useState } from "react";
import DonorModal from "./DonorModal";
import EligibilityBadge from "./EligibilityBadge";

/**
 * getInitials — helper to build avatar initials from a name
 * @param {string} name
 * @returns {string} e.g. "RS" for "Rajesh Sharma"
 */
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * DonorCard — Displays a single donor's summary card
 *
 * Props:
 *   donor    {object}  — donor data object (name, bloodGroup, location, etc.)
 *   nearCity {string}  — user's search city; used to show "Near You" badge
 *
 * State:
 *   showModal {boolean} — controls detail modal visibility (useState)
 *
 * Demonstrates:
 *   • Props destructuring
 *   • useState for local UI state (modal open/close)
 *   • JSX conditional rendering with &&
 *   • Passing props down to child components (DonorModal, EligibilityBadge)
 */
export default function DonorCard({ donor, nearCity }) {
  // useState — local state: is the detail modal open?
  const [showModal, setShowModal] = useState(false);

  // Derived value from props
  const isNear =
    nearCity &&
    donor.location?.toLowerCase() === nearCity.toLowerCase();

  return (
    <>
      {/* ── Card JSX ── */}
      <div className="donor-card">

        {/* Top: avatar + name */}
        <div className="donor-card-top">
          <div className="donor-avatar">
            {/* JSX conditional: photo or initials */}
            {donor.avatarUrl ? (
              <img src={donor.avatarUrl} alt={donor.name} />
            ) : (
              <span>{getInitials(donor.name)}</span>
            )}
          </div>
          <div>
            <div className="donor-name">{donor.name}</div>
            <div className="donor-location">📍 {donor.location}</div>
          </div>
        </div>

        {/* Badges — using EligibilityBadge child component via props */}
        <div className="donor-badges">
          <span className="badge badge-blood">{donor.bloodGroup}</span>

          {/* EligibilityBadge: passes eligible + daysRemaining as props */}
          <EligibilityBadge
            eligible={donor.eligible}
            daysRemaining={donor.daysRemaining}
          />

          {/* JSX &&: only show if near city */}
          {isNear && <span className="badge badge-near">📍 Near You</span>}

          {/* JSX &&: only show if locally registered donor */}
          {donor.source === "local" && (
            <span className="badge badge-registered">Registered</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="donor-card-actions">
          <a href={`tel:${donor.phone}`} className="btn-call">
            📞 Call
          </a>
          {/* onClick updates useState → opens modal */}
          <button
            className="btn-details"
            onClick={() => setShowModal(true)}
          >
            View Details
          </button>
        </div>
      </div>

      {/* JSX conditional: modal rendered only when showModal === true */}
      {showModal && (
        <DonorModal
          donor={donor}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
