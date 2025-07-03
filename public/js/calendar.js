// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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
const todayBtn = document.querySelector(".today-btn");
const gotoBtn = document.querySelector(".goto-btn");
const dateInput = document.querySelector(".date-input");

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

// Calendar Initialization
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

  date.innerHTML = `${months[month]} ${year}`;
  let days = "";

  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    let event = eventsArr.some(ev => ev.day === i && ev.month === month + 1 && ev.year === year);
    let classes = "day";
    if (i === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
      classes += " today active";
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
    }
    if (event) classes += " event";
    days += `<div class="${classes}">${i}</div>`;
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
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

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
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
        events += `<div class="event"><div class="title"><i class="fas fa-circle"></i><h3 class="event-title">${ev.title}</h3></div><div class="event-time"><span class="event-time">${ev.time}</span></div></div>`;
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

// Delete Task
eventsContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("event")) return;
  if (!confirm("Delete this task?")) return;
  const title = e.target.querySelector(".event-title").innerText;
  eventsArr.forEach((day, index) => {
    if (day.day === activeDay && day.month === month + 1 && day.year === year) {
      day.events = day.events.filter(ev => ev.title !== title);
      if (day.events.length === 0) eventsArr.splice(index, 1);
    }
  });
  updateEvents(activeDay);
  saveEventsToFirestore();
});

// UI Interactions
addEventBtn.addEventListener("click", () => addEventWrapper.classList.add("active"));
addEventCloseBtn.addEventListener("click", () => addEventWrapper.classList.remove("active"));

document.addEventListener("click", (e) => {
  if (!addEventWrapper.contains(e.target) && e.target !== addEventBtn) {
    addEventWrapper.classList.remove("active");
  }
});

// Month Navigation
prev.addEventListener("click", () => {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  getEventsAndInitCalendar();
});

next.addEventListener("click", () => {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  getEventsAndInitCalendar();
});

// Startup
function getEventsAndInitCalendar() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadEventsFromFirestore(year, month + 1);
      initCalendar();
    } else {
      window.location.href = "../html/login.html";
    }
  });
}

getEventsAndInitCalendar();


let menuToggle = document.getElementById('menuToggle');
let sidebar = document.querySelector('.sidebar');
let content = document.querySelector('.container'); // ✅ FIXED: define content

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