import pandas as pd
import re
import matplotlib.pyplot as plt

# Central parameter: minimum occurrences in a document to count as a hit
MIN_OCCURRENCES_PER_DOC = 1


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
    """
    print(word)
    df = pd.read_csv(file)

    df["document_content"] = df["document_content"].astype(str)

    pattern = re.compile(word, re.IGNORECASE)

    # Raw occurrences per document
    df["occurrences"] = df["document_content"].apply(lambda x: len(pattern.findall(x)))

    # Binary count per document based on threshold
    df["count"] = (df["occurrences"] >= MIN_OCCURRENCES_PER_DOC).astype(int)

    # Total matching documents across the dataset (sum of binary counts)
    total_word_count = int(df["count"].sum())

    # Only documents that meet the threshold
    rows_with_word = df[df["count"] > 0]
    return rows_with_word, total_word_count


def find_words_frequency(file, words, typ_filter=None):
    """
    Find documents matching the given words.
    If words list is empty, returns all documents with count=1.
    
    Args:
        file: Path to CSV file
        words: List of keywords to search for
        typ_filter: List of Typ values to filter by (OR condition), None = no filter
    """
    # If no words provided, return all documents
    if not words or all(not w for w in words):
        df = pd.read_csv(file)
        
        # Apply Typ filter if provided
        if typ_filter:
            df = df[df["Typ"].isin(typ_filter)]
        
        df["occurrences"] = 0
        df["count"] = 1
        total_word_count = len(df)
        return df, total_word_count
    
    dfs = []

    total_word_count = 0
    for word in words:
        rows_with_word,word_count = find_word_occurrences(file, word)
        dfs.append(rows_with_word)
        total_word_count += word_count

    rows_all = pd.concat(dfs, ignore_index=True)
    rows_with_words = rows_all.drop_duplicates()
    
    # Apply Typ filter if provided
    if typ_filter:
        rows_with_words = rows_with_words[rows_with_words["Typ"].isin(typ_filter)]
    
    return rows_with_words, total_word_count


def compute_monthly_trend(file: str, words: list[str], typ_filter=None) -> pd.DataFrame:
    """
    Compute monthly aggregated counts for the given search words.

    Reads the CSV, finds occurrences via find_words_frequency, converts the
    'Gestellt am' column to datetime, filters invalid dates, derives a
    YYYY-MM month string and aggregates the 'count' per month.

    Args:
        typ_filter: List of Typ values to filter by (OR condition)

    Returns a DataFrame with columns ['month', 'count'] sorted by month.
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter)

    if rows_with_words.empty:
        return pd.DataFrame({"month": [], "count": []})

    rows_with_words["Gestellt am"] = pd.to_datetime(rows_with_words["Gestellt am"], errors="coerce")
    rows_with_words = rows_with_words[rows_with_words["Gestellt am"].notna()]

    rows_with_words["month"] = rows_with_words["Gestellt am"].dt.strftime("%Y-%m")
    monthly_trend = rows_with_words.groupby("month")["count"].sum().reset_index()
    monthly_trend = monthly_trend.sort_values("month")

    return monthly_trend


def compute_fraktionen(file: str, words: list[str], group_by: str = "Gestellt von", typ_filter=None) -> pd.DataFrame:
    """
    Compute aggregated counts per faction/submitter for the given search words.

    - Finds matching documents via find_words_frequency
    - Splits comma-separated entries in the group_by column (e.g., multiple submitters per document)
    - Groups by individual submitter/faction and sums counts
    - Sorts descending by count

    Args:
        typ_filter: List of Typ values to filter by (OR condition)

    Returns a DataFrame with columns [name, count].
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter)

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

    agg = rows_with_words.groupby(group_by)["count"].sum().reset_index()
    agg = agg.rename(columns={group_by: "name"})
    agg = agg.sort_values("count", ascending=False)

    return agg


def compute_processing_metrics(file: str, words: list[str], typ_filter=None) -> dict:
    """
    Compute processing time metrics for the given search words.
    
    Calculates:
    - Average processing time in days (from "Gestellt am" to "Erledigt am")
    - Number of open proposals (no "Erledigt am" date)
    - Number of closed proposals
    - Processing time breakdown by "Zuständiges Referat"
    
    Args:
        typ_filter: List of Typ values to filter by (OR condition)
    
    Returns a dict with:
    {
        "avgDays": float | None,
        "openCount": int,
        "closedCount": int,
        "totalCount": int,
        "byReferat": [{"referat": str, "avgDays": float, "count": int}, ...]
    }
    """
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter)

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
        referat_stats = (
            closed_rows.groupby("Zuständiges Referat")["processing_days"]
            .agg(["mean", "count"])
            .reset_index()
        )
        referat_stats = referat_stats.rename(columns={"mean": "avgDays", "count": "count", "Zuständiges Referat": "referat"})
        referat_stats = referat_stats.sort_values("avgDays", ascending=False)
        by_referat = referat_stats.to_dict(orient="records")

    return {
        "avgDays": float(avg_days) if avg_days is not None and not pd.isna(avg_days) else None,
        "openCount": int(open_count),
        "closedCount": int(closed_count),
        "totalCount": int(total_count),
        "byReferat": by_referat
    }


def compute_fraktionen_share(file: str, words: list[str], group_by: str = "Gestellt von", typ_filter=None) -> pd.DataFrame:
    """
    Compute share of proposals per faction (group_by) that mention the given words.
    
    Handles comma-separated submitters by expanding each document into one row per submitter.

    Args:
        typ_filter: List of Typ values to filter by (OR condition)

    Returns a DataFrame with columns:
    [name, share, count, total]

    - name: the faction/submitter
    - count: number of matching documents for the keyword(s) where this faction is listed
    - total: total number of documents where this faction is listed (across all proposals)
    - share: count / total (float in [0,1])
    """
    # Read full dataset to compute totals per faction
    df_all = pd.read_csv(file)
    
    # Apply Typ filter if provided
    if typ_filter:
        df_all = df_all[df_all["Typ"].isin(typ_filter)]

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
    rows_with_words, _ = find_words_frequency(file, words, typ_filter=typ_filter)

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
        df = pd.read_csv(file)
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
        df = pd.read_csv(file)
        if df.empty or "Typ" not in df.columns:
            return []
        
        # Get unique values, remove NaN, convert to list, and sort
        typen = df["Typ"].dropna().unique().tolist()
        typen.sort()
        
        return typen
    except Exception as e:
        print(f"Error getting available Typen: {e}")
        return []
