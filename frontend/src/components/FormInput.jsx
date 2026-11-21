/**
 * FormInput — Reusable labeled input / select component
 *
 * Props:
 *   label      {string}   — Field label text
 *   name       {string}   — input name attribute
 *   type       {string}   — input type (text, email, tel, number, date, password)
 *   value      {string}   — controlled value (useState)
 *   onChange   {function} — change handler
 *   placeholder {string}  — placeholder text
 *   required   {boolean}  — marks field required
 *   min / max  {string}   — for number inputs
 *   children   {node}     — renders a <select> instead of <input> when provided
 */
export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  min,
  max,
  children,         // if passed → render <select>
  style = {},
  inputStyle = {},
}) {
  return (
    <div className="form-group" style={style}>
      {/* Label — rendered as JSX element */}
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Conditional JSX: select OR input */}
      {children ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          style={inputStyle}
          className="urgency-select"
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          style={inputStyle}
        />
      )}
    </div>
  );
}
