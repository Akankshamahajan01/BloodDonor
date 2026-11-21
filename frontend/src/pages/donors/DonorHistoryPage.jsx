/**
 * DonorHistoryPage — /donors/:id/history
 * ─────────────────────────────────────────────────────────
 * Lecture 53 — Nested Routes (useParams with multiple segments)
 * Lecture 49 — Lists and Keys, Conditional Rendering
 * ─────────────────────────────────────────────────────────
 *
 * CONCEPT: Deeply Nested Route
 *   Path: /donors/:id/history
 *   Both :id parameter AND the /history segment are part of the URL.
 *   useParams() gives { id } — same hook, deeper nesting.
 *
 *   Route config in App.jsx:
 *     <Route path="donors" element={<DonorsLayout />}>
 *       <Route index         element={<DonorsIndexPage />} />
 *       <Route path=":id"    element={<DonorDetailPage />} />
 *       <Route path=":id/history" element={<DonorHistoryPage />} />
 *     </Route>
 */

import { useParams, Link } from "react-router-dom";

// Simulated donation history (since backend doesn't track history yet)
function generateHistory(id) {
  const records = [];
  const today = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (i + 1) * 60);
    records.push({
      id:       `${id}-hist-${i}`,
      date:     d.toISOString(),
      location: ["AIIMS Delhi", "Fortis Chandigarh", "Apollo Mumbai", "Max Bangalore"][i],
      units:    1,
      status:   i === 0 ? "Completed" : "Completed",
    });
  }
  return records;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function DonorHistoryPage() {
  // useParams — extracts :id from /donors/:id/history
  const { id } = useParams();

  const history = generateHistory(id);

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/donors"      className="hover:text-blood transition-colors">All Donors</Link>
        <span>/</span>
        <Link to={`/donors/${id}`} className="hover:text-blood transition-colors">
          Donor Detail
        </Link>
        <span>/</span>
        <span className="text-blood font-semibold">History</span>
      </div>

      {/* Nested route explanation */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-6 text-sm">
        <span className="font-semibold text-purple-700">Nested route:</span>{" "}
        <code className="text-purple-600">/donors/<strong>{id}</strong>/history</code>
        {" "}← both segments in one URL, useParams gives{" "}
        <code className="bg-purple-100 px-1 rounded text-purple-700">{"{ id }"}</code>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Donation History</h1>

      {/* LISTS AND KEYS: map over history array */}
      <div className="space-y-4">
        {history.map((record, index) => (
          <div
            key={record.id}  /* key prop — unique per item */
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-blood text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                #{index + 1}
              </div>
              {/* CONDITIONAL RENDERING: line only between items */}
              {index < history.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-200" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">🏥 {record.location}</p>
              <p className="text-sm text-gray-400 mt-0.5">{formatDate(record.date)}</p>
            </div>
            <div className="text-right">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                {record.status}
              </span>
              <p className="text-xs text-gray-400 mt-1">{record.units} unit</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-soft-red rounded-2xl text-center">
        <p className="text-sm text-blood font-semibold mb-1">
          56-day cooldown between donations
        </p>
        <p className="text-xs text-gray-500">
          Donor can donate again approximately every 2 months.
        </p>
      </div>
    </div>
  );
}
