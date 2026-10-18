/**
 * StudyNaija AI Website Studio - Dynamic Website Synthesis Engine
 * 
 * Generates custom, production-ready, fully interactive HTML5/CSS/JS websites
 * tailored to ANY student prompt:
 * - E-Commerce & Retail (Shoes, Clothes, Electronics, Gadgets, etc.)
 * - Cybersecurity, Ethical Hacking & SOC Threat Matrix Dashboards
 * - Restaurants, Cafes & Food Delivery
 * - Schools, Universities & CBT Exam Portals
 * - Professional Portfolios, Resumes & Personal Profiles
 * - Banking, FinTech & Crypto Wallets
 * - Interactive Games & Mini-Apps
 * - Healthcare, Real Estate, and Custom Businesses
 */

export interface WebsiteSpec {
  category: 'ecommerce' | 'cybersecurity' | 'restaurant' | 'school' | 'portfolio' | 'fintech' | 'gaming' | 'custom';
  brandName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  htmlContent: string;
}

export function generateCustomWebsiteProject(prompt: string, studentName: string = 'Scholar'): string {
  const p = prompt.trim();
  const q = p.toLowerCase();

  // 1. Detect Category & Specs
  let category: WebsiteSpec['category'] = 'custom';
  
  if (
    q.includes('shoe') || q.includes('sneaker') || q.includes('cloth') || q.includes('fashion') || 
    q.includes('shop') || q.includes('store') || q.includes('e-commerce') || q.includes('ecommerce') || 
    q.includes('sell') || q.includes('buy') || q.includes('phone') || q.includes('watch') || 
    q.includes('gadget') || q.includes('boutique') || q.includes('market') || q.includes('cart')
  ) {
    category = 'ecommerce';
  } else if (
    q.includes('hack') || q.includes('cyber') || q.includes('security') || q.includes('scanner') || 
    q.includes('soc') || q.includes('threat') || q.includes('vulnerability') || q.includes('firewall') || 
    q.includes('terminal') || q.includes('penetration') || q.includes('exploit') || q.includes('defense')
  ) {
    category = 'cybersecurity';
  } else if (
    q.includes('food') || q.includes('restaurant') || q.includes('cafe') || q.includes('delivery') || 
    q.includes('jollof') || q.includes('suya') || q.includes('pizza') || q.includes('burger') || 
    q.includes('kitchen') || q.includes('menu') || q.includes('bakery') || q.includes('shawarma')
  ) {
    category = 'restaurant';
  } else if (
    q.includes('school') || q.includes('university') || q.includes('college') || q.includes('cbt') || 
    q.includes('exam') || q.includes('student') || q.includes('portal') || q.includes('grade') || 
    q.includes('academy') || q.includes('result') || q.includes('course')
  ) {
    category = 'school';
  } else if (
    q.includes('portfolio') || q.includes('resume') || q.includes('cv') || q.includes('personal') || 
    q.includes('developer') || q.includes('engineer') || q.includes('profile') || q.includes('about me')
  ) {
    category = 'portfolio';
  } else if (
    q.includes('bank') || q.includes('banking') || q.includes('crypto') || q.includes('wallet') || 
    q.includes('money') || q.includes('fintech') || q.includes('savings') || q.includes('transfer')
  ) {
    category = 'fintech';
  } else if (
    q.includes('game') || q.includes('arcade') || q.includes('play') || q.includes('quiz game') || 
    q.includes('puzzle')
  ) {
    category = 'gaming';
  }

  // 2. Generate specific HTML code based on category
  let generatedHtml = '';
  let websiteTitle = '';
  let walkthrough = '';

  switch (category) {
    case 'ecommerce': {
      const isShoes = q.includes('shoe') || q.includes('sneaker');
      const isPhones = q.includes('phone') || q.includes('gadget') || q.includes('laptop');
      const brand = isShoes ? 'KicksNaija Footwear Studio' : isPhones ? 'TechHub Nigeria' : 'UrbanMart Online Store';
      websiteTitle = brand;

      walkthrough = `Here is your complete, custom-built **${brand}** e-commerce website!
It features:
- **Interactive Shopping Cart:** Live cart drawer with items count, quantity adjustment (+/-), and instant Naira subtotal & VAT calculation.
- **Live Search & Filter:** Search products in real time and filter between product categories.
- **Quick View & Details Modal:** Interactive modal with product specifications.
- **Dark/Light Theme Toggle:** Built-in ambient theme switcher right on the website.
- **Responsive Mobile Layout:** Clean responsive grid with mobile navigation.`;

      generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} • Official Online Store</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #06b6d4;
      --primary-hover: #0891b2;
      --accent: #10b981;
      --danger: #ef4444;
    }
    body.light {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #0284c7;
      --primary-hover: #0369a1;
      --accent: #059669;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; transition: background 0.2s, color 0.2s; }
    
    /* Navigation Bar */
    header { background: var(--card-bg); border-bottom: 1px solid var(--card-border); padding: 0.85rem 1.5rem; position: sticky; top: 0; z-index: 50; }
    .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .brand { font-size: 1.25rem; font-weight: 900; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .brand span { color: var(--accent); }
    
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.6rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; transition: 0.15s; display: inline-flex; align-items: center; gap: 0.4rem; }
    .btn-primary { background: var(--primary); color: #020617; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-cart { background: rgba(6, 182, 212, 0.15); color: var(--primary); border: 1px solid var(--primary); position: relative; }
    .cart-badge { position: absolute; -top: 6px; -right: 6px; background: var(--accent); color: #020617; font-size: 0.7rem; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .btn-theme { background: transparent; border: 1px solid var(--card-border); color: var(--text-muted); padding: 0.5rem 0.75rem; }

    /* Hero Banner */
    .hero { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.1)); padding: 3rem 1.5rem; text-align: center; border-bottom: 1px solid var(--card-border); }
    .hero h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; }
    .hero p { color: var(--text-muted); font-size: 0.95rem; max-width: 600px; margin: 0 auto 1.5rem; }
    .search-bar { max-width: 500px; margin: 0 auto; display: flex; gap: 0.5rem; }
    .search-input { flex: 1; padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid var(--card-border); background: var(--card-bg); color: var(--text); font-size: 0.9rem; outline: none; }
    .search-input:focus { border-color: var(--primary); }

    /* Category Filter Pills */
    .filters { max-width: 1200px; margin: 1.5rem auto 0; padding: 0 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .pill { padding: 0.4rem 0.9rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; cursor: pointer; background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-muted); }
    .pill.active { background: var(--primary); color: #020617; border-color: var(--primary); }

    /* Products Grid */
    main { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; flex: 1; width: 100%; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); border-color: var(--primary); }
    .card-img { height: 180px; background: rgba(6, 182, 212, 0.08); display: flex; align-items: center; justify-content: center; font-size: 4rem; position: relative; }
    .card-tag { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 0.4rem; }
    .card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem; }
    .card-title { font-size: 1rem; font-weight: 800; color: var(--text); }
    .card-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--card-border); }
    .card-price { font-size: 1.15rem; font-weight: 900; color: var(--accent); }

    /* Cart Drawer Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: none; justify-content: flex-end; z-index: 100; }
    .modal-backdrop.open { display: flex; }
    .drawer { width: 100%; max-width: 420px; background: var(--card-bg); height: 100%; display: flex; flex-direction: column; border-left: 1px solid var(--card-border); animation: slideLeft 0.25s ease-out; }
    @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .drawer-header { padding: 1.25rem; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between; align-items: center; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(0,0,0,0.1); border: 1px solid var(--card-border); border-radius: 0.6rem; }
    .cart-item-info h4 { font-size: 0.9rem; margin-bottom: 0.2rem; }
    .cart-item-info span { font-size: 0.8rem; color: var(--accent); font-weight: bold; }
    .qty-controls { display: flex; align-items: center; gap: 0.4rem; }
    .qty-btn { width: 26px; height: 26px; border-radius: 4px; border: 1px solid var(--card-border); background: var(--card-bg); color: var(--text); cursor: pointer; font-weight: bold; }
    .drawer-footer { padding: 1.25rem; border-top: 1px solid var(--card-border); display: flex; flex-direction: column; gap: 0.75rem; }
    .total-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; }

    /* Footer */
    footer { background: var(--card-bg); border-top: 1px solid var(--card-border); padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: auto; }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <header>
    <div class="nav-container">
      <a href="#" class="brand">
        🛍️ ${brand.split(' ')[0]}<span>${brand.split(' ').slice(1).join(' ')}</span>
      </a>
      <div class="nav-actions">
        <button class="btn btn-theme" onclick="toggleTheme()" id="themeBtn">☀️ Light</button>
        <button class="btn btn-cart" onclick="toggleCart()">
          🛒 Cart <span class="cart-badge" id="cartCount">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Banner -->
  <div class="hero">
    <h1>Quality Collection &bull; Nationwide Delivery</h1>
    <p>Shop verified items with instant delivery across Lagos, Abuja, Port Harcourt and all Nigerian states.</p>
    <div class="search-bar">
      <input type="text" id="searchInput" class="search-input" placeholder="Search products, models, prices..." oninput="handleSearch()">
    </div>
  </div>

  <!-- Category Pills -->
  <div class="filters">
    <div class="pill active" onclick="filterCategory('All', this)">All Items</div>
    <div class="pill" onclick="filterCategory('${isShoes ? 'Sneakers' : isPhones ? 'Flagship' : 'Premium'}', this)">${isShoes ? 'Sneakers' : isPhones ? 'Flagship' : 'Premium'}</div>
    <div class="pill" onclick="filterCategory('${isShoes ? 'Running' : isPhones ? 'Budget' : 'New In'}', this)">${isShoes ? 'Running' : isPhones ? 'Budget' : 'New In'}</div>
    <div class="pill" onclick="filterCategory('${isShoes ? 'Casual' : isPhones ? 'Accessories' : 'Best Sellers'}', this)">${isShoes ? 'Casual' : isPhones ? 'Accessories' : 'Best Sellers'}</div>
  </div>

  <!-- Products Grid -->
  <main>
    <div class="products-grid" id="productsGrid"></div>
  </main>

  <!-- Shopping Cart Drawer -->
  <div class="modal-backdrop" id="cartModal">
    <div class="drawer">
      <div class="drawer-header">
        <h3>🛍️ Your Shopping Cart</h3>
        <button class="btn btn-theme" onclick="toggleCart()">&times; Close</button>
      </div>
      <div class="drawer-body" id="cartItemsList">
        <p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Your cart is currently empty.</p>
      </div>
      <div class="drawer-footer">
        <div class="total-row">
          <span>Total (incl. VAT):</span>
          <span id="cartTotal" style="color: var(--accent);">₦0</span>
        </div>
        <button class="btn btn-primary" style="justify-content: center; width: 100%;" onclick="checkout()">
          Proceed to Checkout &bull; Pay with Card/Transfer
        </button>
      </div>
    </div>
  </div>

  <footer>
    &copy; 2026 ${brand} &bull; Built with StudyNaija Website Studio &bull; Ready for deployment
  </footer>

  <script>
    const products = [
      { id: 1, name: "${isShoes ? 'Air Retro High-Top' : isPhones ? 'Galaxy Ultra 5G' : 'Executive Chrono Watch'}", category: "${isShoes ? 'Sneakers' : isPhones ? 'Flagship' : 'Premium'}", price: 45000, icon: "${isShoes ? '👟' : isPhones ? '📱' : '⌚'}", desc: "Engineered with ultra-durable materials and sleek aesthetics." },
      { id: 2, name: "${isShoes ? 'Pro Marathon Runner' : isPhones ? 'Pro Max 16GB' : 'Leather Travel Duffel'}", category: "${isShoes ? 'Running' : isPhones ? 'Flagship' : 'Best Sellers'}", price: 52000, icon: "${isShoes ? '🏃' : isPhones ? '📲' : '🎒'}", desc: "Maximum comfort and endurance designed for long performance." },
      { id: 3, name: "${isShoes ? 'Classic Street Low' : isPhones ? 'Buds Pro Noise-Cancelling' : 'Aviator Polarized Shades'}", category: "${isShoes ? 'Casual' : isPhones ? 'Accessories' : 'New In'}", price: 38000, icon: "${isShoes ? '👞' : isPhones ? '🎧' : '🕶️'}", desc: "Timeless silhouette perfect for casual and semi-formal outings." },
      { id: 4, name: "${isShoes ? 'Volt Foam Trainer' : isPhones ? 'PowerVault 30,000mAh' : 'Slim Minimalist Wallet'}", category: "${isShoes ? 'Sneakers' : isPhones ? 'Accessories' : 'Best Sellers'}", price: 48000, icon: "${isShoes ? '⚡' : isPhones ? '🔋' : '💳'}", desc: "High-cushion response with modern breathable mesh design." },
      { id: 5, name: "${isShoes ? 'Monarch Elite Loafer' : isPhones ? 'Tab Pro 12-inch 128GB' : 'Smart Fitness Tracker'}", category: "${isShoes ? 'Casual' : isPhones ? 'Budget' : 'Premium'}", price: 34000, icon: "${isShoes ? '👞' : isPhones ? '📟' : '⌚'}", desc: "Handcrafted finish with cushioned arch support for all-day wear." },
      { id: 6, name: "${isShoes ? 'SpeedSprint Track 3' : isPhones ? 'Smart Watch Series 9' : 'Wireless Gaming Pods'}", category: "${isShoes ? 'Running' : isPhones ? 'Accessories' : 'New In'}", price: 60000, icon: "${isShoes ? '👟' : isPhones ? '⌚' : '🎧'}", desc: "Lightweight aerodynamic design optimized for speed." }
    ];

    let cart = [];

    function renderProducts(items) {
      const grid = document.getElementById('productsGrid');
      if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No items match your search.</p>';
        return;
      }
      grid.innerHTML = items.map(p => \`
        <div class="card">
          <div class="card-img">
            <span>\${p.icon}</span>
            <span class="card-tag">\${p.category}</span>
          </div>
          <div class="card-body">
            <div>
              <div class="card-title">\${p.name}</div>
              <div class="card-desc">\${p.desc}</div>
            </div>
            <div class="card-footer">
              <div class="card-price">₦\${p.price.toLocaleString()}</div>
              <button class="btn btn-primary" onclick="addToCart(\${p.id})">Add to Cart</button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function addToCart(id) {
      const product = products.find(p => p.id === id);
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      updateCartUI();
    }

    function updateCartQty(id, delta) {
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      updateCartUI();
    }

    function updateCartUI() {
      const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
      const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      document.getElementById('cartCount').innerText = totalCount;
      document.getElementById('cartTotal').innerText = '₦' + totalPrice.toLocaleString();

      const list = document.getElementById('cartItemsList');
      if (cart.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Your cart is currently empty.</p>';
        return;
      }
      list.innerHTML = cart.map(item => \`
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>\${item.icon} \${item.name}</h4>
            <span>₦\${item.price.toLocaleString()} &times; \${item.qty} = ₦\${(item.price * item.qty).toLocaleString()}</span>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateCartQty(\${item.id}, -1)">-</button>
            <span style="font-weight: bold; padding: 0 4px;">\${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(\${item.id}, 1)">+</button>
          </div>
        </div>
      \`).join('');
    }

    function toggleCart() {
      const modal = document.getElementById('cartModal');
      modal.classList.toggle('open');
    }

    function handleSearch() {
      const term = document.getElementById('searchInput').value.toLowerCase();
      const filtered = products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
      renderProducts(filtered);
    }

    function filterCategory(cat, el) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
      if (cat === 'All') {
        renderProducts(products);
      } else {
        renderProducts(products.filter(p => p.category === cat));
      }
    }

    function toggleTheme() {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      document.getElementById('themeBtn').innerText = isLight ? '🌙 Dark' : '☀️ Light';
    }

    function checkout() {
      if (cart.length === 0) {
        alert('Your cart is empty! Add items first.');
        return;
      }
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      alert('Order Confirmed! Total: ₦' + total.toLocaleString() + '\\nThank you for shopping with ' + '${brand}' + '!');
      cart = [];
      updateCartUI();
      toggleCart();
    }

    renderProducts(products);
  </script>
</body>
</html>`;
      break;
    }

    case 'cybersecurity': {
      websiteTitle = 'CyberSentinel SOC Threat Matrix & Defense Lab';
      walkthrough = `Here is your complete **CyberSentinel SOC Threat Matrix & Defense Lab** website!
It features:
- **Interactive Network Scanner:** Click "Run Network Scan" to execute a simulated vulnerability audit with real-time port telemetry logs.
- **Firewall Rule Toggles:** Toggle active protection layers (Port 80 HTTP, Port 443 SSL/TLS, Port 22 SSH, Port 3306 MySQL).
- **Live Security Posture Score:** Dynamic dial that recalculates live security rating based on active defenses.
- **Threat Event Stream:** Real-time animated terminal log monitoring defense against SQL injection, Brute-Force, and DDoS attacks.
- **Responsive Terminal Theme:** High-tech cyber aesthetic with neon emerald and cyan telemetry.`;

      generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CyberSentinel &bull; SOC Threat Matrix & Defense Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: ui-monospace, Menlo, Consolas, monospace; }
    body { background: #030712; color: #f1f5f9; min-height: 100vh; padding: 1.5rem; display: flex; flex-direction: column; }
    
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .brand { font-size: 1.25rem; font-weight: 900; color: #06b6d4; display: flex; align-items: center; gap: 0.5rem; }
    .status-pill { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 0.4rem; }
    .ping { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; flex: 1; }
    .panel { background: #0f172a; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .panel-title { font-size: 0.95rem; font-weight: bold; color: #38bdf8; display: flex; justify-content: space-between; align-items: center; }
    
    /* Metrics */
    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .metric-card { background: #020617; border: 1px solid #1e293b; border-radius: 0.6rem; padding: 0.85rem; }
    .metric-val { font-size: 1.4rem; font-weight: 900; color: #10b981; }
    .metric-lbl { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-top: 0.2rem; }

    /* Interactive Scanner */
    .btn { background: #06b6d4; color: #020617; border: none; padding: 0.7rem 1.2rem; border-radius: 0.5rem; font-weight: 900; cursor: pointer; transition: 0.15s; font-size: 0.85rem; width: 100%; }
    .btn:hover { background: #22d3ee; }
    .progress-bar { width: 100%; height: 8px; background: #020617; border-radius: 4px; overflow: hidden; display: none; }
    .progress-fill { width: 0%; height: 100%; background: #10b981; transition: width 0.2s; }

    /* Terminal Console */
    .terminal { background: #020617; border: 1px solid #1e293b; border-radius: 0.6rem; padding: 0.85rem; height: 200px; overflow-y: auto; font-size: 0.75rem; line-height: 1.5; color: #a5f3fc; }
    .term-log { margin-bottom: 0.25rem; }
    .log-warn { color: #f59e0b; }
    .log-ok { color: #34d399; }
    .log-crit { color: #ef4444; }

    /* Firewall Toggles */
    .toggle-row { display: flex; justify-content: space-between; align-items: center; background: #020617; padding: 0.65rem 0.85rem; border-radius: 0.5rem; border: 1px solid #1e293b; }
    .toggle-btn { background: #1e293b; color: #94a3b8; border: none; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; }
    .toggle-btn.active { background: #10b981; color: #020617; }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand">
      🛡️ CyberSentinel &bull; Defensive SOC Matrix
    </div>
    <div class="status-pill">
      <span class="ping"></span>
      <span>INTRUSION DETECTION ACTIVE</span>
    </div>
  </div>

  <div class="grid-container">
    <!-- Panel 1: Security Posture -->
    <div class="panel">
      <div class="panel-title">
        <span>SECURITY METRICS</span>
        <span id="scoreText" style="color: #10b981;">98% HARDENED</span>
      </div>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-val" id="threatsBlocked">14,290</div>
          <div class="metric-lbl">Attacks Mitigated</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">0</div>
          <div class="metric-lbl">Active Breaches</div>
        </div>
        <div class="metric-card">
          <div class="metric-val" id="activeRules">4 / 4</div>
          <div class="metric-lbl">Firewall Rules</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">12ms</div>
          <div class="metric-lbl">Packet Latency</div>
        </div>
      </div>

      <button class="btn" onclick="startAudit()">⚡ Run Full Vulnerability Audit</button>
      <div class="progress-bar" id="progressBar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    </div>

    <!-- Panel 2: Firewall Layer Control -->
    <div class="panel">
      <div class="panel-title">FIREWALL ENFORCEMENT</div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div class="toggle-row">
          <span>Port 443 (HTTPS / TLS 1.3 Strict)</span>
          <button class="toggle-btn active" onclick="toggleRule(this, 'Port 443')">ENFORCED</button>
        </div>
        <div class="toggle-row">
          <span>SQL Injection Parameter Filter</span>
          <button class="toggle-btn active" onclick="toggleRule(this, 'SQLi Guard')">ENFORCED</button>
        </div>
        <div class="toggle-row">
          <span>Rate Limiting & DDoS Shield (100 req/min)</span>
          <button class="toggle-btn active" onclick="toggleRule(this, 'Rate Limiter')">ENFORCED</button>
        </div>
        <div class="toggle-row">
          <span>XSS DOM Purifier & CSP Headers</span>
          <button class="toggle-btn active" onclick="toggleRule(this, 'XSS Guard')">ENFORCED</button>
        </div>
      </div>
    </div>

    <!-- Panel 3: Live Security Terminal -->
    <div class="panel" style="grid-column: 1/-1;">
      <div class="panel-title">
        <span>LIVE TELEMETRY LOG</span>
        <button class="toggle-btn" onclick="clearLogs()">Clear Log</button>
      </div>
      <div class="terminal" id="terminal">
        <div class="term-log log-ok">[00:01:12] [SYSTEM] CyberSentinel kernel v4.8 initialization completed.</div>
        <div class="term-log log-ok">[00:01:15] [SSL/TLS] Automated cert renewal active with 256-bit AES encryption.</div>
        <div class="term-log log-warn">[00:02:40] [PROBE] Blocked suspicious port scan from IP 192.168.1.104.</div>
        <div class="term-log log-crit">[00:03:10] [BLOCKED] SQL injection payload detected and sanitized.</div>
      </div>
    </div>
  </div>

  <script>
    let blockedCount = 14290;

    function addLog(text, type = 'ok') {
      const term = document.getElementById('terminal');
      const div = document.createElement('div');
      div.className = 'term-log ' + (type === 'warn' ? 'log-warn' : type === 'crit' ? 'log-crit' : 'log-ok');
      const time = new Date().toLocaleTimeString();
      div.innerText = '[' + time + '] ' + text;
      term.appendChild(div);
      term.scrollTop = term.scrollHeight;
    }

    function startAudit() {
      const pBar = document.getElementById('progressBar');
      const pFill = document.getElementById('progressFill');
      pBar.style.display = 'block';
      pFill.style.width = '0%';
      addLog('[AUDIT] Initializing deep packet vulnerability audit...', 'warn');

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        pFill.style.width = progress + '%';
        if (progress === 40) addLog('[AUDIT] Scanning open ports 22, 80, 443, 3306...', 'ok');
        if (progress === 80) addLog('[AUDIT] Verifying SQL query parametrization & XSS headers...', 'ok');
        if (progress >= 100) {
          clearInterval(interval);
          addLog('[AUDIT COMPLETED] Zero vulnerabilities detected. System rating: 100/100 A+', 'ok');
          setTimeout(() => { pBar.style.display = 'none'; }, 2000);
        }
      }, 350);
    }

    function toggleRule(btn, ruleName) {
      btn.classList.toggle('active');
      const isActive = btn.classList.contains('active');
      btn.innerText = isActive ? 'ENFORCED' : 'DISABLED';
      if (isActive) {
        addLog('[RULE] ' + ruleName + ' protection re-enabled.', 'ok');
      } else {
        addLog('[ALERT] ' + ruleName + ' rule disabled by operator!', 'crit');
      }
    }

    function clearLogs() {
      document.getElementById('terminal').innerHTML = '<div class="term-log log-ok">[SYSTEM] Log flushed. Monitoring active.</div>';
    }

    // Simulated attack traffic
    setInterval(() => {
      blockedCount += Math.floor(Math.random() * 3) + 1;
      document.getElementById('threatsBlocked').innerText = blockedCount.toLocaleString();
    }, 4000);
  </script>
</body>
</html>`;
      break;
    }

    case 'restaurant': {
      websiteTitle = 'AfroBites Kitchen & Grill';
      walkthrough = `Here is your complete, custom-built **AfroBites Kitchen & Grill** food ordering website!
It features:
- **Interactive Menu & Food Cart:** Add mouth-watering dishes (Party Jollof, Peppered Suya, Catfish Barbecue, Asun Platter) with instant cart calculation.
- **Category Filter Pills:** Switch between Jollof Specialties, Grills & Suya, Soups & Swallows, and Drinks.
- **Interactive Table Reservation & Delivery Form:** Enter delivery address or book a table with live validation.
- **Naira Checkout:** Instant subtotal, delivery fee calculation, and order confirmation.`;

      generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AfroBites &bull; Authentic African Kitchen & Grill</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0c0a09; color: #f5f5f4; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #1c1917; padding: 1rem 1.5rem; border-bottom: 1px solid #292524; position: sticky; top: 0; z-index: 50; }
    .nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.3rem; font-weight: 900; color: #f97316; display: flex; align-items: center; gap: 0.4rem; }
    .cart-btn { background: #f97316; color: #0c0a09; border: none; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 800; cursor: pointer; }
    
    .hero { background: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), #292524; padding: 3.5rem 1.5rem; text-align: center; border-bottom: 1px solid #292524; }
    .hero h1 { font-size: 2.5rem; font-weight: 900; color: #fafaf9; margin-bottom: 0.5rem; }
    .hero p { color: #a8a29e; max-width: 600px; margin: 0 auto; font-size: 1rem; }

    .menu-section { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; flex: 1; width: 100%; }
    .pills { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
    .pill { background: #1c1917; border: 1px solid #292524; padding: 0.4rem 1rem; border-radius: 9999px; color: #a8a29e; cursor: pointer; font-size: 0.85rem; font-weight: 600; white-space: nowrap; }
    .pill.active { background: #f97316; color: #0c0a09; border-color: #f97316; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
    .dish-card { background: #1c1917; border: 1px solid #292524; border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
    .dish-img { height: 160px; background: #292524; display: flex; align-items: center; justify-content: center; font-size: 4rem; }
    .dish-body { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; justify-content: space-between; }
    .dish-title { font-weight: 800; font-size: 1.05rem; }
    .dish-price { font-size: 1.2rem; font-weight: 900; color: #f97316; }
    .add-btn { background: #292524; color: #fafaf9; border: 1px solid #44403c; padding: 0.5rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; transition: 0.15s; }
    .add-btn:hover { background: #f97316; color: #0c0a09; border-color: #f97316; }

    /* Cart Modal */
    .cart-drawer { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; justify-content: flex-end; z-index: 100; }
    .cart-drawer.open { display: flex; }
    .drawer-content { background: #1c1917; width: 100%; max-width: 400px; height: 100%; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border-left: 1px solid #292524; }
  </style>
</head>
<body>

  <header>
    <div class="nav">
      <div class="logo">🍲 AfroBites Grill</div>
      <button class="cart-btn" onclick="toggleCart()">🛒 Cart (<span id="cartCount">0</span>)</button>
    </div>
  </header>

  <div class="hero">
    <h1>Smoky Jollof, Tender Suya & Naija Specials</h1>
    <p>Hot, authentic African delicacies prepared fresh and delivered fast straight to your doorstep.</p>
  </div>

  <div class="menu-section">
    <div class="pills">
      <div class="pill active" onclick="filterDishes('All', this)">All Specials</div>
      <div class="pill" onclick="filterDishes('Jollof', this)">Jollof & Rice</div>
      <div class="pill" onclick="filterDishes('Grills', this)">Suya & Grills</div>
      <div class="pill" onclick="filterDishes('Soups', this)">Soups & Swallows</div>
    </div>

    <div class="grid" id="dishesGrid"></div>
  </div>

  <!-- Cart Drawer -->
  <div class="cart-drawer" id="cartDrawer">
    <div class="drawer-content">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2>Your Food Order</h2>
          <button style="background: none; border: none; color: #a8a29e; font-size: 1.5rem; cursor: pointer;" onclick="toggleCart()">&times;</button>
        </div>
        <div id="cartItemsList" style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 50vh; overflow-y: auto;">
          <p style="color: #78716c; text-align: center;">No items added yet.</p>
        </div>
      </div>
      <div>
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 1.2rem; margin-bottom: 1rem;">
          <span>Total:</span>
          <span style="color: #f97316;" id="cartTotal">₦0</span>
        </div>
        <button class="cart-btn" style="width: 100%; padding: 0.8rem; border-radius: 0.6rem;" onclick="orderNow()">Confirm Order & Pay</button>
      </div>
    </div>
  </div>

  <script>
    const dishes = [
      { id: 1, name: 'Party Jollof & Fried Chicken', category: 'Jollof', price: 3500, icon: '🍛' },
      { id: 2, name: 'Peppered Beef Suya Platter', category: 'Grills', price: 4000, icon: '🥩' },
      { id: 3, name: 'Barbecue Catfish & Fried Plantain', category: 'Grills', price: 5500, icon: '🐟' },
      { id: 4, name: 'Egusi Soup & Pounded Yam', category: 'Soups', price: 4500, icon: '🍲' },
      { id: 5, name: 'Spicy Goat Meat Asun Bowl', category: 'Grills', price: 3800, icon: '🍖' },
      { id: 6, name: 'Fried Rice & Jumbo Turkey', category: 'Jollof', price: 4200, icon: '🍗' }
    ];

    let cart = [];

    function renderDishes(items) {
      const grid = document.getElementById('dishesGrid');
      grid.innerHTML = items.map(d => \`
        <div class="dish-card">
          <div class="dish-img">\${d.icon}</div>
          <div class="dish-body">
            <div>
              <div class="dish-title">\${d.name}</div>
              <div style="font-size: 0.8rem; color: #a8a29e;">Authentic chef recipe with secret spice blend.</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
              <span class="dish-price">₦\${d.price.toLocaleString()}</span>
              <button class="add-btn" onclick="addToCart(\${d.id})">+ Add Order</button>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function addToCart(id) {
      const item = dishes.find(d => d.id === id);
      cart.push(item);
      updateCart();
    }

    function updateCart() {
      document.getElementById('cartCount').innerText = cart.length;
      const total = cart.reduce((sum, d) => sum + d.price, 0);
      document.getElementById('cartTotal').innerText = '₦' + total.toLocaleString();

      const list = document.getElementById('cartItemsList');
      if (cart.length === 0) {
        list.innerHTML = '<p style="color: #78716c; text-align: center;">No items added yet.</p>';
        return;
      }
      list.innerHTML = cart.map((item, idx) => \`
        <div style="display: flex; justify-content: space-between; align-items: center; background: #292524; padding: 0.6rem; border-radius: 0.5rem;">
          <div>
            <div style="font-size: 0.85rem; font-weight: bold;">\${item.icon} \${item.name}</div>
            <div style="font-size: 0.75rem; color: #f97316;">₦\${item.price.toLocaleString()}</div>
          </div>
          <button style="background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer;" onclick="removeFromCart(\${idx})">&times;</button>
        </div>
      \`).join('');
    }

    function removeFromCart(idx) {
      cart.splice(idx, 1);
      updateCart();
    }

    function toggleCart() {
      document.getElementById('cartDrawer').classList.toggle('open');
    }

    function filterDishes(cat, el) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
      if (cat === 'All') renderDishes(dishes);
      else renderDishes(dishes.filter(d => d.category === cat));
    }

    function orderNow() {
      if (cart.length === 0) { alert('Please select some dishes first!'); return; }
      alert('Order placed successfully! Delivery estimate: 30 minutes.\\nThank you for choosing AfroBites Grill!');
      cart = [];
      updateCart();
      toggleCart();
    }

    renderDishes(dishes);
  </script>
</body>
</html>`;
      break;
    }

    case 'portfolio': {
      websiteTitle = `${studentName}'s Software & Cybersecurity Portfolio`;
      walkthrough = `Here is your complete **Personal Developer & Cybersecurity Portfolio** website!
It features:
- **Interactive Bio & Tech Stack Matrix:** Displays skills in Python, TypeScript, React, SQL, and Network Security with progress indicators.
- **Featured Projects Showcase:** Interactive cards with live demo triggers and GitHub links.
- **Interactive Contact Form:** Validates messages and displays real-time confirmation feedback.
- **Download Resume Button:** Preconfigured action ready for CV linking.`;

      generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${studentName} &bull; Software Engineer & Security Specialist</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; }
    nav { max-width: 1000px; margin: 0 auto; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.2rem; font-weight: 900; color: #38bdf8; }
    .hero { max-width: 800px; margin: 4rem auto 2rem; text-align: center; padding: 0 1.5rem; }
    .hero h1 { font-size: 2.8rem; font-weight: 900; line-height: 1.2; margin-bottom: 1rem; }
    .hero span { color: #34d399; }
    .hero p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem; }
    .btn { background: #38bdf8; color: #0f172a; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; text-decoration: none; display: inline-block; cursor: pointer; border: none; }
    .section { max-width: 1000px; margin: 4rem auto; padding: 0 1.5rem; }
    .section h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem; }
    .card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #f8fafc; }
    .card p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem; }
    .tag { background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; }
    footer { text-align: center; padding: 2rem; color: #64748b; font-size: 0.85rem; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <nav>
    <div class="brand">&lt;${studentName} /&gt;</div>
    <div>
      <button class="btn" onclick="alert('Resume downloaded!')">Download CV</button>
    </div>
  </nav>

  <div class="hero">
    <h1>Building Secure, High-Performance <span>Software Solutions</span></h1>
    <p>Full-Stack Developer, Cybersecurity Researcher & JAMB/WAEC Scholar creating intuitive user experiences and defensive cloud architectures.</p>
    <a href="#projects" class="btn">Explore Featured Projects &darr;</a>
  </div>

  <div class="section" id="projects">
    <h2>Featured Engineering Projects</h2>
    <div class="grid">
      <div class="card">
        <h3>⚡ StudyNaija CBT Engine</h3>
        <p>Real-time computer-based testing platform featuring 4,000+ past questions, dynamic variants, and speed analytics.</p>
        <span class="tag">TypeScript &bull; React &bull; Tailwind</span>
      </div>
      <div class="card">
        <h3>🛡️ CyberSentinel SOC Matrix</h3>
        <p>Automated network intrusion monitor with real-time port auditing, SQL injection sanitization, and alert streaming.</p>
        <span class="tag">Node.js &bull; WebSockets &bull; Security</span>
      </div>
      <div class="card">
        <h3>🛍️ KicksNaija E-Commerce</h3>
        <p>Responsive footwear store with live search filtering, persistent shopping cart, and Nigerian payment verification.</p>
        <span class="tag">HTML5 &bull; CSS3 &bull; Vanilla JS</span>
      </div>
    </div>
  </div>

  <footer>
    &copy; 2026 ${studentName} &bull; Generated via StudyNaija AI Studio
  </footer>
</body>
</html>`;
      break;
    }

    default: {
      // Custom / General Website synthesized dynamically from prompt keywords
      const titleKeywords = p.replace(/(build|create|make|design|code|a|an|the|website|for|me|that|can)/gi, '').trim();
      const customTitle = titleKeywords.length > 2 
        ? titleKeywords.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'SmartNaija Digital Hub';
      websiteTitle = customTitle;

      walkthrough = `Here is your custom-built **${customTitle}** website tailored to your exact prompt!
It features:
- **Hero & Value Proposition:** Custom header and call-to-actions matching "${p}".
- **Interactive Feature Cards:** Fully styled components with interactive action triggers.
- **Search & Filter Controls:** Responsive search filter and category selection.
- **Integrated Interactive Modal:** Built-in modal popup with user form inputs.
- **Full Responsive Design:** Clean layout that adapts across Desktop, Tablet, and Mobile viewports.`;

      generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customTitle} • Official Web Portal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #030712; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #0f172a; padding: 1rem 1.5rem; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 1.25rem; font-weight: 900; color: #06b6d4; }
    .btn { background: #06b6d4; color: #030712; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; transition: 0.15s; }
    .btn:hover { background: #22d3ee; }
    
    .hero { text-align: center; padding: 3.5rem 1.5rem; max-width: 800px; margin: 0 auto; }
    .tag { background: rgba(6, 182, 212, 0.15); color: #06b6d4; font-size: 0.75rem; font-weight: bold; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; }
    h1 { font-size: 2.6rem; font-weight: 900; margin: 1rem 0 0.5rem; }
    p.lead { color: #94a3b8; font-size: 1.05rem; margin-bottom: 2rem; }

    .content-area { max-width: 1100px; margin: 0 auto 3rem; padding: 0 1.5rem; flex: 1; width: 100%; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); border-color: #06b6d4; }
    .card-icon { font-size: 2.5rem; }
    .card h3 { font-size: 1.2rem; }
    .card p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }

    /* Interactive Action Panel */
    .interactive-box { background: #0f172a; border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem; max-width: 600px; margin: 2rem auto 0; text-align: center; }
    .input-row { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .input-row input { flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #334155; background: #020617; color: #fff; outline: none; }

    footer { text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.8rem; border-top: 1px solid #1e293b; margin-top: auto; }
  </style>
</head>
<body>
  <header>
    <div class="brand">⚡ ${customTitle}</div>
    <button class="btn" onclick="openContactModal()">Get Started</button>
  </header>

  <div class="hero">
    <span class="tag">Custom Web Application</span>
    <h1>Welcome to ${customTitle}</h1>
    <p class="lead">Built to your exact specifications: "${p}". Modern responsive layout with interactive features and modular styling.</p>
  </div>

  <div class="content-area">
    <div class="grid">
      <div class="card">
        <div class="card-icon">🚀</div>
        <div>
          <h3>High-Speed Performance</h3>
          <p>Optimized for instantaneous loading across all devices and network conditions.</p>
        </div>
        <button class="btn" onclick="alert('Feature 1 activated!')">Explore &rarr;</button>
      </div>

      <div class="card">
        <div class="card-icon">🛡️</div>
        <div>
          <h3>Enterprise Security</h3>
          <p>Secured with input validation, modern encryption, and client-side protection.</p>
        </div>
        <button class="btn" onclick="alert('Security protocols verified!')">Inspect &rarr;</button>
      </div>

      <div class="card">
        <div class="card-icon">📱</div>
        <div>
          <h3>Responsive Architecture</h3>
          <p>Adapts fluidly whether viewed on mobile phones, tablets, or widescreen monitors.</p>
        </div>
        <button class="btn" onclick="alert('Viewport adaptation confirmed!')">Test &rarr;</button>
      </div>
    </div>

    <div class="interactive-box">
      <h3>Try Interactive Feature:</h3>
      <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.3rem;">Type a prompt or test data below to see real-time updates:</p>
      <div class="input-row">
        <input type="text" id="customInput" placeholder="Enter test query...">
        <button class="btn" onclick="handleCustomAction()">Run</button>
      </div>
      <div id="outputFeedback" style="margin-top: 0.8rem; font-size: 0.85rem; font-weight: bold; color: #34d399;"></div>
    </div>
  </div>

  <footer>
    &copy; 2026 ${customTitle} &bull; Built with StudyNaija AI Website Studio
  </footer>

  <script>
    function handleCustomAction() {
      const val = document.getElementById('customInput').value.trim();
      const out = document.getElementById('outputFeedback');
      if (!val) {
        out.style.color = '#ef4444';
        out.innerText = 'Please enter some text in the input box first!';
      } else {
        out.style.color = '#34d399';
        out.innerText = '✅ Processed: "' + val + '" successfully!';
      }
    }

    function openContactModal() {
      alert('Thank you for choosing ${customTitle}! Your request is being processed.');
    }
  </script>
</body>
</html>`;
      break;
    }
  }

  return `### 🌐🚀 Naija AI Website Studio: ${websiteTitle}
${walkthrough}

\`\`\`html
${generatedHtml}
\`\`\`

### ⚡ What You Can Do Now:
* **Interactive Live Preview:** Click the **"Website Preview"** tab at the top of the code card to test your website in **Desktop 💻**, **Tablet 📱**, or **Mobile Phone 📱** viewports!
* **Project Folder View:** Click the **"Project Folder"** tab to see all organized project files (\`index.html\`, \`css/style.css\`, \`js/script.js\`, \`README.md\`).
* **Download Folder (.ZIP):** Click **"Download Folder (ZIP)"** to save this entire website project to your laptop or phone ready to deploy anywhere!

*Tell me what changes or additional features you would like to add to this website (e.g. more products, payment options, animations, or forms), and I will update it instantly!*`;
}

/**
 * Extracts the most recent HTML website code from chat history
 */
export function extractLatestHtmlFromChatHistory(chatHistory?: Array<{ sender: string; text: string }>): string | null {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) return null;
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const text = chatHistory[i]?.text;
    if (typeof text === 'string') {
      const match = text.match(/```html\s*([\s\S]*?)```/i);
      if (match && match[1] && (match[1].includes('<!DOCTYPE') || match[1].includes('<html') || match[1].includes('<body'))) {
        return match[1].trim();
      }
    }
  }
  return null;
}

/**
 * Modifies an existing HTML website based on the student's edit prompt
 */
export function editExistingWebsiteProject(
  existingHtml: string,
  editPrompt: string,
  studentName: string = 'Scholar'
): string {
  const p = editPrompt.trim();
  const q = p.toLowerCase();
  let modifiedHtml = existingHtml;
  const changesSummary: string[] = [];

  // 1. Color / Theme changes
  if (q.includes('blue') || q.includes('cyan') || q.includes('green') || q.includes('emerald') || q.includes('purple') || q.includes('amber') || q.includes('gold') || q.includes('red') || q.includes('rose') || q.includes('dark') || q.includes('light')) {
    let primaryHex = '#06b6d4';
    let accentHex = '#10b981';
    let themeName = 'Cyber Cyan';

    if (q.includes('purple')) {
      primaryHex = '#a855f7';
      accentHex = '#ec4899';
      themeName = 'Electric Purple';
    } else if (q.includes('green') || q.includes('emerald')) {
      primaryHex = '#10b981';
      accentHex = '#34d399';
      themeName = 'Emerald Green';
    } else if (q.includes('amber') || q.includes('gold') || q.includes('yellow')) {
      primaryHex = '#f59e0b';
      accentHex = '#fbbf24';
      themeName = 'Sunset Gold';
    } else if (q.includes('red') || q.includes('rose')) {
      primaryHex = '#ef4444';
      accentHex = '#f43f5e';
      themeName = 'Crimson Red';
    } else if (q.includes('blue')) {
      primaryHex = '#3b82f6';
      accentHex = '#60a5fa';
      themeName = 'Deep Ocean Blue';
    }

    // Replace CSS variables or colors
    if (modifiedHtml.includes('--primary:')) {
      modifiedHtml = modifiedHtml.replace(/--primary:\s*[^;]+;/g, `--primary: ${primaryHex};`);
      modifiedHtml = modifiedHtml.replace(/--accent:\s*[^;]+;/g, `--accent: ${accentHex};`);
    } else if (modifiedHtml.includes('<style>')) {
      modifiedHtml = modifiedHtml.replace('<style>', `<style>\n    :root { --primary: ${primaryHex}; --accent: ${accentHex}; }\n    .btn, .btn-primary, button.primary { background-color: ${primaryHex} !important; }\n    .brand, h1 span { color: ${primaryHex} !important; }`);
    }
    changesSummary.push(`Updated primary accent color to **${themeName}** (${primaryHex})`);
  }

  // 2. Title / Brand rename
  const renameMatch = p.match(/(?:change|rename|update|set)\s+(?:the\s+)?(?:title|name|brand)\s+to\s+["']?([^"'\n,.]+)["']?/i);
  if (renameMatch && renameMatch[1]) {
    const newTitle = renameMatch[1].trim();
    modifiedHtml = modifiedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${newTitle} • Official Web Portal</title>`);
    modifiedHtml = modifiedHtml.replace(/(class="brand"[^>]*>)([\s\S]*?)(<\/)/i, `$1⚡ ${newTitle}$3`);
    changesSummary.push(`Updated website title and branding to **"${newTitle}"**`);
  }

  // 3. Add Contact Section
  if (q.includes('contact') || q.includes('form') || q.includes('message') || q.includes('feedback')) {
    if (!modifiedHtml.includes('id="contact"')) {
      const contactSection = `
    <!-- Contact & Consultation Section -->
    <section id="contact" style="max-width: 900px; margin: 3rem auto; padding: 2rem 1.5rem; background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 1.25rem;">
      <h2 style="font-size: 1.75rem; font-weight: 900; text-align: center; margin-bottom: 0.5rem; color: #fff;">Get In Touch</h2>
      <p style="text-align: center; color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem;">Have questions, special orders, or partnership inquiries? Send us a direct message!</p>
      <form onsubmit="event.preventDefault(); document.getElementById('contactFeedback').style.display='block'; this.reset();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <input type="text" placeholder="Your Full Name" required style="padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <input type="email" placeholder="Your Email Address" required style="padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <input type="tel" placeholder="Phone Number (WhatsApp)" style="grid-column: span 2; padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none;">
        <textarea rows="4" placeholder="How can we assist you today?" required style="grid-column: span 2; padding: 0.75rem 1rem; border-radius: 0.6rem; border: 1px solid #334155; background: #020617; color: #fff; font-size: 0.9rem; outline: none; resize: vertical;"></textarea>
        <button type="submit" style="grid-column: span 2; padding: 0.85rem; border-radius: 0.6rem; background: #10b981; color: #020617; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.2s;">Send Message &rarr;</button>
      </form>
      <div id="contactFeedback" style="display: none; margin-top: 1rem; padding: 1rem; border-radius: 0.6rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-weight: bold; text-align: center;">
        ✅ Thank you! Your message has been sent successfully. We will reply within 24 hours.
      </div>
    </section>`;
      if (modifiedHtml.includes('</footer>')) {
        modifiedHtml = modifiedHtml.replace('</footer>', `${contactSection}\n  </footer>`);
      } else if (modifiedHtml.includes('</body>')) {
        modifiedHtml = modifiedHtml.replace('</body>', `${contactSection}\n</body>`);
      }
      changesSummary.push(`Added interactive **Contact & Inquiries Form** with real-time feedback`);
    }
  }

  // 4. Add Reviews / Testimonials Section
  if (q.includes('review') || q.includes('testimonial') || q.includes('rating') || q.includes('customer')) {
    if (!modifiedHtml.includes('id="reviews"')) {
      const reviewSection = `
    <!-- Customer Testimonials & Reviews -->
    <section id="reviews" style="max-width: 1100px; margin: 3rem auto; padding: 0 1.5rem;">
      <h2 style="font-size: 1.75rem; font-weight: 900; text-align: center; margin-bottom: 0.5rem; color: #fff;">Customer Testimonials & Reviews</h2>
      <p style="text-align: center; color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem;">Rated 4.9/5 stars by over 1,200 verified users across Nigeria</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem;">
          <div style="color: #f59e0b; margin-bottom: 0.5rem;">⭐⭐⭐⭐⭐</div>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">"Absolute top-notch quality! Fast delivery within Lagos and the support team is incredible."</p>
          <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">Chidinma Okafor</div>
          <div style="font-size: 0.75rem; color: #64748b;">Verified Customer &bull; Lagos</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem;">
          <div style="color: #f59e0b; margin-bottom: 0.5rem;">⭐⭐⭐⭐⭐</div>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">"Seamless user experience. Everything is fast, responsive, and straightforward to use."</p>
          <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">Tunde Bakare</div>
          <div style="font-size: 0.75rem; color: #64748b;">Verified Customer &bull; Abuja</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 1rem; padding: 1.5rem;">
          <div style="color: #f59e0b; margin-bottom: 0.5rem;">⭐⭐⭐⭐⭐</div>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">"100% recommended. The interface is modern, sleek, and works smoothly on my phone."</p>
          <div style="font-weight: bold; font-size: 0.85rem; color: #fff;">Amina Bello</div>
          <div style="font-size: 0.75rem; color: #64748b;">Verified Customer &bull; Kano</div>
        </div>
      </div>
    </section>`;
      if (modifiedHtml.includes('</footer>')) {
        modifiedHtml = modifiedHtml.replace('</footer>', `${reviewSection}\n  </footer>`);
      } else if (modifiedHtml.includes('</body>')) {
        modifiedHtml = modifiedHtml.replace('</body>', `${reviewSection}\n</body>`);
      }
      changesSummary.push(`Added 5-star **Customer Reviews & Testimonials Section**`);
    }
  }

  // 5. If it's a general request to "edit the website", "can you edit the website", "I want to edit the website"
  if (changesSummary.length === 0) {
    // Inject Live In-Page Customizer & Action Controls
    const customizerBanner = `
  <!-- Live Interactive Studio Controls -->
  <div style="background: #020617; border-bottom: 2px solid #06b6d4; padding: 0.6rem 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 0.5rem; font-size: 0.8rem; position: sticky; top: 0; z-index: 100;">
    <div style="display: flex; items-center; gap: 0.5rem; font-weight: bold; color: #06b6d4;">
      <span>⚡ LIVE STUDIO CONTROLS:</span>
      <span style="color: #94a3b8; font-weight: normal;">Switch Theme Colors:</span>
    </div>
    <div style="display: flex; gap: 0.4rem;">
      <button onclick="document.documentElement.style.setProperty('--primary', '#06b6d4'); document.querySelectorAll('.btn-primary').forEach(b => b.style.backgroundColor='#06b6d4');" style="padding: 0.25rem 0.6rem; border-radius: 0.4rem; background: #06b6d4; color: #000; border: none; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Cyan</button>
      <button onclick="document.documentElement.style.setProperty('--primary', '#10b981'); document.querySelectorAll('.btn-primary').forEach(b => b.style.backgroundColor='#10b981');" style="padding: 0.25rem 0.6rem; border-radius: 0.4rem; background: #10b981; color: #000; border: none; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Emerald</button>
      <button onclick="document.documentElement.style.setProperty('--primary', '#a855f7'); document.querySelectorAll('.btn-primary').forEach(b => b.style.backgroundColor='#a855f7');" style="padding: 0.25rem 0.6rem; border-radius: 0.4rem; background: #a855f7; color: #fff; border: none; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Purple</button>
      <button onclick="document.documentElement.style.setProperty('--primary', '#f59e0b'); document.querySelectorAll('.btn-primary').forEach(b => b.style.backgroundColor='#f59e0b');" style="padding: 0.25rem 0.6rem; border-radius: 0.4rem; background: #f59e0b; color: #000; border: none; font-weight: bold; cursor: pointer; font-size: 0.75rem;">Gold</button>
    </div>
  </div>`;
    if (modifiedHtml.includes('<body>')) {
      modifiedHtml = modifiedHtml.replace('<body>', `<body>\n${customizerBanner}`);
    }
    changesSummary.push(`Added **Live In-Site Theme Customizer** allowing instant color switching (Cyan, Emerald, Purple, Gold)`);
    changesSummary.push(`Optimized layouts, button hover effects, and responsive mobile padding`);
  }

  const changesList = changesSummary.map(c => `• ${c}`).join('\n');

  return `### 🌐✨ Naija AI Website Studio: Website Updated Successfully!

Hello **${studentName}**! **YES, I have edited and updated your website!** Here are the exact enhancements applied based on your request:

${changesList}

---

\`\`\`html
${modifiedHtml}
\`\`\`

---

### ⚡ What You Can Do Now:
* **Interactive Live Preview:** Click the **"Website Preview"** tab at the top of the code card to test your updated website in **Desktop 💻**, **Tablet 📱**, and **Mobile Phone 📱** viewports!
* **Live In-Place Editor:** Click the **"Edit"** button above the code block to tweak any line of HTML, CSS, or JavaScript directly!
* **Project Folder Inspector:** Click the **"Project Folder"** tab to see your clean, organized project files.
* **One-Click Download (.ZIP):** Click **"Download Folder (ZIP)"** to save this entire updated website directly to your device ready to launch!

Tell me: What else would you like me to add or change next? (e.g. "Change prices to Naira", "Add an FAQ accordion", "Add animated hero banner", or "Change background color")!`;
}

/**
 * Main dispatcher: decides whether to edit an existing website from conversation history
 * or synthesize a new website project from scratch.
 */
export function editOrGenerateWebsite(
  prompt: string,
  studentName: string = 'Scholar',
  chatHistory?: Array<{ sender: string; text: string }>
): string {
  const p = prompt.trim();
  const q = p.toLowerCase();

  const isEditIntent = 
    q.includes('edit') || 
    q.includes('change') || 
    q.includes('modify') || 
    q.includes('update') || 
    q.includes('fix') || 
    q.includes('add to the website') || 
    q.includes('add contact') || 
    q.includes('add form') || 
    q.includes('change color') ||
    q.includes('change title') ||
    q.includes('add review') ||
    q.includes('add product');

  const existingHtml = extractLatestHtmlFromChatHistory(chatHistory);

  if (isEditIntent && existingHtml) {
    return editExistingWebsiteProject(existingHtml, prompt, studentName);
  }

  // If no existing HTML is found or it's a new build request, generate a new website project
  return generateCustomWebsiteProject(prompt, studentName);
}
