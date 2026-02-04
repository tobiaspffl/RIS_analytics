/**
 * api.js - API Calls to Flask Backend
 * 
 * Provides functions to fetch data from Flask endpoints
 * All functions return promises that resolve to JSON data
 */

// Configuration: Number of applications to load per batch
export const APPLICATIONS_BATCH_SIZE = 18;

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
 * Fetch monthly trend share data (percentage of proposals per month)
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of {month, share, count, total} objects
 */
export async function fetchTrendShare(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/trend_share?word=${encodeURIComponent(word)}`;
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
    console.error("Error fetching trend share:", error);
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
 * Fetch yearly content coverage (share of proposals with content)
 * @returns {Promise<Array>} - Array of {year, coverage, with_content, total}
 */
export async function fetchContentCoverageYearly() {
  try {
    const res = await fetch(`/content-coverage-yearly`);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching content coverage:", error);
    return [];
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

/**
 * Fetch filtered applications/proposals
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of application objects
 */
export async function fetchApplications(word, typFilter = null, dateFilter = null, offset = 0, limit = APPLICATIONS_BATCH_SIZE) {
  try {
    let url = `/get_applications`;
    const params = [];
    
    if (word) {
      params.push(`word=${encodeURIComponent(word)}`);
    }
    if (typFilter && typFilter.length > 0) {
      params.push(`typ=${encodeURIComponent(typFilter.join(','))}`);
    }
    if (dateFilter) {
      if (dateFilter.from) {
        params.push(`date_from=${encodeURIComponent(dateFilter.from)}`);
      }
      if (dateFilter.to) {
        params.push(`date_to=${encodeURIComponent(dateFilter.to)}`);
      }
    }
    
    params.push(`offset=${offset}`);
    params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return { data: [], total: 0, offset: 0, limit: 20 };
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { data: [], total: 0, offset: 0, limit: 20 };
  }
}

/**
 * Fetch PDF availability by month (cached on backend)
 * @returns {Promise<Array>} - Array of {month, pdf_availability} objects
 */
export async function fetchPdfAvailability() {
  try {
    const res = await fetch('/pdf_availability');
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching PDF availability:", error);
    return [];
  }
}

/**
 * Fetch bias-corrected monthly trend data
 * @param {string} word - The keyword to search for
 * @param {Array<string>} typFilter - Array of Typ values to filter by (optional)
 * @param {Object} dateFilter - Object with "from" and/or "to" keys in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - Array of {month, count, count_corrected, pdf_availability} objects
 */
export async function fetchTrendCorrected(word, typFilter = null, dateFilter = null) {
  try {
    let url = `/trend_corrected?word=${encodeURIComponent(word)}`;
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
    console.error("Error fetching corrected trend:", error);
    return [];
  }
}
