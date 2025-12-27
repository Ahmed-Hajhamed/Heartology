const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getSystemStats,
    getFinancialStats,
    getAppointmentStats,
    getPatientStats
} = require('../controllers/analyticsController');

// All routes require authentication and admin/staff role
router.get('/system', protect, adminOnly, getSystemStats);
router.get('/financial', protect, adminOnly, getFinancialStats);
router.get('/appointments', protect, adminOnly, getAppointmentStats);
router.get('/patients', protect, adminOnly, getPatientStats);

module.exports = router;
