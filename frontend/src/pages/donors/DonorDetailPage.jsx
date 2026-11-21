/**
 * DonorDetailPage — /donors/:id
 * ─────────────────────────────────────────────────────────
 * Lecture 53 — Route Parameters (useParams hook)
 * Lecture 50-51 — useEffect with dependency [id]
 * Lecture 49 — Conditional Rendering
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPT: Route Parameters
 *   The URL /donors/:id means ":id" is a dynamic segment.
 *   useParams() extracts it: const { id } = useParams()
 *
 *   This page fetches one specific donor using that id.
 *
 * CONCEPT: useEffect with [id] dependency
 *   If the user navigates from /donors/abc → /donors/xyz,
 *   the component stays mounted but id changes.
 *   useEffect re-runs because id is in the dependency array.
 *
 * Also shows:
 *   - Nested route: this page is rendered inside DonorsLayout
 *   - Link to /donors/:id/history (deeper nested route)
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { API_ENDPOINTS } from "../../services/api";

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function DonorDetailPage() {
  // ── useParams: extract :id from the URL ─────────────────
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor,   setDonor]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ═══════════════════════════════════════════════════════
  // useEffect with [id] dependency
  // Re-runs whenever the :id route parameter changes
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    setLoading(true);
    setError(null);
    setDonor(null);

    async function fetchDonor() {
      try {
        const { data } = await api.get(`${API_ENDPOINTS.DONORS}/${id}`);
        setDonor(data.donor);
        // Side effect: update document title with donor's name
        document.title = `${data.donor?.name ?? "Donor"} | BloodConnect`;
      } catch (err) {
        const status = err?.response?.status;
        setError(status === 404 ? "Donor not found." : "Failed to load donor data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDonor();

    return () => { document.title = "BloodConnect"; }; // cleanup
  }, [id]); // ← re-fetch when id changes

  // CONDITIONAL RENDERING: loading
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="h-16 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // CONDITIONAL RENDERING: error
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-bold text-gray-700 mb-2">{error}</p>
        <p className="text-sm text-gray-400 mb-6">
          Route parameter used:{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-blood">/donors/{id}</code>
        </p>
        <button
          onClick={() => navigate("/donors")}
          className="bg-blood text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-blood-dark transition-colors"
        >
          ← Back to All Donors
        </button>
      </div>
    );
  }

  // CONDITIONAL RENDERING: success — show donor detail
  return (
    <div>
      {/* Back button */}
      <Link
        to="/donors"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blood mb-6 transition-colors"
      >
        ← All Donors
      </Link>

      {/* Route parameter display — for learning */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-6 text-sm">
        <span className="font-semibold text-blue-700">Route parameter:</span>{" "}
        <code className="text-blue-600">/donors/<strong>{id}</strong></code>
        {" "}← extracted with{" "}
        <code className="bg-blue-100 px-1 rounded text-blue-700">useParams()</code>
      </div>

      {/* Donor profile card */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blood text-white text-2xl font-black flex items-center justify-center">
            {donor?.name?.charAt(0) ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{donor?.name}</h1>
            <p className="text-gray-400">📍 {donor?.location}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="bg-soft-red text-blood font-black text-xl px-4 py-2 rounded-xl">
              {donor?.bloodGroup}
            </span>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Age",           value: donor?.age ? `${donor.age} years` : "N/A" },
            { label: "Phone",         value: donor?.phone ?? "N/A" },
            { label: "Email",         value: donor?.email ?? "N/A" },
            { label: "Last Donation", value: formatDate(donor?.lastDonationDate) },
            { label: "Eligibility",   value: donor?.eligible ? "✅ Eligible" : `❌ Not eligible (${donor?.daysRemaining ?? "?"} days)` },
            { label: "Member Since",  value: formatDate(donor?.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="text-sm font-bold text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <a
          href={`tel:${donor?.phone}`}
          className="flex-1 bg-blood text-white text-center py-3 rounded-xl font-bold hover:bg-blood-dark transition-colors"
        >
          📞 Contact Donor
        </a>
        {/* NESTED ROUTE LINK: /donors/:id/history */}
        <Link
          to={`/donors/${id}/history`}
          className="flex-1 border-2 border-gray-200 text-gray-700 text-center py-3 rounded-xl font-bold hover:border-blood hover:text-blood transition-colors"
        >
          📋 Donation History
        </Link>
      </div>
    </div>
  );
}
