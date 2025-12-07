const express = require('express');
const router = express.Router();
const { 
  createPrescription, 
  getPrescriptions, 
  getPrescriptionById,
  updatePrescriptionStatus
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/:id')
  .get(getPrescriptionById);

router.patch('/:id/status', updatePrescriptionStatus);

module.exports = router;