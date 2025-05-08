import { initializeApp } from "firebase/app";
 
import { getMessaging } from "firebase/messaging";
 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyAbDvW9qcvomF8HTrzWWWjGTfpg8PDbxLU",

  authDomain: "parcel-pi.firebaseapp.com",

  projectId: "parcel-pi",

  storageBucket: "parcel-pi.firebasestorage.app",

  messagingSenderId: "849953340136",

  appId: "1:849953340136:web:c543dd6822fcc93e72675d",

  measurementId: "G-P9BEDL9JGX"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = 'serviceWorker' in navigator ? getMessaging(app) : null