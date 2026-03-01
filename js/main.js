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

  /* --- Nav Dropdown (IHSS Help) --- */
  function initNavDropdown() {
    var dropdowns = document.querySelectorAll('.nav__dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav__dropdown-toggle');
      if (!toggle) return;

      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('nav__dropdown--open');
        // Close all dropdowns first
        document.querySelectorAll('.nav__dropdown--open').forEach(function (d) {
          d.classList.remove('nav__dropdown--open');
        });
        if (!isOpen) {
          dropdown.classList.add('nav__dropdown--open');
        }
      });
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('.nav__dropdown--open').forEach(function (d) {
        d.classList.remove('nav__dropdown--open');
      });
    });
  }

  /* --- Urgency Banner --- */
  function initUrgencyBanner() {
    var banner = document.querySelector('.urgency-banner');
    if (!banner) return;

    if (sessionStorage.getItem('urgency_banner_dismissed') === '1') {
      banner.classList.add('urgency-banner--hidden');
      return;
    }

    var dismissBtn = banner.querySelector('.urgency-banner__dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.classList.add('urgency-banner--hidden');
        sessionStorage.setItem('urgency_banner_dismissed', '1');
      });
    }
  }

  /* --- Quick Contact Form (Web3Forms) --- */
  function initQuickContactForm() {
    var form = document.getElementById('quick-contact-form');
    if (!form) return;

    // Show/hide "Other" text input when "Other" is selected
    var issueSelect = form.querySelector('#qc-issue');
    var otherGroup = form.querySelector('.qc-other-group');
    if (issueSelect && otherGroup) {
      issueSelect.addEventListener('change', function () {
        if (issueSelect.value === 'Other') {
          otherGroup.style.display = '';
          otherGroup.querySelector('input').setAttribute('required', '');
        } else {
          otherGroup.style.display = 'none';
          otherGroup.querySelector('input').removeAttribute('required');
          otherGroup.querySelector('input').value = '';
        }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var isValid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('form__input--error');
        } else {
          field.classList.remove('form__input--error');
        }
      });
      if (!isValid) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var formData = new FormData(form);
      formData.append('access_key', WEB3FORMS_KEY);
      formData.append('subject', 'Quick Contact - IHSS Help Request');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.success) {
            var successEl = form.querySelector('.quick-contact__success');
            if (successEl) {
              successEl.classList.add('quick-contact__success--visible');
              form.reset();
              setTimeout(function () {
                successEl.classList.remove('quick-contact__success--visible');
              }, 5000);
            }
          } else {
            alert('Error sending message. Please try again.');
          }
        })
        .catch(function () {
          alert('Error sending message. Please try again.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  /* --- Triage Intake Form --- */
  function initTriageForm() {
    var form = document.getElementById('triage-form');
    if (!form) return;

    // NOA date -> deadline calculation
    var noaDateInput = form.querySelector('#noa-date');
    var deadlineCalc = form.querySelector('.triage-form__deadline-calc');

    if (noaDateInput && deadlineCalc) {
      noaDateInput.addEventListener('change', function () {
        var noaDate = new Date(noaDateInput.value);
        if (isNaN(noaDate.getTime())) {
          deadlineCalc.style.display = 'none';
          deadlineCalc.className = 'triage-form__deadline-calc';
          return;
        }
        var deadline = new Date(noaDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var daysLeft = Math.ceil((deadline - today) / (24 * 60 * 60 * 1000));

        if (daysLeft <= 0) {
          deadlineCalc.textContent = 'Your 90-day deadline has passed. Contact us immediately — we may still be able to help.';
          deadlineCalc.className = 'triage-form__deadline-calc triage-form__deadline-calc--urgent';
        } else if (daysLeft <= 14) {
          deadlineCalc.textContent = 'URGENT: Only ' + daysLeft + ' days left to file! Contact us now.';
          deadlineCalc.className = 'triage-form__deadline-calc triage-form__deadline-calc--urgent';
        } else {
          deadlineCalc.textContent = 'You have ' + daysLeft + ' days remaining to file your appeal.';
          deadlineCalc.className = 'triage-form__deadline-calc triage-form__deadline-calc--ok';
        }
      });
    }

    // File upload UI
    var fileInput = form.querySelector('#noa-upload');
    var fileLabel = form.querySelector('.triage-form__file-name');
    if (fileInput && fileLabel) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
          fileLabel.textContent = fileInput.files[0].name;
        } else {
          fileLabel.textContent = '';
        }
      });
    }

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var isValid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('form__input--error');
          var errorEl = field.parentElement.querySelector('.form__error');
          if (errorEl) {
            errorEl.textContent = 'This field is required';
            errorEl.classList.add('form__error--visible');
          }
        } else {
          field.classList.remove('form__input--error');
          var errorEl = field.parentElement.querySelector('.form__error');
          if (errorEl) errorEl.classList.remove('form__error--visible');
        }
      });
      if (!isValid) {
        var firstError = form.querySelector('.form__input--error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      var formData = new FormData(form);
      formData.append('access_key', WEB3FORMS_KEY);
      formData.append('subject', 'IHSS Triage Intake - Urgent');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.success) {
            var successEl = form.querySelector('.triage-form__success');
            if (successEl) {
              successEl.classList.add('triage-form__success--visible');
              form.style.display = 'none';
            }
          } else {
            alert('Error submitting form. Please try again or call us directly.');
          }
        })
        .catch(function () {
          alert('Error submitting form. Please try again or call us directly.');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });

    // Live validation clear on input
    var inputs = form.querySelectorAll('.form__input, .form__select, .form__textarea');
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('form__input--error');
        var errorEl = input.parentElement.querySelector('.form__error');
        if (errorEl) errorEl.classList.remove('form__error--visible');
      });
    });
  }

  /* --- Floating CTA --- */
  function initFloatingCTA() {
    var cta = document.querySelector('.floating-cta');
    if (!cta) return;

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 400) {
        cta.classList.add('floating-cta--visible');
      } else {
        cta.classList.remove('floating-cta--visible');
      }
    });
  }

  /* --- Initialize Everything --- */
  function init() {
    initHeaderScroll();
    initMobileMenu();
    initLangSwitcher();
    initNavDropdown();
    initUrgencyBanner();
    initQuickContactForm();
    initTriageForm();
    initFloatingCTA();
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
