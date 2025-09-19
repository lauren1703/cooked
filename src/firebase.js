import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

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

