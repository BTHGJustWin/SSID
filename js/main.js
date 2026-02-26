/* ============================================
   SSDI Providers -- Main JavaScript
   Navigation, mobile menu, accordion, forms,
   animations, and Web3Forms integration
   ============================================ */

(function () {
  'use strict';

  // Web3Forms access key -- replace with your actual key
  const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';

  /* --- Header Scroll Effect --- */
  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset;
      if (currentScroll > 10) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      lastScroll = currentScroll;
    });
  }

  /* --- Mobile Menu --- */
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.header__nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.contains('header__nav--open');
      nav.classList.toggle('header__nav--open');
      toggle.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close menu when clicking a nav link
    var navLinks = nav.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('header__nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('header__nav--open')) {
        nav.classList.remove('header__nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  /* --- Language Switcher Dropdown --- */
  function initLangSwitcher() {
    var switchers = document.querySelectorAll('.lang-switcher');

    switchers.forEach(function (switcher) {
      var btn = switcher.querySelector('.lang-switcher__btn');
      var dropdown = switcher.querySelector('.lang-switcher__dropdown');
      if (!btn || !dropdown) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('lang-switcher__dropdown--open');
        closeAllDropdowns();
        if (!isOpen) {
          dropdown.classList.add('lang-switcher__dropdown--open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard navigation
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function () {
      closeAllDropdowns();
    });

    function closeAllDropdowns() {
      document.querySelectorAll('.lang-switcher__dropdown--open').forEach(function (d) {
        d.classList.remove('lang-switcher__dropdown--open');
        var btn = d.previousElementSibling;
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* --- FAQ Accordion --- */
  function initAccordion() {
    var headers = document.querySelectorAll('.accordion__header');
    if (!headers.length) return;

    headers.forEach(function (header) {
      header.addEventListener('click', function () {
        var item = header.closest('.accordion__item');
        var body = item.querySelector('.accordion__body');
        var content = body.querySelector('.accordion__content');
        var isOpen = item.classList.contains('accordion__item--open');

        // Close all other items
        document.querySelectorAll('.accordion__item--open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('accordion__item--open');
            var openBody = openItem.querySelector('.accordion__body');
            openBody.style.maxHeight = '0';
            openItem.querySelector('.accordion__header').setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle this item
        if (isOpen) {
          item.classList.remove('accordion__item--open');
          body.style.maxHeight = '0';
          header.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('accordion__item--open');
          body.style.maxHeight = content.scrollHeight + 'px';
          header.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard support
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /* --- FAQ Category Filters --- */
  function initFaqFilters() {
    var filterBtns = document.querySelectorAll('.faq-category-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-category');

        // Update active button
        filterBtns.forEach(function (b) {
          b.classList.remove('faq-category-btn--active');
        });
        btn.classList.add('faq-category-btn--active');

        // Filter accordion items
        var items = document.querySelectorAll('.accordion__item');
        items.forEach(function (item) {
          var itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
            // Close if open
            if (item.classList.contains('accordion__item--open')) {
              item.classList.remove('accordion__item--open');
              var body = item.querySelector('.accordion__body');
              if (body) body.style.maxHeight = '0';
            }
          }
        });
      });
    });
  }

  /* --- Contact Form with Web3Forms --- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate
      if (!validateForm(form)) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Build form data
      var formData = new FormData(form);
      formData.append('access_key', WEB3FORMS_KEY);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.success) {
            // Show success message
            var successEl = form.querySelector('.form__success');
            if (successEl) {
              successEl.classList.add('form__success--visible');
              form.reset();
              // Hide after 5 seconds
              setTimeout(function () {
                successEl.classList.remove('form__success--visible');
              }, 5000);
            }
          } else {
            showFormError(form);
          }
        })
        .catch(function () {
          showFormError(form);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });

    // Live validation on blur
    var inputs = form.querySelectorAll('.form__input, .form__textarea, .form__select');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });
      input.addEventListener('input', function () {
        clearFieldError(input);
      });
    });
  }


  /* --- Form Validation --- */
  function validateForm(form) {
    var isValid = true;
    var requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function validateField(field) {
    var value = field.value.trim();
    var errorEl = field.parentElement.querySelector('.form__error');

    // Required check
    if (field.hasAttribute('required') && !value) {
      showFieldError(field, errorEl, 'form_required');
      return false;
    }

    // Email check
    if (field.type === 'email' && value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showFieldError(field, errorEl, 'form_invalid_email');
        return false;
      }
    }

    clearFieldError(field);
    return true;
  }

  function showFieldError(field, errorEl, msgKey) {
    field.classList.add('form__input--error');
    if (errorEl) {
      var msg = window.i18n ? window.i18n.getTranslation('contact_page.' + msgKey) : null;
      errorEl.textContent = msg || (msgKey === 'form_invalid_email' ? 'Please enter a valid email address' : 'This field is required');
      errorEl.classList.add('form__error--visible');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('form__input--error');
    var errorEl = field.parentElement.querySelector('.form__error');
    if (errorEl) {
      errorEl.classList.remove('form__error--visible');
    }
  }

  function showFormError(form) {
    var msg = window.i18n ? window.i18n.getTranslation('contact_page.form_error') : 'There was an error sending your message. Please try again.';
    alert(msg);
  }

  /* --- Scroll Animations --- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Active Nav Link --- */
  function initActiveNavLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('nav__link--active');
      }
    });
  }

  /* --- Smooth Scroll for Anchor Links --- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = document.querySelector('.header').offsetHeight || 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }

  /* --- Escape HTML --- */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* --- Initialize Everything --- */
  function init() {
    initHeaderScroll();
    initMobileMenu();
    initLangSwitcher();
    initAccordion();
    initFaqFilters();
    initContactForm();
    initScrollAnimations();
    initActiveNavLink();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
