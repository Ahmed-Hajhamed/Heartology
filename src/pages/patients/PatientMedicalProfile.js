import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import '../../styles/pages/PatientMedicalProfile.css';

const PatientMedicalProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bloodType: 'A+',
    height: '175',
    weight: '75',
    allergies: 'Penicillin, Peanuts',
    currentMedications: 'Aspirin 75mg, Atorvastatin 20mg',
    emergencyContactName: 'Jane Doe',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '+1234567899',
    insuranceProvider: 'Blue Cross Blue Shield',
    policyNumber: 'POL123456789',
    groupNumber: 'GRP987654321'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated medical profile:', formData);
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Profile</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Medical Information">
          <div className="form-grid">
            <FormField
              label="Blood Type"
              type="select"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]}
              required
            />

            <FormField
              label="Height (cm)"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />

            <FormField
              label="Weight (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>

          <FormField
            label="Allergies (comma-separated)"
            type="textarea"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="Enter allergies separated by commas"
          />

          <FormField
            label="Current Medications (comma-separated)"
            type="textarea"
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            placeholder="Enter current medications separated by commas"
          />
        </Card>

        <Card title="Emergency Contact">
          <div className="form-grid">
            <FormField
              label="Name"
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              required
            />

            <FormField
              label="Relationship"
              type="text"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              required
            />

            <FormField
              label="Phone"
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        <Card title="Insurance Information">
          <div className="form-grid">
            <FormField
              label="Insurance Provider"
              type="text"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleChange}
              required
            />

            <FormField
              label="Policy Number"
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              required
            />

            <FormField
              label="Group Number"
              type="text"
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default PatientMedicalProfile;
