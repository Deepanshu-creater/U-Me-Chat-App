// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyCPCJWs397GsOluN3rhv1XTwfT7dI",
  authDomain: "u-me-chatp.firebaseapp.com",
  projectId: "u-matapp",
  storageBucket: "u-me-chafirebasestorage.app",
  messagingSenderId: "53084445554",
  appId: "1:530840445554:web:91687d012ecf5818eb",
};

firebase.initializeApp(firebaseConfig);

// Background messages
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("Message received in background: ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
