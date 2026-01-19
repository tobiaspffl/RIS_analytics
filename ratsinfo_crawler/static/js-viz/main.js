/**
 * main.js - Main Application Logic
 * 
 * Handles:
 * - Event listeners (search input, example buttons, toggles)
 * - Data fetching and transformation
 * - Visualization rendering
 * - App state management
 */

import { prepareTrendData, getTopDocuments } from "./transforms.js";
import { renderTrendChart, renderBarChart, renderFraktionChart, renderFraktionShareChart, renderKPICards, renderProcessingTimeChart } from './visualize.js';
import { fetchTrend, fetchDocuments, fetchFraktionen, fetchFraktionenShare, fetchMetrics, fetchDateRange, fetchAvailableTypen } from './api.js';

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
  selectedTypen: [] // Array of selected Typ values
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

  // Show loading state in containers
  const trendContainer = document.getElementById("viz-trend");
  const fraktionenContainer = document.getElementById("viz-fraktionen");
  const fraktionenShareContainer = document.getElementById("viz-fraktionen-share");
  const docsContainer = document.getElementById("viz-topdocs");

  if (trendContainer && fraktionenContainer && fraktionenShareContainer && docsContainer) {
    trendContainer.innerHTML = "<p>Loading data...</p>";
    fraktionenContainer.innerHTML = "";
    fraktionenShareContainer.innerHTML = "";
    docsContainer.innerHTML = "";
  }

  try {
    const promises = [];
    
    if (state.showTrend) {
      promises.push(fetchTrend(word, typFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showFraktionen) {
      promises.push(fetchFraktionen(word, typFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Only fetch share when word is provided (semantically makes no sense without keyword)
    if (state.showFraktionenShare && word) {
      promises.push(fetchFraktionenShare(word, typFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showTopDocs) {
      promises.push(fetchDocuments(word));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Fetch metrics data
    promises.push(fetchMetrics(word, typFilter));

    const [trendData, fraktionenData, fraktionenShareData, documentsData, metrics] = await Promise.all(promises);
    // Containers sind bereits oben initialisiert

    // Render trend chart
    if (state.showTrend) {
      if (trendData && trendData.length > 0) {
        const prepared = prepareTrendData(trendData);
        renderTrendChart(prepared, "#viz-trend", {
          title: word ? `Anträge pro Monat` : `Alle Anträge pro Monat`,
          searchTerm: word,
          width: 900,
          height: 400
        });
      } else {
        trendContainer.innerHTML = "<p>No trend data available</p>";
      }
    } else {
      trendContainer.innerHTML = "";
    }

    // Render fraktionen chart
    if (state.showFraktionen) {
      if (fraktionenData && fraktionenData.length > 0) {
        renderFraktionChart(fraktionenData, "#viz-fraktionen", {
          title: word ? `Fraktionsbeteiligung` : `Fraktionsbeteiligung (alle Anträge)`,
          searchTerm: word,
          width: 900,
          height: 400,
          limit: 15
        });
      } else {
        fraktionenContainer.innerHTML = "<p>No faction data available</p>";
      }
    } else {
      fraktionenContainer.innerHTML = "";
    }

    // Render fraktionen share chart
    if (state.showFraktionenShare && word) {
      // Only show share when keyword is provided
      if (fraktionenShareData && fraktionenShareData.length > 0) {
        renderFraktionShareChart(fraktionenShareData, "#viz-fraktionen-share", {
          title: `Anteil thematisierte Anträge`,
          searchTerm: word,
          width: 900,
          height: 400,
          limit: 15
        });
      } else {
        fraktionenShareContainer.innerHTML = "<p>No faction share data available</p>";
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
            title: `Top 20 Dokumente`,
            searchTerm: word,
            width: 900,
            height: 400,
            limit: 20
          });
        } else {
          docsContainer.innerHTML = "<p>No documents found</p>";
        }
      } else {
        docsContainer.innerHTML = "<p>No document data available</p>";
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
        kpiContainer.innerHTML = "<p>Keine Metriken verfügbar</p>";
      }
    }

    // Render Processing Time Chart
    const metricsChartContainer = document.querySelector("#viz-metrics-chart");
    if (metricsChartContainer) {
      if (metrics && metrics.byReferat && metrics.byReferat.length > 0) {
        renderProcessingTimeChart(metrics.byReferat, "#viz-metrics-chart", { 
          searchTerm: word,
          limit: 10,
          title: word ? "Bearbeitungsdauer nach Referat" : "Bearbeitungsdauer nach Referat (alle Anträge)"
        });
      } else {
        metricsChartContainer.innerHTML = "<p>Keine Daten für Referate verfügbar</p>";
      }
    }

  } catch (error) {
    console.error("Error during refresh:", error);
    const trendContainer = document.getElementById("viz-trend");
    const fraktionenContainer = document.getElementById("viz-fraktionen");
    const docsContainer = document.getElementById("viz-topdocs");
    if (trendContainer) trendContainer.innerHTML = "<p>Error loading data. Check console for details.</p>";
    if (fraktionenContainer) fraktionenContainer.innerHTML = "";
    if (docsContainer) docsContainer.innerHTML = "";
  }
}

/**
 * Event Listeners
 */

// Search button click
searchBtn.addEventListener("click", refresh);

// Enter key in search input
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    refresh();
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
  initTrendContainer.innerHTML = "<p>Loading initial data...</p>";
}

// Load all proposals on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDateRange();
  // Trigger refresh with empty search to show all proposals
  refresh();
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
    
    // Format in German locale
    const formatter = new Intl.DateTimeFormat('de-DE', {
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
      const minWithoutYear = new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long'
      }).format(minDate);
      displayText = `Anträge im Zeitraum von ${minWithoutYear} bis ${maxFormatted}`;
    } else {
      // Different years: "25. Januar 2025 bis 01. März 2026"
      displayText = `Anträge im Zeitraum von ${minFormatted} bis ${maxFormatted}`;
    }
    
    dateRangeDisplay.textContent = displayText;
  } else {
    dateRangeDisplay.textContent = "Datumbereich konnte nicht ermittelt werden";
  }
}

// Load date range when page is ready
document.addEventListener("DOMContentLoaded", loadDateRange);

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
    span.textContent = typ;
    
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