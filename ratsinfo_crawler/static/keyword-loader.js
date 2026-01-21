/**
 * Load top keywords from backend and dynamically create example search buttons
 */

import { t } from './i18n.js';

// Central suggestions count (fallback). Can be overridden via
// data-count on the element with id="example-searches" in index.html.
const TOP_KEYWORD_COUNT = 8;

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

// Load keywords when page loads
document.addEventListener('DOMContentLoaded', loadTopKeywords);

// Reload keywords when language changes (to update error messages if any)
document.addEventListener('languageChanged', loadTopKeywords);
