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

  /* --- Portal Forms with Web3Forms --- */
  function initPortalForms() {
    // Document submission form
    var docForm = document.getElementById('portal-doc-form');
    if (docForm) {
      docForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var submitBtn = docForm.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        var formData = new FormData(docForm);
        formData.append('access_key', WEB3FORMS_KEY);
        formData.append('subject', 'Client Portal: Document Submission');

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success) {
              var successEl = docForm.querySelector('.form__success');
              if (successEl) {
                successEl.classList.add('form__success--visible');
                docForm.reset();
                clearUploadList();
                setTimeout(function () {
                  successEl.classList.remove('form__success--visible');
                }, 5000);
              }
            } else {
              alert('Submission failed. Please try again.');
            }
          })
          .catch(function () {
            alert('Submission failed. Please try again.');
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          });
      });
    }

    // Message form
    var msgForm = document.getElementById('portal-msg-form');
    if (msgForm) {
      msgForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var textarea = msgForm.querySelector('textarea');
        var message = textarea.value.trim();
        if (!message) return;

        var submitBtn = msgForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        var formData = new FormData();
        formData.append('access_key', WEB3FORMS_KEY);
        formData.append('subject', 'Client Portal: New Message');
        formData.append('message', message);

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success) {
              // Add message to the UI
              addMessageToList(message);
              textarea.value = '';
            }
          })
          .catch(function () {
            alert('Failed to send message. Please try again.');
          })
          .finally(function () {
            submitBtn.disabled = false;
          });
      });
    }

    // Profile form
    var profileForm = document.getElementById('portal-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = profileForm.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        var formData = new FormData(profileForm);
        formData.append('access_key', WEB3FORMS_KEY);
        formData.append('subject', 'Client Portal: Profile Update');

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success) {
              var successEl = profileForm.querySelector('.form__success');
              if (successEl) {
                successEl.classList.add('form__success--visible');
                setTimeout(function () {
                  successEl.classList.remove('form__success--visible');
                }, 3000);
              }
            }
          })
          .catch(function () {
            alert('Failed to save. Please try again.');
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          });
      });
    }
  }

  /* --- Portal Sidebar Navigation --- */
  function initPortalNav() {
    var links = document.querySelectorAll('.portal-sidebar__link');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = link.getAttribute('data-portal-section');
        if (!target) return;

        // Update active link
        links.forEach(function (l) {
          l.classList.remove('portal-sidebar__link--active');
        });
        link.classList.add('portal-sidebar__link--active');

        // Show target section
        document.querySelectorAll('.portal-section').forEach(function (section) {
          section.classList.remove('portal-section--active');
        });
        var targetSection = document.getElementById(target);
        if (targetSection) {
          targetSection.classList.add('portal-section--active');
        }
      });
    });
  }

  /* --- File Upload Area --- */
  function initFileUpload() {
    var uploadArea = document.querySelector('.upload-area');
    var fileInput = document.getElementById('portal-file-input');
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', function () {
      fileInput.click();
    });

    uploadArea.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadArea.classList.add('upload-area--dragover');
    });

    uploadArea.addEventListener('dragleave', function () {
      uploadArea.classList.remove('upload-area--dragover');
    });

    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('upload-area--dragover');
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function () {
      handleFiles(fileInput.files);
    });
  }

  function handleFiles(files) {
    var uploadList = document.querySelector('.upload-list');
    if (!uploadList) return;

    Array.from(files).forEach(function (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File "' + file.name + '" exceeds the 10MB limit.');
        return;
      }

      var item = document.createElement('div');
      item.className = 'upload-list__item';
      item.innerHTML =
        '<div class="upload-list__item-info">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>' +
        '<span>' + file.name + ' (' + formatFileSize(file.size) + ')</span>' +
        '</div>' +
        '<button type="button" class="upload-list__item-remove" aria-label="Remove file">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>';

      var removeBtn = item.querySelector('.upload-list__item-remove');
      removeBtn.addEventListener('click', function () {
        item.remove();
      });

      uploadList.appendChild(item);
    });
  }

  function clearUploadList() {
    var uploadList = document.querySelector('.upload-list');
    if (uploadList) uploadList.innerHTML = '';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function addMessageToList(text) {
    var list = document.querySelector('.message-list');
    if (!list) return;

    var now = new Date();
    var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var msgEl = document.createElement('div');
    msgEl.className = 'message-item message-item--sent';
    msgEl.innerHTML =
      '<p class="message-item__text">' + escapeHtml(text) + '</p>' +
      '<span class="message-item__time">' + timeStr + '</span>';

    list.appendChild(msgEl);
    list.scrollTop = list.scrollHeight;
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
    var errorEl = form.querySelector('.form__error-global');
    if (errorEl) {
      errorEl.classList.add('form__error--visible');
      setTimeout(function () {
        errorEl.classList.remove('form__error--visible');
      }, 5000);
    }
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
    initPortalForms();
    initPortalNav();
    initFileUpload();
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
