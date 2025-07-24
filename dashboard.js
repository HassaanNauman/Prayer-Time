// dashboard.js - Dashboard functionality

import { showMessage, getFormattedDate, getFirestoreDateId } from './utils.js';
import { fetchPrayerTimesSimple } from './api.js';
import { currentUser } from './auth.js';

// Initialize dashboard
function initDashboard() {
    // Get DOM elements
    const dashboardDateSpan = document.getElementById('dashboard-date');
    const togglePrayerBtns = document.querySelectorAll('.toggle-prayer-btn');
    const dashboardMessage = document.getElementById('dashboard-message');
    const userEmailDisplay = document.getElementById('user-email-display');

    // Check if we're on the dashboard page
    if (!dashboardDateSpan) return;

    // Setup event listeners
    setupDashboardEventListeners(togglePrayerBtns, dashboardMessage);
    
    // Load dashboard data
    loadDashboardPrayers(dashboardDateSpan, togglePrayerBtns, dashboardMessage, userEmailDisplay);
}

// Setup dashboard event listeners
function setupDashboardEventListeners(togglePrayerBtns, dashboardMessage) {
    togglePrayerBtns.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
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

                // Get current status (default to false if not exists)
                const currentStatus = currentPrayers[prayerName] || false;
                const newStatus = true; // Always set to ✅ on first click

                // Update Firestore
                await docRef.set({
                    ...currentPrayers,
                    [prayerName]: newStatus,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // Update local UI
                e.target.textContent = '✅';
                e.target.classList.add('done');
                e.target.classList.remove('missed');

                showMessage(dashboardMessage, `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} prayer status updated!`, 'success');
            } catch (error) {
                console.error('Error updating prayer:', error);
                showMessage(dashboardMessage, `Error updating prayer: ${error.message}`, 'error');
            }
        });
    });
}

// Load dashboard prayers
async function loadDashboardPrayers(dashboardDateSpan, togglePrayerBtns, dashboardMessage, userEmailDisplay) {
    if (!currentUser) return;

    // Update user email display
    if (userEmailDisplay) {
        userEmailDisplay.textContent = currentUser.email;
    }

    const today = new Date();
    dashboardDateSpan.textContent = getFormattedDate(today);
    const dateId = getFirestoreDateId(today);
    const userId = currentUser.uid;

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
            const status = prayers[prayerName] || false;
            button.textContent = status ? '✅' : '❌';
            button.classList.toggle('done', status);
            button.classList.toggle('missed', !status);
        });

        showMessage(dashboardMessage, 'Dashboard loaded successfully.', 'info');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage(dashboardMessage, `Error loading dashboard: ${error.message}`, 'error');
    }
}

// Export functions
export {
    initDashboard,
    loadDashboardPrayers
};