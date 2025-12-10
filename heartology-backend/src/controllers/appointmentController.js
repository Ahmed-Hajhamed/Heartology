const { db } = require('../config/firebase');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { 
      patientId, doctorId, appointmentDate, appointmentTime, 
      type, reasonForVisit, notes 
    } = req.body;

    // 1. Validate Input
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 2. Check Doctor Availability (Prevent Double Booking)
    // We query for an appointment with the same Doctor, Date, and Time
    // Note: status != 'Cancelled'
    const existingAppt = await db.collection('appointments')
      .where('doctorId', '==', doctorId)
      .where('appointmentDate', '==', appointmentDate)
      .where('appointmentTime', '==', appointmentTime)
      .get();

    // Filter out cancelled appointments from the check
    const activeAppt = existingAppt.docs.filter(doc => doc.data().status !== 'Cancelled');

    if (activeAppt.length > 0) {
      return res.status(400).json({ success: false, message: 'Doctor is not available at this time' });
    }

    // 3. Create Appointment Object [cite: 83-104]
    const newAppointment = {
      patientId,
      doctorId,
      appointmentDate, // Format: "YYYY-MM-DD"
      appointmentTime, // Format: "HH:MM"
      type: type || 'Check-up', // 'Check-up', 'Consultation', 'Emergency'
      status: 'Scheduled',
      reasonForVisit: reasonForVisit || '',
      notes: notes || '',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

const getAppointments = async (req, res) => {
  try {
    const { patientId, doctorId, date, status } = req.query;
    let query = db.collection('appointments');

    // --- SECURITY ENFORCEMENT START ---
    
    // 1. If user is a PATIENT, they can ONLY see their own appointments
    if (req.user.role === 'patient') {
      // Find the Patient Profile for this User
      const patientQuery = await db.collection('patients').where('userId', '==', req.user.id).get();
      
      if (patientQuery.empty) {
        return res.status(200).json({ success: true, count: 0, data: [] }); // No profile = No appointments
      }
      
      const myPatientId = patientQuery.docs[0].id;
      
      // FORCE the query to only show this patient's data
      // (Even if they try to request someone else's ID in the URL, we ignore it)
      query = query.where('patientId', '==', myPatientId);
    }

    // 2. If user is a DOCTOR, they can ONLY see appointments assigned to them
    else if (req.user.role === 'doctor') {
      const doctorQuery = await db.collection('doctors').where('userId', '==', req.user.id).get();
      
      if (doctorQuery.empty) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      
      const myDoctorId = doctorQuery.docs[0].id;
      query = query.where('doctorId', '==', myDoctorId);
    }

    // 3. Admins/Staff can filter by whatever they want (or see all)
    else if (req.user.role === 'admin' || req.user.role === 'staff') {
      if (patientId) query = query.where('patientId', '==', patientId);
      if (doctorId) query = query.where('doctorId', '==', doctorId);
    }
    
    // --- SECURITY ENFORCEMENT END ---

    // Apply common filters (Date, Status)
    if (date) query = query.where('appointmentDate', '==', date);
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.get();
    
    // Enhance data with Patient/Doctor names
    const appointments = [];
    for (const doc of snapshot.docs) {
      const appt = doc.data();
      
      // Optional: Fetch names for display (Makes frontend faster)
      // You can keep this simple or expand it
      appointments.push({ id: doc.id, ...appt });
    }

    res.status(200).json({ success: true, count: appointments.length, data: appointments });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... keep createAppointment, updateAppointment, etc. ...

module.exports = {
    getAppointments,
    // ... export others
};
// @desc    Get single appointment
// @route   GET /api/appointments/:id
const getAppointmentById = async (req, res) => {
  try {
    const doc = await db.collection('appointments').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Appointment Status (e.g., Cancel, Complete)
// @route   PATCH /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed', 'Completed', 'Cancelled', 'No Show'
    
    await db.collection('appointments').doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: `Appointment status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus
};