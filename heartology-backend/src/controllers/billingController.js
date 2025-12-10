const { db } = require('../config/firebase');

// @desc    Get all invoices
// @route   GET /api/billing/invoices
// @access  Private (Admin/Staff)
const getInvoices = async (req, res) => {
    try {
        const snapshot = await db.collection('invoices').get();
        const invoices = [];

        for (const doc of snapshot.docs) {
            const invoiceData = doc.data();

            // Optionally fetch patient info
            let patientInfo = { firstName: 'Unknown', lastName: '' };
            if (invoiceData.patientId) {
                const patientDoc = await db.collection('patients').doc(invoiceData.patientId).get();
                if (patientDoc.exists) {
                    const patient = patientDoc.data();
                    if (patient.userId) {
                        const userDoc = await db.collection('users').doc(patient.userId).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            patientInfo = {
                                firstName: userData.firstName,
                                lastName: userData.lastName
                            };
                        }
                    }
                }
            }

            invoices.push({
                id: doc.id,
                ...invoiceData,
                patientName: `${patientInfo.firstName} ${patientInfo.lastName}`
            });
        }

        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single invoice by ID
// @route   GET /api/billing/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
    try {
        const doc = await db.collection('invoices').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new invoice
// @route   POST /api/billing/invoices
// @access  Private (Admin/Staff)
const createInvoice = async (req, res) => {
    try {
        const { patientId, appointmentId, items, totalAmount } = req.body;

        if (!patientId || !totalAmount) {
            return res.status(400).json({ success: false, message: 'Patient ID and total amount are required' });
        }

        const newInvoice = {
            patientId,
            appointmentId: appointmentId || null,
            items: items || [],
            totalAmount,
            status: 'Pending',
            paymentMethod: null,
            paidAt: null,
            invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection('invoices').add(newInvoice);

        res.status(201).json({ success: true, data: { id: docRef.id, ...newInvoice } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update invoice (e.g., mark as paid)
// @route   PUT /api/billing/invoices/:id
// @access  Private (Admin/Staff)
const updateInvoice = async (req, res) => {
    try {
        const invoiceRef = db.collection('invoices').doc(req.params.id);
        const doc = await invoiceRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        // If marking as paid, set paidAt
        if (req.body.status === 'Paid' && !doc.data().paidAt) {
            updates.paidAt = new Date().toISOString();
        }

        await invoiceRef.update(updates);

        res.status(200).json({ success: true, message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Process payment for an invoice (Full Payment Only)
// @route   POST /api/billing/invoices/:id/pay
// @access  Private (Admin/Staff/Patient)
const processPayment = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const invoiceRef = db.collection('invoices').doc(req.params.id);
        const doc = await invoiceRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const invoice = doc.data();

        // Check if already paid
        if (invoice.status === 'Paid') {
            return res.status(400).json({ success: false, message: 'Invoice is already paid' });
        }

        const totalAmount = invoice.totalAmount || 0;

        // Update invoice to Paid (full payment)
        const updates = {
            paidAmount: totalAmount,
            balanceAmount: 0,
            status: 'Paid',
            paymentMethod: paymentMethod || 'Cash',
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await invoiceRef.update(updates);

        res.status(200).json({
            success: true,
            message: `Payment of ${totalAmount} EGP processed successfully. Invoice is now Paid!`,
            data: {
                paidAmount: totalAmount,
                balanceAmount: 0,
                status: 'Paid'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get invoice by appointment ID
// @route   GET /api/billing/invoices/appointment/:appointmentId
// @access  Private
const getInvoiceByAppointment = async (req, res) => {
    try {
        const snapshot = await db.collection('invoices')
            .where('appointmentId', '==', req.params.appointmentId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'No invoice found for this appointment' });
        }

        const invoiceDoc = snapshot.docs[0];
        res.status(200).json({
            success: true,
            data: { id: invoiceDoc.id, ...invoiceDoc.data() }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    processPayment,
    getInvoiceByAppointment
};
