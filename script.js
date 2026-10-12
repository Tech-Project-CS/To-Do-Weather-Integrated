// getting elements from the html file
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

const allTaskButton = document.getElementById("allTasksButton");
const completedTaskButton = document.getElementById("completedTasksButton");
const pendingTaskButton = document.getElementById("pendingTasksButton");

// array to store all the tasks
// each task will be like { text: "study", done: false }
let tasks = [];

// tab to be selected: "all", "completed", or "pending"
let selectedTab = "all";


// show the tasks in the task list based on the selected tab
function showTasks() {
    taskList.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {

        // check which tab is selected and filter the tasks accordingly
        if (selectedTab === "completed" && tasks[i].done === false) {
            continue;
        }
        if (selectedTab === "pending" && tasks[i].done === true) {
            continue;
        }

        const li = document.createElement("li");
        if (tasks[i].done === true) {
            li.classList.add("completed");
        }

        // checkbox to mark the task as done or not done
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tasks[i].done;
        checkbox.addEventListener("change", function () {
            tasks[i].done = checkbox.checked;
            showTasks();
        });

        // task text
        const span = document.createElement("span");
        span.textContent = tasks[i].text;

        // edit button to edit the tasks
        const editTaskButton = document.createElement("button");
        editTaskButton.textContent = "Edit";
        editTaskButton.className = "editTaskButton";
        editTaskButton.addEventListener("click", function () {
            editTask(i);
        });

        // delete button to delete the tasks
        const deleteTaskButton = document.createElement("button");
        deleteTaskButton.textContent = "Delete";
        deleteTaskButton.className = "deleteTaskButton";
        deleteTaskButton.addEventListener("click", function () {
            deleteTask(i);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editTaskButton);
        li.appendChild(deleteTaskButton);
        taskList.appendChild(li);
    }

    updateCounts();
}

// show the counts of all, completed, and pending tasks on the tab buttons
function updateCounts() {
    let completed = 0;
    let pending = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].done === true) {
            completed++;
        } else {
            pending++;
        }
    }

    allTaskButton.textContent = "All Tasks (" + tasks.length + ")";
    completedTaskButton.textContent = "Completed Tasks (" + completed + ")";
    pendingTaskButton.textContent = "Pending Tasks (" + pending + ")";
}

// add a task
function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        return;
    }

    tasks.push({ text: text, done: false });
    taskInput.value = "";
    showTasks();
}

// edit a task
function editTask(index) {
    const newText = prompt("Edit the task:", tasks[index].text);

    // if user clicks cancel or enters an empty string, do not update the task
    if (newText === null || newText.trim() === "") {
        return;
    }

    tasks[index].text = newText.trim();
    showTasks();
}

// delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    showTasks();
}

// change the tab
function changeTab(tabName) {
    selectedTab = tabName;

    // remove active from all buttons
    allTaskButton.classList.remove("active");
    completedTaskButton.classList.remove("active");
    pendingTaskButton.classList.remove("active");

    // add active to the clicked task
    if (tabName === "all") {
        allTaskButton.classList.add("active");
    } else if (tabName === "completed") {
        completedTaskButton.classList.add("active");
    } else {
        pendingTaskButton.classList.add("active");
    }

    showTasks();
}


// button clicks
addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

allTaskButton.addEventListener("click", function () { changeTab("all"); });
completedTaskButton.addEventListener("click", function () { changeTab("completed"); });
pendingTaskButton.addEventListener("click", function () { changeTab("pending"); });


// show the numbers when page opens
updateCounts();
