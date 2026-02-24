/* ============================================
   SSDI Providers -- i18n Language Switching Engine
   Loads JSON translation files, swaps all text,
   handles RTL, persists preference
   ============================================ */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'es', 'fa', 'tl'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'ssdiproviders_lang';
  const RTL_LANGS = ['fa'];

  let currentLang = DEFAULT_LANG;
  let translations = {};
  let isLoading = false;

  /**
   * Get the saved language or detect from browser
   */
  function getInitialLanguage() {
    // Check localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }

    // Try browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGS.includes(browserLang)) {
      return browserLang;
    }

    return DEFAULT_LANG;
  }

  /**
   * Load a translation JSON file
   */
  async function loadTranslation(lang) {
    if (translations[lang]) {
      return translations[lang];
    }

    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      const data = await response.json();
      translations[lang] = data;
      return data;
    } catch (error) {
      console.error(`Error loading translation for ${lang}:`, error);
      // Fall back to English
      if (lang !== DEFAULT_LANG) {
        return loadTranslation(DEFAULT_LANG);
      }
      return null;
    }
  }

  /**
   * Get a nested value from an object using dot notation
   * e.g., getNestedValue(obj, "hero.title") => obj.hero.title
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations(data) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(data, key);

      if (value === null || value === undefined) return;

      // Check for specific attribute targets
      const attr = el.getAttribute('data-i18n-attr');

      if (attr === 'placeholder') {
        el.placeholder = value;
      } else if (attr === 'aria-label') {
        el.setAttribute('aria-label', value);
      } else if (attr === 'title') {
        el.title = value;
      } else if (attr === 'value') {
        el.value = value;
      } else {
        // Default: set innerHTML (allows <span> tags in translations)
        el.innerHTML = value;
      }
    });
  }

  /**
   * Handle RTL/LTR direction
   */
  function setDirection(lang) {
    const isRTL = RTL_LANGS.includes(lang);
    const html = document.documentElement;

    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);

    // Activate or deactivate RTL stylesheet
    const rtlLink = document.getElementById('rtl-stylesheet');
    if (rtlLink) {
      rtlLink.disabled = !isRTL;
    }
  }

  /**
   * Update the language switcher UI
   */
  function updateSwitcherUI(lang) {
    const langLabels = {
      en: 'English',
      es: 'Español',
      fa: 'فارسی',
      tl: 'Tagalog'
    };

    const flagEmojis = {
      en: '🇺🇸',
      es: '🇲🇽',
      fa: '🇮🇷',
      tl: '🇵🇭'
    };

    // Update all switcher buttons
    const switcherBtns = document.querySelectorAll('.lang-switcher__current');
    switcherBtns.forEach(function (btn) {
      btn.textContent = langLabels[lang] || lang;
    });

    const switcherFlags = document.querySelectorAll('.lang-switcher__current-flag');
    switcherFlags.forEach(function (flag) {
      flag.textContent = flagEmojis[lang] || '';
    });

    // Update active state on dropdown options
    const options = document.querySelectorAll('.lang-switcher__option');
    options.forEach(function (option) {
      const optionLang = option.getAttribute('data-lang');
      option.classList.toggle('lang-switcher__option--active', optionLang === lang);
    });
  }

  /**
   * Switch language
   */
  async function switchLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang) || isLoading) return;
    if (lang === currentLang && translations[lang]) return;

    isLoading = true;

    const data = await loadTranslation(lang);
    if (!data) {
      isLoading = false;
      return;
    }

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    setDirection(lang);
    applyTranslations(data);
    updateSwitcherUI(lang);

    // Dispatch custom event for other scripts to listen to
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { lang: lang, data: data }
    }));

    isLoading = false;
  }

  /**
   * Initialize the i18n system
   */
  async function init() {
    const initialLang = getInitialLanguage();

    // Set direction immediately to prevent flash
    setDirection(initialLang);

    // Load and apply translations
    await switchLanguage(initialLang);

    // Bind language switcher click events
    document.addEventListener('click', function (e) {
      const option = e.target.closest('.lang-switcher__option');
      if (option) {
        e.preventDefault();
        const lang = option.getAttribute('data-lang');
        if (lang) {
          switchLanguage(lang);
          // Close dropdown
          const dropdown = option.closest('.lang-switcher__dropdown');
          if (dropdown) {
            dropdown.classList.remove('lang-switcher__dropdown--open');
            const btn = dropdown.previousElementSibling;
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  }

  // Expose API globally
  window.i18n = {
    switchLanguage: switchLanguage,
    getCurrentLang: function () { return currentLang; },
    getTranslation: function (key) {
      const data = translations[currentLang];
      return data ? getNestedValue(data, key) : null;
    },
    init: init
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
