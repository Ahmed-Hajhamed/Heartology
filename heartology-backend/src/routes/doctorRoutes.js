const express = require('express');
const router = express.Router();
const { 
  createDoctor, 
  getDoctors, 
  getDoctorById, 
  updateSchedule 
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (Patients need to see doctors to book)
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.post('/', protect, createDoctor); // Usually Admin only
router.put('/:id/schedule', protect, updateSchedule); // Doctor updating their own time

module.exports = router;