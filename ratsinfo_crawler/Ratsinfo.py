import pandas as pd
import re
import matplotlib.pyplot as plt

def find_word_occurrences(file, word):
    print(word)
    df = pd.read_csv(file)

    df["document_content"] = df["document_content"].astype(str)

    pattern = re.compile(word, re.IGNORECASE)

    df["count"] = df["document_content"].apply(lambda x: len(pattern.findall(x)))

    # Total frequency across the whole dataset
    total_word_count = df["count"].sum()

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
