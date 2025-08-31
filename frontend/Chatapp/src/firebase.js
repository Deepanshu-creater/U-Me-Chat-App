// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ✅ Firebase config comes from Vercel env vars
const firebaseConfig = {
  apiKey: "AIzaSyCPrPjvUCJWs397GsOluN3rhv1XTwfT7dI",
  authDomain: "u-me-chatapp.firebaseapp.com",
  projectId: "u-me-chatapp",
  storageBucket: "u-me-chatapp.firebasestorage.app",
  messagingSenderId: "530840445554",
  appId: "1:530840445554:web:91f48d687d012ecf5818eb",
  measurementId: "G-5RXMEGHZ8K"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// ✅ Request browser token
export const requestForToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey:"BFpk8Dg8HWXgeutGefNXDm3XqaJniZ7bKQypWq3XH71FL0K3HY5klIQzJuFNabCyn8VXv0e0taeInA8TxeYhvGU"
    });
    console.log("FCM Token:", token);
  } catch (err) {
    console.error("FCM Token Error:", err);
    return null;
  }
};

// ✅ Foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => resolve(payload));
  });
