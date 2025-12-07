import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import '../../styles/pages/PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatient(response.data.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        alert("Failed to load patient details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  if (loading) return <div className="page-container">Loading details...</div>;
  if (!patient) return <div className="page-container">Patient not found.</div>;

  // Helper to safely access nested data
  const personal = patient.personalInfo || {};
  const insurance = patient.insurance || {};
  const emergency = patient.emergencyContact || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/patients/${patientId}/medical-profile`)}>Edit Profile</Button>
        </div>
      </div>

      <div className="details-grid">
        {/* Personal Information */}
        <Card title="Personal Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{personal.firstName} {personal.lastName}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{personal.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{personal.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>SSN:</label>
              <span>{patient.ssn}</span>
            </div>
            {/* Note: If address/gender/dob are missing, it's because we need to add them to the Patient Controller response. 
                For now, we handle them gracefully. */}
            <div className="info-item">
              <label>Gender:</label>
              <span>{personal.gender || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Medical Profile */}
        <Card title="Medical Profile">
          <div className="info-grid">
            <div className="info-item">
              <label>Blood Type:</label>
              <span className="tag tag-info">{patient.bloodType || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Allergies:</label>
              <span>{patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}</span>
            </div>
            <div className="info-item">
              <label>Chronic Conditions:</label>
              <span>{patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'None'}</span>
            </div>
            <div className="info-item">
              <label>Smoking Status:</label>
              <span>{patient.smokingStatus || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact">
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{emergency.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Relationship:</label>
              <span>{emergency.relationship || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{emergency.phone || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Insurance Information */}
        <Card title="Insurance Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Provider:</label>
              <span>{insurance.provider || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Policy Number:</label>
              <span>{insurance.policyNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Expiry Date:</label>
              <span>{insurance.expiryDate ? new Date(insurance.expiryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/appointments/book?patientId=${patient.id}`)}>Book Appointment</Button>
          <Button variant="secondary" onClick={() => navigate(`/medical-records?patientId=${patient.id}`)}>View Medical Records</Button>
          <Button variant="secondary" onClick={() => navigate(`/billing/invoices?patientId=${patient.id}`)}>View Invoices</Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientDetails;