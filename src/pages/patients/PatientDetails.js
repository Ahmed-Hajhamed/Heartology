import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import '../../styles/pages/PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Mock data
  const patientData = {
    patientId: patientId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    ssn: '***-**-1234',
    birthDate: '1985-05-15',
    gender: 'male',
    address: '123 Main St, City, State 12345',
    medicalProfile: {
      bloodType: 'A+',
      height: 175,
      weight: 75,
      allergies: ['Penicillin', 'Peanuts'],
      currentMedications: ['Aspirin 75mg', 'Atorvastatin 20mg'],
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567899'
      }
    },
    insuranceInfo: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'POL123456789',
      groupNumber: 'GRP987654321'
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/patients/${patientId}/medical-profile`)}>Edit Medical Profile</Button>
        </div>
      </div>

      <div className="patient-details-grid">
        <Card title="Personal Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Patient ID:</label>
              <span>{patientData.patientId}</span>
            </div>
            <div className="info-item">
              <label>Full Name:</label>
              <span>{patientData.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{patientData.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{patientData.phone}</span>
            </div>
            <div className="info-item">
              <label>SSN:</label>
              <span>{patientData.ssn}</span>
            </div>
            <div className="info-item">
              <label>Birth Date:</label>
              <span>{patientData.birthDate}</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{patientData.gender}</span>
            </div>
            <div className="info-item">
              <label>Address:</label>
              <span>{patientData.address}</span>
            </div>
          </div>
        </Card>

        <Card title="Medical Profile">
          <div className="info-grid">
            <div className="info-item">
              <label>Blood Type:</label>
              <span className="blood-type">{patientData.medicalProfile.bloodType}</span>
            </div>
            <div className="info-item">
              <label>Height:</label>
              <span>{patientData.medicalProfile.height} cm</span>
            </div>
            <div className="info-item">
              <label>Weight:</label>
              <span>{patientData.medicalProfile.weight} kg</span>
            </div>
            <div className="info-item full-width">
              <label>Allergies:</label>
              <div className="tag-list">
                {patientData.medicalProfile.allergies.map((allergy, index) => (
                  <span key={index} className="tag tag-danger">{allergy}</span>
                ))}
              </div>
            </div>
            <div className="info-item full-width">
              <label>Current Medications:</label>
              <div className="tag-list">
                {patientData.medicalProfile.currentMedications.map((med, index) => (
                  <span key={index} className="tag tag-info">{med}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Emergency Contact">
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{patientData.medicalProfile.emergencyContact.name}</span>
            </div>
            <div className="info-item">
              <label>Relationship:</label>
              <span>{patientData.medicalProfile.emergencyContact.relationship}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{patientData.medicalProfile.emergencyContact.phone}</span>
            </div>
          </div>
        </Card>

        <Card title="Insurance Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Provider:</label>
              <span>{patientData.insuranceInfo.provider}</span>
            </div>
            <div className="info-item">
              <label>Policy Number:</label>
              <span>{patientData.insuranceInfo.policyNumber}</span>
            </div>
            <div className="info-item">
              <label>Group Number:</label>
              <span>{patientData.insuranceInfo.groupNumber}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/appointments/book?patientId=${patientId}`)}>Book Appointment</Button>
          <Button variant="secondary" onClick={() => navigate(`/medical-records?patientId=${patientId}`)}>View Medical Records</Button>
          <Button variant="secondary" onClick={() => navigate(`/billing/invoices?patientId=${patientId}`)}>View Invoices</Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientDetails;
