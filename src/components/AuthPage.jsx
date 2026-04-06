import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Auto-redirect after login based on Firestore role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        const role = snap.exists() ? snap.data().role : "user";

        if (role === "admin") navigate("/admin");
        else navigate("/user");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create Firestore record for the user
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role: "user",
      });
      setMessage("✅ Account created! You can now sign in.");
      setMode("signin");
    } catch (err) {
      setMessage(err.message || "Signup failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection handled in onAuthStateChanged
    } catch (err) {
      setMessage(err.message || "Sign in failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📩 Password reset email sent.");
    } catch (err) {
      setMessage(err.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="bg-slate-900 p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={mode === "signin" ? handleSignin : handleSignup}>
          <input
            type="email"
            className="w-full mb-3 p-2 rounded bg-slate-800 border border-slate-700"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full mb-3 p-2 rounded bg-slate-800 border border-slate-700"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={processing}
            className="w-full py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            {processing
              ? "Processing..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {mode === "signin" && (
          <button
            onClick={handleReset}
            className="w-full text-sm text-indigo-400 mt-3 hover:underline"
          >
            Forgot Password?
          </button>
        )}

        <p className="text-center mt-4 text-sm text-slate-400">
          {mode === "signin" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-indigo-400 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-indigo-400 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>

        {message && (
          <p className="text-center mt-3 text-sm text-amber-300">{message}</p>
        )}
      </div>
    </div>
  );
}
// src/components/AuthPage.jsx