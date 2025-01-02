// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxIjRT5VMYYNHdO5t6XJBiFhPaMnR6NBg",
  authDomain: "neres-bazar.firebaseapp.com",
  projectId: "neres-bazar",
  storageBucket: "neres-bazar.firebasestorage.app",
  messagingSenderId: "484407162609",
  appId: "1:484407162609:web:07cc613d41d87501d7db50",
  measurementId: "G-JJ6PBS9EQ4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export {
  app,
  auth,
  firestore,
  analytics,
  doc,
  collection,
  getDoc,
  updateDoc,
  addDoc,
};
