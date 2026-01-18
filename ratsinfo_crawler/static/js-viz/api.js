/**
 * api.js - API Calls to Flask Backend
 * 
 * Provides functions to fetch data from Flask endpoints
 * All functions return promises that resolve to JSON data
 */

/**
 * Fetch trend data (monthly aggregated counts) for a given keyword
 * @param {string} word - The keyword to search for
 * @returns {Promise<Array>} - Array of {month, count} objects
 */
export async function fetchTrend(word) {
  try {
    const res = await fetch(`/trend?word=${encodeURIComponent(word)}`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching trend:", error);
    return [];
  }
}

/**
 * Fetch document-level data (all documents matching a keyword with individual counts)
 * @param {string} word - The keyword to search for
 * @returns {Promise<Array>} - Array of document objects with counts
 */
export async function fetchDocuments(word) {
  try {
    const res = await fetch(`/get_dataframe?word=${encodeURIComponent(word)}`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Fetch fraktionen (party/faction) data for a given keyword
 * @param {string} word - The keyword to search for
 * @returns {Promise<Array>} - Array of {name, count} objects
 */
export async function fetchFraktionen(word) {
  try {
    const res = await fetch(`/fraktionen?word=${encodeURIComponent(word)}`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching fraktionen:", error);
    return [];
  }
}

/**
 * Fetch processing metrics for a given keyword
 * @param {string} word - The keyword to search for
 * @returns {Promise<Object>} - Object with avgDays, openCount, closedCount, totalCount, byReferat
 */
export async function fetchMetrics(word) {
  try {
    const res = await fetch(`/metrics?word=${encodeURIComponent(word)}`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}
