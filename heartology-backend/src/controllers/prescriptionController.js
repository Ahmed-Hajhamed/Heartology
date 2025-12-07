const { db } = require('../config/firebase');

// @desc    Create a new Prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res) => {
  try {
    const { 
      patientId, doctorId, medicalRecordId, 
      medications, refillsAllowed, notes 
    } = req.body;

    // 1. Validation
    if (!patientId || !doctorId || !medications || medications.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient, Doctor, and at least one medication are required' });
    }

    // 2. Calculate Expiry Date (Default: 6 months from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    // 3. Construct Prescription Object 
    const newPrescription = {
      patientId,
      doctorId,
      medicalRecordId: medicalRecordId || null, // Optional link to specific record
      prescriptionDate: new Date().toISOString(),
      
      // Medication List [cite: 845-852]
      medications: medications.map(med => ({
        drugName: med.drugName,
        dosage: med.dosage,       // e.g., "500mg"
        frequency: med.frequency, // e.g., "Twice a day"
        duration: med.duration,   // e.g., "7 days"
        instructions: med.instructions || '', // e.g., "Take after food"
        quantity: med.quantity || 0
      })),

      refillsAllowed: refillsAllowed || 0,
      status: 'Active', // 'Active', 'Completed', 'Cancelled', 'Expired'
      expiryDate: expiryDate.toISOString(),
      notes: notes || '',
      pharmacyNotes: '', // Intended for pharmacist use later
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('prescriptions').add(newPrescription);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newPrescription }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Prescriptions (Filter by Patient)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    let query = db.collection('prescriptions');

    // Filter by Patient (Patient viewing their own meds)
    if (req.query.patientId) {
      query = query.where('patientId', '==', req.query.patientId);
    }

    // Filter by Doctor
    if (req.query.doctorId) {
      query = query.where('doctorId', '==', req.query.doctorId);
    }

    const snapshot = await query.get();
    const prescriptions = [];

    for (const doc of snapshot.docs) {
        // Optional: Fetch Doctor Name for display
        const data = doc.data();
        prescriptions.push({ id: doc.id, ...data });
    }

    // Sort by Date (newest first)
    prescriptions.sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Prescription (For printing/PDF)
// @route   GET /api/prescriptions/:id
const getPrescriptionById = async (req, res) => {
  try {
    const doc = await db.collection('prescriptions').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Prescription not found' });
    
    // In a real app, this endpoint would be used to generate the PDF
    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Prescription Status (e.g., Cancelled)
// @route   PATCH /api/prescriptions/:id/status
const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Active', 'Cancelled', 'Completed'
    
    await db.collection('prescriptions').doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: `Prescription marked as ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus
};