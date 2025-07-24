// utils.js - Common utility functions

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
    showMessage,
    getFormattedDate,
    getFirestoreDateId
};