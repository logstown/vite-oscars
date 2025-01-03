// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxc3uph6EmJgTzWtaqAo8tXjJ90MqT7rg",
  authDomain: "oscars.firebaseapp.com",
  databaseURL: "https://oscars.firebaseio.com",
  projectId: "firebase-oscars",
  storageBucket: "firebase-oscars.firebasestorage.app",
  messagingSenderId: "560662746392",
  appId: "1:560662746392:web:934b530e0972216e53ba6d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };
