
/* ==========================================
   1. PRODUCT DATA
========================================== */

const products = [
  {
    id: 1,
    name: "Smartphone X1",
    category: "Electronics",
    price: 15999,
    oldPrice: 19999,
    description: "Powerful performance, stunning display.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Laptop Pro",
    category: "Electronics",
    price: 42499,
    oldPrice: 49999,
    description: "A reliable laptop for work and study.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Wireless Headphones",
    category: "Accessories",
    price: 2999,
    oldPrice: 3999,
    description: "Immersive sound with a comfortable fit.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Smart Watch",
    category: "Accessories",
    price: 4499,
    oldPrice: 5499,
    description: "Track your day in style.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Classic Sneakers",
    category: "Fashion",
    price: 2499,
    oldPrice: 3299,
    description: "Everyday comfort meets modern style.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Travel Backpack",
    category: "Fashion",
    price: 1799,
    oldPrice: 2499,
    description: "Roomy, practical, and ready to travel.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 7,
    name: "Camera",
    category: "Electronics",
    price: 28999,
    oldPrice: 32999,
    description: "Capture your favorite moments.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 8,
    name: "Sunglasses",
    category: "Accessories",
    price: 999,
    oldPrice: 1499,
    description: "A timeless finishing touch.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"
  }
];


/* ==========================================
   2. HTML ELEMENTS
========================================== */

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryFilters = document.getElementById("categoryFilters");

const resultCount = document.getElementById("resultCount");

const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartItemsCount = document.getElementById("cartItemsCount");
const subtotalElement = document.getElementById("subtotal");
const checkoutButton = document.getElementById("checkoutButton");
const toast = document.getElementById("toast");

const wishlistCount = document.getElementById("wishlistCount");
const wishlistButton = document.getElementById("wishlistButton");
const showAllProducts = document.getElementById("showAllProducts");
const showWishlist = document.getElementById("showWishlist");

const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalCategory = document.getElementById("modalCategory");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalAddButton = document.getElementById("modalAddButton");


/* ==========================================
   3. FORMAT PRICES
========================================== */

const formatPrice = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);


/* ==========================================
   4. APPLICATION STATE
========================================== */

let activeCategory = "All";
let showingWishlist = false;
let selectedProductId = null;
let toastTimer;

let wishlist = [];
let cart = [];

try {
  const savedWishlist = JSON.parse(
    localStorage.getItem("shopease-wishlist") || "[]"
  );

  if (Array.isArray(savedWishlist)) {
    wishlist = [
      ...new Set(
        savedWishlist
          .map(Number)
          .filter(id =>
            Number.isInteger(id) &&
            products.some(product => product.id === id)
          )
      )
    ];
  }
} catch {
  wishlist = [];
}

try {
  const savedCart = JSON.parse(
    localStorage.getItem("shopease-cart") || "[]"
  );

  if (Array.isArray(savedCart)) {
    cart = savedCart
      .filter(item =>
        item &&
        products.some(product => product.id === Number(item.id)) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
      )
      .map(item => ({
        id: Number(item.id),
        quantity: item.quantity
      }));
  }
} catch {
  cart = [];
}


/* ==========================================
   5. SAVE DATA
========================================== */

function saveWishlist() {
  try {
    localStorage.setItem(
      "shopease-wishlist",
      JSON.stringify(wishlist)
    );
  } catch {
    showToast("Wishlist could not be saved.");
  }
}

function saveCart() {
  try {
    localStorage.setItem(
      "shopease-cart",
      JSON.stringify(cart)
    );
  } catch {
    showToast("Cart could not be saved.");
  }
}


/* ==========================================
   6. RENDER PRODUCTS
========================================== */

function renderProducts() {
  let filteredProducts = [...products];

  // Filter by category.
  if (activeCategory !== "All") {
    filteredProducts = filteredProducts.filter(product =>
      product.category === activeCategory
    );
  }

  // Filter by search text.
  const searchText = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  if (searchText) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText)
    );
  }

  // Show wishlist products only.
  if (showingWishlist) {
    filteredProducts = filteredProducts.filter(product =>
      wishlist.includes(product.id)
    );
  }

  // Sort products.
  if (sortSelect) {
    switch (sortSelect.value) {
      case "low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;

      case "high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;

      case "name":
        filteredProducts.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
    }
  }

  if (resultCount) {
    resultCount.textContent =
      `Showing ${filteredProducts.length} product(s)`;
  }

  if (!productGrid) {
    console.error('Cannot find the element with id="productGrid".');
    return;
  }

  // Display an empty message.
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>${showingWishlist
          ? "Your wishlist is empty ❤️"
          : "No products found"}</h3>
        <p>${showingWishlist
          ? "Click a heart on a product to save it here."
          : "Try another search or choose a different category."}</p>
      </div>
    `;
    return;
  }

  // Display product cards.
  productGrid.innerHTML = filteredProducts.map((product, index) => {
    const isWishlisted = wishlist.includes(product.id);

    return `
      <article
        class="product-card"
        style="animation-delay: ${index * 55}ms"
      >
        <div class="product-image">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >

          <button
            type="button"
            class="wishlist-btn ${isWishlisted ? "active" : ""}"
            data-wishlist="${product.id}"
            aria-label="${isWishlisted ? "Remove from" : "Add to"} wishlist"
            aria-pressed="${isWishlisted}"
          >
            ${isWishlisted ? "♥" : "♡"}
          </button>
        </div>

        <p class="product-category">${product.category}</p>

        <h3>${product.name}</h3>

        <p class="product-description">${product.description}</p>

        <div class="product-bottom">
          <div>
            <p class="price">${formatPrice(product.price)}</p>
            <p class="old-price">${formatPrice(product.oldPrice)}</p>
          </div>

          <button
            type="button"
            class="add-button"
            data-add="${product.id}"
          >
            + Add
          </button>
        </div>
      </article>
    `;
  }).join("");
}


/* ==========================================
   7. UPDATE WISHLIST DISPLAY
========================================== */

function renderWishlistCount() {
  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
  }

  if (showWishlist) {
    showWishlist.classList.toggle("active", showingWishlist);
  }

  if (showAllProducts) {
    showAllProducts.classList.toggle("active", !showingWishlist);
  }

  if (wishlistButton) {
    wishlistButton.setAttribute(
      "aria-pressed",
      String(showingWishlist)
    );
  }
}

function toggleWishlist(productId) {
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast("Removed from wishlist.");
  } else {
    wishlist.push(productId);
    showToast("Added to wishlist!");
  }

  saveWishlist();
  renderProducts();
  renderWishlistCount();
}


/* ==========================================
   8. CATEGORY FILTERS
========================================== */

if (categoryFilters) {
  categoryFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;
    showingWishlist = false;

    categoryFilters.querySelectorAll("[data-category]").forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });

    renderProducts();
    renderWishlistCount();
  });
}


/* ==========================================
   9. SEARCH AND SORT
========================================== */

if (searchInput) {
  searchInput.addEventListener("input", renderProducts);
}

if (sortSelect) {
  sortSelect.addEventListener("change", renderProducts);
}


/* ==========================================
   10. WISHLIST FILTER BUTTONS
========================================== */

function displayAllProducts() {
  showingWishlist = false;
  renderProducts();
  renderWishlistCount();
}

function displayWishlist() {
  showingWishlist = true;
  renderProducts();
  renderWishlistCount();
}

if (showAllProducts) {
  showAllProducts.addEventListener("click", displayAllProducts);
}

if (showWishlist) {
  showWishlist.addEventListener("click", displayWishlist);
}

if (wishlistButton) {
  wishlistButton.addEventListener("click", () => {
    if (showingWishlist) {
      displayAllProducts();
    } else {
      displayWishlist();
    }
  });
}


/* ==========================================
   11. PRODUCT DETAILS POPUP
========================================== */

function openProductModal(product) {
  if (
    !productModal ||
    !modalImage ||
    !modalName ||
    !modalCategory ||
    !modalPrice ||
    !modalDescription
  ) {
    showToast("Product details popup is unavailable.");
    return;
  }

  selectedProductId = product.id;

  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalName.textContent = product.name;
  modalCategory.textContent = product.category;
  modalPrice.textContent = formatPrice(product.price);
  modalDescription.textContent = product.description;

  productModal.classList.add("visible");
  productModal.setAttribute("aria-hidden", "false");

  if (closeModal) closeModal.focus();
}

function hideProductModal() {
  if (!productModal) return;

  productModal.classList.remove("visible");
  productModal.setAttribute("aria-hidden", "true");
  selectedProductId = null;
}

if (closeModal) {
  closeModal.addEventListener("click", hideProductModal);
}

if (productModal) {
  productModal.addEventListener("click", event => {
    if (event.target === productModal) {
      hideProductModal();
    }
  });
}

if (modalAddButton) {
  modalAddButton.addEventListener("click", () => {
    if (selectedProductId === null) return;

    const productId = selectedProductId;
    addToCart(productId);
    hideProductModal();
  });
}


/* ==========================================
   12. ADD PRODUCTS TO CART
========================================== */

function addToCart(productId) {
  const product = products.find(p => p.id === productId);

  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem && existingItem.quantity >= 99) {
    showToast("Maximum quantity reached.");
    return;
  }

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast("Product added to your cart!");
}


/* ==========================================
   13. PRODUCT CARD CLICK EVENTS
========================================== */

if (productGrid) {
  productGrid.addEventListener("click", event => {
    // Wishlist heart.
    const wishlistBtn = event.target.closest("[data-wishlist]");

    if (wishlistBtn) {
      const productId = Number(wishlistBtn.dataset.wishlist);
      toggleWishlist(productId);
      return;
    }

    // Add-to-cart button.
    const addButton = event.target.closest("[data-add]");

    if (addButton) {
      const productId = Number(addButton.dataset.add);

      addToCart(productId);

      addButton.textContent = "✓ Added";

      setTimeout(() => {
        if (addButton.isConnected) {
          addButton.textContent = "+ Add";
        }
      }, 800);

      return;
    }

    // Open product details when the card is clicked.
    const card = event.target.closest(".product-card");

    if (!card) return;

    const productName = card.querySelector("h3")?.textContent;
    const product = products.find(p => p.name === productName);

    if (product) {
      openProductModal(product);
    }
  });
}


/* ==========================================
   14. RENDER SHOPPING CART
========================================== */

function renderCart() {
  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  if (cartCount) cartCount.textContent = totalQuantity;
  if (cartItemsCount) cartItemsCount.textContent = totalQuantity;

  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty 🛍️</h3>
        <p>Find something you love and add it here.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return "";

    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">

        <div>
          <h3>${product.name}</h3>

          <p class="cart-item-price">
            ${formatPrice(product.price * item.quantity)}
          </p>

          <div class="cart-item-actions">
            <button
              type="button"
              class="quantity-button"
              data-action="decrease"
              data-id="${product.id}"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              class="quantity-button"
              data-action="increase"
              data-id="${product.id}"
              aria-label="Increase quantity"
            >+</button>

            <button
              type="button"
              class="remove-button"
              data-action="remove"
              data-id="${product.id}"
            >Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


/* ==========================================
   15. CART QUANTITY AND REMOVE EVENTS
========================================== */

if (cartItems) {
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const item = cart.find(item => item.id === id);

    if (!item) return;

    switch (button.dataset.action) {
      case "increase":
        if (item.quantity < 99) {
          item.quantity++;
        } else {
          showToast("Maximum quantity reached.");
        }
        break;

      case "decrease":
        item.quantity--;

        if (item.quantity <= 0) {
          cart = cart.filter(item => item.id !== id);
        }
        break;

      case "remove":
        cart = cart.filter(item => item.id !== id);
        showToast("Product removed from cart.");
        break;
    }

    saveCart();
    renderCart();
  });
}


/* ==========================================
   16. OPEN AND CLOSE CART
========================================== */

function openCart() {
  if (!cartPanel || !overlay) return;

  cartPanel.classList.add("open");
  overlay.classList.add("visible");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (closeCart) closeCart.focus();
}

function hideCart() {
  if (!cartPanel || !overlay) return;

  cartPanel.classList.remove("open");
  overlay.classList.remove("visible");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (cartButton) cartButton.focus();
}

if (cartButton) {
  cartButton.addEventListener("click", openCart);
}

if (closeCart) {
  closeCart.addEventListener("click", hideCart);
}

if (overlay) {
  overlay.addEventListener("click", hideCart);
}


/* ==========================================
   17. CHECKOUT DEMO
========================================== */

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    showToast("Demo checkout: payment is not connected yet.");
  });
}


/* ==========================================
   18. TOAST NOTIFICATIONS
========================================== */

function showToast(message) {
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}


/* ==========================================
   19. KEYBOARD EVENTS
========================================== */

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    productModal &&
    productModal.classList.contains("visible")
  ) {
    hideProductModal();
  }

  if (
    event.key === "Escape" &&
    cartPanel &&
    cartPanel.classList.contains("open")
  ) {
    hideCart();
  }
});


/* ==========================================
   20. INITIAL PAGE SETUP
========================================== */

renderProducts();
renderCart();
renderWishlistCount();
