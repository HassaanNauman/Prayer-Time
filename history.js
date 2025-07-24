// history.js - History functionality

import { showMessage, getFormattedDate, getFirestoreDateId } from './utils.js';
import { currentUser } from './auth.js';

// Initialize history
function initHistory() {
    // Get DOM elements
    const historyDaysSelect = document.getElementById('history-days');
    const loadHistoryBtn = document.getElementById('load-history-btn');
    const historyList = document.getElementById('history-list');
    const historyMessage = document.getElementById('history-message');
    
    // Check if we're on the history page
    if (!historyList) return;
    
    // Setup event listeners
    setupHistoryEventListeners(historyDaysSelect, loadHistoryBtn, historyList, historyMessage);
    
    // Automatically load history for default 7 days when entering history section
    loadNamazHistory(historyDaysSelect.value, historyList, historyMessage);
}

// Setup history event listeners
function setupHistoryEventListeners(historyDaysSelect, loadHistoryBtn, historyList, historyMessage) {
    loadHistoryBtn.addEventListener('click', () => {
        loadNamazHistory(historyDaysSelect.value, historyList, historyMessage);
    });
}

// Load namaz history
async function loadNamazHistory(days, historyList, historyMessage) {
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
            button.addEventListener('click', (event) => {
                updateHistoryPrayerStatus(event, historyMessage);
            });
        });

    } catch (error) {
        showMessage(historyMessage, `Error loading history: ${error.message}`, 'error');
    }
}

// Update history prayer status
async function updateHistoryPrayerStatus(event, historyMessage) {
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
    loadNamazHistory
};