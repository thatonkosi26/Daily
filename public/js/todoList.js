// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase Config
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

// Global Variables
let eventsArr = [];
let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let activeDay = today.getDate();

// Get DOM Elements
const daysContainer = document.querySelector(".days");
const date = document.querySelector(".date");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const eventDay = document.querySelector(".event-day");
const eventDate = document.querySelector(".event-date");
const eventsContainer = document.querySelector(".events");
const addEventBtn = document.querySelector(".add-event");
const addEventWrapper = document.querySelector(".add-event-wrapper");
const addEventCloseBtn = document.querySelector(".close");
const addEventTitle = document.querySelector(".event-name");
const addEventFrom = document.querySelector(".event-time-from");
const addEventTo = document.querySelector(".event-time-to");
const addEventSubmit = document.querySelector(".add-event-btn");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Utility Functions
function getDateKey(day, month, year) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function convertTime(time) {
  let [hour, minute] = time.split(":");
  let format = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${format}`;
}

// Firestore Operations
async function saveEventsToFirestore() {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  for (const entry of eventsArr) {
    const dateKey = getDateKey(entry.day, entry.month, entry.year);
    const ref = doc(db, "users", uid, "tasks", dateKey);
    await setDoc(ref, { events: entry.events });
  }
  console.log("✅ Events saved to Firestore.");
}

async function loadEventsFromFirestore(year, month) {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  eventsArr = [];
  const end = new Date(year, month, 0);
  for (let i = 1; i <= end.getDate(); i++) {
    const key = getDateKey(i, month, year);
    const ref = doc(db, "users", uid, "tasks", key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      eventsArr.push({ day: i, month: month, year: year, events: snap.data().events });
    }
  }
  console.log("📥 Events loaded from Firestore.");
}


function addListner() {
  const dayBtns = document.querySelectorAll(".day");
  dayBtns.forEach(day => {
    day.addEventListener("click", (e) => {
      const selected = Number(e.target.innerText);
      activeDay = selected;
      getActiveDay(selected);
      updateEvents(selected);
      dayBtns.forEach(d => d.classList.remove("active"));
      e.target.classList.add("active");
    });
  });
}

function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = `${date} ${months[month]} ${year}`;
}

function updateEvents(date) {
  let events = "";
  eventsArr.forEach(day => {
    if (day.day === date && day.month === month + 1 && day.year === year) {
      day.events.forEach(ev => {
        const completedClass = ev.completed ? "completed" : "";
        events += `
          <div class="event">
            <div class="title">
              <i class="fas fa-circle"></i>
              <h3 class="event-title ${completedClass}">${ev.title}</h3>
            </div>
            <div class="event-time">
              <span class="event-time">${ev.time}</span>
            </div>
          </div>`;
      });
    }
  });
  eventsContainer.innerHTML = events || `<div class="no-event"><h3>No Tasks</h3></div>`;
}

// Add Task
addEventSubmit.addEventListener("click", () => {
  const title = addEventTitle.value;
  const timeFrom = addEventFrom.value;
  const timeTo = addEventTo.value;

  if (!title || !timeFrom || !timeTo) return alert("Please fill all fields");

  const time = `${convertTime(timeFrom)} - ${convertTime(timeTo)}`;
  const newEvent = { title, time };

  let existingDay = eventsArr.find(ev => ev.day === activeDay && ev.month === month + 1 && ev.year === year);
  if (!existingDay) {
    eventsArr.push({ day: activeDay, month: month + 1, year: year, events: [newEvent] });
  } else {
    if (existingDay.events.some(ev => ev.title === title)) return alert("Task already added");
    existingDay.events.push(newEvent);
  }

  addEventWrapper.classList.remove("active");
  addEventTitle.value = addEventFrom.value = addEventTo.value = "";
  updateEvents(activeDay);
  saveEventsToFirestore();
});

// Delete Task modified
// LEFT-CLICK: Toggle completed style and save
eventsContainer.addEventListener("click", (e) => {
  const eventEl = e.target.closest(".event");
  if (!eventEl) return;

  const titleEl = eventEl.querySelector(".event-title");
  if (!titleEl) return;

  const title = titleEl.innerText;

  // Toggle class
  titleEl.classList.toggle("completed");

  // Update eventsArr
  eventsArr.forEach(day => {
    if (day.day === activeDay && day.month === month + 1 && day.year === year) {
      day.events.forEach(ev => {
        if (ev.title === title) {
          ev.completed = titleEl.classList.contains("completed");
        }
      });
    }
  });

  // Save updated state to Firestore
  saveEventsToFirestore();
});

// RIGHT-CLICK: Show delete confirmation
eventsContainer.addEventListener("contextmenu", async (e) => {
  e.preventDefault(); // Prevent default browser context menu

  const eventEl = e.target.closest(".event");
  if (!eventEl) return;

  const title = eventEl.querySelector(".event-title").innerText;

  if (confirm(`Delete "${title}"?`)) {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const dateKey = getDateKey(activeDay, month + 1, year);
    const ref = doc(db, "users", uid, "tasks", dateKey);

    // Update local eventsArr
    const dayEntry = eventsArr.find(
      (day) => day.day === activeDay && day.month === month + 1 && day.year === year
    );
    if (!dayEntry) return;

    // Remove the task locally
    dayEntry.events = dayEntry.events.filter((ev) => ev.title !== title);

    if (dayEntry.events.length === 0) {
      // If no more tasks for this day, remove the whole day and delete Firestore document
      eventsArr = eventsArr.filter(
        (day) =>
          !(day.day === activeDay && day.month === month + 1 && day.year === year)
      );
      try {
        await deleteDoc(ref);
        console.log(`🗑️ Deleted Firestore doc for ${dateKey}`);
      } catch (err) {
        console.error("❌ Firestore delete failed", err);
      }
    } else {
      // Otherwise, update the Firestore document
      try {
        await setDoc(ref, { events: dayEntry.events });
        console.log(`✅ Updated Firestore doc for ${dateKey}`);
      } catch (err) {
        console.error("❌ Firestore update failed", err);
      }
    }

    // Update UI
    updateEvents(activeDay);
  }
});

// UI Interactions
addEventBtn.addEventListener("click", () => addEventWrapper.classList.add("active"));
addEventCloseBtn.addEventListener("click", () => addEventWrapper.classList.remove("active"));

document.addEventListener("click", (e) => {
  if (!addEventWrapper.contains(e.target) && e.target !== addEventBtn) {
    addEventWrapper.classList.remove("active");
  }
});

function updateHeaderDate() {
  const eventDay = document.getElementById("event-day");
  const eventDate = document.getElementById("event-date");

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: 'short' }); // e.g. "Wed"
  const dateNumber = today.getDate();
  const monthName = today.toLocaleDateString("en-US", { month: 'long' }); // e.g. "July"
  const year = today.getFullYear();

  // Suffix logic: 1st, 2nd, 3rd, etc.
  const getDateSuffix = (date) => {
    if (date > 3 && date < 21) return 'th';
    switch (date % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  eventDay.textContent = dayName;
  eventDate.textContent = `${dateNumber}${getDateSuffix(dateNumber)} ${monthName} ${year}`;
}

// Run the update function when the DOM is ready
document.addEventListener("DOMContentLoaded", updateHeaderDate);

// Startup
function getEventsAndInitCalendar() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadEventsFromFirestore(year, month + 1);
      getActiveDay(activeDay);         // Set header for today
      updateEvents(activeDay);         // Render events for today
    } else {
      window.location.href = "../html/login.html";
    }
  });  
}

getEventsAndInitCalendar();