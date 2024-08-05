// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_FIREBASE_API,
  authDomain: "pantry-app-aeb7c.firebaseapp.com",
  projectId: "pantry-app-aeb7c",
  //storageBucket: "pantry-app-aeb7c.appspot.com",
  storageBucket: "gs://pantry-app-aeb7c.appspot.com",
  messagingSenderId: "402816292476",
  appId: "1:402816292476:web:aabb49836a3e26501cdbf9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)
