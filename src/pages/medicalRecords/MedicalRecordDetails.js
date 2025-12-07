import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

const MedicalRecordDetails = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await api.get(`/medical-records/${recordId}`);
        setRecord(response.data.data);
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  if (loading) return <div className="page-container">Loading...</div>;
  if (!record) return <div className="page-container">Record not found.</div>;

  const vitals = record.vitalSigns || {};
  const notes = record.clinicalNotes || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Record Details</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="details-grid">
        <Card title="Vital Signs">
          <div className="info-grid">
            <div className="info-item">
              <label>Blood Pressure</label>
              <span>{vitals.bloodPressure?.systolic}/{vitals.bloodPressure?.diastolic} mmHg</span>
            </div>
            <div className="info-item">
              <label>Heart Rate</label>
              <span>{vitals.heartRate} bpm</span>
            </div>
            <div className="info-item">
              <label>Temperature</label>
              <span>{vitals.temperature} °C</span>
            </div>
            <div className="info-item">
              <label>O2 Saturation</label>
              <span>{vitals.oxygenSaturation} %</span>
            </div>
          </div>
        </Card>

        <Card title="Clinical Notes">
          <div className="note-section" style={{marginBottom: '10px'}}>
            <strong>Chief Complaint:</strong> <p>{notes.chiefComplaint}</p>
          </div>
          <div className="note-section" style={{marginBottom: '10px'}}>
            <strong>Subjective:</strong> <p>{notes.subjective}</p>
          </div>
          <div className="note-section" style={{marginBottom: '10px'}}>
            <strong>Objective:</strong> <p>{notes.objective}</p>
          </div>
          <div className="note-section" style={{marginBottom: '10px'}}>
            <strong>Assessment:</strong> <p>{notes.assessment}</p>
          </div>
          <div className="note-section">
            <strong>Plan:</strong> <p>{notes.plan}</p>
          </div>
        </Card>
        
        {record.diagnoses && record.diagnoses.length > 0 && (
            <Card title="Diagnoses">
                {record.diagnoses.map((d, i) => (
                    <div key={i}>
                        <strong>{d.icd10Code}</strong>: {d.description}
                    </div>
                ))}
            </Card>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordDetails;