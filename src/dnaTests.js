// src/dnaTests.js
// 30+ pattern tests used by the UI

export const tests = [
  // 🔹 Promoter & Regulatory Regions
  { name: "TATA Box", category: "Promoter", pattern: /TATA[AT]A[AT]/gi },
  { name: "CAAT Box", category: "Promoter", pattern: /CAAT/gi },
  { name: "GC Box", category: "Promoter", pattern: /GGGCGG/gi },
  { name: "BRE (TFIIB Recognition Element)", category: "Promoter", pattern: /SSRCGCC/i },
  { name: "Inr (Initiator Element)", category: "Promoter", pattern: /YYANWYY/i },
  { name: "CpG Island", category: "Epigenetic", pattern: /CG/gi },
  { name: "Enhancer-like", category: "Regulatory", pattern: /GGG[ACGT]{4}CCC/gi },
  { name: "Silencer Element", category: "Regulatory", pattern: /TTTGC[AT]A/gi },
  { name: "Hormone Response Element (HRE)", category: "Regulatory", pattern: /AGAACAnnnTGTTCT/gi },
  { name: "NF-κB Binding Site", category: "Regulatory", pattern: /GGGRNNYYCC/gi },
  { name: "CRE (cAMP Response Element)", category: "Regulatory", pattern: /TGACGTCA/gi },
  { name: "Sp1 Binding Site", category: "Regulatory", pattern: /GGGCGG/gi },

  // 🔹 Splicing Elements
  { name: "Splice Donor Site", category: "Splicing", pattern: /GT/gi },
  { name: "Splice Acceptor Site", category: "Splicing", pattern: /AG/gi },
  { name: "Branch Point (A)", category: "Splicing", pattern: /TACTAAC/gi },
  { name: "Polypyrimidine Tract", category: "Splicing", pattern: /CT{3,}/gi },

  // 🔹 Transcription Termination & Poly-A
  { name: "Poly-A Tail", category: "Transcript", pattern: /A{10,}/gi },
  { name: "Poly-T Tail", category: "Transcript", pattern: /T{10,}/gi },
  { name: "Transcription Terminator (TTTTT)", category: "Transcript", pattern: /T{5,}/gi },
  { name: "Polyadenylation Signal (AATAAA)", category: "Transcript", pattern: /AATAAA/gi },

  // 🔹 Translation Elements
  { name: "Kozak Sequence", category: "Translation", pattern: /GCC[AG]CCATGG/gi },
  { name: "Start Codon (ATG)", category: "Coding", pattern: /ATG/gi },
  { name: "Stop Codon (TAA)", category: "Coding", pattern: /TAA/gi },
  { name: "Stop Codon (TAG)", category: "Coding", pattern: /TAG/gi },
  { name: "Stop Codon (TGA)", category: "Coding", pattern: /TGA/gi },
  { name: "Shine-Dalgarno Sequence", category: "Prokaryotic Translation", pattern: /AGGAGG/gi },

  // 🔹 Repeats & Microsatellites
  { name: "Microsatellite (CA)n", category: "Repeat", pattern: /(CA){5,}/gi },
  { name: "Microsatellite (AT)n", category: "Repeat", pattern: /(AT){5,}/gi },
  { name: "Microsatellite (GATA)n", category: "Repeat", pattern: /(GATA){3,}/gi },
  { name: "Simple AT-run", category: "Repeat", pattern: /A{6,}/gi },
  { name: "Simple GC-run", category: "Repeat", pattern: /G{6,}/gi },
  { name: "Dinucleotide Repeat (GT)n", category: "Repeat", pattern: /(GT){5,}/gi },
  { name: "Trinucleotide Repeat (CAG)n", category: "Repeat", pattern: /(CAG){3,}/gi },
  { name: "Trinucleotide Repeat (CGG)n", category: "Repeat", pattern: /(CGG){3,}/gi },
  { name: "Tetranucleotide Repeat (GATA)n", category: "Repeat", pattern: /(GATA){3,}/gi },

  // 🔹 Structural DNA Features
  { name: "Telomere Repeat", category: "Structural", pattern: /(TTAGGG){2,}/gi },
  { name: "Centromeric Alpha", category: "Structural", pattern: /(AATAT){2,}/gi },
  { name: "Z-DNA Prone Sequence (CG Repeats)", category: "Structure", pattern: /(CG){5,}/gi },
  { name: "Palindrome (4bp)", category: "Structure", pattern: /([ACGT])([ACGT])\2\1/gi },
  { name: "Cruciform Potential", category: "Structure", pattern: /([ACGT]{4,6})N{0,3}\1R/gi },

  // 🔹 Recombination & Mutation Hotspots
  { name: "Recombination Hotspot (CCNCC)", category: "Recombination", pattern: /CC[ACGT]CC/gi },
  { name: "Chi Site (E. coli)", category: "Recombination", pattern: /GCTGGTGG/gi },
  { name: "DNA Fragile Site", category: "Recombination", pattern: /AT-rich.{5,10}AT-rich/gi },

  // 🔹 Protein Coding & Motifs
  { name: "Zinc Finger Motif", category: "Protein", pattern: /C.{2,4}C.{12}H.{3,5}H/gi },
  { name: "Homeobox Motif", category: "Protein", pattern: /TAAT/gi },
  { name: "Leucine Zipper (LZ)", category: "Protein", pattern: /(L.{6}){3,}/gi },
  { name: "Helix-Turn-Helix", category: "Protein", pattern: /[AG]T[AG][AG]C[AG]/gi },
  { name: "Signal Peptide-like (15-20bp)", category: "Protein", pattern: /[ACGT]{15,20}/gi },
  { name: "ATP Binding Motif (Walker A)", category: "Protein", pattern: /GXXXXGKS/gi },
  { name: "ATP Binding Motif (Walker B)", category: "Protein", pattern: /hhhhDE/gi },

  // 🔹 Composition & GC/A-T Rich Regions
  { name: "High GC Region", category: "Composition", pattern: /G{3,}C{3,}/gi },
  { name: "Low GC Region", category: "Composition", pattern: /A{3,}T{3,}/gi },
  { name: "CpG Cluster", category: "Composition", pattern: /(CG){4,}/gi },
  { name: "AT-Rich Island", category: "Composition", pattern: /A{5,}T{5,}/gi },

  // 🔹 Small RNA and Noncoding
  { name: "miRNA Seed (6bp)", category: "Regulatory RNA", pattern: /[ACGT]{6}/gi },
  { name: "tRNA Anticodon Loop (TΨC)", category: "RNA", pattern: /TTC/gi },
  { name: "rRNA Promoter Region", category: "RNA", pattern: /TTGACA.{15,17}TATAAT/gi },

  // 🔹 Restriction Enzyme Recognition Sites
  { name: "EcoRI Site", category: "Restriction", pattern: /GAATTC/gi },
  { name: "BamHI Site", category: "Restriction", pattern: /GGATCC/gi },
  { name: "HindIII Site", category: "Restriction", pattern: /AAGCTT/gi },
  { name: "NotI Site", category: "Restriction", pattern: /GCGGCCGC/gi },
  { name: "PstI Site", category: "Restriction", pattern: /CTGCAG/gi },
  { name: "XhoI Site", category: "Restriction", pattern: /CTCGAG/gi },
  { name: "KpnI Site", category: "Restriction", pattern: /GGTACC/gi },
  { name: "NdeI Site", category: "Restriction", pattern: /CATATG/gi },

  // 🔹 Miscellaneous
  { name: "Triplex DNA Motif", category: "Structure", pattern: /([AG]){3,}N{0,3}([CT]){3,}/gi },
  { name: "Hairpin Structure", category: "Structure", pattern: /([ACGT]{3,5})N{3,7}\1R/gi },
  { name: "DNA Replication Origin (DUE)", category: "Replication", pattern: /ATTTTAAT/gi },
  { name: "Replication Fork Barrier", category: "Replication", pattern: /GTTTTAGGGT/gi },
  {name: "Potential Hairpin Loop", category: "Secondary Structure", pattern: /([ACGT]{3,6})[ACGT]{0,10}\1/gi}
];

// runAllTests(sequence) -> returns an object: { testName: [matches] }
export function runAllTests(sequence) {
  const seq = (sequence || "").toUpperCase().replace(/\s+/g, "");
  const out = {};
  for (const t of tests) {
    out[t.name] = [];
    try {
      const re = new RegExp(t.pattern.source, t.pattern.flags);
      let m;
      while ((m = re.exec(seq)) !== null) {
        // push matched text + index for context
        out[t.name].push(`${m[0]}@${m.index}`);
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    } catch (err) {
      console.warn("Pattern error", t.name, err);
    }
  }
  return out;
}
export default { tests, runAllTests };
