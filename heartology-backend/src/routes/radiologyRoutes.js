const express = require('express');
const router = express.Router();
const { predictRadiology } = require('../controllers/radiologyController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/predict')
  .post(predictRadiology);

module.exports = router;

