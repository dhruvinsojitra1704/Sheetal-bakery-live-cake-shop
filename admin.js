import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    reload,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getFirestore,
    onSnapshot,
    setDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { adminEmail, firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const setupNotice = document.getElementById("setupNotice");
const loginPanel = document.getElementById("loginPanel");
const verificationPanel = document.getElementById("verificationPanel");
const dashboard = document.getElementById("dashboard");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");
const loginStatus = document.getElementById("loginStatus");
const verificationStatus = document.getElementById("verificationStatus");
const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");

let auth;
let db;
let storage;
let productDocuments = [];
let editingDocumentId = null;
let editingImageUrl = "";
let stopProductListener = null;

function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.dataset.kind = kind;
}

function showVerifiedDashboard() {
    loginPanel.hidden = true;
    verificationPanel.hidden = true;
    dashboard.hidden = false;
    setStatus(verificationStatus, "");

    if (!stopProductListener) {
        stopProductListener = onSnapshot(
            collection(db, "products"),
            snapshot => {
                productDocuments = snapshot.docs.map(productDoc => ({
                    documentId: productDoc.id,
                    ...productDoc.data()
                }));
                renderProductList();
            },
            error => {
                setStatus(
                    productStatus,
                    `Could not load products: ${error.message}`,
                    "error"
                );
            }
        );
    }
}

function renderProductList() {
    productList.replaceChildren();
    document.getElementById("productCount").textContent =
        String(productDocuments.length);

    const isEmpty = productDocuments.length === 0;
    document.getElementById("emptyCatalog").hidden = !isEmpty;
    document.getElementById("seedCatalogButton").hidden = !isEmpty;

    productDocuments
        .slice()
        .sort((first, second) =>
            String(first.name || "").localeCompare(String(second.name || ""))
        )
        .forEach(product => {
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
            summary.textContent =
                `${product.category || "Uncategorized"} · ₹${product.price || 0}`;
            details.append(name, summary);
            row.append(details);

            const actions = document.createElement("div");
            actions.className = "product-actions";
            actions.append(
                createActionButton("Edit", "Edit " + (product.name || "product"), () => {
                    beginEdit(product);
                }),
                createActionButton("Delete", "Delete " + (product.name || "product"), () => {
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
    if (className) {
        button.className = className;
    }
    button.addEventListener("click", onClick);
    return button;
}

function beginEdit(product) {
    editingDocumentId = product.documentId;
    editingImageUrl = product.image || "";
    document.getElementById("editorTitle").textContent = "Edit product";
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "Cakes";
    document.getElementById("productPrice").value = String(product.price || "");
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("saveProductButton").textContent = "Save changes";
    document.getElementById("cancelEditButton").hidden = false;
    imageInput.value = "";

    if (editingImageUrl) {
        imagePreview.src = editingImageUrl;
        imagePreview.hidden = false;
    } else {
        imagePreview.removeAttribute("src");
        imagePreview.hidden = true;
    }

    setStatus(productStatus, "");
    document.getElementById("productForm").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetProductForm() {
    productForm.reset();
    editingDocumentId = null;
    editingImageUrl = "";
    imagePreview.removeAttribute("src");
    imagePreview.hidden = true;
    document.getElementById("editorTitle").textContent = "Add a product";
    document.getElementById("saveProductButton").textContent = "Save product";
    document.getElementById("cancelEditButton").hidden = true;
}

async function removeProduct(product) {
    if (!window.confirm(`Delete ${product.name || "this product"} from the shop?`)) {
        return;
    }

    try {
        await deleteDoc(doc(db, "products", product.documentId));
        if (editingDocumentId === product.documentId) {
            resetProductForm();
        }
        setStatus(productStatus, "Product deleted from the online catalog.", "success");
    } catch (error) {
        setStatus(productStatus, `Could not delete product: ${error.message}`, "error");
    }
}

async function uploadProductImage(productId, file) {
    const extension = file.name.includes(".")
        ? file.name.split(".").pop().replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        : "jpg";
    const imageRef = ref(
        storage,
        `products/${productId}/${Date.now()}.${extension || "jpg"}`
    );
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
}

async function saveProduct(event) {
    event.preventDefault();

    const file = imageInput.files[0];
    if (file && !file.type.startsWith("image/")) {
        setStatus(productStatus, "Choose an image file for the product photo.", "error");
        return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
        setStatus(productStatus, "The photo must be smaller than 5 MB.", "error");
        return;
    }

    const saveButton = document.getElementById("saveProductButton");
    saveButton.disabled = true;
    setStatus(productStatus, file ? "Uploading photo and saving product…" : "Saving product…");

    try {
        const productRef = editingDocumentId
            ? doc(db, "products", editingDocumentId)
            : doc(collection(db, "products"));
        const image = file
            ? await uploadProductImage(productRef.id, file)
            : editingImageUrl;
        const product = {
            id: editingDocumentId
                ? productDocuments.find(item => item.documentId === editingDocumentId)?.id ?? productRef.id
                : productRef.id,
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            price: Number(document.getElementById("productPrice").value),
            description: document.getElementById("productDescription").value.trim(),
            image
        };

        await setDoc(productRef, product);
        resetProductForm();
        setStatus(productStatus, "Saved. The shop is updating for customers now.", "success");
    } catch (error) {
        setStatus(productStatus, `Could not save product: ${error.message}`, "error");
    } finally {
        saveButton.disabled = false;
    }
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
    try {
        const batch = writeBatch(db);
        defaults.forEach(product => {
            batch.set(doc(db, "products", String(product.id)), product);
        });
        await batch.commit();
        setStatus(productStatus, "Starter catalog published. You can now edit prices and photos.", "success");
    } catch (error) {
        setStatus(productStatus, `Could not publish starter catalog: ${error.message}`, "error");
    } finally {
        button.disabled = false;
    }
}

if (!isFirebaseConfigured) {
    setupNotice.hidden = false;
} else {
    try {
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        loginPanel.hidden = false;

        document.getElementById("loginForm").addEventListener("submit", async event => {
            event.preventDefault();
            setStatus(loginStatus, "Signing in…");
            const email = document.getElementById("adminEmailInput").value.trim().toLowerCase();
            const password = document.getElementById("adminPasswordInput").value;
            if (email !== adminEmail.trim().toLowerCase()) {
                setStatus(loginStatus, "This email is not the configured shop admin account.", "error");
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                setStatus(loginStatus, "");
            } catch (error) {
                setStatus(loginStatus, `Sign-in failed: ${error.message}`, "error");
            }
        });

        document.getElementById("sendVerificationButton").addEventListener("click", async () => {
            try {
                await sendEmailVerification(auth.currentUser);
                setStatus(verificationStatus, "Verification email sent. Open it, verify your address, then return here.", "success");
            } catch (error) {
                setStatus(verificationStatus, `Could not send verification email: ${error.message}`, "error");
            }
        });

        document.getElementById("refreshVerificationButton").addEventListener("click", async () => {
            try {
                await reload(auth.currentUser);
                await auth.currentUser.getIdToken(true);
                if (auth.currentUser.emailVerified) {
                    showVerifiedDashboard();
                } else {
                    setStatus(verificationStatus, "Email is not verified yet. Open the verification email and try again.", "error");
                }
            } catch (error) {
                setStatus(verificationStatus, `Could not check verification: ${error.message}`, "error");
            }
        });

        document.getElementById("verificationSignOutButton").addEventListener("click", () => {
            void signOut(auth);
        });
        document.getElementById("signOutButton").addEventListener("click", () => {
            void signOut(auth);
        });
        productForm.addEventListener("submit", saveProduct);
        document.getElementById("cancelEditButton").addEventListener("click", resetProductForm);
        document.getElementById("seedCatalogButton").addEventListener("click", () => {
            void publishStarterCatalog();
        });
        imageInput.addEventListener("change", () => {
            const file = imageInput.files[0];
            if (!file) {
                if (!editingImageUrl) {
                    imagePreview.hidden = true;
                    imagePreview.removeAttribute("src");
                }
                return;
            }
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.hidden = false;
        });

        onAuthStateChanged(auth, async user => {
            if (!user) {
                if (stopProductListener) {
                    stopProductListener();
                    stopProductListener = null;
                }
                dashboard.hidden = true;
                verificationPanel.hidden = true;
                loginPanel.hidden = false;
                return;
            }

            if (user.email?.toLowerCase() !== adminEmail.trim().toLowerCase()) {
                setStatus(loginStatus, "This email is not the configured shop admin account.", "error");
                await signOut(auth);
                return;
            }

            loginPanel.hidden = true;
            if (user.emailVerified) {
                showVerifiedDashboard();
            } else {
                dashboard.hidden = true;
                verificationPanel.hidden = false;
            }
        });
    } catch (error) {
        setupNotice.hidden = false;
        setupNotice.querySelector("p").textContent =
            `Firebase could not be initialized: ${error.message}`;
    }
}
