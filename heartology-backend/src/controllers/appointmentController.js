const { db } = require('../config/firebase');
const https = require('https');
const http = require('http');
const { assignScanToPatient } = require('../services/RadiologyService');

// Predefined scan codes corresponding to the 20 MRI scans in Orthanc
const VALID_SCAN_CODES = [
  'A0S9V9', 'A1D0Q7', 'A1D9Z7', 'A1E9Q1', 'A1K2P5',
  'A1O8Z3', 'A2C0I1', 'A2E3W4', 'A2H5K9', 'A2L1N6',
  'A2N8V0', 'A3B7E5', 'A3H1O5', 'A3H5R1', 'A3P9V7',
  'A4A8V9', 'A4B5U4', 'A4B9O6', 'A4J4S4', 'A4K8R4'
];

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
      reasonForVisit,
      requiredScanCode  // Scan code like "A0S9V9" that doctor specifies
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
      // Scan-related fields
      requiredScanCode: requiredScanCode || null,  // Code like "A0S9V9"
      scanStudyInstanceUID: null,  // Will be set when scan is completed
      scanStudyId: null,  // Orthanc study ID
      scanStatus: requiredScanCode ? 'pending' : null,  // 'pending', 'completed', null
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

    const appointmentData = doc.data();
    
    // Update appointment status
    await apptRef.update({ status });

    let invoiceCreated = false;
    
    // If status is being set to 'Completed', automatically create an invoice
    if (status === 'Completed') {
      console.log(`Appointment ${id} marked as completed. Checking for existing invoice...`);
      
      // Check if invoice already exists for this appointment
      const existingInvoiceQuery = await db.collection('invoices')
        .where('appointmentId', '==', id)
        .get();
      
      if (existingInvoiceQuery.empty) {
        console.log(`No existing invoice found. Creating new invoice for appointment ${id}...`);
        
        // Create a new invoice for the completed appointment
        const invoiceData = {
          appointmentId: id,
          patientId: appointmentData.patientId,
          items: [
            {
              description: `${appointmentData.type || 'Consultation'} - ${appointmentData.reasonForVisit || 'Medical consultation'}`,
              quantity: 1,
              unitPrice: 150.00, // Default consultation fee
              amount: 150.00
            }
          ],
          subtotal: 150.00,
          tax: 15.00,
          totalAmount: 165.00,
          status: 'Pending',
          invoiceDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          createdAt: new Date().toISOString()
        };

        const invoiceRef = await db.collection('invoices').add(invoiceData);
        invoiceCreated = true;
        console.log(`Invoice ${invoiceRef.id} created successfully for appointment ${id}`);
      } else {
        console.log(`Invoice already exists for appointment ${id}`);
      }
    }

    const message = status === 'Completed' && invoiceCreated 
      ? 'Appointment marked as completed and invoice generated successfully!'
      : `Appointment status updated to ${status}`;

    res.status(200).json({ 
      success: true, 
      message,
      data: { id, ...appointmentData, status } 
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment (general update endpoint)
// @route   PATCH /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const apptRef = db.collection('appointments').doc(id);
    const doc = await apptRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Security check: Ensure user is allowed to update this appointment
    const appointment = doc.data();
    if (req.user.role === 'patient') {
      const pQuery = await db.collection('patients').where('userId', '==', req.user.id).get();
      if (pQuery.empty || appointment.patientId !== pQuery.docs[0].id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
      }
    } else if (req.user.role === 'doctor') {
      const dQuery = await db.collection('doctors').where('userId', '==', req.user.id).get();
      if (dQuery.empty || appointment.doctorId !== dQuery.docs[0].id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update the appointment
    await apptRef.update(updateData);

    // Fetch updated appointment
    const updatedDoc = await apptRef.get();
    const updatedAppointment = { id: updatedDoc.id, ...updatedDoc.data() };

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Link scan to appointment (called when scan is completed in radiology)
// @route   PATCH /api/appointments/:id/link-scan
// @access  Private (Staff/Admin/Radiology)
const linkScanToAppointment = async (req, res) => {
  try {
    const { scanStudyInstanceUID, scanStudyId, scanCode } = req.body;
    const { id } = req.params;

    if (!scanStudyInstanceUID && !scanStudyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either scanStudyInstanceUID or scanStudyId' 
      });
    }

    const apptRef = db.collection('appointments').doc(id);
    const doc = await apptRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = doc.data();

    // Optional: Verify scan code matches if provided
    if (scanCode && appointment.requiredScanCode && scanCode !== appointment.requiredScanCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scan code does not match the required scan code for this appointment' 
      });
    }

    // Update appointment with scan information
    const updateData = {
      scanStudyInstanceUID: scanStudyInstanceUID || null,
      scanStudyId: scanStudyId || null,
      scanStatus: 'completed',
      scanLinkedAt: new Date().toISOString()
    };

    await apptRef.update(updateData);

    res.status(200).json({ 
      success: true, 
      message: 'Scan linked to appointment successfully',
      data: { id, ...appointment, ...updateData } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign scan to appointment (for doctors to assign a scan when viewing appointment)
// @route   PATCH /api/appointments/:id/assign-scan
// @access  Private (Doctor)
const assignScanToAppointment = async (req, res) => {
  try {
    const { scanStudyInstanceUID, scanStudyId, scanCode } = req.body;
    const { id } = req.params;

    if (!scanStudyInstanceUID && !scanStudyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either scanStudyInstanceUID or scanStudyId' 
      });
    }

    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors can assign scans to appointments' 
      });
    }

    const apptRef = db.collection('appointments').doc(id);
    const doc = await apptRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = doc.data();

    // Verify the doctor owns this appointment
    const doctorQuery = await db.collection('doctors').where('userId', '==', req.user.id).get();
    if (doctorQuery.empty || appointment.doctorId !== doctorQuery.docs[0].id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only assign scans to your own appointments' 
      });
    }

    // Determine the scan code - must be provided or match study ID
    let finalScanCode = scanCode || appointment.requiredScanCode;
    
    // If scan code is provided in request, use it
    if (scanCode) {
      // Validate that the scan code is one of the valid codes
      if (!VALID_SCAN_CODES.includes(scanCode)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid scan code. Must be one of: ${VALID_SCAN_CODES.join(', ')}` 
        });
      }
      finalScanCode = scanCode;
    } else if (scanStudyId && VALID_SCAN_CODES.includes(scanStudyId)) {
      // If study ID matches a valid code, use it
      finalScanCode = scanStudyId;
    } else if (!finalScanCode) {
      // If no scan code exists and can't be determined, require it
      return res.status(400).json({ 
        success: false, 
        message: 'Scan code is required. Please provide one of the valid scan codes.',
        validCodes: VALID_SCAN_CODES
      });
    }
    
    // Final validation
    if (!VALID_SCAN_CODES.includes(finalScanCode)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid scan code. Must be one of: ${VALID_SCAN_CODES.join(', ')}` 
      });
    }

    // Update appointment with scan information
    const updateData = {
      scanStudyInstanceUID: scanStudyInstanceUID || null,
      scanStudyId: scanStudyId || null,
      requiredScanCode: finalScanCode,
      scanStatus: 'completed',
      scanLinkedAt: new Date().toISOString(),
      scanAssignedBy: req.user.id,
      scanAssignedAt: new Date().toISOString()
    };

    await apptRef.update(updateData);

    res.status(200).json({ 
      success: true, 
      message: 'Scan assigned to appointment successfully',
      data: { id, ...appointment, ...updateData } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to make HTTP requests
const makeHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// @desc    Get all available studies from Orthanc
// @route   GET /api/appointments/available-scans
// @access  Private (Doctor)
const getAvailableScans = async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors can view available scans' 
      });
    }

    const orthancUrl = process.env.ORTHANC_URL || 'http://localhost:8042';
    
    try {
      // Fetch all studies from Orthanc
      const studies = await makeHttpRequest(`${orthancUrl}/studies?expand`);
      
      // Get all appointments to check which scan codes are already used
      const appointmentsSnapshot = await db.collection('appointments').get();
      const usedScanCodes = new Set();
      appointmentsSnapshot.forEach(doc => {
        const apt = doc.data();
        if (apt.requiredScanCode && VALID_SCAN_CODES.includes(apt.requiredScanCode)) {
          usedScanCodes.add(apt.requiredScanCode);
        }
      });
      
      // Format studies for frontend and match them to valid scan codes
      const formattedStudies = studies.map(study => {
        // Try to match the study ID to a valid scan code
        // The study ID in Orthanc should match one of the scan code directory names
        let matchedScanCode = null;
        if (VALID_SCAN_CODES.includes(study.ID)) {
          matchedScanCode = study.ID;
        }
        
        return {
          id: study.ID,
          studyInstanceUID: study.MainDicomTags?.StudyInstanceUID || study.ID,
          studyDate: study.MainDicomTags?.StudyDate,
          studyTime: study.MainDicomTags?.StudyTime,
          modality: study.MainDicomTags?.ModalitiesInStudy?.[0] || 'Unknown',
          studyDescription: study.MainDicomTags?.StudyDescription || 'No description',
          patientName: study.PatientMainDicomTags?.PatientName || 'Unknown',
          patientId: study.PatientMainDicomTags?.PatientID || 'Unknown',
          numberOfSeries: study.Series?.length || 0,
          numberOfInstances: study.Series?.reduce((sum, series) => sum + (series.Instances?.length || 0), 0) || 0,
          matchedScanCode: matchedScanCode // The scan code that matches this study
        };
      });

      // Create list of available and used scan codes
      const availableScanCodes = VALID_SCAN_CODES.filter(code => !usedScanCodes.has(code));
      const usedScanCodesList = Array.from(usedScanCodes);

      res.status(200).json({ 
        success: true, 
        count: formattedStudies.length,
        data: formattedStudies,
        validScanCodes: VALID_SCAN_CODES, // All valid codes
        availableScanCodes: availableScanCodes, // Codes not yet assigned
        usedScanCodes: usedScanCodesList // Codes already assigned
      });
    } catch (orthancError) {
      console.error('Error fetching from Orthanc:', orthancError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch scans from Orthanc. Make sure Orthanc is running and accessible.',
        error: orthancError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark radiology order as paid/completed
// @route   PATCH /api/appointments/:id/radiology-order/pay
// @access  Private (Patient/Staff/Admin)
const markRadiologyOrderAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const apptRef = db.collection('appointments').doc(id);
    const doc = await apptRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = doc.data();

    // Check if radiology order exists
    if (!appointment.radiologyOrder || appointment.radiologyOrder.status !== 'ordered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Radiology order not found or already completed' 
      });
    }

    // 1. Get patient information (firstName, lastName)
    const patientDoc = await db.collection('patients').doc(appointment.patientId).get();
    if (!patientDoc.exists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patientData = patientDoc.data();
    const userDoc = await db.collection('users').doc(patientData.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found for patient' });
    }

    const userData = userDoc.data();
    const patientFullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    
    if (!patientFullName) {
      return res.status(400).json({ success: false, message: 'Patient name not found' });
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
      return res.status(500).json({ success: false, message: 'Failed to select template scan' });
    }

    // 3. Call assignScanToPatient to create a new study with patient's metadata
    // Attempt assignment, but fallback to template or stored pacsStudyId on failure
    let newStudyInstanceUid = appointment.radiologyOrder?.pacsStudyId || templateStudyUid;
    let assignmentFailed = false;
    let assignmentErrorMsg = null;

    try {
      const assignedUid = await assignScanToPatient(templateStudyUid, {
        fullName: patientFullName,
        id: patientDoc.id
      });

      if (assignedUid) newStudyInstanceUid = assignedUid;
    } catch (error) {
      console.error('Error assigning scan to patient:', error);
      assignmentFailed = true;
      assignmentErrorMsg = error.message || String(error);
      // Continue - we will use fallback UID to allow viewing
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

    // Fetch updated appointment
    const updatedDoc = await apptRef.get();
    const updatedAppointment = { id: updatedDoc.id, ...updatedDoc.data() };

    res.status(200).json({
      success: true,
      message: 'Radiology order marked as paid and completed. Scan assigned to patient.',
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Mark Radiology Order Paid Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  linkScanToAppointment,
  assignScanToAppointment,
  getAvailableScans,
  markRadiologyOrderAsPaid
};