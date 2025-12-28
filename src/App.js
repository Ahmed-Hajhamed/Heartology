import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';

// Features
import UserList from './pages/users/UserList';
import UserProfile from './pages/users/UserProfile';
import PatientList from './pages/patients/PatientList';
import PatientDetails from './pages/patients/PatientDetails';
import PatientMedicalProfile from './pages/patients/PatientMedicalProfile';
import DoctorList from './pages/doctors/DoctorList';
import DoctorDetails from './pages/doctors/DoctorDetails';
import DoctorSchedule from './pages/doctors/DoctorSchedule';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentBooking from './pages/appointments/AppointmentBooking';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import MedicalRecordList from './pages/medicalRecords/MedicalRecordList';
import CreateMedicalRecord from './pages/medicalRecords/CreateMedicalRecord';
import MedicalRecordDetails from './pages/medicalRecords/MedicalRecordDetails';
import PrescriptionList from './pages/prescriptions/PrescriptionList';
import CreatePrescription from './pages/prescriptions/CreatePrescription';
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails';
import InvoiceList from './pages/billing/InvoiceList';
import CreateInvoice from './pages/billing/CreateInvoice';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import PaymentProcessing from './pages/billing/PaymentProcessing';
import Icd10Lookup from './pages/icd10/Icd10Lookup';
import RadiologyList from './pages/radiology/RadiologyList';
import RadiologyViewer from './pages/radiology/RadiologyViewer';
import RadiologyWorkspace from './pages/radiology/RadiologyWorkspace';
import Reports from './pages/reports/Reports';

function App() {
  // --- THE FIX IS HERE ---
  // Instead of useState(null), we check localStorage first
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const ProtectedRoute = ({ children, allowedRoles }) => {
    // Check both state and localStorage to avoid race condition
    // This ensures we don't redirect immediately after login before state updates
    let currentUser = user;
    if (!currentUser) {
      const savedUser = localStorage.getItem('user');
      currentUser = savedUser ? JSON.parse(savedUser) : null;
    }

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout user={user} setUser={setUser} />}>

          {/* Dashboards */}
          <Route path="/dashboard/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />

          {/* User Management */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><UserList /></ProtectedRoute>} />
          <Route path="/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Patients */}
          <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
          <Route path="/patients/create" element={<ProtectedRoute allowedRoles={['patient']}><PatientMedicalProfile /></ProtectedRoute>} />
          <Route path="/patients/:patientId" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
          <Route path="/patients/:patientId/medical-profile" element={<ProtectedRoute><PatientMedicalProfile /></ProtectedRoute>} />

          {/* Doctors */}
          <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
          <Route path="/doctors/:doctorId" element={<ProtectedRoute><DoctorDetails /></ProtectedRoute>} />
          <Route path="/doctors/:doctorId/schedule" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />

          {/* Appointments */}
          <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
          <Route path="/appointments/book" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
          <Route path="/appointments/:appointmentId" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />

          {/* Medical Records */}
          <Route path="/medical-records" element={<ProtectedRoute><MedicalRecordList /></ProtectedRoute>} />
          <Route path="/medical-records/create" element={<ProtectedRoute allowedRoles={['doctor']}><CreateMedicalRecord /></ProtectedRoute>} />
          <Route path="/medical-records/:recordId" element={<ProtectedRoute><MedicalRecordDetails /></ProtectedRoute>} />

          {/* Prescriptions */}
          <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionList /></ProtectedRoute>} />
          <Route path="/prescriptions/create" element={<ProtectedRoute allowedRoles={['doctor']}><CreatePrescription /></ProtectedRoute>} />
          <Route path="/prescriptions/:prescriptionId" element={<ProtectedRoute><PrescriptionDetails /></ProtectedRoute>} />

          {/* Billing */}
          <Route path="/billing/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/billing/invoices/create" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><CreateInvoice /></ProtectedRoute>} />
          <Route path="/billing/invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
          <Route path="/billing/payment/:invoiceId" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />

          {/* Tools */}
          <Route path="/icd10" element={<ProtectedRoute><Icd10Lookup /></ProtectedRoute>} />
          
          {/* Radiology */}
          <Route path="/radiology" element={<ProtectedRoute><RadiologyList /></ProtectedRoute>} />
          <Route path="/radiology/:studyId" element={<ProtectedRoute><RadiologyViewer /></ProtectedRoute>} />
          <Route path="/radiology/workspace/:pacsStudyId" element={<ProtectedRoute><RadiologyWorkspace /></ProtectedRoute>} />
          
          {/* Reports */}
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Reports /></ProtectedRoute>} />
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<div style={{ padding: '20px' }}>Unauthorized Access</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;