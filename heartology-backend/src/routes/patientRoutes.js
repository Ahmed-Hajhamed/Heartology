const express = require('express');
const router = express.Router();
const { getPatients, createPatient, getPatientById } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById);

module.exports = router;