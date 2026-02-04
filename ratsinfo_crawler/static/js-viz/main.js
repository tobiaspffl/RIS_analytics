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
import { renderTrendChart, renderBarChart, renderFraktionChart, renderFraktionShareChart, renderTrendShareChart, renderKPICards, renderProcessingTimeChart, renderApplicationsList } from './visualize.js';
import { fetchTrend, fetchDocuments, fetchFraktionen, fetchFraktionenShare, fetchTrendShare, fetchTrendCorrected, fetchMetrics, fetchDateRange, fetchAvailableTypen, fetchExpandedSearchTerms, fetchApplications, fetchContentCoverageYearly, APPLICATIONS_BATCH_SIZE } from './api.js';

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
  showTrendCorrected: true,
  showTrendShare: true,
  showFraktionen: true,
  showFraktionenShare: true,
  showTopDocs: false,
  showApplications: true, // Show applications list
  selectedTypen: [], // Array of selected Typ values
  dateFilter: { from: "", to: "" }, // Date range filter
  expandedTerms: { original: [], expanded: [] }, // Expanded search terms
  currentRequestId: 0, // Track current request to cancel outdated ones
  applicationsData: { data: [], total: 0, loaded: 0 } // Track applications state
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
  
  // Increment request ID to invalidate previous requests
  const requestId = ++state.currentRequestId;
  
  // Allow empty word to show all proposals
  state.currentWord = word;
  
  // Get selected typ filter (null if none or all selected)
  const typFilter = state.selectedTypen.length > 0 ? state.selectedTypen : null;
  
  // Get date filter (null if no dates selected)
  const dateFilter = (state.dateFilter.from || state.dateFilter.to) ? state.dateFilter : null;

  // Show loading state in containers
  const trendContainer = document.getElementById("viz-trend");
  const trendCorrectedContainer = document.getElementById("viz-trend-corrected");
  const trendShareContainer = document.getElementById("viz-trend-share");
  const fraktionenContainer = document.getElementById("viz-fraktionen");
  const fraktionenShareContainer = document.getElementById("viz-fraktionen-share");
  const docsContainer = document.getElementById("viz-topdocs");
  const metricsChartContainer = document.getElementById("viz-metrics-chart");
  const kpiContainer = document.getElementById("viz-kpi");

  if (trendContainer && fraktionenContainer && fraktionenShareContainer && docsContainer) {
    const loadingHTML = `<p class="loading-text loading-dots">${t('loading.data')}</p>`;
    trendContainer.innerHTML = loadingHTML;
    if (trendCorrectedContainer) trendCorrectedContainer.innerHTML = loadingHTML;
    if (trendShareContainer) trendShareContainer.innerHTML = loadingHTML;
    fraktionenContainer.innerHTML = loadingHTML;
    fraktionenShareContainer.innerHTML = loadingHTML;
    docsContainer.innerHTML = loadingHTML;
    if (metricsChartContainer) metricsChartContainer.innerHTML = loadingHTML;
    if (kpiContainer) kpiContainer.innerHTML = loadingHTML;
  }

  try {
    const promises = [];
    
    // Fetch and display expanded search terms immediately in parallel (non-blocking)
    // This updates the UI immediately without waiting for charts
    fetchExpandedSearchTerms(word).then(expandedTerms => {
      state.expandedTerms = expandedTerms;
      displayExpandedTerms();
    }).catch(err => console.error("Error loading expanded terms:", err));
    
    if (state.showTrend) {
      promises.push(fetchTrend(word, typFilter, dateFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Only fetch corrected trend when word is provided (no search data without keyword)
    if (state.showTrendCorrected && word) {
      promises.push(fetchTrendCorrected(word, typFilter, dateFilter));
    } else {
      promises.push(Promise.resolve(null));
    }

    // Only fetch trend share when word is provided (semantically makes no sense without keyword)
    if (state.showTrendShare && word) {
      promises.push(fetchTrendShare(word, typFilter, dateFilter));
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

    // Fetch applications list (initial load - just first batch)
    if (state.showApplications) {
      promises.push(fetchApplications(word, typFilter, dateFilter, 0, APPLICATIONS_BATCH_SIZE));
    } else {
      promises.push(Promise.resolve({ data: [], total: 0, offset: 0, limit: APPLICATIONS_BATCH_SIZE }));
    }

    // Fetch metrics data
    
    // Check if this request is still current (user hasn't started a new search)
    if (requestId !== state.currentRequestId) {
      console.log("Outdated request, skipping render");
      return; // Abort outdated request
    }
    
    promises.push(fetchMetrics(word, typFilter, dateFilter));

    const [trendData, trendCorrectedData, trendShareData, fraktionenData, fraktionenShareData, documentsData, applicationsData, metrics] = await Promise.all(promises);
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

    // Render corrected trend chart (bias-corrected for missing PDFs)
    if (state.showTrendCorrected && word && trendCorrectedContainer) {
      if (trendCorrectedData && trendCorrectedData.length > 0) {
        const mapped = trendCorrectedData
          .map(d => ({
            ...d,
            count: typeof d.count_corrected === "number" ? d.count_corrected : d.count
          }))
          .filter(d => typeof d.count === "number" && d.count > 0);
        const prepared = prepareTrendData(mapped).filter(d => d.count > 0);
        renderTrendChart(prepared, "#viz-trend-corrected", {
          title: t('chart.trend.corrected.title'),
          searchTerm: word,
          width: 900,
          height: 400
        });
      } else {
        trendCorrectedContainer.innerHTML = `<p>${t('error.no-data')}</p>`;
      }
    } else {
      // Hide corrected trend chart when no keyword or container missing
      if (trendCorrectedContainer) trendCorrectedContainer.innerHTML = "";
    }

    // Render trend share chart (relative percentage per month)
    if (state.showTrendShare && word) {
      if (trendShareData && trendShareData.length > 0) {
        const prepared = prepareTrendData(trendShareData, { isShare: true })
          .filter(d => typeof d.count === "number" && d.count > 0);
        renderTrendShareChart(prepared, "#viz-trend-share", {
          title: t('chart.trend.share.title'),
          searchTerm: word,
          width: 900,
          height: 400
        });
      } else {
        trendShareContainer.innerHTML = `<p>${t('error.no-data')}</p>`;
      }
    } else {
      // Hide trend share chart when no keyword
      if (trendShareContainer) trendShareContainer.innerHTML = "";
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

    // Render Applications List
    const applicationsContainer = document.querySelector("#viz-applications");
    if (applicationsContainer) {
      if (state.showApplications) {
        if (applicationsData && applicationsData.data && applicationsData.data.length > 0) {
          // Update state with initial data
          state.applicationsData = {
            data: applicationsData.data,
            total: applicationsData.total,
            loaded: applicationsData.data.length
          };
          
          renderApplicationsList(
            state.applicationsData.data, 
            "#viz-applications", 
            {
              title: t('applications.title'),
              total: state.applicationsData.total,
              loaded: state.applicationsData.loaded,
              onLoadMore: loadMoreApplications
            }
          );
        } else {
          applicationsContainer.innerHTML = `<p>${t('applications.empty')}</p>`;
        }
      } else {
        applicationsContainer.innerHTML = "";
      }
    }

    // Expanded search terms already displayed earlier (before charts loaded)

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
 * Load more applications (pagination)
 */
async function loadMoreApplications() {
  const word = searchInput.value.trim();
  const typFilter = state.selectedTypen.length > 0 ? state.selectedTypen : null;
  const dateFilter = (state.dateFilter.from || state.dateFilter.to) ? state.dateFilter : null;
  
  const offset = state.applicationsData.loaded;
  const limit = APPLICATIONS_BATCH_SIZE;
  
  // Show loading state on button
  const loadMoreBtn = document.querySelector(".load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = t('applications.loading');
  }
  
  try {
    const result = await fetchApplications(word, typFilter, dateFilter, offset, limit);
    
    if (result && result.data && result.data.length > 0) {
      // Append new data to existing
      state.applicationsData.data = [...state.applicationsData.data, ...result.data];
      state.applicationsData.loaded = state.applicationsData.data.length;
      
      // Re-render with updated data
      renderApplicationsList(
        state.applicationsData.data, 
        "#viz-applications", 
        {
          title: t('applications.title'),
          total: state.applicationsData.total,
          loaded: state.applicationsData.loaded,
          onLoadMore: loadMoreApplications
        }
      );
    }
  } catch (error) {
    console.error("Error loading more applications:", error);
    // Re-enable button on error
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = t('applications.load_more');
    }
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

// Date Range Slider State
let dateRangeData = { minDate: null, maxDate: null, allDates: [] };

// Date filter inputs - NEW: Range Slider
const dateSliderFrom = document.getElementById("dateSliderFrom");
const dateSliderTo = document.getElementById("dateSliderTo");
const sliderLabelFrom = document.getElementById("sliderDateFrom");
const sliderLabelTo = document.getElementById("sliderDateTo");
const sliderTrackActive = document.querySelector(".slider-track-active");
const sliderTrackBase = document.querySelector(".slider-track");
const sliderHintFrom = document.getElementById("sliderHintFrom");
const sliderHintTo = document.getElementById("sliderHintTo");
const clearDateBtn = document.getElementById("clearDateFilter");
const dateFilterToggle = document.getElementById("dateFilterToggle");
const dateFilterSection = document.querySelector(".date-filter-section");

// Cache for yearly content coverage
let contentCoverageByYear = null;

/**
 * Format date for display in slider labels (Month/Year only)
 */
function formatDateForDisplay(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/**
 * Update slider track position and date labels
 */
function updateSliderTrack() {
  if (!dateSliderFrom || !dateSliderTo || !sliderTrackActive) return;

  const fromValue = parseInt(dateSliderFrom.value);
  const toValue = parseInt(dateSliderTo.value);

  // Ensure from is not greater than to
  if (fromValue > toValue) {
    dateSliderFrom.value = toValue;
  } else if (toValue < fromValue) {
    dateSliderTo.value = fromValue;
  }

  const min = parseInt(dateSliderFrom.min);
  const max = parseInt(dateSliderFrom.max);

  // Calculate percentage positions
  const fromPercent = ((parseInt(dateSliderFrom.value) - min) / (max - min)) * 100;
  const toPercent = ((parseInt(dateSliderTo.value) - min) / (max - min)) * 100;

  // Update active track
  sliderTrackActive.style.left = fromPercent + "%";
  sliderTrackActive.style.right = (100 - toPercent) + "%";

  // Update date labels
  if (dateRangeData.allDates && dateRangeData.allDates.length > 0) {
    const fromDate = dateRangeData.allDates[parseInt(dateSliderFrom.value)];
    const toDate = dateRangeData.allDates[parseInt(dateSliderTo.value)];
    
    if (sliderLabelFrom) sliderLabelFrom.textContent = formatDateForDisplay(fromDate);
    if (sliderLabelTo) sliderLabelTo.textContent = formatDateForDisplay(toDate);

    // Update state
    state.dateFilter.from = fromDate;
    state.dateFilter.to = toDate;

    // Update left slider thumb color to match coverage under the handle
    if (contentCoverageByYear) {
      const fromYear = new Date(fromDate + "T00:00:00").getFullYear();
      if (Number.isFinite(fromYear) && contentCoverageByYear[fromYear] !== undefined) {
        const color = coverageToColor(contentCoverageByYear[fromYear]);
        dateSliderFrom.style.setProperty("--slider-thumb-color", color);
        dateSliderFrom.style.setProperty("--slider-thumb-shadow", rgbToRgba(color, 0.35));
      }
    }

    // Update slider coverage hints
    updateSliderHint(dateSliderFrom, sliderHintFrom, fromDate, fromPercent);
    updateSliderHint(dateSliderTo, sliderHintTo, toDate, toPercent);
  }
}

function getCoverageCategory(coverage) {
  const v = Math.max(0, Math.min(1, coverage));
  if (v < 0.1) return t('slider.coverage.none');
  if (v < 0.3) return t('slider.coverage.very_low');
  if (v < 0.5) return t('slider.coverage.low');
  if (v < 0.7) return t('slider.coverage.medium');
  if (v < 0.9) return t('slider.coverage.high');
  return t('slider.coverage.very_high');
}

function updateSliderHint(sliderEl, hintEl, dateStr, percent) {
  if (!sliderEl || !hintEl || !contentCoverageByYear || !dateStr) return;
  const year = new Date(dateStr + "T00:00:00").getFullYear();
  const coverage = contentCoverageByYear[year];
  if (coverage === undefined) return;

  const label = getCoverageCategory(coverage);
  const pct = Math.round(coverage * 100);
  hintEl.textContent = `${t('slider.coverage.label')}: ${pct}% · ${label}`;
  hintEl.style.left = `${percent}%`;
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(hex1, hex2, t) {
  const c1 = hex1.replace('#', '');
  const c2 = hex2.replace('#', '');
  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);
  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

function rgbToRgba(rgb, alpha) {
  const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(rgb);
  if (!match) return `rgba(37, 99, 235, ${alpha})`;
  const [, r, g, b] = match;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Map coverage (0-1) to a smooth red->blue color
 */
function coverageToColor(coverage) {
  const clamped = Math.max(0, Math.min(1, coverage));
  const eased = Math.pow(clamped, 0.7); // soften the transition
  return interpolateColor("#ef4444", "#3b82f6", eased);
}

/**
 * Build a smooth gradient based on yearly coverage
 */
function buildCoverageGradient() {
  if (!contentCoverageByYear || !dateRangeData.allDates || dateRangeData.allDates.length < 2) return null;

  const yearBounds = new Map();
  dateRangeData.allDates.forEach((dateStr, idx) => {
    const year = new Date(dateStr + "T00:00:00").getFullYear();
    if (!yearBounds.has(year)) {
      yearBounds.set(year, { start: idx, end: idx });
    } else {
      yearBounds.get(year).end = idx;
    }
  });

  const years = Object.keys(contentCoverageByYear)
    .map(Number)
    .filter(year => yearBounds.has(year))
    .sort((a, b) => a - b);

  if (years.length === 0) return null;

  const totalSteps = dateRangeData.allDates.length - 1;
  const stops = [];

  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  stops.push(`${coverageToColor(contentCoverageByYear[firstYear])} 0%`);

  years.forEach(year => {
    const bounds = yearBounds.get(year);
    const mid = (bounds.start + bounds.end) / 2;
    const percent = (mid / totalSteps) * 100;
    const color = coverageToColor(contentCoverageByYear[year]);
    stops.push(`${color} ${percent.toFixed(2)}%`);
  });

  stops.push(`${coverageToColor(contentCoverageByYear[lastYear])} 100%`);

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

/**
 * Apply coverage gradient to the date slider
 */
async function applyCoverageGradient() {
  if (!sliderTrackBase || !sliderTrackActive) return;

  try {
    const coverageData = await fetchContentCoverageYearly();
    if (!coverageData || coverageData.length === 0) return;

    contentCoverageByYear = coverageData.reduce((acc, row) => {
      acc[row.year] = typeof row.coverage === "number" ? row.coverage : 0;
      return acc;
    }, {});

    const gradient = buildCoverageGradient();
    if (gradient) {
      sliderTrackBase.style.background = gradient;
      sliderTrackActive.style.display = "none";
    }

    // Ensure thumb color is set on initial load
    updateSliderTrack();
  } catch (error) {
    console.error("Error applying coverage gradient:", error);
  }
}

/**
 * Initialize date range slider with actual dates
 */
async function initDateRangeSlider() {
  const dateRange = await fetchDateRange();
  
  if (!dateRange.minDate || !dateRange.maxDate) {
    console.warn("Could not fetch date range");
    return;
  }

  dateRangeData.minDate = dateRange.minDate;
  dateRangeData.maxDate = dateRange.maxDate;

  // Generate array of all dates between min and max (monthly steps for simplicity)
  const dates = [];
  const current = new Date(dateRange.minDate + "T00:00:00");
  const max = new Date(dateRange.maxDate + "T00:00:00");

  while (current <= max) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  dateRangeData.allDates = dates;

  // Set slider ranges
  if (dateSliderFrom) {
    dateSliderFrom.max = dates.length - 1;
    dateSliderFrom.value = 0;
  }
  if (dateSliderTo) {
    dateSliderTo.max = dates.length - 1;
    dateSliderTo.value = dates.length - 1;
  }

  // Initial update
  updateSliderTrack();
  applyCoverageGradient();

  // Add event listeners - input for visual feedback, pointerup/mouseup for data refresh
  if (dateSliderFrom) {
    dateSliderFrom.addEventListener("input", () => {
      updateSliderTrack(); // Update visuals only (labels, track position)
      if (sliderHintFrom) sliderHintFrom.style.display = "block";
    });
    
    dateSliderFrom.addEventListener("pointerup", () => {
      refresh(); // Refresh data when user releases the slider
      if (sliderHintFrom) sliderHintFrom.style.display = "none";
    });
    dateSliderFrom.addEventListener("mouseup", () => {
      refresh(); // Fallback for older browsers
      if (sliderHintFrom) sliderHintFrom.style.display = "none";
    });
  }

  if (dateSliderTo) {
    dateSliderTo.addEventListener("input", () => {
      updateSliderTrack(); // Update visuals only (labels, track position)
      if (sliderHintTo) sliderHintTo.style.display = "block";
    });
    
    dateSliderTo.addEventListener("pointerup", () => {
      refresh(); // Refresh data when user releases the slider
      if (sliderHintTo) sliderHintTo.style.display = "none";
    });
    dateSliderTo.addEventListener("mouseup", () => {
      refresh(); // Fallback for older browsers
      if (sliderHintTo) sliderHintTo.style.display = "none";
    });
  }
}

if (clearDateBtn) {
  clearDateBtn.addEventListener("click", () => {
    state.dateFilter = { from: "", to: "" };
    
    // Reset sliders to full range
    if (dateSliderFrom && dateSliderTo && dateRangeData.allDates.length > 0) {
      dateSliderFrom.value = 0;
      dateSliderTo.value = dateRangeData.allDates.length - 1;
    }
    
    updateSliderTrack();
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
  initDateRangeSlider(); // Initialize the date range slider
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
    updateSliderTrack(); // Update slider labels with new language
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