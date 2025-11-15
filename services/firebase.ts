
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// IMPORTANT: ACTION REQUIRED FOR FIREBASE DEPLOYMENT
// =================================================================================
// To connect your app to Firebase, you must replace the placeholder values
// below with your actual Firebase project's configuration.
//
// You can find this configuration in your Firebase project console:
// 1. Go to your Firebase project: https://console.firebase.google.com/
// 2. Click on the gear icon (Project settings) in the top-left corner.
// 3. Under the "General" tab, scroll down to "Your apps".
// 4. If you haven't created a web app yet, do so now.
// 5. In your web app's card, find the "SDK setup and configuration" section.
// 6. Select "Config" and copy the `firebaseConfig` object.
// 7. Paste it here to replace the placeholder object below.
//
// NOTE: Until you do this, real user sign-up, login, and data storage will not work.
// The "Demo Mode" has been configured to work without this for now.
// =================================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
