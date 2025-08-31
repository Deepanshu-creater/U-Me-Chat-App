// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCPCJWs397GsOluN3rhv1XTwfT7dI",
  authDomain: "u-me-chatp.firebaseapp.com",
  projectId: "u-matapp",
  storageBucket: "u-me-chafirebasestorage.app",
  messagingSenderId: "53084445554",
  appId: "1:530840445554:web:91687d012ecf5818eb",
};
const messaging = firebase.messaging();
// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/icon.png", // optional icon
  };
 self.registration.showNotification(notificationTitle, notificationOptions);
});
