import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Landmark, Package, Plus, Shield, ShoppingBag, Truck, User, X } from 'lucide-react';

const sizes = ['S', 'M', 'L', 'XL'];

export function ProductPage({ product, onBack, onAdd }) {
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(product.colors?.[0] || product.color);
  const [selectedImage, setSelectedImage] = useState(0);
  const productImages = product.images?.length ? product.images : [product.image];

  return (
    <section className="product-detail section-wrap reveal">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Volver a la tienda</button>
      <div className="product-detail-grid">
      <div className="detail-gallery">
        <div className="detail-image"><img src={productImages[selectedImage] || product.image} alt={`${product.name} · vista ${selectedImage + 1}`} /></div>
        {productImages.length > 1 && <div className="detail-thumbnails" aria-label="Más vistas del producto">{productImages.map((image, index) => <button type="button" className={selectedImage === index ? 'active' : ''} key={`${image}-${index}`} onClick={() => setSelectedImage(index)} aria-label={`Ver imagen ${index + 1}`} aria-pressed={selectedImage === index}><img src={image} alt="" /></button>)}</div>}
      </div>
        <div className="detail-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> kaeX ESSENTIALS</span>
          <h1>{product.name}</h1>
          <span className="detail-category">{product.category} · {product.color}</span>
          <b className="detail-price">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)}</b>
          <p>Un esencial de calce relajado, confeccionado para acompañarte todos los días. Elegí tu talle y color.</p>
          <div className="detail-purchase-info">
            <article className="shipping-promo">
              <Truck className="shipping-icon" size={23} />
              <span className="shipping-copy"><b>Envío gratis</b><small>A todo el país</small></span>
            </article>
            <article className="payment-panel">
              <div className="payment-panel-heading"><CreditCard size={19} /><div><b>Medios de pago</b><small>Opciones ilustrativas</small></div></div>
              <div className="payment-methods">
                <span><CreditCard size={15} /> Crédito y débito</span>
                <span><Landmark size={15} /> Transferencia</span>
                <span><ShoppingBag size={15} /> Mercado Pago</span>
              </div>
            </article>
          </div>
          <div className="variant-group"><b>Talle</b><div className="variant-options">{sizes.map(item => <button key={item} className={size === item ? 'selected' : ''} onClick={() => setSize(item)}>{item}</button>)}</div></div>
          <div className="variant-group"><b>Color: {color}</b><div className="variant-options">{(product.colors?.length ? product.colors : [product.color]).map(item => <button key={item} className={color === item ? 'selected' : ''} onClick={() => setColor(item)}>{item}</button>)}</div></div>
          <p className="stock-note">{product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock disponible'}</p>
          <button className="primary-btn detail-add" disabled={product.stock < 1} onClick={() => onAdd(product, size, color)}>Agregar al carrito <ShoppingBag size={16} /></button>
        </div>
      </div>
    </section>
  );
}

export function CheckoutModal({ customer, total, itemCount, onClose, onConfirm }) {
  const [shipping, setShipping] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [card, setCard] = useState({ number: '', holder: customer?.name || '', expiration: '', securityCode: '' });
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const cardNumber = card.number.replace(/\D/g, '');
    if (cardNumber !== '4242424242424242' || card.expiration !== '12/30' || card.securityCode !== '123') {
      setError('Para simular el pago, usá únicamente los datos de prueba indicados arriba.');
      return;
    }
    setError('');
    onConfirm({ city: shipping.city.trim(), postalCode: shipping.postalCode.trim() });
    setCard({ number: '', holder: '', expiration: '', securityCode: '' });
  }

  function updateCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    setCard(previous => ({ ...previous, number: digits.replace(/(\d{4})(?=\d)/g, '$1 ') }));
  }

  function updateExpiration(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCard(previous => ({ ...previous, expiration: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }));
  }

  return (
    <div className="overlay checkout-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button className="checkout-close icon-btn" type="button" onClick={onClose} aria-label="Cerrar checkout"><X size={20} /></button>
        <span className="eyebrow"><span className="eyebrow-line" /> CHECKOUT DE DEMOSTRACIÓN</span>
        <h2 id="checkout-title">Datos de envío y pago<span className="blue-dot">.</span></h2>
        <p className="checkout-intro">{itemCount} productos · Total {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(total)}</p>
        <div className="checkout-demo-warning"><Shield size={17} /><span><b>Solo simulación.</b> No ingreses datos reales: no se cobra ni se envía nada.</span></div>
        <div className="checkout-test-card"><b>Tarjeta de prueba</b><span>4242 4242 4242 4242 · Vencimiento 12/30 · Código 123</span></div>
        <form className="checkout-form" onSubmit={submit}>
          <fieldset>
            <legend>Datos de envío</legend>
            <div className="checkout-fields">
              <label>Nombre y apellido<input required autoComplete="name" value={shipping.name} onChange={event => setShipping(previous => ({ ...previous, name: event.target.value }))} /></label>
              <label>Email<input required type="email" autoComplete="email" value={shipping.email} onChange={event => setShipping(previous => ({ ...previous, email: event.target.value }))} /></label>
              <label>Teléfono<input required type="tel" autoComplete="tel" value={shipping.phone} onChange={event => setShipping(previous => ({ ...previous, phone: event.target.value }))} /></label>
              <label>Dirección<input required autoComplete="street-address" value={shipping.address} onChange={event => setShipping(previous => ({ ...previous, address: event.target.value }))} /></label>
              <label>Localidad<input required autoComplete="address-level2" value={shipping.city} onChange={event => setShipping(previous => ({ ...previous, city: event.target.value }))} /></label>
              <label>Código postal<input required autoComplete="postal-code" value={shipping.postalCode} onChange={event => setShipping(previous => ({ ...previous, postalCode: event.target.value }))} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Tarjeta ficticia</legend>
            <div className="checkout-fields">
              <label className="checkout-card-number">Número de tarjeta<input required inputMode="numeric" autoComplete="off" maxLength={19} value={card.number} onChange={event => updateCardNumber(event.target.value)} placeholder="4242 4242 4242 4242" /></label>
              <label>Titular<input required autoComplete="off" value={card.holder} onChange={event => setCard(previous => ({ ...previous, holder: event.target.value }))} placeholder="Nombre del titular" /></label>
              <label>Vencimiento<input required inputMode="numeric" autoComplete="off" maxLength={5} value={card.expiration} onChange={event => updateExpiration(event.target.value)} placeholder="12/30" /></label>
              <label>Código de seguridad<input required inputMode="numeric" autoComplete="off" maxLength={3} value={card.securityCode} onChange={event => setCard(previous => ({ ...previous, securityCode: event.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="123" /></label>
            </div>
          </fieldset>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="primary-btn checkout-submit" type="submit">Pagar de forma ficticia <CreditCard size={16} /></button>
          <small className="checkout-privacy-note">La tarjeta de prueba no se envía ni se guarda. Solo se conserva la ciudad y el código postal para el seguimiento demo.</small>
        </form>
      </section>
    </div>
  );
}

export function CustomerPage({ page, customer, orders, onPageChange, onLogin }) {
  if (!customer) {
    return (
      <section className="account-empty section-wrap reveal">
        <User size={32} />
        <h1>Tu cuenta kaeX</h1>
        <p>Iniciá sesión en esta demo para ver tu perfil, tus pedidos y su seguimiento.</p>
        <button className="primary-btn" onClick={onLogin}>Iniciar sesión <ArrowRight size={16} /></button>
      </section>
    );
  }

  if (page === 'profile') {
    return (
      <section className="account-page section-wrap reveal">
        <div className="eyebrow"><span className="eyebrow-line" /> MI CUENTA</div>
        <h1>Hola, {customer.name || 'cliente'}<span className="blue-dot">.</span></h1>
        <div className="profile-card">
          <div className="profile-avatar"><User size={26} /></div>
          <div><b>{customer.name || 'Cliente kaeX'}</b><span>{customer.email}</span></div>
          <span className="demo-badge">CUENTA DEMO</span>
        </div>
        <div className="account-shortcuts">
          <button onClick={() => onPageChange('orders')}><Package size={20} /><b>Mis pedidos</b><span>{orders.length} pedidos</span><ArrowRight size={16} /></button>
          <button onClick={() => onPageChange('orders')}><ShoppingBag size={20} /><b>Seguimiento</b><span>Consultá el estado de tus compras</span><ArrowRight size={16} /></button>
        </div>
        <p className="demo-caption">Esta cuenta es una simulación local. No se envían ni verifican datos personales.</p>
      </section>
    );
  }

  return (
    <section className="account-page section-wrap reveal">
      <div className="eyebrow"><span className="eyebrow-line" /> MI CUENTA</div>
      <h1>Mis pedidos<span className="blue-dot">.</span></h1>
      {!orders.length ? (
        <div className="orders-empty"><Package size={28} /><h2>Todavía no tenés pedidos</h2><p>Cuando completes una compra de demostración, vas a verla acá.</p><button className="outline-btn" onClick={() => onPageChange('home')}>Explorar tienda <ArrowRight size={16} /></button></div>
      ) : (
        <div className="orders-list">{orders.map(order => (
          <article className="order-card" key={order.id}>
            <div className="order-top"><div><span className="eyebrow">PEDIDO</span><h2>{order.id}</h2></div><span className="order-status"><Check size={14} /> {order.status}</span></div>
            <p>{new Date(order.date).toLocaleDateString('es-AR')} · {order.items.length} producto{order.items.length === 1 ? '' : 's'}</p>
            {order.shipping && <div className="order-shipping-summary"><span><Truck size={15} /> {order.shipping.method}</span><span>{order.shipping.city} · CP {order.shipping.postalCode}</span><span><CreditCard size={15} /> {order.paymentMethod}</span></div>}
            <div className="order-progress"><span className="done">Compra demo</span><i /><span className={order.status === 'En camino' || order.status === 'Entregado' ? 'done' : ''}>Preparación</span><i /><span className={order.status === 'Entregado' ? 'done' : ''}>Entrega</span></div>
            <div className="order-bottom"><span>Total</span><b>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(order.total)}</b><button className="text-link" onClick={() => onPageChange('home')}>Volver a la tienda <ArrowRight size={14} /></button></div>
            <small className="demo-caption">Seguimiento simulado; no hay un envío real asociado.</small>
          </article>
        ))}</div>
      )}
    </section>
  );
}

function AdminProductRow({ product, onSave }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock ?? 0));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPrice(String(product.price));
    setStock(String(product.stock ?? 0));
  }, [product.price, product.stock]);

  function submit(event) {
    event.preventDefault();
    const nextPrice = Number(price);
    const nextStock = Number(stock);
    if (!price.trim() || !Number.isFinite(nextPrice) || nextPrice <= 0 || !stock.trim() || !Number.isInteger(nextStock) || nextStock < 0) {
      setMessage('Revisá el precio y el stock.');
      return;
    }
    onSave(product.id, { price: nextPrice, stock: nextStock });
    setMessage('Cambios guardados.');
  }

  const stockStatus = product.stock < 1 ? 'Sin stock' : product.stock <= 5 ? 'Stock bajo' : 'Disponible';

  return (
    <form className="admin-product-row" onSubmit={submit}>
      <div className="admin-product-identity">
        <img src={product.image} alt="" />
        <div className="admin-product-name"><b>{product.name}</b><span>{product.category}</span></div>
      </div>
      <label>Precio (ARS)<input aria-label={`Precio de ${product.name}`} type="number" min="1" step="1" value={price} onChange={event => {setMessage('');setPrice(event.target.value)}} /></label>
      <label>Unidades<input aria-label={`Stock de ${product.name}`} type="number" min="0" step="1" value={stock} onChange={event => {setMessage('');setStock(event.target.value)}} /></label>
      <span className={product.stock < 1 ? 'stock-status out' : product.stock <= 5 ? 'stock-status low' : 'stock-status'}>{stockStatus}</span>
      <div className="admin-row-action"><button className="admin-save-btn" type="submit">Guardar</button>{message && <small role="status">{message}</small>}</div>
    </form>
  );
}

export function AdminPage({ products, onUpdateProduct, onAddProduct, adminEmail }) {
  const [draft, setDraft] = useState({ name: '', category: 'Remeras', price: '', stock: '', image: '' });
  const [formError, setFormError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todo');
  const totalUnits = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
  const lowStockCount = products.filter(product => product.stock <= 5).length;
  const visibleProducts = products.filter(product =>
    (categoryFilter === 'Todo' || product.category === categoryFilter) &&
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())
  );

  const submit = event => {
    event.preventDefault();
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    if (!draft.name.trim() || !draft.price.trim() || !Number.isFinite(price) || price <= 0 || !draft.stock.trim() || !Number.isInteger(stock) || stock < 0) {
      setFormError('Completá el nombre, un precio mayor a cero y una cantidad entera de stock.');
      return;
    }
    onAddProduct({
      name: draft.name.trim(),
      category: draft.category,
      price,
      stock,
      color: 'Negro',
      colors: ['Negro', 'Blanco'],
      sizes,
      tag: 'NUEVO',
      image: draft.image.trim() || products[0]?.image || '',
    });
    setFormError('');
    setDraft({ name: '', category: 'Remeras', price: '', stock: '', image: '' });
  };

  return (
    <section className="admin-page section-wrap reveal">
      <div className="admin-heading">
        <div><div className="eyebrow"><span className="eyebrow-line" /> ADMINISTRACIÓN DE LA TIENDA</div><h1>Panel de control<span className="blue-dot">.</span></h1><p>Productos, precios y stock en un solo lugar.</p></div>
        <span className="demo-badge"><Shield size={13} /> DEMO · {adminEmail}</span>
      </div>
      <div className="admin-notice"><b>Modo demostración.</b></div>
      <div className="admin-stats">
        <article><span>Productos en catálogo</span><b>{products.length}</b><small>Prendas cargadas</small></article>
        <article><span>Unidades disponibles</span><b>{totalUnits}</b><small>Stock total registrado</small></article>
        <article><span>Revisar stock</span><b>{lowStockCount}</b><small>Productos con 5 unidades o menos</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-section-heading"><div><h2>Agregar producto</h2><p>Completá los datos básicos para cargar una prenda nueva.</p></div></div>
        <form className="admin-add-form" onSubmit={submit}>
          <label>Nombre del producto<input required value={draft.name} onChange={event => {setFormError('');setDraft({ ...draft, name: event.target.value })}} placeholder="Ej. Hoodie Essential" /></label>
          <label>Categoría<select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option>Remeras</option><option>Buzos</option><option>Pantalones</option><option>Camperas</option></select></label>
          <label>Precio en pesos<input required type="number" min="1" step="1" value={draft.price} onChange={event => {setFormError('');setDraft({ ...draft, price: event.target.value })}} placeholder="Ej. 45000" /></label>
          <label>Unidades en stock<input required type="number" min="0" step="1" value={draft.stock} onChange={event => {setFormError('');setDraft({ ...draft, stock: event.target.value })}} placeholder="Ej. 12" /></label>
          <label className="admin-image-field">URL de imagen <span>(opcional)</span><input type="url" value={draft.image} onChange={event => setDraft({ ...draft, image: event.target.value })} placeholder="https://..." /></label>
          <div className="admin-add-actions"><small>Si no cargás una imagen, se usará la imagen de muestra.</small><button className="primary-btn"><Plus size={16}/> Agregar producto</button></div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
        </form>
      </section>
      <section className="admin-panel admin-inventory">
        <div className="admin-section-heading"><div><h2>Productos y stock</h2><p>Editá los valores y guardá cada fila para aplicar los cambios.</p></div></div>
        <div className="admin-toolbar">
          <label className="admin-search">Buscar producto<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre o categoría" /></label>
          <label className="admin-category-filter">Filtrar categoría<select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option>Todo</option><option>Remeras</option><option>Buzos</option><option>Pantalones</option><option>Camperas</option></select></label>
          <span>{visibleProducts.length} productos</span>
        </div>
        <div className="admin-table-scroll">
          <div className="admin-table-head"><span>Producto</span><span>Precio</span><span>Stock</span><span>Estado</span><span>Acción</span></div>
          <div className="admin-product-list">{visibleProducts.map(product => <AdminProductRow key={product.id} product={product} onSave={onUpdateProduct} />)}</div>
          {visibleProducts.length === 0 && <p className="admin-empty">No hay productos que coincidan con la búsqueda.</p>}
        </div>
      </section>
    </section>
  );
}

export function AuthModal({ onClose, onAuthenticate, adminEmail }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = event => {
    event.preventDefault();
    onAuthenticate({ name: name.trim(), email: email.trim().toLowerCase() });
  };

  return (
    <div className="overlay auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-modal">
        <button className="auth-close icon-btn" onClick={onClose} aria-label="Cerrar">×</button>
        <span className="eyebrow"><span className="eyebrow-line" /> CUENTA kaeX · DEMO</span>
        <h2>{mode === 'login' ? 'Qué bueno verte.' : 'Creá tu cuenta.'}</h2>
        <p>Acceso de demostración, sin validación ni almacenamiento de contraseña.</p>
        <form onSubmit={submit}>
          <label>Nombre<input required value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></label>
          <label>Email<input type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label>
          <label>Contraseña<input type="password" required minLength="4" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          <button className="primary-btn">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ArrowRight size={16} /></button>
        </form>
        <button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '¿Sos nuevo? Crear una cuenta' : 'Ya tengo cuenta · Iniciar sesión'}</button>
      </section>
    </div>
  );
}
