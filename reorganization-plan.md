# Prayer Time Web App Reorganization Plan

## Current Structure

The application is currently structured as follows:

1. **app.js**: Contains all JavaScript functionality including:
   - DOM element references
   - Utility functions
   - Authentication logic
   - Navigation handling
   - Prayer time API integration
   - Dashboard functionality
   - History functionality

2. **firebase.js**: Initializes Firebase and exports auth and db objects

3. **index.html**: Contains the HTML structure with sections for:
   - Login
   - Registration
   - Dashboard
   - History

4. **style.css**: Contains all styling for the application

## New File Structure

We'll reorganize the code into the following files:

1. **utils.js**: Common utility functions
2. **auth.js**: Authentication functionality (login, register, logout)
3. **api.js**: Prayer time API integration
4. **dashboard.js**: Dashboard functionality
5. **history.js**: History functionality
6. **app.js**: Main initialization file that connects everything

## Detailed File Contents

### 1. utils.js

```javascript
// utils.js - Common utility functions

// Function to show a specific section and hide others
function showSection(loginSection, registerSection, dashboardSection, historySection, section) {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    historySection.style.display = 'none';
    section.style.display = 'block';
}

// Function to show a message with auto-hide after 5 seconds
function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `info-message ${type}`; // Add type for styling (e.g., 'error', 'success')
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
    }, 5000); // Hide after 5 seconds
}

// Function to format a date in a readable format
function getFormattedDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to create a date ID for Firestore (YYYY-MM-DD format)
function getFirestoreDateId(date) {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Export the utility functions
export {
    showSection,
    showMessage,
    getFormattedDate,
    getFirestoreDateId
};
```

### 2. auth.js

```javascript
// auth.js - Authentication functionality

import { showSection, showMessage } from './utils.js';
import { loadDashboardPrayers } from './dashboard.js';

// DOM element references
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const historySection = document.getElementById('history-section');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const showRegisterLink = document.getElementById('show-register');

const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');
const registerError = document.getElementById('register-error');
const showLoginLink = document.getElementById('show-login');

const navDashboardBtn = document.getElementById('nav-dashboard');
const navHistoryBtn = document.getElementById('nav-history');
const navLogoutBtn = document.getElementById('nav-logout');

const dashboardMessage = document.getElementById('dashboard-message');
const userEmailDisplay = document.getElementById('user-email-display');

// Global variable to store the current user
let currentUser = null;

// Initialize authentication
function initAuth() {
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            userEmailDisplay.textContent = user.email;
            navDashboardBtn.style.display = 'inline-block';
            navHistoryBtn.style.display = 'inline-block';
            navLogoutBtn.style.display = 'inline-block';
            showSection(loginSection, registerSection, dashboardSection, historySection, dashboardSection);
            loadDashboardPrayers();
        } else {
            // User is signed out
            currentUser = null;
            navDashboardBtn.style.display = 'none';
            navHistoryBtn.style.display = 'none';
            navLogoutBtn.style.display = 'none';
            showSection(loginSection, registerSection, dashboardSection, historySection, loginSection); // Default to login page
        }
    });

    // Setup event listeners
    setupAuthEventListeners();
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Login User
    loginBtn.addEventListener('click', async () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        if (!email || !password) {
            showMessage(loginError, 'Please enter both email and password.', 'error');
            return;
        }
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showMessage(loginError, 'Logged in successfully!', 'success');
            loginEmailInput.value = '';
            loginPasswordInput.value = '';
        } catch (error) {
            showMessage(loginError, error.message, 'error');
        }
    });

    // Register User
    registerBtn.addEventListener('click', async () => {
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        if (!email || !password) {
            showMessage(registerError, 'Please enter both email and password.', 'error');
            return;
        }
        if (password.length < 6) {
            showMessage(registerError, 'Password should be at least 6 characters.', 'error');
            return;
        }
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            showMessage(registerError, 'Registration successful! You are now logged in.', 'success');
            registerEmailInput.value = '';
            registerPasswordInput.value = '';
        } catch (error) {
            showMessage(registerError, error.message, 'error');
        }
    });

    // Logout User
    navLogoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            showMessage(dashboardMessage, 'Logged out successfully.', 'info');
        } catch (error) {
            showMessage(dashboardMessage, `Logout error: ${error.message}`, 'error');
        }
    });

    // Navigation
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection, registerSection, dashboardSection, historySection, registerSection);
        loginError.style.display = 'none'; // Clear previous errors
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection, registerSection, dashboardSection, historySection, loginSection);
        registerError.style.display = 'none'; // Clear previous errors
    });
}

// Export functions and variables
export {
    initAuth,
    currentUser
};
```

### 3. api.js

```javascript
// api.js - Prayer Time API Integration

import { showMessage } from './utils.js';

// Function to fetch and display prayer times
async function fetchAndDisplayPrayerTimes(city = 'Karachi', country = 'Pakistan', dashboardMessage) {
    console.log('Fetching prayer times for', city, country);
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`;
    try {
        const response = await fetch(url, {
            headers: {
                "X-API-Key": "f4c95f643a98dc65c0d9cdf4d9144ee8"
            }
        });
        const data = await response.json();
        console.log('API response:', data);
        if (data.code !== 200) throw new Error('Failed to fetch prayer times');
        const timings = data.data.timings;
        
        // Update UI
        document.getElementById('prayer-time-fajr').textContent = timings.Fajr;
        document.getElementById('prayer-time-dhuhr').textContent = timings.Dhuhr;
        document.getElementById('prayer-time-asr').textContent = timings.Asr;
        document.getElementById('prayer-time-maghrib').textContent = timings.Maghrib;
        document.getElementById('prayer-time-isha').textContent = timings.Isha;
        
        // Update meta info
        document.getElementById('dashboard-city').textContent = `City: ${city}`;
        document.getElementById('dashboard-prayer-date').textContent = data.data.date.readable;
    } catch (err) {
        console.error('Error fetching or displaying prayer times:', err);
        // Show error or fallback
        document.getElementById('prayer-time-fajr').textContent = '--:--';
        document.getElementById('prayer-time-dhuhr').textContent = '--:--';
        document.getElementById('prayer-time-asr').textContent = '--:--';
        document.getElementById('prayer-time-maghrib').textContent = '--:--';
        document.getElementById('prayer-time-isha').textContent = '--:--';
        document.getElementById('dashboard-prayer-date').textContent = '';
        showMessage(dashboardMessage, 'Could not fetch prayer times.', 'error');
    }
}

// Simple Prayer Time Fetch for List
function fetchPrayerTimesSimple() {
    const url = "https://api.aladhan.com/v1/timingsByCity?city=Karachi&country=Pakistan&method=1";
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            const timings = data.data.timings;
            // Set prayer times in the dashboard
            document.getElementById('prayer-time-fajr').textContent = timings.Fajr;
            document.getElementById('prayer-time-dhuhr').textContent = timings.Dhuhr;
            document.getElementById('prayer-time-asr').textContent = timings.Asr;
            document.getElementById('prayer-time-maghrib').textContent = timings.Maghrib;
            document.getElementById('prayer-time-isha').textContent = timings.Isha;
            // Set readable date and city name
            document.getElementById('dashboard-prayer-date').textContent = data.data.date.readable;
            document.getElementById('dashboard-city').textContent = 'City: Karachi';
            return data;
        })
        .catch(err => {
            console.error('Error fetching prayer times:', err);
            throw err;
        });
}

// Export functions
export {
    fetchAndDisplayPrayerTimes,
    fetchPrayerTimesSimple
};
```

### 4. dashboard.js

```javascript
// dashboard.js - Dashboard functionality

import { showSection, showMessage, getFormattedDate, getFirestoreDateId } from './utils.js';
import { fetchPrayerTimesSimple } from './api.js';
import { currentUser } from './auth.js';

// DOM element references
const dashboardSection = document.getElementById('dashboard-section');
const dashboardDateSpan = document.getElementById('dashboard-date');
const togglePrayerBtns = document.querySelectorAll('.toggle-prayer-btn');
const dashboardMessage = document.getElementById('dashboard-message');
const navDashboardBtn = document.getElementById('nav-dashboard');

// Initialize dashboard
function initDashboard() {
    // Setup event listeners
    setupDashboardEventListeners();
}

// Setup dashboard event listeners
function setupDashboardEventListeners() {
    navDashboardBtn.addEventListener('click', () => {
        showSection(
            document.getElementById('login-section'),
            document.getElementById('register-section'),
            dashboardSection,
            document.getElementById('history-section'),
            dashboardSection
        );
        loadDashboardPrayers();
    });

    togglePrayerBtns.forEach(button => {
        button.addEventListener('click', async (e) => {
            if (!currentUser) {
                showMessage(dashboardMessage, 'Please log in to track prayers.', 'error');
                return;
            }

            const prayerName = e.target.dataset.prayer;
            const today = new Date();
            const dateId = getFirestoreDateId(today);
            const userId = currentUser.uid;

            const docRef = db.collection('users').doc(userId).collection('namazRecords').doc(dateId);

            try {
                const docSnap = await docRef.get();
                let currentPrayers = {};
                if (docSnap.exists) {
                    currentPrayers = docSnap.data();
                }

                const newStatus = !currentPrayers[prayerName]; // Toggle status

                // Update local UI immediately
                if (newStatus) {
                    e.target.textContent = '✅';
                    e.target.classList.add('done');
                    e.target.classList.remove('missed');
                } else {
                    e.target.textContent = '❌';
                    e.target.classList.add('missed');
                    e.target.classList.remove('done');
                }

                // Update Firestore
                await docRef.set({
                    [prayerName]: newStatus,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add/update timestamp
                }, { merge: true }); // Use merge to only update the specific prayer field

                showMessage(dashboardMessage, `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} prayer status updated!`, 'success');

            } catch (error) {
                showMessage(dashboardMessage, `Error updating prayer: ${error.message}`, 'error');
            }
        });
    });
}

// Load dashboard prayers
async function loadDashboardPrayers() {
    if (!currentUser) return;

    const today = new Date();
    dashboardDateSpan.textContent = getFormattedDate(today);
    const dateId = getFirestoreDateId(today);
    const userId = currentUser.uid;

    // Fetch and display simple prayer times list
    fetchPrayerTimesSimple();

    try {
        const docRef = db.collection('users').doc(userId).collection('namazRecords').doc(dateId);
        const docSnap = await docRef.get();

        const prayers = {
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false
        };

        if (docSnap.exists) {
            Object.assign(prayers, docSnap.data());
        }

        // Update UI based on fetched data
        togglePrayerBtns.forEach(button => {
            const prayerName = button.dataset.prayer;
            if (prayers[prayerName]) {
                button.textContent = '✅';
                button.classList.add('done');
                button.classList.remove('missed');
            } else {
                button.textContent = '❌';
                button.classList.add('missed');
                button.classList.remove('done');
            }
        });
        showMessage(dashboardMessage, 'Dashboard loaded successfully.', 'info');

    } catch (error) {
        showMessage(dashboardMessage, `Error loading dashboard: ${error.message}`, 'error');
    }
}

// Export functions
export {
    initDashboard,
    loadDashboardPrayers
};
```

### 5. history.js

```javascript
// history.js - History functionality

import { showSection, showMessage, getFormattedDate, getFirestoreDateId } from './utils.js';
import { currentUser } from './auth.js';

// DOM element references
const historySection = document.getElementById('history-section');
const historyDaysSelect = document.getElementById('history-days');
const loadHistoryBtn = document.getElementById('load-history-btn');
const historyList = document.getElementById('history-list');
const historyMessage = document.getElementById('history-message');
const navHistoryBtn = document.getElementById('nav-history');

// Initialize history
function initHistory() {
    // Setup event listeners
    setupHistoryEventListeners();
}

// Setup history event listeners
function setupHistoryEventListeners() {
    navHistoryBtn.addEventListener('click', () => {
        showSection(
            document.getElementById('login-section'),
            document.getElementById('register-section'),
            document.getElementById('dashboard-section'),
            historySection,
            historySection
        );
        // Automatically load history for default 7 days when entering history section
        loadNamazHistory(historyDaysSelect.value);
    });

    loadHistoryBtn.addEventListener('click', () => {
        loadNamazHistory(historyDaysSelect.value);
    });
}

// Load namaz history
async function loadNamazHistory(days) {
    if (!currentUser) {
        showMessage(historyMessage, 'Please log in to view history.', 'error');
        return;
    }

    historyList.innerHTML = '<p>Loading history...</p>';
    const userId = currentUser.uid;
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (parseInt(days) - 1)); // Go back X days

    try {
        const namazRecordsRef = db.collection('users').doc(userId).collection('namazRecords');
        const querySnapshot = await namazRecordsRef
            .orderBy('timestamp', 'desc') // Order by timestamp to get recent
            .limit(parseInt(days) * 2) // Fetch a bit more to be safe for 30 days, then filter locally
            .get();

        let records = {};
        querySnapshot.forEach(doc => {
            const dateId = doc.id; // YYYY-MM-DD format
            records[dateId] = doc.data();
        });

        historyList.innerHTML = ''; // Clear loading message

        let hasRecords = false;
        for (let i = 0; i < parseInt(days); i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateId = getFirestoreDateId(date);
            const formattedDate = getFormattedDate(date);

            const prayerData = records[dateId] || {
                fajr: false,
                dhuhr: false,
                asr: false,
                maghrib: false,
                isha: false
            };
            const card = document.createElement('div');
            card.className = 'history-day-card';
            card.innerHTML = `<h3>${formattedDate}</h3>`;

            const prayersContainer = document.createElement('div');
            prayersContainer.className = 'prayer-list';

            const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            prayerNames.forEach(prayer => {
                const prayerStatus = prayerData[prayer];
                const prayerItem = document.createElement('div');
                prayerItem.className = 'prayer-item';
                prayerItem.innerHTML = `
                    <span>${prayer.charAt(0).toUpperCase() + prayer.slice(1)}</span>
                    <button class="toggle-history-prayer-btn ${prayerStatus ? 'done' : 'missed'}"
                            data-date="${dateId}" data-prayer="${prayer}">
                        ${prayerStatus ? '✅' : '❌'}
                    </button>
                `;
                prayersContainer.appendChild(prayerItem);
            });
            card.appendChild(prayersContainer);
            historyList.appendChild(card);
            hasRecords = true;
        }

        if (!hasRecords) {
            showMessage(historyMessage, 'No prayer records found for the selected period.', 'info');
        } else {
            showMessage(historyMessage, `History for last ${days} days loaded.`, 'success');
        }

        // Add event listeners to history prayer buttons
        document.querySelectorAll('.toggle-history-prayer-btn').forEach(button => {
            button.addEventListener('click', updateHistoryPrayerStatus);
        });

    } catch (error) {
        showMessage(historyMessage, `Error loading history: ${error.message}`, 'error');
    }
}

// Update history prayer status
async function updateHistoryPrayerStatus(event) {
    if (!currentUser) {
        showMessage(historyMessage, 'Please log in to update records.', 'error');
        return;
    }

    const button = event.target;
    const dateId = button.dataset.date;
    const prayerName = button.dataset.prayer;
    const userId = currentUser.uid;

    const docRef = db.collection('users').doc(userId).collection('namazRecords').doc(dateId);

    try {
        const docSnap = await docRef.get();
        let currentPrayers = {};
        if (docSnap.exists) {
            currentPrayers = docSnap.data();
        }

        const newStatus = !currentPrayers[prayerName]; // Toggle status

        // Update local UI immediately
        if (newStatus) {
            button.textContent = '✅';
            button.classList.add('done');
            button.classList.remove('missed');
        } else {
            button.textContent = '❌';
            button.classList.add('missed');
            button.classList.remove('done');
        }

        // Update Firestore
        await docRef.set({
            [prayerName]: newStatus,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Update timestamp
        }, { merge: true }); // Use merge to only update the specific prayer field

        showMessage(historyMessage, `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} for ${dateId} updated!`, 'success');

    } catch (error) {
        showMessage(historyMessage, `Error updating history prayer: ${error.message}`, 'error');
    }
}

// Export functions
export {
    initHistory,
    loadNamazHistory,
    updateHistoryPrayerStatus
};
```

### 6. app.js (Updated)

```javascript
// app.js - Main initialization file

// Import modules
import { initAuth } from './auth.js';
import { initDashboard } from './dashboard.js';
import { initHistory } from './history.js';

// Initialize the application
function initApp() {
    // Initialize authentication
    initAuth();
    
    // Initialize dashboard
    initDashboard();
    
    // Initialize history
    initHistory();
    
    // Initial load of dashboard if user is already authenticated (handled by onAuthStateChanged)
    // This ensures correct section is shown on page load or refresh.
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
```

### 7. index.html (Updated)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Namaz Tracking System</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
    <link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/4/4b/Prayer_beads_icon.png" type="image/x-icon">
</head>
<body>
    <header>
        <h1>Namaz Tracker</h1>
        <nav id="main-nav">
            <button id="nav-dashboard" class="nav-button" style="display: none;">Dashboard</button>
            <button id="nav-history" class="nav-button" style="display: none;">History</button>
            <button id="nav-logout" class="nav-button" style="display: none;">Logout</button>
        </nav>
    </header>

    <main>
        <section id="login-section" class="auth-section">
            <h2>Login</h2>
            <input type="email" id="login-email" placeholder="Email">
            <input type="password" id="login-password" placeholder="Password">
            <button id="login-btn">Login</button>
            <p>Don't have an account? <a href="#" id="show-register">Register here</a></p>
            <div id="login-error" class="error-message"></div>
        </section>

        <section id="register-section" class="auth-section" style="display: none;">
            <h2>Register</h2>
            <input type="email" id="register-email" placeholder="Email">
            <input type="password" id="register-password" placeholder="Password">
            <button id="register-btn">Register</button>
            <p>Already have an account? <a href="#" id="show-login">Login here</a></p>
            <div id="register-error" class="error-message"></div>
        </section>

        <section id="dashboard-section" style="display: none;">
            <h2>Today's Prayers - <span id="dashboard-date"></span></h2>
            <div id="dashboard-user-info">Logged in as: <span id="user-email-display"></span></div>
            <div id="dashboard-prayer-list-simple">
              <p id="dashboard-prayer-date"></p>
              <p id="dashboard-city"></p>
              <ul>
                <li>Fajr: <span id="prayer-time-fajr"></span></li>
                <li>Dhuhr: <span id="prayer-time-dhuhr"></span></li>
                <li>Asr: <span id="prayer-time-asr"></span></li>
                <li>Maghrib: <span id="prayer-time-maghrib"></span></li>
                <li>Isha: <span id="prayer-time-isha"></span></li>
              </ul>
            </div>
            <div class="prayer-list">
                <div class="prayer-item">
                    <span>Fajr</span>
                    <span class="prayer-time" id="prayer-time-fajr">--:--</span>
                    <button class="toggle-prayer-btn" data-prayer="fajr">✅</button>
                </div>
                <div class="prayer-item">
                    <span>Dhuhr</span>
                    <span class="prayer-time" id="prayer-time-dhuhr">--:--</span>
                    <button class="toggle-prayer-btn" data-prayer="dhuhr">✅</button>
                </div>
                <div class="prayer-item">
                    <span>Asr</span>
                    <span class="prayer-time" id="prayer-time-asr">--:--</span>
                    <button class="toggle-prayer-btn" data-prayer="asr">✅</button>
                </div>
                <div class="prayer-item">
                    <span>Maghrib</span>
                    <span class="prayer-time" id="prayer-time-maghrib">--:--</span>
                    <button class="toggle-prayer-btn" data-prayer="maghrib">✅</button>
                </div>
                <div class="prayer-item">
                    <span>Isha</span>
                    <span class="prayer-time" id="prayer-time-isha">--:--</span>
                    <button class="toggle-prayer-btn" data-prayer="isha">✅</button>
                </div>
            </div>
            <div id="dashboard-message" class="info-message"></div>
        </section>

        <section id="history-section" style="display: none;">
            <h2>Namaz History</h2>
            <div class="history-controls">
                <label for="history-days">Show last:</label>
                <select id="history-days">
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                </select>
                <button id="load-history-btn">Load History</button>
            </div>
            <div id="history-list">
                </div>
            <div id="history-message" class="info-message"></div>
        </section>
    </main>

    <!-- Load Firebase first -->
    <script src="firebase.js"></script>
    
    <!-- Load modules -->
    <script type="module" src="utils.js"></script>
    <script type="module" src="api.js"></script>
    <script type="module" src="auth.js"></script>
    <script type="module" src="dashboard.js"></script>
    <script type="module" src="history.js"></script>
    <script type="module" src="app.js"></script>
</body>
</html>
```

## Implementation Steps

1. Create the new JavaScript files:
   - utils.js
   - auth.js
   - api.js
   - dashboard.js
   - history.js

2. Update the existing app.js file to be the main initialization file.

3. Update the index.html file to include all the new JavaScript files.

4. Test the application to ensure everything works correctly.

## Benefits of This Reorganization

1. **Improved Maintainability**: Each file has a single responsibility, making it easier to understand and maintain.

2. **Better Code Organization**: Code is organized by functionality, making it easier to find and modify specific parts of the application.

3. **Modularity**: Each module can be developed and tested independently.

4. **Reusability**: Common functionality is extracted into separate modules that can be reused across the application.

5. **Scalability**: The application can be extended more easily by adding new modules or enhancing existing ones.

## Potential Challenges

1. **Module Dependencies**: Ensuring that modules are loaded in the correct order to avoid dependency issues.

2. **Global State Management**: Managing shared state between modules (e.g., the current user).

3. **Browser Compatibility**: Ensuring that ES6 modules are supported in the target browsers.

## Testing Guide

After implementing the changes, follow these steps to test the application:

### 1. Initial Setup Testing

- Verify that all files are created correctly
- Check for any syntax errors in the browser console
- Ensure that all modules are loaded in the correct order

### 2. Authentication Testing

- Test user registration with a new email
- Test login with existing credentials
- Test logout functionality
- Verify that navigation buttons appear/disappear based on authentication state

### 3. Dashboard Testing

- Verify that prayer times are fetched and displayed correctly
- Test toggling prayer status (completed/missed)
- Verify that prayer status is saved to Firestore
- Test that the dashboard loads correctly when navigating to it

### 4. History Testing

- Test loading history for different time periods (7 days, 30 days)
- Verify that prayer records are displayed correctly
- Test updating prayer status from the history view
- Verify that changes in history view are saved to Firestore

### 5. Cross-Browser Testing

- Test the application in different browsers (Chrome, Firefox, Safari, Edge)
- Verify that ES6 modules are