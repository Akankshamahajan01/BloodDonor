/**
 * MainLayout — Layout Component
 * ─────────────────────────────────────────────────────────
 * Lecture 53 — Nested Routes, Layout Components
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPT: Layout Component
 *   A Layout Component wraps a group of routes and provides
 *   shared UI (header, sidebar, footer) without repeating it
 *   in every child page.
 *
 *   React Router's <Outlet /> renders the matched child route
 *   inside the layout — this is the "slot" pattern.
 *
 *   Structure:
 *     /donors              → DonorsLayout  (Outlet renders DonorsIndexPage)
 *     /donors/:id          → DonorsLayout  (Outlet renders DonorDetailPage)
 *     /donors/:id/history  → DonorsLayout  (Outlet renders DonorHistoryPage)
 *
 * Props: none — uses React Router's <Outlet /> for children
 */

import { Outlet, NavLink } from "react-router-dom";

export default function DonorsLayout() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Layout-level sub-navigation — shared across all /donors/* routes */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <span className="font-bold text-blood text-sm">🩸 Donors</span>
          <div className="flex gap-4">
            {[
              { to: "/donors",         label: "All Donors", end: true },
              { to: "/donors/stats",   label: "Statistics" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                    isActive
                      ? "bg-soft-red text-blood"
                      : "text-gray-500 hover:text-blood"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/*
        <Outlet /> — React Router renders the matched child route here
        This is what makes it a "Layout Component"
      */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Outlet />
      </div>

    </div>
  );
}
