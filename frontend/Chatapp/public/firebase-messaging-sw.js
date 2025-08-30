// src/firebase-messaging.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCPrPjvUCJWs397GsOluN3rhv1XTwfT7dI",
  authDomain: "u-me-chatapp.firebaseapp.com",
  projectId: "u-me-chatapp",
  storageBucket: "u-me-chatapp.firebasestorage.app",
  messagingSenderId: "530840445554",
  appId: "1:530840445554:web:91f48d687d012ecf5818eb",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Get FCM token
export const requestPermissionAndToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BFpk8Dg8HWXgeutGefNXDm3XqaJniZ7bKQypWq3XH71FL0K3HY5klIQzJuFNabCyn8VXv0e0taeInA8TxeYhvGU",
    });
    console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

// Foreground messages
onMessage(messaging, (payload) => {
  console.log("Message received in foreground: ", payload);
});
