/**
 * main.js - Main Application Logic
 * 
 * Handles:
 * - Event listeners (search input, example buttons, toggles)
 * - Data fetching and transformation
 * - Visualization rendering
 * - App state management
 */

import { t, getCurrentLang } from '../i18n.js';
import { prepareTrendData, getTopDocuments } from "./transforms.js";
import { renderTrendChart, renderBarChart, renderFraktionChart, renderFraktionShareChart, renderKPICards, renderProcessingTimeChart } from './visualize.js';
import { fetchTrend, fetchDocuments, fetchFraktionen, fetchFraktionenShare, fetchMetrics, fetchDateRange, fetchAvailableTypen, fetchExpandedSearchTerms } from './api.js';

/**
 * Helper function to capitalize first letter of a word
 */
function capitalizeFirstLetter(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Application state
const state = {
  currentWord: "",
  showTrend: true,
  showFraktionen: true,
  showFraktionenShare: true,
  showTopDocs: false,
  selectedTypen: [], // Array of selected Typ values
  dateFilter: { from: "", to: "" }, // Date range filter
  expandedTerms: { original: [], expanded: [] } // Expanded search terms
};

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const exampleBtns = document.querySelectorAll(".example-btn");
const visualization = document.getElementById("visualization");

/**
 * Main refresh function - fetches and renders visualizations based on state
 */
async function refresh() {
  const word = searchInput.value.trim();
  
  // Allow empty word to show all proposals
  state.currentWord = word;
  
  // Get selected typ filter (null if none or all selected)
  const typFilter = state.selectedTypen.length > 0 ? state.selectedTypen : null;
  
  // Get date filter (null if no dates selected)
  const dateFilter = (state.dateFilter.from || state.dateFilter.to) ? state.dateFilter : null;

  // Show loading state in containers
  const trendContainer = document.getElementById("viz-trend");
  const fraktionenContainer = document.getElementById("viz-fraktionen");
  const fraktionenShareContainer = document.getElementById("viz-fraktionen-share");
  const docsContainer = document.getElementById("viz-topdocs");
  const metricsChartContainer = document.getElementById("viz-metrics-chart");
  const kpiContainer = document.getElementById("viz-kpi");

  if (trendContainer && fraktionenContainer && fraktionenShareContainer && docsContainer) {
    const loadingHTML = `<p class="loading-text loading-dots">${t('loading.data')}</p>`;
    trendContainer.innerHTML = loadingHTML;
    fraktionenContainer.innerHTML = loadingHTML;
    fraktionenShareContainer.innerHTML = loadingHTML;
    docsContainer.innerHTML = loadingHTML;
    if (metricsChartContainer) metricsChartContainer.innerHTML = loadingHTML;
    if (kpiContainer) kpiContainer.innerHTML = loadingHTML;
  }

  try {
    const promises = [];
    
    // Fetch expanded search terms
    const expandedTerms = await fetchExpandedSearchTerms(word);
    state.expandedTerms = expandedTerms;
    
    if (state.showTrend) {
      promises.push(fetchTrend(word, typFilter, dateFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showFraktionen) {
      promises.push(fetchFraktionen(word, typFilter, dateFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Only fetch share when word is provided (semantically makes no sense without keyword)
    if (state.showFraktionenShare && word) {
      promises.push(fetchFraktionenShare(word, typFilter, dateFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showTopDocs) {
      promises.push(fetchDocuments(word));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Fetch metrics data
    promises.push(fetchMetrics(word, typFilter, dateFilter));

    const [trendData, fraktionenData, fraktionenShareData, documentsData, metrics] = await Promise.all(promises);
    // Containers sind bereits oben initialisiert

    // Render trend chart
    if (state.showTrend) {
      if (trendData && trendData.length > 0) {
        const prepared = prepareTrendData(trendData);
        renderTrendChart(prepared, "#viz-trend", {
          title: word ? t('chart.trend.title') : t('chart.trend.title.all'),
          searchTerm: word,
          width: 900,
          height: 400
        });
      } else {
        trendContainer.innerHTML = `<p>${t('error.no-trend')}</p>`;
      }
    } else {
      trendContainer.innerHTML = "";
    }

    // Render fraktionen chart
    if (state.showFraktionen) {
      if (fraktionenData && fraktionenData.length > 0) {
        renderFraktionChart(fraktionenData, "#viz-fraktionen", {
          title: word ? t('chart.fraktionen.title') : t('chart.fraktionen.title.all'),
          searchTerm: word,
          width: 900,
          height: 400,
          limit: 15
        });
      } else {
        fraktionenContainer.innerHTML = `<p>${t('error.no-faction')}</p>`;
      }
    } else {
      fraktionenContainer.innerHTML = "";
    }

    // Render fraktionen share chart
    if (state.showFraktionenShare && word) {
      // Only show share when keyword is provided
      if (fraktionenShareData && fraktionenShareData.length > 0) {
        renderFraktionShareChart(fraktionenShareData, "#viz-fraktionen-share", {
          title: t('chart.share.title'),
          searchTerm: word,
          width: 900,
          height: 400,
          limit: 15
        });
      } else {
        fraktionenShareContainer.innerHTML = `<p>${t('error.no-faction-share')}</p>`;
      }
    } else {
      // Hide share chart when no keyword
      fraktionenShareContainer.innerHTML = "";
    }

    // Render top documents chart
    if (state.showTopDocs) {
      if (documentsData && documentsData.length > 0) {
        const topDocs = getTopDocuments(documentsData, 20);
        if (topDocs.length > 0) {
          renderBarChart(topDocs, "#viz-topdocs", {
            title: t('chart.topdocs.title'),
            searchTerm: word,
            width: 900,
            height: 400,
            limit: 20
          });
        } else {
          docsContainer.innerHTML = `<p>${t('error.no-documents')}</p>`;
        }
      } else {
        docsContainer.innerHTML = `<p>${t('error.no-documents')}</p>`;
      }
    } else {
      docsContainer.innerHTML = "";
    }

    // Render KPI Cards
    const kpiContainer = document.querySelector("#viz-kpi");
    if (kpiContainer) {
      if (metrics) {
        renderKPICards(metrics, "#viz-kpi", { searchTerm: word });
      } else {
        kpiContainer.innerHTML = `<p>${t('error.no-metrics')}</p>`;
      }
    }

    // Render Processing Time Chart
    const metricsChartContainer = document.querySelector("#viz-metrics-chart");
    if (metricsChartContainer) {
      if (metrics && metrics.byReferat && metrics.byReferat.length > 0) {
        renderProcessingTimeChart(metrics.byReferat, "#viz-metrics-chart", { 
          searchTerm: word,
          limit: 10,
          title: word ? t('chart.metrics.title') : t('chart.metrics.title.all')
        });
      } else {
        metricsChartContainer.innerHTML = `<p>${t('error.no-referate')}</p>`;
      }
    }

    // Display expanded search terms
    displayExpandedTerms();

  } catch (error) {
    console.error("Error during refresh:", error);
    const trendContainer = document.getElementById("viz-trend");
    const fraktionenContainer = document.getElementById("viz-fraktionen");
    const docsContainer = document.getElementById("viz-topdocs");
    const metricsChartContainer = document.getElementById("viz-metrics-chart");
    const kpiContainer = document.getElementById("viz-kpi");
    if (trendContainer) trendContainer.innerHTML = `<p>${t('error.loading')}</p>`;
    if (fraktionenContainer) fraktionenContainer.innerHTML = "";
    if (docsContainer) docsContainer.innerHTML = "";
    if (metricsChartContainer) metricsChartContainer.innerHTML = "";
    if (kpiContainer) kpiContainer.innerHTML = "";
  }
}

/**
 * Display expanded search terms under the search bar
 * Shows which terms are actually used when theme expansion is applied
 */
function displayExpandedTerms() {
  const container = document.getElementById("expanded-terms-display");
  if (!container) return;

  const { original, expanded } = state.expandedTerms;

  // Only show if there's a search term and it expanded
  if (!original || original.length === 0 || (expanded && expanded.length === original.length)) {
    container.innerHTML = "";
    return;
  }

  // Format the expanded terms as a comma-separated list
  const expandedStr = expanded.map(term => `"${term}"`).join(", ");
  
  const html = `
    <div class="expanded-terms-info">
      <p>${t('search.expanded.label')}</p>
      <p class="expanded-terms-list">${expandedStr}</p>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Event Listeners
 */

// Search button click
searchBtn.addEventListener("click", () => {
  refresh();
  // Scroll to visualization section after a short delay to ensure rendering
  setTimeout(() => {
    visualization.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
});

// Enter key in search input
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    refresh();
    // Scroll to visualization section after a short delay to ensure rendering
    setTimeout(() => {
      visualization.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
});

// Example button clicks
exampleBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const keyword = e.target.getAttribute("data-keyword");
    searchInput.value = capitalizeFirstLetter(keyword);
    refresh();
  });
});

// Date filter inputs
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const clearDateBtn = document.getElementById("clearDateFilter");
const dateFilterToggle = document.getElementById("dateFilterToggle");
const dateFilterSection = document.querySelector(".date-filter-section");

if (dateFrom) {
  // Use 'blur' instead of 'change' to avoid triggering on every keystroke during manual entry
  dateFrom.addEventListener("blur", () => {
    state.dateFilter.from = dateFrom.value;
    refresh();
  });
  // Also trigger on Enter key
  dateFrom.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      state.dateFilter.from = dateFrom.value;
      refresh();
    }
  });
}

if (dateTo) {
  // Use 'blur' instead of 'change' to avoid triggering on every keystroke during manual entry
  dateTo.addEventListener("blur", () => {
    state.dateFilter.to = dateTo.value;
    refresh();
  });
  // Also trigger on Enter key
  dateTo.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      state.dateFilter.to = dateTo.value;
      refresh();
    }
  });
}

if (clearDateBtn) {
  clearDateBtn.addEventListener("click", () => {
    state.dateFilter = { from: "", to: "" };
    dateFrom.value = "";
    dateTo.value = "";
    refresh();
  });
}

if (dateFilterToggle && dateFilterSection) {
  dateFilterToggle.addEventListener("click", () => {
    dateFilterSection.classList.toggle("collapsed");
  });
}


/**
 * Optional: Toggle functionality for visualizations
 * Uncomment and add toggle buttons to index.html if desired
 */
/*
document.getElementById("toggle-trend")?.addEventListener("change", (e) => {
  state.showTrend = e.target.checked;
  if (state.currentWord) refresh();
});

document.getElementById("toggle-topdocs")?.addEventListener("change", (e) => {
  state.showTopDocs = e.target.checked;
  if (state.currentWord) refresh();
});
*/

// Initialize - load all proposals data on page load
const initTrendContainer = document.getElementById("viz-trend");
if (initTrendContainer) {
  initTrendContainer.innerHTML = `<p>${t('loading.initial')}</p>`;
}

// Load all proposals on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDateRange();
  // Trigger refresh with empty search to show all proposals
  refresh();
});

// Re-render charts when language changes
document.addEventListener("languageChanged", () => {
  // Re-run refresh to update all chart labels and texts
  if (state.currentWord !== undefined) {
    refresh();
    loadDateRange(); // Also update date range text
    updateTypFilterLabels(); // Update Typ filter labels
    displayExpandedTerms();
  }
});

/**
 * Load and display date range on page load
 */
async function loadDateRange() {
  const dateRangeDisplay = document.getElementById("date-range-display");
  if (!dateRangeDisplay) return;

  const dateRange = await fetchDateRange();
  
  if (dateRange.minDate && dateRange.maxDate) {
    // Parse dates
    const minDate = new Date(dateRange.minDate + "T00:00:00");
    const maxDate = new Date(dateRange.maxDate + "T00:00:00");
    
    // Format based on current language
    const lang = getCurrentLang();
    const locale = lang === 'en' ? 'en-US' : 'de-DE';
    const formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const minFormatted = formatter.format(minDate);
    const maxFormatted = formatter.format(maxDate);
    
    // Check if same year
    const sameYear = minDate.getFullYear() === maxDate.getFullYear();
    
    let displayText;
    if (sameYear) {
      // Same year: "25. Januar bis 01. März 2025"
      const minWithoutYear = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long'
      }).format(minDate);
      displayText = `${t('daterange.prefix')} ${minWithoutYear} ${t('daterange.to')} ${maxFormatted}`;
    } else {
      // Different years: "25. Januar 2025 bis 01. März 2026"
      displayText = `${t('daterange.prefix')} ${minFormatted} ${t('daterange.to')} ${maxFormatted}`;
    }
    
    dateRangeDisplay.textContent = displayText;
  } else {
    dateRangeDisplay.textContent = "Datumbereich konnte nicht ermittelt werden";
  }
}

// Load date range when page is ready
document.addEventListener("DOMContentLoaded", loadDateRange);

/**
 * Reload Typ filter labels when language changes
 */
function updateTypFilterLabels() {
  const labels = document.querySelectorAll('.typ-checkbox-label span[data-i18n]');
  labels.forEach(label => {
    const key = label.getAttribute('data-i18n');
    label.textContent = t(key);
  });
}

/**
 * Load and initialize Typ filter checkboxes
 */
async function loadTypFilter() {
  const container = document.getElementById("typ-filter-checkboxes");
  if (!container) return;

  const typen = await fetchAvailableTypen();
  
  if (typen.length === 0) {
    container.innerHTML = "<p style='color: #999;'>Keine Typen verfügbar</p>";
    return;
  }

  // Clear loading indicator
  container.innerHTML = "";

  // Create checkbox for each typ
  typen.forEach(typ => {
    const label = document.createElement("label");
    label.className = "typ-checkbox-label";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = typ;
    checkbox.className = "typ-checkbox";
    checkbox.checked = false; // Start with all unchecked (= show all)
    
    checkbox.addEventListener("change", () => {
      updateTypFilter();
    });
    
    const span = document.createElement("span");
    // Remove "typ. " prefix if present in the data
    const cleanTyp = typ.replace(/^typ\.\s*/i, "");
    // Try to translate the cleaned typ name
    const translationKey = `typ.${cleanTyp}`;
    span.textContent = t(translationKey);
    span.setAttribute('data-i18n', translationKey);
    
    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });

  // Add event listeners for control buttons
  const selectAllBtn = document.getElementById("selectAllTypBtn");
  const clearAllBtn = document.getElementById("clearAllTypBtn");
  
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".typ-checkbox");
      checkboxes.forEach(cb => cb.checked = true);
      updateTypFilter();
    });
  }
  
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".typ-checkbox");
      checkboxes.forEach(cb => cb.checked = false);
      updateTypFilter();
    });
  }
}

/**
 * Update state.selectedTypen based on checked checkboxes and refresh
 */
function updateTypFilter() {
  const checkboxes = document.querySelectorAll(".typ-checkbox");
  const selected = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  
  state.selectedTypen = selected;
  refresh();
}

// Initialize typ filter when page loads
document.addEventListener("DOMContentLoaded", loadTypFilter);

/**
 * Toggle Typ Filter visibility
 */
function initTypFilterToggle() {
  const toggleBtn = document.getElementById("typFilterToggle");
  const filterSection = document.querySelector(".typ-filter-section");
  
  if (toggleBtn && filterSection) {
    toggleBtn.addEventListener("click", () => {
      filterSection.classList.toggle("collapsed");
    });
  }
}

// Initialize toggle functionality
document.addEventListener("DOMContentLoaded", initTypFilterToggle);

/**
 * Initialize date filter with min/max constraints based on dataset date range
 */
async function initDateFilter() {
  const dateRange = await fetchDateRange();
  
  if (dateRange.minDate && dateRange.maxDate) {
    const dateFromInput = document.getElementById("dateFrom");
    const dateToInput = document.getElementById("dateTo");
    
    if (dateFromInput) {
      dateFromInput.setAttribute("min", dateRange.minDate);
      dateFromInput.setAttribute("max", dateRange.maxDate);
    }
    
    if (dateToInput) {
      dateToInput.setAttribute("min", dateRange.minDate);
      dateToInput.setAttribute("max", dateRange.maxDate);
    }
  }
}

// Initialize date filter when page loads
document.addEventListener("DOMContentLoaded", initDateFilter);