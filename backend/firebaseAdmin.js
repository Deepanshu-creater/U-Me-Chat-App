// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./u-me-chatapp-firebase-adminsdk-fbsvc-6b43335d69.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, message) => {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title: message.title,
        body: message.body,
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { admin, sendNotification };
