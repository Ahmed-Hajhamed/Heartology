const { db } = require('../config/firebase');

// @desc    Create a new doctor profile
// @route   POST /api/doctors
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    const { 
      userId, specialization, licenseNumber, yearsOfExperience, 
      consultationFee, workingDays, workingHours 
    } = req.body;

    // 1. Validation
    if (!userId || !specialization || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 2. Check for duplicate License Number
    const existingDoc = await db.collection('doctors').where('licenseNumber', '==', licenseNumber).get();
    if (!existingDoc.empty) {
      return res.status(400).json({ success: false, message: 'License number already registered' });
    }

    // 3. Construct Doctor Object (Based on Database Plan Page 2)
    const newDoctor = {
      userId,
      specialization,
      licenseNumber,
      yearsOfExperience: yearsOfExperience || 0,
      qualifications: req.body.qualifications || [],
      consultationFee: consultationFee || 0,
      rating: 0, // Starts at 0
      totalPatients: 0,
      
      // Schedule Management [cite: 72-77]
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || {
        start: "09:00",
        end: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00"
      },
      availability: 'Available', // 'Available', 'On Leave', 'Busy'
      
      joinDate: new Date().toISOString()
    };

    const docRef = await db.collection('doctors').add(newDoctor);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newDoctor }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors (with optional filtering)
// @route   GET /api/doctors
// @access  Public (so patients can see who to book)
const getDoctors = async (req, res) => {
  try {
    let query = db.collection('doctors');

    // Optional: Filter by specialization if query param exists
    // Example: GET /api/doctors?specialization=Cardiology
    if (req.query.specialization) {
      query = query.where('specialization', '==', req.query.specialization);
    }

    const snapshot = await query.get();
    const doctors = [];

    // Fetch User names for each doctor manually
for (const doc of snapshot.docs) {
      const doctorData = doc.data();
      const userDoc = await db.collection('users').doc(doctorData.userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      doctors.push({
        id: doc.id,
        ...doctorData,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email, // <--- ADD THIS
        phone: userData.phone  // <--- ADD THIS
      });
    }

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doc = await db.collection('doctors').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorData = doc.data();
    
    // Fetch personal details
    const userDoc = await db.collection('users').doc(doctorData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.status(200).json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...doctorData,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Doctor Schedule
// @route   PUT /api/doctors/:id/schedule
// @access  Private (Doctor only)
const updateSchedule = async (req, res) => {
  try {
    const { workingDays, workingHours, availability } = req.body;
    
    await db.collection('doctors').doc(req.params.id).update({
      workingDays,
      workingHours,
      availability
    });

    res.status(200).json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateSchedule
};