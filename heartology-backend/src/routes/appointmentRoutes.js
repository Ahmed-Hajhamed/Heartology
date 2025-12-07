const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAppointments, 
  getAppointmentById, 
  updateAppointmentStatus 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all routes

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointmentById);

router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;