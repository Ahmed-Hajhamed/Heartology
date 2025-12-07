const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { 
      ssn, email, password, role, firstName, lastName, 
      phone, gender, dateOfBirth, address 
    } = req.body;

    if (!email || !password || !ssn || !role || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      ssn,
      email,
      password: hashedPassword,
      role, 
      firstName,
      lastName,
      phone: phone || '',
      gender: gender || 'Other',
      dateOfBirth: dateOfBirth || null,
      address: address || {}, 
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newUser);

    const token = jwt.sign({ id: docRef.id, role: role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(201).json({
      success: true,
      accessToken: token,
      user: { 
        id: docRef.id, 
        ...newUser 
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: userDoc.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    // --- FIXED: ADDED SSN HERE ---
    res.status(200).json({
      success: true,
      accessToken: token,
      user: {
        id: userDoc.id,
        ssn: user.ssn, // <--- THIS WAS MISSING
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };