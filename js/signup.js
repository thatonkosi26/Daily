// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK5M6JYJYJ-mfMMBbIQR7y6rksEw9VaJ0",
  authDomain: "daily-80e22.firebaseapp.com",
  projectId: "daily-80e22",
  storageBucket: "daily-80e22.appspot.com",
  messagingSenderId: "1000919369995",
  appId: "1:1000919369995:web:f1e09a673f05fff5f6fa0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Set language (optional)
auth.languageCode = 'en';

// Google Sign-In Handler
document.getElementById("google").addEventListener("click", async () => {
  try {
    // 1. Sign in with Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Create/update user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName || "Anonymous",
      createdAt: serverTimestamp(), // Use Firebase server timestamp
      lastLogin: serverTimestamp()
    }, { merge: true }); // Merge instead of overwrite if doc exists

    // 3. Redirect to dashboard
    window.location.href = "../html/dashboard.html";

  } catch (error) {
    // Enhanced error handling
    console.error("Sign-in failed:", {
      code: error.code,
      message: error.message,
      email: error.customData?.email
    });

    // User-friendly error messages
    let errorMessage = "Sign-in failed. Please try again.";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in window was closed. Please try again.";
    }
    alert(errorMessage);
  }
});