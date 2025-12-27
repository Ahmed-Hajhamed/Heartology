const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  createAppointment, 
  getAppointmentById, 
  updateAppointmentStatus,
  updateAppointment,
  linkScanToAppointment,
  assignScanToAppointment,
  getAvailableScans,
  markRadiologyOrderAsPaid
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Protect ALL routes
router.use(protect); 

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

// IMPORTANT: Define specific routes BEFORE parameterized routes
// Otherwise Express will match /available-scans as /:id
router.route('/available-scans')
  .get(getAvailableScans);

router.route('/:id')
  .get(getAppointmentById)
  .patch(updateAppointment);

router.route('/:id/status')
  .patch(updateAppointmentStatus);

router.route('/:id/link-scan')
  .patch(linkScanToAppointment);

router.route('/:id/assign-scan')
  .patch(assignScanToAppointment);

router.route('/:id/radiology-order/pay')
  .patch(markRadiologyOrderAsPaid);

module.exports = router;