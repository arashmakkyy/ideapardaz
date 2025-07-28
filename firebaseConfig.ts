// @ts-nocheck
// This is because we are using the compat libraries from a CDN, not installed packages.
// The `firebase` global object is available at runtime.

// --- پیکربندی با موفقیت انجام شد ---
// اطلاعات پروژه Firebase شما در اینجا قرار گرفته است.
const firebaseConfig = {
  apiKey: "AIzaSyCwcoG-_zuuKTUkCQR9W2ZiwKnKQGYacYY",
  authDomain: "ideapardaz-app.firebaseapp.com",
  projectId: "ideapardaz-app",
  storageBucket: "ideapardaz-app.firebasestorage.app",
  messagingSenderId: "603787313450",
  appId: "1:603787313450:web:a1080836a0df6247019e53"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

export { app, auth, db };