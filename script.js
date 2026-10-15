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

    const name = document.getElementById("customName")?.value.trim() || "";
    const phone = document.getElementById("customPhone")?.value.trim() || "";
    const flavour = document.getElementById("customFlavour")?.value || "Not specified";
    const size = document.getElementById("customSize")?.value || "Not specified";
    const message = document.getElementById("customMessage")?.value.trim() || "No special message";
    const photoInput = document.getElementById("cake-photo");

    if (!name || !phone || !flavour || !size) {
        alert("Please fill all required cake details.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    let photoText = "No reference photo selected.";

    if (photoInput && photoInput.files.length > 0) {
        photoText =
            "Reference cake photo selected: " +
            photoInput.files[0].name;
    }

    const whatsappMessage =
`🎂 *CUSTOM CAKE ORDER*

👤 Customer Name: ${name}
📱 Mobile Number: ${phone}

🍰 Cake Flavour: ${flavour}
⚖️ Cake Size: ${size}

💬 Cake Message:
${message}

📸 Reference Photo:
${photoText}

Please confirm the price and availability.

Thank you,
SHEETAL BAKERY & LIVE CAKE SHOP`;

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappURL, "_blank");
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
async function startRazorpayPayment() {

    if (typeof cart === "undefined" || cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name =
        document.getElementById("customerName")?.value.trim();

    const phone =
        document.getElementById("customerPhone")?.value.trim();

    const address =
        document.getElementById("customerAddress")?.value.trim();

    if (!name || !phone || !address) {
        alert("Please fill Customer Name, Mobile Number and Address.");
        return;
    }

    const total = getTotal();

    if (total <= 0) {
        alert("Invalid order amount.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/create-order",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: total * 100
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert("Unable to create payment order.");
            return;
        }

        const options = {

            key: "rzp_test_TmBmm0ABWHZ4UD",

            amount: data.order.amount,

            currency: "INR",

            name: "SHEETAL BAKERY & LIVE CAKE SHOP",

            description: "Bakery Order Payment",

            order_id: data.order.id,

            prefill: {
                name: name,
                contact: phone
            },

            theme: {
                color: "#8b5e4b"
            },

            handler: async function (paymentResponse) {

                try {

                    const verifyResponse = await fetch(
                        "http://localhost:5000/verify-payment",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,
                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,
                                razorpay_signature:
                                    paymentResponse.razorpay_signature
                            })
                        }
                    );

                    const result = await verifyResponse.json();

                    if (result && result.success) {

                        alert(
                            "✅ Payment Successful!\n\n" +
                            "Payment ID: " +
                            paymentResponse.razorpay_payment_id +
                            "\n\nYour order has been confirmed."
                        );

                        console.log("Payment Verified:", result);

                    } else {

                        alert(
                            "❌ Payment verification failed.\n\n" +
                            "Please contact SHEETAL BAKERY."
                        );

                        console.error("Verification failed:", result);
                    }

                } catch (error) {

                    console.error("Verification Error:", error);

                    alert(
                        "Payment was completed, but verification could not be completed.\n" +
                        "Please contact the shop before making another payment."
                    );
                }
            },

            modal: {
                ondismiss: function () {
                    console.log("Payment window closed.");
                }
            }
        };

        if (!window.Razorpay) {
            alert("Payment gateway is unavailable right now.");
            return;
        }

        const razorpayCheckout =
            new window.Razorpay(options);

        razorpayCheckout.open();

    } catch (error) {

        console.error("Payment Error:", error);

        alert(
            "Payment system could not connect.\n" +
            "Please try again."
        );
    }
}
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

                        🎉 Confirm Order

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
        (quantity * price) +
        "\n";

});

            message +=
                "\n💰 *TOTAL AMOUNT: ₹" +
                total +
                "*" +
                "\n💵 Payment: Cash on Delivery" +
                "\n\n🙏 Thank you for ordering!" +
                "\n*SHEETAL BAKERY & LIVE CAKE SHOP* ❤️";


            const whatsappNumber =
                "917874131575";


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);


            // Success message
            alert(
                "🎉 ORDER PLACED SUCCESSFULLY!\n\n" +
                "Thank you, " +
                name +
                " ❤️"
            );


            // Open WhatsApp
            window.open(
                whatsappURL,
                "_blank"
            );

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