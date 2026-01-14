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
