/**
 * Load top keywords from backend and dynamically create example search buttons
 */

async function loadTopKeywords() {
  try {
    const response = await fetch('/api/top-keywords?count=5');
    const data = await response.json();
    
    const container = document.getElementById('example-searches');
    container.innerHTML = ''; // Clear loading message
    
    if (!data.keywords || data.keywords.length === 0) {
      container.innerHTML = '<p class="error">No keywords found</p>';
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
      '<p class="error">Failed to load keywords</p>';
  }
}

// Load keywords when page loads
document.addEventListener('DOMContentLoaded', loadTopKeywords);
