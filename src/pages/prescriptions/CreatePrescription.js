import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState([
    { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  // 1. Get Doctor ID on Load
  useEffect(() => {
    const fetchDoctorProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const dRes = await api.get('/doctors');
            const myProfile = dRes.data.data.find(d => d.userId === user.id);
            if (myProfile) setDoctorId(myProfile.id);
        } catch (e) {
            console.error(e);
        }
    };
    fetchDoctorProfile();
  }, []);

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
        alert("Error: Doctor profile not found.");
        return;
    }
    setLoading(true);

    try {
      const payload = {
        patientId: patientId,
        doctorId: doctorId,
        medications: medications,
        refillsAllowed: 0,
        notes: "Prescribed via Web Portal"
      };

      await api.post('/prescriptions', payload);
      
      alert('Prescription Created Successfully!');
      navigate('/prescriptions');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Prescription</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Patient Details">
            <FormField
              label="Patient ID"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID"
              required
            />
        </Card>

        <Card title="Medications" className="mt-4">
          {medications.map((medication, index) => (
            <div key={index} className="medication-form-group" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4>Medication #{index + 1}</h4>
                {medications.length > 1 && (
                  <Button size="small" variant="danger" onClick={() => removeMedication(index)}>Remove</Button>
                )}
              </div>

              <div className="form-grid">
                <FormField
                  label="Drug Name"
                  type="text"
                  value={medication.drugName} // Note: Backend expects "drugName" not "name"
                  onChange={(e) => handleMedicationChange(index, 'drugName', e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  required
                />

                <FormField
                  label="Dosage"
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                  required
                />
              </div>

              <div className="form-grid">
                <FormField
                  label="Frequency"
                  type="text"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  placeholder="e.g., Twice daily"
                  required
                />

                <FormField
                  label="Duration"
                  type="text"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
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

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Prescription'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;