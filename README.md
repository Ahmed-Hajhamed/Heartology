# Heartology - Cardiology Center HIS

A comprehensive Hospital Information System (HIS) for cardiology centers, built with React, HTML, and CSS.

## 🏥 Overview

Heartology is a full-featured frontend application for managing cardiology center operations, including:
- Patient management and medical records
- Doctor scheduling and availability
- Appointment booking and management
- Prescription management
- Radiology imaging and CDSS analysis
- Billing and invoice processing
- ICD-10 diagnostic code lookup

## 📋 Features

### User Roles
- **Patient**: View appointments, medical records, prescriptions, and billing
- **Doctor**: Manage patients, create medical records, prescriptions, and review radiology scans
- **Admin**: Full system access, user management, and reporting
- **Staff**: Appointment booking, billing, and administrative tasks

### Core Modules
1. **User Management**: Registration, authentication, and profile management
2. **Patient Management**: Medical profiles, insurance info, emergency contacts
3. **Doctor Management**: Specializations, schedules, availability
4. **Appointment System**: Booking, scheduling, status tracking
5. **Medical Records**: Vital signs, diagnoses, ICD-10 codes, prescriptions
6. **Prescription Management**: Medication tracking, dosage, instructions
7. **Radiology & Imaging**: DICOM viewer, CT scans, ECG, MRI, CDSS analysis
8. **Billing System**: Invoice generation, payment processing, insurance claims
9. **ICD-10 Integration**: Diagnostic code lookup and reference

## 🗂️ Project Structure

```
Heartology/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── FormField.js
│   │   │   ├── Header.js
│   │   │   ├── Modal.js
│   │   │   ├── Sidebar.js
│   │   │   └── Table.js
│   │   └── layouts/
│   │       ├── AuthLayout.js
│   │       └── MainLayout.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── dashboards/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── PatientDashboard.js
│   │   │   └── StaffDashboard.js
│   │   ├── users/
│   │   │   ├── UserList.js
│   │   │   └── UserProfile.js
│   │   ├── patients/
│   │   │   ├── PatientList.js
│   │   │   ├── PatientDetails.js
│   │   │   └── PatientMedicalProfile.js
│   │   ├── doctors/
│   │   │   ├── DoctorList.js
│   │   │   ├── DoctorDetails.js
│   │   │   └── DoctorSchedule.js
│   │   ├── appointments/
│   │   │   ├── AppointmentList.js
│   │   │   ├── AppointmentBooking.js
│   │   │   └── AppointmentDetails.js
│   │   ├── medicalRecords/
│   │   │   ├── MedicalRecordList.js
│   │   │   ├── CreateMedicalRecord.js
│   │   │   └── MedicalRecordDetails.js
│   │   ├── prescriptions/
│   │   │   ├── PrescriptionList.js
│   │   │   ├── CreatePrescription.js
│   │   │   └── PrescriptionDetails.js
│   │   ├── radiology/
│   │   │   ├── RadiologyList.js
│   │   │   ├── RadiologyUpload.js
│   │   │   ├── RadiologyViewer.js
│   │   │   └── CdssAnalysis.js
│   │   ├── billing/
│   │   │   ├── InvoiceList.js
│   │   │   ├── CreateInvoice.js
│   │   │   ├── InvoiceDetails.js
│   │   │   └── PaymentProcessing.js
│   │   └── icd10/
│   │       └── Icd10Lookup.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ahmed-Hajhamed/Heartology.git
cd Heartology
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🎨 Design System

### Color Palette
- **Primary**: `#2c5f7c` (Cardiology Blue)
- **Secondary**: `#d9534f` (Medical Red)
- **Success**: `#5cb85c`
- **Warning**: `#f0ad4e`
- **Danger**: `#d9534f`
- **Info**: `#5bc0de`

### Typography
- Font Family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto')
- Headings: 600 weight
- Body: 400 weight

### Components
- **Buttons**: Primary, Secondary, Success, Warning, Danger
- **Cards**: Information containers with headers and actions
- **Tables**: Data display with sorting and filtering
- **Forms**: Input fields, selects, textareas with validation
- **Modals**: Dialog boxes for confirmations

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔐 Authentication

### Mock Login Credentials
The application uses mock authentication. Any email and password will work for demonstration purposes.

Default roles available:
- Patient
- Doctor
- Admin
- Staff

## 📊 Database Schema

The application follows the provided ER diagram with collections for:
- Users (SSN, email, role, personal info)
- Patients (medical profile, insurance)
- Doctors (specialization, schedule, qualifications)
- Appointments (scheduling, status)
- Medical Records (vital signs, diagnoses, ICD-10)
- Prescriptions (medications, status)
- Radiology Scans (DICOM, imaging studies)
- CDSS Analysis (AI findings, confidence scores)
- Invoices (billing, payments)
- ICD-10 Codes (diagnostic references)

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **Styling**: Pure CSS with CSS Variables
- **Build Tool**: Create React App

## 📝 Naming Conventions

- **Components/Files**: PascalCase (e.g., `PatientList.js`, `UserProfile.js`)
- **Props/State**: camelCase (e.g., `patientId`, `isLoading`)
- **CSS Classes**: kebab-case (e.g., `patient-list`, `form-field`)

## 🔄 Future Enhancements

- Backend API integration
- Real authentication and authorization
- DICOM viewer library integration (Cornerstone.js)
- Real-time notifications
- Data visualization and reporting
- Export functionality (PDF, Excel)
- Multi-language support
- Dark mode theme

## 👥 Contributing

This is a frontend demonstration project. For production use:
1. Integrate with a backend API
2. Add proper authentication/authorization
3. Implement data validation
4. Add error handling
5. Include unit and integration tests

## 📄 License

This project is created for educational and demonstration purposes.

## 🤝 Support

For questions or support, please contact the development team.

---

**Built with ❤️ for Heartology Cardiology Center**