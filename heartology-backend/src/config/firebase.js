const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  // If you are using Realtime Database instead of Firestore, add:
  // databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

console.log('Firebase Admin Initialized');

module.exports = { db, auth };