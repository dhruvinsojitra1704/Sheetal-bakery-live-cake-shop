import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    collection,
    getFirestore,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

if (isFirebaseConfigured) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    onSnapshot(
        collection(db, "products"),
        snapshot => {
            const products = snapshot.docs.map(productDoc => {
                const product = productDoc.data();
                return {
                    ...product,
                    id: product.id ?? productDoc.id
                };
            });

            window.setSheetalStoreProducts(products);
        },
        error => {
            console.error("Unable to load live product updates from Firebase:", error);
        }
    );
}
