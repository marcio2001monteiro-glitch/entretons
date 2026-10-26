(function () {
  const PRODUCT_KEY = "entretons.products.v1";
  const SETTINGS_KEY = "entretons.settings.v1";
  const CART_KEY = "entretons.cart.v1";
  const sampleProducts = [
    {
      id: "batom-beijo-de-sol",
      name: "Batom Beijo de Sol",
      category: "Lábios",
      description: "Coral quentinho",
      price: 1250,
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80",
    },
    {
      id: "blush-meu-momento",
      name: "Blush Meu Momento",
      category: "Rosto",
      description: "Rosa natural",
      price: 1500,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
    },
    {
      id: "paleta-sem-roteiro",
      name: "Paleta Sem Roteiro",
      category: "Olhos",
      description: "12 cores livres",
      price: 2250,
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",
    },
    {
      id: "oleo-pausa-boa",
      name: "Óleo Pausa Boa",
      category: "Autocuidado",
      description: "Toque leve",
      price: 1750,
      image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80",
    },
  ];
  const defaultSettings = { storeName: "Entre Tons", whatsapp: "+238 9583018", currency: "CVE" };

  function read(key, fallback) {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("entretons:updated", { detail: { key } }));
  }

  if (localStorage.getItem(PRODUCT_KEY) === null) {
    write(PRODUCT_KEY, sampleProducts);
  }
  if (localStorage.getItem(SETTINGS_KEY) === null) {
    write(SETTINGS_KEY, defaultSettings);
  }
  if (localStorage.getItem(CART_KEY) === null) {
    write(CART_KEY, []);
  }

  window.ShopStore = {
    keys: { products: PRODUCT_KEY, settings: SETTINGS_KEY, cart: CART_KEY },
    products: () => read(PRODUCT_KEY, []),
    settings: () => read(SETTINGS_KEY, defaultSettings),
    cart: () => read(CART_KEY, []),
    saveProducts: (products) => write(PRODUCT_KEY, products),
    saveSettings: (settings) => write(SETTINGS_KEY, settings),
    saveCart: (cart) => write(CART_KEY, cart),
  };
})();
