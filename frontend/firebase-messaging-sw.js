// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_KEY",
  projectId: "YOUR_KEY",
  messagingSenderId: "YOUR_KEY",
  appId: "YOUR_KEY",
});

const messaging = firebase.messaging();

// Background notifications
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
