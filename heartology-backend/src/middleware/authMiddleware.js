const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 1. Verify Token (Custom JWT)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // 2. Get User from Firestore using the ID from payload
      const userDoc = await db.collection('users').doc(decoded.id).get();

      if (!userDoc.exists) {
        return res.status(401).json({ success: false, message: 'User profile not found' });
      }

      // Attach user info to request
      req.user = { id: userDoc.id, ...userDoc.data() };
      // Remove password
      if (req.user.password) delete req.user.password;

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