import {
    adminEmail,
    isSupabaseConfigured,
    supabaseAnonKey,
    supabaseUrl
} from "./supabase-config.js";

const setupNotice = document.getElementById("setupNotice");
const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");
const loginStatus = document.getElementById("loginStatus");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const orderStatuses = ["New", "Contacted", "Confirmed", "Completed"];
const websiteDefaults = {
    id: "public",
    banner_title: "Fresh Cakes For Every Moment",
    banner_description: "Delicious freshly made cakes for birthdays, anniversaries and every special moment.",
    shop_hours: "",
    shop_location: "Pasodra, Surat",
    shop_phone: "7874131575",
    alternate_phone: "9723687308",
    featured_products: [],
    review_url: "https://maps.app.goo.gl/myKn36fq3SijcxV27",
    catalogue_url: "Cake%20Manual%201.pdf"
};

let supabase;
let productDocuments = [];
let editingProductId = null;
let editingImageUrl = "";
let dashboardChannel = null;
let dashboardLoading = false;
let dashboardGeneration = 0;
let currentWebsiteContent = { ...websiteDefaults };
let previewObjectUrl = "";

function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.dataset.kind = kind;
}

function setAdminView(viewName) {
    document.querySelectorAll(".admin-view").forEach(view => {
        view.hidden = view.id !== `${viewName}View`;
    });
    document.querySelectorAll(".admin-nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.adminView === viewName);
    });
}

function stopDashboardListeners() {
    if (dashboardChannel && supabase) {
        void supabase.removeChannel(dashboardChannel);
        dashboardChannel = null;
    }
}

function showLogin() {
    stopDashboardListeners();
    dashboardGeneration += 1;
    dashboardLoading = false;
    dashboard.hidden = true;
    loginPanel.hidden = false;
}

function getSafeHttpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

async function handleSession(session) {
    const user = session?.user;
    if (!user) {
        showLogin();
        return;
    }

    if (user.email?.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
        setStatus(loginStatus, "This account is not the configured shop owner.", "error");
        await supabase.auth.signOut();
        return;
    }
    if (!user.email_confirmed_at) {
        setStatus(loginStatus, "Verify the owner email in Supabase before signing in.", "error");
        await supabase.auth.signOut();
        return;
    }

    loginPanel.hidden = true;
    dashboard.hidden = false;
    if (dashboardChannel || dashboardLoading) return;
    dashboardLoading = true;
    const generation = dashboardGeneration;
    try {
        await loadDashboardData();
        if (generation === dashboardGeneration) {
            dashboardChannel = subscribeToDashboardChanges();
        }
    } finally {
        dashboardLoading = false;
    }
}

async function loadDashboardData() {
    await Promise.all([
        loadProducts(),
        loadRecords("orders", "ordersList", "order"),
        loadRecords("custom_cake_requests", "requestsList", "request"),
        loadWebsiteContent()
    ]);
}

function subscribeToDashboardChanges() {
    return supabase
        .channel("shop-admin-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
            void loadProducts();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
            void loadRecords("orders", "ordersList", "order");
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "custom_cake_requests" }, () => {
            void loadRecords("custom_cake_requests", "requestsList", "request");
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "website_content" }, () => {
            void loadWebsiteContent();
        })
        .subscribe(status => {
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                console.error("Supabase realtime subscription status:", status);
            }
        });
}

async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) {
        setStatus(productStatus, `Could not load products: ${error.message}`, "error");
        return;
    }
    productDocuments = data || [];
    renderProductList();
}

async function loadRecords(table, listId, kind) {
    const statusElement = document.getElementById(kind === "order" ? "ordersStatus" : "requestsStatus");
    const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        setStatus(statusElement, `Could not load ${kind === "order" ? "orders" : "custom cake requests"}: ${error.message}`, "error");
        return;
    }

    const records = data || [];
    const countId = kind === "order" ? "ordersCount" : "requestsCount";
    const badgeId = kind === "order" ? "ordersBadge" : "requestsBadge";
    document.getElementById(countId).textContent = String(records.length);
    document.getElementById(badgeId).textContent =
        String(records.filter(record => (record.status || "New") === "New").length);
    setStatus(statusElement, "");
    await renderRecords(listId, records, kind);
}

async function renderRecords(listId, records, kind) {
    const list = document.getElementById(listId);
    list.replaceChildren();

    if (!records.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = kind === "order"
            ? "No customer orders have arrived yet."
            : "No custom cake requests have arrived yet.";
        list.append(empty);
        return;
    }

    for (const record of records) {
        const card = document.createElement("article");
        card.className = "record-card";
        const content = document.createElement("div");
        const heading = document.createElement("div");
        heading.className = "record-heading";

        const title = document.createElement("h3");
        title.textContent = kind === "order"
            ? `${record.name || "Customer"} · ${record.order_id || record.id}`
            : `${record.name || "Customer"} · ${record.flavour || "Custom cake"}`;
        const time = document.createElement("small");
        time.textContent = record.created_at
            ? new Date(record.created_at).toLocaleString()
            : "Time unavailable";
        heading.append(title, time);
        content.append(heading);

        const details = document.createElement("p");
        details.className = "record-details";
        if (kind === "order") {
            const items = Array.isArray(record.items)
                ? record.items.map(item => `${item.name || "Item"} × ${Number(item.quantity) || 1}`).join(", ")
                : "Items not provided";
            details.textContent =
                `${record.phone || "No phone"} · ${record.address || "No address"} · `
                + `${record.pincode ? `PIN ${record.pincode} · ` : ""}${record.order_type || "Home Delivery"} · `
                + `${items} · ${record.payment_method || "Payment method not specified"} · `
                + `Subtotal ₹${Number(record.subtotal) || 0} + delivery ₹${Number(record.delivery_charge) || 0} · `
                + `Total ₹${Number(record.total) || 0}`;
        } else {
            details.textContent =
                `${record.phone || "No phone"} · ${record.flavour || "Cake"} · `
                + `${record.size || "Size not specified"} · Required ${record.required_date || "date not specified"} · `
                + `${record.message || "No message"} · ${record.payment_method || "Payment not specified"}`;
        }
        content.append(details);

        if (kind === "request") {
            const photos = document.createElement("div");
            photos.className = "request-photos";
            for (const [label, path] of [
                ["View reference photo", record.reference_photo_path],
                ["View customer photo", record.customer_photo_path]
            ]) {
                if (!path) continue;
                const { data, error } = await supabase.storage
                    .from("cake-requests")
                    .createSignedUrl(path, 60 * 60);
                if (error) {
                    console.error(`Could not create a private ${label.toLowerCase()} link:`, error);
                    setStatus(
                        document.getElementById("requestsStatus"),
                        `Could not open a cake request photo: ${error.message}`,
                        "error"
                    );
                    continue;
                }
                const link = document.createElement("a");
                link.href = getSafeHttpsUrl(data.signedUrl);
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = label;
                if (link.href) photos.append(link);
            }
            if (photos.childElementCount) content.append(photos);
        }

        const controls = document.createElement("div");
        controls.className = "record-controls";
        const phoneLink = document.createElement("a");
        phoneLink.href = `tel:${String(record.phone || "").replace(/[^\d+]/g, "")}`;
        phoneLink.className = "secondary-button compact-button";
        phoneLink.textContent = "Call";
        controls.append(phoneLink);

        const status = document.createElement("select");
        status.setAttribute("aria-label", `Update ${kind} status`);
        orderStatuses.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.append(option);
        });
        status.value = orderStatuses.includes(record.status) ? record.status : "New";
        status.addEventListener("change", async () => {
            const previousStatus = record.status || "New";
            status.disabled = true;
            const { error } = await supabase
                .from(kind === "order" ? "orders" : "custom_cake_requests")
                .update({ status: status.value })
                .eq("id", record.id);
            if (error) {
                setStatus(
                    document.getElementById(kind === "order" ? "ordersStatus" : "requestsStatus"),
                    `Could not update status: ${error.message}`,
                    "error"
                );
                status.value = previousStatus;
            }
            status.disabled = false;
        });
        controls.append(status);
        card.append(content, controls);
        list.append(card);
    }
}

function renderProductList() {
    productList.replaceChildren();
    document.getElementById("productCount").textContent = String(productDocuments.length);
    const isEmpty = productDocuments.length === 0;
    document.getElementById("emptyCatalog").hidden = !isEmpty;
    document.getElementById("seedCatalogButton").hidden = !isEmpty;

    productDocuments.forEach(product => {
        const row = document.createElement("article");
        row.className = "admin-product";
        if (product.image) {
            const image = document.createElement("img");
            image.src = product.image;
            image.alt = "";
            image.loading = "lazy";
            row.append(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "product-placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            placeholder.textContent = "🍰";
            row.append(placeholder);
        }

        const details = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed product";
        const summary = document.createElement("p");
        summary.textContent = `${product.category || "Uncategorized"} · ₹${product.price || 0}`;
        details.append(name, summary);
        row.append(details);

        const actions = document.createElement("div");
        actions.className = "product-actions";
        actions.append(
            createActionButton("Edit", `Edit ${product.name || "product"}`, () => beginEdit(product)),
            createActionButton(product.hidden ? "Show" : "Hide", `${product.hidden ? "Show" : "Hide"} ${product.name || "product"}`, () => {
                void setProductVisibility(product, !product.hidden);
            }),
            createActionButton("Delete", `Delete ${product.name || "product"}`, () => {
                void removeProduct(product);
            }, "delete-button")
        );
        row.append(actions);
        productList.append(row);
    });
}

function createActionButton(label, accessibleLabel, onClick, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    if (className) button.className = className;
    button.addEventListener("click", onClick);
    return button;
}

function beginEdit(product) {
    editingProductId = product.id;
    editingImageUrl = product.image || "";
    document.getElementById("editorTitle").textContent = "Edit product";
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "Cakes";
    document.getElementById("productPrice").value = String(product.price || "");
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("saveProductButton").textContent = "Save changes";
    document.getElementById("cancelEditButton").hidden = false;
    imageInput.value = "";
    setImagePreview(editingImageUrl);
    setStatus(productStatus, "");
    productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setImagePreview(url) {
    if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = "";
    }
    if (url) {
        imagePreview.src = url;
        imagePreview.hidden = false;
    } else {
        imagePreview.removeAttribute("src");
        imagePreview.hidden = true;
    }
}

function resetProductForm() {
    productForm.reset();
    editingProductId = null;
    editingImageUrl = "";
    setImagePreview("");
    document.getElementById("editorTitle").textContent = "Add a product";
    document.getElementById("saveProductButton").textContent = "Save product";
    document.getElementById("cancelEditButton").hidden = true;
}

async function uploadProductImage(productId, file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
        throw new Error("Choose a JPEG, PNG, WebP or GIF photo smaller than 5 MB.");
    }
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `products/${productId}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("shop-public").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from("shop-public").getPublicUrl(path);
    return data.publicUrl;
}

async function saveProduct(event) {
    event.preventDefault();
    const file = imageInput.files[0];
    if (file && (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) ||
        file.size > 5 * 1024 * 1024)) {
        setStatus(productStatus, "Choose a JPEG, PNG, WebP or GIF photo smaller than 5 MB.", "error");
        return;
    }

    const button = document.getElementById("saveProductButton");
    button.disabled = true;
    setStatus(productStatus, file ? "Uploading photo and saving product…" : "Saving product…");
    try {
        const id = editingProductId || crypto.randomUUID();
        const image = file ? await uploadProductImage(id, file) : editingImageUrl;
        const product = {
            id,
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            price: Number(document.getElementById("productPrice").value),
            description: document.getElementById("productDescription").value.trim(),
            image,
            hidden: Boolean(productDocuments.find(item => item.id === id)?.hidden)
        };
        const { error } = await supabase.from("products").upsert(product);
        if (error) throw error;
        resetProductForm();
        setStatus(productStatus, "Saved. The shop catalog is updating now.", "success");
        await loadProducts();
    } catch (error) {
        setStatus(productStatus, `Could not save product: ${error.message}`, "error");
    } finally {
        button.disabled = false;
    }
}

async function setProductVisibility(product, hidden) {
    const { error } = await supabase.from("products").update({ hidden }).eq("id", product.id);
    if (error) {
        setStatus(productStatus, `Could not update product visibility: ${error.message}`, "error");
        return;
    }
    setStatus(productStatus, `${product.name || "Product"} ${hidden ? "hidden from" : "visible in"} the shop.`, "success");
    await loadProducts();
}

async function removeProduct(product) {
    if (!window.confirm(`Delete ${product.name || "this product"} from the shop?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
        setStatus(productStatus, `Could not delete product: ${error.message}`, "error");
        return;
    }
    if (editingProductId === product.id) resetProductForm();
    setStatus(productStatus, "Product deleted from the online catalog.", "success");
    await loadProducts();
}

async function publishStarterCatalog() {
    const button = document.getElementById("seedCatalogButton");
    const defaults = window.SHEETAL_DEFAULT_PRODUCTS;
    if (!Array.isArray(defaults) || defaults.length === 0) {
        setStatus(productStatus, "Starter catalog is unavailable on this page.", "error");
        return;
    }

    button.disabled = true;
    setStatus(productStatus, "Publishing starter products…");
    const rows = defaults.map(product => ({ ...product, id: String(product.id), hidden: false }));
    const { error } = await supabase.from("products").upsert(rows);
    if (error) {
        setStatus(productStatus, `Could not publish starter catalog: ${error.message}`, "error");
    } else {
        setStatus(productStatus, "Starter catalog published. You can now edit prices and photos.", "success");
        await loadProducts();
    }
    button.disabled = false;
}

function fillWebsiteForm(content) {
    currentWebsiteContent = { ...websiteDefaults, ...(content || {}) };
    document.getElementById("bannerTitle").value = currentWebsiteContent.banner_title;
    document.getElementById("bannerDescription").value = currentWebsiteContent.banner_description;
    document.getElementById("shopHours").value = currentWebsiteContent.shop_hours;
    document.getElementById("shopLocation").value = currentWebsiteContent.shop_location;
    document.getElementById("shopPhone").value = currentWebsiteContent.shop_phone;
    document.getElementById("alternatePhone").value = currentWebsiteContent.alternate_phone;
    document.getElementById("featuredProducts").value =
        Array.isArray(currentWebsiteContent.featured_products)
            ? currentWebsiteContent.featured_products.join(", ")
            : "";
    document.getElementById("reviewUrl").value = currentWebsiteContent.review_url;
    const current = document.getElementById("catalogueCurrent");
    current.replaceChildren();
    const safeUrl = getSafeHttpsUrl(new URL(
        currentWebsiteContent.catalogue_url || "",
        window.location.href
    ).href);
    if (safeUrl) {
        const link = document.createElement("a");
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open current cake catalogue";
        current.append(link);
    } else {
        current.textContent = "No catalogue has been uploaded.";
    }
}

async function loadWebsiteContent() {
    const { data, error } = await supabase
        .from("website_content")
        .select("*")
        .eq("id", "public")
        .maybeSingle();
    if (error) {
        setStatus(document.getElementById("websiteStatus"), `Could not load website content: ${error.message}`, "error");
        return;
    }
    fillWebsiteForm(data || websiteDefaults);
}

async function uploadCatalogue(file) {
    if (file.type !== "application/pdf" || file.size > 20 * 1024 * 1024) {
        throw new Error("Choose a PDF catalogue smaller than 20 MB.");
    }
    const path = `catalogue/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("shop-public").upload(path, file, {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: false
    });
    if (error) throw error;
    return supabase.storage.from("shop-public").getPublicUrl(path).data.publicUrl;
}

async function saveWebsiteContent(event) {
    event.preventDefault();
    const button = document.getElementById("saveWebsiteButton");
    const file = document.getElementById("cataloguePdf").files[0];
    button.disabled = true;
    setStatus(document.getElementById("websiteStatus"), file ? "Uploading catalogue and saving details…" : "Saving website details…");

    try {
        const catalogueUrl = file ? await uploadCatalogue(file) : currentWebsiteContent.catalogue_url;
        const content = {
            id: "public",
            banner_title: document.getElementById("bannerTitle").value.trim(),
            banner_description: document.getElementById("bannerDescription").value.trim(),
            shop_hours: document.getElementById("shopHours").value.trim(),
            shop_location: document.getElementById("shopLocation").value.trim(),
            shop_phone: document.getElementById("shopPhone").value.trim(),
            alternate_phone: document.getElementById("alternatePhone").value.trim(),
            featured_products: document.getElementById("featuredProducts").value
                .split(",").map(value => value.trim()).filter(Boolean).slice(0, 12),
            review_url: document.getElementById("reviewUrl").value.trim(),
            catalogue_url: catalogueUrl
        };
        const { error } = await supabase.from("website_content").upsert(content);
        if (error) throw error;
        document.getElementById("cataloguePdf").value = "";
        fillWebsiteForm(content);
        setStatus(document.getElementById("websiteStatus"), "Saved. The public shop will show the updated details after refresh.", "success");
    } catch (error) {
        setStatus(document.getElementById("websiteStatus"), `Could not save website content: ${error.message}`, "error");
    } finally {
        button.disabled = false;
    }
}

if (!isSupabaseConfigured) {
    setupNotice.hidden = false;
} else {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    loginPanel.hidden = false;

    document.getElementById("loginForm").addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("adminEmailInput").value.trim().toLowerCase();
        const password = document.getElementById("adminPasswordInput").value;
        if (email !== adminEmail.trim().toLowerCase()) {
            setStatus(loginStatus, "This email is not the configured shop owner account.", "error");
            return;
        }
        setStatus(loginStatus, "Signing in…");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setStatus(loginStatus, `Sign-in failed: ${error.message}`, "error");
    });

    document.getElementById("signOutButton").addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) setStatus(loginStatus, `Could not sign out: ${error.message}`, "error");
    });
    document.querySelectorAll(".admin-nav-button").forEach(button => {
        button.addEventListener("click", () => setAdminView(button.dataset.adminView));
    });
    document.getElementById("websiteForm").addEventListener("submit", saveWebsiteContent);
    productForm.addEventListener("submit", saveProduct);
    document.getElementById("cancelEditButton").addEventListener("click", resetProductForm);
    document.getElementById("seedCatalogButton").addEventListener("click", () => {
        void publishStarterCatalog();
    });
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) {
            setImagePreview(editingImageUrl);
            return;
        }
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = URL.createObjectURL(file);
        imagePreview.src = previewObjectUrl;
        imagePreview.hidden = false;
    });

    supabase.auth.onAuthStateChange((_event, session) => {
        queueMicrotask(() => {
            void handleSession(session).catch(error => {
                setStatus(loginStatus, `Could not start the admin dashboard: ${error.message}`, "error");
            });
        });
    });
    supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
            setStatus(loginStatus, `Could not check the saved login: ${error.message}`, "error");
            return;
        }
        void handleSession(data.session);
    });
}
