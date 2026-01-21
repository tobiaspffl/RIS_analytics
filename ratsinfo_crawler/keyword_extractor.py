"""
Keyword extraction module for dynamic example button generation.
Can be deleted if dynamic keywords are no longer needed.
"""

import pandas as pd
import re
from collections import Counter
import spacy

# Load German language model
try:
    # Disable unnecessary pipeline components for speed
    # We only need POS tagging, not NER, parser, etc.
    nlp = spacy.load("de_core_news_sm", disable=["ner", "lemmatizer"])
except OSError:
    print("German spaCy model not found. Install with: python -m spacy download de_core_news_sm")
    nlp = None


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
            # project-specific exclusions to avoid generic/structural terms in suggestions; bitte klein schreiben
            'münchen', 'stadtrat', 'fraktion', 'rathaus', "muenchen", "oberbürgermeister", 
            "oberbuergermeister", "stadträtin", "stadraetin", "antrag", "anträge", "antraege", 
            "stadtraetin", "landeshauptstadt", "stadt", "bürgerservice", "buergerservice",
            "herr", "frau", "damen", "herren", "herrn", "dieter", "stadtrates", "referat",
            "sitzungsvorlage", "sitzungsvorlage", "tagesordnung", "öffentlich", "oeffentlich", "marienplatz",
            "reiter", "zimmer", "liste", "begründung", "münchner", "diese", "welchen", "vielen",
            "https", "hans", "welche", "können", "partei", "kann", "ziffer", "telefon", "soll", 
            "bereits", "datum", "sehr", "ihre", "ihrem", "ihren", "ihres", "unser", "unsere",
            "unter", "wurden", "werden", "werden", "möchten", "moechten", "möchte", "moechte", "rings",
            "bitte", "fragen", "fragen", "innen", "alle", "allen", "aller", "allenfalls", "folgenden"



        }
        
        # Combine all document content
        all_text = ' '.join(df['document_content'].fillna('').astype(str))
        
        # Use spaCy for POS tagging if available
        if nlp is not None:
            # Process text in chunks with aggressive early stopping
            chunk_size = 50000  # 50k characters per chunk (smaller = faster)
            word_freq = Counter()
            
            # Target: only need 2x more keywords than requested for diversity
            target_keywords = top_n * 2
            
            for i in range(0, len(all_text), chunk_size):
                chunk = all_text[i:i + chunk_size]
                
                # Process with spaCy (without lemmatizer, just use text.lower())
                doc = nlp(chunk)
                
                # Extract nouns from this chunk
                chunk_nouns = [
                    token.text.lower() for token in doc
                    if token.pos_ == "NOUN" 
                    and token.text.lower() not in stop_words
                    and len(token.text) >= 4
                    and token.is_alpha
                ]
                
                # Update frequency counter
                word_freq.update(chunk_nouns)
                
                # Aggressive early stopping
                if len(word_freq) >= target_keywords:
                    print(f"Early stop: {len(word_freq)} keywords after {i + len(chunk)} chars")
                    break
            
            print(f"Total: {len(word_freq)} unique nouns")
        else:
            # Fallback: simple word extraction without POS tagging
            print("Warning: spaCy not available, using fallback method")
            words = re.findall(r'\b[a-zäöüß]+\b', all_text.lower())
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
