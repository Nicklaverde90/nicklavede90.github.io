const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const navToggle = document.querySelector('.nav__toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('nav--open', !expanded);
    const label = navToggle.querySelector('.nav__toggle-label');
    if (label) {
      label.textContent = expanded ? 'Menu' : 'Close';
    }
  });
}

const THEME_KEY = 'md-theme';
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // ignore storage errors (private mode, etc.)
  }
};

const applyTheme = (theme) => {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme === 'light');
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
};

const storedTheme = getStoredTheme();
const initialTheme = storedTheme || (prefersDark.matches ? 'dark' : 'light');
applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

const handlePrefersChange = (event) => {
  const hasStoredPreference = Boolean(getStoredTheme());
  if (!hasStoredPreference) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
};

if (typeof prefersDark.addEventListener === 'function') {
  prefersDark.addEventListener('change', handlePrefersChange);
} else if (typeof prefersDark.addListener === 'function') {
  prefersDark.addListener(handlePrefersChange);
}

const modal = document.getElementById('project-modal');
const modalContent = modal ? modal.querySelector('.modal__content') : null;
const modalDialog = modal ? modal.querySelector('.modal__dialog') : null;
const modalHeading = modal ? modal.querySelector('#project-modal-heading') : null;

if (modal && modalContent && modalDialog && modalHeading) {
  const modalSources = new Map();
  const modalSections = document.querySelectorAll('[data-modal-content]');

  modalSections.forEach((section) => {
    if (section.id) {
      modalSources.set(section.id, section.outerHTML);
      section.remove();
    }
  });

  if (modalSources.size === 0) {
    modal.remove();
  } else {
    document.body.classList.add('modal-enabled');

    const focusableSelector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    let lastFocusedElement = null;

    const getFocusableElements = () =>
      Array.from(modalDialog.querySelectorAll(focusableSelector)).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetParent !== null || el === document.activeElement)
      );

    const closeModal = () => {
      if (!modal.classList.contains('modal--open')) {
        return;
      }
      modalContent.innerHTML = '';
      modal.classList.remove('modal--open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeydown);
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    };

    const handleFocusTrap = (event) => {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        modalDialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first || !modal.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else if (event.key === 'Tab') {
        handleFocusTrap(event);
      }
    };

    const openModal = (targetId) => {
      const sectionHtml = modalSources.get(targetId);
      if (!sectionHtml) {
        return;
      }
      lastFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modalContent.innerHTML = '';
      modalContent.innerHTML = sectionHtml;
      const injectedSection = modalContent.querySelector('[data-modal-content]');
      if (injectedSection) {
        modalHeading.textContent =
          injectedSection.querySelector('h1, h2, h3')?.textContent?.trim() || 'Project details';
        injectedSection.removeAttribute('data-modal-content');
      } else {
        modalHeading.textContent = 'Project details';
      }
      modal.classList.add('modal--open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modalContent.scrollTop = 0;
      document.addEventListener('keydown', handleKeydown);
      const focusable = getFocusableElements();
      (focusable[0] || modalDialog).focus();
    };

    document.addEventListener('click', (event) => {
      const trigger = event.target instanceof HTMLElement ? event.target.closest('[data-modal-target]') : null;
      if (!trigger) {
        return;
      }
      const targetId = trigger.getAttribute('data-modal-target');
      if (!targetId || !modalSources.has(targetId)) {
        return;
      }
      event.preventDefault();
      openModal(targetId);
    });

    modal.addEventListener('click', (event) => {
      const closeTrigger = event.target instanceof HTMLElement ? event.target.closest('[data-modal-close]') : null;
      if (closeTrigger) {
        event.preventDefault();
        closeModal();
      }
    });
  }
}
