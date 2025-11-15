
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCbr44MOPP8AdehzayYDrCxGqlUG7Xt_cY",
  authDomain: "contractorai-3345e.firebaseapp.com",
  projectId: "contractorai-3345e",
  storageBucket: "contractorai-3345e.firebasestorage.app",
  messagingSenderId: "707487245222",
  appId: "1:707487245222:web:023dcde1e51dfea2bfe567",
  measurementId: "G-NQ6XPWVKQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
