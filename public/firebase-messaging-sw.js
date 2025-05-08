 

// Give the service worker access to Firebase Messaging.

// Note that you can only use Firebase Messaging here
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');


/**
 * IMPORT TYPES FOR Firebase
 * 
 * /**
 * @typedef { import("firebase/messaging").FirebaseMessaging } FirebaseMessaging
 * @typedef { import("firebase/messaging").MessagePayload } MessagePayload
 * @typedef { import("firebase/app").FirebaseApp } FirebaseApp
 * @typedef { import("firebase/app").FirebaseOptions } FirebaseOptions
 * @typedef { import("firebase/messaging").Messaging } Messaging
 * @typedef { import("firebase/messaging").onBackgroundMessage } onBackgroundMessage
 * @typedef { import("firebase/messaging").onMessage } onMessage
 */


// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.



firebase.initializeApp( {

  apiKey: "AIzaSyAbDvW9qcvomF8HTrzWWWjGTfpg8PDbxLU",

  authDomain: "parcel-pi.firebaseapp.com",

  projectId: "parcel-pi",

  storageBucket: "parcel-pi.firebasestorage.app",

  messagingSenderId: "849953340136",

  appId: "1:849953340136:web:c543dd6822fcc93e72675d",

  measurementId: "G-P9BEDL9JGX"

});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  /**
   * @type { NotificationOptions }
   
   */
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/ios/128.png' // Add your icon path in public folder,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});