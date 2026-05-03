const { db } = require('../config/firebase');
const { assignScanToPatient } = require('../services/RadiologyService');

// Template Study Instance UIDs for normal heart scans
const NORMAL_HEART_SCANS = [
  '1.2.826.0.1.3680043.8.498.65932550331660928509262777099721109252',
  '1.2.826.0.1.3680043.8.498.93860610018678669415400309565886088268',
  '1.2.826.0.1.3680043.8.498.16230640878550461263592119697880533664',
  '1.2.826.0.1.3680043.8.498.70493775531032013625068629168153348774',
  '1.2.826.0.1.3680043.8.498.62909792531251488518012102295631110640',
  '1.2.826.0.1.3680043.8.498.18036823888686057185019461954698582157',
  '1.2.826.0.1.3680043.8.498.71805375670784599698576703485251744630',
  '1.2.826.0.1.3680043.8.498.16745248682361182860928038522938653566',
  '1.2.826.0.1.3680043.8.498.6498038521325610489020693643369776880',
  '1.2.826.0.1.3680043.8.498.7022036604774013878789975655574534184'
];

// Template Study Instance UIDs for pathology scans
const PATHOLOGY_SCANS = [
  '1.2.826.0.1.3680043.8.498.18022695992288037033873592157909703020',
  '1.2.826.0.1.3680043.8.498.7820599399092157576391313312410202875',
  '1.2.826.0.1.3680043.8.498.50481687033231048677167096858227352461',
  '1.2.826.0.1.3680043.8.498.94990454134576571137582239688317624874',
  '1.2.826.0.1.3680043.8.498.83049522846639332443312661389619858155',
  '1.2.826.0.1.3680043.8.498.17516516330689793076318675615348960514',
  '1.2.826.0.1.3680043.8.498.27639721448444283872302994227385374925',
  '1.2.826.0.1.3680043.8.498.98271428593790177001153501071893376478',
  '1.2.826.0.1.3680043.8.498.51718206548003017673630543493327578116',
  '1.2.826.0.1.3680043.8.498.94307292311091491912285978384814594342'
];

// Helper function to update radiology order status when invoice is paid
const updateRadiologyOrderOnPayment = async (appointmentId) => {
    try {
        const apptRef = db.collection('appointments').doc(appointmentId);
        const apptDoc = await apptRef.get();

        if (!apptDoc.exists) {
            console.log(`Appointment ${appointmentId} not found when updating radiology order`);
            return;
        }

        const appointment = apptDoc.data();

        // Check if appointment has a radiology order with status 'ordered'
        if (appointment.radiologyOrder && appointment.radiologyOrder.status === 'ordered') {
            // 1. Get patient information (firstName, lastName)
            const patientDoc = await db.collection('patients').doc(appointment.patientId).get();
            if (!patientDoc.exists) {
                console.error(`Patient ${appointment.patientId} not found for appointment ${appointmentId}`);
                return;
            }

            const patientData = patientDoc.data();
            const userDoc = await db.collection('users').doc(patientData.userId).get();
            if (!userDoc.exists) {
                console.error(`User not found for patient ${appointment.patientId}`);
                return;
            }

            const userData = userDoc.data();
            const patientFullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            
            if (!patientFullName) {
                console.error(`Patient name not found for appointment ${appointmentId}`);
                return;
            }

            // 2. Select a random template UID based on indication
            const indication = appointment.radiologyOrder.indication || '';
            let templateStudyUid = null;
            
            // Determine which template list to use based on indication
            if (indication.toLowerCase().includes('routine') || indication.toLowerCase().includes('normal')) {
                // Use normal scans for routine checkups
                const randomIndex = Math.floor(Math.random() * NORMAL_HEART_SCANS.length);
                templateStudyUid = NORMAL_HEART_SCANS[randomIndex];
            } else if (indication.toLowerCase().includes('hypertrophy') || 
                       indication.toLowerCase().includes('pathology') ||
                       indication.toLowerCase().includes('dilated')) {
                // Use pathology scans for abnormal cases
                const randomIndex = Math.floor(Math.random() * PATHOLOGY_SCANS.length);
                templateStudyUid = PATHOLOGY_SCANS[randomIndex];
            } else {
                // Default to normal scans if indication is unclear
                const randomIndex = Math.floor(Math.random() * NORMAL_HEART_SCANS.length);
                templateStudyUid = NORMAL_HEART_SCANS[randomIndex];
            }

            if (!templateStudyUid) {
                console.error(`Failed to select template scan for appointment ${appointmentId}`);
                return;
            }

            // 3. Call assignScanToPatient to create a new study with patient's metadata
            // We'll attempt the assignment, but if it fails we FALLBACK to a viewable Study UID
            // (either the original template or the stored pacsStudyId) and still mark the order completed.
            let newStudyInstanceUid = appointment.radiologyOrder?.pacsStudyId || templateStudyUid;
            let assignmentFailed = false;
            let assignmentErrorMsg = null;

            try {
                const assignedUid = await assignScanToPatient(templateStudyUid, {
                    fullName: patientFullName,
                    id: patientDoc.id
                });

                // Use the newly created study UID when assignment succeeds
                if (assignedUid) newStudyInstanceUid = assignedUid;
            } catch (error) {
                // Log and fallback to ensure the scan becomes viewable and status updates
                console.error(`Error assigning scan to patient for appointment ${appointmentId}:`, error);
                assignmentFailed = true;
                assignmentErrorMsg = error.message || String(error);
                // newStudyInstanceUid keeps the existing pacsStudyId or templateStudyUid so viewers can still load something
            }

            // 4. Update radiology order status to completed and save the Study Instance UID (fallback if needed)
            const updateData = {
                radiologyOrder: {
                    ...appointment.radiologyOrder,
                    status: 'completed',
                    pacsStudyId: newStudyInstanceUid,
                    assignmentFailed,
                    assignmentErrorMsg,
                    assignmentTriedAt: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
            };

            await apptRef.update(updateData);
            console.log(`Radiology order marked as completed for appointment ${appointmentId}. Study UID set to: ${newStudyInstanceUid}${assignmentFailed ? ' (assignment failed, used fallback)' : ''}`);
        }
    } catch (error) {
        console.error(`Error updating radiology order for appointment ${appointmentId}:`, error);
        // Don't throw error - payment should still succeed even if radiology order update fails
    }
};

// @desc    Get all invoices
// @route   GET /api/billing/invoices
// @access  Private (Admin/Staff)
const getInvoices = async (req, res) => {
    try {
        const { patientId } = req.query;
        
        // Filter by patientId if provided (for patient role)
        let query = db.collection('invoices');
        if (patientId) {
            query = query.where('patientId', '==', patientId);
        }
        
        const snapshot = await query.get();
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
            invoiceDate: new Date().toISOString(),
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
        const invoiceData = doc.data();
        const isBeingMarkedAsPaid = req.body.status === 'Paid' && invoiceData.status !== 'Paid';
        
        if (isBeingMarkedAsPaid && !invoiceData.paidAt) {
            updates.paidAt = new Date().toISOString();
        }

        await invoiceRef.update(updates);

        // If invoice is being marked as paid (transitioning from unpaid to paid) and has an appointmentId, update radiology order
        if (isBeingMarkedAsPaid && invoiceData.appointmentId) {
            await updateRadiologyOrderOnPayment(invoiceData.appointmentId);
        }

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

        // If invoice is linked to an appointment, update radiology order status
        if (invoice.appointmentId) {
            await updateRadiologyOrderOnPayment(invoice.appointmentId);
        }

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
