/**
 * transforms.js - Data Transformation Functions
 * 
 * Pure functions to transform raw API data into D3-ready formats
 */

/**
 * Parse date strings (YYYY-MM-DD) to Date objects
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date|null} - Parsed date or null if invalid
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Convert trend data to D3-ready format with parsed dates
 * @param {Array} trendData - Array of {month, count} objects
 * @returns {Array} - Array of {date, count} objects with Date objects
 */
export function prepareTrendData(trendData) {
  if (!Array.isArray(trendData) || trendData.length === 0) {
    return [];
  }
  
  return trendData
    .map(d => ({
      date: new Date(d.month + "-01"), // Convert "2024-01" to Date object
      month: d.month,
      count: Number(d.count) || 0
    }))
    .sort((a, b) => a.date - b.date);
}

/**
 * Get top N documents by count
 * @param {Array} documents - Array of document objects with counts
 * @param {number} limit - Maximum number of documents to return
 * @returns {Array} - Top N documents sorted by count descending
 */
export function getTopDocuments(documents, limit = 20) {
  if (!Array.isArray(documents)) {
    return [];
  }
  
  return documents
    .filter(d => typeof d.count === "number" && d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
