// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhvUKFFYKec1w4BnxcHxxbyYepPiUYeyU",
  authDomain: "study-marathon-system.firebaseapp.com",
  projectId: "study-marathon-system",
  storageBucket: "study-marathon-system.firebasestorage.app",
  messagingSenderId: "788815148424",
  appId: "1:788815148424:web:bbc0038fc091d0f1f1f63d",
  measurementId: "G-MCFE7867L0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
