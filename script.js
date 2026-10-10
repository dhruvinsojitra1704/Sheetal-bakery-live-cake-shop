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

const products = [

    {
        id: 1,
        name: "Chocolate Cake",
        category: "Cakes",
        price: 450,
        image: "",
        description:
            "Rich chocolate cake with fresh cream and chocolate decoration."
    },

    {
        id: 2,
        name: "Vanilla Cake",
        category: "Cakes",
        price: 400,
        image: "",
        description:
            "Soft vanilla cake with fresh cream and colourful decoration."
    },

    {
        id: 3,
        name: "Black Forest Cake",
        category: "Cakes",
        price: 500,
        image: "",
        description:
            "Classic black forest cake with chocolate and cherries."
    },

    {
        id: 4,
        name: "Red Velvet Cake",
        category: "Cakes",
        price: 550,
        image: "",
        description:
            "Soft red velvet cake with creamy frosting."
    },


    {
        id: 5,
        name: "Fresh Bread",
        category: "Bakery",
        price: 40,
        image: "",
        description:
            "Fresh and soft bakery bread."
    },

    {
        id: 6,
        name: "Butter Biscuits",
        category: "Bakery",
        price: 80,
        image: "",
        description:
            "Crispy and delicious butter biscuits."
    },


    {
        id: 7,
        name: "Potato Chips",
        category: "Snacks",
        price: 50,
        image: "",
        description:
            "Crispy potato chips for your snack time."
    },


    {
        id: 8,
        name: "Pepsi 330 ml",
        category: "Cold Drinks",
        price: 40,
        image: "",
        description:
            "Chilled refreshing Pepsi can."
    },

    {
        id: 9,
        name: "Fresh Juice",
        category: "Cold Drinks",
        price: 60,
        image: "",
        description:
            "Refreshing fruit juice."
    },


    {
        id: 10,
        name: "Grocery Pack",
        category: "Grocery",
        price: 120,
        image: "",
        description:
            "Useful grocery products for your daily needs."
    },


    {
        id: 11,
        name: "Premium Dry Fruits",
        category: "Dry Fruits",
        price: 350,
        image: "",
        description:
            "Premium quality mixed dry fruits."
    },


    {
        id: 12,
        name: "Chocolate Box",
        category: "Chocolates",
        price: 250,
        image: "",
        description:
            "Delicious assorted chocolate box."
    }

];


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

        title.textContent = selectedCategory;

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

    return `

        <article class="product-card">

            <div
                class="product-image"
                onclick="openProductModal(${product.id})">

                ${product.image
                    ? `<img
                        src="${product.image}"
                        alt="${escapeHtml(product.name)}"
                    >`
                    : ""}

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
                        onclick="openProductModal(${product.id})">

                        🛒 Add to Cart

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

function setupSearch() {

    const input =
        document.getElementById("searchInput");


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            renderProducts(input.value);

        }
    );

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

            return item.id === productId;

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
                    🛒
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

}


function closeReview() {

    document
        .getElementById("reviewOverlay")
        .classList.remove("active");

}



/* =====================================================
   PLACE ORDER
===================================================== */

function placeOrder() {

    if (!customerData) {

        alert("Please enter your delivery details first.");

        return;

    }


    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    const orderId =
        "SB" +
        Date.now().toString().slice(-8);


    const subtotal =
        getSubtotal();


    const delivery =
        customerData.orderType === "Pick Up"
            ? 0
            : 30;


    const total =
        subtotal + delivery;


    lastOrderMessage =
        createWhatsAppOrderMessage(
            orderId,
            subtotal,
            delivery,
            total
        );


    document.getElementById(
        "orderId"
    ).textContent = orderId;


    closeReview();


    document
        .getElementById("successOverlay")
        .classList.add("active");


    // Clear cart after order
    cart = [];

    saveCart();

    updateCartUI();

}


function createWhatsAppOrderMessage(orderId, subtotal, delivery, total) {

    let orderText =
        "🧁 SHEETAL BAKERY & LIVE CAKE SHOP\n\n" +
        "📦 NEW ORDER\n" +
        "━━━━━━━━━━━━━━━━━━\n\n" +
        `Order ID: ${orderId}\n` +
        `👤 Name: ${customerData.name}\n` +
        `📱 Phone: ${customerData.phone}\n` +
        `📍 Address: ${customerData.address}\n` +
        `Pincode: ${customerData.pincode}\n` +
        `Order Type: ${customerData.orderType}\n` +
        `Payment: ${customerData.paymentMethod}\n\n` +
        "🛒 ORDER ITEMS\n" +
        "━━━━━━━━━━━━━━━━━━\n";

    cart.forEach(function (item, index) {

        orderText +=
            `${index + 1}. ${item.name} (${item.size})\n` +
            `   Qty: ${item.quantity}\n` +
            `   Price: ₹${item.unitPrice * item.quantity}\n\n`;

    });

    orderText +=
        "━━━━━━━━━━━━━━━━━━\n" +
        `Subtotal: ₹${subtotal}\n` +
        `Delivery: ₹${delivery}\n` +
        `TOTAL: ₹${total}\n\n` +
        "Please confirm my order.\n" +
        "Thank you! ❤️";

    return orderText;

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
        orderText += `   Price: ₹${item.price * item.quantity}\n\n`;
    });

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
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

}


function sendCustomCakeOrder() {

    const name =
        document
            .getElementById("customName")
            .value.trim();


    const phone =
        document
            .getElementById("customPhone")
            .value.trim();


    const flavour =
        document
            .getElementById("customFlavour")
            .value;


    const size =
        document
            .getElementById("customSize")
            .value;


    const message =
        document
            .getElementById("customMessage")
            .value.trim();


    if (!name || !phone) {

        alert("Please enter your name and phone number.");

        return;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Please enter a valid 10 digit mobile number.");

        return;

    }


    const whatsappMessage =

        `*CUSTOM CAKE ORDER*\n\n` +

        `━━━━━━━━━━━━━━━━━━\n\n` +

        `Name: ${name}\n` +

        `Phone: ${phone}\n` +

        `Flavour: ${flavour}\n` +

        `Size: ${size}\n` +

        `Design / Message: ${
            message || "Not specified"
        }\n\n` +

        `━━━━━━━━━━━━━━━━━━\n\n` +

        `SHEETAL BAKERY & LIVE CAKE SHOP`;


    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${
            encodeURIComponent(whatsappMessage)
        }`;


    window.open(url, "_blank");

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