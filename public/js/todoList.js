// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

// Global tasks array
let tasks = [];

// Utility: Get current date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Save tasks to Firestore
async function saveTasksToFirestore() {
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ No user signed in.");
    return;
  }

  const uid = user.uid;
  const today = getTodayDate();
  const taskRef = doc(db, "users", uid, "tasks", today);

  try {
    await setDoc(taskRef, {
      tasks: tasks,
      savedAt: serverTimestamp()
    });
    console.log("✅ Tasks saved successfully!");
  } catch (error) {
    console.error("❌ Error saving tasks:", error);
  }
}

// Load tasks from Firestore on page load
async function loadTasksFromFirestore() {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const today = getTodayDate();
  const taskRef = doc(db, "users", uid, "tasks", today);

  try {
    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      tasks = docSnap.data().tasks || [];
      updateTasksList();
      updateStats();
      console.log("📥 Tasks loaded for today.");
    }
  } catch (error) {
    console.error("❌ Error loading tasks:", error);
  }
}

// Add new task
const addTask = () => {
  const taskInput = document.getElementById('taskInput');
  const text = taskInput.value.trim();

  if (text) {
    tasks.push({ text: text, completed: false });
    taskInput.value = "";
    updateTasksList();
    updateStats();
    saveTasksToFirestore();
  }
};

// Toggle task completion
const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  updateTasksList();
  updateStats();
  saveTasksToFirestore();
};

// Delete task
const deleteTask = (index) => {
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasksToFirestore();
};

// Edit task
const editTask = (index) => {
  const taskInput = document.getElementById('taskInput');
  taskInput.value = tasks[index].text;

  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasksToFirestore();
};

// Update stats UI
const updateStats = () => {
  const completeTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completeTasks / totalTasks) * 100 : 0;

  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${progress}%`;

  document.getElementById("numbers").innerText = `${completeTasks} / ${totalTasks}`;
};

// Update tasks list UI
const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} />
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="../images/edit.png" onClick="editTask(${index})" />
          <img src="../images/bin.png" onClick="deleteTask(${index})" />
        </div>
      </div>
    `;

    listItem.querySelector('.checkbox').addEventListener('change', () => toggleTaskComplete(index));
    taskList.appendChild(listItem);
  });
};

// Auth listener to load tasks once user is confirmed
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTasksFromFirestore();
  } else {
    console.log("🛑 No user logged in.");
    window.location.href = "../html/login.html";
  }
});

// Add button click
document.getElementById('btn-add').addEventListener('click', function (e) {
  e.preventDefault();
  addTask();
});

// Make edit/delete functions globally accessible
window.editTask = editTask;
window.deleteTask = deleteTask;
