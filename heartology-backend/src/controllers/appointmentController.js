const { db } = require('../config/firebase');

// @desc    Get all appointments (Filtered by Role)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { patientId, doctorId, date, status } = req.query;
    let query = db.collection('appointments');

    // --- SECURITY: ROLE-BASED ACCESS CONTROL ---
    
    // 1. PATIENTS: Can ONLY see their own appointments
    if (req.user.role === 'patient') {
      // Find the Patient Profile linked to this User ID
      const patientQuery = await db.collection('patients').where('userId', '==', req.user.id).get();
      
      if (patientQuery.empty) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      
      const myPatientId = patientQuery.docs[0].id;
      query = query.where('patientId', '==', myPatientId);
    }

    // 2. DOCTORS: Can ONLY see appointments assigned to them
    else if (req.user.role === 'doctor') {
      const doctorQuery = await db.collection('doctors').where('userId', '==', req.user.id).get();
      
      if (doctorQuery.empty) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      
      const myDoctorId = doctorQuery.docs[0].id;
      query = query.where('doctorId', '==', myDoctorId);
    }

    // 3. ADMIN/STAFF: Can filter freely
    else if (req.user.role === 'admin' || req.user.role === 'staff') {
      if (patientId) query = query.where('patientId', '==', patientId);
      if (doctorId) query = query.where('doctorId', '==', doctorId);
    }
    
    // --- COMMON FILTERS ---
    if (date) query = query.where('appointmentDate', '==', date);
    if (status) query = query.where('status', '==', status);

    // Execute Query
    const snapshot = await query.get();
    
    // Fetch Name Details (Optional but helpful for frontend performance)
    const appointments = [];
    
    // Note: To make this faster in production, you might store patientName inside the appointment doc
    // instead of fetching it every time. For now, we return the raw data.
    snapshot.forEach(doc => {
      appointments.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      appointmentDate, 
      appointmentTime, 
      duration, 
      type, 
      reasonForVisit 
    } = req.body;

    // Basic Validation
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Optional: Check for conflicts (simple version)
    const conflictQuery = await db.collection('appointments')
      .where('doctorId', '==', doctorId)
      .where('appointmentDate', '==', appointmentDate)
      .where('appointmentTime', '==', appointmentTime)
      .get();

    if (!conflictQuery.empty) {
      return res.status(400).json({ success: false, message: 'Doctor is already booked at this time' });
    }

    const newAppointment = {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      type: type || 'Consultation',
      reasonForVisit: reasonForVisit || '',
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('appointments').add(newAppointment);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...newAppointment }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const doc = await db.collection('appointments').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = { id: doc.id, ...doc.data() };

    // Security Check: Ensure user is allowed to view this specific appointment
    if (req.user.role === 'patient') {
       // Get patient ID again to verify ownership
       const pQuery = await db.collection('patients').where('userId', '==', req.user.id).get();
       if (!pQuery.empty && appointment.patientId !== pQuery.docs[0].id) {
           return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
       }
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., 'Confirmed', 'Cancelled', 'Completed'
    const { id } = req.params;

    const apptRef = db.collection('appointments').doc(id);
    const doc = await apptRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await apptRef.update({ status });

    res.status(200).json({ success: true, data: { id, ...doc.data(), status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus
};