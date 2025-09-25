/* ------------------------------------------------------------------
  Touch-friendly accordion toggle for Education & Experience lists
------------------------------------------------------------------ */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__shaoboAccordionTouchPatched) return;
  window.__shaoboAccordionTouchPatched = true;

  function findEducationExperienceContainer() {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5'));
    const heading = headings.find(h => /education\s*&\s*experience/i.test(h.textContent.trim()));
    if (!heading) return null;
    let el = heading.nextElementSibling;
    while (el && !['OL','UL','SECTION','DIV'].includes(el.tagName)) el = el.nextElementSibling;
    return el;
  }

  function isTouchOnly() {
    try {
      return window.matchMedia && window.matchMedia('(hover: none)').matches;
    } catch (e) {
      return false;
    }
  }

  function makeToggleable(listContainer) {
    if (!listContainer) return;
    const touchOnly = isTouchOnly();
    const items = Array.from(listContainer.querySelectorAll('li'));
    items.forEach(li => {
      if (li.dataset.shaoboAccordionAttached) return;
      li.dataset.shaoboAccordionAttached = '1';

      let detail = li.querySelector('ul, .details, .more, .accordion-panel');
      if (!detail) {
        const headingChild = li.querySelector('h1,h2,h3,h4,strong,b');
        if (headingChild) {
          const wrapper = document.createElement('div');
          wrapper.className = 'shaobo-acc-details';
          let sibling = headingChild.nextSibling;
          let moved = false;
          while (sibling) {
            const next = sibling.nextSibling;
            wrapper.appendChild(sibling);
            moved = true;
            sibling = next;
          }
          if (moved) li.appendChild(wrapper);
          detail = wrapper;
        } else {
          return;
        }
      }

      const computed = window.getComputedStyle(detail);
      const origDisplay = computed && computed.display && computed.display !== 'none' ? computed.display : 'block';

      if (touchOnly) {
        // hide by default on touch-only devices so tap toggles are visible
        detail.style.display = 'none';
      }

      // add accessibility & keyboard support
      if (!li.hasAttribute('tabindex')) li.setAttribute('tabindex', '0');
      if (!li.hasAttribute('role')) li.setAttribute('role', 'button');
      li.setAttribute('aria-expanded', 'false');

      const toggle = (ev) => {
        if (ev && ev.target && ev.target.closest('a,button,input,textarea,select')) return;
        const expanded = li.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          detail.style.display = 'none';
          li.setAttribute('aria-expanded', 'false');
        } else {
          detail.style.display = origDisplay;
          li.setAttribute('aria-expanded', 'true');
        }
      };

      li.addEventListener('click', toggle, { passive: true });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(e);
        }
      });
    });
  }

  const init = () => {
    const container = findEducationExperienceContainer();
    if (!container) return;
    makeToggleable(container);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('orientationchange', init, { passive: true });
  window.addEventListener('resize', () => {
    clearTimeout(window.__shaoboAccordionResizeT);
    window.__shaoboAccordionResizeT = setTimeout(init, 200);
  });
})();
