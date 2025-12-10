const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  createAppointment, 
  getAppointmentById, 
  updateAppointmentStatus 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Protect ALL routes
router.use(protect); 

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointmentById);

router.route('/:id/status')
  .patch(updateAppointmentStatus);

module.exports = router;