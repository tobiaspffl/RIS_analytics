import pandas as pd
from flask import Flask, request, render_template, jsonify
import Ratsinfo as ri

app = Flask(__name__)

def get_data(word: str):
    rows_with_words, total_word_count = ri.find_words_frequency("data.csv", word)
    return rows_with_words.to_dict(orient="records")

# Route to render HTML page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# Route to return JSON data
@app.route("/get_dataframe", methods=["GET"])
def get_dataframe():
    words = [request.args.get("word", type=str)]
    if not words:
        return jsonify([])  # always return JSON

    rows_with_words, total_word_count = ri.find_words_frequency("data.csv", words)
    rows_with_words = rows_with_words.where(pd.notnull(rows_with_words), None)
    print(len(rows_with_words))
    return jsonify(rows_with_words.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True)