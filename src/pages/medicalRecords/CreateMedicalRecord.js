import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const CreateMedicalRecord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Form State matching Backend Model
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    recordType: 'Consultation',
    // Vitals
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    // SOAP
    chiefComplaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    // Diagnosis
    icd10Code: '',
    diagnosisDesc: ''
  });

  // 1. Initialize Context
  useEffect(() => {
    const init = async () => {
      // Get Doctor ID
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'doctor') {
          try {
            const dRes = await api.get('/doctors');
            const myDoc = dRes.data.data.find(d => d.userId === user.id);
            setDoctorProfile(myDoc);
          } catch(e) { console.error(e); }
      }

      // Check URL params for auto-fill (e.g., from Appointment Details)
      const params = new URLSearchParams(location.search);
      const appId = params.get('appointmentId');
      const patId = params.get('patientId');

      if (appId || patId) {
          setFormData(prev => ({
              ...prev,
              appointmentId: appId || '',
              patientId: patId || ''
          }));
      }
    };
    init();
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!doctorProfile) {
          alert("Error: Could not identify doctor profile.");
          return;
      }

      const payload = {
        patientId: formData.patientId,
        doctorId: doctorProfile.id,
        appointmentId: formData.appointmentId || null,
        recordType: formData.recordType,
        vitalSigns: {
            bloodPressure: { 
                systolic: Number(formData.systolic), 
                diastolic: Number(formData.diastolic) 
            },
            heartRate: Number(formData.heartRate),
            temperature: Number(formData.temperature),
            oxygenSaturation: Number(formData.oxygenSaturation),
            respiratoryRate: Number(formData.respiratoryRate)
        },
        clinicalNotes: {
            chiefComplaint: formData.chiefComplaint,
            subjective: formData.subjective,
            objective: formData.objective,
            assessment: formData.assessment,
            plan: formData.plan
        },
        diagnoses: formData.icd10Code ? [{
            icd10Code: formData.icd10Code,
            description: formData.diagnosisDesc,
            isPrimary: true
        }] : []
      };

      await api.post('/medical-records', payload);
      alert('Medical Record Created Successfully!');
      navigate('/medical-records');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Medical Record</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Context">
            <div className="form-grid">
                <FormField 
                  label="Patient ID" 
                  name="patientId" 
                  value={formData.patientId} 
                  onChange={handleChange} 
                  required 
                  disabled={!!formData.patientId}
                />

                <FormField 
                  label="Appointment ID" 
                  name="appointmentId" 
                  value={formData.appointmentId} 
                  onChange={handleChange} 
                  disabled={!!formData.appointmentId}
                />

                <FormField 
                    label="Record Type" 
                    type="select" 
                    name="recordType" 
                    value={formData.recordType} 
                    onChange={handleChange}
                    options={[
                        { value: 'Consultation', label: 'Consultation' },
                        { value: 'Follow-up', label: 'Follow-up' },
                        { value: 'Emergency', label: 'Emergency' }
                    ]} 
                />
            </div>

            {(formData.patientId || formData.appointmentId) && (
              <div style={{ marginTop: '10px', color: '#555', fontSize: '0.9em' }}>
                {formData.patientId && (<div>Patient ID auto-filled from context.</div>)}
                {formData.appointmentId && (<div>Appointment ID auto-filled from context.</div>)}
              </div>
            )}
        </Card>

        <Card title="Vital Signs" className="mt-4">
          <div className="form-grid">
            <FormField label="BP Systolic" type="number" name="systolic" value={formData.systolic} onChange={handleChange} placeholder="120" />
            <FormField label="BP Diastolic" type="number" name="diastolic" value={formData.diastolic} onChange={handleChange} placeholder="80" />
            <FormField label="Heart Rate" type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} placeholder="72" />
            <FormField label="Temp (°C)" type="number" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="36.5" />
            <FormField label="O2 Saturation (%)" type="number" name="oxygenSaturation" value={formData.oxygenSaturation} onChange={handleChange} placeholder="98" />
          </div>
        </Card>

        <Card title="Clinical Notes (SOAP)" className="mt-4">
          <FormField label="Chief Complaint" name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} required />
          <FormField label="Subjective" type="textarea" name="subjective" value={formData.subjective} onChange={handleChange} placeholder="Patient history..." />
          <FormField label="Objective" type="textarea" name="objective" value={formData.objective} onChange={handleChange} placeholder="Exam findings..." />
          <FormField label="Assessment" type="textarea" name="assessment" value={formData.assessment} onChange={handleChange} placeholder="Diagnosis/Conclusion" required />
          <FormField label="Plan" type="textarea" name="plan" value={formData.plan} onChange={handleChange} placeholder="Treatment plan..." required />
        </Card>

        <Card title="Diagnosis" className="mt-4">
            <div className="form-grid">
                <FormField label="ICD-10 Code" name="icd10Code" value={formData.icd10Code} onChange={handleChange} placeholder="e.g. I10" />
                <FormField label="Description" name="diagnosisDesc" value={formData.diagnosisDesc} onChange={handleChange} placeholder="e.g. Hypertension" />
            </div>
        </Card>

        <div className="form-actions mt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;