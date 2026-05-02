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

/* ============================================================
   TOYBOT — Chatbot Engine
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  const toggleBtn    = document.getElementById('chatbot-toggle');
  const chatWindow   = document.getElementById('chatbot-window');
  const minimizeBtn  = document.getElementById('chatbot-minimize');
  const messagesEl   = document.getElementById('chatbot-messages');
  const quickReplies = document.getElementById('chatbot-quick-replies');
  const inputEl      = document.getElementById('chatbot-input');
  const sendBtn      = document.getElementById('chatbot-send');
  const notifDot     = document.getElementById('chatbot-notif-dot');
  const toggleIcon   = document.getElementById('chatbot-toggle-icon');

  let isOpen = false;

  /* ---------- Knowledge base ---------- */
  const KB = [
    {
      patterns: ['hello', 'hi', 'hey', 'hiya', 'howdy', 'greetings', 'sup'],
      response: "Hey there! 👋 I'm ToyBot, your friendly toy helper! How can I make your day more magical? 🌟",
      chips: ['Browse toys', 'Best sellers', "Today's deals"]
    },
    {
      patterns: ['bye', 'goodbye', 'see you', 'later', 'cya', 'farewell'],
      response: "Bye bye! 🧸 Thanks for visiting ToyWorld! Come back soon — we have new toys arriving every week! 🎉",
      chips: ['Start over']
    },
    {
      patterns: ['thanks', 'thank you', 'thx', 'cheers', 'appreciate'],
      response: "You're so welcome! 💖 Happy to help! Is there anything else I can assist you with?",
      chips: ['Shipping info', 'Return policy', 'Contact us']
    },
    {
      patterns: ['best seller', 'popular', 'top', 'trending', 'favourite', 'favorite', 'browse'],
      response: "Our top picks right now are 🐰 Cuddly Bunny Plush ($24.99), 🧸 Classic Teddy Bear ($29.99), 🦄 Magical Unicorn ($34.99), and 🤖 Smart Robot Buddy ($44.99)! All loved by thousands of kids!",
      chips: ['Add to cart tips', 'Age recommendations', 'Gift ideas']
    },
    {
      patterns: ['sale', 'discount', 'offer', 'deal', 'promo', 'coupon', 'code', 'off', 'cheap', 'price'],
      response: "🎁 Great news! Use code <strong>TOYWORLD25</strong> for 25% OFF your first order! Plus enjoy FREE shipping on orders over $50. Don't miss out!",
      chips: ['Shipping info', 'Browse toys', 'How to order']
    },
    {
      patterns: ['ship', 'shipping', 'delivery', 'deliver', 'arrive', 'arrival', 'dispatch', 'how long'],
      response: "🚚 We offer FREE standard shipping on orders over $50! Standard delivery is 3–5 business days. Express delivery (1–2 days) is also available at checkout for a small fee.",
      chips: ['Return policy', 'Track order', 'Order status']
    },
    {
      patterns: ['return', 'refund', 'exchange', 'policy', 'send back', 'money back'],
      response: "↩️ No worries! We offer a hassle-free 30-day return policy. Items must be in original condition and packaging. Just contact us and we'll sort it out quickly!",
      chips: ['Contact us', 'Shipping info', 'Order status']
    },
    {
      patterns: ['safe', 'safety', 'material', 'toxic', 'certified', 'non-toxic', 'quality'],
      response: "🛡️ Safety is our #1 priority! Every toy at ToyWorld passes rigorous safety testing. All materials are 100% non-toxic and certified to meet international safety standards. Kids first, always!",
      chips: ['Age recommendations', 'Browse toys', 'About ToyWorld']
    },
    {
      patterns: ['age', 'old', 'suitable', 'recommend', 'toddler', 'baby', 'kid', 'child', 'year'],
      response: "🎈 We have toys for all ages!\n• 0–2 years: Soft plushies & sensory toys\n• 3–5 years: Building blocks & puzzles\n• 6–9 years: Action figures & STEM kits\n• 10+ years: Robots & creative sets\n\nCheck product pages for specific age ratings!",
      chips: ['Best sellers', 'Gift ideas', 'Browse categories']
    },
    {
      patterns: ['gift', 'present', 'birthday', 'christmas', 'holiday', 'surprise'],
      response: "🎁 Looking for the perfect gift? Our top gifting picks:\n• 🐰 Cuddly Bunny Plush — a timeless classic\n• 🦄 Magical Unicorn — every kid's dream\n• 🤖 Smart Robot Buddy — great for curious minds!\n\nWe also offer gift wrapping at checkout! 🎀",
      chips: ['Best sellers', "Today's deals", 'Shipping info']
    },
    {
      patterns: ['soft', 'plush', 'stuffed', 'cuddly', 'teddy', 'bear', 'bunny', 'unicorn'],
      response: "🧸 Our Soft Toy collection is pure fluffiness! We have 120+ plush toys including the Cuddly Bunny ($24.99), Classic Teddy Bear ($29.99), and sparkling Magical Unicorn ($34.99). All huggably soft and safe!",
      chips: ['Add to cart tips', 'Age recommendations', 'Best sellers']
    },
    {
      patterns: ['robot', 'stem', 'science', 'tech', 'educational', 'learn', 'smart', 'puzzle', 'block', 'building'],
      response: "🤖 STEM & educational toys are a fantastic investment! Our Smart Robot Buddy ($44.99) teaches coding basics through play, and Rainbow Building Blocks ($19.99) are perfect for motor skills. 85+ educational items in store!",
      chips: ['Best sellers', 'Age recommendations', 'Safety info']
    },
    {
      patterns: ['action', 'figure', 'hero', 'superhero', 'car', 'vehicle', 'train', 'truck'],
      response: "🦸 Calling all little heroes! We stock 95+ action figures and 55+ vehicle toys — from classic cars to epic superheroes. Perfect for imaginative play adventures!",
      chips: ['Age recommendations', 'Best sellers', 'Gift ideas']
    },
    {
      patterns: ['art', 'craft', 'draw', 'paint', 'creative', 'colour', 'color'],
      response: "🎨 Nurture creativity with our 70+ Arts & Crafts toys! Drawing kits, painting sets, clay, and more. Great for kids 3+ who love to express themselves!",
      chips: ['Age recommendations', 'Best sellers', 'Browse categories']
    },
    {
      patterns: ['cart', 'add', 'buy', 'purchase', 'order', 'how to order', 'checkout'],
      response: "🛒 Super easy! Click \"Add to Cart\" on any product, view your cart via the cart icon in the top nav, and hit Checkout. Use code <strong>TOYWORLD25</strong> for 25% off your first order!",
      chips: ["Today's deals", 'Shipping info', 'Payment methods']
    },
    {
      patterns: ['payment', 'pay', 'credit', 'debit', 'card', 'paypal', 'method'],
      response: "💳 We accept Visa, Mastercard, American Express, and PayPal. All transactions are encrypted and 100% secure. 🔒",
      chips: ['How to order', 'Return policy', 'Shipping info']
    },
    {
      patterns: ['contact', 'reach', 'support', 'help', 'email', 'phone', 'call', 'talk'],
      response: "📞 Reach us anytime!\n• 📧 hello@toyworld.com\n• 📞 +1 (800) 123-TOYS\n• 📍 123 Toy Street, Fun City, USA\n• 🕐 Mon–Sat: 9AM – 8PM\n\nWe reply to emails within 2–4 hours!",
      chips: ['Return policy', 'Track order', 'Start over']
    },
    {
      patterns: ['track', 'tracking', 'where is', 'status', 'order status'],
      response: "📦 Track your order using the number sent to your email after purchase. Enter it on the carrier's website for live updates. Need help? Email hello@toyworld.com!",
      chips: ['Contact us', 'Shipping info', 'Return policy']
    },
    {
      patterns: ['about', 'who', 'toyworld', 'story', 'since', 'company', 'brand'],
      response: "💛 ToyWorld was founded in 2010 with a simple dream — making childhood magical! We're parents and child development experts curating the finest, safest toys globally. 10K+ happy kids and counting! 🌍",
      chips: ['Safety info', 'Best sellers', 'Contact us']
    },
    {
      patterns: ['start over', 'restart', 'reset', 'new', 'menu', 'home', 'main'],
      response: "Sure! Let's start fresh 🌟 How can I help you today?",
      chips: ['Browse toys', 'Best sellers', "Today's deals", 'Shipping info', 'Contact us']
    }
  ];

  /* Chip → query text */
  const CHIP_MAP = {
    'Browse toys':         'What toys do you have?',
    'Best sellers':        'What are your best sellers?',
    "Today's deals":       'Any discounts or deals today?',
    'Shipping info':       'How does shipping work?',
    'Return policy':       'What is your return policy?',
    'Contact us':          'How can I contact you?',
    'Age recommendations': 'What toys are suitable for different ages?',
    'Gift ideas':          'I need gift ideas',
    'Browse categories':   'Show me your categories',
    'Add to cart tips':    'How do I add items to cart?',
    'Safety info':         'Are your toys safe?',
    'Payment methods':     'What payment methods do you accept?',
    'How to order':        'How do I place an order?',
    'Track order':         'How do I track my order?',
    'Order status':        'What is my order status?',
    'About ToyWorld':      'Tell me about ToyWorld',
    'Start over':          'Start over',
  };

  const FALLBACK = "Hmm, I'm not sure about that! 🤔 Try asking about our toys, shipping, deals, or contact our support team at hello@toyworld.com! 💖";
  const FALLBACK_CHIPS = ['Best sellers', 'Shipping info', 'Contact us', 'Browse toys'];

  const WELCOME_MSG = "Hi there! 👋 I'm <strong>ToyBot</strong>, your magical toy assistant! ✨\n\nI can help you find the perfect toy, check deals, learn about shipping, and more. What are you looking for today?";
  const WELCOME_CHIPS = ['Browse toys', 'Best sellers', "Today's deals", 'Shipping info', 'Gift ideas'];

  /* ---------- Helpers ---------- */
  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function findResponse(text) {
    const lower = text.toLowerCase().trim();
    for (const entry of KB) {
      if (entry.patterns.some(p => lower.includes(p))) return entry;
    }
    return null;
  }

  /* ---------- Render ---------- */
  function appendMessage(role, html) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = role === 'bot' ? '🧸' : '😊';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.innerHTML = html.replace(/\n/g, '<br>');

    const time = document.createElement('div');
    time.className = 'chat-msg-time';
    time.textContent = getTime();

    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;max-width:76%';
    col.appendChild(bubble);
    col.appendChild(time);

    wrapper.appendChild(avatar);
    wrapper.appendChild(col);
    messagesEl.appendChild(wrapper);
    scrollBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.id = 'chat-typing-indicator';
    const av = document.createElement('div');
    av.className = 'chat-msg-avatar';
    av.textContent = '🧸';
    const b = document.createElement('div');
    b.className = 'chat-typing-bubble';
    b.innerHTML = '<span></span><span></span><span></span>';
    el.appendChild(av);
    el.appendChild(b);
    messagesEl.appendChild(el);
    scrollBottom();
  }

  function removeTyping() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function renderChips(chips) {
    quickReplies.innerHTML = '';
    if (!chips || !chips.length) return;
    chips.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-chip';
      btn.textContent = label;
      btn.style.animationDelay = `${i * 60}ms`;
      btn.addEventListener('click', () => handleUserMessage(CHIP_MAP[label] || label));
      quickReplies.appendChild(btn);
    });
  }

  /* ---------- Core ---------- */
  function handleUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    quickReplies.innerHTML = '';
    appendMessage('user', trimmed);
    inputEl.value = '';
    showTyping();
    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      removeTyping();
      const result = findResponse(trimmed);
      if (result) {
        appendMessage('bot', result.response);
        renderChips(result.chips);
      } else {
        appendMessage('bot', FALLBACK);
        renderChips(FALLBACK_CHIPS);
      }
    }, delay);
  }

  /* ---------- Toggle ---------- */
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    toggleIcon.textContent = '✕';
    notifDot.classList.add('hidden');
    setTimeout(() => inputEl.focus(), 350);
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    toggleIcon.textContent = '🧸';
  }

  toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  minimizeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', () => handleUserMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') handleUserMessage(inputEl.value); });

  /* ---------- Boot ---------- */
  setTimeout(() => {
    appendMessage('bot', WELCOME_MSG);
    renderChips(WELCOME_CHIPS);
  }, 400);

})();
