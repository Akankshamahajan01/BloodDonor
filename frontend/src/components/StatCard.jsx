/**
 * StatCard — Dashboard statistics card component
 *
 * Props:
 *   icon    {string}   — emoji icon
 *   value   {number}   — the stat value (from useState in parent)
 *   label   {string}   — stat description label
 *   hint    {string}   — small hint text
 *   onClick {function} — click handler (opens modal in parent via useState setter)
 *
 * Demonstrates:
 *   • Props destructuring
 *   • onClick prop passed down from parent
 *   • JSX rendering of dynamic prop values
 */
export default function StatCard({ icon, value, label, hint, onClick }) {
  return (
    <div
      className="db-stat-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`${label}: ${value}`}
    >
      {/* JSX: each field is a prop */}
      <div className="db-stat-icon">{icon}</div>
      <div className="db-stat-value">{value}</div>
      <div className="db-stat-label">{label}</div>
      <div className="db-stat-hint">{hint}</div>
    </div>
  );
}
