/**
 * App.jsx — Root component
 * ─────────────────────────────────────────────────────────
 * Lecture 42  — Vite Setup, Project Structure
 * Lecture 52  — React Router, BrowserRouter, Routes, Navigation
 * Lecture 53  — Route Parameters, Nested Routes, Layout Components
 * Lecture 54  — Context API (AuthProvider wraps everything)
 * Lecture 60  — Protected Routes, JWT Storage, MERN Flow
 * ─────────────────────────────────────────────────────────
 *
 * ROUTING STRUCTURE:
 *
 * Public routes:
 *   /               → HomePage
 *   /login          → LoginPage
 *   /register       → RegisterPage
 *   /about          → AboutPage
 *   /contact        → ContactPage      ← Lecture 48 (Events, Controlled Forms)
 *   /stats          → BloodStatsPage   ← Lecture 50-51 (useEffect patterns)
 *
 * Nested routes (Lecture 53):
 *   /donors                  → DonorsLayout (layout component with <Outlet />)
 *     index                  → DonorsIndexPage
 *     :id                    → DonorDetailPage     ← Route Parameter
 *     :id/history            → DonorHistoryPage    ← Nested Route
 *
 * Protected routes (Lecture 60):
 *   /donor          → DonorPage       (requires JWT)
 *   /search         → SearchPage      (requires JWT)
 *   /request        → RequestPage     (requires JWT)
 *   /matches        → MatchesPage     (requires JWT)
 *   /dashboard      → DashboardPage   (requires JWT)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import Navbar            from "./components/Navbar";
import PrivateRoute      from "./components/PrivateRoute";

// ── Pages ──────────────────────────────────────────────────
import HomePage          from "./pages/HomePage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import DonorPage         from "./pages/DonorPage";
import SearchPage        from "./pages/SearchPage";
import RequestPage       from "./pages/RequestPage";
import MatchesPage       from "./pages/MatchesPage";
import DashboardPage     from "./pages/DashboardPage";
import AboutPage         from "./pages/AboutPage";

// ── Lecture 48: Event Handling, Forms, Controlled Components ─
import ContactPage       from "./pages/ContactPage";

// ── Lecture 50-51: useEffect, Side Effects, API Calls ───────
import BloodStatsPage    from "./pages/BloodStatsPage";

// ── Lecture 53: Nested Routes & Layout Components ───────────
import DonorsLayout      from "./components/layouts/MainLayout";
import DonorsIndexPage   from "./pages/donors/DonorsIndexPage";
import DonorDetailPage   from "./pages/donors/DonorDetailPage";
import DonorHistoryPage  from "./pages/donors/DonorHistoryPage";

export default function App() {
  return (
    /*
     * BrowserRouter — provides routing context to entire app
     * Lecture 52: React Router uses HTML5 History API
     */
    <BrowserRouter>
      {/*
       * AuthProvider — provides global auth state via Context API
       * Lecture 54: wraps everything so any component can useAuth()
       */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <>
      {/* Navbar is outside Routes — renders on every page */}
      <Navbar />

      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about"    element={<AboutPage />} />

        {/* Lecture 48: Event Handling, Forms */}
        <Route path="/contact"  element={<ContactPage />} />

        {/* Lecture 50-51: useEffect patterns */}
        <Route path="/stats"    element={<BloodStatsPage />} />

        {/*
         * NESTED ROUTES (Lecture 53)
         * DonorsLayout wraps all /donors/* routes
         * It renders <Outlet /> where the child route should appear
         *
         *   /donors            → index route → DonorsIndexPage
         *   /donors/:id        → route param → DonorDetailPage
         *   /donors/:id/history → nested    → DonorHistoryPage
         */}
        <Route path="/donors" element={<DonorsLayout />}>
          <Route index              element={<DonorsIndexPage />} />
          <Route path=":id"         element={<DonorDetailPage />} />
          <Route path=":id/history" element={<DonorHistoryPage />} />
        </Route>

        {/*
         * PROTECTED ROUTES (Lecture 60)
         * PrivateRoute checks isLoggedIn from AuthContext
         * If not logged in → redirect to /login with current path in state
         * After login → redirect back to intended page
         */}
        <Route path="/donor"     element={<PrivateRoute><DonorPage /></PrivateRoute>} />
        <Route path="/search"    element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/request"   element={<PrivateRoute><RequestPage /></PrivateRoute>} />
        <Route path="/matches"   element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

        {/* Catch-all — redirect unknown paths to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
