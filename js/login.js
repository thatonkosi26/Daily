import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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

// Set language preference (optional)
auth.languageCode = 'en';

// Google Login Handler
document.getElementById("google-login").addEventListener("click", async () => {
  try {
    // 1. Sign in with Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // 2. Check user document in Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // New user - not signed up properly
      await signOut(auth);
      alert("Please complete your sign-up first.");
      window.location.href = "../html/signup.html";
      return;
    }

    // 3. Update last login timestamp
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });

    // 4. Redirect to dashboard with welcome message
    window.location.href = `../html/dashboard.html?welcome=${encodeURIComponent(user.displayName || 'User')}`;
    
  } catch (error) {
    console.error("Login Error:", {
      code: error.code,
      message: error.message,
      email: error.customData?.email
    });

    // User-friendly error messages
    let errorMessage = "Login failed. Please try again.";
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = "Login window was closed. Please try again.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Network error. Please check your connection.";
        break;
    }
    
    alert(errorMessage);
  }
});