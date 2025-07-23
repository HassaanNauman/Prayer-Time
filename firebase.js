// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbDVkyOvOaaapT48sBLhd6zE9Nv-A9fjE",
  authDomain: "prayer-time-89e5f.firebaseapp.com",
  projectId: "prayer-time-89e5f",
  storageBucket: "prayer-time-89e5f.firebasestorage.app",
  messagingSenderId: "201653640789",
  appId: "1:201653640789:web:1f9cfe409bda415b0cbedc"
};


firebase.initializeApp(firebaseConfig);

// Export Firebase services for use in app.js
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Enable offline persistence (useful for web apps)
// db.enablePersistence()
//   .catch(err => {
//     if (err.code == 'failed-precondition') {
//       console.warn('Multiple tabs open, persistence might not work.');
//     } else if (err.code == 'unimplemented') {
//       console.warn('The current browser does not support persistence.');
//     }
//   });