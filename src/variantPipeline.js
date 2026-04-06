// ================= CLEAN SEQUENCE =================
const cleanSeq = (s = "") => s.toUpperCase().replace(/\s+/g, "");

// ================= REFERENCE LIBRARY =================
export const referenceLibrary = [
  { gene: "HBB", sequence: "ATGGAGTCT" },
  { gene: "CFTR", sequence: "ATCTTTGGTGTT" },
  { gene: "BRCA1", sequence: "ATGGATTTAT" },
  { gene: "PAH", sequence: "ATGCGTAC" },
  { gene: "HEXA", sequence: "ATTTGC" },
  { gene: "DMD", sequence: "ATGGCT" },
  { gene: "F8", sequence: "ATGTTTGG" },
  { gene: "HTT", sequence: "ATGGCG" },
];

// ================= VARIANT DATABASE =================
export const variantDB = [
  // HBB (Sickle Cell, Thalassemia)
  { gene: "HBB", position: 5, ref: "A", alt: "T", disease: "Sickle Cell Disease", significance: "Pathogenic" },
  { gene: "HBB", position: 3, ref: "G", alt: "A", disease: "Beta Thalassemia", significance: "Pathogenic" },
  { gene: "HBB", position: 6, ref: "T", alt: "C", disease: "HBB Variant", significance: "Likely pathogenic" },
  // CFTR (Cystic Fibrosis)
  { gene: "CFTR", position: 4, ref: "T", alt: "C", disease: "Cystic Fibrosis", significance: "Pathogenic" },
  { gene: "CFTR", position: 5, ref: "T", alt: "G", disease: "CFTR Variant", significance: "Likely pathogenic" },
  { gene: "CFTR", position: 6, ref: "G", alt: "A", disease: "CFTR Mutation", significance: "Uncertain" },
  { gene: "CFTR", position: 7, ref: "G", alt: "T", disease: "CFTR Mutation", significance: "Uncertain" },
  { gene: "CFTR", position: 8, ref: "T", alt: "C", disease: "CFTR Variant", significance: "Likely pathogenic" },
  // BRCA1 (Breast Cancer)
  { gene: "BRCA1", position: 10, ref: "A", alt: "G", disease: "Breast Cancer Risk", significance: "Pathogenic" },
  { gene: "BRCA1", position: 8, ref: "T", alt: "C", disease: "BRCA1 Variant", significance: "Likely pathogenic" },
  // PAH (Phenylketonuria)
  { gene: "PAH", position: 5, ref: "G", alt: "A", disease: "Phenylketonuria", significance: "Pathogenic" },
  { gene: "PAH", position: 6, ref: "T", alt: "C", disease: "PAH Variant", significance: "Likely pathogenic" },
  // HEXA (Tay-Sachs)
  { gene: "HEXA", position: 3, ref: "T", alt: "C", disease: "Tay-Sachs Disease", significance: "Pathogenic" },
  { gene: "HEXA", position: 5, ref: "A", alt: "G", disease: "HEXA Variant", significance: "Likely pathogenic" },
  // DMD (Muscular Dystrophy)
  { gene: "DMD", position: 4, ref: "G", alt: "A", disease: "Duchenne Muscular Dystrophy", significance: "Pathogenic" },
  // F8 (Hemophilia A)
  { gene: "F8", position: 6, ref: "T", alt: "G", disease: "Hemophilia A", significance: "Pathogenic" },
  // HTT (Huntington's Disease)
  { gene: "HTT", position: 3, ref: "G", alt: "A", disease: "Huntington's Disease", significance: "Pathogenic" },
];

// ================= ALIGNMENT (IMPORTANT FIX) =================
function findBestAlignment(userSeq, refSeq) {
  if (!userSeq || !refSeq) return 0;
  if (userSeq.length <= refSeq.length) return 0;

  let bestIndex = 0;
  let minMismatch = Infinity;

  for (let i = 0; i <= userSeq.length - refSeq.length; i++) {
    let mismatch = 0;
    for (let j = 0; j < refSeq.length; j++) {
      if (userSeq[i + j] !== refSeq[j]) mismatch++;
    }
    if (mismatch < minMismatch) {
      minMismatch = mismatch;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// ================= VARIANT DETECTION =================
export function findVariants(userSeq, refSeq, gene = "Unknown") {
  const user = cleanSeq(userSeq);
  const ref = cleanSeq(refSeq);
  const start = findBestAlignment(user, ref);
  const variants = [];

  for (let i = 0; i < ref.length; i++) {
    const refBase = ref[i];
    const userBase = user[start + i];
    const safeRef = refBase || "-";
    const safeAlt = userBase || "-";
    if (safeRef === safeAlt) continue;

    let type = "substitution";
    if (userBase === undefined) type = "deletion";
    if (refBase === undefined) type = "insertion";

    variants.push({
      gene,
      type,
      position: i + 1,
      ref: safeRef,
      alt: safeAlt,
      change: `${safeRef} -> ${safeAlt}`,
    });
  }

  return variants;
}

// ================= AI-BASED SIMILARITY HELPERS =================
function baseSimilarity(a, b) {
  if (a === b) return 1;
  if (a === "-" || b === "-") return 0.25;
  return 0;
}

function scoreSimilarity(variant, dbv) {
  const posScore = Math.max(0, 1 - Math.abs(variant.position - dbv.position) / 3);
  const refScore = baseSimilarity(variant.ref, dbv.ref);
  const altScore = baseSimilarity(variant.alt, dbv.alt);
  return Number((0.5 * posScore + 0.25 * refScore + 0.25 * altScore).toFixed(2));
}

// ================= MATCHING =================
function matchVariant(variant) {
  return variantDB.find(
    (dbv) =>
      dbv.gene === variant.gene &&
      dbv.position === variant.position &&
      dbv.ref === variant.ref &&
      dbv.alt === variant.alt
  );
}

function aiClosestMatch(variant) {
  const sameGene = variantDB.filter((dbv) => dbv.gene === variant.gene);
  const scored = sameGene
    .filter((dbv) => Math.abs(dbv.position - variant.position) <= 2)
    .map((dbv) => ({ dbv, score: scoreSimilarity(variant, dbv) }))
    .sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

// ================= ANNOTATION =================
export function annotateVariants(variants) {
  return variants.map((variant) => {
    const exact = matchVariant(variant);
    if (exact) {
      return {
        ...variant,
        confidence: "High",
        disease: exact.disease,
        significance: exact.significance,
        aiNote: "Exact pathogenic database match",
        aiScore: 1,
      };
    }

    const close = aiClosestMatch(variant);
    if (close && close.score >= 0.5) {
      const baseSig = close.dbv.significance || "Likely pathogenic";
      return {
        ...variant,
        confidence: "Medium",
        disease: `Likely similar to ${close.dbv.disease}`,
        significance: `${baseSig} (AI-similar)`,
        aiNote: "AI similarity matching suggests nearby known variant",
        aiScore: close.score,
      };
    }

    return {
      ...variant,
      confidence: "Low",
      disease: "No association",
      significance: "Unknown",
      aiNote: "No close database variant found",
      aiScore: 0,
    };
  });
}

// ================= OVERALL CONFIDENCE =================
export function getOverallConfidence(results) {
  if (results.some((r) => r.confidence === "High")) return "High";
  if (results.some((r) => r.confidence === "Medium")) return "Medium";
  return "Low";
}

// ================= LIGHTWEIGHT AI RISK MODEL =================
function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

function computeAiDiseaseProbability(annotated) {
  const high = annotated.filter((v) => v.confidence === "High").length;
  const medium = annotated.filter((v) => v.confidence === "Medium").length;
  const low = annotated.filter((v) => v.confidence === "Low").length;
  const signal = high * 1.4 + medium * 0.8 - low * 0.1;
  return Number((logistic(signal) * 100).toFixed(1));
}

// ================= MAIN FUNCTION =================
export function buildVariantReport({ userSequence, gene, referenceSequence }) {
  const refObj = referenceLibrary.find((r) => r.gene === gene);
  const ref = cleanSeq(referenceSequence || refObj?.sequence || "");
  if (!ref) return { error: "Reference gene not found" };

  const variants = findVariants(userSequence, ref, gene);
  const diseaseMatches = annotateVariants(variants);
  const filteredDiseaseMatches = diseaseMatches.filter(
    (r) => r.disease !== "No association"
  );
  const confidence = getOverallConfidence(filteredDiseaseMatches);
  const aiDiseaseProbability = computeAiDiseaseProbability(filteredDiseaseMatches);

  return {
    gene,
    reference: ref,
    variants,
    diseaseMatches: filteredDiseaseMatches,
    confidence,
    aiDiseaseProbability,
  };
}

export function normalizeDNA(input = "") {
  return cleanSeq(input);
}
