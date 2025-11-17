// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
