/**
 * language-switcher.js - Language Toggle Logic
 * 
 * Handles language switching and applies translations to HTML elements
 */

import { t, getCurrentLang, setCurrentLang } from './i18n.js';

/**
 * Apply translations to all elements with data-i18n attributes
 */
export function applyTranslations() {
  const lang = getCurrentLang();
  
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key, lang);
    
    // For inputs and buttons, set appropriate property
    if (el.tagName === 'INPUT' && el.type !== 'submit') {
      // Don't change the value for text inputs (only placeholder)
    } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      el.textContent = translation;
    } else {
      el.textContent = translation;
    }
  });
  
  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key, lang);
  });
  
  // Translate aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key, lang));
  });
  
  // Translate title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key, lang));
  });
}

/**
 * Set language and apply translations
 * @param {string} lang - Language code ('de' or 'en')
 */
export function switchLanguage(lang) {
  setCurrentLang(lang);
  applyTranslations();
  
  // Update active state on language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Dispatch custom event for charts to re-render
  document.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { lang } 
  }));
}

/**
 * Initialize language switcher
 * Sets up event listeners and applies initial translations
 */
export function initLanguageSwitcher() {
  const currentLang = getCurrentLang();
  
  // Apply translations on page load
  applyTranslations();
  
  // Set active state on current language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    if (btnLang === currentLang) {
      btn.classList.add('active');
    }
    
    // Add click listener
    btn.addEventListener('click', () => {
      switchLanguage(btnLang);
    });
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
} else {
  initLanguageSwitcher();
}
