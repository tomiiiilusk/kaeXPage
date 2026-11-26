import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, Heart, LogOut, Menu, Star,
  Minus, Moon, Plus, Search, ShoppingBag, Sun, UserRound, X, Zap
} from 'lucide-react';
import { AdminPage, AuthModal, CheckoutModal, CustomerPage, ProductPage } from './DemoScreens.jsx';

const products = [
  { id: 1, name: 'REMERA ESSENTIALS NEGRA c/ NEGRO', category: 'Remeras', price: 24900, old: 29900, tag: 'BEST SELLER', color: 'Negro', image: '/images/remera-essentials.webp' },
  { id: 2, name: 'PANTALON BAGGY CORTEIZ', category: 'Pantalones', price: 58900, tag: 'NUEVO', color: 'Negro', image: '/images/lompa-corteiz.webp' },
  { id: 3, name: 'HOODIE ESSENTIALS FEAR OF GOD | JET BLACK', category: 'Buzos', price: 64900, tag: '', color: 'Negro', image: '/images/buzo-essentials.webp' },
  { id: 4, name: 'REMERA CORTEIZ | PROPERTY - REGULAR FIT', category: 'Remeras', price: 27900, tag: '', color: 'Negro', image: '/images/reme-corteiz.webp' },
  { id: 5, name: 'SWEATPANT ESSENTIALS FEAR OF GOD | DARK OATMEAL', category: 'Pantalones', price: 69900, tag: 'LIMITED', color: 'Gris', image: '/images/lompa-eseentials.webp' },
  { id: 6, name: 'HOODIE HELLSTAR | UNIFORM GLITTER BLACK', category: 'Buzos', price: 72900, tag: '', color: 'Negro', image: '/images/hellstar-buzo.webp' },
  { id: 7, name: 'ZIP MIXED EMOTION STRASS | NEVER DIE BLACK', category: 'Camperas', price: 84900, tag: 'NUEVO', color: 'Negro', image: '/images/emotion-campera.webp' },
  { id: 8, name: 'CAMPERA NOCTA NIKE | Tech Fleece Negro', category: 'Camperas', price: 92900, tag: '', color: 'Negro', image: '/images/nocta-campera.webp' },
];

const tickerMessages = [
  'OWN YOUR SPACE',
  'MOVE DIFFERENT',
  'kaeX STREETWEAR',
  'ESTILO SIN REGLAS',
  'HECHO PARA VOS',
  'CALLE Y ACTITUD',
  'VESTÍ TU RITMO',
  'DROP 001',
];

const demoReviews = [
  { name: 'Valentina R.', quote: 'El calce queda buenísimo y es muy cómodo para usar todos los días.', product: 'Hoodie Essentials' },
  { name: 'Mateo G.', quote: 'Me encantó el estilo. Combina fácil y queda tal cual lo imaginaba.', product: 'Remera Essentials' },
  { name: 'Lucía M.', quote: 'Tiene ese look urbano que estaba buscando. Muy buena elección.', product: 'Pantalón Baggy' },
];

const money = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
const readDemo = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`No se pudo leer el estado demo (${key}).`, error);
    return fallback;
  }
};
function scrollToPageTop() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
}
const cartItemKey = item => item.variantKey || `${item.id}-${item.size || 'M'}-${item.color || 'default'}`;
const demoAdminEmail = (import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@kaex.demo').trim().toLowerCase();
const defaultCatalog = products.map(product => ({
  ...product,
  images: product.images?.length ? product.images : [product.image],
  stock: 18,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [product.color, ...(product.color === 'Negro' ? ['Gris'] : ['Negro'])],
}));

function App() {
  const [category, setCategory] = useState('Todo');
  const [maxPrice, setMaxPrice] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [catalog, setCatalog] = useState(() => {
    const storedCatalog = readDemo('kaex-catalog-demo', null);
    if (!Array.isArray(storedCatalog)) return defaultCatalog;
    const refreshedCatalog = storedCatalog.map(product => {
      const currentProduct = defaultCatalog.find(defaultProduct => defaultProduct.id === product.id);
      return currentProduct
        ? {
          ...product,
          name: currentProduct.name,
          image: currentProduct.image,
          images: currentProduct.images,
          color: currentProduct.color,
          colors: currentProduct.colors,
        }
        : product;
    });
    const storedIds = new Set(refreshedCatalog.map(product => product.id));
    return [...refreshedCatalog, ...defaultCatalog.filter(product => !storedIds.has(product.id))];
  });
  const [cart, setCart] = useState(() => {
    const storedCart = readDemo('kaex-cart-demo', []);
    if (!Array.isArray(storedCart)) return [];
    return storedCart.map(item => {
      const currentProduct = defaultCatalog.find(product => product.id === item.id);
      return currentProduct ? { ...item, image: currentProduct.image } : item;
    });
  });
  const [orders, setOrders] = useState(() => readDemo('kaex-orders-demo', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [cartClosing, setCartClosing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(true);
  const [liked, setLiked] = useState(() => {
    const storedFavorites = readDemo('kaex-favorites-demo', []);
    return Array.isArray(storedFavorites) ? storedFavorites : [];
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [customer, setCustomer] = useState(() => readDemo('kaex-customer-demo', null));
  const [authOpen, setAuthOpen] = useState(false);
  const [page, setPage] = useState('home');
  const [activeProduct, setActiveProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const cartCloseTimer = useRef(null);

  useEffect(() => {
    const stored = [
      ['kaex-catalog-demo', catalog],
      ['kaex-cart-demo', cart],
      ['kaex-orders-demo', orders],
      ['kaex-customer-demo', customer],
      ['kaex-favorites-demo', liked],
    ];
    stored.forEach(([key, value]) => window.localStorage.setItem(key, JSON.stringify(value)));
  }, [catalog, cart, orders, customer, liked]);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [page, catalog, category, search, maxPrice, inStockOnly, sortBy]);

  useEffect(() => {
    scrollToPageTop();
  }, [page]);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    if (!cartOpen && !authOpen && !checkoutOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [cartOpen, authOpen, checkoutOpen]);

  useEffect(() => () => window.clearTimeout(cartCloseTimer.current), []);

  const highestPrice = useMemo(() => Math.max(0, ...catalog.map(product => product.price)), [catalog]);
  const activeMaxPrice = maxPrice === null ? highestPrice : Math.min(maxPrice, highestPrice);
  const filtered = useMemo(() => {
    const matches = catalog.filter(product =>
      (category === 'Todo' || product.category === category) &&
      product.price <= activeMaxPrice &&
      (!inStockOnly || product.stock > 0) &&
      (product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === 'price-asc') return matches.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return matches.sort((a, b) => b.price - a.price);
    if (sortBy === 'name-asc') return matches.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return matches;
  }, [catalog, category, search, activeMaxPrice, inStockOnly, sortBy]);
  const favoriteProducts = catalog.filter(product => liked.includes(product.id));

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__kaexToast);
    window.__kaexToast = window.setTimeout(() => setToast(''), 2200);
  }
  function openCart() {
    window.clearTimeout(cartCloseTimer.current);
    setCartClosing(false);
    setCartOpen(true);
  }
  function closeCart() {
    if (!cartOpen) return;
    setCartClosing(true);
    window.clearTimeout(cartCloseTimer.current);
    cartCloseTimer.current = window.setTimeout(() => {
      setCartOpen(false);
      setCartClosing(false);
    }, 280);
  }
  function addToCart(product, size = 'M', color = product.color) {
    if (product.stock < 1) {
      notify('Esta prenda está sin stock en la demo');
      return;
    }
    const productQuantity = cart.filter(item => item.id === product.id).reduce((sum, item) => sum + item.qty, 0);
    if (productQuantity >= product.stock) {
      notify('No hay más unidades disponibles en la demo');
      return;
    }
    const variantKey = `${product.id}-${size}-${color}`;
    setCart(prev => prev.some(item => item.variantKey === variantKey)
      ? prev.map(item => item.variantKey === variantKey ? { ...item, qty: item.qty + 1 } : item)
      : [...prev, { ...product, size, color, variantKey, qty: 1 }]);
    notify('Agregado a tu carrito');
  }
  function changeQty(variantKey, delta) {
    setCart(prev => prev.map(item => cartItemKey(item) === variantKey ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  }
  function toggleLike(id) {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function goToProducts(cat = 'Todo') {
    setCategory(cat);
    setMaxPrice(null);
    setInStockOnly(false);
    setSortBy('recommended');
    setMobileMenu(false);
    setPage('collection');
    setActiveProduct(null);
    scrollToPageTop();
  }
  function clearCollectionFilters() {
    setCategory('Todo');
    setMaxPrice(null);
    setInStockOnly(false);
    setSortBy('recommended');
    setSearch('');
  }
  function openProduct(product) {
    setActiveProduct(product);
    setPage('product');
    scrollToPageTop();
  }
  function navigatePage(nextPage) {
    if (nextPage === 'home') {
      setCategory('Todo');
      setActiveProduct(null);
    }
    setPage(nextPage);
  }
  function renderProductCards(items) {
    return items.map((product, index) => (
      <article className="product-card reveal" key={product.id} style={{ '--delay': `${index * 80}ms` }}>
        <div className="product-image" onClick={() => openProduct(product)} role="button" tabIndex={0} aria-label={`Ver ${product.name}`} onKeyDown={event => {
          if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openProduct(product);
          }
        }}>
          <img src={product.image} alt={product.name}/>
          {product.tag && <span className="product-tag">{product.tag}</span>}
          <button className={liked.includes(product.id) ? 'like-btn liked' : 'like-btn'} onClick={event => {event.stopPropagation();toggleLike(product.id)}} aria-label="Guardar favorito"><Heart size={17} fill={liked.includes(product.id) ? 'currentColor' : 'none'}/></button>
          <button className="quick-add" disabled={product.stock < 1} onClick={event => {event.stopPropagation();addToCart(product)}}>{product.stock < 1 ? 'Sin stock' : 'Agregar al carrito'} <Plus size={15}/></button>
        </div>
        <div className="product-info"><div><h3>{product.name}</h3><span>{product.color} · {product.category}</span></div><div className="price">{product.old && <del>{money(product.old)}</del>}<b>{money(product.price)}</b></div></div>
      </article>
    ));
  }
  const favoritesPage = (
    <section className="favorites-page section-wrap reveal">
      <div className="eyebrow"><Heart size={14} fill="currentColor" /> TUS FAVORITOS</div>
      <div className="section-heading">
        <div><h2>Prendas guardadas<span className="blue-dot">.</span></h2></div>
        <p>{favoriteProducts.length} {favoriteProducts.length === 1 ? 'prenda guardada' : 'prendas guardadas'}</p>
      </div>
      {favoriteProducts.length > 0
        ? <div className="product-grid">{renderProductCards(favoriteProducts)}</div>
        : <div className="favorites-empty"><Heart size={30} /><h3>Todavía no guardaste favoritos</h3><p>Tocá el corazón de una prenda para verla acá.</p><button className="outline-btn" onClick={() => goToProducts()}>Explorar tienda <ArrowRight size={16} /></button></div>}
    </section>
  );
  function authenticate(profile) {
    setCustomer(profile);
    setAuthOpen(false);
    setPage(profile.email === demoAdminEmail ? 'admin' : 'profile');
    notify(profile.email === demoAdminEmail ? 'Sesión de administración demo iniciada' : 'Sesión demo iniciada');
  }
  function startCheckout() {
    if (!cart.length) return;
    if (!customer) {
      setAuthOpen(true);
      notify('Iniciá sesión en la demo para registrar el pedido');
      return;
    }
    setCheckoutOpen(true);
  }
  function completeDemoCheckout(shipping) {
    if (!cart.length) return;
    const order = {
      id: `KX-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cart,
      total,
      status: 'Preparando',
      paymentMethod: 'Tarjeta de prueba (simulación)',
      shipping: {
        method: 'Envío gratis (simulación)',
        city: shipping.city,
        postalCode: shipping.postalCode,
      },
    };
    setOrders(previous => [order, ...previous]);
    setCatalog(previous => previous.map(product => {
      const purchased = cart.filter(item => item.id === product.id).reduce((sum, item) => sum + item.qty, 0);
      return purchased ? { ...product, stock: Math.max(0, (product.stock ?? 0) - purchased) } : product;
    }));
    setCheckoutOpen(false);
    setCart([]);
    closeCart();
    setPage('orders');
    notify('Pago ficticio aprobado. Pedido registrado y envío simulado en preparación.');
  }
  function addProduct(product) {
    const created = { ...product, id: Date.now(), old: null, sizes: ['S', 'M', 'L', 'XL'] };
    setCatalog(previous => [...previous, created]);
    notify('Prenda agregada al catálogo demo');
  }
  function logout() {
    setCustomer(null);
    navigatePage('home');
    notify('Sesión demo cerrada');
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <div className="announcement"><span><Zap size={13} fill="currentColor" /> DROP 001 — NUEVA COLECCIÓN DISPONIBLE</span><a href="#productos" onClick={event => {event.preventDefault();goToProducts()}}>DESCUBRIR <ArrowUpRight size={12}/></a></div>
      <header className={scrolled ? 'header scrolled' : 'header'}>
        <button className="mobile-toggle icon-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú">{mobileMenu ? <X/> : <Menu/>}</button>
        <a className="logo" href="#" onClick={() => navigatePage('home')}><span>kae</span><b>X</b><i>.</i></a>
        <nav className={mobileMenu ? 'nav open' : 'nav'}>
          <a href="#productos" onClick={event => {event.preventDefault();goToProducts()}}>Tienda</a>
          <a href="#coleccion" onClick={() => {navigatePage('home');setMobileMenu(false)}}>Colección</a>
          <a href="#nosotros" onClick={() => {navigatePage('home');setMobileMenu(false)}}>Nosotros</a>
          <button className="nav-account" onClick={() => {setPage(customer ? (customer.email === demoAdminEmail ? 'admin' : 'profile') : 'home');setMobileMenu(false);if(!customer)setAuthOpen(true)}}>{customer ? 'Mi cuenta' : 'Ingresar'}</button>
          {customer && <button className="nav-account" onClick={() => {logout();setMobileMenu(false)}}>Cerrar sesión</button>}
        </nav>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar"><Search size={19}/></button>
          <button className={liked.length ? 'icon-btn favorite-trigger has-favorites' : 'icon-btn favorite-trigger'} onClick={() => {setPage('favorites');setActiveProduct(null);setMobileMenu(false)}} aria-label={`Ver favoritos (${liked.length})`} title="Favoritos"><Heart size={19} fill={liked.length ? 'currentColor' : 'none'}/>{liked.length > 0 && <span className="favorite-count" key={liked.length}>{liked.length}</span>}</button>
          <button className="icon-btn theme-toggle" onClick={() => setDark(!dark)} aria-label="Cambiar tema">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
          <button className="icon-btn account-trigger" onClick={() => customer ? setPage(customer.email === demoAdminEmail ? 'admin' : 'profile') : setAuthOpen(true)} aria-label={customer ? 'Abrir cuenta' : 'Iniciar sesión'}><UserRound size={19}/></button>
          {customer && <button className="icon-btn logout-trigger" onClick={logout} aria-label="Cerrar sesión"><LogOut size={17}/></button>}
          <button className="cart-trigger" onClick={openCart}><ShoppingBag size={18}/><span>Carrito</span><b key={count} className="cart-count">{count}</b></button>
        </div>
      </header>

      {searchOpen && <div className="search-bar"><Search size={18}/><input autoFocus placeholder="¿Qué estás buscando?" value={search} onChange={e => setSearch(e.target.value)}/><button onClick={() => {setSearch(''); setSearchOpen(false)}}><X size={18}/></button></div>}

      <main key={page} className="page-transition">
        {page === 'product' && activeProduct ? <ProductPage key={activeProduct.id} product={activeProduct} onBack={() => {setPage('collection');setActiveProduct(null)}} onAdd={addToCart}/> : page === 'profile' || page === 'orders' ? <CustomerPage page={page} customer={customer} orders={orders} onPageChange={navigatePage} onLogin={() => setAuthOpen(true)}/> : page === 'admin' && customer?.email === demoAdminEmail ? <AdminPage products={catalog} adminEmail={demoAdminEmail} onAddProduct={addProduct} onUpdateProduct={(id, patch) => setCatalog(previous => previous.map(product => product.id === id ? { ...product, ...patch } : product))}/> : page === 'admin' ? <CustomerPage page="profile" customer={null} orders={orders} onPageChange={navigatePage} onLogin={() => setAuthOpen(true)}/> : page === 'favorites' ? favoritesPage : page === 'collection' ? <>
          <section className="collection-page section-wrap reveal" id="productos">
            <div className="eyebrow"><span className="eyebrow-line"/> kaeX STREETWEAR</div>
            <div className="collection-heading"><div><h1>Toda la ropa<span className="blue-dot">.</span></h1><p>Encontrá tu próximo esencial.</p></div></div>
            <div className="collection-layout">
              <aside className="collection-filters" aria-label="Filtros de productos">
                <div className="filter-heading"><h2>Filtros</h2><button onClick={clearCollectionFilters}>Limpiar</button></div>
                <div className="filter-group">
                  <h3>Categorías</h3>
                  {['Todo', 'Remeras', 'Buzos', 'Pantalones', 'Camperas'].map(item => {
                    const itemCount = item === 'Todo' ? catalog.length : catalog.filter(product => product.category === item).length;
                    return <button key={item} className={category === item ? 'filter-category active' : 'filter-category'} onClick={() => setCategory(item)}><span>{item}</span><small>{itemCount}</small></button>;
                  })}
                </div>
                <div className="filter-group">
                  <h3>Precio máximo</h3>
                  <label className="price-filter-value">{money(activeMaxPrice)}
                    <input type="range" min="0" max={Math.max(highestPrice, 1)} step="100" value={activeMaxPrice} onChange={event => setMaxPrice(Number(event.target.value))} aria-label="Precio máximo"/>
                  </label>
                  <div className="price-range-labels"><span>{money(0)}</span><span>{money(highestPrice)}</span></div>
                </div>
                <div className="filter-group filter-availability">
                  <h3>Disponibilidad</h3>
                  <label><input type="checkbox" checked={inStockOnly} onChange={event => setInStockOnly(event.target.checked)}/> Solo en stock</label>
                </div>
              </aside>
              <div className="collection-results">
                <div className="collection-results-heading">
                  <span>{filtered.length} productos</span>
                  <label>Ordenar por
                    <select value={sortBy} onChange={event => setSortBy(event.target.value)}>
                      <option value="recommended">Recomendados</option>
                      <option value="price-asc">Precio: menor a mayor</option>
                      <option value="price-desc">Precio: mayor a menor</option>
                      <option value="name-asc">Nombre: A a Z</option>
                    </select>
                  </label>
                </div>
                <div className="product-grid">{renderProductCards(filtered)}</div>
                {filtered.length === 0 && <div className="empty-search">No encontramos productos con esos filtros.</div>}
              </div>
            </div>
          </section>
          <section className="perks section-wrap reveal">
            <div className="perk"><span>01</span><div><b>Envíos a todo el país</b><p>Tu kaeX llega donde estés.</p></div></div>
            <div className="perk"><span>02</span><div><b>Pagá como quieras</b><p>Opciones simples y seguras.</p></div></div>
            <div className="perk"><span>03</span><div><b>Calidad que se siente</b><p>Detalles pensados para durar.</p></div></div>
          </section>
        </> : <>
        <section className="hero reveal" id="coleccion">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"/> STREETWEAR / BUENOS AIRES</div>
            <h1>Vestí tu<br/><span>propio</span> ritmo<span className="blue-dot">.</span></h1>
            <p>Prendas esenciales. Actitud sin esfuerzo.<br/>Una nueva forma de vivir la calle.</p>
            <div className="hero-ctas"><button className="primary-btn" onClick={() => goToProducts()}>Explorar tienda <ArrowUpRight size={17}/></button><a href="#nosotros" className="text-link">Conocé kaeX <ArrowDownRight size={16}/></a></div>
            <div className="hero-foot"><div className="avatars"><span>K</span><span>X</span><span>+</span></div><p>Diseñado para moverte<br/><b>a tu manera.</b></p></div>
          </div>
          <div className="hero-visual">
            <div className="hero-image"><img src="/images/inicio.webp" alt="Look urbano kaeX"/></div>
            <div className="hero-stamp"><span>kaeX</span><small>NEW<br/>SEASON<br/>2026</small></div>
            <div className="vertical-note">NO RULES. JUST YOUR STYLE.</div>
            <div className="hero-index">01 <span>/</span> 03</div>
          </div>
          <div className="hero-scroll"><span/> SCROLL TO EXPLORE</div>
        </section>

        <section className="ticker reveal" aria-label="Concepto de marca"><div className="ticker-track" aria-hidden="true">{Array.from({length: 2},(_,groupIndex)=><div className="ticker-group" key={groupIndex}>{tickerMessages.map(message=><React.Fragment key={message}><span>{message}</span><i>✳</i></React.Fragment>)}</div>)}</div></section>

        <section className="products-section section-wrap reveal" id="productos">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line"/> SELECCIÓN kaeX</div><h2>Destacados<span className="blue-dot">.</span></h2></div>
            <p>Prendas elegidas para descubrir<br/>el universo kaeX.</p>
          </div>
          <div className="product-grid">
            {renderProductCards(filtered.slice(0, 3))}
          </div>
          {filtered.length === 0 && <div className="empty-search">No encontramos productos con esa búsqueda.</div>}
          <div className="center-cta"><button className="outline-btn" onClick={()=>goToProducts()}>Ver toda la colección <ArrowRight size={16}/></button></div>
        </section>

        <section className="home-reviews section-wrap reveal" aria-labelledby="home-reviews-title">
          <div className="home-reviews-heading">
            <div><div className="eyebrow"><span className="eyebrow-line"/> LO QUE SE DICE</div><h2 id="home-reviews-title">Opiniones<span className="blue-dot">.</span></h2></div>
            <p className="home-reviews-disclaimer">Reseña de clientes que han comprado en nuestra pagina.</p>
          </div>
          <div className="home-review-grid">
            {demoReviews.map((review, index) => (
              <article className="home-review-card" key={review.product}>
                <span className="home-review-demo-label">EJEMPLO</span>
                <div className="home-review-stars" aria-label="5 de 5 estrellas">{Array.from({ length: 5 }, (_, starIndex) => <Star key={starIndex} size={14} fill="currentColor"/>)}</div>
                <blockquote>“{review.quote}”</blockquote>
                <div className="home-review-author">
                  <img src="/images/avatar-anonimo.svg" alt={`Avatar ilustrado anónimo ${index + 1}`}/>
                  <div><b>{review.name}</b><span>{review.product}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="statement reveal" id="nosotros">
          <div className="statement-image"><img src="images/Luchito.jpg" alt="Moda urbana"/></div>
          <div className="statement-content"><div className="eyebrow"><span className="eyebrow-line"/> NUESTRA FILOSOFÍA</div><h2>No se trata<br/>de encajar.<br/><span>Se trata de ser.</span></h2><p>kaeX nace de la calle, de la música y de las personas que hacen las cosas a su manera. Creamos ropa para acompañar tu identidad, no para definirla.</p><a href="#productos" className="text-link">Encontrá tu estilo <ArrowUpRight size={16}/></a><div className="statement-number">KX — 001</div></div>
        </section>

        </>}
      </main>

      <footer className="footer reveal">
        <div className="footer-top"><div><a className="logo footer-logo" href="#" onClick={() => navigatePage('home')}><span>kae</span><b>X</b><i>.</i></a><p>Own your space. Move different.</p></div><div className="footer-links"><a href="#productos" onClick={event => {event.preventDefault();goToProducts()}}>Tienda</a><a href="#coleccion" onClick={() => navigatePage('home')}>Colección</a><a href="#nosotros" onClick={() => navigatePage('home')}>Nosotros</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13}/></a></div><div className="newsletter"><b>Mantente al tanto.</b><p>Enterate antes de cada drop.</p><form onSubmit={e=>{e.preventDefault();notify('¡Gracias por suscribirte!')}}><input type="email" placeholder="Tu email" required/><button aria-label="Suscribirme"><ArrowUpRight size={18}/></button></form></div></div>
        <div className="footer-bottom"><span>© 2026 kaeX. Todos los derechos reservados.</span><span>BUENOS AIRES, ARGENTINA</span><a href="#">BACK TO TOP ↑</a></div>
      </footer>

      {cartOpen && <div className={`overlay cart-overlay${cartClosing ? ' closing' : ''}`} onMouseDown={event => {if(event.target===event.currentTarget)closeCart()}}><aside className="drawer"><div className="drawer-head"><div><span className="eyebrow">TU SELECCIÓN</span><h2>Carrito <span>({count})</span></h2></div><button className="icon-btn" onClick={closeCart} aria-label="Cerrar carrito"><X/></button></div>
        {cart.length===0 ? <div className="cart-empty"><ShoppingBag size={34}/><h3>Tu carrito está vacío</h3><p>Hay algo esperando por vos.</p><button className="primary-btn" onClick={()=>{closeCart();goToProducts()}}>Explorar tienda <ArrowRight size={16}/></button></div> :
          <><div className="cart-items">{cart.map(item=><div className="cart-item" key={cartItemKey(item)}><img src={item.image} alt={item.name}/><div className="cart-item-info"><b>{item.name}</b><span>{item.color} · Talle {item.size || 'M'}</span><strong>{money(item.price)}</strong><div className="qty"><button onClick={()=>changeQty(cartItemKey(item),-1)}><Minus size={12}/></button><span>{item.qty}</span><button onClick={()=>changeQty(cartItemKey(item),1)}><Plus size={12}/></button></div></div><button className="remove" onClick={()=>changeQty(cartItemKey(item),-item.qty)}><X size={15}/></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>{money(total)}</b></div><small>Envío gratis de demostración · checkout simulado.</small><div className="demo-payment-note">No se procesa ningún pago real. El checkout solo acepta la tarjeta de prueba indicada en pantalla.</div><button className="primary-btn checkout" onClick={startCheckout}>Continuar al checkout <ArrowUpRight size={17}/></button><button className="continue" onClick={closeCart}>Seguir comprando</button></div></>}
      </aside></div>}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuthenticate={authenticate} adminEmail={demoAdminEmail}/>}
      {checkoutOpen && <CheckoutModal customer={customer} total={total} itemCount={count} onClose={() => setCheckoutOpen(false)} onConfirm={completeDemoCheckout}/>}

      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

export default App;
