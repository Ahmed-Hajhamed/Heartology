const { db } = require('../config/firebase');

// @desc    Create a new patient profile
// @route   POST /api/patients
// @access  Private (Admin/Doctor/Staff)
const createPatient = async (req, res) => {
  try {
    // We expect the request to contain the userId (link to the login account)
    // and the medical profile details
    const { 
      userId, ssn, bloodType, allergies, chronicConditions, 
      currentMedications, insurance, emergencyContact 
    } = req.body;

    // 1. Basic Validation
    if (!userId || !ssn) {
      return res.status(400).json({ success: false, message: 'User ID and SSN are required' });
    }

    // 2. Check if patient profile already exists for this SSN
    const existingPatient = await db.collection('patients').where('ssn', '==', ssn).get();
    if (!existingPatient.empty) {
      return res.status(400).json({ success: false, message: 'Patient profile with this SSN already exists' });
    }

    // 3. Construct Patient Object (Based on Database Plan Page 2)
    const newPatient = {
      userId, // Link to User Collection
      ssn,
      bloodType: bloodType || '',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      currentMedications: currentMedications || [],
      familyHistory: req.body.familyHistory || '',
      smokingStatus: req.body.smokingStatus || 'Never',
      alcoholConsumption: req.body.alcoholConsumption || 'None',
      exerciseFrequency: req.body.exerciseFrequency || '',
      
      // Nested Objects
      insurance: insurance || {
        provider: '',
        policyNumber: '',
        expiryDate: null
      },
      emergencyContact: emergencyContact || {
        name: '',
        relationship: '',
        phone: ''
      },

      registrationDate: new Date().toISOString(),
      lastVisit: null,
      status: 'Active'
    };

    // 4. Save to Firestore
    const docRef = await db.collection('patients').add(newPatient);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newPatient }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Doctor/Admin)
const getPatients = async (req, res) => {
  try {
    const snapshot = await db.collection('patients').get();
    const patients = [];
    
    // Optional: We could manually fetch the "User" details (Name, Email) for each patient here
    // But for now, we just return the patient profiles
    snapshot.forEach(doc => {
      patients.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
  try {
    const doc = await db.collection('patients').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patientData = doc.data();

    // Fetch the associated User data (Name, Email) to return a complete profile
const userDoc = await db.collection('users').doc(patientData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.status(200).json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...patientData,
        personalInfo: { 
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            // ADD THESE LINES:
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            address: userData.address
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const patientRef = db.collection('patients').doc(req.params.id);
    const doc = await patientRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Update with whatever data is sent in body
    const updates = {
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    // Prevent updating critical fields if necessary (like ssn or userId)
    // delete updates.ssn; 

    await patientRef.update(updates);

    res.status(200).json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient
};