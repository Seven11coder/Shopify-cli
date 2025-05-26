// Add CDN link for Flickity
const flickityCSS = document.createElement('link');
flickityCSS.rel = 'stylesheet';
flickityCSS.href = 'https://unpkg.com/flickity@2/dist/flickity.min.css';
document.head.appendChild(flickityCSS);

const flickityJS = document.createElement('script');
flickityJS.src = 'https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js';
document.head.appendChild(flickityJS);

function initNitroProductSliders(sectionId = null) {
  const mainSliders = sectionId
    ? document.querySelectorAll(`[data-section-id="${sectionId}"][data-nitro-main-slider]`)
    : document.querySelectorAll('[data-nitro-main-slider]');

  const thumbSliders = sectionId
    ? document.querySelectorAll(`[data-section-id="${sectionId}"][data-nitro-thumb-slider]`)
    : document.querySelectorAll('[data-nitro-thumb-slider]');

  // Initialize main sliders
  mainSliders.forEach(slider => {
    const existing = Flickity.data(slider);
    if (existing) existing.destroy();

    const flkty = new Flickity(slider, {
      cellAlign: 'left',
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      draggable: true,
      wrapAround: false,
      imagesLoaded: true,
    });

    flkty.resize();
    setTimeout(() => flkty.resize(), 500);
  });

  // Initialize thumb sliders
  thumbSliders.forEach(slider => {
    const existing = Flickity.data(slider);
    if (existing) existing.destroy();

    const sectionId = slider.dataset.sectionId;
    const mainSlider = document.querySelector(`[data-section-id="${sectionId}"][data-nitro-main-slider]`);

    const flkty = new Flickity(slider, {
      asNavFor: mainSlider,
      cellAlign: 'left',
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      draggable: true,
      wrapAround: false,
      imagesLoaded: true,
    });

    flkty.resize();
    setTimeout(() => flkty.resize(), 500);
  });
}

function initNitroEvents(sectionId = null) {
  const sections = sectionId
    ? document.querySelectorAll(`[data-section-id="${sectionId}"].nitro-product-showcase`)
    : document.querySelectorAll('.nitro-product-showcase');

  sections.forEach(section => {
    // Tabs functionality
    section.querySelectorAll('.nitro-tab').forEach(tab => {
      tab.onclick = (e) => {
        section.querySelectorAll('.nitro-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        section.querySelectorAll('.nitro-variants-grid').forEach(g => g.classList.add('hidden'));
        const target = section.querySelector(`#${e.target.dataset.tab}-content`);
        if (target) target.classList.remove('hidden');
      };
    });

    // Variant selection
    section.querySelectorAll('.nitro-variant-item[data-variant-id]').forEach(item => {
      item.onclick = () => {
        section.querySelectorAll('.nitro-variant-item').forEach(v => v.classList.remove('selected'));
        item.classList.add('selected');
        
        const variantId = item.dataset.variantId;
        const hiddenRadio = section.querySelector(`input[type="radio"][value*="${variantId}"]`);
        if (hiddenRadio) {
          hiddenRadio.checked = true;
          hiddenRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
    });
  });
}

// Initialize everything
function initNitroSections(sectionId = null) {
  // Wait for Flickity to load
  if (typeof Flickity === 'undefined') {
    setTimeout(() => initNitroSections(sectionId), 100);
    return;
  }
  
  initNitroProductSliders(sectionId);
  initNitroEvents(sectionId);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => initNitroSections());

// Handle all Shopify section events
['load', 'unload', 'select', 'deselect', 'reorder'].forEach(event => {
  document.addEventListener(`shopify:section:${event}`, (e) => {
    initNitroSections(e.detail.sectionId);
  });
});

// Handle block events
['select', 'deselect'].forEach(event => {
  document.addEventListener(`shopify:block:${event}`, (e) => {
    initNitroSections(e.detail.sectionId);
  });
});

// Handle resize
window.addEventListener('resize', () => {
  initNitroSections();
});
