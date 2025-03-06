const admin = require('firebase-admin');
const FcmToken = require('../models/fcmtokenModel');

// Initialize Firebase Admin SDK
// const serviceAccount = require('../assets/knowledge-temple-firebase-adminsdk.json');

// const initializeFirebaseAdmin = () => {
//   if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//     console.log('Firebase Initialize Success :>> ');
//   }
// };

const sendPushNotification = async (tokens, title, message) => {
  if (!tokens || tokens.length === 0) {
    console.log('<<: Tokens list cannot be empty. :>>');
    return;
  }

  const payload = {
    notification: {
      title,
      body: message,
    },
  };

  try {
    const response = await admin.messaging().sendToDevice(tokens, payload);
    console.log('Push notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return;
  }
};

const sendPush = async (title, body) => {
  try {
    const tokens = await FcmToken.find({
      token: { $ne: null, $ne: '' },
    }).select('fcmToken');
    const tokenList = tokens.map((tokenObj) => tokenObj.fcmToken);
    await sendPushNotification(tokenList, title, body);
  } catch (error) {
    console.error('Error fetching tokens or sending push notification:', error);
  }
};

module.exports = {
  // initializeFirebaseAdmin,
  sendPushNotification,
  sendPush,
};
