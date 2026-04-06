import json
from pathlib import Path

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "dna_model.pkl"
ENCODERS_PATH = BASE_DIR / "encoders.json"

app = Flask(__name__)
CORS(app)


def load_model_bundle():
    if not MODEL_PATH.exists() or not ENCODERS_PATH.exists():
        raise FileNotFoundError("Model/encoders missing. Run: python backend/train_model.py")
    model = joblib.load(MODEL_PATH)
    encoders = json.loads(ENCODERS_PATH.read_text(encoding="utf-8"))
    return model, encoders


MODEL, ENCODERS = load_model_bundle()
BASE_MAP = ENCODERS["base_map"]
GENE_MAP = ENCODERS["gene_map"]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True) or {}

    gene = str(data.get("gene", "")).upper()
    position = int(data.get("position", 0))
    ref = str(data.get("ref", "-")).upper()
    alt = str(data.get("alt", "-")).upper()

    gene_id = GENE_MAP.get(gene, 0)
    ref_encoded = BASE_MAP.get(ref, 0)
    alt_encoded = BASE_MAP.get(alt, 0)

    pred = int(MODEL.predict([[gene_id, position, ref_encoded, alt_encoded]])[0])
    proba = 0.5
    if hasattr(MODEL, "predict_proba"):
        proba = float(MODEL.predict_proba([[gene_id, position, ref_encoded, alt_encoded]])[0][1])

    return jsonify(
        {
            "riskLabel": "Harmful" if pred == 1 else "Benign",
            "riskLevel": "High" if pred == 1 else "Low",
            "probability": round(proba, 4),
            "label": pred,
        }
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
