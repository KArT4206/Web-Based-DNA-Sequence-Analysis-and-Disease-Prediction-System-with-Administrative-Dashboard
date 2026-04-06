// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  auth,
  db,
  signOut,
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "../firebase";

export default function AdminDashboard() {
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all uploaded results
  const fetchResults = async () => {
    setLoading(true);
    const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setResults(data);
    setLoading(false);
  };

  // ✅ Fetch all users
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setUsers(data);
  };

  // ✅ Match user email to name (or fallback)
  const getUserName = (email) => {
    const user = users.find((u) => u.email === email);
    return user ? user.email : email || "Unknown";
  };

  // ✅ Delete a result
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    await deleteDoc(doc(db, "results", id));
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  useEffect(() => {
    fetchResults();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-slate-900 px-6 py-4 border-b border-slate-800 shadow-md">
        <h1 className="text-xl font-semibold text-indigo-300">🧬 Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTab("results")}
            className={`px-3 py-1 rounded ${
              tab === "results"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            View Results
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-3 py-1 rounded ${
              tab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* 🧫 Results Tab */}
        {tab === "results" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-indigo-300">
                🧫 Uploaded Results
              </h2>
              <button
                onClick={fetchResults}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-200 flex items-center gap-1"
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center text-slate-400">Loading results...</div>
            ) : results.length === 0 ? (
              <div className="text-center text-slate-500">No results found.</div>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-800 text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="border border-slate-800 px-3 py-2">User</th>
                    <th className="border border-slate-800 px-3 py-2">File</th>
                    <th className="border border-slate-800 px-3 py-2">Gene</th>
                    <th className="border border-slate-800 px-3 py-2">Variants</th>
                    <th className="border border-slate-800 px-3 py-2">Confidence</th>
                    <th className="border border-slate-800 px-3 py-2">Uploaded</th>
                    <th className="border border-slate-800 px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="border border-slate-800 px-3 py-2">
                        {getUserName(r.user)}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {r.fileName || "Untitled"}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {r.gene || "—"}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {Array.isArray(r.variants) ? r.variants.length : 0}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {r.confidence || "Uncertain"}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {r.createdAt?.toDate
                          ? r.createdAt.toDate().toLocaleString()
                          : "—"}
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* 🖨️ Print Admin Logs */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-md"
              >
                🖨️ Print {tab === "results" ? "Results Log" : "User Log"}
              </button>
            </div>

          </div>
        )}

        {/* 👥 Users Tab */}
        {tab === "users" && (
          <div>
            <h2 className="text-lg font-semibold text-indigo-300 mb-4">
              👥 Manage Users
            </h2>
            {users.length === 0 ? (
              <div className="text-center text-slate-400">No users found.</div>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-800 text-sm">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="border border-slate-800 px-3 py-2">Email</th>
                    <th className="border border-slate-800 px-3 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40">
                      <td className="border border-slate-800 px-3 py-2">
                        {u.email}
                      </td>
                      <td className="border border-slate-800 px-3 py-2 capitalize">
                        {u.role || "user"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* 🖨️ Print Admin Logs */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-md"
              >
                🖨️ Print {tab === "results" ? "Results Log" : "User Log"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
// src/components/AdminDashboard.jsx
// src/components/AdminDashboard.jsx