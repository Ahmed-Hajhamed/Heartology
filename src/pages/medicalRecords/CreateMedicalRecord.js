import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const CreateMedicalRecord = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentId: '',
    recordType: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    subjective: '',
    assessment: '',
    icd10Code: '',
    prescriptionId: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating medical record:', formData);
    navigate('/medical-records');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Medical Record</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Basic Information">
          <div className="form-grid">
            <FormField
              label="Patient"
              type="select"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              options={[
                { value: '1', label: 'John Doe' },
                { value: '2', label: 'Jane Smith' },
                { value: '3', label: 'Robert Johnson' }
              ]}
              required
            />

            <FormField
              label="Doctor"
              type="select"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={[
                { value: '1', label: 'Dr. Sarah Johnson' },
                { value: '2', label: 'Dr. Michael Brown' },
                { value: '3', label: 'Dr. Emily Davis' }
              ]}
              required
            />

            <FormField
              label="Related Appointment (Optional)"
              type="select"
              name="appointmentId"
              value={formData.appointmentId}
              onChange={handleChange}
              options={[
                { value: '', label: 'No appointment' },
                { value: '1', label: 'Appointment #1 - 2025-12-10' },
                { value: '2', label: 'Appointment #2 - 2025-12-15' }
              ]}
            />

            <FormField
              label="Record Type"
              type="select"
              name="recordType"
              value={formData.recordType}
              onChange={handleChange}
              options={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'test_result', label: 'Test Result' },
                { value: 'procedure', label: 'Procedure' },
                { value: 'diagnosis', label: 'Diagnosis' }
              ]}
              required
            />
          </div>
        </Card>

        <Card title="Vital Signs">
          <div className="form-grid">
            <FormField
              label="Blood Pressure (e.g., 120/80)"
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              placeholder="120/80"
            />

            <FormField
              label="Heart Rate (bpm)"
              type="number"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleChange}
              placeholder="75"
            />

            <FormField
              label="Temperature (°C)"
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              placeholder="36.5"
              step="0.1"
            />

            <FormField
              label="Oxygen Saturation (%)"
              type="number"
              name="oxygenSaturation"
              value={formData.oxygenSaturation}
              onChange={handleChange}
              placeholder="98"
            />

            <FormField
              label="Respiratory Rate (breaths/min)"
              type="number"
              name="respiratoryRate"
              value={formData.respiratoryRate}
              onChange={handleChange}
              placeholder="16"
            />
          </div>
        </Card>

        <Card title="Clinical Information">
          <FormField
            label="Subjective (Patient's Complaints)"
            type="textarea"
            name="subjective"
            value={formData.subjective}
            onChange={handleChange}
            placeholder="Describe patient's complaints and symptoms"
            required
          />

          <FormField
            label="Assessment (Diagnosis)"
            type="textarea"
            name="assessment"
            value={formData.assessment}
            onChange={handleChange}
            placeholder="Enter diagnosis and assessment"
            required
          />

          <div className="form-grid">
            <FormField
              label="ICD-10 Code (Optional)"
              type="text"
              name="icd10Code"
              value={formData.icd10Code}
              onChange={handleChange}
              placeholder="e.g., I10"
            />

            <FormField
              label="Prescription ID (Optional)"
              type="text"
              name="prescriptionId"
              value={formData.prescriptionId}
              onChange={handleChange}
              placeholder="Link to prescription"
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Create Record</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;
