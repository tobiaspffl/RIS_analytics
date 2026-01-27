/**
 * visualize.js - D3 Visualization Functions
 * 
 * Functions to render D3 charts. Each function:
 * - Takes prepared data and a selector
 * - Clears the container and renders a chart
 * - Accepts optional configuration
 */

import { t, getCurrentLang } from '../i18n.js';

/**
 * Global color mapping for factions/parties
 * Ensures consistent colors across all charts
 */
const fraktionColorMap = new Map();
// Extended color palette - each color used only once, no duplicates
const colorPalette = [
  '#1a9850', '#d73027', '#f46d43', '#fdae61', '#a6d96a',
  '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854',
  '#e6194b', '#3cb44b', '#ffe119', '#f58231', '#fabebe', 
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#9467bd',
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#8c564b',
];

/**
 * Get or assign a color for a faction
 * Each color from palette is used exactly once, cycling through if needed
 */
function getFraktionColor(fraktionName) {
  if (!fraktionColorMap.has(fraktionName)) {
    // Assign next available color from palette
    const colorIndex = fraktionColorMap.size % colorPalette.length;
    fraktionColorMap.set(fraktionName, colorPalette[colorIndex]);
  }
  return fraktionColorMap.get(fraktionName);
}

/**
 * Helper function to capitalize first letter of a word
 */
function capitalizeFirstLetter(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Helper function to translate Typ values
 * @param {string} typ - The typ value (e.g., "Antrag", "Anfrage")
 * @returns {string} Translated typ or original if no translation exists
 */
function translateTyp(typ) {
  const key = `typ.${typ}`;
  const translation = t(key);
  // If translation key is returned as-is, use original typ
  return translation === key ? typ : translation;
}

/**
 * Add a small info badge (top-right) that links to the methodology page
 * @param {HTMLElement} container - Chart container
 * @param {string} href - Target URL
 * @param {string} title - Tooltip/aria label
 */
function addInfoBadge(container, href = "/methodik#zaehlregeln", title) {
  if (!container) return;
  // Keep layout intact; only set position if not already defined
  if (!container.style.position) {
    container.style.position = "relative";
  }

  // Remove existing badge to avoid duplicates on re-render
  const existing = container.querySelector(".info-badge");
  if (existing) existing.remove();

  const badge = document.createElement("a");
  badge.className = "info-badge";
  badge.href = href;
  const label = title || t('badge.methodology');
  badge.title = label;
  badge.setAttribute("aria-label", label);
  badge.textContent = "i";
  badge.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 22px;
    height: 22px;
    border-radius: 9999px;
    border: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    background: #f8fafc;
    text-decoration: none;
    z-index: 5;
  `;
  badge.onmouseenter = () => { badge.style.background = "#e2e8f0"; };
  badge.onmouseleave = () => { badge.style.background = "#f8fafc"; };

  container.appendChild(badge);
}

/**
 * Render a line chart for monthly trend data
 * @param {Array} trendData - Array of {month, count, date} objects (use prepareTrendData)
 * @param {string} selector - CSS selector for container (e.g., "#viz-trend")
 * @param {Object} options - Configuration object
 * @param {string} options.title - Chart title
 * @param {number} options.width - Chart width in pixels
 * @param {number} options.height - Chart height in pixels
 * @param {string} options.searchTerm - The search term (for title)
 */
export function renderTrendChart(trendData, selector, options = {}) {
  const {
    title = t('chart.trend.title'),
    width = 900,
    height = 400,
    searchTerm = ""
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  // Clear previous content
  container.innerHTML = "";

  if (!trendData || trendData.length === 0) {
    container.innerHTML = `<p style='text-align:center; padding:40px; color:#666;'>${t('error.no-data')}</p>`;
    addInfoBadge(container);
    return;
  }

  addInfoBadge(container);

  // Margins
  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  // Create group for chart
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(trendData, d => d.date))
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(trendData, d => d.count)])
    .nice()
    .range([chartHeight, 0]);

  // Line generator
  const line = d3
    .line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.count));

  // Area generator (for fill under line)
  const area = d3
    .area()
    .x(d => xScale(d.date))
    .y0(chartHeight)
    .y1(d => yScale(d.count));

  // Add grid lines for Y-Axis (horizontal)
  g.append("g")
    .attr("class", "grid")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-dasharray", "4")
    .attr("opacity", 0.7)
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat("")
    )
    .select(".domain")
    .remove();

  // Add area fill (semi-transparent)
  g.append("path")
    .datum(trendData)
    .attr("fill", "url(#gradient)")
    .attr("d", area)
    .attr("opacity", 0.3);

  // Define gradient for area
  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.6);
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0);

  // X-Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %y")))
    .attr("class", "axis x-axis")
    .style("font-size", "12px");

  // Y-Axis
  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis")
    .style("font-size", "12px");

  // Add line path
  g.append("path")
    .datum(trendData)
    .attr("fill", "none")
    .attr("stroke", "#3b82f6")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px 12px")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");

  // Add data points (circles) for better visibility with hover interaction
  g.selectAll(".dot")
    .data(trendData)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.count))
    .attr("r", 4)
    .attr("fill", "#fff")
    .attr("stroke", "#3b82f6")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 6)
        .attr("fill", "#3b82f6");

      // Build tooltip HTML with typ breakdown
      let tooltipHTML = `<strong>${d.month}</strong><br/>`;
      
      if (d.typ_breakdown && Object.keys(d.typ_breakdown).length > 0) {
        // Show breakdown by typ
        const sortedTypes = Object.entries(d.typ_breakdown)
          .sort((a, b) => b[1] - a[1]); // Sort by count descending
        
        sortedTypes.forEach(([typ, count]) => {
          tooltipHTML += `${translateTyp(typ)}: ${count}<br/>`;
        });
        tooltipHTML += `<strong>${t('chart.label.total')}: ${d.count}</strong>`;
      } else {
        // Fallback if no breakdown available
        tooltipHTML += `${t('chart.label.proposals')}: ${d.count}`;
      }

      tooltip
        .style("display", "block")
        .html(tooltipHTML)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 4)
        .attr("fill", "#fff");

      tooltip.style("display", "none");
    });

  // X-Axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.timeperiod'));

  // Y-Axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -(height / 2))
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.count'));

  // Title
  const titleText = searchTerm
    ? `${title}: "${capitalizeFirstLetter(searchTerm)}"`
    : title;

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("fill", "#1f2937")
    .text(titleText);
}

/**
 * Render a bar chart for top documents
 * @param {Array} documents - Array of top documents with {name, count}
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.title - Chart title
 * @param {number} options.width - Chart width
 * @param {number} options.height - Chart height
 * @param {number} options.limit - Max documents to show
 */
export function renderBarChart(documents, selector, options = {}) {
  const {
    title = t('chart.topdocs.title'),
    width = 900,
    height = 400,
    limit = 20
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  if (!documents || documents.length === 0) {
    container.innerHTML = `<p>${t('error.no-data')}</p>`;
    addInfoBadge(container);
    return;
  }

  addInfoBadge(container);

  const topDocs = documents
    .filter(d => typeof d.count === "number" && d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const margin = { top: 20, right: 30, bottom: 110, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand()
    .domain(topDocs.map((d, i) => i.toString()))
    .range([0, chartWidth])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(topDocs, d => d.count)])
    .nice()
    .range([chartHeight, 0]);

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d => (Number(d) + 1).toString()))
    .attr("class", "axis x-axis");

  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis");

  g.selectAll(".bar")
    .data(topDocs)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => xScale(i.toString()))
    .attr("y", d => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", d => chartHeight - yScale(d.count))
    .attr("fill", "#10b981")
    .append("title")
    .text(d => `${d.name}: ${d.count}`);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.count'));

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -(height / 2))
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.keyword'));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text(title);
}

/**
 * Render a horizontal bar chart for fraktionen (parties)
 * @param {Array} fraktionen - Array of fraktion objects with {name, count}
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.title - Chart title
 * @param {number} options.width - Chart width
 * @param {number} options.height - Chart height
 * @param {number} options.limit - Max fraktionen to show
 * @param {string} options.searchTerm - The search term (for context in title)
 */
export function renderFraktionChart(fraktionen, selector, options = {}) {
  const {
    title = t('chart.fraktionen.title'),
    width = 900,
    height = 400,
    limit = 15,
    searchTerm = ""
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  if (!fraktionen || fraktionen.length === 0) {
    container.innerHTML = `<p style='text-align:center; padding:40px; color:#666;'>${t('error.no-data')}</p>`;
    addInfoBadge(container);
    return;
  }

  addInfoBadge(container);

  const topFraktionen = fraktionen
    .filter(f => typeof f.count === "number" && f.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const margin = { top: 40, right: 30, bottom: 50, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(topFraktionen, d => d.count)])
    .nice()
    .range([0, chartWidth]);

  const yScale = d3
    .scaleBand()
    .domain(topFraktionen.map(d => d.name))
    .range([0, chartHeight])
    .padding(0.3);

  g.append("g")
    .attr("class", "grid")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-dasharray", "4")
    .attr("opacity", 0.7)
    .call(d3.axisBottom(xScale).tickSize(chartHeight).tickFormat(""))
    .select(".domain")
    .remove();

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale))
    .attr("class", "axis x-axis")
    .style("font-size", "12px");

  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis")
    .style("font-size", "12px");

  const colorScale = d3
    .scaleOrdinal()
    .domain(topFraktionen.map(d => d.name))
    .range(topFraktionen.map(d => getFraktionColor(d.name)));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px 12px")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");

  g.selectAll(".bar")
    .data(topFraktionen)
    .join("rect")
    .attr("class", "bar")
    .attr("y", d => yScale(d.name))
    .attr("x", 0)
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.count))
    .attr("fill", d => colorScale(d.name))
    .style("cursor", "pointer")
    .style("transition", "all 200ms ease-in-out")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0.8)
        .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))");

      let tooltipHTML = `<strong>${d.name}</strong><br/>`;
      if (d.typ_breakdown && Object.keys(d.typ_breakdown).length > 0) {
        const sortedTypes = Object.entries(d.typ_breakdown).sort((a, b) => b[1] - a[1]);
        sortedTypes.forEach(([typ, count]) => {
          tooltipHTML += `${translateTyp(typ)}: ${count}<br/>`;
        });
        tooltipHTML += `<strong>${t('chart.label.total')}: ${d.count}</strong>`;
      } else {
        tooltipHTML += `Anträge: ${d.count}`;
      }
      
      tooltip
        .style("display", "block")
        .html(tooltipHTML)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .attr("filter", "none");

      tooltip.style("display", "none");
    });

  g.selectAll(".bar-label")
    .data(topFraktionen)
    .join("text")
    .attr("class", "bar-label")
    .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
    .attr("x", d => xScale(d.count) + 5)
    .attr("dy", "0.35em")
    .attr("font-size", "12px")
    .attr("fill", "#374151")
    .attr("font-weight", "500")
    .text(d => d.count);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.count'));

  svg
    .append("text")
    .attr("x", 15)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.faction'));

  const titleText = searchTerm
    ? `${title}: "${capitalizeFirstLetter(searchTerm)}"`
    : title;

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("fill", "#1f2937")
    .text(titleText);
}




/**
 * Render KPI cards for processing metrics
 * @param {Object} metrics - Metrics object with {avgDays, openCount, closedCount, totalCount}
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.searchTerm - The search term (for context)
 */
export function renderKPICards(metrics, selector, options = {}) {
  const { searchTerm = "" } = options;
  const infoLink = { href: "/methodik#zaehlregeln", title: t('badge.methodology') };

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  if (!metrics) {
    container.innerHTML = `<p style='text-align:center; padding:20px; color:#666;'>${t('error.no-metrics')}</p>`;
    return;
  }

  // Create KPI cards container
  const cardsContainer = document.createElement("div");
  cardsContainer.style.cssText = "display: flex; gap: 20px; flex-wrap: nowrap;";

  // KPI 1: Average processing time
  const avgCard = createKPICard(
    t('kpi.avgdays.title'),
    metrics.avgDays !== null ? `${Math.round(metrics.avgDays)} ${t('kpi.avgdays.description')}` : t('kpi.avgdays.na'),
    "#3b82f6",
    "📊",
    infoLink
  );

  // KPI 2: Open requests
  const openCard = createKPICard(
    t('kpi.open.title'),
    metrics.openCount || 0,
    "#f59e0b",
    "⏳",
    infoLink
  );

  // KPI 3: Closed requests
  const closedCard = createKPICard(
    t('kpi.closed.title'),
    metrics.closedCount || 0,
    "#10b981",
    "✅",
    infoLink
  );

  // KPI 4: Total requests
  const totalCard = createKPICard(
    t('kpi.total.title'),
    metrics.totalCount || 0,
    "#6366f1",
    "📝",
    infoLink
  );

  // Append in order: Total, Open, Closed, Average
  cardsContainer.appendChild(totalCard);
  cardsContainer.appendChild(openCard);
  cardsContainer.appendChild(closedCard);
  cardsContainer.appendChild(avgCard);

  // Add title if searchTerm provided
  if (searchTerm) {
    const title = document.createElement("h3");
    title.textContent = `Bearbeitungsmetriken: "${capitalizeFirstLetter(searchTerm)}"`;
    title.style.cssText = "text-align: center; color: #1f2937; margin: 10px 0;";
    container.appendChild(title);
  }

  container.appendChild(cardsContainer);
}

/**
 * Helper function to create a single KPI card
 */
function createKPICard(label, value, color, icon, infoLink) {
  const card = document.createElement("div");
  card.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    flex: 1;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    border: 1px solid #e5e7eb;
    border-left: 4px solid ${color};
    transition: all 0.3s ease;
    position: relative;
  `;
  card.onmouseenter = () => {
    card.style.transform = "translateY(-2px)";
    card.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
  };
  card.onmouseleave = () => {
    card.style.transform = "translateY(0)";
    card.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
  };

  const iconEl = document.createElement("div");
  iconEl.textContent = icon;
  iconEl.style.cssText = "font-size: 32px; margin-bottom: 10px;";

  if (infoLink && infoLink.href) {
    const info = document.createElement("a");
    info.href = infoLink.href;
    info.title = infoLink.title;
    info.setAttribute("aria-label", infoLink.title);
    info.textContent = "i";
    info.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      border: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      background: #f8fafc;
      text-decoration: none;
    `;
    info.onmouseenter = () => { info.style.background = "#e2e8f0"; };
    info.onmouseleave = () => { info.style.background = "#f8fafc"; };
    card.appendChild(info);
  }

  const labelEl = document.createElement("div");
  labelEl.textContent = label;
  labelEl.style.cssText = "color: #6b7280; font-size: 14px; margin-bottom: 5px;";

  const valueEl = document.createElement("div");
  valueEl.textContent = value;
  valueEl.style.cssText = `color: ${color}; font-size: 28px; font-weight: 600;`;

  card.appendChild(iconEl);
  card.appendChild(labelEl);
  card.appendChild(valueEl);

  return card;
}

/**
 * Render a bar chart for average processing time by Referat
 * @param {Array} data - Array of {referat, avgDays, count} objects
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.title - Chart title
 * @param {number} options.width - Chart width
 * @param {number} options.height - Chart height
 * @param {number} options.limit - Max referats to show
 * @param {string} options.searchTerm - The search term
 */
export function renderProcessingTimeChart(data, selector, options = {}) {
  const {
    title = t('chart.metrics.title'),
    width = 900,
    height = 400,
    limit = 10,
    searchTerm = ""
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<p style='text-align:center; padding:40px; color:#666;'>${t('error.no-referate')}</p>`;
    addInfoBadge(container);
    return;
  }

  addInfoBadge(container);

  // Filter and sort data
  const topReferats = data
    .filter(d => d.avgDays !== null && d.avgDays > 0)
    .sort((a, b) => b.avgDays - a.avgDays)
    .slice(0, limit);

  const margin = { top: 40, right: 30, bottom: 50, left: 250 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  // Create group for chart
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(topReferats, d => d.avgDays)])
    .nice()
    .range([0, chartWidth]);

  const yScale = d3
    .scaleBand()
    .domain(topReferats.map(d => d.referat))
    .range([0, chartHeight])
    .padding(0.3);

  // Add grid lines (vertical)
  g.append("g")
    .attr("class", "grid")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-dasharray", "4")
    .attr("opacity", 0.7)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(chartHeight)
        .tickFormat("")
    )
    .select(".domain")
    .remove();

  // X-Axis
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale))
    .attr("class", "axis x-axis")
    .style("font-size", "12px");

  // Y-Axis
  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis")
    .style("font-size", "11px");

  // Color scale (gradient from green to red based on processing time)
  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(topReferats, d => d.avgDays)])
    .range(["#10b981", "#ef4444"]);

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px 12px")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");

  // Add bars
  g.selectAll(".bar")
    .data(topReferats)
    .join("rect")
    .attr("class", "bar")
    .attr("y", d => yScale(d.referat))
    .attr("x", 0)
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.avgDays))
    .attr("fill", d => colorScale(d.avgDays))
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0.8)
        .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))");

      let tooltipHTML = `<strong>${d.referat}</strong><br/>Ø ${Math.round(d.avgDays)} ${t('kpi.avgdays.description')}<br/>`;
      if (d.typ_breakdown && Object.keys(d.typ_breakdown).length > 0) {
        const sortedTypes = Object.entries(d.typ_breakdown).sort((a, b) => b[1] - a[1]);
        sortedTypes.forEach(([typ, count]) => {
          tooltipHTML += `${translateTyp(typ)}: ${count}<br/>`;
        });
        tooltipHTML += `<strong>${t('chart.label.total')}: ${d.count}</strong>`;
      } else {
        tooltipHTML += `${t('chart.label.proposals')}: ${d.count}`;
      }
      
      tooltip
        .style("display", "block")
        .html(tooltipHTML)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .attr("filter", "none");

      tooltip.style("display", "none");
    });

  // Add value labels
  g.selectAll(".bar-label")
    .data(topReferats)
    .join("text")
    .attr("class", "bar-label")
    .attr("y", d => yScale(d.referat) + yScale.bandwidth() / 2)
    .attr("x", d => xScale(d.avgDays) + 5)
    .attr("dy", "0.35em")
    .attr("font-size", "12px")
    .attr("fill", "#374151")
    .attr("font-weight", "500")
    .text(d => `${Math.round(d.avgDays)} Tage`);

  // X-Axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text(t('chart.axis.avgdays.full'));

  // Y-Axis label
  svg
    .append("text")
    .attr("x", 15)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text("Referat");

  // Title
  const titleText = searchTerm
    ? `${title}: "${capitalizeFirstLetter(searchTerm)}"`
    : title;

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("fill", "#1f2937")
    .text(titleText);
}

/**
 * Render a horizontal bar chart for faction share (percentage of proposals mentioning the keyword)
 * @param {Array} data - Array of {name, share, count, total}
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.title - Chart title
 * @param {number} options.width - Chart width
 * @param {number} options.height - Chart height
 * @param {number} options.limit - Max factions to show
 * @param {string} options.searchTerm - The search term (for context in title)
 */
export function renderFraktionShareChart(data, selector, options = {}) {
  const {
    title = t('chart.share.title'),
    width = 900,
    height = 400,
    limit = 15,
    searchTerm = ""
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<p style='text-align:center; padding:40px; color:#666;'>${t('error.no-data')}</p>`;
    return;
  }

  // Prepare and sort by share descending, limit to top N
  const items = data
    .filter(d => typeof d.share === "number" && d.share > 0)
    .sort((a, b) => b.share - a.share)
    .slice(0, limit);

  const margin = { top: 40, right: 60, bottom: 50, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale in [0,1] for share; use percentage ticks
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(items, d => d.share)])
    .nice()
    .range([0, chartWidth]);

  const yScale = d3
    .scaleBand()
    .domain(items.map(d => d.name))
    .range([0, chartHeight])
    .padding(0.3);

  // Grid lines (vertical)
  g.append("g")
    .attr("class", "grid")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-dasharray", "4")
    .attr("opacity", 0.7)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(chartHeight)
        .tickFormat("")
    )
    .select(".domain")
    .remove();

  // X-Axis with percentage format
  const percentFormat = d3.format(".0%");
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(percentFormat))
    .attr("class", "axis x-axis")
    .style("font-size", "12px");

  // Y-Axis for faction names
  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis")
    .style("font-size", "12px");

  // Create color scale using global faction color map
  const colorScale = d3
    .scaleOrdinal()
    .domain(items.map(d => d.name))
    .range(items.map(d => getFraktionColor(d.name)));

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px 12px")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");

  // Bars
  g.selectAll(".bar")
    .data(items)
    .join("rect")
    .attr("class", "bar")
    .attr("y", d => yScale(d.name))
    .attr("x", 0)
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.share))
    .attr("fill", d => colorScale(d.name))
    .style("cursor", "pointer")
    .style("transition", "all 200ms ease-in-out")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 0.8)
        .attr("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))");

      tooltip
        .style("display", "block")
        .html(`<strong>${d.name}</strong><br/>Anteil: ${percentFormat(d.share)}<br/>${d.count} von ${d.total}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .attr("filter", "none");

      tooltip.style("display", "none");
    });

  // Value labels (percentage)
  g.selectAll(".bar-label")
    .data(items)
    .join("text")
    .attr("class", "bar-label")
    .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
    .attr("x", d => xScale(d.share) + 5)
    .attr("dy", "0.35em")
    .attr("font-size", "12px")
    .attr("fill", "#374151")
    .attr("font-weight", "500")
    .text(d => percentFormat(d.share));

  // X-Axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text("Anteil thematisierte Anträge (%)");

  // Y-Axis label
  svg
    .append("text")
    .attr("x", 15)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text("Fraktion");

  // Title
  const titleText = searchTerm
    ? `${title}: "${capitalizeFirstLetter(searchTerm)}"`
    : title;

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "18px")
    .style("font-weight", "600")
    .style("fill", "#1f2937")
    .text(titleText);
}

/**
 * Render a list of applications/proposals as cards
 * @param {Array} applications - Array of application objects
 * @param {string} selector - CSS selector for container
 * @param {Object} options - Configuration object
 * @param {string} options.title - Section title
 * @param {number} options.limit - Max applications to show (default: 100)
 */
export function renderApplicationsList(applications, selector, options = {}) {
  const {
    title = t('applications.title'),
    total = applications.length,
    loaded = applications.length,
    onLoadMore = null
  } = options;

  const container = document.querySelector(selector);
  if (!container) {
    console.error(`Container not found: ${selector}`);
    return;
  }

  container.innerHTML = "";

  // If no applications, show empty state
  if (!applications || applications.length === 0) {
    const emptyHTML = `
      <div class="applications-empty">
        <p>${t('applications.empty')}</p>
      </div>
    `;
    container.innerHTML = emptyHTML;
    return;
  }

  // Create title
  const titleEl = document.createElement("h3");
  titleEl.className = "applications-title";
  titleEl.setAttribute("data-i18n", "applications.title");
  titleEl.textContent = title;
  container.appendChild(titleEl);

  // Create applications list container
  const listContainer = document.createElement("div");
  listContainer.className = "applications-list";

  // Create a card for each application
  applications.forEach(app => {
    const card = createApplicationCard(app);
    listContainer.appendChild(card);
  });

  container.appendChild(listContainer);

  // Add info about loaded/total count
  const infoEl = document.createElement("p");
  infoEl.className = "applications-info";
  infoEl.textContent = `${t('applications.showing')} ${loaded} ${t('applications.of')} ${total}`;
  container.appendChild(infoEl);

  // Add Load More button if there are more to load
  if (loaded < total && onLoadMore) {
    const btnContainer = document.createElement("div");
    btnContainer.className = "load-more-container";
    
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.className = "load-more-btn";
    loadMoreBtn.textContent = t('applications.load_more');
    loadMoreBtn.addEventListener("click", onLoadMore);
    
    btnContainer.appendChild(loadMoreBtn);
    container.appendChild(btnContainer);
  }
}

/**
 * Helper function to create a single application card
 */
function createApplicationCard(app) {
  const card = document.createElement("div");
  card.className = "application-card";

  // Make card clickable if document_link is available
  const docLink = app["document_link"];
  if (docLink && docLink.trim() && !docLink.includes("No pdf found")) {
    card.classList.add("clickable");
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.open(docLink, "_blank");
    });
  }

  // Format date for display
  const dateStr = formatDate(app["Gestellt am"]);

  // Create card header with title
  const header = document.createElement("div");
  header.className = "card-header";

  const titleEl = document.createElement("h4");
  titleEl.className = "card-title";
  // Use name field which contains the full title
  let title = app["name"] || "N/A";
  // Clean up excessive whitespace/newlines
  title = title.replace(/\s+/g, ' ').trim();
  titleEl.textContent = title;
  header.appendChild(titleEl);

  const dateEl = document.createElement("div");
  dateEl.className = "card-date";
  dateEl.textContent = dateStr;
  header.appendChild(dateEl);

  card.appendChild(header);

  // Create card body with details
  const body = document.createElement("div");
  body.className = "card-body";

  // Add each relevant field
  const fields = [
    { key: "document_content", label: t('applications.description'), maxLength: 150 },
    { key: "Gestellt von", label: t('applications.submitted_by') },
    { key: "Zuständiges Referat", label: t('applications.department') },
    { key: "Typ", label: t('applications.type') },
    { key: "Erledigt am", label: t('applications.closed_date') }
  ];

  fields.forEach(field => {
    let value = app[field.key];
    
    // Special handling for document_content - extract meaningful description
    if (field.key === "document_content" && value) {
      value = extractDescription(value);
    }
    
    if (value && value.toString().trim()) {
      const fieldEl = document.createElement("div");
      fieldEl.className = "card-field";

      const labelEl = document.createElement("span");
      labelEl.className = "field-label";
      labelEl.textContent = field.label + ":";
      fieldEl.appendChild(labelEl);

      const valueEl = document.createElement("span");
      valueEl.className = "field-value";
      
      // Truncate long text
      let displayValue = value.toString();
      if (field.maxLength && displayValue.length > field.maxLength) {
        displayValue = displayValue.substring(0, field.maxLength) + "...";
      }
      valueEl.textContent = displayValue;
      fieldEl.appendChild(valueEl);

      body.appendChild(fieldEl);
    }
  });

  card.appendChild(body);

  return card;
}

/**
 * Helper function to format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    // Format as DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Helper function to extract meaningful description from document_content
 * Skips common boilerplate text like names, addresses, "ANTRAG", etc.
 */
function extractDescription(content) {
  if (!content || !content.trim()) {
    return "";
  }
  
  // Remove excessive whitespace and newlines
  let text = content.replace(/\s+/g, ' ').trim();
  
  // Common patterns to skip (case-insensitive)
  const skipPatterns = [
    /^.*?MITGLIED DES STADTRATS.*?ANTRAG/i,
    /^.*?Herrn?\s+(Oberbürgermeister|Bürgermeister).*?ANTRAG/i,
    /^.*?Rathaus.*?München\s*ANTRAG/i,
    /^.*?ANTRAG\s*/i,
    /^Begründung:\s*/i,
    /^.*?Fraktion.*?München\s*/i,
    /^\d{2}\.\d{2}\.\d{2,4}\s*/,  // Dates at start
  ];
  
  // Try to skip boilerplate
  for (const pattern of skipPatterns) {
    text = text.replace(pattern, '');
  }
  
  // If text starts with a person's name pattern (Herr/Frau + name), skip it
  text = text.replace(/^(Herr|Frau|Herrn)\s+[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\s*/i, '');
  
  // Remove leading "Dem Stadtrat..." boilerplate
  text = text.replace(/^Dem Stadtrat.*?sind\s+(nachstehende\s+)?Fragen?\s+(darzustellen|zu\s+beantworten):\s*/i, '');
  
  // If after cleanup the text is too short or empty, return empty
  if (text.length < 20) {
    return "";
  }
  
  return text.trim();
}
