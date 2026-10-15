export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export const adminEmail = "";

export const isFirebaseConfigured =
    Object.values(firebaseConfig).every(
        value => typeof value === "string" && value.trim().length > 0
    ) &&
    adminEmail.trim().length > 0;
