/**
 * Map visualization module for district-party analysis
 * Uses Leaflet.js for interactive map with SVG pie-chart markers
 */

/**
 * Generate SVG pie chart representation
 * @param {Object} shares - Party name -> share (0-1) mapping
 * @param {Object} colors - Party name -> color hex mapping
 * @param {number} size - Diameter of pie chart in pixels (default: 40)
 * @returns {string} SVG element string
 */
function createPieChartSVG(shares, colors, size = 40) {
    const radius = size / 2;
    const parties = Object.entries(shares)
        .filter(([name, share]) => share > 0.01)
        .sort((a, b) => b[1] - a[1]);
    
    if (parties.length === 0) return createEmptySVG(size);
    
    // Generate pie slices
    let pathData = [];
    let currentAngle = -Math.PI / 2; // Start at top
    
    parties.forEach(([party, share]) => {
        const sliceAngle = share * 2 * Math.PI;
        const x1 = radius + radius * Math.cos(currentAngle);
        const y1 = radius + radius * Math.sin(currentAngle);
        
        currentAngle += sliceAngle;
        const x2 = radius + radius * Math.cos(currentAngle);
        const y2 = radius + radius * Math.sin(currentAngle);
        
        const largeArc = share > 0.5 ? 1 : 0;
        
        const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        pathData.push({
            path,
            color: colors[party] || '#999999'
        });
    });
    
    // Build SVG
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">`;
    
    pathData.forEach(({ path, color }) => {
        svg += `<path d="${path}" fill="${color}" stroke="white" stroke-width="0.5" />`;
    });
    
    svg += '</svg>';
    return svg;
}

/**
 * Create empty/fallback SVG pie chart
 */
function createEmptySVG(size = 40) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
    </svg>`;
}

/**
 * Create Leaflet marker with pie chart as icon
 * @param {Object} districtData - {coords, parties, total}
 * @param {string} districtName - Name of the district
 * @param {Object} partyColors - Party -> color mapping
 * @returns {L.Marker} Leaflet marker
 */
function createDistrictMarker(districtData, districtName, partyColors) {
    const { coords, parties, total } = districtData;
    
    // Calculate marker size based on total (log scale for better visibility)
    const markerSize = Math.max(30, Math.min(60, 30 + Math.log10(total) * 10));
    
    // Create pie chart SVG
    const pieSvg = createPieChartSVG(parties, partyColors, markerSize);
    
    // Create custom icon using HTML
    const icon = L.divIcon({
        html: pieSvg,
        iconSize: [markerSize, markerSize],
        className: 'district-marker',
        popupAnchor: [0, -markerSize/2 - 5]
    });
    
    // Create marker
    const marker = L.marker(coords, { icon });
    
    // Create popup content
    let popupContent = `<strong>${districtName}</strong><br>`;
    popupContent += `<small>Total mentions: ${total}</small><br><br>`;
    
    const sortedParties = Object.entries(parties)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Show top 10
    
    sortedParties.forEach(([party, share]) => {
        const percent = (share * 100).toFixed(1);
        const color = partyColors[party] || '#999999';
        popupContent += `<span style="display: inline-block; width: 12px; height: 12px; background: ${color}; border-radius: 2px; margin-right: 5px;"></span>`;
        popupContent += `${party}: ${percent}%<br>`;
    });
    
    marker.bindPopup(popupContent);
    marker.bindTooltip(districtName, { direction: 'top' });
    
    return marker;
}

/**
 * Main render function for district map
 * @param {Object} mapData - {districts, party_colors, stats}
 * @param {string} selector - CSS selector for container (e.g., '#viz-districts')
 * @param {Object} options - Optional config {center, zoom, minZoom, maxZoom}
 */
export function renderDistrictMap(mapData, selector, options = {}) {
    const container = document.querySelector(selector);
    if (!container) {
        console.error(`Container ${selector} not found`);
        return;
    }
    
    // Clear existing map if present
    if (window._districtMapInstance) {
        window._districtMapInstance.remove();
        delete window._districtMapInstance;
    }
    
    const {
        center = [48.137, 11.575],
        zoom = 11,
        minZoom = 9,
        maxZoom = 14
    } = options;
    
    // Create map
    const map = L.map(selector).setView(center, zoom);
    window._districtMapInstance = map;
    
    // Add tile layer (CartoDB Positron - clean look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB',
        subdomains: 'abcd',
        maxZoom: maxZoom,
        minZoom: minZoom
    }).addTo(map);
    
    // Add markers
    const markerGroup = L.featureGroup();
    const { districts = {}, party_colors = {} } = mapData;
    
    Object.entries(districts).forEach(([districtName, districtData]) => {
        const marker = createDistrictMarker(districtData, districtName, party_colors);
        marker.addTo(markerGroup);
    });
    
    markerGroup.addTo(map);
    
    // Create legend
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = (map) => {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        div.style.maxHeight = '300px';
        div.style.overflowY = 'auto';
        div.style.fontSize = '12px';
        
        let html = '<strong style="display: block; margin-bottom: 8px;">Parties</strong>';
        
        Object.entries(party_colors).forEach(([party, color]) => {
            html += `<div style="margin: 4px 0;">
                <span style="display: inline-block; width: 14px; height: 14px; background: ${color}; border-radius: 2px; margin-right: 6px;"></span>
                ${party}
            </div>`;
        });
        
        div.innerHTML = html;
        return div;
    };
    
    legend.addTo(map);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        setTimeout(() => map.invalidateSize(), 100);
    });
    
    return map;
}
