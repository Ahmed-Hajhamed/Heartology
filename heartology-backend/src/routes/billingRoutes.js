const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    processPayment,
    getInvoiceByAppointment
} = require('../controllers/billingController');

// All routes are protected
router.get('/invoices', protect, getInvoices);
router.get('/invoices/appointment/:appointmentId', protect, getInvoiceByAppointment); // Get invoice by appointment
router.get('/invoices/:id', protect, getInvoiceById);
router.post('/invoices', protect, createInvoice);
router.put('/invoices/:id', protect, updateInvoice);
router.post('/invoices/:id/pay', protect, processPayment); // Process payment

module.exports = router;
