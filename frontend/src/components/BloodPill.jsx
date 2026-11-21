/**
 * BloodPill — Single blood group selector pill
 *
 * Props:
 *   group      {string}   — blood group label e.g. "A+"
 *   isActive   {boolean}  — whether this pill is currently selected (useState drives this)
 *   onClick    {function} — called with group string when clicked
 *
 * Demonstrates:
 *   • Props receiving (group, isActive, onClick)
 *   • JSX className expression using prop value
 *   • Event handler passed as prop
 */
export default function BloodPill({ group, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`blood-pill${isActive ? " active" : ""}`}
      onClick={() => onClick(group)}
      aria-pressed={isActive}
    >
      {/* JSX expression: render group prop value */}
      {group}
    </button>
  );
}
