const { db } = require('../config/firebase');

// @desc    Create a new Medical Record (SOAP Note)
// @route   POST /api/medical-records
// @access  Private (Doctor only)
const createMedicalRecord = async (req, res) => {
  try {
    const { 
      patientId, doctorId, appointmentId, recordType, 
      vitalSigns, clinicalNotes, diagnoses 
    } = req.body;

    // 1. Validation
    if (!patientId || !doctorId || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Patient, Doctor, and Appointment IDs are required' });
    }

    // 2. Construct Medical Record Object [cite: 106-146]
    const newRecord = {
      patientId,
      doctorId,
      appointmentId,
      recordDate: new Date().toISOString(),
      recordType: recordType || 'Consultation', // 'Consultation', 'Follow-up', 'Emergency'
      
      // Vital Signs [cite: 113-125]
      vitalSigns: vitalSigns || {
        bloodPressure: { systolic: 0, diastolic: 0 },
        heartRate: 0,
        temperature: 0,
        oxygenSaturation: 0,
        respiratoryRate: 0,
        weight: 0,
        height: 0,
        bmi: 0 // Ideally calculated: weight(kg) / height(m)^2
      },

      // Clinical Notes (SOAP Format) 
      clinicalNotes: clinicalNotes || {
        chiefComplaint: '',
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },

      // Diagnoses (ICD-10) [cite: 133-137]
      diagnoses: diagnoses || [], 
      // Example structure: [{ icd10Code: "I10", description: "Hypertension", isPrimary: true }]

      attachments: [], // File URLs will be added here later via the Upload API
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('medicalRecords').add(newRecord);

    // Optional: Update the Appointment status to "Completed" automatically
    await db.collection('appointments').doc(appointmentId).update({ status: 'Completed' });

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newRecord }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Medical Records (Filter by Patient)
// @route   GET /api/medical-records
// @access  Private
const getMedicalRecords = async (req, res) => {
  try {
    let query = db.collection('medicalRecords');

    // Filter by Patient ID (History View) [cite: 326]
    if (req.query.patientId) {
      query = query.where('patientId', '==', req.query.patientId);
    }
    
    // Filter by Doctor ID [cite: 327]
    if (req.query.doctorId) {
      query = query.where('doctorId', '==', req.query.doctorId);
    }

    // Filter by Appointment ID
    if (req.query.appointmentId) {
        query = query.where('appointmentId', '==', req.query.appointmentId);
    }

    const snapshot = await query.get();
    const records = [];

    // Manually join Doctor/Patient names if needed
    for (const doc of snapshot.docs) {
        records.push({ id: doc.id, ...doc.data() });
    }

    // Sort by Date (Descending - newest first)
    records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Medical Record
// @route   GET /api/medical-records/:id
const getMedicalRecordById = async (req, res) => {
  try {
    const doc = await db.collection('medicalRecords').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Record not found' });
    
    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById
};