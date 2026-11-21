/**
 * DonorsIndexPage — /donors
 * ─────────────────────────────────────────────────────────
 * Lecture 53 — Route Parameters, Nested Routes, Layout Components
 * Lecture 50-51 — useEffect with API call
 * Lecture 49 — Conditional Rendering, Lists and Keys
 * ─────────────────────────────────────────────────────────
 *
 * This is the index page for the nested /donors route.
 * It lives inside DonorsLayout (Outlet slot).
 *
 * Each donor card links to /donors/:id  — a Route Parameter route.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { API_ENDPOINTS } from "../../services/api";

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function DonorsIndexPage() {
  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [bgFilter, setBgFilter] = useState("");

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // useEffect [] — fetch donors on mount
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`${API_ENDPOINTS.DONORS}?limit=50`);
        setDonors(data.donors || []);
      } catch {
        setError("Could not load donors. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered list — derived from state + filter
  const filtered = bgFilter
    ? donors.filter((d) => d.bloodGroup === bgFilter)
    : donors;

  // CONDITIONAL RENDERING: loading
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
    );
  }

  // CONDITIONAL RENDERING: error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
        <p className="font-bold">⚠ {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          All Donors
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filtered.length} shown)
          </span>
        </h1>

        {/* Blood group filter — LISTS AND KEYS */}
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setBgFilter("")}
            className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
              !bgFilter ? "bg-blood text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setBgFilter(bg)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                bgFilter === bg ? "bg-blood text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* CONDITIONAL RENDERING: empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🩸</div>
          <p className="font-semibold text-gray-600">No donors found</p>
          <p className="text-sm mt-1">Try a different blood group filter.</p>
        </div>
      ) : (
        /* LISTS AND KEYS: each donor card */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((donor) => (
            <div
              key={donor._id}  /* key prop — MongoDB _id */
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blood transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-blood text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                {getInitials(donor.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{donor.name}</p>
                <p className="text-sm text-gray-400">📍 {donor.location}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-soft-red text-blood text-xs font-bold px-2 py-1 rounded-full">
                  {donor.bloodGroup}
                </span>
                {donor.eligible
                  ? <span className="text-xs text-green-600 font-semibold">✓ Eligible</span>
                  : <span className="text-xs text-orange-500">Not eligible</span>
                }
              </div>
              {/* ROUTE PARAMETER LINK: /donors/:id */}
              <Link
                to={`/donors/${donor._id}`}
                className="text-xs bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
