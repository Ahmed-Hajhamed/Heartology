const { admin, db } = require('../config/firebase');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 1. Verify Token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // 2. Get User from Firestore using the Firebase UID
      // Note: We now assume the Firestore Document ID is the same as the Firebase UID
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        return res.status(401).json({ success: false, message: 'User profile not found' });
      }

      // Attach user info to request
      req.user = { id: userDoc.id, ...userDoc.data() };
      next();

    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

module.exports = { protect, adminOnly };