const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      email, password, uid, role, firstName, lastName, phone, gender, dateOfBirth, address, ssn
    } = req.body;

    // Support both Firebase Auth (uid) and traditional (password) registration
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email based on role (for demonstration)
    const userRole = role || 'patient';
    if (userRole === 'doctor' && !email.endsWith('@hospital.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctors must register with a @hospital.com email address' 
      });
    }
    if (userRole === 'staff' && !email.endsWith('@staff.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff must register with a @staff.com email address' 
      });
    }
    // Patients and admins can use any email

    // If using Firebase Auth, uid is required. Otherwise, password is required.
    if (!uid && !password) {
      return res.status(400).json({ success: false, message: 'Either uid (Firebase) or password is required' });
    }

    // Check if user already exists
    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // If uid is provided (Firebase Auth), check if user with this uid already exists
    if (uid) {
      const uidQuery = await db.collection('users').where('uid', '==', uid).get();
      if (!uidQuery.empty) {
        return res.status(400).json({ success: false, message: 'User with this Firebase UID already exists' });
      }
    }

    // Hash Password only if password is provided (not using Firebase Auth)
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = {
      email,
      ...(hashedPassword && { password: hashedPassword }), // Only include password if it was hashed
      ...(uid && { uid: uid }), // Include uid if provided (Firebase Auth)
      role: role || 'patient',
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      gender: gender || 'Other',
      dateOfBirth: dateOfBirth || null,
      address: address || {},
      ssn: ssn || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.',
      data: { id: docRef.id }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User & Get Token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, uid } = req.body;

    // Support both Firebase Auth (uid) and traditional (password) login
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // If using Firebase Auth, uid is required. Otherwise, password is required.
    if (!uid && !password) {
      return res.status(400).json({ success: false, message: 'Either uid (Firebase) or password is required' });
    }

    let userQuery;
    let userDoc;
    let user;

    // If uid is provided (Firebase Auth), find user by uid
    if (uid) {
      userQuery = await db.collection('users').where('uid', '==', uid).get();
      if (userQuery.empty) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      userDoc = userQuery.docs[0];
      user = userDoc.data();
    } else {
      // Traditional login: find by email and verify password
      userQuery = await db.collection('users').where('email', '==', email).get();
      
      if (userQuery.empty) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      userDoc = userQuery.docs[0];
      user = userDoc.data();

      // Check if password exists
      if (!user.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials (no password set). Please use Firebase Authentication.' });
      }

      // Match password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    // Create Token
    const payload = { id: userDoc.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      token,
      user: { id: userDoc.id, ...user }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };
