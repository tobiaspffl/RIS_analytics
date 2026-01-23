/**
 * Load themes from THEME_MAP backend and dynamically create example search buttons
 */

import { t } from './i18n.js';

// Central suggestions count (fallback). Can be overridden via
// data-count on the element with id="example-searches" in index.html.
const TOP_KEYWORD_COUNT = 8;

/**
 * DEPRECATED: Old implementation that loaded top keywords.
 * Kept for reference - no longer used.
 */
/*
async function loadTopKeywords() {
  try {
    const container = document.getElementById('example-searches');
    const attrCount = container && container.dataset && container.dataset.count
      ? parseInt(container.dataset.count, 10)
      : NaN;
    const count = Number.isFinite(attrCount) ? attrCount : TOP_KEYWORD_COUNT;

    const response = await fetch(`/api/top-keywords?count=${count}`);
    const data = await response.json();
    
    container.innerHTML = ''; // Clear loading message
    
    if (!data.keywords || data.keywords.length === 0) {
      container.innerHTML = `<p class="error">${t('error.no-keywords')}</p>`;
      return;
    }
    
    // Create buttons for each keyword
    data.keywords.forEach(keyword => {
      const button = document.createElement('button');
      button.className = 'example-btn';
      button.dataset.keyword = keyword;
      button.textContent = keyword.charAt(0).toUpperCase() + keyword.slice(1); // Capitalize first letter
      
      // Add click handler to search with this keyword
      button.addEventListener('click', () => {
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        document.getElementById('searchInput').value = capitalizedKeyword;
        document.getElementById('searchBtn').click();
      });
      
      container.appendChild(button);
    });
    
  } catch (error) {
    console.error('Error loading keywords:', error);
    document.getElementById('example-searches').innerHTML = 
      `<p class="error">${t('error.keywords')}</p>`;
  }
}
*/

/**
 * NEW IMPLEMENTATION: Load themes from THEME_MAP via backend API.
 * 
 * Fetches all available themes from the /api/themes endpoint.
 * Creates clickable theme buttons that populate the search input with the theme name
 * and trigger a search. Only displays theme names (not individual keywords).
 * 
 * Limits the number of displayed themes based on the 'data-count' attribute
 * on the #example-searches element (defaults to TOP_KEYWORD_COUNT).
 */
async function loadThemes() {
  try {
    const container = document.getElementById('example-searches');
    const attrCount = container && container.dataset && container.dataset.count
      ? parseInt(container.dataset.count, 10)
      : NaN;
    const count = Number.isFinite(attrCount) ? attrCount : TOP_KEYWORD_COUNT;

    // Fetch available themes from backend
    const response = await fetch('/api/themes');
    const data = await response.json();
    
    container.innerHTML = ''; // Clear loading message
    
    if (!data.themes || data.themes.length === 0) {
      container.innerHTML = `<p class="error">${t('error.no-themes')}</p>`;
      return;
    }
    
    // Limit themes to specified count
    const themesToDisplay = data.themes.slice(0, count);
    
    // Create buttons for each theme
    themesToDisplay.forEach(theme => {
      const button = document.createElement('button');
      button.className = 'example-btn theme-btn';
      button.dataset.theme = theme;
      button.textContent = theme; // Display theme name as-is
      
      // Add click handler to search with this theme
      button.addEventListener('click', () => {
        document.getElementById('searchInput').value = theme;
        document.getElementById('searchBtn').click();
      });
      
      container.appendChild(button);
    });
    
  } catch (error) {
    console.error('Error loading themes:', error);
    document.getElementById('example-searches').innerHTML = 
      `<p class="error">${t('error.themes')}</p>`;
  }
}

// Load themes when page loads
document.addEventListener('DOMContentLoaded', loadThemes);

// Reload themes when language changes (to update error messages if any)
document.addEventListener('languageChanged', loadThemes);
