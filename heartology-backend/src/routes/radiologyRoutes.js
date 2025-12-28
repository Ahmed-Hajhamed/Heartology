const express = require('express');
const router = express.Router();
const { predictRadiology, getStudyThumbnail } = require('../controllers/radiologyController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/predict')
  .post(predictRadiology);

// Thumbnail endpoint
router.route('/studies/:id/thumbnail')
  .get(getStudyThumbnail);

module.exports = router;

