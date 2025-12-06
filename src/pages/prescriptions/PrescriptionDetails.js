import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const PrescriptionDetails = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();

  const prescriptionData = {
    prescriptionId: prescriptionId,
    patientName: 'John Doe',
    patientId: '1',
    doctorName: 'Dr. Sarah Johnson',
    date: '2025-11-30',
    status: 'active',
    medications: [
      {
        name: 'Aspirin',
        dosage: '75mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food in the morning'
      },
      {
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take at bedtime'
      }
    ]
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Prescription Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => window.print()}>Print Prescription</Button>
        </div>
      </div>

      <Card title="Prescription Information">
        <div className="info-grid">
          <div className="info-item">
            <label>Prescription ID:</label>
            <span>{prescriptionData.prescriptionId}</span>
          </div>
          <div className="info-item">
            <label>Date Issued:</label>
            <span>{prescriptionData.date}</span>
          </div>
          <div className="info-item">
            <label>Patient:</label>
            <span>{prescriptionData.patientName}</span>
          </div>
          <div className="info-item">
            <label>Prescribing Doctor:</label>
            <span>{prescriptionData.doctorName}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status status-${prescriptionData.status}`}>{prescriptionData.status}</span>
          </div>
        </div>
      </Card>

      <Card title="Medications">
        {prescriptionData.medications.map((med, index) => (
          <div key={index} className="medication-card">
            <h4>{index + 1}. {med.name}</h4>
            <div className="medication-details">
              <div className="detail-row">
                <label>Dosage:</label>
                <span>{med.dosage}</span>
              </div>
              <div className="detail-row">
                <label>Frequency:</label>
                <span>{med.frequency}</span>
              </div>
              <div className="detail-row">
                <label>Duration:</label>
                <span>{med.duration}</span>
              </div>
              {med.instructions && (
                <div className="detail-row">
                  <label>Instructions:</label>
                  <span>{med.instructions}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/patients/${prescriptionData.patientId}`)}>View Patient Profile</Button>
          <Button variant="secondary" onClick={() => navigate('/medical-records')}>View Medical Records</Button>
        </div>
      </Card>
    </div>
  );
};

export default PrescriptionDetails;
