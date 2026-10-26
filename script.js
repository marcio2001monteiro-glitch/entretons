const productGrid = document.querySelector("#product-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector(".empty-state");
const toast = document.querySelector(".toast");
let activeFilter = "Todos";
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatPrice(price) {
  const { currency } = window.ShopStore.settings();
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(price);
}

function renderStoreName() {
  const { storeName } = window.ShopStore.settings();
  const [primary, ...remaining] = storeName.trim().toLocaleLowerCase("pt").split(/\s+/);
  document.querySelectorAll(".brand-primary").forEach((element) => {
    element.textContent = primary || "entre";
  });
  document.querySelectorAll(".brand-secondary").forEach((element) => {
    element.textContent = remaining.join(" ");
  });
  document.querySelectorAll(".wordmark").forEach((element) => {
    element.setAttribute("aria-label", `${storeName}, página inicial`);
  });
  document.title = `${storeName} — beleza do seu jeito`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt");
  const products = window.ShopStore.products().filter((product) => {
    const matchesCategory = activeFilter === "Todos" || product.category === activeFilter;
    const matchesSearch = `${product.name} ${product.description}`.toLocaleLowerCase("pt").includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.replaceChildren();
  emptyState.hidden = products.length > 0;

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    imageWrap.append(image);

    if (product.badge) {
      const badge = document.createElement("span");
      badge.className = "product-tag";
      badge.textContent = product.badge;
      imageWrap.append(badge);
    }

    const addButton = document.createElement("button");
    addButton.className = "quick-add";
    addButton.type = "button";
    addButton.setAttribute("aria-label", `Adicionar ${product.name} à sacola`);
    addButton.textContent = "+";
    addButton.addEventListener("click", () => addToCart(product.id));
    imageWrap.append(addButton);

    const info = document.createElement("div");
    info.className = "product-info";
    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = `${product.category} · ${product.description}`;
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatPrice(product.price);
    details.append(name, description);
    info.append(details, price);
    card.append(imageWrap, info);
    productGrid.append(card);
  });
}

function updateCartCount() {
  const count = window.ShopStore.cart().reduce((total, item) => total + item.quantity, 0);
  document.querySelector(".bag-count").textContent = count;
  return count;
}

function addToCart(productId) {
  const cart = window.ShopStore.cart();
  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  window.ShopStore.saveCart(cart);
  updateCartCount();
  const product = window.ShopStore.products().find((entry) => entry.id === productId);
  showToast(`${product.name} foi para a sua sacola ✳`);
}

function sendOrder() {
  const cart = window.ShopStore.cart();
  if (!cart.length) {
    showToast("Adicione produtos à sacola antes de pedir ✳");
    return;
  }

  const products = window.ShopStore.products();
  const settings = window.ShopStore.settings();
  const lines = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? `• ${product.name} x${item.quantity} — ${formatPrice(product.price * item.quantity)}` : null;
  }).filter(Boolean);

  if (!lines.length) {
    showToast("Os produtos da sacola foram alterados. Adicione-os novamente.");
    window.ShopStore.saveCart([]);
    updateCartCount();
    return;
  }

  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const message = `Olá! Quero fazer este pedido na ${settings.storeName}:\n\n${lines.join("\n")}\n\nTotal dos produtos: ${formatPrice(total)}\n\nComo posso combinar o pagamento e a entrega?`;
  const phone = settings.whatsapp.replace(/\D/g, "");

  if (!phone) {
    showToast("Configure um WhatsApp válido no painel de gerenciamento.");
    return;
  }

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
  });
});

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.filterLink;
    filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === activeFilter));
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
document.querySelector(".bag-button").addEventListener("click", sendOrder);

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  });
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email");
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  document.querySelector(".newsletter-message").textContent = "Demonstração local: cadastro de e-mail ainda não configurado.";
  email.value = "";
});

window.addEventListener("storage", (event) => {
  if (event.key === window.ShopStore.keys.products) renderProducts();
  if (event.key === window.ShopStore.keys.cart) updateCartCount();
  if (event.key === window.ShopStore.keys.settings) renderStoreName();
});
window.addEventListener("entretons:updated", (event) => {
  if (event.detail.key === window.ShopStore.keys.products) renderProducts();
  if (event.detail.key === window.ShopStore.keys.cart) updateCartCount();
  if (event.detail.key === window.ShopStore.keys.settings) renderStoreName();
});

renderProducts();
updateCartCount();
renderStoreName();
