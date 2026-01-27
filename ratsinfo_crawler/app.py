import pandas as pd
from flask import Flask, request, render_template, jsonify
import Ratsinfo as ri

# Configuration: Number of applications to load per batch
APPLICATIONS_BATCH_SIZE = 20

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
        date_from (optional) - start date in YYYY-MM-DD format
        date_to (optional) - end date in YYYY-MM-DD format
    Response: [ {month: "2024-01", count: 5}, {month: "2024-02", count: 8}, ... ]
    """
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to
    
    # Delegate aggregation to analysis module
    monthly_trend = ri.compute_monthly_trend("data.csv", [word] if word else [], typ_filter=typ_filter, date_filter=date_filter)
    
    # Convert to list of dicts
    result = monthly_trend.to_dict(orient="records")
    return jsonify(result)

# Route to return aggregated fraktionen (submitter/faction) counts
@app.route("/fraktionen", methods=["GET"])
def fraktionen():
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None

    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to

    agg = ri.compute_fraktionen("data.csv", [word] if word else [], typ_filter=typ_filter, date_filter=date_filter)
    return jsonify(agg.to_dict(orient="records"))


# Route to return share of keyword-related proposals per faction
@app.route("/fraktionen_share", methods=["GET"])
def fraktionen_share():
    word = request.args.get("word", type=str)
    typ_param = request.args.get("typ", type=str, default="")
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    
    if not word:
        return jsonify([])
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None

    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to

    agg_share = ri.compute_fraktionen_share("data.csv", [word], typ_filter=typ_filter, date_filter=date_filter)
    return jsonify(agg_share.to_dict(orient="records"))


# Route to return monthly trend share data
@app.route("/trend_share", methods=["GET"])
def trend_share():
    """
    Returns monthly share (percentage) of proposals that mention the given keyword.
    
    Query params:
        word (required) - the search keyword
        typ (optional) - comma-separated list of Typ values to filter by
        date_from (optional) - start date in YYYY-MM-DD format
        date_to (optional) - end date in YYYY-MM-DD format
    
    Response: [ {month: "2024-01", share: 0.15, count: 5, total: 33}, ... ]
    """
    word = request.args.get("word", type=str)
    typ_param = request.args.get("typ", type=str, default="")
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    
    if not word:
        return jsonify([])
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to
    
    trend_share_data = ri.compute_monthly_trend_share("data.csv", [word], typ_filter=typ_filter, date_filter=date_filter)
    return jsonify(trend_share_data.to_dict(orient="records"))


# Route to return processing metrics
@app.route("/metrics", methods=["GET"])
def metrics():
    """
    Returns processing time metrics for a given keyword.
    Query params: 
        word (optional) - if empty, shows metrics for all proposals
        typ (optional) - comma-separated list of Typ values to filter by
        date_from (optional) - start date in YYYY-MM-DD format
        date_to (optional) - end date in YYYY-MM-DD format
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
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to
    
    metrics_data = ri.compute_processing_metrics("data.csv", [word] if word else [], typ_filter=typ_filter, date_filter=date_filter)
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


# Route to return available themes from THEME_MAP
@app.route("/api/themes", methods=["GET"])
def get_themes():
    """
    Returns all available themes from the THEME_MAP.
    Response: {
        "themes": ["Wohnen", "Mobilitaet", "Bildung", "Umwelt", ...]
    }
    """
    themes = list(ri.THEME_MAP.keys())
    return jsonify({"themes": themes})


# Route to return expanded search terms
@app.route("/expanded-search-terms", methods=["GET"])
def expanded_search_terms():
    """
    Returns the expanded search terms for a given keyword.
    Shows what search terms are actually used when theme expansion is applied.
    
    Query params:
        word (optional) - the search keyword to expand
    
    Response: { "original": [...], "expanded": [...] }
    """
    word = request.args.get("word", type=str, default="")
    
    # Get expanded terms (with theme expansion enabled)
    result = ri.get_expanded_search_terms([word] if word else [], expand_with_themes=True)
    
    return jsonify(result)


# Route to return filtered applications/proposals
@app.route("/get_applications", methods=["GET"])
def get_applications():
    """
    Returns all applications (proposals) matching the given filters.
    
    Query params:
        word (optional) - search keyword
        typ (optional) - comma-separated list of Typ values to filter by
        date_from (optional) - start date in YYYY-MM-DD format
        date_to (optional) - end date in YYYY-MM-DD format
        offset (optional) - number of records to skip (default: 0)
        limit (optional) - maximum number of records to return (default: 20)
    
    Response: {"data": [...], "total": X, "offset": Y, "limit": Z}
    """
    word = request.args.get("word", type=str, default="")
    typ_param = request.args.get("typ", type=str, default="")
    date_from = request.args.get("date_from", type=str, default="")
    date_to = request.args.get("date_to", type=str, default="")
    offset = request.args.get("offset", type=int, default=0)
    limit = request.args.get("limit", type=int, default=APPLICATIONS_BATCH_SIZE)
    
    # Parse comma-separated typ values
    typ_filter = [t.strip() for t in typ_param.split(",") if t.strip()] if typ_param else None
    
    # Create date filter dict
    date_filter = None
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["from"] = date_from
        if date_to:
            date_filter["to"] = date_to
    
    # Get filtered applications
    applications = ri.get_filtered_applications("data.csv", [word] if word else [], typ_filter=typ_filter, date_filter=date_filter)
    
    total = len(applications)
    
    # Apply pagination
    paginated_applications = applications.iloc[offset:offset + limit]
    
    # Convert NaN to None for JSON serialization
    paginated_applications = paginated_applications.where(pd.notnull(paginated_applications), None)
    
    return jsonify({
        "data": paginated_applications.to_dict(orient="records"),
        "total": total,
        "offset": offset,
        "limit": limit
    })


@app.route("/rechtliches", methods=["GET"])
def legal():
    return render_template("legal.html")


# Route for methodology/transparency page
@app.route("/methodik", methods=["GET"])
def methodik():
    return render_template("methodology.html")


if __name__ == "__main__":
    app.run(debug=True)