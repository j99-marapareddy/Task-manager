const input = document.getElementById("taskInput");
const typeSelect = document.getElementById("taskType");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const stats = document.getElementById("monthlyStats");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ---------- SAVE ---------- */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------- GENERATE UNIQUE ID ---------- */
function generateId() {
  return Date.now().toString();
}

/* ---------- GET CURRENT WEEK NUMBER ---------- */
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

/* ---------- RESET WEEKLY TASKS IF NEW WEEK ---------- */
function resetWeeklyTasks() {
  const currentWeek = getWeekNumber();

  tasks.forEach(task => {
    if (task.type === "weekly") {
      if (task.weekNumber !== currentWeek) {
        task.completed = false;
        task.weekNumber = currentWeek;
      }
    }
  });

  saveTasks();
}

/* ---------- UPDATE MONTHLY STATS ---------- */
function updateStats() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedThisMonth = tasks.filter(task => {
    if (!task.completedDate) return false;
    const date = new Date(task.completedDate);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  stats.textContent = `This Month: ${completedThisMonth.length} tasks completed`;
}

/* ---------- RENDER ---------- */
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {

    // Weekly tasks disappear when completed
    if (task.type === "weekly" && task.completed) return;

    const li = document.createElement("li");
    li.dataset.id = task.id;

    if (task.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = `${task.text} (${task.type})`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";

    li.append(span, editBtn, deleteBtn);
    taskList.appendChild(li);
  });

  updateStats();
}

/* ---------- ADD TASK ---------- */
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  const type = typeSelect.value;

  if (!text) return;

  tasks.push({
    id: generateId(),
    text,
    type,
    completed: false,
    completedDate: null,
    createdAt: new Date(),
    weekNumber: getWeekNumber()
  });

  saveTasks();
  renderTasks();
  input.value = "";
});

/* ---------- TASK EVENTS ---------- */
taskList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = li.dataset.id;
  const task = tasks.find(t => t.id === id);

  if (e.target.textContent === "❌") {
    tasks = tasks.filter(t => t.id !== id);
  }

  else if (e.target.textContent === "✏️") {
    const newText = prompt("Edit task:", task.text);
    if (newText && newText.trim()) {
      task.text = newText;
    }
  }

  else {
    task.completed = !task.completed;
    task.completedDate = task.completed ? new Date() : null;
  }

  saveTasks();
  renderTasks();
});

/* ---------- INITIALIZE ---------- */
resetWeeklyTasks();
renderTasks();
