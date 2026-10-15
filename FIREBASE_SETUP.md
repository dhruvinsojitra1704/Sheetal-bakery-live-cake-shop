# ફોન પરથી products update કરવા Firebase setup

આ setup પછી `/admin.html` ખોલીને productનું નામ, category, price અને photo update કરી શકાશે. Save થયા પછી Firestore listenerથી shop પર ખુલ્લા બધા customersને updates દેખાશે.

## 1. Firebase project બનાવો

1. [Firebase Console](https://console.firebase.google.com/)માં Google accountથી sign in કરી નવું project બનાવો.
2. Projectમાં Web App ઉમેરો અને મળતું `firebaseConfig` copy કરો.
3. `firebase-config.js`માં એ values ભરો અને `adminEmail`માં admin માટેનો પોતાનો email મૂકો. આ Firebase Web App config browserમાં દેખાય છે; તે Service Account key નથી.

```js
export const firebaseConfig = {
    apiKey: "તમારી-api-key",
    authDomain: "તમારા-project.firebaseapp.com",
    projectId: "તમારો-project-id",
    storageBucket: "તમારા-projectનું-storage-bucket",
    messagingSenderId: "તમારો-sender-id",
    appId: "તમારો-app-id"
};

export const adminEmail = "તમારો-admin-email";
```

## 2. Admin login ચાલુ કરો

1. Firebase Console → **Authentication** → **Get started** → **Sign-in method**માં **Email/Password** enable કરો.
2. Authenticationના **Users** tabમાં ઉપરના `adminEmail` સાથે user બનાવો અને મજબૂત password રાખો.
3. Admin page પર પહેલી વાર sign in કર્યા પછી verification email મોકલીને email verify કરો.

## 3. Firestore અને photo storage બનાવો

1. **Firestore Database**માં database બનાવો. **Rules** tabમાં `firestore.rules`નું content મૂકો.
2. `firestore.rules` અને `storage.rules` બન્નેમાં `REPLACE_WITH_ADMIN_EMAIL`ને `firebase-config.js`માં નાખેલા એ જ admin emailથી બદલો.
3. **Storage**માં default bucket બનાવો. **Rules** tabમાં `storage.rules`નું content મૂકો.

Rules deploy થયા પછી માત્ર verified admin email products બદલી શકશે. Customers products અને product photos જોઈ શકશે, edit નહીં કરી શકે.

## 4. Website publish કરો

`file://`માંથી Firebase sign-in/upload કામ નહીં કરે. Website HTTPS hosting પર હોવી જોઈએ. હાલની hostingમાં projectની files publish કરો; ખાસ કરીને `firebase-config.js`, `products-defaults.js`, `firebase-store.js`, `admin.html`, `admin.css`, `admin.js` અને બન્ને rules files સાચાં deploy કરો. પછી:

- Public shop: તમારી websiteનું home page
- Phone admin: `https://તમારી-website/admin.html`

Adminમાં sign in કર્યા પછી ખાલી catalog હોય તો **Publish starter catalog** દબાવો. ત્યારબાદ productની બાજુમાં **Edit**થી price/photo બદલો અથવા નવું product ઉમેરો. Firebase Web App config તૈયાર થાય ત્યારે તે values આપી દો; projectમાં ભરેલી configથી જ live Firebase connection ચકાસી શકાશે.
