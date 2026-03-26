// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAa3IH2r-uJYG72FJidyVsEGgc1taAUXzI",
    authDomain: "bmsce-2bfd2.firebaseapp.com",
    projectId: "bmsce-2bfd2",
    storageBucket: "bmsce-2bfd2.firebasestorage.app",
    messagingSenderId: "724762668962",
    appId: "1:724762668962:web:ce6c97a823f1a989688cfb",
    measurementId: "G-SLRB6V4QPQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);