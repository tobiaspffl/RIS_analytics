import pandas as pd
from flask import Flask, request, render_template, jsonify
import Ratsinfo as ri

app = Flask(__name__)

# Register dynamic keywords blueprint 
try:
    from keyword_routes import keyword_bp
    app.register_blueprint(keyword_bp)
except ImportError:
    print("Warning: keyword_routes module not found. Dynamic keywords feature disabled.")

def get_data(word: str):
    rows_with_words, total_word_count = ri.find_words_frequency("data.csv", [word])
    return rows_with_words.to_dict(orient="records")

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
    Query params: 
        word (optional) - if empty, shows all proposals
        typ (optional) - comma-separated list of Typ values to filter by
    Response: [ {month: "2024-01", count: 5}, {month: "2024-02", count: 8}, ... ]
    """
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    # Delegate aggregation to analysis module
    monthly_trend = ri.compute_monthly_trend("data.csv", [word] if word else [], typ_filter=typ_filter)
    
    # Convert to list of dicts
    result = monthly_trend.to_dict(orient="records")
    return jsonify(result)

# Route to return aggregated fraktionen (submitter/faction) counts
@app.route("/fraktionen", methods=["GET"])
def fraktionen():
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None

    agg = ri.compute_fraktionen("data.csv", [word] if word else [], typ_filter=typ_filter)
    return jsonify(agg.to_dict(orient="records"))


# Route to return share of keyword-related proposals per faction
@app.route("/fraktionen_share", methods=["GET"])
def fraktionen_share():
    word = request.args.get("word", type=str)
    typ_param = request.args.get("typ", type=str, default="")
    
    if not word:
        return jsonify([])
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None

    agg_share = ri.compute_fraktionen_share("data.csv", [word], typ_filter=typ_filter)
    return jsonify(agg_share.to_dict(orient="records"))


# Route to return processing metrics
@app.route("/metrics", methods=["GET"])
def metrics():
    """
    Returns processing time metrics for a given keyword.
    Query params: 
        word (optional) - if empty, shows metrics for all proposals
        typ (optional) - comma-separated list of Typ values to filter by
    Response: {
        avgDays: float | null,
        openCount: int,
        closedCount: int,
        totalCount: int,
        byReferat: [{referat: str, avgDays: float, count: int}, ...]
    }
    """
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    metrics_data = ri.compute_processing_metrics("data.csv", [word] if word else [], typ_filter=typ_filter)
    return jsonify(metrics_data)


# Route to return the date range of all proposals
@app.route("/date-range", methods=["GET"])
def date_range():
    """
    Returns the earliest and latest proposal dates in the dataset.
    Response: {
        minDate: "YYYY-MM-DD" | null,
        maxDate: "YYYY-MM-DD" | null
    }
    """
    date_range_data = ri.compute_date_range("data.csv")
    return jsonify(date_range_data)


# Route to return available Typ values
@app.route("/available-typen", methods=["GET"])
def available_typen():
    """
    Returns all unique Typ values present in the dataset.
    Response: ["Antrag", "Anfrage", "Dringlichkeitsantrag", ...]
    """
    typen = ri.get_available_typen("data.csv")
    return jsonify(typen)


# Route for legal information (Impressum, Datenschutz, Haftung)
@app.route("/rechtliches", methods=["GET"])
def legal():
    return render_template("legal.html")


if __name__ == "__main__":
    app.run(debug=True)