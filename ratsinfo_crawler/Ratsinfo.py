import pandas as pd
import re
import matplotlib.pyplot as plt

# Central parameter: minimum occurrences in a document to count as a hit
MIN_OCCURRENCES_PER_DOC = 1


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


def find_words_frequency(file, words):
    dfs = []

    total_word_count = 0
    for word in words:
        rows_with_word,word_count = find_word_occurrences(file, word)
        dfs.append(rows_with_word)
        total_word_count += word_count

    rows_all = pd.concat(dfs, ignore_index=True)
    rows_with_words = rows_all.drop_duplicates()
    return rows_with_words, total_word_count


def compute_monthly_trend(file: str, words: list[str]) -> pd.DataFrame:
    """
    Compute monthly aggregated counts for the given search words.

    Reads the CSV, finds occurrences via find_words_frequency, converts the
    'Gestellt am' column to datetime, filters invalid dates, derives a
    YYYY-MM month string and aggregates the 'count' per month.

    Returns a DataFrame with columns ['month', 'count'] sorted by month.
    """
    rows_with_words, _ = find_words_frequency(file, words)

    if rows_with_words.empty:
        return pd.DataFrame({"month": [], "count": []})

    rows_with_words["Gestellt am"] = pd.to_datetime(rows_with_words["Gestellt am"], errors="coerce")
    rows_with_words = rows_with_words[rows_with_words["Gestellt am"].notna()]

    rows_with_words["month"] = rows_with_words["Gestellt am"].dt.strftime("%Y-%m")
    monthly_trend = rows_with_words.groupby("month")["count"].sum().reset_index()
    monthly_trend = monthly_trend.sort_values("month")

    return monthly_trend


def compute_fraktionen(file: str, words: list[str], group_by: str = "Gestellt von") -> pd.DataFrame:
    """
    Compute aggregated counts per faction/submitter for the given search words.

    - Finds matching documents via find_words_frequency
    - Groups by the provided column (default 'Gestellt von')
    - Sums the 'count' per group and sorts descending by count

    Returns a DataFrame with columns [name, count].
    """
    rows_with_words, _ = find_words_frequency(file, words)

    if rows_with_words.empty:
        return pd.DataFrame({"name": [], "count": []})

    # Ensure group_by column exists
    if group_by not in rows_with_words.columns:
        return pd.DataFrame({"name": [], "count": []})

    agg = rows_with_words.groupby(group_by)["count"].sum().reset_index()
    agg = agg.rename(columns={group_by: "name"})
    agg = agg.sort_values("count", ascending=False)

    return agg


def compute_processing_metrics(file: str, words: list[str]) -> dict:
    """
    Compute processing time metrics for the given search words.
    
    Calculates:
    - Average processing time in days (from "Gestellt am" to "Erledigt am")
    - Number of open proposals (no "Erledigt am" date)
    - Number of closed proposals
    - Processing time breakdown by "Zuständiges Referat"
    
    Returns a dict with:
    {
        "avgDays": float | None,
        "openCount": int,
        "closedCount": int,
        "totalCount": int,
        "byReferat": [{"referat": str, "avgDays": float, "count": int}, ...]
    }
    """
    rows_with_words, _ = find_words_frequency(file, words)

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


def compute_fraktionen_share(file: str, words: list[str], group_by: str = "Gestellt von") -> pd.DataFrame:
    """
    Compute share of proposals per faction (group_by) that mention the given words.

    Returns a DataFrame with columns:
    [name, share, count, total]

    - name: the faction/submitter
    - count: number of matching documents for the keyword(s)
    - total: total number of documents for that faction
    - share: count / total (float in [0,1])
    """
    # Read full dataset to compute totals per faction
    df_all = pd.read_csv(file)

    if group_by not in df_all.columns:
        return pd.DataFrame({"name": [], "share": [], "count": [], "total": []})

    # Compute totals per faction across all documents
    totals = df_all.groupby(group_by).size().reset_index(name="total")

    # Compute matched counts per faction for given words
    rows_with_words, _ = find_words_frequency(file, words)

    if rows_with_words.empty or group_by not in rows_with_words.columns:
        # No matches: return factions with zero counts (filtered out later)
        matched_counts = pd.DataFrame({group_by: [], "count": []})
    else:
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
