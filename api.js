// api.js - Prayer Time API Integration

import { showMessage } from './utils.js';

// Function to fetch and display prayer times
async function fetchAndDisplayPrayerTimes(city = 'Karachi', country = 'Pakistan', dashboardMessage) {
    console.log('Fetching prayer times for', city, country);
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`;
    
    // Check if we're on the dashboard page
    const fajrElement = document.getElementById('prayer-time-fajr');
    const dhuhrElement = document.getElementById('prayer-time-dhuhr');
    const asrElement = document.getElementById('prayer-time-asr');
    const maghribElement = document.getElementById('prayer-time-maghrib');
    const ishaElement = document.getElementById('prayer-time-isha');
    const cityElement = document.getElementById('dashboard-city');
    const dateElement = document.getElementById('dashboard-prayer-date');
    
    if (!fajrElement || !dhuhrElement || !asrElement || !maghribElement || !ishaElement) {
        console.error('Prayer time elements not found on this page');
        return;
    }
    
    try {
        // Remove the API key header as it's not needed for this free API
        const response = await fetch(url);
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.code !== 200) throw new Error('Failed to fetch prayer times');
        
        const timings = data.data.timings;
        
        // Update UI with prayer times
        fajrElement.textContent = timings.Fajr;
        dhuhrElement.textContent = timings.Dhuhr;
        asrElement.textContent = timings.Asr;
        maghribElement.textContent = timings.Maghrib;
        ishaElement.textContent = timings.Isha;
        
        // Update meta info
        if (cityElement) cityElement.textContent = `City: ${city}`;
        if (dateElement) dateElement.textContent = data.data.date.readable;
    } catch (err) {
        console.error('Error fetching or displaying prayer times:', err);
        // Show error or fallback
        fajrElement.textContent = '--:--';
        dhuhrElement.textContent = '--:--';
        asrElement.textContent = '--:--';
        maghribElement.textContent = '--:--';
        ishaElement.textContent = '--:--';
        if (dateElement) dateElement.textContent = '';
        if (dashboardMessage) showMessage(dashboardMessage, 'Could not fetch prayer times.', 'error');
    }
}

// Simple Prayer Time Fetch for List
async function fetchPrayerTimesSimple() {
    const url = "https://api.aladhan.com/v1/timingsByCity?city=Karachi&country=Pakistan&method=1";

    const fajrElement = document.getElementById('prayer-time-fajr');
    const dhuhrElement = document.getElementById('prayer-time-dhuhr');
    const asrElement = document.getElementById('prayer-time-asr');
    const maghribElement = document.getElementById('prayer-time-maghrib');
    const ishaElement = document.getElementById('prayer-time-isha');
    const cityElement = document.getElementById('dashboard-city');
    const dateElement = document.getElementById('dashboard-prayer-date');

    if (!fajrElement) {
        console.error('Prayer time elements not found on this page');
        return Promise.reject(new Error('Prayer time elements not found'));
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 200 || !data.data || !data.data.timings) {
            throw new Error('Invalid API response structure');
        }

        const timings = data.data.timings;

        // Format times to remove seconds if present
        const formatTime = (time) => time.split(' ')[0];

        fajrElement.textContent = formatTime(timings.Fajr);
        dhuhrElement.textContent = formatTime(timings.Dhuhr);
        asrElement.textContent = formatTime(timings.Asr);
        maghribElement.textContent = formatTime(timings.Maghrib);
        ishaElement.textContent = formatTime(timings.Isha);

        if (dateElement) dateElement.textContent = data.data.date.readable || new Date().toDateString();
        if (cityElement) cityElement.textContent = 'City: Karachi';

        console.log('Prayer times updated successfully');
        return data;
    } catch (error) {
        console.error('Error fetching prayer times:', error);

        fajrElement.textContent = '--:--';
        dhuhrElement.textContent = '--:--';
        asrElement.textContent = '--:--';
        maghribElement.textContent = '--:--';
        ishaElement.textContent = '--:--';

        throw error;
    }
}

// Export functions
export {
    fetchAndDisplayPrayerTimes,
    fetchPrayerTimesSimple
};