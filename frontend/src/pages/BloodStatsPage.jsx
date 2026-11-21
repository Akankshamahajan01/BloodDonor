/**
 * BloodStatsPage
 * ─────────────────────────────────────────────────────────
 * Lecture 50-51 — useEffect(), Side Effects, API Calls, Dependency Array
 * Lecture 49   — Conditional Rendering, Lists and Keys
 * Lecture 56   — Tailwind CSS Basics, Responsive Layouts
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPTS DEMONSTRATED:
 *
 * 1. useEffect — FOUR different patterns shown:
 *
 *    a) [] empty dependency array
 *       → runs ONCE on mount (like componentDidMount)
 *       → fetches donor stats from backend API on page load
 *
 *    b) [searchTerm] dependency array with a value
 *       → re-runs whenever searchTerm state changes
 *       → used for live search with debounce
 *
 *    c) no dependency array
 *       → runs after EVERY render (shown in a counter)
 *
 *    d) cleanup function
 *       → returned from useEffect
 *       → clears the debounce timer when component unmounts
 *         or before next effect run
 *
 * 2. SIDE EFFECTS
 *    - API calls (fetch data from backend)
 *    - Setting document title
 *    - Timers (debounce)
 *    - Event listeners
 *
 * 3. CONDITIONAL RENDERING (Lecture 49)
 *    - Loading skeleton shown while fetching
 *    - Error state shown if fetch fails
 *    - Empty state shown if no results
 *
 * 4. LISTS AND KEYS (Lecture 49)
 *    - Blood group breakdown list with key prop
 *    - Donor search results with key prop
 */

import { useState, useEffect, useRef } from "react";
import api, { API_ENDPOINTS } from "../services/api";

// ─────────────────────────────────────────────────────────
// Sub-component: LoadingSkeleton
// CONDITIONAL RENDERING: shown while data loads
// ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-component: StatBadge
// Props: label, value, color
// ─────────────────────────────────────────────────────────
function StatBadge({ label, value, color = "bg-blood" }) {
  return (
    <div className={`${color} text-white rounded-2xl p-5 text-center`}>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-component: BloodGroupRow
// Lists and Keys: rendered inside a .map()
// Props: group, count, total (for % bar)
// ─────────────────────────────────────────────────────────
function BloodGroupRow({ group, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="w-10 h-10 rounded-full bg-soft-red text-blood font-black text-sm flex items-center justify-center flex-shrink-0">
        {group}
      </span>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-gray-700">Blood Group {group}</span>
          <span className="text-gray-400">{count} donors ({pct}%)</span>
        </div>
        {/* Tailwind width trick — inline style for dynamic width */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blood rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BloodStatsPage() {
  // ── useState: API data ───────────────────────────────────
  const [stats,  setStats]  = useState(null);
  const [donors, setDonors] = useState([]);

  // ── useState: loading + error states ────────────────────
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError,   setStatsError]   = useState(null);
  const [donorLoading, setDonorLoading] = useState(false);

  // ── useState: live search ────────────────────────────────
  const [searchTerm,    setSearchTerm]    = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ── useState: render counter (shows useEffect with no deps) ─
  const [renderCount, setRenderCount] = useState(0);

  // Ref to track renders without causing infinite loop
  const renderRef = useRef(0);

  // ═══════════════════════════════════════════════════════
  // useEffect #1 — EMPTY DEPENDENCY ARRAY []
  // Runs ONCE when component mounts
  // Side effect: fetch stats from backend API
  // Sets document.title as a side effect too
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    document.title = "Blood Stats | BloodConnect"; // side effect: title

    async function fetchStats() {
      try {
        const { data } = await api.get(API_ENDPOINTS.DONOR_STATS);
        setStats(data);
      } catch (err) {
        setStatsError("Could not load stats. Backend might be offline.");
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();

    // cleanup: reset title when component unmounts
    return () => {
      document.title = "BloodConnect";
    };
  }, []); // ← empty array = run only once on mount

  // ═══════════════════════════════════════════════════════
  // useEffect #2 — DEPENDENCY ARRAY [searchTerm]
  // Re-runs every time searchTerm state changes
  // Side effect: debounced API search call
  // Cleanup: clears debounce timer before next run
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setDonorLoading(true);

    // Set a debounce timer — wait 400ms after user stops typing
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `${API_ENDPOINTS.DONORS}?limit=10`
        );
        // Filter locally by search term (location or name)
        const filtered = (data.donors || []).filter(
          (d) =>
            d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setDonorLoading(false);
      }
    }, 400);

    // ── CLEANUP FUNCTION ──────────────────────────────────
    // Returned from useEffect — React calls this:
    //   • before running the effect again (when searchTerm changes)
    //   • when the component unmounts
    // This clears the timer so we don't fire stale API calls
    return () => {
      clearTimeout(timer);
      setDonorLoading(false);
    };
  }, [searchTerm]); // ← re-run whenever searchTerm changes

  // ═══════════════════════════════════════════════════════
  // useEffect #3 — NO DEPENDENCY ARRAY
  // Runs after EVERY render
  // Side effect: track render count
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    renderRef.current += 1;
    setRenderCount(renderRef.current);
  }); // ← no array = runs after every render

  // Build blood group breakdown for the list
  const bloodGroupBreakdown = stats?.bloodGroupBreakdown || [];
  const totalDonors = stats?.total || 0;

  /* ── JSX ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-blood text-sm font-bold tracking-widest uppercase mb-2">
            LIVE DATA
          </p>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
            Blood Donor Statistics
          </h1>
          <p className="text-gray-500">
            Real-time donor data fetched using{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded text-blood text-sm">
              useEffect
            </code>{" "}
            with different dependency array patterns.
          </p>
        </div>

        {/* useEffect pattern legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon:  "1️⃣",
              title: "useEffect(fn, [])",
              desc:  "Runs once on mount. Fetches stats from backend API.",
              color: "border-blood",
            },
            {
              icon:  "2️⃣",
              title: "useEffect(fn, [dep])",
              desc:  "Re-runs when searchTerm changes. Debounced donor search.",
              color: "border-blue-400",
            },
            {
              icon:  "3️⃣",
              title: "useEffect(fn)",
              desc:  "Runs after every render. Tracks render count.",
              color: "border-green-400",
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`bg-white rounded-2xl p-5 border-l-4 ${card.color} shadow-sm`}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <code className="text-sm font-bold text-gray-700 block mb-1">
                {card.title}
              </code>
              <p className="text-xs text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Render counter — shows useEffect #3 */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
          <span className="text-green-600 font-bold text-sm">
            🔄 Render count (useEffect with no deps):
          </span>
          <span className="bg-green-600 text-white text-sm font-black rounded-full w-7 h-7 flex items-center justify-center">
            {renderCount}
          </span>
          <span className="text-green-500 text-xs">(increments on every state change)</span>
        </div>

        {/* ── STATS SECTION — useEffect #1 result ── */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Platform Overview{" "}
            <span className="text-sm font-normal text-gray-400">(fetched on mount)</span>
          </h2>

          {/* CONDITIONAL RENDERING: loading → error → data */}
          {statsLoading ? (
            <LoadingSkeleton />
          ) : statsError ? (
            /* CONDITIONAL RENDERING: error state */
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600">
              <p className="font-semibold">⚠ {statsError}</p>
              <p className="text-sm mt-1 text-red-400">
                Start the backend server and refresh.
              </p>
            </div>
          ) : (
            /* CONDITIONAL RENDERING: success — show stats */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBadge label="Total Donors"    value={stats?.total    ?? 0} color="bg-blood" />
              <StatBadge label="Eligible Now"    value={stats?.eligible ?? 0} color="bg-green-600" />
              <StatBadge label="Cities Covered"  value={stats?.cities   ?? 0} color="bg-blue-600" />
              <StatBadge label="Blood Groups"    value={8}                    color="bg-purple-600" />
            </div>
          )}
        </section>

        {/* ── BLOOD GROUP BREAKDOWN — Lists and Keys ── */}
        {!statsLoading && !statsError && bloodGroupBreakdown.length > 0 && (
          <section className="bg-white rounded-2xl shadow-md p-6 mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Donors by Blood Group
            </h2>
            <div>
              {/* LISTS AND KEYS: map over bloodGroupBreakdown array */}
              {bloodGroupBreakdown.map((item) => (
                <BloodGroupRow
                  key={item._id}        /* key prop required! */
                  group={item._id}
                  count={item.count}
                  total={totalDonors}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── LIVE SEARCH — useEffect #2 ── */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Live Donor Search
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            useEffect re-runs on every keystroke (with 400ms debounce + cleanup).
          </p>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a name or city…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blood transition-colors mb-4"
          />

          {/* CONDITIONAL RENDERING: loading / empty / results */}
          {donorLoading && (
            <p className="text-sm text-gray-400 animate-pulse">Searching…</p>
          )}

          {/* CONDITIONAL RENDERING: && */}
          {!donorLoading && searchTerm.length >= 2 && searchResults.length === 0 && (
            <p className="text-sm text-gray-400">No donors found for "{searchTerm}".</p>
          )}

          {/* LISTS AND KEYS: render search results */}
          {searchResults.length > 0 && (
            <ul className="space-y-2">
              {searchResults.map((donor) => (
                /* key must be unique — use MongoDB _id */
                <li
                  key={donor._id}
                  className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 hover:bg-soft-red transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blood text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {donor.name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {donor.name}
                    </p>
                    <p className="text-xs text-gray-400">📍 {donor.location}</p>
                  </div>
                  <span className="bg-soft-red text-blood text-xs font-bold px-3 py-1 rounded-full">
                    {donor.bloodGroup}
                  </span>
                  {/* CONDITIONAL RENDERING: eligible badge */}
                  {donor.eligible ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      ✓ Eligible
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold">
                      Not eligible
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}
