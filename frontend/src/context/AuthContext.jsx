/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────
 * Lecture 54  — Context API, useContext(), Global State Management
 * Lecture 57  — Authentication UI (Login, Registration, Validation)
 * Lecture 60  — JWT Storage, Protected Routes, Authentication Flow,
 *               Connecting React with Express APIs, CORS
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPT: Context API + useContext()
 *   Auth state (user, token, isLoggedIn) is "global" —
 *   needed by Navbar, PrivateRoute, every protected page.
 *   Instead of prop-drilling it 5 levels deep, we put it in Context.
 *
 *   createContext()  → creates the context object
 *   <AuthContext.Provider value={...}> → provides values to the tree
 *   useContext(AuthContext) → any child reads those values
 *   useAuth() → custom hook that wraps useContext for cleaner imports
 *
 * CONCEPT: JWT Storage (Lecture 60)
 *   After login, the backend returns a JWT token.
 *   We store it in localStorage under "bloodConnectToken".
 *   Every API call attaches it as "Authorization: Bearer <token>"
 *   (done automatically by the Axios interceptor in services/api.js).
 *
 * CONCEPT: Authentication Flow (Lecture 60)
 *   Register → POST /api/auth/register → get { token, user }
 *   Login    → POST /api/auth/login    → get { token, user }
 *   Save both to localStorage + React state
 *   Logout   → remove from localStorage + clear React state
 *   PrivateRoute checks isLoggedIn before rendering protected pages
 *
 * CONCEPT: CORS (Lecture 60)
 *   React dev server runs on http://localhost:5173
 *   Express backend runs on http://localhost:5000
 *   These are different "origins" → browser blocks cross-origin requests
 *   Solution: backend .env has ALLOWED_ORIGINS=http://localhost:5173
 *   Express cors() middleware reads this and allows the request
 */

import { createContext, useContext, useState } from "react";
import api, { API_ENDPOINTS } from "../services/api";

// ── 1. createContext() — creates the context object ─────
const AuthContext = createContext(null);

// ── 2. AuthProvider — wraps the app, provides global auth state ─
export function AuthProvider({ children }) {

  // ── useState: user object (name, email, phone, createdAt) ──
  const [user, setUser] = useState(() => {
    // Lazy initializer — reads from localStorage on first render
    // This persists login across page refreshes
    const stored = localStorage.getItem("bloodConnectCurrentUser");
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  });

  // ── useState: JWT token string ──────────────────────────
  const [token, setToken] = useState(
    () => localStorage.getItem("bloodConnectToken") || null
  );

  // Derived boolean — no extra useState needed
  const isLoggedIn = Boolean(user);

  // ── Helper: save session data ───────────────────────────
  // Called after successful login OR register+auto-login
  function saveSession(userData, tokenStr) {
    // JWT STORAGE (Lecture 60): persist in localStorage
    localStorage.setItem("bloodConnectCurrentUser", JSON.stringify(userData));
    localStorage.setItem("bloodConnectToken", tokenStr);
    // Update React state → triggers re-render of Navbar, PrivateRoute etc.
    setUser(userData);
    setToken(tokenStr);
  }

  // ── LOGIN — POST /api/auth/login ────────────────────────
  // Lecture 60: React → Axios → Express API → MongoDB → JWT response
  async function login(email, password) {
    const { data } = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    saveSession(data.user, data.token);
    return data;
  }

  // ── REGISTER — POST /api/auth/register ─────────────────
  async function register(name, email, phone, password) {
    const { data } = await api.post(API_ENDPOINTS.REGISTER, {
      name, email, phone, password,
    });
    return data; // caller decides whether to auto-login
  }

  // ── LOGOUT ───────────────────────────────────────────────
  // JWT STORAGE: remove from localStorage + clear state
  function logout() {
    localStorage.removeItem("bloodConnectCurrentUser");
    localStorage.removeItem("bloodConnectToken");
    setUser(null);
    setToken(null);
  }

  // ── Utility: get initials from full name ────────────────
  function getInitials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // ── 3. Provider JSX — exposes values to entire component tree ─
  return (
    <AuthContext.Provider
      value={{
        user,       // object: { id, name, email, phone, createdAt }
        token,      // string: JWT token
        isLoggedIn, // boolean: derived from user state
        login,      // function: POST /api/auth/login
        register,   // function: POST /api/auth/register
        logout,     // function: clear session
        getInitials,// utility function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── 4. useAuth() — custom hook for clean consumption ────
// Any component: const { user, isLoggedIn } = useAuth()
// instead of: const ctx = useContext(AuthContext)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
