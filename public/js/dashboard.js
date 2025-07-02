import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

// Watch auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      document.getElementById("welcome-message").textContent = `Hey, ${data.name || "User"}`;
    }
  } else {
    // Not logged in
    window.location.href = "../html/login.html";
  }
});

let menuToggle = document.getElementById('menuToggle');
let sidebar = document.querySelector('.sidebar');
let content = document.querySelector('.content'); // ✅ FIXED: define content

menuToggle.onclick = function () {
  menuToggle.classList.toggle('active');
  sidebar.classList.toggle('active');

  if (sidebar.classList.contains('active')) {
    content.style.marginLeft = '300px';
    content.style.width = "calc(100vw - 300px)";
  } else {
    content.style.marginLeft = '80px';
    content.style.width = "calc(100vw - 80px)";
  }
};

let Menulist = document.querySelectorAll('.Menulist li');

function activeLink() {
  Menulist.forEach((item) => item.classList.remove('active'));
  this.classList.add('active');
}

Menulist.forEach((item) =>
  item.addEventListener('click', activeLink)
);