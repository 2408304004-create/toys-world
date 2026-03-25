/* ============================================================
   TOY WORLD — JavaScript
   Cart functionality, smooth scrolling, animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== CART STATE ====================
  const cart = [];

  // DOM elements
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItems = document.getElementById('cart-items');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const cartShopLink = document.getElementById('cart-shop-link');
  const toastContainer = document.getElementById('toast-container');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navbar = document.getElementById('navbar');
  const newsletterForm = document.getElementById('newsletter-form');

  // ==================== NAVBAR SCROLL EFFECT ====================
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    // Add shadow when scrolled
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section highlight
    updateActiveNav();
    lastScroll = scrollTop;
  });

  // ==================== ACTIVE NAV LINK ====================
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (navLink) {
        if (scrollPos >= top && scrollPos < top + height) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  }

  // ==================== MOBILE NAV TOGGLE ====================
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        // Close cart if open
        closeCart();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==================== ADD TO CART ====================
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      // Find the product image
      const card = btn.closest('.product-card');
      const imgSrc = card.querySelector('.product-image img').src;

      // Check if already in cart
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ name, price, imgSrc, qty: 1 });
      }

      // Button animation
      btn.classList.add('added');
      const originalText = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = 'Added!';

      setTimeout(() => {
        btn.classList.remove('added');
        btn.querySelector('span').textContent = originalText;
      }, 1000);

      // Flying animation from card to cart icon
      flyToCart(e, card);

      // Update cart UI
      updateCart();

      // Show toast
      showToast(`${name} added to cart!`);
    });
  });

  // ==================== FLYING ANIMATION ====================
  function flyToCart(e, card) {
    const img = card.querySelector('.product-image img');
    const clone = img.cloneNode(true);
    const rect = img.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    clone.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      z-index: 5000;
      pointer-events: none;
      transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      border-radius: 12px;
    `;

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.width = '30px';
      clone.style.height = '30px';
      clone.style.opacity = '0.3';
    });

    setTimeout(() => clone.remove(), 800);
  }

  // ==================== UPDATE CART ====================
  function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Update count badge
    cartCount.textContent = totalItems;
    if (totalItems > 0) {
      cartCount.classList.add('show');
      cartCount.classList.add('bump');
      setTimeout(() => cartCount.classList.remove('bump'), 400);
    } else {
      cartCount.classList.remove('show');
    }

    // Render cart items
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <span class="cart-empty-icon">🛍️</span>
          <p>Your cart is empty</p>
          <a href="#shop" class="btn btn-secondary">Start Shopping</a>
        </div>
      `;
      cartFooter.style.display = 'none';
    } else {
      cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeItem(${index})">✕</button>
        </div>
      `).join('');

      cartFooter.style.display = 'block';
      cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    }
  }

  // Global functions for cart interaction
  window.updateQty = (index, delta) => {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    updateCart();
  };

  window.removeItem = (index) => {
    const name = cart[index].name;
    cart.splice(index, 1);
    updateCart();
    showToast(`${name} removed from cart`);
  };

  // ==================== CART SIDEBAR TOGGLE ====================
  function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Close cart on shop link click inside cart
  cartItems.addEventListener('click', (e) => {
    if (e.target.closest('a[href="#shop"]')) {
      closeCart();
    }
  });

  // ==================== TOAST NOTIFICATIONS ====================
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✅</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // ==================== NEWSLETTER FORM ====================
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    showToast(`Subscribed! Welcome aboard 🎉`);
    newsletterForm.reset();
  });

  // ==================== SCROLL-TRIGGERED ANIMATIONS ====================
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger delay from data attribute
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  // ==================== PRODUCT CARD TILT EFFECT ====================
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ==================== CHECKOUT BUTTON ====================
  const checkoutBtn = document.querySelector('.cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        showToast('Order placed successfully! 🎉');
        cart.length = 0;
        updateCart();
        closeCart();
      }
    });
  }
});
