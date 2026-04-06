// src/components/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  auth,
  db,
  signOut,
  collection,
  addDoc,
  serverTimestamp,
  onAuthStateChanged,
} from "../firebase";
import { onSnapshot, query, orderBy, where } from "firebase/firestore";
import ResultsPanel from "./ResultsPanel";
import { tests, runAllTests } from "../dnaTests";
import {
  buildVariantReport,
  normalizeDNA,
  referenceLibrary,
} from "../variantPipeline";

export default function UserDashboard() {
  const [sequence, setSequence] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState("results");
  const [user, setUser] = useState(null);
  const [localResult, setLocalResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedGene, setSelectedGene] = useState(referenceLibrary[0].gene);
  const [referenceSequence, setReferenceSequence] = useState(
    referenceLibrary[0].sequence
  );
  const [aiStatus, setAiStatus] = useState("idle");

  const getDbRiskWeight = (significance = "") => {
    const s = significance.toLowerCase();
    if (s.includes("pathogenic")) return s.includes("likely") ? 0.75 : 0.9;
    if (s.includes("benign")) return 0.2;
    if (s.includes("uncertain")) return 0.45;
    return 0.35;
  };

  const validateFASTA = (fasta) => {
    const lines = fasta.split("\n");
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith(">")) continue;
      if (line === "") continue;
      if (!/^[ATGC]+$/i.test(line)) return false;
    }
    return true;
  };

  const extractSequence = (fasta) => {
    const lines = fasta.split("\n");
    return lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith(">"))
      .join("")
      .toUpperCase();
  };

  // 🔥 Auth listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  // 🔥 Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "results"),
      where("user", "==", user.email),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResults(data);
    });
    return () => unsub();
  }, [user]);

  // ⚡ Parse FASTA file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();

    if (!validateFASTA(text)) {
      alert("Invalid FASTA file. Sequence lines must contain only A, T, G, C.");
      return;
    }

    const parsedSequence = extractSequence(text);
    if (!parsedSequence) {
      alert("No DNA sequence found in file.");
      return;
    }

    setSequence(parsedSequence);
    setTab("analyze");
  };

  // ⚡ Analyze DNA instantly
  const handleAnalyze = async () => {
    const cleanedUser = normalizeDNA(sequence);
    const cleanedRef = normalizeDNA(referenceSequence);
    if (!cleanedUser) return alert("Please enter or upload a DNA sequence!");
    if (!cleanedRef) return alert("Please provide a reference sequence.");
    if (!cleanedUser.match(/^[ATGC]+$/i) || !cleanedRef.match(/^[ATGC]+$/i)) {
      return alert("Only A, T, G, C are allowed in user and reference sequence.");
    }

    setAnalyzing(true);
    setAiStatus("running");

    try {
      const analysis = runAllTests(cleanedUser);
      const summary = Object.keys(analysis).map((key) => ({
        name: key,
        count: analysis[key].length,
      }));
      const report = buildVariantReport({
        userSequence: cleanedUser,
        gene: selectedGene,
        referenceSequence: cleanedRef,
      });
      if (report.error) {
        throw new Error(report.error);
      }
      const { variants, diseaseMatches, confidence, aiDiseaseProbability } = report;
      const aiEnrichedMatches = await Promise.all(
        diseaseMatches.map(async (v) => {
          if (v.disease === "No association") {
            return {
              ...v,
              aiRisk: "Low",
              aiLabel: "Benign",
              aiProbability: 0,
            };
          }

          try {
            const res = await fetch("http://127.0.0.1:5000/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gene: selectedGene,
                position: v.position,
                ref: v.ref,
                alt: v.alt,
              }),
            });
            if (!res.ok) throw new Error("AI API unavailable");
            const ai = await res.json();
            return { ...v, aiRisk: ai.riskLevel, aiLabel: ai.riskLabel, aiProbability: ai.probability };
          } catch (error) {
            return { ...v, aiRisk: "Unavailable", aiLabel: "Unknown", aiProbability: null };
          }
        })
      );

      const enrichedWithFinalRisk = aiEnrichedMatches.map((v) => {
        const dbWeight = getDbRiskWeight(v.significance);
        const aiProb =
          typeof v.aiProbability === "number" ? v.aiProbability : dbWeight;
        const finalRiskScore = Math.round(((dbWeight + aiProb) / 2) * 100);
        return { ...v, finalRiskScore };
      });

      const diseaseAssociationCount = enrichedWithFinalRisk.filter(
        (v) => v.confidence === "High"
      ).length;
      const inputName = fileName || "Direct Input Sequence";

      // Save to Firestore
      await addDoc(collection(db, "results"), {
        user: user.email,
        fileName: inputName,
        sequence: cleanedUser,
        referenceSequence: cleanedRef,
        gene: selectedGene,
        variants,
        diseaseMatches: enrichedWithFinalRisk,
        confidence,
        aiDiseaseProbability,
        diseaseAssociationCount,
        summary,
        createdAt: serverTimestamp(),
      });

      // Show instantly
      setLocalResult({
        fileName: inputName,
        sequence: cleanedUser,
        referenceSequence: cleanedRef,
        gene: selectedGene,
        variants,
        diseaseMatches: enrichedWithFinalRisk,
        confidence,
        aiDiseaseProbability,
        diseaseAssociationCount,
        summary,
      });

      setSequence("");
      setFileName("");
      setTab("results");
      setAiStatus("done");
    } catch (err) {
      console.error(err);
      alert("Error analyzing sequence");
      setAiStatus("failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-slate-800/80 shadow-lg bg-slate-900/70 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/10 via-transparent to-[#22C55E]/10 pointer-events-none" />
        <h1 className="relative text-xl font-semibold text-[#A78BFA]">🧬 Genomic Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTab("results")}
            className={`px-3 py-1 rounded transition-all ${
              tab === "results"
                ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            My Results
          </button>
          <button
            onClick={() => setTab("analyze")}
            className={`px-3 py-1 rounded transition-all ${
              tab === "analyze"
                ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            Analyze DNA
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-xl text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 p-6 md:p-8">
        {/* Results Tab */}
        {tab === "results" && (
          <div className="space-y-6">
            {localResult && (
              <ResultsPanel
                key="local"
                fileName={localResult.fileName}
                summary={localResult.summary}
                variants={localResult.variants}
                diseaseMatches={localResult.diseaseMatches}
                confidence={localResult.confidence}
                aiDiseaseProbability={localResult.aiDiseaseProbability}
                gene={localResult.gene}
                referenceSequence={localResult.referenceSequence}
                sequence={localResult.sequence}
              />
            )}
            {results.length === 0 && !localResult ? (
              <div className="text-center text-slate-400 py-20 text-lg rounded-2xl border border-slate-800 bg-slate-900/40">
                No results yet — analyze a DNA sequence 🧬
              </div>
            ) : (
              results.map((r) => (
                <ResultsPanel
                  key={r.id}
                  fileName={r.fileName}
                  summary={r.summary}
                  variants={r.variants}
                  diseaseMatches={r.diseaseMatches}
                  confidence={r.confidence}
                  aiDiseaseProbability={r.aiDiseaseProbability}
                  gene={r.gene}
                  referenceSequence={r.referenceSequence}
                  sequence={r.sequence}
                />
              ))
            )}
          </div>
        )}

        {/* Analyze Tab */}
        {tab === "analyze" && (
          <div className="relative bg-slate-900/80 p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto mt-10 border border-[#7C3AED]/25 backdrop-blur-sm">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#7C3AED]/15 to-[#22C55E]/10 blur-xl pointer-events-none" />
            <h2 className="relative text-lg font-semibold mb-4 text-[#A78BFA]">
              🧫 Paste DNA Sequence or Upload FASTA File
            </h2>
            <p className="relative text-xs text-slate-400 mb-4">
              This pipeline detects sequence variants versus a reference and
              reports known disease associations from a curated mini database
              (educational use only, not medical diagnosis).
            </p>

            <input
              type="file"
              accept=".fasta,.fa,.txt"
              onChange={handleFileUpload}
              className="relative block w-full text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-2xl p-2 mb-3 cursor-pointer transition hover:border-[#7C3AED]"
            />

            <label className="block text-sm text-slate-300 mb-1">Gene</label>
            <select
              value={selectedGene}
              onChange={(e) => {
                const nextGene = e.target.value;
                setSelectedGene(nextGene);
                const ref = referenceLibrary.find((r) => r.gene === nextGene);
                if (ref) setReferenceSequence(ref.sequence);
              }}
              className="block w-full text-sm text-slate-200 bg-slate-800 border border-slate-700 rounded-2xl p-2 mb-3 transition focus:border-[#7C3AED]"
            >
              {referenceLibrary.map((r) => (
                <option key={r.gene} value={r.gene}>
                  {r.gene}
                </option>
              ))}
            </select>

            <label className="block text-sm text-slate-300 mb-1">
              Reference Sequence (healthy baseline)
            </label>
            <textarea
              rows={3}
              value={referenceSequence}
              onChange={(e) => setReferenceSequence(e.target.value.toUpperCase())}
              placeholder="Enter reference DNA sequence..."
              className="block w-full text-sm text-slate-200 bg-slate-800 border border-slate-700 rounded-2xl p-3 mb-4 focus:ring-2 focus:ring-[#7C3AED] outline-none resize-none"
            />

            <textarea
              rows={6}
              value={sequence}
              onChange={(e) => setSequence(e.target.value.toUpperCase())}
              placeholder="Enter your DNA sequence here (A, T, G, C)..."
              className="block w-full text-sm text-slate-200 bg-slate-800 border border-slate-700 rounded-2xl p-3 mb-4 focus:ring-2 focus:ring-[#7C3AED] outline-none resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`w-full py-2 rounded-md font-medium transition-all ${
                analyzing
                  ? "bg-[#7C3AED]/60 cursor-wait"
                  : "bg-[#7C3AED] hover:bg-[#6D28D9]"
              }`}
            >
              {analyzing ? "Analyzing..." : "Run DNA Analysis"}
            </button>

            {analyzing && (
              <div className="mt-4 text-center text-sm text-[#A78BFA] animate-pulse">
                Running variant detection + {tests.length} genomic tests ⚡
              </div>
            )}
            {aiStatus === "running" && (
              <div className="mt-2 text-center text-xs text-emerald-300">
                AI risk model is evaluating each variant...
              </div>
            )}
          </div>
        )}{/* 🖨️ Print Button */}
<div className="flex justify-end mt-6">
  <button
    onClick={() => window.print()}
    className="bg-[#22C55E] hover:bg-[#16A34A] text-slate-900 px-4 py-2 rounded-2xl shadow-lg transition"
  >
    🖨️ Print My Report
  </button>
</div>

      </div>
    
    </div>
  );
}
// src/components/UserDashboard.jsx
// src/components/UserDashboard.jsx