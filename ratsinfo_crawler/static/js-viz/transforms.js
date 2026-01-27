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
 * @param {Array} trendData - Array of {month, count} or {month, share, count, total} objects
 * @param {Object} options - Configuration options
 * @param {boolean} options.isShare - Whether this is share data (uses 'share' instead of 'count' as main value)
 * @returns {Array} - Array of {date, count/share, month, ...} objects with Date objects
 */
export function prepareTrendData(trendData, options = {}) {
  if (!Array.isArray(trendData) || trendData.length === 0) {
    return [];
  }
  
  const { isShare = false } = options;
  
  return trendData
    .map(d => {
      if (isShare) {
        // For share data, use share value and keep count/total for tooltips
        return {
          date: new Date(d.month + "-01"),
          month: d.month,
          share: Number(d.share) || 0,
          count: Number(d.count) || 0,
          total: Number(d.total) || 0
        };
      } else {
        // For regular trend data
        return {
          date: new Date(d.month + "-01"),
          month: d.month,
          count: Number(d.count) || 0
        };
      }
    })
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
