import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Layout Components
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

// User Management Pages
import UserList from './pages/users/UserList';
import UserProfile from './pages/users/UserProfile';

// Patient Pages
import PatientList from './pages/patients/PatientList';
import PatientDetails from './pages/patients/PatientDetails';
import PatientMedicalProfile from './pages/patients/PatientMedicalProfile';

// Doctor Pages
import DoctorList from './pages/doctors/DoctorList';
import DoctorDetails from './pages/doctors/DoctorDetails';
import DoctorSchedule from './pages/doctors/DoctorSchedule';

// Appointment Pages
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentBooking from './pages/appointments/AppointmentBooking';
import AppointmentDetails from './pages/appointments/AppointmentDetails';

// Medical Records Pages
import MedicalRecordList from './pages/medicalRecords/MedicalRecordList';
import MedicalRecordDetails from './pages/medicalRecords/MedicalRecordDetails';
import CreateMedicalRecord from './pages/medicalRecords/CreateMedicalRecord';

// Prescription Pages
import PrescriptionList from './pages/prescriptions/PrescriptionList';
import CreatePrescription from './pages/prescriptions/CreatePrescription';
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails';

// Radiology Pages
import RadiologyList from './pages/radiology/RadiologyList';
import RadiologyUpload from './pages/radiology/RadiologyUpload';
import RadiologyViewer from './pages/radiology/RadiologyViewer';
import CdssAnalysis from './pages/radiology/CdssAnalysis';

// Billing Pages
import InvoiceList from './pages/billing/InvoiceList';
import CreateInvoice from './pages/billing/CreateInvoice';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import PaymentProcessing from './pages/billing/PaymentProcessing';

// ICD-10 Pages
import Icd10Lookup from './pages/icd10/Icd10Lookup';

function App() {
  // Mock authentication state (replace with actual auth logic)
  const [user, setUser] = useState(null);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
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
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard/patient" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/doctor" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />

          {/* User Management Routes */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route path="/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
          <Route path="/patients/create" element={<ProtectedRoute allowedRoles={['patient']}><PatientMedicalProfile /></ProtectedRoute>} />
          <Route path="/patients/:patientId" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
          <Route path="/patients/:patientId/medical-profile" element={<ProtectedRoute><PatientMedicalProfile /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
          <Route path="/doctors/:doctorId" element={<ProtectedRoute><DoctorDetails /></ProtectedRoute>} />
          <Route path="/doctors/:doctorId/schedule" element={<ProtectedRoute><DoctorSchedule /></ProtectedRoute>} />

          {/* Appointment Routes */}
          <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
          <Route path="/appointments/book" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
          <Route path="/appointments/:appointmentId" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />

          {/* Medical Records Routes */}
          <Route path="/medical-records" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><MedicalRecordList /></ProtectedRoute>} />
          <Route path="/medical-records/create" element={<ProtectedRoute allowedRoles={['doctor']}><CreateMedicalRecord /></ProtectedRoute>} />
          <Route path="/medical-records/:recordId" element={<ProtectedRoute><MedicalRecordDetails /></ProtectedRoute>} />

          {/* Prescription Routes */}
          <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionList /></ProtectedRoute>} />
          <Route path="/prescriptions/create" element={<ProtectedRoute allowedRoles={['doctor']}><CreatePrescription /></ProtectedRoute>} />
          <Route path="/prescriptions/:prescriptionId" element={<ProtectedRoute><PrescriptionDetails /></ProtectedRoute>} />

          {/* Radiology Routes */}
          <Route path="/radiology" element={<ProtectedRoute><RadiologyList /></ProtectedRoute>} />
          <Route path="/radiology/upload" element={<ProtectedRoute allowedRoles={['doctor', 'staff']}><RadiologyUpload /></ProtectedRoute>} />
          <Route path="/radiology/:imageId" element={<ProtectedRoute><RadiologyViewer /></ProtectedRoute>} />
          <Route path="/radiology/:imageId/analysis" element={<ProtectedRoute allowedRoles={['doctor']}><CdssAnalysis /></ProtectedRoute>} />

          {/* Billing Routes */}
          <Route path="/billing/invoices" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><InvoiceList /></ProtectedRoute>} />
          <Route path="/billing/invoices/create" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><CreateInvoice /></ProtectedRoute>} />
          <Route path="/billing/invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
          <Route path="/billing/payment/:invoiceId" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />

          {/* ICD-10 Routes */}
          <Route path="/icd10" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><Icd10Lookup /></ProtectedRoute>} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<div className="unauthorized">Unauthorized Access</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
