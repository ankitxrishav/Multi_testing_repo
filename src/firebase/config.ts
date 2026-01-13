
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Provided by the user. This connects the app to your Firebase project.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
    console.log("[Firebase] initializeFirebase called");
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            console.log("[Firebase] Initializing new app instance");
            try {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                firestore = getFirestore(app);
                console.log("[Firebase] Initialization successful");
            } catch (e) {
                console.error("[Firebase] Initialization error", e);
            }
        } else {
            console.log("[Firebase] Using existing app instance");
            app = getApp();
            auth = getAuth(app);
            firestore = getFirestore(app);
        }
    }
    return { app, auth, firestore };
}

export { initializeFirebase };
