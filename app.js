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
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);