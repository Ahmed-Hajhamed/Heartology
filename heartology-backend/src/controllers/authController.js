const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      email, password, role, firstName, lastName, phone, gender, dateOfBirth, address, ssn
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }

    // Check if user already exists
    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email,
      password: hashedPassword,
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

    const docRef = await db.collection('users').add(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User & Get Token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    // Check if password exists (some seeded users might not have it if seeded differently, but seed_v2 added it)
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials (no password set)' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
