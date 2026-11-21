import { createContext, useContext, useState, useEffect } from "react";
import api, { API_ENDPOINTS } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bloodConnectCurrentUser");
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("bloodConnectToken") || null);

  const isLoggedIn = Boolean(user);

  function saveSession(userData, tokenStr) {
    localStorage.setItem("bloodConnectCurrentUser", JSON.stringify(userData));
    localStorage.setItem("bloodConnectToken", tokenStr);
    setUser(userData);
    setToken(tokenStr);
  }

  async function login(email, password) {
    const { data } = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    saveSession(data.user, data.token);
    return data;
  }

  async function register(name, email, phone, password) {
    const { data } = await api.post(API_ENDPOINTS.REGISTER, { name, email, phone, password });
    return data;
  }

  function logout() {
    localStorage.removeItem("bloodConnectCurrentUser");
    localStorage.removeItem("bloodConnectToken");
    setUser(null);
    setToken(null);
  }

  function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, register, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
