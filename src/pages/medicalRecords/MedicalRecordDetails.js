import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const MedicalRecordDetails = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const recordData = {
    recordId: recordId,
    patientName: 'John Doe',
    patientId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorId: '1',
    appointmentId: '1',
    recordType: 'consultation',
    date: '2025-12-05',
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 75,
      temperature: 36.6,
      oxygenSaturation: 98,
      respiratoryRate: 16
    },
    subjective: 'Patient complains of chest pain and irregular heartbeat. Symptoms started 2 days ago.',
    assessment: 'Possible hypertension and arrhythmia. Requires further testing.',
    icd10Code: 'I10',
    prescriptionId: 'RX123'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Record Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/prescriptions/${recordData.prescriptionId}`)}>View Prescription</Button>
        </div>
      </div>

      <div className="details-grid">
        <Card title="Record Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Record ID:</label>
              <span>{recordData.recordId}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span className="tag tag-info">{recordData.recordType}</span>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <span>{recordData.date}</span>
            </div>
            <div className="info-item">
              <label>Patient:</label>
              <span>{recordData.patientName}</span>
            </div>
            <div className="info-item">
              <label>Doctor:</label>
              <span>{recordData.doctorName}</span>
            </div>
            <div className="info-item">
              <label>ICD-10 Code:</label>
              <span className="tag tag-primary">{recordData.icd10Code}</span>
            </div>
          </div>
        </Card>

        <Card title="Vital Signs">
          <div className="vital-signs-grid">
            <div className="vital-item">
              <div className="vital-icon">❤️</div>
              <div className="vital-info">
                <label>Blood Pressure</label>
                <span className="vital-value">{recordData.vitalSigns.bloodPressure}</span>
              </div>
            </div>
            <div className="vital-item">
              <div className="vital-icon">💓</div>
              <div className="vital-info">
                <label>Heart Rate</label>
                <span className="vital-value">{recordData.vitalSigns.heartRate} bpm</span>
              </div>
            </div>
            <div className="vital-item">
              <div className="vital-icon">🌡️</div>
              <div className="vital-info">
                <label>Temperature</label>
                <span className="vital-value">{recordData.vitalSigns.temperature} °C</span>
              </div>
            </div>
            <div className="vital-item">
              <div className="vital-icon">💨</div>
              <div className="vital-info">
                <label>Oxygen Saturation</label>
                <span className="vital-value">{recordData.vitalSigns.oxygenSaturation}%</span>
              </div>
            </div>
            <div className="vital-item">
              <div className="vital-icon">🫁</div>
              <div className="vital-info">
                <label>Respiratory Rate</label>
                <span className="vital-value">{recordData.vitalSigns.respiratoryRate} /min</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Subjective (Patient's Complaints)">
          <p className="clinical-text">{recordData.subjective}</p>
        </Card>

        <Card title="Assessment (Diagnosis)">
          <p className="clinical-text">{recordData.assessment}</p>
        </Card>
      </div>

      <Card title="Related Records">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/patients/${recordData.patientId}`)}>View Patient Profile</Button>
          <Button variant="secondary" onClick={() => navigate(`/doctors/${recordData.doctorId}`)}>View Doctor Profile</Button>
          <Button variant="secondary" onClick={() => navigate(`/appointments/${recordData.appointmentId}`)}>View Appointment</Button>
          <Button variant="secondary" onClick={() => navigate(`/icd10?code=${recordData.icd10Code}`)}>View ICD-10 Details</Button>
        </div>
      </Card>
    </div>
  );
};

export default MedicalRecordDetails;
