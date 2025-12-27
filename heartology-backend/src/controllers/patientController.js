const { db } = require('../config/firebase');

// @desc    Get all patients
// @route   GET /api/patients
const getPatients = async (req, res) => {
  try {
    const snapshot = await db.collection('patients').get();
    const patients = [];

    for (const doc of snapshot.docs) {
      const patientData = doc.data();
      // Fetch linked user data for names/email
      const userDoc = await db.collection('users').doc(patientData.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      patients.push({
        id: doc.id,
        ...patientData,
        personalInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          dateOfBirth: userData.dateOfBirth,
          address: userData.address
        }
      });
    }

    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
const getPatientById = async (req, res) => {
  try {
    const doc = await db.collection('patients').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const patientData = doc.data();
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

// @desc    Create/Update patient profile
// @route   POST /api/patients
const createPatient = async (req, res) => {
  try {
    const { 
      userId, ssn, bloodType, allergies, chronicConditions, 
      currentMedications, familyHistory, smokingStatus, 
      alcoholConsumption, insurance, emergencyContact 
    } = req.body;

    // 1. Validate Required Fields
    if (!userId || !ssn) {
      return res.status(400).json({ success: false, message: 'User ID and SSN are required' });
    }

    // 2. Check if Patient Profile already exists for this User
    const existingQuery = await db.collection('patients').where('userId', '==', userId).get();
    if (!existingQuery.empty) {
      // Update existing profile
      const docId = existingQuery.docs[0].id;
      const updateData = { ...req.body };
      // Preserve pacsPatientId if not provided in update
      if (!updateData.pacsPatientId && updateData.pacsPatientId !== null) {
        const existingDoc = await db.collection('patients').doc(docId).get();
        if (existingDoc.exists && existingDoc.data().pacsPatientId) {
          updateData.pacsPatientId = existingDoc.data().pacsPatientId;
        }
      }
      updateData.updatedAt = new Date().toISOString();
      await db.collection('patients').doc(docId).update(updateData);
      return res.status(200).json({ success: true, message: 'Profile Updated', data: { id: docId } });
    }

    // 3. Create New Profile
    const newPatient = {
      userId,
      ssn,
      bloodType: bloodType || '',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      currentMedications: currentMedications || [],
      familyHistory: familyHistory || '',
      smokingStatus: smokingStatus || 'Never',
      alcoholConsumption: alcoholConsumption || 'None',
      insurance: insurance || {},
      emergencyContact: emergencyContact || {},
      pacsPatientId: null, // PACS integration field
      lastVisit: null,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('patients').add(newPatient);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newPatient }
    });

  } catch (error) {
    console.error("Create Patient Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update patient profile
// @route   PATCH /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get the patient document
    const patientRef = db.collection('patients').doc(id);
    const doc = await patientRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Security check: Ensure user can only update their own patient profile (if patient role)
    // Or allow admin/staff/doctor to update any patient
    if (req.user.role === 'patient') {
      const patientData = doc.data();
      const patientQuery = await db.collection('patients').where('userId', '==', req.user.id).get();
      if (patientQuery.empty || patientQuery.docs[0].id !== id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this patient profile' });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId; // userId should not be changed
    delete updateData.createdAt; // createdAt should not be changed

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update the patient document
    await patientRef.update(updateData);

    // Fetch updated patient data
    const updatedDoc = await patientRef.get();
    const updatedPatientData = updatedDoc.data();
    const userDoc = await db.collection('users').doc(updatedPatientData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedPatientData,
        personalInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          dateOfBirth: userData.dateOfBirth,
          address: userData.address
        }
      }
    });
  } catch (error) {
    console.error("Update Patient Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient };