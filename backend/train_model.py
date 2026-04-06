import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "dna_model.pkl"
ENCODERS_PATH = BASE_DIR / "encoders.json"

# Default dataset path provided by user; fallback to a local copy.
DEFAULT_DATASET = Path(r"C:\Users\rabin\Downloads\gene_mutation_data.csv")
LOCAL_DATASET = BASE_DIR / "gene_mutation_data.csv"


def load_dataset() -> pd.DataFrame:
    if DEFAULT_DATASET.exists():
        return pd.read_csv(DEFAULT_DATASET)
    if LOCAL_DATASET.exists():
        return pd.read_csv(LOCAL_DATASET)
    raise FileNotFoundError("Dataset not found. Place gene_mutation_data.csv in backend/ or Downloads.")


def main() -> None:
    df = load_dataset()
    required_cols = {"gene", "position", "ref", "alt", "label"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset must contain columns: {required_cols}")

    mapping = {"A": 1, "T": 2, "G": 3, "C": 4, "-": 0}
    genes = sorted(df["gene"].astype(str).unique().tolist())
    gene_map = {gene: idx + 1 for idx, gene in enumerate(genes)}

    frame = df.copy()
    frame["gene_id"] = frame["gene"].map(gene_map)
    frame["position"] = frame["position"].astype(int)
    frame["ref"] = frame["ref"].astype(str).str.upper().map(mapping).fillna(0).astype(int)
    frame["alt"] = frame["alt"].astype(str).str.upper().map(mapping).fillna(0).astype(int)
    frame["label"] = frame["label"].astype(int)

    X = frame[["gene_id", "position", "ref", "alt"]]
    y = frame["label"]

    model = DecisionTreeClassifier(max_depth=6, random_state=42)
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    ENCODERS_PATH.write_text(
      json.dumps({"base_map": mapping, "gene_map": gene_map}, indent=2),
      encoding="utf-8"
    )

    print(f"Model trained and saved to: {MODEL_PATH}")
    print(f"Encoders saved to: {ENCODERS_PATH}")
    print(f"Rows used: {len(frame)}")


if __name__ == "__main__":
    main()
