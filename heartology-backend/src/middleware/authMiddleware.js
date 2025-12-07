const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from Firestore
      const userDoc = await db.collection('users').doc(decoded.id).get();

      if (!userDoc.exists) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = { id: userDoc.id, ...userDoc.data() };
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };