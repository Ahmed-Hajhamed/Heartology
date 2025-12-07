const express = require('express');
const router = express.Router();
const { 
  createMedicalRecord, 
  getMedicalRecords, 
  getMedicalRecordById 
} = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all routes

router.route('/')
  .get(getMedicalRecords)
  .post(createMedicalRecord);

router.route('/:id')
  .get(getMedicalRecordById);

module.exports = router;