import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

const PrescriptionDetails = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/prescriptions/${prescriptionId}`);
        setPrescription(response.data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [prescriptionId]);

  if (loading) return <div className="page-container">Loading...</div>;
  if (!prescription) return <div className="page-container">Not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Prescription Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <div className="details-grid">
        <Card title="Info">
            <p><strong>Date:</strong> {new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {prescription.status}</p>
            <p><strong>Patient ID:</strong> {prescription.patientId}</p>
            <p><strong>Doctor ID:</strong> {prescription.doctorId}</p>
        </Card>

        <Card title="Medications">
          {prescription.medications && prescription.medications.map((med, index) => (
            <div key={index} className="medication-card" style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px'}}>
              <h4>{index + 1}. {med.drugName}</h4>
              <div className="medication-details" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <span><strong>Dosage:</strong> {med.dosage}</span>
                <span><strong>Frequency:</strong> {med.frequency}</span>
                <span><strong>Duration:</strong> {med.duration}</span>
                <span><strong>Instructions:</strong> {med.instructions}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionDetails;