/**
 * AlertMessage — Reusable alert / feedback message component
 *
 * Props:
 *   type    {string}  — "error" | "success" | "warning"
 *   message {string}  — text to display
 *   style   {object}  — optional extra styles (passed as JSX prop)
 *
 * Uses JSX conditional rendering — renders nothing when message is null/empty
 */
export default function AlertMessage({ type = "error", message, style = {} }) {
  // JSX conditional: render nothing if no message
  if (!message) return null;

  return (
    <div
      className={`auth-message ${type}`}
      role="alert"
      style={style}
    >
      {/* JSX expression: icon based on type prop */}
      <span style={{ marginRight: 8 }}>
        {type === "success" && "✅"}
        {type === "error"   && "❌"}
        {type === "warning" && "⚠️"}
      </span>
      {message}
    </div>
  );
}
