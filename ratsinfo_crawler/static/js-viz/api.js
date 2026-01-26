/**
 * api.js - API Calls to Flask Backend
 * 
 * Provides functions to fetch data from Flask endpoints
 * All functions return promises that resolve to JSON data
 */

/**
 * Fetch trend data (monthly aggregated counts) for a given keyword
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of {month, count} objects
 */
export async function fetchTrend(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/trend?word=${encodeURIComponent(word)}`;
    if (typFilter && typFilter.length > 0) {
      url += `&typ=${encodeURIComponent(typFilter.join(','))}`;
    }
    if (dateFilter) {
      if (dateFilter.from) {
        url += `&date_from=${encodeURIComponent(dateFilter.from)}`;
      }
      if (dateFilter.to) {
        url += `&date_to=${encodeURIComponent(dateFilter.to)}`;
      }
    }
    const res = await fetch(url);
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
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of {name, count} objects
 */
export async function fetchFraktionen(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/fraktionen?word=${encodeURIComponent(word)}`;
    if (typFilter && typFilter.length > 0) {
      url += `&typ=${encodeURIComponent(typFilter.join(','))}`;
    }
    if (dateFilter) {
      if (dateFilter.from) {
        url += `&date_from=${encodeURIComponent(dateFilter.from)}`;
      }
      if (dateFilter.to) {
        url += `&date_to=${encodeURIComponent(dateFilter.to)}`;
      }
    }
    const res = await fetch(url);
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
 * Fetch faction share data for a given keyword
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of {name, share, count, total}
 */
export async function fetchFraktionenShare(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/fraktionen_share?word=${encodeURIComponent(word)}`;
    if (typFilter && typFilter.length > 0) {
      url += `&typ=${encodeURIComponent(typFilter.join(','))}`;
    }
    if (dateFilter) {
      if (dateFilter.from) {
        url += `&date_from=${encodeURIComponent(dateFilter.from)}`;
      }
      if (dateFilter.to) {
        url += `&date_to=${encodeURIComponent(dateFilter.to)}`;
      }
    }
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching fraktionen share:", error);
    return [];
  }
}

/**
 * Fetch processing metrics for a given keyword
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Object>} - Object with avgDays, openCount, closedCount, totalCount, byReferat
 */
export async function fetchMetrics(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/metrics?word=${encodeURIComponent(word)}`;
    if (typFilter && typFilter.length > 0) {
      url += `&typ=${encodeURIComponent(typFilter.join(','))}`;
    }
    if (dateFilter) {
      if (dateFilter.from) {
        url += `&date_from=${encodeURIComponent(dateFilter.from)}`;
      }
      if (dateFilter.to) {
        url += `&date_to=${encodeURIComponent(dateFilter.to)}`;
      }
    }
    const res = await fetch(url);
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

/**
 * Fetch the date range of all proposals in the dataset
 * @returns {Promise<Object>} - Object with minDate and maxDate in YYYY-MM-DD format
 */
export async function fetchDateRange() {
  try {
    const res = await fetch(`/date-range`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return { minDate: null, maxDate: null };
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching date range:", error);
    return { minDate: null, maxDate: null };
  }
}

/**
 * Fetch available Typ values from the dataset
 * @returns {Promise<Array<string>>} - Array of Typ strings
 */
export async function fetchAvailableTypen() {
  try {
    const res = await fetch(`/available-typen`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching available typen:", error);
    return [];
  }
}

/**
 * Fetch expanded search terms for a given keyword
 * Shows what search terms are actually used with theme expansion
 * @param {string} word - The search keyword
 * @returns {Promise<{original: Array, expanded: Array}>} - Original and expanded terms
 */
export async function fetchExpandedSearchTerms(word) {
  try {
    let url = `/expanded-search-terms`;
    if (word) {
      url += `?word=${encodeURIComponent(word)}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return { original: [], expanded: [] };
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching expanded search terms:", error);
    return { original: [], expanded: [] };
  }
}
