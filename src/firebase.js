import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJ8cMOZjQ-4l0aeCqV-LOZZqU6J9ugXnI",
    authDomain: "cooked-19caf.firebaseapp.com",
    projectId: "cooked-19caf",
    storageBucket: "cooked-19caf.firebasestorage.app",
    messagingSenderId: "493098476199",
    appId: "1:493098476199:web:081da438babffbb32a7182",
    measurementId: "G-QYPG1MYTVN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore with offline persistence and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firebase persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support persistence
        console.warn('Firebase persistence not supported in this browser');
      }
    });
} catch (error) {
  console.warn('Error enabling Firebase offline persistence:', error);
}

// Initialize OAuth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure OAuth providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

githubProvider.setCustomParameters({
  allow_signup: 'true'
});

export default app;

