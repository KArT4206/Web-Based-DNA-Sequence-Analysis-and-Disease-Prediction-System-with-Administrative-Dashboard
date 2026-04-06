import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { auth, onAuthStateChanged, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          const userRole = snap.exists() ? snap.data().role : "user";
          setUser(u);
          setRole(userRole);
        } catch (err) {
          console.error("Error fetching role:", err);
          setUser(u);
          setRole("user");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🧬 Loading screen (sleek animation)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-slate-200">
        <div className="flex items-center space-x-2 animate-pulse">
          <span className="text-3xl">🧬</span>
          <h1 className="text-2xl font-semibold tracking-wide">
            Loading Genomic Platform...
          </h1>
        </div>
        <p className="mt-2 text-slate-400 text-sm">
          Verifying your account and role, please wait.
        </p>
      </div>
    );
  }

  // 🧭 Routing logic
  return (
    <Router>
      <Routes>
        {/* Unauthenticated users */}
        {!user && <Route path="/*" element={<AuthPage />} />}

        {/* Admin */}
        {user && role === "admin" && (
          <>
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/*" element={<Navigate to="/admin" replace />} />
          </>
        )}

        {/* Normal User */}
        {user && role === "user" && (
          <>
            <Route path="/user/*" element={<UserDashboard />} />
            <Route path="/*" element={<Navigate to="/user" replace />} />
          </>
        )}

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
