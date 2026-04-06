import re


def is_valid_dna(seq: str) -> bool:
    """Validate DNA sequence contains only A/T/G/C."""
    return bool(re.fullmatch(r"[ACGTacgt]+", seq))


def get_gc_content(sequence: str) -> float:
    """Return GC percentage for a sequence."""
    sequence = sequence.upper()
    gc = sequence.count("G") + sequence.count("C")
    length = len(sequence)
    return round((gc / length) * 100, 2) if length else 0


def mutation_check(sequence: str, pattern: str) -> int:
    """Count an exact pattern in the sequence."""
    return sequence.upper().count(pattern.upper())


def nucleotide_count(sequence: str) -> dict:
    """Return counts of A/T/G/C bases."""
    sequence = sequence.upper()
    return {
        "A": sequence.count("A"),
        "T": sequence.count("T"),
        "G": sequence.count("G"),
        "C": sequence.count("C"),
    }


def pattern_association(sequence: str) -> list:
    """
    Educational pattern checks.
    Not for clinical/medical diagnostic use.
    """
    sequence = sequence.upper()
    findings = []

    if re.search(r"(CAG){3,}", sequence):
        findings.append(
            "CAG repeat pattern detected (associated with Huntington's in real genomics)"
        )

    if "GTG" in sequence:
        findings.append(
            "GTG codon detected (sickle-cell related mutation pattern)"
        )

    if "TATC" in sequence:
        findings.append("TATC insertion pattern detected")

    return findings


def sequence_similarity(seq1: str, seq2: str) -> float:
    """Simple position-wise similarity for shared length."""
    l = min(len(seq1), len(seq2))
    matches = sum(a == b for a, b in zip(seq1[:l], seq2[:l]))
    return round((matches / l) * 100, 2) if l else 0


def main() -> None:
    print("---- DNA Sequence Analyzer (CLI) ----")

    seq1 = input("Enter DNA Sequence 1: ").strip()
    seq2 = input("Enter DNA Sequence 2 (optional): ").strip()

    if not is_valid_dna(seq1):
        print("Invalid DNA Sequence 1")
        return

    if seq2 and not is_valid_dna(seq2):
        print("Invalid DNA Sequence 2")
        return

    print(f"\nGC Content (Seq1): {get_gc_content(seq1)}%")
    if seq2:
        print(f"GC Content (Seq2): {get_gc_content(seq2)}%")

    print("\nNucleotide Count (Seq1):")
    counts = nucleotide_count(seq1)
    for base, count in counts.items():
        print(f"{base}: {count}")

    pattern = input("\nEnter mutation pattern to search: ").strip()
    print(f"Pattern count in Seq1: {mutation_check(seq1, pattern)}")

    if seq2:
        print(f"\nSequence Similarity: {sequence_similarity(seq1, seq2)}%")

    results = pattern_association(seq1)
    if results:
        print("\n--- Pattern Associations Found ---")
        for r in results:
            print("-", r)
    else:
        print("\nNo known mutation patterns found.")


if __name__ == "__main__":
    main()
