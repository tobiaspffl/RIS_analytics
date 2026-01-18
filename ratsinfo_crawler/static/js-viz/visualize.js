/**
 * visualize.js - D3 Visualization Functions
 * 
 * Functions to render D3 charts. Each function:
 * - Takes prepared data and a selector
 * - Clears the container and renders a chart
 * - Accepts optional configuration
 */

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
    title = "Anträge pro Monat",
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
    container.innerHTML = "<p style='text-align:center; padding:40px; color:#666;'>Keine Daten verfügbar</p>";
    return;
  }

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
    .style("background-color", "#fafafa");

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

      tooltip
        .style("display", "block")
        .html(`<strong>${d.month}</strong><br/>Anträge: ${d.count}`)
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
    .text("Zeitraum");

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
    .text("Anzahl Anträge");

  // Title
  const titleText = searchTerm
    ? `${title}: "${searchTerm}"`
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
    title = "Top Dokumente",
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
    container.innerHTML = "<p>No data available</p>";
    return;
  }

  const topDocs = documents
    .filter(d => typeof d.count === "number" && d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const margin = { top: 20, right: 30, bottom: 100, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

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

  // X-Axis (just numbers)
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d => (Number(d) + 1).toString()))
    .attr("class", "axis x-axis");

  // Y-Axis
  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis");

  // Bars
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

  // X-Axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Dokument Index");

  // Y-Axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", -(height / 2))
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Vorkommen (count)");

  // Title
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
    title = "Fraktionsbeteiligung",
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
    container.innerHTML = "<p style='text-align:center; padding:40px; color:#666;'>Keine Daten verfügbar</p>";
    return;
  }

  // Filter and sort data
  const topFraktionen = fraktionen
    .filter(f => typeof f.count === "number" && f.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const margin = { top: 40, right: 30, bottom: 30, left: 200 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("background-color", "#fafafa");

  // Create group for chart
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales - for horizontal bar chart, X is linear (count), Y is band (fraktion names)
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

  // X-Axis (bottom, for counts)
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale))
    .attr("class", "axis x-axis")
    .style("font-size", "12px");

  // Y-Axis (left, for fraktion names)
  g.append("g")
    .call(d3.axisLeft(yScale))
    .attr("class", "axis y-axis")
    .style("font-size", "12px");

  // Create color scale for bars
  const colorScale = d3
    .scaleOrdinal()
    .domain(topFraktionen.map(d => d.name))
    .range(d3.schemeSet2);

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

      tooltip
        .style("display", "block")
        .html(`<strong>${d.name}</strong><br/>Anträge: ${d.count}`)
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

  // Add value labels on bars (right side)
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

  // X-Axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text("Anzahl Anträge");

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
    ? `${title}: "${searchTerm}"`
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
