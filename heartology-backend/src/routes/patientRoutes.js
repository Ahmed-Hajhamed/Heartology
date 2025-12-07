const express = require('express');
const router = express.Router();
const { 
  createPatient, 
  getPatients, 
  getPatientById, 
  updatePatient 
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all routes below
router.use(protect); 

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient);

module.exports = router;