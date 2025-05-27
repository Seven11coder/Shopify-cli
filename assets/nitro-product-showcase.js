
// Main initialization
function initNitro() {
  if (typeof Flickity === 'undefined') {
    setTimeout(initNitro, 100);
    return;
  }
  
  initSliders();
  initVariants();
  initPurchaseOptions();
  initAddToCart();
}

// Initialize sliders
function initSliders() {
  document.querySelectorAll('[data-nitro-main-slider]').forEach(slider => {
    const existing = Flickity.data(slider);
    if (existing) existing.destroy();
    
    new Flickity(slider, {
      cellAlign: 'left',
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      draggable: true,
      wrapAround: false,
      imagesLoaded: true
    });
  });

  document.querySelectorAll('[data-nitro-thumb-slider]').forEach(slider => {
    const existing = Flickity.data(slider);
    if (existing) existing.destroy();
    
    const mainSlider = document.querySelector('[data-nitro-main-slider]');
    new Flickity(slider, {
      asNavFor: mainSlider,
      cellAlign: 'left',
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      draggable: true,
      wrapAround: false,
      imagesLoaded: true
    });
  });
}

// Initialize variant selection
function initVariants() {
  // Tab functionality
  document.querySelectorAll('.nitro-tab').forEach(tab => {
    tab.onclick = (e) => {
      document.querySelectorAll('.nitro-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      document.querySelectorAll('.nitro-variants-grid').forEach(g => g.classList.add('hidden'));
      const target = document.querySelector(`#${e.target.dataset.tab}-content`);
      if (target) target.classList.remove('hidden');
    };
  });

  // Variant selection
  document.querySelectorAll('.nitro-variant-item').forEach(item => {
    item.onclick = () => {
      document.querySelectorAll('.nitro-variant-item').forEach(v => v.classList.remove('selected'));
      item.classList.add('selected');
      
      const variantId = item.dataset.variantId;
      document.getElementById('variant-id').value = variantId;
      
      updatePricing();
    };
  });
}

// Initialize purchase options
function initPurchaseOptions() {
  document.querySelectorAll('input[name="purchase_type"]').forEach(radio => {
    radio.onchange = function() {
      const quantity = this.dataset.quantity;
      const isSubscription = this.dataset.subscription === 'true';
      
      document.getElementById('quantity').value = quantity;
      document.getElementById('subscription').value = isSubscription ? 'true' : '';
      document.getElementById('frequency').value = isSubscription ? document.getElementById('delivery-frequency').value : '';
      
      updateMainPrice(quantity, isSubscription);
    };
  });

  document.getElementById('delivery-frequency').onchange = function() {
    document.getElementById('frequency').value = this.value;
  };
}

// Update pricing
function updatePricing() {
  const basePrice = window.productData.price / 100;
  
  // Calculate prices for different quantities
  const price6 = (basePrice / 12) * 6; // Price per can * 6
  const price12 = basePrice;
  
  // One-time purchase prices
  document.getElementById('onetime-6-price').textContent = `$${price6.toFixed(2)}`;
  document.getElementById('onetime-12-price').textContent = `$${price12.toFixed(2)}`;
  
  // Subscription prices (10% off)
  document.getElementById('subscription-6-price').textContent = `$${(price6 * 0.9).toFixed(2)}`;
  document.getElementById('subscription-6-original').textContent = `$${price6.toFixed(2)}`;
  document.getElementById('subscription-12-price').textContent = `$${(price12 * 0.9).toFixed(2)}`;
  document.getElementById('subscription-12-original').textContent = `$${price12.toFixed(2)}`;
  
  // Update main price based on current selection
  const selectedOption = document.querySelector('input[name="purchase_type"]:checked');
  if (selectedOption) {
    updateMainPrice(selectedOption.dataset.quantity, selectedOption.dataset.subscription === 'true');
  }
}

// Update main price display
function updateMainPrice(quantity, isSubscription) {
  const basePrice = window.productData.price / 100;
  const pricePerCan = basePrice / 12;
  let totalPrice = pricePerCan * quantity;
  
  if (isSubscription) {
    totalPrice *= 0.9; // 10% discount
  }
  
  document.getElementById('main-price').textContent = `$${totalPrice.toFixed(2)}`;
  document.getElementById('price-note').textContent = `${quantity} Cans`;
}

// Initialize add to cart
function initAddToCart() {
  const form = document.querySelector('[data-product-form]');
  const btn = document.getElementById('add-to-cart');
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Adding...';
    
    try {
      const formData = new FormData(form);
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        btn.querySelector('span').textContent = 'Added!';
        btn.style.background = '#28a745';
        
        // Update cart count if exists
        const cartCount = document.querySelector('.cart-count-bubble');
        if (cartCount) {
          const cart = await fetch('/cart.js').then(r => r.json());
          cartCount.textContent = cart.item_count;
        }
        
        setTimeout(() => {
          btn.querySelector('span').textContent = 'Add to Cart';
          btn.style.background = '';
          btn.disabled = false;
        }, 2000);
      } else {
        throw new Error('Failed to add');
      }
    } catch (error) {
      btn.querySelector('span').textContent = 'Error';
      btn.style.background = '#dc3545';
      
      setTimeout(() => {
        btn.querySelector('span').textContent = 'Add to Cart';
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }
  };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', initNitro);

// Handle Shopify theme editor
['load', 'unload', 'select', 'deselect', 'reorder'].forEach(event => {
  document.addEventListener(`shopify:section:${event}`, initNitro);
});

window.addEventListener('resize', initSliders);

// Initialize pricing on load
if (window.productData) {
  setTimeout(updatePricing, 100);
}
