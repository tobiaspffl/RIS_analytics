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
import { renderTrendChart, renderBarChart, renderFraktionChart, renderKPICards, renderProcessingTimeChart } from './visualize.js';
import { fetchTrend, fetchDocuments, fetchFraktionen, fetchMetrics } from './api.js';

// Application state
const state = {
  currentWord: "",
  showTrend: true,
  showFraktionen: true,
  showTopDocs: false
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
  
  if (!word) {
    // Do not destroy containers; show message inside trend container
    const trendContainer = document.getElementById("viz-trend");
    const fraktionenContainer = document.getElementById("viz-fraktionen");
    const docsContainer = document.getElementById("viz-topdocs");
    if (trendContainer) trendContainer.innerHTML = "<p>Please enter a search term</p>";
    if (fraktionenContainer) fraktionenContainer.innerHTML = "";
    if (docsContainer) docsContainer.innerHTML = "";
    return;
  }

  state.currentWord = word;

  // Show loading state in containers
  const trendContainer = document.getElementById("viz-trend");
  const fraktionenContainer = document.getElementById("viz-fraktionen");
  const docsContainer = document.getElementById("viz-topdocs");

  if (trendContainer && fraktionenContainer && docsContainer) {
    trendContainer.innerHTML = "<p>Loading data...</p>";
    fraktionenContainer.innerHTML = "";
    docsContainer.innerHTML = "";
  }

  try {
    const promises = [];
    
    if (state.showTrend) {
      promises.push(fetchTrend(word));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showFraktionen) {
      promises.push(fetchFraktionen(word));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (state.showTopDocs) {
      promises.push(fetchDocuments(word));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Fetch metrics data
    promises.push(fetchMetrics(word));

    const [trendData, fraktionenData, documentsData, metrics] = await Promise.all(promises);
    // Containers sind bereits oben initialisiert

    // Render trend chart
    if (state.showTrend) {
      if (trendData && trendData.length > 0) {
        const prepared = prepareTrendData(trendData);
        renderTrendChart(prepared, "#viz-trend", {
          title: `Anträge pro Monat`,
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
          title: `Fraktionsbeteiligung`,
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
          limit: 10 
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
    searchInput.value = keyword;
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

// Initialize - show info on load (without removing containers)
const initTrendContainer = document.getElementById("viz-trend");
if (initTrendContainer) {
  initTrendContainer.innerHTML = "<p>Enter a keyword to begin searching and visualizing the data.</p>";
}