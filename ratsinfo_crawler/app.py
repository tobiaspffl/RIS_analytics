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


# Route to return processing metrics
@app.route("/metrics", methods=["GET"])
def metrics():
    """
    Returns processing time metrics for a given keyword.
    Query params: word (required)
    Response: {
        avgDays: float | null,
        openCount: int,
        closedCount: int,
        totalCount: int,
        byReferat: [{referat: str, avgDays: float, count: int}, ...]
    }
    """
    word = request.args.get("word", type=str)
    if not word:
        return jsonify({
            "avgDays": None,
            "openCount": 0,
            "closedCount": 0,
            "totalCount": 0,
            "byReferat": []
        })
    
    metrics_data = ri.compute_processing_metrics("data.csv", [word])
    return jsonify(metrics_data)


if __name__ == "__main__":
    app.run(debug=True)