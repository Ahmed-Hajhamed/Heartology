const { db } = require('../config/firebase');

// @desc    Create User Profile (After Firebase Auth)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { 
      uid, // Firebase UID sent from frontend
      email, 
      role, 
      firstName, 
      lastName, 
      phone, 
      gender, 
      dateOfBirth, 
      address,
      ssn 
    } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'UID and Email are required' });
    }

    // Check if profile already exists
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return res.status(400).json({ success: false, message: 'User profile already exists' });
    }

    const newUser = {
      email,
      role: role || 'patient',
      firstName,
      lastName,
      phone: phone || '',
      gender: gender || 'Other',
      dateOfBirth: dateOfBirth || null,
      address: address || {},
      ssn: ssn || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Save using the Firebase UID as the Document ID
    await db.collection('users').doc(uid).set(newUser);

    res.status(201).json({
      success: true,
      user: { id: uid, ...newUser }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync User (Login)
// @route   POST /api/auth/login (or /sync)
const login = async (req, res) => {
  try {
    // Ideally, the middleware 'protect' has already verified the token
    // and attached req.user. We just return it.
    
    // If this endpoint is public (no protect middleware), we verify the token manually here:
    /*
    const token = req.body.token;
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    */

    // But let's assume you call this route WITH the token header
    // so 'protect' middleware handles verification.
    
    // We just return the user data needed for the frontend
    const user = req.user; 

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };