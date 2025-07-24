// auth.js - Authentication functionality

import { showMessage } from './utils.js';

// Global variable to store the current user
let currentUser = null;

// Get DOM elements based on current page
function getDOMElements() {
    const elements = {};
    
    // Check if we're on the login page
    if (document.getElementById('login-section')) {
        elements.loginEmailInput = document.getElementById('login-email');
        elements.loginPasswordInput = document.getElementById('login-password');
        elements.loginBtn = document.getElementById('login-btn');
        elements.loginError = document.getElementById('login-error');
        elements.showRegisterLink = document.getElementById('show-register');
    }
    
    // Check if we're on the register page
    if (document.getElementById('register-section')) {
        elements.registerEmailInput = document.getElementById('register-email');
        elements.registerPasswordInput = document.getElementById('register-password');
        elements.registerBtn = document.getElementById('register-btn');
        elements.registerError = document.getElementById('register-error');
        elements.showLoginLink = document.getElementById('show-login');
    }
    
    // Check if we're on a page with navigation
    if (document.getElementById('main-nav')) {
        elements.navDashboardBtn = document.getElementById('nav-dashboard');
        elements.navHistoryBtn = document.getElementById('nav-history');
        elements.navLogoutBtn = document.getElementById('nav-logout');
    }
    
    // Check if we're on the dashboard page
    if (document.getElementById('dashboard-section')) {
        elements.userEmailDisplay = document.getElementById('user-email-display');
        elements.dashboardMessage = document.getElementById('dashboard-message');
    }
    
    return elements;
}

// Initialize authentication
function initAuth() {
    const elements = getDOMElements();
    
    // Setup auth state listener
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            
            // Update UI if on dashboard or history page
            if (elements.userEmailDisplay) {
                elements.userEmailDisplay.textContent = user.email;
            }
            
            // Redirect if on login or register page
            if (window.location.pathname.includes('login.html') ||
                window.location.pathname.includes('register.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // User is signed out
            currentUser = null;
            
            // Redirect if on dashboard or history page
            if (window.location.pathname.includes('dashboard.html') ||
                window.location.pathname.includes('history.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    // Setup event listeners
    setupAuthEventListeners(elements);
}

// Setup authentication event listeners
function setupAuthEventListeners(elements) {
    // Login User
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', async () => {
            const email = elements.loginEmailInput.value;
            const password = elements.loginPasswordInput.value;
            if (!email || !password) {
                showMessage(elements.loginError, 'Please enter both email and password.', 'error');
                return;
            }
            try {
                await auth.signInWithEmailAndPassword(email, password);
                showMessage(elements.loginError, 'Logged in successfully!', 'success');
                elements.loginEmailInput.value = '';
                elements.loginPasswordInput.value = '';
                // Redirect will happen automatically via onAuthStateChanged
            } catch (error) {
                showMessage(elements.loginError, error.message, 'error');
            }
        });
    }

    // Register User
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', async () => {
            const email = elements.registerEmailInput.value;
            const password = elements.registerPasswordInput.value;
            if (!email || !password) {
                showMessage(elements.registerError, 'Please enter both email and password.', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage(elements.registerError, 'Password should be at least 6 characters.', 'error');
                return;
            }
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                showMessage(elements.registerError, 'Registration successful! You are now logged in.', 'success');
                elements.registerEmailInput.value = '';
                elements.registerPasswordInput.value = '';
                // Redirect will happen automatically via onAuthStateChanged
            } catch (error) {
                showMessage(elements.registerError, error.message, 'error');
            }
        });
    }

    // Logout User
    if (elements.navLogoutBtn) {
        elements.navLogoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                // Redirect will happen automatically via onAuthStateChanged
            } catch (error) {
                const messageElement = elements.dashboardMessage || document.createElement('div');
                showMessage(messageElement, `Logout error: ${error.message}`, 'error');
            }
        });
    }

    // Navigation between pages
    if (elements.navDashboardBtn) {
        elements.navDashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    if (elements.navHistoryBtn) {
        elements.navHistoryBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }
}

// Export functions and variables
export {
    initAuth,
    currentUser
};