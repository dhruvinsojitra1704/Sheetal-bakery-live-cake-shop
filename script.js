/* =====================================================
   SHEETAL BAKERY & LIVE CAKE SHOP
   COMPLETE JAVASCRIPT
===================================================== */


/* =====================================================
   WHATSAPP
===================================================== */

const WHATSAPP_NUMBER = "917874131575";


/* =====================================================
   PRODUCTS
===================================================== */

let products = window.SHEETAL_DEFAULT_PRODUCTS || [];

window.setSheetalStoreProducts = function (nextProducts) {
    products = Array.isArray(nextProducts) ? nextProducts : [];
    loadCart();
    renderProducts();
    updateCartUI();
};


/* =====================================================
   STATE
===================================================== */

let cart = [];

let selectedCategory = "Cakes";

let selectedProduct = null;

let modalQuantity = 1;

let selectedSize = "Medium";

let selectedMultiplier = 1;

let customerData = null;

let lastOrderMessage = "";
let lastOrderDetails = null;

let upiQrTimer = null;
let customCakePaymentDetails = null;

const UPI_ID = "gpay-12204499978@okbizaxis";
const UPI_MERCHANT_NAME = "SHEETAL BAKERY & LIVE CAKE SHOP";
const UPI_QR_LIFETIME_SECONDS = 180;


function openCustomerProfile() {
    const overlay = document.getElementById("profileOverlay");
    if (!overlay) return;

    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem("sheetalBakeryCustomerProfile") || "null");
    } catch (error) {
        profile = null;
    }

    if (profile) {
        document.getElementById("profileName").value = profile.name || "";
        document.getElementById("profilePhone").value = profile.phone || "";
        document.getElementById("profileAddress").value = profile.address || "";
        document.getElementById("profilePincode").value = profile.pincode || "";
        document.getElementById("profileTitle").textContent = "Edit Customer Profile";
    } else {
        document.getElementById("profileTitle").textContent = "Create Customer Profile";
    }

    overlay.classList.add("active");
}

function closeCustomerProfile() {
    document.getElementById("profileOverlay")?.classList.remove("active");
}

function setupCustomerProfile() {
    const form = document.getElementById("customerProfileForm");
    if (!form) return;

    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem("sheetalBakeryCustomerProfile") || "null");
    } catch (error) {
        profile = null;
    }

    if (profile) {
        const checkoutName = document.getElementById("customerName");
        const checkoutPhone = document.getElementById("customerPhone");
        const checkoutAddress = document.getElementById("customerAddress");
        const checkoutPincode = document.getElementById("customerPincode");
        if (checkoutName) checkoutName.value = profile.name || "";
        if (checkoutPhone) checkoutPhone.value = profile.phone || "";
        if (checkoutAddress) checkoutAddress.value = profile.address || "";
        if (checkoutPincode) checkoutPincode.value = profile.pincode || "";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("profileName").value.trim();
        const phone = document.getElementById("profilePhone").value.trim();
        const address = document.getElementById("profileAddress").value.trim();
        const pincode = document.getElementById("profilePincode").value.trim();

        if (!name || !/^[0-9]{10}$/.test(phone) || !address || !/^[0-9]{6}$/.test(pincode)) {
            alert("Please enter a valid name, 10-digit mobile number, address and 6-digit pincode.");
            return;
        }

        localStorage.setItem("sheetalBakeryCustomerProfile", JSON.stringify({
            name: name,
            phone: phone,
            address: address,
            pincode: pincode
        }));

        const checkoutName = document.getElementById("customerName");
        const checkoutPhone = document.getElementById("customerPhone");
        const checkoutAddress = document.getElementById("customerAddress");
        const checkoutPincode = document.getElementById("customerPincode");
        if (checkoutName) checkoutName.value = name;
        if (checkoutPhone) checkoutPhone.value = phone;
        if (checkoutAddress) checkoutAddress.value = address;
        if (checkoutPincode) checkoutPincode.value = pincode;

        closeCustomerProfile();
        window.location.href = "profile.html";
    });
}

function getWishlist() {
    try {
        const saved = JSON.parse(localStorage.getItem("sheetalBakeryWishlist") || "[]");
        return Array.isArray(saved) ? saved.map(String) : [];
    } catch (error) {
        return [];
    }
}

function toggleWishlist(productId, button) {
    const wishlist = getWishlist();
    const id = String(productId);
    const index = wishlist.indexOf(id);

    if (index >= 0) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(id);
    }

    localStorage.setItem("sheetalBakeryWishlist", JSON.stringify(wishlist));

    if (button) {
        button.classList.toggle("active", wishlist.includes(id));
        button.textContent = wishlist.includes(id) ? "♥" : "♡";
    }
}

function showWishlist() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
        alert("Your wishlist is empty.");
        return;
    }

    selectedCategory = "All";
    document.querySelectorAll(".category").forEach(function (button) {
        button.classList.remove("active");
    });

    const filtered = products.filter(function (product) {
        return wishlist.includes(String(product.id));
    });

    const grid = document.getElementById("productsGrid");
    const title = document.getElementById("categoryTitle");
    if (title) title.textContent = "My Wishlist";
    if (grid) {
        grid.innerHTML = filtered.map(createProductCard).join("");
    }
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadCart();

    renderProducts();

    updateCartUI();

    setupSearch();

    setupCustomCakeForm();

    setupCheckoutForm();

    setupOfferSlider();
    setupCustomerProfile();

});



/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveCart() {

    localStorage.setItem(
        "sheetalBakeryCart",
        JSON.stringify(cart)
    );

}


function loadCart() {

    const savedCart =
        localStorage.getItem("sheetalBakeryCart");

    if (!savedCart) {

        cart = [];

        return;
    }


    try {

        cart = JSON.parse(savedCart);

        if (!Array.isArray(cart)) {

            cart = [];

        }


        cart = cart.map(function (item) {

            const product = products.find(function (entry) {

                return entry.id === item.productId;

            });

            return product
                ? { ...item, image: product.image }
                : item;

        });


    } catch (error) {

        cart = [];

    }

}



/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts(searchTerm = "") {

    const grid =
        document.getElementById("productsGrid");

    const title =
        document.getElementById("categoryTitle");


    if (!grid) {

        return;

    }


    let filteredProducts = products.filter(
        function (product) {

            const categoryMatch =
                selectedCategory === "All" ||
                product.category === selectedCategory;


            const searchMatch =
                product.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());


            return categoryMatch && searchMatch;

        }
    );


    if (selectedCategory === "All") {

        title.textContent = "All Products";

    } else {

        title.textContent =
            selectedCategory === "Cakes"
                ? "Featured Products"
                : selectedCategory;

    }


    if (filteredProducts.length === 0) {

        grid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;

    }


    grid.innerHTML =
        filteredProducts
            .map(createProductCard)
            .join("");

}



/* =====================================================
   PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const wishlist = getWishlist();
    const isWished = wishlist.includes(String(product.id));
    const imageMarkup = product.image
        ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`
        : "";

    return `

        <article class="product-card">

            <div
                class="product-image"
                onclick="openProductModal('${escapeHtml(String(product.id))}')">

                ${imageMarkup}
                <button
                    type="button"
                    class="wishlist-button${isWished ? " active" : ""}"
                    onclick="event.stopPropagation(); toggleWishlist('${escapeHtml(String(product.id))}', this)"
                    aria-label="${isWished ? "Remove from" : "Add to"} wishlist">
                    ${isWished ? "♥" : "♡"}
                </button>
                <span class="availability">Available</span>

            </div>


            <div class="product-info">

                <div class="product-category">
                    ${escapeHtml(product.category)}
                </div>


                <h3 class="product-name">
                    ${escapeHtml(product.name)}
                </h3>


                <p class="product-description">
                    ${escapeHtml(product.description)}
                </p>


                <div class="product-bottom">

                    <span class="product-price">
                        ₹${product.price}
                    </span>


                    <button
                        class="add-button"
                        onclick="openProductModal('${escapeHtml(String(product.id))}')">

                        <svg class="add-cart-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM1.5 3h3l2.1 11.2a2 2 0 002 1.7h8.7a2 2 0 001.9-1.4l1.5-6.5H6.1"/></svg>
                        <span>Add to Cart</span>

                    </button>

                </div>

            </div>

        </article>

    `;

}



/* =====================================================
   CATEGORY FILTER
===================================================== */

function filterProducts(category, button) {

    selectedCategory = category;


    document
        .querySelectorAll(".category")
        .forEach(function (item) {

            item.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    } else {

        const target =
            document.querySelector(
                `.category[data-category="${category}"]`
            );

        if (target) {

            target.classList.add("active");

        }

    }


    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.value = "";

    }


    renderProducts();

}


function selectCategoryFromNav(category) {

    const button =
        document.querySelector(
            `.category[data-category="${category}"]`
        );


    filterProducts(category, button);

}



/* =====================================================
   SEARCH
===================================================== */

function setupOfferSlider() {
    const slides = Array.from(document.querySelectorAll(".offer-slide"));
    const dots = Array.from(document.querySelectorAll(".offer-dots button"));
    if (slides.length === 0) return;

    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    timer = setInterval(function () {
        showSlide(activeIndex + 1);
    }, 4500);

    document.addEventListener("visibilitychange", function () {
        if (document.hidden && timer) {
            clearInterval(timer);
            timer = null;
        } else if (!document.hidden && !timer) {
            timer = setInterval(function () {
                showSlide(activeIndex + 1);
            }, 4500);
        }
    });
}

function setupSearch() {

    const input =
        document.getElementById("searchInput");
    const heroInput =
        document.getElementById("heroSearchInput");

    if (input) {
        input.addEventListener(
            "input",
            function () {
                renderProducts(input.value);
            }
        );
    }

    if (heroInput) {
        heroInput.addEventListener("input", function () {
            if (input) input.value = heroInput.value;
            renderProducts(heroInput.value);
            document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        heroInput.addEventListener("focus", function () {
            document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

}


function searchProducts() {

    const input =
        document.getElementById("searchInput");

    renderProducts(
        input ? input.value : ""
    );

}


function focusSearch() {

    const input =
        document.getElementById("searchInput");


    if (!input) {

        return;

    }


    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });


    setTimeout(function () {

        input.focus();

    }, 500);

}



/* =====================================================
   SCROLL TO PRODUCTS
===================================================== */

function scrollToProducts() {

    const section =
        document.getElementById("products");


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}



/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(productId) {

    const product =
        products.find(function (item) {

            return String(item.id) === String(productId);

        });


    if (!product) {

        return;

    }


    selectedProduct = product;

    modalQuantity = 1;

    selectedSize = "Medium";

    selectedMultiplier = 1;


    const modalImage =
        document.getElementById("modalProductImage");

    if (product.image) {

        modalImage.src = product.image;

        modalImage.style.display = "";

    } else {

        modalImage.removeAttribute("src");

        modalImage.style.display = "none";

    }


    document.getElementById(
        "modalProductName"
    ).textContent = product.name;


    document.getElementById(
        "modalProductCategory"
    ).textContent = product.category;


    document.getElementById(
        "modalProductDescription"
    ).textContent = product.description;


    updateModalPrice();

    updateModalQuantity();

    resetSizeButtons();


    document
        .getElementById("addedMessage")
        .classList.remove("show");


    document
        .getElementById("productModal")
        .classList.add("active");

}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.remove("active");

}



/* =====================================================
   SIZE
===================================================== */

function selectSize(button) {

    document
        .querySelectorAll(".size-buttons button")
        .forEach(function (item) {

            item.classList.remove("selected");

        });


    button.classList.add("selected");


    selectedSize =
        button.dataset.size;


    selectedMultiplier =
        Number(button.dataset.multiplier);


    updateModalPrice();

}


function resetSizeButtons() {

    document
        .querySelectorAll(".size-buttons button")
        .forEach(function (button) {

            button.classList.remove("selected");

            if (button.dataset.size === "Medium") {

                button.classList.add("selected");

            }

        });

}


function updateModalPrice() {

    if (!selectedProduct) {

        return;

    }


    const price =
        Math.round(
            selectedProduct.price *
            selectedMultiplier
        );


    document.getElementById(
        "modalProductPrice"
    ).textContent = `₹${price}`;

}



/* =====================================================
   MODAL QUANTITY
===================================================== */

function changeModalQuantity(change) {

    modalQuantity += change;


    if (modalQuantity < 1) {

        modalQuantity = 1;

    }


    if (modalQuantity > 20) {

        modalQuantity = 20;

    }


    updateModalQuantity();

}


function updateModalQuantity() {

    const element =
        document.getElementById("modalQuantity");


    if (element) {

        element.textContent = modalQuantity;

    }

}



/* =====================================================
   ADD PRODUCT TO CART
===================================================== */

function addModalProductToCart() {

    if (!selectedProduct) {

        return;

    }


    const finalPrice =
        Math.round(
            selectedProduct.price *
            selectedMultiplier
        );


    const cartId =
        `${selectedProduct.id}-${selectedSize}`;


    const existingItem =
        cart.find(function (item) {

            return item.cartId === cartId;

        });


    if (existingItem) {

        existingItem.quantity += modalQuantity;

    } else {

        cart.push({

            cartId: cartId,

            productId: selectedProduct.id,

            name: selectedProduct.name,

            category: selectedProduct.category,

            image: selectedProduct.image,

            size: selectedSize,

            unitPrice: finalPrice,

            quantity: modalQuantity

        });

    }


    saveCart();

    updateCartUI();


    const message =
        document.getElementById("addedMessage");


    message.classList.add("show");


    setTimeout(function () {

        message.classList.remove("show");

        closeProductModal();

    }, 700);

}



/* =====================================================
   CART
===================================================== */

function openCart() {

    updateCartUI();

    document
        .getElementById("cartOverlay")
        .classList.add("active");

}


function closeCart() {

    document
        .getElementById("cartOverlay")
        .classList.remove("active");

}


function getSubtotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                (item.unitPrice * item.quantity);

        },
        0
    );

}


function getDeliveryCharge() {

    if (cart.length === 0) {

        return 0;

    }


    return 30;

}


function getTotal() {

    return getSubtotal() +
        getDeliveryCharge();

}



/* =====================================================
   CART UI
===================================================== */

function updateCartUI() {

    const count =
        cart.reduce(
            function (total, item) {

                return total + item.quantity;

            },
            0
        );


    const cartCount =
        document.getElementById("cartCount");


    if (cartCount) {

        cartCount.textContent = count;

    }

    const bottomCartCount =
        document.getElementById("bottomCartCount");

    if (bottomCartCount) {
        bottomCartCount.textContent = count;
    }

    const premiumCartCount =
        document.getElementById("premiumCartCount");

    if (premiumCartCount) {
        premiumCartCount.textContent = count;
    }


    const itemCount =
        document.getElementById("cartItemCount");


    if (itemCount) {

        itemCount.textContent =
            `${count} ${count === 1 ? "item" : "items"}`;

    }


    renderCartItems();


    const subtotal =
        getSubtotal();


    const delivery =
        getDeliveryCharge();


    document.getElementById(
        "cartSubtotal"
    ).textContent = `₹${subtotal}`;


    document.getElementById(
        "deliveryCharge"
    ).textContent = `₹${delivery}`;


    document.getElementById(
        "cartTotal"
    ).textContent = `₹${subtotal + delivery}`;

}



/* =====================================================
   RENDER CART ITEMS
===================================================== */

function renderCartItems() {

    const container =
        document.getElementById("cartItems");


    if (!container) {

        return;

    }


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <div style="font-size:45px;">
                    <img class="empty-cart-logo" src="images/logo.jpeg" alt="Sheetal Bakery">
                </div>

                <h3>Your cart is empty</h3>

                <p>
                    Add some delicious items to your cart.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        cart.map(function (item, index) {

            const imageMarkup = item.image
                ? `<img
                    src="${item.image}"
                    alt="${escapeHtml(item.name)}"
                >`
                : "";

            return `

                <div class="cart-item">


                    <div class="cart-item-image">

                        ${imageMarkup}

                    </div>


                    <div class="cart-item-info">

                        <h3>
                            ${escapeHtml(item.name)}
                        </h3>

                        <p>
                            ${escapeHtml(item.size)}
                        </p>


                        <div class="cart-item-actions">

                            <button
                                onclick="changeCartQuantity(${index}, -1)">
                                −
                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                onclick="changeCartQuantity(${index}, 1)">
                                +
                            </button>


                            <button
                                class="remove-item"
                                onclick="removeCartItem(${index})">
                                🗑
                            </button>

                        </div>

                    </div>


                    <div class="cart-item-price">

                        ₹${item.unitPrice * item.quantity}

                    </div>


                </div>

            `;

        }).join("");

}



/* =====================================================
   CART QUANTITY
===================================================== */

function changeCartQuantity(index, change) {

    if (!cart[index]) {

        return;

    }


    cart[index].quantity += change;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart();

    updateCartUI();

}


function removeCartItem(index) {

    if (!cart[index]) {

        return;

    }


    cart.splice(index, 1);

    saveCart();

    updateCartUI();

}



/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout() {

    if (cart.length === 0) {

        alert("Your cart is empty. Please add an item first.");

        return;

    }


    closeCart();


    document
        .getElementById("checkoutOverlay")
        .classList.add("active");

}


function closeCheckout() {

    document
        .getElementById("checkoutOverlay")
        .classList.remove("active");

}


function setupCheckoutForm() {

    const form =
        document.getElementById("checkoutForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            continueToReview();

        }
    );

}



/* =====================================================
   CHECKOUT → REVIEW
===================================================== */

function continueToReview() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    const name =
        document
            .getElementById("customerName")
            .value.trim();


    const phone =
        document
            .getElementById("customerPhone")
            .value.trim();


    const address =
        document
            .getElementById("customerAddress")
            .value.trim();


    const pincode =
        document
            .getElementById("customerPincode")
            .value.trim();


    if (!name || !phone || !address || !pincode) {
        alert("Please fill all required fields.");

        return;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Please enter a valid 10 digit phone number.");

        return;

    }


    if (!/^[0-9]{6}$/.test(pincode)) {

        alert("Please enter a valid 6 digit pincode.");

        return;

    }


    const orderType =
        document.querySelector(
            'input[name="orderType"]:checked'
        )?.value || "Home Delivery";


    const paymentMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value || "Cash on Delivery";


    customerData = {

        name: name,

        phone: phone,

        address: address,

        pincode: pincode,

        orderType: orderType,

        paymentMethod: paymentMethod

    };


    renderReview();


    closeCheckout();


    document
        .getElementById("reviewOverlay")
        .classList.add("active");

}



/* =====================================================
   REVIEW
===================================================== */

function renderReview() {

    const customer =
        document.getElementById("reviewCustomer");


    const items =
        document.getElementById("reviewItems");


    const total =
        document.getElementById("reviewTotal");


    if (!customer || !items || !total) {

        return;

    }


    customer.innerHTML = `

        <strong>
            ${escapeHtml(customerData.name)}
        </strong>

        <br>

        📞 ${escapeHtml(customerData.phone)}

        <br>

        📍 ${escapeHtml(customerData.address)}

        <br>

        Pincode:
        ${escapeHtml(customerData.pincode)}

        <br>

        Order:
        ${escapeHtml(customerData.orderType)}

        <br>

        Payment:
        ${escapeHtml(customerData.paymentMethod)}

    `;


    items.innerHTML =
        cart.map(function (item) {

            return `

                <div class="review-item">

                    <span>
                        ${escapeHtml(item.name)}
                        (${escapeHtml(item.size)})
                        × ${item.quantity}
                    </span>

                    <strong>
                        ₹${item.unitPrice * item.quantity}
                    </strong>

                </div>

            `;

        }).join("");


    total.textContent =
        `₹${getTotal()}`;

    renderUpiPayment();

}

function renderUpiPayment() {
    const section = document.getElementById("upiPaymentSection");
    const confirmButton = document.getElementById("placeOrderBtn");
    const isUpiPayment =
        customerData?.paymentMethod === "UPI / Online Payment";

    if (section) {
        section.hidden = !isUpiPayment;
    }

    if (confirmButton) {
        confirmButton.textContent = isUpiPayment
            ? "I have paid — Continue"
            : "🔒 Place Order";
    }

    if (upiQrTimer) {
        clearInterval(upiQrTimer);
        upiQrTimer = null;
    }

    if (isUpiPayment) {
        generateUpiPaymentQr(
            getTotal(),
            {
                qr: "upiQrCode",
                amount: "upiPaymentAmount",
                countdown: "upiQrCountdown",
                appLink: "upiAppLink"
            },
            "Sheetal Bakery Order"
        );
    }
}

function generateUpiPaymentQr(amountValue, elements, transactionNote) {
    const qrContainer = document.getElementById(elements.qr);
    const amountElement = document.getElementById(elements.amount);
    const countdownElement = document.getElementById(elements.countdown);
    const appLink = document.getElementById(elements.appLink);

    if (!qrContainer || !amountElement || !countdownElement || !appLink) {
        return;
    }

    if (upiQrTimer) {
        clearInterval(upiQrTimer);
        upiQrTimer = null;
    }

    const amount = Number(amountValue).toFixed(2);
    const paymentReference = `SB${Date.now()}`;
    const paymentUrl = `upi://pay?${new URLSearchParams({
        pa: UPI_ID,
        pn: UPI_MERCHANT_NAME,
        tr: paymentReference,
        am: amount,
        cu: "INR",
        tn: transactionNote
    }).toString()}`;

    amountElement.textContent = `Amount: ₹${amount}`;
    appLink.href = paymentUrl;
    appLink.target = "_blank";
    appLink.rel = "noopener noreferrer";
    qrContainer.replaceChildren();

    if (typeof QRCode === "undefined") {
        console.error("UPI QR code library is unavailable.");
        qrContainer.textContent =
            "QR code could not be loaded. Please use Open UPI app.";
    } else {
        try {
            new QRCode(qrContainer, {
                text: paymentUrl,
                width: 220,
                height: 220,
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch (error) {
            console.error("Unable to generate UPI QR code:", error);
            qrContainer.textContent =
                "QR code could not be generated. Please use Open UPI app.";
        }
    }

    const expiresAt = Date.now() + UPI_QR_LIFETIME_SECONDS * 1000;
    const updateCountdown = function () {
        const remainingSeconds =
            Math.ceil((expiresAt - Date.now()) / 1000);

        if (remainingSeconds <= 0) {
            clearInterval(upiQrTimer);
            upiQrTimer = null;
            generateUpiPaymentQr(amountValue, elements, transactionNote);
            return;
        }

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = String(remainingSeconds % 60).padStart(2, "0");

        countdownElement.textContent =
            `New QR in ${minutes}:${seconds}`;
    };

    updateCountdown();
    upiQrTimer = setInterval(updateCountdown, 1000);
}


function closeReview() {

    if (upiQrTimer) {
        clearInterval(upiQrTimer);
        upiQrTimer = null;
    }

    document
        .getElementById("reviewOverlay")
        .classList.remove("active");

}


/* =====================================================
   WHATSAPP ORDER MESSAGE
===================================================== */

function sendOrderToWhatsApp() {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (!name || !phone || !address) {
        alert("Please fill all required delivery details.");
        return;
    }

    let orderText = "🧁 SHEETAL BAKERY & LIVE CAKE SHOP\n\n";
    orderText += "📦 NEW ORDER\n";
    orderText += "━━━━━━━━━━━━━━━━━━\n\n";

    orderText += `👤 Name: ${name}\n`;
    orderText += `📱 Phone: ${phone}\n`;
    orderText += `📍 Address: ${address}\n\n`;

    orderText += "🛒 ORDER ITEMS\n";
    orderText += "━━━━━━━━━━━━━━━━━━\n";

    cart.forEach((item, index) => {
        orderText += `${index + 1}. ${item.name}\n`;
        orderText += `   Qty: ${item.quantity}\n`;
        orderText += `   Price: ₹${item.unitPrice * item.quantity}\n\n`;
    });

    const subtotal = cart.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
    );

    const deliveryCharge = subtotal >= 500 ? 0 : 30;
    const total = subtotal + deliveryCharge;

    orderText += "━━━━━━━━━━━━━━━━━━\n";
    orderText += `Subtotal: ₹${subtotal}\n`;
    orderText += `Delivery: ₹${deliveryCharge}\n`;
    orderText += `TOTAL: ₹${total}\n\n`;

    orderText += "Please confirm my order.\n";
    orderText += "Thank you! ❤️";

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`;

    window.open(whatsappURL, "_blank");
}


/* =====================================================
   OPEN ORDER WHATSAPP
===================================================== */

function openOrderWhatsApp() {

    if (!lastOrderMessage) {

        return;

    }


    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${
            encodeURIComponent(lastOrderMessage)
        }`;


    window.open(url, "_blank");

}

/* =====================================================
   ORDER BILL PDF
===================================================== */

function generateOrderBillPdf(orderDetails) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF library could not be loaded. Please check your internet connection.");
        return null;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const items = orderDetails.items || [];
    let y = 22;

    pdf.setFillColor(102, 66, 45);
    pdf.rect(0, 0, 210, 38, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("SHEETAL BAKERY & LIVE CAKE SHOP", 105, 16, { align: "center" });
    pdf.setFontSize(11);
    pdf.text("ORDER BILL", 105, 27, { align: "center" });

    pdf.setTextColor(45, 45, 45);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    y = 48;
    pdf.text(`Order ID: ${orderDetails.orderId}`, 15, y);
    pdf.text(`Date: ${orderDetails.date}`, 195, y, { align: "right" });
    y += 8;
    pdf.text(`Customer: ${orderDetails.name}`, 15, y);
    y += 7;
    pdf.text(`Mobile: ${orderDetails.phone}`, 15, y);
    y += 7;

    const addressLines = pdf.splitTextToSize(`Address: ${orderDetails.address}`, 180);
    pdf.text(addressLines, 15, y);
    y += addressLines.length * 5 + 7;
    pdf.text(`Payment: ${orderDetails.paymentMethod}`, 15, y);
    y += 10;

    pdf.setDrawColor(180, 150, 120);
    pdf.line(15, y, 195, y);
    y += 8;
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", 15, y);
    pdf.text("Qty", 135, y);
    pdf.text("Amount", 195, y, { align: "right" });
    y += 7;
    pdf.setFont("helvetica", "normal");

    items.forEach(function (item) {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const nameLines = pdf.splitTextToSize(item.name, 112);
        pdf.text(nameLines, 15, y);
        pdf.text(String(quantity), 135, y);
        pdf.text(`Rs. ${price * quantity}`, 195, y, { align: "right" });
        y += Math.max(nameLines.length * 5, 7);
    });

    y += 3;
    pdf.line(15, y, 195, y);
    y += 8;
    pdf.text(`Subtotal: Rs. ${orderDetails.subtotal}`, 195, y, { align: "right" });
    y += 7;
    pdf.text(`Delivery: Rs. ${orderDetails.deliveryCharge}`, 195, y, { align: "right" });
    y += 9;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(102, 66, 45);
    pdf.text(`TOTAL: Rs. ${orderDetails.total}`, 195, y, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text("Thank you for your order!", 105, 285, { align: "center" });

    return pdf;
}

async function sendOrderBillWhatsApp() {
    if (!lastOrderDetails) {
        alert("Please place an order first.");
        return;
    }

    const pdf = generateOrderBillPdf(lastOrderDetails);
    if (!pdf) return;

    const filename = `Sheetal-Bill-${lastOrderDetails.orderId}.pdf`;
    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], filename, { type: "application/pdf" });
    const shareText =
        `Bill for order ${lastOrderDetails.orderId}\n` +
        `Customer: ${lastOrderDetails.name}\n` +
        `Total: Rs. ${lastOrderDetails.total}`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: `Sheetal Bakery Bill - ${lastOrderDetails.orderId}`,
                text: shareText,
                files: [file]
            });
            return;
        } catch (error) {
            if (error.name === "AbortError") return;
        }
    }

    pdf.save(filename);
    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappURL, "_blank");
    alert("PDF downloaded. WhatsApp opened — please attach the downloaded PDF before sending.");
}



/* =====================================================
   SUCCESS
===================================================== */

function closeSuccess() {

    document
        .getElementById("successOverlay")
        .classList.remove("active");


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* =====================================================
   CUSTOM CAKE FORM
===================================================== */

function setupCustomCakeForm() {

    const form =
        document.getElementById("customCakeForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            sendCustomCakeOrder();

        }
    );

    document
        .getElementById("customCakeGenerateQr")
        ?.addEventListener("click", generateCustomCakePaymentQr);

    document
        .getElementById("customCakePaidButton")
        ?.addEventListener("click", sendCustomCakePaidOrder);

}


function sendCustomCakeOrder() {

    const name = document.getElementById("customName")?.value.trim() || "";
    const phone = document.getElementById("customPhone")?.value.trim() || "";
    const flavour = document.getElementById("cakeType")?.value.trim() || "";
    const size = document.getElementById("cake-size")?.value.trim() || "";
    const cakeDate = document.getElementById("cakeDate")?.value || "";
    const message = document.getElementById("customMessage")?.value.trim() || "No special message";
    const paymentMethod =
        document.querySelector('input[name="customPaymentMethod"]:checked')?.value ||
        "Cash on Delivery";
    const photoInput = document.getElementById("cakePhoto");
    const customerPhotoInput = document.getElementById("customerPhoto");

    if (!name || !phone || !flavour || !size || !cakeDate) {
        alert("Please enter your name, phone number, cake flavour, cake weight, and required date.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const customerPhoto =
        flavour === "Custom Photo Cake" && customerPhotoInput?.files.length
            ? customerPhotoInput.files[0]
            : null;
    const referencePhoto = photoInput?.files.length
        ? photoInput.files[0]
        : null;

    if (flavour === "Custom Photo Cake" && !customerPhoto) {
        alert("Please upload your photo for Custom Photo Cake.");
        customerPhotoInput?.focus();
        return;
    }

    const selectedPhotos = [customerPhoto, referencePhoto].filter(Boolean);

    if (selectedPhotos.some(file => !file.type.startsWith("image/"))) {
        alert("Please select valid image files for the cake photos.");
        return;
    }

    if (customerPhoto && customerPhoto.size > 5 * 1024 * 1024) {
        alert("Your photo should be less than 5 MB.");
        return;
    }

    const dateParts = cakeDate.split("-");
    const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : cakeDate;

    customCakePaymentDetails = {
        name,
        phone,
        flavour,
        size,
        formattedDate,
        message,
        paymentMethod,
        hasCustomerPhoto: Boolean(customerPhoto),
        hasReferencePhoto: Boolean(referencePhoto)
    };

    const whatsappMessage = createCustomCakeWhatsAppMessage(
        customCakePaymentDetails,
        false
    );

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, "_blank");

    const paymentSection =
        document.getElementById("customCakePaymentSection");

    if (paymentSection) {
        paymentSection.hidden = paymentMethod !== "UPI / Online Payment";

        if (paymentMethod === "UPI / Online Payment") {
            paymentSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

function createCustomCakeWhatsAppMessage(details, paymentReported) {
    const photoInstructions =
        `${details.hasReferencePhoto ? "\n📸 Reference Photo: Selected. Please attach it in WhatsApp." : "\n📸 Reference Photo: None"}`
        + `${details.hasCustomerPhoto ? "\n👤 Customer Photo: Selected. Please attach it in WhatsApp." : ""}`
        + `${details.hasReferencePhoto || details.hasCustomerPhoto
            ? "\n⚠️ Attach the selected photo(s) in WhatsApp, then press Send."
            : ""}`;

    const paymentDetails = paymentReported
        ? `\n💰 Quoted Amount: ₹${paymentReported.amount}\n💵 Payment Method: UPI / Online Payment\n⚠️ Customer reports payment; please verify it in your UPI account before confirming the order.`
        : `\n💳 Payment Method: ${details.paymentMethod}`;
    const nextStep = paymentReported
        ? "Please verify payment and confirm my custom cake order."
        : details.paymentMethod === "UPI / Online Payment"
            ? "Please confirm the final price and availability. I will pay online after you share the quote."
            : "Please confirm the price and availability.";

    return `🎂 *CUSTOM CAKE ORDER*

👤 Customer Name: ${details.name}
📱 Mobile Number: ${details.phone}

🍰 Cake Flavour: ${details.flavour}
⚖️ Cake Size: ${details.size}
📅 Required Date: ${details.formattedDate}

💬 Cake Message:
${details.message}
${photoInstructions}
${paymentDetails}

${nextStep}

Thank you,
SHEETAL BAKERY & LIVE CAKE SHOP`;
}

function generateCustomCakePaymentQr() {
    const amountInput =
        document.getElementById("customCakeQuotedAmount");
    const amount = Number(amountInput?.value);

    if (!customCakePaymentDetails ||
        customCakePaymentDetails.paymentMethod !== "UPI / Online Payment") {
        alert("Please submit the custom cake request with UPI selected first.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter the exact price confirmed by the bakery.");
        amountInput?.focus();
        return;
    }

    const paymentSection =
        document.getElementById("customCakeQrPayment");

    if (paymentSection) {
        paymentSection.hidden = false;
    }

    generateUpiPaymentQr(
        amount,
        {
            qr: "customCakeQrCode",
            amount: "customCakePaymentAmount",
            countdown: "customCakeQrCountdown",
            appLink: "customCakeUpiAppLink"
        },
        "Sheetal Custom Cake"
    );
}

function sendCustomCakePaidOrder() {
    const amount = Number(
        document.getElementById("customCakeQuotedAmount")?.value
    );

    if (!customCakePaymentDetails ||
        customCakePaymentDetails.paymentMethod !== "UPI / Online Payment" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert("Generate the UPI QR with the bakery-confirmed amount first.");
        return;
    }

    const whatsappMessage = createCustomCakeWhatsAppMessage(
        customCakePaymentDetails,
        { amount: amount.toFixed(2) }
    );
    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, "_blank");
    alert(
        "Your custom cake order request is ready. Please send it on WhatsApp; "
        + "the shop will verify your UPI payment manually."
    );
}


function orderCustomCake() {
    sendCustomCakeOrder();
}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



/* =====================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            event.target.classList.remove(
                "active"
            );

        }

    }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {

            return;

        }


        document
            .querySelectorAll(".modal-overlay")
            .forEach(function (modal) {

                modal.classList.remove("active");

            });

    }
);
/* =========================
   CAKE PHOTO PREVIEW
========================= */

const cakePhotoInput = document.getElementById("cake-photo");
const cakePhotoPreview = document.getElementById("cake-photo-preview");

if (cakePhotoInput) {

    cakePhotoInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            cakePhotoPreview.innerHTML = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            this.value = "";
            cakePhotoPreview.innerHTML = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            cakePhotoPreview.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Selected Cake Photo"
                >
            `;
        };

        reader.readAsDataURL(file);
    });
}
async function uploadCakePhoto() {

    const photoInput =
        document.getElementById("cakePhoto");

    if (!photoInput || !photoInput.files[0]) {
        return null;
    }

    const formData = new FormData();

    formData.append(
        "cakePhoto",
        photoInput.files[0]
    );

    try {

        const response = await fetch(
            "http://localhost:5000/upload-cake-photo",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert("Cake photo upload failed.");
            return null;
        }

        return data.photoUrl;

    } catch (error) {

        console.error(
            "Photo Upload Error:",
            error
        );

        alert(
            "Backend is not connected. Please start the payment server."
        );

        return null;
    }
}
// ==========================================
// SHEETAL BAKERY - CUSTOM CAKE ORDER
// ==========================================

let selectedCakePhoto = null;


// ==========================================
// PHOTO PREVIEW
// ==========================================

function previewCakePhoto(event) {

    const file = event.target.files[0];

    const preview =
        document.getElementById("cakePhotoPreview");

    if (!file) {
        selectedCakePhoto = null;
        preview.innerHTML = "";
        return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        event.target.value = "";
        preview.innerHTML = "";
        selectedCakePhoto = null;
        return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
        alert("Photo size should be less than 5 MB.");
        event.target.value = "";
        preview.innerHTML = "";
        selectedCakePhoto = null;
        return;
    }

    selectedCakePhoto = file;

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <div class="cake-photo-preview-box">

            <img
                src="${imageURL}"
                alt="Selected Cake Photo"
                class="cake-photo-preview"
            >

            <p>
                📷 ${file.name}
            </p>

            <button
                type="button"
                onclick="removeCakePhoto()">
                ❌ Remove Photo
            </button>

        </div>
    `;
}


// ==========================================
// REMOVE PHOTO
// ==========================================

function removeCakePhoto() {

    const photoInput =
        document.getElementById("cakePhoto");

    const preview =
        document.getElementById("cakePhotoPreview");

    photoInput.value = "";

    preview.innerHTML = "";

    selectedCakePhoto = null;
}
document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("cakeDate");

    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        dateInput.min = `${year}-${month}-${day}`;
    }
});

// ==========================================
// CUSTOM CAKE WHATSAPP ORDER
// ==========================================

function sendCustomCake(event) {

    if (event) {
        event.preventDefault();
    }

    // Customer details
    const customerName =
        document.getElementById("customerName")?.value.trim() || "";

    const customerMobile =
        document.getElementById("customerMobile")?.value.trim() || "";

    // Cake details
    const cakeType =
        document.getElementById("cakeType")?.value.trim() || "";

    const cakeWeight =
        document.getElementById("cakeWeight")?.value.trim() || "";

    const cakeDate =
        document.getElementById("cakeDate")?.value || "";

    const cakeDetails =
        document.getElementById("cakeDetails")?.value.trim() || "";

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!customerName) {
        alert("Please enter your name.");
        return;
    }

    if (!customerMobile || !/^[0-9]{10}$/.test(customerMobile)) {
        alert("Please enter a valid 10 digit mobile number.");
        return;
    }

    if (!cakeType) {
        alert("Please select Cake Flavour.");
        return;
    }

    if (!cakeWeight) {
        alert("Please select Cake Weight.");
        return;
    }

    if (!cakeDate) {
        alert("Please select Cake Required Date.");
        return;
    }

    // ==========================================
    // CUSTOM PHOTO CAKE VALIDATION
    // ==========================================

    let customerPhoto = null;

    if (cakeType === "Custom Photo Cake") {

        customerPhoto =
            document.getElementById("customerPhoto");

        if (!customerPhoto || !customerPhoto.files.length) {

            alert(
                "📸 Please upload your photo for Custom Photo Cake."
            );

            customerPhoto?.focus();

            return;
        }
    }

    // ==========================================
    // FORMAT DATE
    // ==========================================

    let formattedDate = cakeDate;

    if (cakeDate) {

        const dateParts = cakeDate.split("-");

        if (dateParts.length === 3) {

            formattedDate =
                `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
    }

    // ==========================================
    // FAVOURITE CAKE PHOTO
    // ==========================================

    const favouritePhoto =
        document.getElementById("cakePhoto");

    const hasFavouritePhoto =
        favouritePhoto &&
        favouritePhoto.files &&
        favouritePhoto.files.length > 0;

// ==========================================
// WHATSAPP MESSAGE
// ==========================================

    let message = "";

    message += `🎂 *CUSTOM CAKE ORDER*`;
    message += `\n\n`;

    message += `👤 *Customer Name:* ${customerName}`;
    message += `\n`;

    message += `📱 *Phone:* ${customerMobile}`;
    message += `\n\n`;

    message += `🍰 *Cake Flavour:* ${cakeType}`;
    message += `\n`;

    message += `⚖️ *Cake Weight:* ${cakeWeight}`;
    message += `\n`;

    message += `📅 *Cake Required Date:* ${formattedDate}`;
    message += `\n`;

    message += `📝 *Design / Message:* ${
        cakeDetails || "Not specified"
    }`;

    message += `\n\n`;

    if (cakeType === "Custom Photo Cake") {
        message += `📸 *Customer Photo:* Uploaded`;
        message += `\n`;
    }

    if (hasFavouritePhoto) {
        message += `⭐ *Favourite Cake Photo:* Uploaded`;
        message += `\n`;
    } else {
        message += `⭐ *Favourite Cake Photo:* Not uploaded`;
        message += `\n`;
    }

    message += `\n`;
    message += `🏪 *SHEETAL BAKERY & LIVE CAKE SHOP*`;

    // ==========================================
    // WHATSAPP
    // ==========================================

    const whatsappNumber = "917874131575";

    const whatsappURL =
       `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
}

// ==========================================
// CUSTOM PHOTO CAKE LOGIC
// ==========================================

function handleCakeTypeChange() {
    const cakeType = document.getElementById("cakeType");
    const board = document.getElementById("customPhotoCakeBoard");
    const customerPhoto = document.getElementById("customerPhoto");

    if (!cakeType || !board) return;

    if (cakeType.value === "Custom Photo Cake") {

        // Show photo upload board
        board.style.display = "block";

        // Customer photo is compulsory
        if (customerPhoto) {
            customerPhoto.required = true;
        }

    } else {

        // Hide photo upload board
        board.style.display = "none";

        // Customer photo is not required
        if (customerPhoto) {
            customerPhoto.required = false;
            customerPhoto.value = "";
        }
    }
}


// ==========================================
// CUSTOMER PHOTO PREVIEW
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const customerPhoto = document.getElementById("customerPhoto");
    const preview = document.getElementById("customerPhotoPreview");

    if (!customerPhoto || !preview) return;

    customerPhoto.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            preview.innerHTML = "";
            return;
        }

        // Check image
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            this.value = "";
            preview.innerHTML = "";
            return;
        }

        // Maximum 5 MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Photo size should be less than 5 MB.");
            this.value = "";
            preview.innerHTML = "";
            return;
        }

        const imageURL = URL.createObjectURL(file);

        preview.innerHTML = `
            <div class="cake-photo-preview-box">
                <img
                    src="${imageURL}"
                    alt="Your Photo"
                    class="cake-photo-preview"
                >

                <p>📷 ${file.name}</p>

                <button
                    type="button"
                    onclick="removeCustomerPhoto()">
                    ❌ Remove Photo
                </button>
            </div>
        `;
    });
});


// ==========================================
// REMOVE CUSTOMER PHOTO
// ==========================================

function removeCustomerPhoto() {

    const customerPhoto =
        document.getElementById("customerPhoto");

    const preview =
        document.getElementById("customerPhotoPreview");

    if (customerPhoto) {
        customerPhoto.value = "";
    }

    if (preview) {
        preview.innerHTML = "";
    }
}

// ==========================================
// HEADER + FIXED NAVIGATION POSITION
// ==========================================

function updateHeaderHeight() {

    const header = document.querySelector("header");
    const nav = document.querySelector(".main-navigation");

    if (!header || !nav) return;

    const headerHeight = header.getBoundingClientRect().height;

    document.documentElement.style.setProperty(
        "--header-height",
        headerHeight + "px"
    );

    nav.style.top = headerHeight + "px";
}

document.addEventListener("DOMContentLoaded", updateHeaderHeight);
window.addEventListener("load", updateHeaderHeight);
window.addEventListener("resize", updateHeaderHeight);


// Page load
document.addEventListener("DOMContentLoaded", function () {
    updateHeaderHeight();
});


// Window resize
window.addEventListener("resize", function () {
    updateHeaderHeight();
});

/* =====================================================
   PLACE ORDER
===================================================== */

function placeOrder(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log("✅ PLACE ORDER CLICKED");

    // Cart check
    if (typeof cart === "undefined" || !cart || cart.length === 0) {
        alert("🛒 Your cart is empty.");
        return;
    }

    // Name
    const nameInput =
        document.getElementById("customerName") ||
        document.getElementById("name");

    const name = nameInput
        ? nameInput.value.trim()
        : "";

    // Mobile
    let phone = "";

    const inputs = document.querySelectorAll("input");

    inputs.forEach(function(input) {

        const value = input.value
            .replace(/\s/g, "")
            .replace(/-/g, "");

        if (/^[6-9][0-9]{9}$/.test(value)) {
            phone = value;
        }
    });

    // Address
    const addressInput =
        document.getElementById("customerAddress") ||
        document.getElementById("address") ||
        document.querySelector('textarea[name="address"]');

    const address = addressInput
        ? addressInput.value.trim()
        : "";

    const paymentMethod =
        document.querySelector('input[name="paymentMethod"]:checked')?.value ||
        "Cash on Delivery";

    // Validation
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!phone) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    if (!address) {
        alert("Please enter your delivery address.");
        return;
    }

    const total = getTotal();

    /* =================================================
       CUSTOM CONFIRM ORDER POPUP
    ================================================= */

    const overlay = document.createElement("div");

    overlay.className = "confirm-order-overlay";

    overlay.innerHTML = `
        <div class="confirm-order-box">

            <div class="confirm-order-header">

                <button
                    type="button"
                    class="confirm-order-close"
                    id="confirmOrderClose">
                    ×
                </button>

                <div class="confirm-order-cake-icon">
                    🎂
                </div>

                <h3>Confirm Your Order</h3>

                <p>
                    SHEETAL BAKERY & LIVE CAKE SHOP
                </p>

            </div>


            <div class="confirm-order-body">

                <div class="confirm-order-info">

                    <div class="confirm-order-row">

                        <span class="row-icon">
                            👤
                        </span>

                        <div>
                            <strong>Customer</strong>
                            <br>
                            ${escapeHTML(name)}
                        </div>

                    </div>


                    <div class="confirm-order-row">

                        <span class="row-icon">
                            📞
                        </span>

                        <div>
                            <strong>Mobile</strong>
                            <br>
                            ${escapeHTML(phone)}
                        </div>

                    </div>


                    <div class="confirm-order-row">

                        <span class="row-icon">
                            📍
                        </span>

                        <div>
                            <strong>Delivery Address</strong>
                            <br>
                            ${escapeHTML(address)}
                        </div>

                    </div>

                    <div class="confirm-order-row">

                        <span class="row-icon">
                            💳
                        </span>

                        <div>
                            <strong>Payment Method</strong>
                            <br>
                            ${escapeHTML(paymentMethod)}
                        </div>

                    </div>

                </div>


                <div class="confirm-order-total">

                    <span>
                        💰 Total Amount
                    </span>

                    <strong>
                        ₹${total}
                    </strong>

                </div>


                <div class="confirm-order-actions">

                    <button
                        type="button"
                        class="confirm-order-cancel"
                        id="confirmOrderCancel">

                        Cancel

                    </button>


                    <button
                        type="button"
                        class="confirm-order-yes"
                        id="confirmOrderYes">

                        ${paymentMethod === "UPI / Online Payment"
                            ? "I've paid — Send order"
                            : "🎉 Confirm Order"}

                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(overlay);


    /* =================================================
       CLOSE POPUP
    ================================================= */

    document
        .getElementById("confirmOrderClose")
        .onclick = function () {

            overlay.remove();

        };


    document
        .getElementById("confirmOrderCancel")
        .onclick = function () {

            overlay.remove();

        };


    /* =================================================
       CONFIRM ORDER
    ================================================= */

    document
        .getElementById("confirmOrderYes")
        .onclick = function () {

            overlay.remove();

            // WhatsApp message
            let message =
                "🎂 *SHEETAL BAKERY & LIVE CAKE SHOP*\n\n" +
                "🛍️ *NEW ORDER*\n\n" +
                "👤 Name: " + name + "\n" +
                "📞 Mobile: " + phone + "\n" +
                "📍 Address: " + address + "\n\n";


            message += "🧁 *ORDER ITEMS:*\n";


     cart.forEach(function(item) {

    const quantity =
        Number(item.quantity) || 1;

    const price =
        Number(item.unitPrice) || 0;

    message +=
        "• " +
        item.name +
        " × " +
        quantity +
        " = ₹" +
        (price * quantity) +
        "\n";
});
            message +=
                "\n💰 *TOTAL AMOUNT: ₹" +
                total +
                "*" +
                "\n💵 Payment: " +
                paymentMethod +
                (paymentMethod === "UPI / Online Payment"
                    ? "\n⚠️ Customer reports UPI payment. Please verify the payment in your UPI account before confirming the order."
                    : "") +
                "\n\n🙏 Thank you for ordering!" +
                "\n*SHEETAL BAKERY & LIVE CAKE SHOP* ❤️";


            const whatsappNumber =
                "917874131575";


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);

            const orderId = "SB" + Date.now().toString().slice(-8);

            lastOrderMessage = message;
            lastOrderDetails = {
                orderId: orderId,
                date: new Date().toLocaleString("en-IN"),
                name: name,
                phone: phone,
                address: address,
                paymentMethod: paymentMethod,
                items: cart.map(function (item) {
                    return {
                        name: item.name,
                        quantity: Number(item.quantity) || 1,
                        unitPrice: Number(item.unitPrice) || 0
                    };
                }),
                subtotal: getSubtotal(),
                deliveryCharge: getDeliveryCharge(),
                total: total
            };

            const orderIdElement = document.getElementById("orderId");
            if (orderIdElement) {
                orderIdElement.textContent = orderId;
            }

            closeReview();

            const successOverlay = document.getElementById("successOverlay");
            if (successOverlay) {
                successOverlay.classList.add("active");
            }

            window.open(whatsappURL, "_blank");

        };


    /* =================================================
       CLOSE WHEN CLICKING OUTSIDE
    ================================================= */

    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
cart.forEach(function(item) {

    const quantity =
        Number(item.quantity) || 1;

    const price =
        Number(item.unitPrice) || 0;

    message +=
        "• " +
        item.name +
        " × " +
        quantity +
        " = ₹" +
        (quantity * price) +
        "\n";

});

function setupBottomNavigation() {
    const nav = document.querySelector(".app-bottom-nav");
    if (!nav) return;

    const items = Array.from(nav.querySelectorAll(".app-nav-item"));

    function setActive(name) {
        items.forEach(function (item) {
            item.classList.toggle("active", item.dataset.nav === name);
        });
    }

    items.forEach(function (item) {
        item.addEventListener("click", function () {
            if (item.dataset.nav) setActive(item.dataset.nav);
        });
    });

    const home = document.getElementById("home");
    const products = document.getElementById("products");

    if ("IntersectionObserver" in window && home && products) {
        const observer = new IntersectionObserver(function (entries) {
            const visible = entries
                .filter(function (entry) { return entry.isIntersecting; })
                .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
            if (!visible[0]) return;

            if (visible[0].target.id === "products") setActive("categories");
            if (visible[0].target.id === "home") setActive("home");
        }, { threshold: [0.15, 0.35, 0.55] });

        observer.observe(home);
        observer.observe(products);
    }
}

document.addEventListener("DOMContentLoaded", setupBottomNavigation);

function toggleMobilePhoneMenu() {
    const menu = document.getElementById("mobilePhoneMenu");
    const button = document.querySelector(".premium-phone");
    if (!menu) return;

    const isOpen = menu.classList.toggle("show");
    if (button) button.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function toggleContactNumbers() {
    const contactNumbers = document.getElementById("contactNumbers");
    const contactButton = document.querySelector(".contact-icon-btn");

    if (contactNumbers) {
        contactNumbers.classList.toggle("show");
        if (contactButton) {
            contactButton.setAttribute(
                "aria-expanded",
                contactNumbers.classList.contains("show") ? "true" : "false"
            );
        }
    }
}

// Contact box બહાર click થાય ત્યારે close
document.addEventListener("click", function (event) {
    const contactBox = document.querySelector(".top-contact");
    const contactNumbers = document.getElementById("contactNumbers");

    if (
        contactBox &&
        contactNumbers &&
        !contactBox.contains(event.target)
    ) {
        contactNumbers.classList.remove("show");
        document
            .querySelector(".contact-icon-btn")
            ?.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("click", function (event) {
    const menu = document.getElementById("mobilePhoneMenu");
    const phoneButton = document.querySelector(".premium-phone");
    if (!menu || !phoneButton) return;

    if (!menu.contains(event.target) && !phoneButton.contains(event.target)) {
        menu.classList.remove("show");
        phoneButton.setAttribute("aria-expanded", "false");
    }
});
