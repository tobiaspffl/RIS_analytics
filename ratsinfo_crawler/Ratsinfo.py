import pandas as pd
import re
import matplotlib.pyplot as plt
import os
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed

# spaCy wird vorausgesetzt (siehe venv). Bei fehlender Installation würde ein ImportError hochgehen.
import spacy
from spacy.matcher import PhraseMatcher
SPACY_AVAILABLE = True

# Central parameter: minimum occurrences in a document to count as a hit
MIN_OCCURRENCES_PER_DOC = 1 # nicht mehr relevant bei binary count per document

# Global cache for loaded CSV data (with file modification time tracking)
_data_cache = {}

# List of columns that are actually needed for the analysis
REQUIRED_COLUMNS = ["document_content", "Gestellt am", "Typ", "Erledigt am", 
                    "Zuständiges Referat", "Gestellt von", "document_link", "name"]

# Rule-based theme lexicon for lightweight topic tagging and query expansion.
# You can extend or edit this map to reflect your domain vocabulary.
THEME_MAP = {
    "Wohnen": [
        "Wohnung",
        "Miete",
        "Mietspiegel",
        "Wohnraum",
        "Zimmer",
        "Vermietung",
        "Untermiete",
    ],
    "Mobilitaet": [
        "ÖPNV",
        "Bus",
        "Tram",
        "Straßenbahn",
        "U-Bahn",
        "S-Bahn",
        "Fahrrad",
        "Radweg",
        "Parkplatz",
    ],
    "Bildung": [
        "Schule",
        "Kita",
        "Kindergarten",
        "Universität",
        "Hochschule",
        "Ausbildung",
    ],
    "Umwelt": [
        "Klimaschutz",
        "CO2",
        "Emissionen",
        "Nachhaltigkeit",
        "Energiewende",
        "Solaranlagen",
        "Grünflächen",
        "Parks",
        "Bäume",
        "Begrünung",
        "Abfallwirtschaft",
        "Recycling",
    ],
    "Soziales": [
        "Sozialhilfe",
        "Grundsicherung",
        "Armut",
        "Obdachlosigkeit",
        "Migration",
        "Integration",
        "Flüchtlinge",
        "Chancengleichheit",
        "Familien",
    ],
    "Kultur": [
        "Theater",
        "Museen",
        "Kunstförderung",
        "Kulturzentren",
        "Bibliotheken",
        "Kulturelle Vielfalt",
        "Denkmalschutz",
        "Architektur",
    ],
    "Gesundheit": [
        "Krankenhäuser",
        "Ärzte",
        "Gesundheitsversorgung",
        "Psychiatrie",
        "Pflege",
        "Altenbetreuung",
        "Behindertenbetreuung",
        "Pandemie",
    ],
    "Wirtschaft": [
        "Arbeitsmarkt",
        "Arbeitsplätze",
        "Unternehmensförderung",
        "Gewerbebetriebe",
        "Handwerk",
        "Startups",
        "Fachkräftemangel",
    ],
    "Sicherheit": [
        "Polizei",
        "Feuerwehr",
        "Kriminalität",
        "Ordnung",
        "Sauberkeit",
        "Verkehrssicherheit",
        "Prävention",
    ],
    "Sport": [
        "Sportanlagen",
        "Freizeiteinrichtungen",
        "Schwimmbäder",
        "Spielplätze",
        "Sportförderung",
        "Jugendangebote",
    ],
    "Digitalisierung": [
        "Breitband",
        "Glasfaser",
        "5G",
        "Smart City",
        "Digitalisierung",
        "IT-Infrastruktur",
        "Online-Dienste",
    ],
    "Versorgung": [
        "Wasser",
        "Energieversorgung",
        "Tierschutz",
        "Kinderrechte",
        "Verbraucherschutz",
    ],
}


@lru_cache(maxsize=1)
def _load_spacy_model(model_name: str = "de_core_news_md"):
    """Load a German spaCy model once. Falls back to small model if needed."""
    if not SPACY_AVAILABLE:
        return None
    try:
        return spacy.load(model_name)
    except OSError:
        try:
            return spacy.load("de_core_news_sm")
        except OSError:
            return None


@lru_cache(maxsize=1)
def _build_theme_matcher():
    """Create a PhraseMatcher that matches theme phrases on lemma level."""
    nlp = _load_spacy_model()
    if not nlp or not PhraseMatcher:
        return None, None
    matcher = PhraseMatcher(nlp.vocab, attr="LEMMA")
    for theme, phrases in THEME_MAP.items():
        docs = [nlp.make_doc(p) for p in phrases]
        matcher.add(theme, docs)
    return nlp, matcher


def _expand_search_terms_with_themes(words, theme_map=None):
    """Expand user search terms with themed phrases (lexicon-based, no ML)."""
    theme_map = theme_map or THEME_MAP
    expanded = set()
    for word in words:
        if not word:
            continue
        expanded.add(word)
        lower_word = word.lower()
        for theme, phrases in theme_map.items():
            theme_lower = theme.lower()
            phrase_lowers = [p.lower() for p in phrases]
            # If the user searches for the theme name or any of its phrases, include all phrases.
            if lower_word == theme_lower or lower_word in phrase_lowers:
                expanded.update(phrases)
                expanded.add(theme)
    return list(expanded)


def _load_data_cached(file: str) -> pd.DataFrame:
    """
    Load CSV data and cache it. Cache is invalidated if the file is modified.
    Only loads necessary columns to reduce memory footprint and load time.
    Optimization 1: CSV caching | Optimization 2: Selective column loading
    """
    global _data_cache
    
    try:
        current_mtime = os.path.getmtime(file)
    except OSError:
        current_mtime = None
    
    # Check if file is cached and hasn't been modified
    if file in _data_cache and _data_cache[file]['mtime'] == current_mtime:
        return _data_cache[file]['data'].copy()
    
    # Load only required columns if they exist, otherwise load all
    try:
        df = pd.read_csv(file, usecols=REQUIRED_COLUMNS)
    except (ValueError, KeyError):
        # If some columns don't exist, load all columns
        df = pd.read_csv(file)

    # Normalize and sort dates once; NaT will be placed at the end
    if "Gestellt am" in df.columns:
        df["Gestellt am"] = pd.to_datetime(df["Gestellt am"], errors="coerce")
        df = df.sort_values("Gestellt am").reset_index(drop=True)
    
    # Cache the data
    _data_cache[file] = {
        'data': df,
        'mtime': current_mtime
    }
    
    return df.copy()


def _slice_by_date(df: pd.DataFrame, date_from: str | None, date_to: str | None) -> pd.DataFrame:
    """Binary-search slice on sorted dates to reduce the working set."""
    if "Gestellt am" not in df.columns:
        return df

    dates = df["Gestellt am"]

    # Ensure monotonic increasing (sorting is done in _load_data_cached, but keep safety)
    if not dates.is_monotonic_increasing:
        dates = pd.to_datetime(dates, errors="coerce")
        df = df.assign(**{"Gestellt am": dates}).sort_values("Gestellt am").reset_index(drop=True)
        dates = df["Gestellt am"]

    start_idx = 0
    end_idx = len(df)

    if date_from:
        try:
            date_from_ts = pd.to_datetime(date_from)
            start_idx = dates.searchsorted(date_from_ts)
        except (pd.errors.OutOfBoundsDatetime, ValueError):
            # Invalid date, skip filtering
            pass
    if date_to:
        try:
            date_to_ts = pd.to_datetime(date_to)
            end_idx = dates.searchsorted(date_to_ts, side="right")
        except (pd.errors.OutOfBoundsDatetime, ValueError):
            # Invalid date, skip filtering
            pass

    return df.iloc[start_idx:end_idx]


def _detect_themes_in_text(text: str):
    """Return a list of theme names detected in the given text using spaCy."""
    nlp, matcher = _build_theme_matcher()
    if not nlp or not matcher:
        return []
    doc = nlp(text or "")
    matches = matcher(doc)
    themes = {doc.vocab.strings[m_id] for m_id, _, _ in matches}
    return sorted(themes)


def _annotate_themes(df: pd.DataFrame, text_col: str = "document_content"):
    """Annotate a dataframe with a new column 'themes_detected' (list of themes)."""
    if text_col not in df.columns:
        df["themes_detected"] = [[] for _ in range(len(df))]
        return df
    df = df.copy()
    df["themes_detected"] = df[text_col].astype(str).apply(_detect_themes_in_text)
    return df


def extract_fraktion(text):
    """
    Extracts multiple factions/persons from text.
    Handles comma-separated lists within text patterns.
    Returns a list of individual factions/persons.
    """
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
    
    # Split by comma to handle multiple factions/persons in the same line
    # e.g. "Die Linke / Die PARTEI Stadtratsfraktion München, Fraktion Die Grünen - Rosa Liste"
    # or "Herr StR Manuel Pretzl, Frau StRin Alexandra Gaßmann, ..."
    all_fraktionen = []
    for f in fraktionen:
        # Split by comma, strip whitespace
        parts = [p.strip() for p in f.split(',')]
        all_fraktionen.extend(parts)
    
    # Duplikate entfernen und bereinigen
    fraktionen = list(set(f for f in all_fraktionen if f and len(f) > 3))
    
    return fraktionen


def find_word_occurrences(file, word):
    """
    Count documents that mention the word at least MIN_OCCURRENCES_PER_DOC times.
    Each document contributes at most 1 to the count (binary hit per doc).

    Note: Uses vectorized pandas operations for speed (Optimization 3).
    Theme expansion happens one level up in find_words_frequency.
    """
    # Handle invalid input
    if not word or not isinstance(word, str) or word.strip() == "":
        df = _load_data_cached(file)
        df["document_content"] = df["document_content"].astype(str)
        df["occurrences"] = 0
        df["count"] = 0
        return df[df["count"] > 0], 0
    
    df = _load_data_cached(file)
    df["document_content"] = df["document_content"].astype(str)
    
    try:
        pattern = re.compile(word, re.IGNORECASE)
    except (re.error, TypeError):
        # Invalid regex pattern - return empty result
        df["occurrences"] = 0
        df["count"] = 0
        return df[df["count"] > 0], 0
    
    # Vectorized string matching (much faster than apply + lambda)
    df["count"] = df["document_content"].str.contains(pattern, na=False).astype(int)

    df["occurrences"] = df["count"]
    total_word_count = int(df["count"].sum())
    
    return df[df["count"] > 0], total_word_count


def find_words_frequency(file, words, typ_filter=None, date_filter=None, expand_with_themes=True, annotate_themes=False):
    """
    Find documents matching the given words (binary per document).

    Enhancements:
    - Optional theme-based query expansion (lexicon-driven, no ML): if a user
      searches for a theme name (e.g., "Wohnen") or one of its phrases
      (e.g., "Miete"), we expand the search to all phrases under that theme.
    - Optional theme annotation per document using spaCy PhraseMatcher.
    - Optional date range filtering.

    Args:
        file: Path to CSV file.
        words: List of keywords to search for.
        typ_filter: List of Typ values to filter by (OR condition), None = no filter.
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format, None = no filter.
        expand_with_themes: Expand search terms using THEME_MAP when True.
        annotate_themes: Attach a 'themes_detected' column with matched themes when True.
    """
    # Expand search intent via THEME_MAP to catch related phrases.
    search_terms = words or []
    if expand_with_themes:
        search_terms = _expand_search_terms_with_themes(search_terms)

    # Load once, slice by date early (binary search on sorted dates)
    base_df = _load_data_cached(file)
    if date_filter and (date_filter.get("from") or date_filter.get("to")):
        base_df = _slice_by_date(base_df, date_filter.get("from"), date_filter.get("to"))

    # If after expansion no words are left, return all documents with count=1.
    if not search_terms or all(not w for w in search_terms):
        df = base_df
        if typ_filter:
            df = df[df["Typ"].isin(typ_filter)]
        df["occurrences"] = 0
        df["count"] = 1
        total_word_count = len(df)
        if annotate_themes:
            df = _annotate_themes(df)
        return df, total_word_count

    dfs = []

    # Run regex-based finder for each (possibly expanded) term with parallel processing
    # Optimization 4: Process multiple search terms in parallel for faster execution
    # Reuse the pre-sliced base_df to avoid re-loading/slicing inside find_word_occurrences
    def _process_word(word):
        # local copy to avoid side-effects
        df_local = base_df.copy(deep=True)
        # reuse vectorized matching
        if not word or not isinstance(word, str) or word.strip() == "":
            df_local.loc[:, "occurrences"] = 0
            df_local.loc[:, "count"] = 0
            return df_local[df_local["count"] > 0]
        try:
            pattern = re.compile(word, re.IGNORECASE)
        except (re.error, TypeError):
            df_local.loc[:, "occurrences"] = 0
            df_local.loc[:, "count"] = 0
            return df_local[df_local["count"] > 0]
        df_local.loc[:, "count"] = df_local["document_content"].astype(str).str.contains(pattern, na=False).astype(int)
        df_local.loc[:, "occurrences"] = df_local.loc[:, "count"]
        return df_local[df_local["count"] > 0]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(_process_word, word): word for word in search_terms}
        for future in as_completed(futures):
            dfs.append(future.result())

    rows_all = pd.concat(dfs, ignore_index=True)
    rows_with_words = rows_all.drop_duplicates()

    if typ_filter:
        rows_with_words = rows_with_words[rows_with_words["Typ"].isin(typ_filter)]

    # Date filtering already done via _slice_by_date, no need to re-filter

    # Optional inline theme annotation for downstream use/inspection.
    if annotate_themes:
        rows_with_words = _annotate_themes(rows_with_words)

    # Total count now counts jedes Dokument höchstens einmal über alle Suchbegriffe (Union).
    total_word_count = len(rows_with_words)

    return rows_with_words, total_word_count


def compute_monthly_trend(file: str, words: list[str], typ_filter=None, date_filter=None) -> pd.DataFrame:
    """
    Compute monthly aggregated counts for the given search words.

    Reads the CSV, finds occurrences via find_words_frequency, converts the
    'Gestellt am' column to datetime, filters invalid dates, derives a
    YYYY-MM month string and aggregates the 'count' per month.

    Args:
        typ_filter: List of Typ values to filter by (OR condition)
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format

    Returns a DataFrame with columns ['month', 'count', 'typ_breakdown'] sorted by month.
    typ_breakdown is a dict mapping Typ -> count for that month.
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter, date_filter=date_filter)

    if rows_with_words.empty:
        return pd.DataFrame({"month": [], "count": [], "typ_breakdown": []})

    rows_with_words["Gestellt am"] = pd.to_datetime(rows_with_words["Gestellt am"], errors="coerce")
    rows_with_words = rows_with_words[rows_with_words["Gestellt am"].notna()]

    rows_with_words["month"] = rows_with_words["Gestellt am"].dt.strftime("%Y-%m")
    
    # Group by month and Typ to get breakdown
    typ_breakdown = rows_with_words.groupby(["month", "Typ"])["count"].sum().reset_index()
    
    # Create dictionary mapping for each month
    breakdown_dict = {}
    for _, row in typ_breakdown.iterrows():
        month = row["month"]
        if month not in breakdown_dict:
            breakdown_dict[month] = {}
        breakdown_dict[month][row["Typ"]] = int(row["count"])
    
    # Aggregate total counts per month
    monthly_trend = rows_with_words.groupby("month")["count"].sum().reset_index()
    monthly_trend = monthly_trend.sort_values("month")
    
    # Add typ_breakdown column
    monthly_trend["typ_breakdown"] = monthly_trend["month"].map(breakdown_dict)
    
    return monthly_trend


def compute_fraktionen(file: str, words: list[str], group_by: str = "Gestellt von", typ_filter=None, date_filter=None) -> pd.DataFrame:
    """
    Compute aggregated counts per faction/submitter for the given search words.

    - Finds matching documents via find_words_frequency
    - Splits comma-separated entries in the group_by column (e.g., multiple submitters per document)
    - Groups by individual submitter/faction and sums counts
    - Sorts descending by count

    Args:
        typ_filter: List of Typ values to filter by (OR condition)
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format

    Returns a DataFrame with columns [name, count].
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter, date_filter=date_filter)

    if rows_with_words.empty:
        return pd.DataFrame({"name": [], "count": []})

    # Ensure group_by column exists
    if group_by not in rows_with_words.columns:
        return pd.DataFrame({"name": [], "count": []})

    # Explode on comma-separated values to count each faction/person individually
    rows_with_words = rows_with_words.copy()
    rows_with_words[group_by] = rows_with_words[group_by].astype(str).str.split(',')
    rows_with_words = rows_with_words.explode(group_by, ignore_index=False)
    rows_with_words[group_by] = rows_with_words[group_by].str.strip()

    # Group by name and Typ to get breakdown
    typ_breakdown = rows_with_words.groupby([group_by, "Typ"])["count"].sum().reset_index()
    
    # Create dictionary mapping for each name
    breakdown_dict = {}
    for _, row in typ_breakdown.iterrows():
        name = row[group_by]
        if name not in breakdown_dict:
            breakdown_dict[name] = {}
        breakdown_dict[name][row["Typ"]] = int(row["count"])
    
    # Aggregate total counts per name
    agg = rows_with_words.groupby(group_by)["count"].sum().reset_index()
    agg = agg.rename(columns={group_by: "name"})
    agg = agg.sort_values("count", ascending=False)
    
    # Add typ_breakdown column
    agg["typ_breakdown"] = agg["name"].map(breakdown_dict)

    return agg


def compute_processing_metrics(file: str, words: list[str], typ_filter=None, date_filter=None) -> dict:
    """
    Compute processing time metrics for the given search words.
    
    Calculates:
    - Average processing time in days (from "Gestellt am" to "Erledigt am")
    - Number of open proposals (no "Erledigt am" date)
    - Number of closed proposals
    - Processing time breakdown by "Zuständiges Referat"
    
    Args:
        typ_filter: List of Typ values to filter by (OR condition)
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format
    
    Returns a dict with:
    {
        "avgDays": float | None,
        "openCount": int,
        "closedCount": int,
        "totalCount": int,
        "byReferat": [{"referat": str, "avgDays": float, "count": int}, ...]
    }
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter, date_filter=date_filter)

    if rows_with_words.empty:
        return {
            "avgDays": None,
            "openCount": 0,
            "closedCount": 0,
            "totalCount": 0,
            "byReferat": []
        }

    # Convert date columns to datetime
    rows_with_words["Gestellt am"] = pd.to_datetime(rows_with_words["Gestellt am"], errors="coerce")
    rows_with_words["Erledigt am"] = pd.to_datetime(rows_with_words["Erledigt am"], errors="coerce")

    # Calculate processing duration in days
    rows_with_words["processing_days"] = (
        rows_with_words["Erledigt am"] - rows_with_words["Gestellt am"]
    ).dt.days

    # Filter for valid entries
    total_count = len(rows_with_words)
    closed_rows = rows_with_words[rows_with_words["Erledigt am"].notna()]
    open_rows = rows_with_words[rows_with_words["Erledigt am"].isna()]

    closed_count = len(closed_rows)
    open_count = len(open_rows)

    # Calculate average processing time
    valid_processing_days = closed_rows["processing_days"].dropna()
    avg_days = valid_processing_days.mean() if not valid_processing_days.empty else None

    # Group by Referat
    by_referat = []
    if "Zuständiges Referat" in closed_rows.columns:
        # Calculate statistics
        referat_stats = (
            closed_rows.groupby("Zuständiges Referat")["processing_days"]
            .agg(["mean", "count"])
            .reset_index()
        )
        referat_stats = referat_stats.rename(columns={"mean": "avgDays", "count": "count", "Zuständiges Referat": "referat"})
        referat_stats = referat_stats.sort_values("avgDays", ascending=False)
        
        # Add typ_breakdown for each referat
        typ_breakdown_by_referat = closed_rows.groupby(["Zuständiges Referat", "Typ"]).size().reset_index(name="count")
        breakdown_dict = {}
        for _, row in typ_breakdown_by_referat.iterrows():
            referat = row["Zuständiges Referat"]
            if referat not in breakdown_dict:
                breakdown_dict[referat] = {}
            breakdown_dict[referat][row["Typ"]] = int(row["count"])
        
        # Add breakdown to stats
        referat_stats["typ_breakdown"] = referat_stats["referat"].map(breakdown_dict)
        
        by_referat = referat_stats.to_dict(orient="records")

    return {
        "avgDays": float(avg_days) if avg_days is not None and not pd.isna(avg_days) else None,
        "openCount": int(open_count),
        "closedCount": int(closed_count),
        "totalCount": int(total_count),
        "byReferat": by_referat
    }


def compute_fraktionen_share(file: str, words: list[str], group_by: str = "Gestellt von", typ_filter=None, date_filter=None) -> pd.DataFrame:
    """
    Compute share of proposals per faction (group_by) that mention the given words.
    
    Handles comma-separated submitters by expanding each document into one row per submitter.

    Args:
        typ_filter: List of Typ values to filter by (OR condition)
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format

    Returns a DataFrame with columns:
    [name, share, count, total]

    - name: the faction/submitter
    - count: number of matching documents for the keyword(s) where this faction is listed
    - total: total number of documents where this faction is listed (across all proposals)
    - share: count / total (float in [0,1])
    """
    # Read full dataset to compute totals per faction (use cache)
    df_all = _load_data_cached(file)
    
    # Apply Typ filter if provided
    if typ_filter:
        df_all = df_all[df_all["Typ"].isin(typ_filter)]
    
    # Apply date filter if provided
    if date_filter:
        df_all["Gestellt am"] = pd.to_datetime(df_all["Gestellt am"], errors="coerce")
        if "from" in date_filter and date_filter["from"]:
            date_from = pd.to_datetime(date_filter["from"])
            df_all = df_all[df_all["Gestellt am"] >= date_from]
        if "to" in date_filter and date_filter["to"]:
            date_to = pd.to_datetime(date_filter["to"])
            df_all = df_all[df_all["Gestellt am"] <= date_to]

    if group_by not in df_all.columns:
        return pd.DataFrame({"name": [], "share": [], "count": [], "total": []})

    # Explode on comma-separated values for totals
    df_all = df_all.copy()
    df_all[group_by] = df_all[group_by].astype(str).str.split(',')
    df_all = df_all.explode(group_by, ignore_index=False)
    df_all[group_by] = df_all[group_by].str.strip()

    # Compute totals per faction across all documents
    totals = df_all.groupby(group_by).size().reset_index(name="total")

    # Compute matched counts per faction for given words
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter, date_filter=date_filter)

    if rows_with_words.empty or group_by not in rows_with_words.columns:
        # No matches: return factions with zero counts (filtered out later)
        matched_counts = pd.DataFrame({group_by: [], "count": []})
    else:
        # Explode on comma-separated values for matches
        rows_with_words = rows_with_words.copy()
        rows_with_words[group_by] = rows_with_words[group_by].astype(str).str.split(',')
        rows_with_words = rows_with_words.explode(group_by, ignore_index=False)
        rows_with_words[group_by] = rows_with_words[group_by].str.strip()

        matched_counts = (
            rows_with_words.groupby(group_by)["count"].sum().reset_index()
        )

    # Merge totals with matched counts
    merged = totals.merge(matched_counts, on=group_by, how="left")
    merged["count"] = merged["count"].fillna(0).astype(int)
    merged["share"] = merged["count"] / merged["total"].replace(0, pd.NA)

    # Clean up and sort; filter out zero matches to focus on relevant factions
    merged = merged.rename(columns={group_by: "name"})
    merged = merged.dropna(subset=["share"])  # drop divisions by zero
    merged = merged[merged["count"] > 0]
    merged = merged.sort_values("share", ascending=False)

    return merged


def compute_date_range(file: str) -> dict:
    """
    Compute the date range of all proposals in the dataset.
    
    Returns a dict with:
    {
        "minDate": "YYYY-MM-DD" | None,
        "maxDate": "YYYY-MM-DD" | None
    }
    """
    try:
        df = _load_data_cached(file)
        if df.empty or "Gestellt am" not in df.columns:
            return {"minDate": None, "maxDate": None}
        
        # Parse dates and filter valid ones
        dates = pd.to_datetime(df["Gestellt am"], errors="coerce")
        valid_dates = dates.dropna()
        
        if valid_dates.empty:
            return {"minDate": None, "maxDate": None}
        
        min_date = valid_dates.min().strftime("%Y-%m-%d")
        max_date = valid_dates.max().strftime("%Y-%m-%d")
        
        return {"minDate": min_date, "maxDate": max_date}
    except Exception as e:
        print(f"Error computing date range: {e}")
        return {"minDate": None, "maxDate": None}


def get_available_typen(file: str) -> list:
    """
    Get all unique Typ values from the dataset.
    
    Returns a sorted list of unique Typ values (strings).
    """
    try:
        df = _load_data_cached(file)
        if df.empty or "Typ" not in df.columns:
            return []
        
        # Get unique values, remove NaN, convert to list, and sort
        typen = df["Typ"].dropna().unique().tolist()
        typen.sort()
        
        return typen
    except Exception as e:
        print(f"Error getting available Typen: {e}")
        return []


def get_expanded_search_terms(words: list[str], expand_with_themes: bool = True) -> dict:
    """
    Get the expanded search terms for display purposes.
    
    Shows what search terms are actually used when a user enters keywords.
    If theme expansion is enabled and a word matches a theme, all related
    phrases are included.
    
    Args:
        words: List of search words entered by user
        expand_with_themes: Whether to apply theme expansion (default True)
    
    Returns a dict with:
    {
        "original": ["Wohnen"],
        "expanded": ["Wohnen", "Wohnung", "Miete", "Mietspiegel", "Wohnraum", "Zimmer", "Vermietung", "Untermiete"]
    }
    """
    search_terms = words or []
    
    if expand_with_themes:
        search_terms = _expand_search_terms_with_themes(search_terms)
    
    return {
        "original": words or [],
        "expanded": list(search_terms)
    }


def get_filtered_applications(file: str, words: list[str], typ_filter=None, date_filter=None) -> pd.DataFrame:
    """
    Get all applications (proposals) that match the given filters.
    
    Returns all columns from the original data for matching applications,
    filtered by search words, type, and date range.
    
    Args:
        file: Path to CSV file
        words: List of keywords to search for (optional, empty = all)
        typ_filter: List of Typ values to filter by (OR condition), None = no filter
        date_filter: Dict with "from" and/or "to" keys in YYYY-MM-DD format, None = no filter
    
    Returns:
        DataFrame with matching applications, sorted by date descending
    """
    try:
        # Find matching applications based on search words and filters
        if words and any(w.strip() for w in words):
            # Filter by search terms
            rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter, date_filter=date_filter, expand_with_themes=True)
            result_df = rows_with_words
        else:
            # No search term - return all applications matching type and date filters
            result_df = _load_data_cached(file)
            
            # Apply date filter
            if date_filter and (date_filter.get("from") or date_filter.get("to")):
                result_df = _slice_by_date(result_df, date_filter.get("from"), date_filter.get("to"))
            
            # Apply typ filter
            if typ_filter:
                result_df = result_df[result_df["Typ"].isin(typ_filter)]
        
        # Sort by date descending (newest first)
        if "Gestellt am" in result_df.columns:
            result_df = result_df.sort_values("Gestellt am", ascending=False, na_position="last")
        
        return result_df
    except Exception as e:
        print(f"Error getting filtered applications: {e}")
        return pd.DataFrame()
