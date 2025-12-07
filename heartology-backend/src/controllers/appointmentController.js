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

// @desc    Get appointments (Filter by Doctor, Patient, or Date)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let query = db.collection('appointments');

    // Filters: Allow frontend to ask for "My Appointments"
    if (req.query.doctorId) {
      query = query.where('doctorId', '==', req.query.doctorId);
    }
    if (req.query.patientId) {
      query = query.where('patientId', '==', req.query.patientId);
    }
    if (req.query.date) {
      query = query.where('appointmentDate', '==', req.query.date);
    }

    const snapshot = await query.get();
    const appointments = [];

    // Manually fetch Patient and Doctor names for display
    // This loops through results to attach "patientName" and "doctorName"
    for (const doc of snapshot.docs) {
      const appt = doc.data();
      
      // Get Patient Name
      let patientName = 'Unknown';
      if (appt.patientId) {
        const pDoc = await db.collection('patients').doc(appt.patientId).get();
        if (pDoc.exists) {
            // We need to jump to the User collection to get the name
            const uDoc = await db.collection('users').doc(pDoc.data().userId).get();
            if (uDoc.exists) patientName = `${uDoc.data().firstName} ${uDoc.data().lastName}`;
        }
      }

      appointments.push({
        id: doc.id,
        ...appt,
        patientName // Added for frontend convenience
      });
    }

    // Sort by Date/Time (Javascript sort since Firestore sorting has limitations with multiple filters)
    appointments.sort((a, b) => {
        return new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`);
    });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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