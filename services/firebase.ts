
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxkwZc_PSlttjFzBBv5-zgahdmn6pYV0s",
  authDomain: "gen-lang-client-0137146499.firebaseapp.com",
  projectId: "gen-lang-client-0137146499",
  storageBucket: "gen-lang-client-0137146499.firebasestorage.app",
  messagingSenderId: "242839861145",
  appId: "1:242839861145:web:88286a69c0efeff4400508",
  measurementId: "G-FD3VKQLSJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
