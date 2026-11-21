/**
 * EligibilityBadge — Shows whether a donor is eligible or not
 *
 * Props:
 *   eligible     {boolean} — eligibility status
 *   daysRemaining {number}  — days until eligible (shown when not eligible)
 *
 * Demonstrates:
 *   • Props-driven conditional JSX rendering
 *   • Ternary operator in JSX
 */
export default function EligibilityBadge({ eligible, daysRemaining }) {
  return eligible ? (
    // JSX element when eligible === true
    <span className="badge badge-eligible">✓ Eligible</span>
  ) : (
    // JSX element when eligible === false
    <span className="badge badge-ineligible">
      Not Eligible
      {/* Only show days remaining if value exists */}
      {daysRemaining > 0 && ` (${daysRemaining}d)`}
    </span>
  );
}
