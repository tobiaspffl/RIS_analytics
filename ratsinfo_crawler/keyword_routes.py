"""
Blueprint for dynamic keyword routes.
Can be deleted entirely if dynamic keywords are no longer needed.
"""

# Backend default for top keywords when client doesn't specify count
TOP_KEYWORD_DEFAULT = 6

from flask import Blueprint, request, jsonify
from functools import lru_cache
from keyword_extractor import extract_keywords_tfidf

keyword_bp = Blueprint('keywords', __name__, url_prefix='/api')

# Cache the top keywords to avoid recalculating on every request
@lru_cache(maxsize=1)
def get_top_keywords(top_n: int = TOP_KEYWORD_DEFAULT):
    """Get top keywords from dataset (cached)"""
    return tuple(extract_keywords_tfidf("data.csv", top_n=top_n))


@keyword_bp.route('/top-keywords', methods=['GET'])
def top_keywords():
    """
    Returns top keywords extracted from dataset for dynamic button generation.
    Query params: 
        count (optional): Number of keywords to return (default: 5)
    Response: {
        keywords: ["keyword1", "keyword2", ...]
    }
    """
    count = request.args.get("count", TOP_KEYWORD_DEFAULT, type=int)
    keywords = list(get_top_keywords(top_n=count))
    return jsonify({"keywords": keywords})
