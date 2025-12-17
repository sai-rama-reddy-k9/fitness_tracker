const API_URL = "http://localhost:3000/api";
// Current user and visibility states

let showAllFeed = false; // ADD THIS LINE
// DOM Elements
let authSection,
  appSection,
  loginContainer,
  registerContainer,
  loginForm,
  registerForm;
let showRegisterLink,
  showLoginLink,
  workoutForm,
  workoutList,
  usernameDisplay,
  logoutBtn;

// Current user and workout visibility state
let currentUser = null;
let showAllWorkouts = false;

// Initialize DOM elements after page loads
function initializeElements() {
  authSection = document.getElementById("authSection");
  appSection = document.getElementById("appSection");
  loginContainer = document.getElementById("loginContainer");
  registerContainer = document.getElementById("registerContainer");
  loginForm = document.getElementById("loginForm");
  registerForm = document.getElementById("registerForm");
  showRegisterLink = document.getElementById("showRegister");
  showLoginLink = document.getElementById("showLogin");
  workoutForm = document.getElementById("workoutForm");
  workoutList = document.getElementById("workoutList");
  usernameDisplay = document.getElementById("usernameDisplay");
  logoutBtn = document.getElementById("logoutBtn");
}

// Check if user is logged in (on page load)
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();

  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLogin();
  }
});

// Setup event listeners
function setupEventListeners() {
  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegister();
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLogin();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (workoutForm) {
    workoutForm.addEventListener("submit", handleWorkoutSubmit);
  }
}

// Show Login Form
function showLogin() {
  if (loginContainer && registerContainer) {
    loginContainer.style.display = "block";
    registerContainer.style.display = "none";
  }
  if (authSection && appSection) {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
}

// Show Register Form
function showRegister() {
  if (loginContainer && registerContainer) {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  }
}

// Global functions for onclick events
function switchToLogin() {
  event.preventDefault();
  showLogin();
}

function switchToRegister() {
  event.preventDefault();
  showRegister();
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      currentUser = result.user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showApp();
      loginForm.reset();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Login failed. Please check if the server is running.");
  }
}

// Register handler
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      alert("Registration successful! Please login with your new account.");
      registerForm.reset();
      showLogin();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Registration failed. Please check if the server is running.");
  }
}

// Logout handler
function handleLogout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showAllWorkouts = false; // Reset to default view
  showLogin();
}

// Workout handler
async function handleWorkoutSubmit(e) {
  e.preventDefault();

  const exercise = document.getElementById("exercise").value;
  const duration = document.getElementById("duration").value;
  const calories = document.getElementById("calories").value;

  try {
    const response = await fetch(`${API_URL}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exercise,
        duration: parseInt(duration),
        calories: parseInt(calories),
        user_id: currentUser.id,
      }),
    });

    const result = await response.json();

    if (result.success) {
      workoutForm.reset();
      loadWorkouts();
      loadStats();
      loadFeed();
      alert("Workout added successfully! 🎉");
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Failed to save workout. Please try again.");
  }
}

// Show/Hide Sections
function showApp() {
  if (authSection && appSection) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    usernameDisplay.textContent = currentUser.username;
    loadWorkouts();
    loadStats();
    loadFeed();
  }
}

// Toggle workout visibility
function toggleWorkoutVisibility() {
  showAllWorkouts = !showAllWorkouts;
  loadWorkouts(); // Reload to reflect the change
}

// Load workouts with show/hide functionality
async function loadWorkouts() {
  try {
    const response = await fetch(`${API_URL}/workouts`);
    const result = await response.json();

    if (result.success) {
      const userWorkouts = result.data.filter(
        (workout) => workout.user_id === currentUser.id
      );
      displayWorkouts(userWorkouts);
    }
  } catch (error) {
    workoutList.innerHTML = "<p>Error loading workouts.</p>";
  }
}

function displayWorkouts(workouts) {
  if (workouts.length === 0) {
    workoutList.innerHTML =
      "<p>No workouts logged yet. Add your first workout!</p>";
    return;
  }

  // Sort by date (newest first)
  workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Determine which workouts to show
  const workoutsToShow = showAllWorkouts ? workouts : workouts.slice(0, 3);
  const hiddenWorkoutsCount = workouts.length - 3;

  let workoutHTML = workoutsToShow
    .map(
      (workout) => `
    <div class="workout-item">
        <div class="workout-details">
            <strong>${workout.exercise}</strong>
            <div class="exercise-duration">Duration: ${workout.duration} minutes</div>
        </div>
        <div class="workout-meta">
            <div class="calories">${workout.calories} kcal</div>
            <div class="date">${workout.date}</div>
        </div>
    </div>
`
    )
    .join("");

  // Add show/hide links if there are more than 3 workouts
  if (workouts.length > 3) {
    if (showAllWorkouts) {
      workoutHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleWorkoutVisibility()">▲ Hide older workouts</a>
                </div>
            `;
    } else {
      workoutHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleWorkoutVisibility()">▼ Show all workouts (${hiddenWorkoutsCount} more)</a>
                </div>
            `;
    }
  }

  workoutList.innerHTML = workoutHTML;
}

// Load user statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats/${currentUser.id}`);
    const result = await response.json();

    if (result.success) {
      const stats = result.data;
      document.getElementById("totalWorkouts").textContent =
        stats.totalWorkouts || 0;
      document.getElementById("totalMinutes").textContent =
        stats.totalMinutes || 0;
      document.getElementById("totalCalories").textContent =
        stats.totalCalories || 0;
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Load social feed
async function loadFeed() {
  try {
    const response = await fetch(`${API_URL}/feed`);
    const result = await response.json();

    if (result.success) {
      displayFeed(result.data);
    }
  } catch (error) {
    console.error("Error loading feed:", error);
  }
}

function displayFeed(feedItems) {
  const feedList = document.getElementById("feedList");

  if (feedItems.length === 0) {
    feedList.innerHTML = "<p>No recent community activities.</p>";
    return;
  }

  // Determine which feed items to show
  const feedToShow = showAllFeed ? feedItems : feedItems.slice(0, 3);
  const hiddenFeedCount = feedItems.length - 3;

  let feedHTML = feedToShow
    .map(
      (item) => `
        <div class="feed-item">
            <div class="feed-details">
                <span class="username">${item.username}</span>
                <div>did <span class="exercise">${item.exercise}</span> for ${item.duration} minutes</div>
            </div>
            <div class="feed-meta">
                <div class="calories">${item.calories} kcal</div>
                <div class="date">${item.date}</div>
            </div>
        </div>
    `
    )
    .join("");

  // Add show/hide links if there are more than 3 feed items
  if (feedItems.length > 3) {
    if (showAllFeed) {
      feedHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleFeedVisibility()">▲ Hide older activities</a>
                </div>
            `;
    } else {
      feedHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleFeedVisibility()">▼ Show all activities (${hiddenFeedCount} more)</a>
                </div>
            `;
    }
  }

  feedList.innerHTML = feedHTML;
}
// Toggle feed visibility
function toggleFeedVisibility() {
  showAllFeed = !showAllFeed;
  loadFeed(); // Reload to reflect the change
}
// Delete workout function
async function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadWorkouts();
                loadStats();
                loadFeed();
                alert('Workout deleted successfully!');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error deleting workout');
        }
    }
}

// Update displayWorkouts function to include delete button
function displayWorkouts(workouts) {
    if (workouts.length === 0) {
        workoutList.innerHTML = '<p>No workouts logged yet. Add your first workout!</p>';
        return;
    }
    
    // Sort by date (newest first)
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Determine which workouts to show
    const workoutsToShow = showAllWorkouts ? workouts : workouts.slice(0, 3);
    const hiddenWorkoutsCount = workouts.length - 3;
    
    let workoutHTML = workoutsToShow.map(workout => `
        <div class="workout-item">
            <div class="workout-details">
                <strong>${workout.exercise}</strong>
                <div class="exercise-duration">Duration: ${workout.duration} minutes</div>
            </div>
            <div class="workout-meta">
                <div class="calories">${workout.calories} kcal</div>
                <div class="date">${workout.date}</div>
                <button class="delete-btn" onclick="deleteWorkout(${workout.id})">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add show/hide links if there are more than 3 workouts
    if (workouts.length > 3) {
        if (showAllWorkouts) {
            workoutHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleWorkoutVisibility()">▲ Hide older workouts</a>
                </div>
            `;
        } else {
            workoutHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleWorkoutVisibility()">▼ Show all workouts (${hiddenWorkoutsCount} more)</a>
                </div>
            `;
        }
    }
    
    workoutList.innerHTML = workoutHTML;
}

// Update displayFeed function to show delete button only on user's own posts
function displayFeed(feedItems) {
    const feedList = document.getElementById('feedList');
    
    if (feedItems.length === 0) {
        feedList.innerHTML = '<p>No recent community activities.</p>';
        return;
    }
    
    // Determine which feed items to show
    const feedToShow = showAllFeed ? feedItems : feedItems.slice(0, 3);
    const hiddenFeedCount = feedItems.length - 3;
    
    let feedHTML = feedToShow.map(item => `
        <div class="feed-item" data-current-user="${item.user_id === currentUser.id}">
            <div class="feed-details">
                <span class="username">${item.username}</span>
                <div class="activity">did <span class="exercise">${item.exercise}</span> for ${item.duration} minutes</div>
            </div>
            <div class="feed-meta">
                <div class="calories">${item.calories} kcal</div>
                <div class="date">${item.date}</div>
                ${item.user_id === currentUser.id ? 
                    `<button class="delete-btn" onclick="deleteWorkout(${item.id})">Delete</button>` : 
                    ''}
            </div>
        </div>
    `).join('');
    
    // Add show/hide links if there are more than 3 feed items
    if (feedItems.length > 3) {
        if (showAllFeed) {
            feedHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleFeedVisibility()">▲ Hide older activities</a>
                </div>
            `;
        } else {
            feedHTML += `
                <div class="view-more-link">
                    <a href="#" onclick="toggleFeedVisibility()">▼ Show all activities (${hiddenFeedCount} more)</a>
                </div>
            `;
        }
    }
    
    feedList.innerHTML = feedHTML;
}
