const { db } = require('../config/firebase');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Staff)
const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];

    snapshot.forEach(doc => {
      // Exclude password from the result for security
      const userData = doc.data();
      delete userData.password;
      
      users.push({ id: doc.id, ...userData });
    });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = doc.data();
    delete userData.password;

    res.status(200).json({ success: true, data: { id: doc.id, ...userData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById
};