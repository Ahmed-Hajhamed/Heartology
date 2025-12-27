const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Load the service account key
// Make sure the path matches where you saved the file
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();

module.exports = { db, admin };