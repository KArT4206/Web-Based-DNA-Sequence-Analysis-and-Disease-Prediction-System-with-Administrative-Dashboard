import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ResultsPanel({
  summary = [],
  fileName = "(file)",
  variants = [],
  diseaseMatches = [],
  confidence = "Uncertain",
  gene = "Unknown",
  aiDiseaseProbability = 0,
  referenceSequence = "",
  sequence = "",
}) {
  const [activeView, setActiveView] = useState("variants");
  const [variantFilter, setVariantFilter] = useState("all");
  const matchedMotifs = useMemo(
    () =>
      summary
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 12),
    [summary]
  );
  const displayedMatches = useMemo(() => {
    if (variantFilter === "pathogenicLikely") {
      return diseaseMatches.filter((v) => {
        const s = (v.significance || "").toLowerCase();
        return s.includes("pathogenic");
      });
    }
    return diseaseMatches;
  }, [diseaseMatches, variantFilter]);

  const mutationSummary = useMemo(() => {
    const total = diseaseMatches.length;
    const pathogenic = diseaseMatches.filter(
      (v) =>
        (v.significance || "").toLowerCase().includes("pathogenic") &&
        !(v.significance || "").toLowerCase().includes("likely")
    ).length;
    const likely = diseaseMatches.filter((v) =>
      (v.significance || "").toLowerCase().includes("likely pathogenic")
    ).length;
    const benign = diseaseMatches.filter(
      (v) =>
        (v.aiLabel || "").toLowerCase() === "benign" ||
        (v.significance || "").toLowerCase().includes("benign")
    ).length;
    return { total, pathogenic, likely, benign };
  }, [diseaseMatches]);

  const mutationMapData = useMemo(() => {
    const ref = (referenceSequence || "").toUpperCase();
    if (!ref) return null;

    const posMap = new Map();
    displayedMatches.forEach((v) => {
      const existing = posMap.get(v.position);
      if (!existing) {
        posMap.set(v.position, v);
        return;
      }
      const score = (s = "") => {
        const sig = s.toLowerCase();
        if (sig.includes("pathogenic") && !sig.includes("likely")) return 3;
        if (sig.includes("likely pathogenic")) return 2;
        if (sig.includes("benign")) return 1;
        return 0;
      };
      if (score(v.significance) > score(existing.significance)) {
        posMap.set(v.position, v);
      }
    });

    const userFromRef = ref.split("");
    const markers = ref.split("").map(() => " ");
    const details = ref.split("").map(() => null);

    for (let i = 0; i < ref.length; i++) {
      const variant = posMap.get(i + 1);
      if (!variant) continue;
      markers[i] = "^";
      userFromRef[i] = variant.alt || "-";
      details[i] = variant;
    }

    return {
      refChars: ref.split(""),
      userChars: userFromRef,
      markerChars: markers,
      details,
      rawUser: (sequence || "").toUpperCase(),
    };
  }, [referenceSequence, displayedMatches, sequence]);

  const getSigClass = (variant) => {
    const sig = (variant?.significance || "").toLowerCase();
    const ai = (variant?.aiLabel || "").toLowerCase();
    if (sig.includes("pathogenic") && !sig.includes("likely")) {
      return "text-red-400";
    }
    if (sig.includes("likely pathogenic")) {
      return "text-orange-400";
    }
    if (sig.includes("benign") || ai === "benign") {
      return "text-emerald-400";
    }
    return "text-slate-300";
  };

  const getSigBadgeClass = (significance = "", aiLabel = "") => {
    const sig = (significance || "").toLowerCase();
    const ai = (aiLabel || "").toLowerCase();
    if (sig.includes("pathogenic") && !sig.includes("likely")) {
      return "bg-red-500/15 text-red-300 border border-red-400/40";
    }
    if (sig.includes("likely pathogenic")) {
      return "bg-amber-500/15 text-amber-300 border border-amber-400/40";
    }
    if (sig.includes("benign") || ai === "benign") {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40";
    }
    return "bg-slate-700/40 text-slate-300 border border-slate-600/50";
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/85 backdrop-blur-sm shadow-2xl border border-[#7C3AED]/20">
      <div className="relative mb-5">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#7C3AED]/20 via-[#22C55E]/10 to-transparent blur-xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">File</div>
            <div className="font-semibold text-[#A78BFA]">{fileName}</div>
            <div className="text-xs text-slate-400 mt-1">
              Gene: <span className="text-slate-200">{gene}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="rounded-2xl bg-slate-900/60 border border-[#7C3AED]/30 shadow-lg px-4 py-3 min-w-[120px]">
              <div className="text-[11px] text-slate-400">Tests</div>
              <div className="text-lg font-semibold text-[#A78BFA]">{summary.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/60 border border-[#7C3AED]/30 shadow-lg px-4 py-3 min-w-[120px]">
              <div className="text-[11px] text-slate-400">Confidence</div>
              <div className="text-lg font-semibold text-slate-100">{confidence}</div>
            </div>
            <div className="rounded-2xl bg-slate-900/60 border border-[#22C55E]/30 shadow-lg px-4 py-3 min-w-[120px]">
              <div className="text-[11px] text-slate-400">AI Risk %</div>
              <div className="text-lg font-semibold text-[#22C55E]">{aiDiseaseProbability}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveView("variants")}
          className={`px-4 py-2 rounded text-sm ${
            activeView === "variants"
              ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          Variant Results
        </button>
        <button
          onClick={() => setActiveView("motifs")}
          className={`px-4 py-2 rounded text-sm ${
            activeView === "motifs"
              ? "bg-[#22C55E] text-slate-900 shadow-lg shadow-[#22C55E]/30"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          Motif / Pattern Results
        </button>
      </div>

      {activeView === "variants" && (
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-slate-300 bg-slate-900/50 border border-slate-700 rounded-2xl px-3 py-2">
              Total mutations: {mutationSummary.total} | Pathogenic: {mutationSummary.pathogenic} | Likely: {mutationSummary.likely} | Benign: {mutationSummary.benign}
            </div>
            <select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="text-sm bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-slate-200"
            >
              <option value="all">Show All</option>
              <option value="pathogenicLikely">Pathogenic / Likely only</option>
            </select>
          </div>

          {displayedMatches.length > 0 && mutationMapData && (
            <div className="mb-3 bg-slate-900/50 border border-slate-700 rounded-2xl p-3 shadow-lg">
              <div className="text-xs text-slate-400 mb-2">
                Visual Mutation Map (all displayed mutations)
              </div>
              <div className="font-mono text-sm break-all">
                <span className="text-cyan-300 mr-2">Ref:</span>
                {mutationMapData.refChars.map((ch, idx) => {
                  const v = mutationMapData.details[idx];
                  return (
                    <span
                      key={`ref-${idx}`}
                      className={v ? getSigClass(v) : "text-cyan-300"}
                      title={
                        v
                          ? `Position ${v.position} | Mutation ${v.ref} -> ${v.alt} | Disease: ${v.disease}`
                          : undefined
                      }
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
              <div className="font-mono text-sm break-all mt-1">
                <span className="text-indigo-300 mr-2">User:</span>
                {mutationMapData.userChars.map((ch, idx) => {
                  const v = mutationMapData.details[idx];
                  return (
                    <span
                      key={`user-${idx}`}
                      className={v ? getSigClass(v) : "text-indigo-300"}
                      title={
                        v
                          ? `Position ${v.position} | Mutation ${v.ref} -> ${v.alt} | Disease: ${v.disease}`
                          : undefined
                      }
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
              <div className="font-mono text-sm break-all mt-1">
                <span className="text-slate-400 mr-2">Map:</span>
                {mutationMapData.markerChars.map((ch, idx) => {
                  const v = mutationMapData.details[idx];
                  return (
                    <span
                      key={`map-${idx}`}
                      className={v ? getSigClass(v) : "text-slate-500"}
                      title={
                        v
                          ? `Position ${v.position} | Mutation ${v.ref} -> ${v.alt} | Disease: ${v.disease} | Significance: ${v.significance}`
                          : undefined
                      }
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Hover highlighted positions to see mutation tooltips. Red =
                Pathogenic, Orange = Likely pathogenic, Green = Benign.
              </div>
            </div>
          )}

        <div className="rounded-2xl border border-slate-700 overflow-auto shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Mutation</th>
                <th className="px-3 py-2">Gene</th>
                <th className="px-3 py-2">Disease</th>
                <th className="px-3 py-2">Significance</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">AI Risk</th>
                <th className="px-3 py-2">Final Risk</th>
              </tr>
            </thead>
            <tbody>
              {displayedMatches.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={9}>
                    No variants detected against the selected reference sequence.
                  </td>
                </tr>
              ) : (
                displayedMatches.map((v, idx) => (
                  <tr
                    key={`${v.position}-${idx}`}
                    className="border-t border-slate-700 transition-all duration-200 hover:bg-[#7C3AED]/10 hover:shadow-md"
                  >
                    <td className="px-3 py-2">{v.position}</td>
                    <td className="px-3 py-2">
                      {v.ref} -&gt; {v.alt}
                    </td>
                    <td className="px-3 py-2">{v.gene}</td>
                    <td className="px-3 py-2">{v.disease}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${getSigBadgeClass(v.significance, v.aiLabel)}`}>
                        {v.significance}
                      </span>
                    </td>
                    <td className="px-3 py-2">{v.confidence}</td>
                    <td className="px-3 py-2">
                      {v.aiRisk || "Unavailable"}
                      {typeof v.aiProbability === "number" ? ` (${(v.aiProbability * 100).toFixed(1)}%)` : ""}
                    </td>
                    <td className="px-3 py-2 font-semibold text-rose-300">
                      {typeof v.finalRiskScore === "number" ? `${v.finalRiskScore}%` : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {activeView === "motifs" && (
        <div className="rounded-2xl border border-slate-700 p-4 bg-slate-900/50 shadow-xl">
          {matchedMotifs.length === 0 ? (
            <div className="text-slate-400 text-sm">
              No motif/pattern matches found for this sequence.
            </div>
          ) : (
            <>
              <div className="text-sm text-[#22C55E] mb-3">
                Showing matched motifs only ({matchedMotifs.length})
              </div>
              <div className="h-72 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchedMotifs} margin={{ top: 8, right: 8, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5e1"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={80}
                    />
                    <YAxis stroke="#cbd5e1" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedMotifs.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 hover:border-[#22C55E] transition-all duration-200"
                  >
                    <div className="text-[#A78BFA] font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.count} matches found</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-slate-300 bg-slate-900/40 border border-slate-700 rounded-2xl p-3">
        Variants detected: {variants.length}. This report shows disease
        association confidence and AI-assisted similarity insight, not a
        clinical diagnosis.
      </div>
    </div>
  );
}
