import pandas as pd
from flask import Flask, request, render_template, jsonify
import Ratsinfo as ri
import re

app = Flask(__name__)

def get_data(word: str):
    rows_with_words, total_word_count = ri.find_words_frequency("data.csv", [word])
    return rows_with_words.to_dict(orient="records")

def extract_fraktion(text):
    """Versucht, die Fraktion(en) aus dem Text zu extrahieren"""
    if not text:
        return []
    
    fraktionen = []
    
    # Pattern 1: "Fraktion [Name] des Stadtrates"
    matches = re.findall(r'Fraktion\s+([A-Za-z\-/\s\(\)]+?)(?:\s+des Stadtrates|[\n:])', str(text))
    fraktionen.extend([m.strip() for m in matches])
    
    # Pattern 2: "[Name]-Fraktion im Stadtrat" (z.B. "CSU-FW-Fraktion")
    matches = re.findall(r'([A-Za-z\-/]+?)\s*-\s*(?:Fraktion|Fraktion im Stadtrat)', str(text))
    fraktionen.extend([m.strip() for m in matches])
    
    # Pattern 3: Aus Email-Adresse extrahieren (z.B. csu-fw-fraktion@muenchen.de)
    matches = re.findall(r'([a-z\-]+)-fraktion@', str(text).lower())
    if matches:
        fraktionen.extend([m.replace('-', ' ').title() for m in matches if m not in fraktionen])
    
    # Duplikate entfernen und bereinigen
    fraktionen = list(set(f for f in fraktionen if f and len(f) > 3))
    
    return fraktionen

# Route to render HTML page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# Route to return JSON data
@app.route("/get_dataframe", methods=["GET"])
def get_dataframe():
    word = request.args.get("word", type=str)
    if not word:
        return jsonify([])  # always return JSON

    rows_with_words, total_word_count = ri.find_words_frequency("data.csv", [word])
    rows_with_words = rows_with_words.where(pd.notnull(rows_with_words), None)
    print(len(rows_with_words))
    return jsonify(rows_with_words.to_dict(orient="records"))

# Route to return monthly trend data for D3 visualization
@app.route("/trend", methods=["GET"])
def trend():
    """
    Returns monthly aggregated count for a given keyword.
    Query params: word (required)
    Response: [ {month: "2024-01", count: 5}, {month: "2024-02", count: 8}, ... ]
    """
    word = request.args.get("word", type=str)
    if not word:
        return jsonify([])
    
    # Delegate aggregation to analysis module
    monthly_trend = ri.compute_monthly_trend("data.csv", [word])
    
    # Convert to list of dicts
    result = monthly_trend.to_dict(orient="records")
    return jsonify(result)

# Route to return aggregated fraktionen (submitter/faction) counts
@app.route("/fraktionen", methods=["GET"])
def fraktionen():
    word = request.args.get("word", type=str)
    if not word:
        return jsonify([])

    agg = ri.compute_fraktionen("data.csv", [word])
    return jsonify(agg.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)