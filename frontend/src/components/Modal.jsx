import { useEffect } from "react";

/**
 * Modal — Reusable overlay modal component
 *
 * Props:
 *   title    {string}   — modal heading
 *   onClose  {function} — called when user closes (sets useState to null in parent)
 *   children {node}     — modal body content (JSX children prop)
 *
 * Demonstrates:
 *   • children prop pattern in JSX
 *   • Event handler as prop
 *   • useEffect inside a component (Escape key listener)
 */
export default function Modal({ title, onClose, children }) {
  // useEffect: register keyboard listener, clean up on unmount
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // JSX: overlay click closes modal
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents inner click from closing modal */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          {/* title prop rendered as JSX heading */}
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* children prop — whatever the parent passes inside <Modal>…</Modal> */}
        {children}
      </div>
    </div>
  );
}
