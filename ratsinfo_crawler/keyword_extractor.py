"""
Keyword extraction module for dynamic example button generation.
Can be deleted if dynamic keywords are no longer needed.
"""

import pandas as pd
import re
from collections import Counter


def extract_keywords_tfidf(file: str, top_n: int = 10) -> list[str]:
    """
    Extract top keywords from document content using TF-IDF approach.
    
    - Reads CSV and combines all document content
    - Removes common German stop words and short words
    - Returns top N most frequent keywords
    
    Args:
        file: Path to CSV file
        top_n: Number of keywords to return (default: 10)
    
    Returns:
        List of top keywords as strings
    """
    try:
        df = pd.read_csv(file)
        
        # German stop words
        stop_words = {
            'der', 'die', 'das', 'und', 'in', 'zu', 'den', 'von', 'für', 'mit',
            'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein',
            'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat',
            'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind',
            'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben',
            'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man',
            'sein', 'wurde', 'sei', 'in', 'prozent', 'jahr', 'jahren', 'müssen',
            # project-specific exclusions to avoid generic/structural terms in suggestions
            'münchen', 'stadtrat', 'fraktion', 'rathaus', "muenchen", "oberbürgermeister", 
            "oberbuergermeister", "stadträtin", "stadraetin", "antrag", "anträge", "antraege", 
            "stadtraetin", "landeshauptstadt", "stadt", "bürgerservice", "buergerservice",
            "herr", "frau", "damen", "herren", "herrn", "dieter", "stadtrates"
        }
        
        # Combine all document content
        all_text = ' '.join(df['document_content'].fillna('').astype(str))
        
        # Convert to lowercase and split into words
        words = re.findall(r'\b[a-zäöüß]+\b', all_text.lower())
        
        # Filter: remove stop words and words shorter than 4 characters
        filtered_words = [
            w for w in words 
            if w not in stop_words and len(w) >= 4
        ]
        
        # Count frequencies
        word_freq = Counter(filtered_words)
        
        # Get top N keywords
        top_keywords = [word for word, freq in word_freq.most_common(top_n)]
        
        return top_keywords
    
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return []
