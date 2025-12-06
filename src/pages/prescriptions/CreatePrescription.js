import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const CreatePrescription = () => {
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating prescription:', { patientId, medications });
    navigate('/prescriptions');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Prescription</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Patient Information">
          <FormField
            label="Patient"
            type="select"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={[
              { value: '1', label: 'John Doe' },
              { value: '2', label: 'Jane Smith' },
              { value: '3', label: 'Robert Johnson' }
            ]}
            required
          />
        </Card>

        <Card title="Medications">
          {medications.map((medication, index) => (
            <div key={index} className="medication-section">
              <div className="medication-header">
                <h4>Medication {index + 1}</h4>
                {medications.length > 1 && (
                  <Button 
                    type="button" 
                    variant="danger" 
                    size="small"
                    onClick={() => removeMedication(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="form-grid">
                <FormField
                  label="Medication Name"
                  type="text"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  placeholder="e.g., Aspirin"
                  required
                />

                <FormField
                  label="Dosage"
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  placeholder="e.g., 75mg"
                  required
                />

                <FormField
                  label="Frequency"
                  type="text"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  placeholder="e.g., Once daily"
                  required
                />

                <FormField
                  label="Duration"
                  type="text"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 30 days"
                  required
                />
              </div>

              <FormField
                label="Special Instructions"
                type="textarea"
                value={medication.instructions}
                onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                placeholder="Take with food, avoid alcohol, etc."
              />
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={addMedication}>
            Add Another Medication
          </Button>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Create Prescription</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;
