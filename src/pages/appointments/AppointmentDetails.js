import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // State for real data
  const [appointment, setAppointment] = useState(null);
  const [patientName, setPatientName] = useState('Loading...');
  const [doctorName, setDoctorName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Fetch Appointment Details
        const apptRes = await api.get(`/appointments/${appointmentId}`);
        const apptData = apptRes.data.data;
        setAppointment(apptData);

        // 2. Fetch Patient Name
        if (apptData.patientId) {
            try {
                const pRes = await api.get(`/patients/${apptData.patientId}`);
                // Patient API returns combined data usually, or we dig into personalInfo
                const pData = pRes.data.data;
                const name = pData.personalInfo 
                    ? `${pData.personalInfo.firstName} ${pData.personalInfo.lastName}`
                    : 'Unknown Patient';
                setPatientName(name);
            } catch (err) {
                setPatientName('Unknown ID');
            }
        }

        // 3. Fetch Doctor Name
        if (apptData.doctorId) {
            try {
                const dRes = await api.get(`/doctors/${apptData.doctorId}`);
                const dData = dRes.data.data;
                setDoctorName(`Dr. ${dData.firstName} ${dData.lastName}`);
            } catch (err) {
                setDoctorName('Unknown Doctor');
            }
        }

      } catch (error) {
        console.error("Error fetching details:", error);
        alert("Could not load appointment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  const handleCancel = async () => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'Cancelled' });
      alert('Appointment cancelled successfully.');
      setShowCancelModal(false);
      navigate('/appointments'); // Go back to list
    } catch (error) {
      console.error(error);
      alert('Failed to cancel appointment.');
    }
  };

  if (loading) return <div className="page-container">Loading details...</div>;
  if (!appointment) return <div className="page-container">Appointment not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointment Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          
          {/* Only show Cancel button if it's not already cancelled or completed */}
          {['Scheduled', 'Confirmed'].includes(appointment.status) && (
            <Button variant="danger" onClick={() => setShowCancelModal(true)}>Cancel Appointment</Button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <Card title="Appointment Info">
          <div className="info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span className={`status status-${appointment.status?.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Time:</label>
              <span>{appointment.appointmentTime}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span>{appointment.type}</span>
            </div>
          </div>
        </Card>

        <Card title="Patient Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Patient Name:</label>
              <span>{patientName}</span>
            </div>
            <div className="info-item">
              <label>Patient ID:</label>
              <span style={{fontSize: '0.8em', color: '#666'}}>{appointment.patientId}</span>
            </div>
          </div>
          <Button size="small" onClick={() => navigate(`/patients/${appointment.patientId}/medical-profile`)}>
            View Medical Profile
          </Button>
        </Card>

        <Card title="Doctor Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Doctor Name:</label>
              <span>{doctorName}</span>
            </div>
            <div className="info-item">
              <label>Doctor ID:</label>
              <span style={{fontSize: '0.8em', color: '#666'}}>{appointment.doctorId}</span>
            </div>
          </div>
        </Card>

        <Card title="Reason for Visit">
          <p>{appointment.reasonForVisit || appointment.reason || 'No reason provided.'}</p>
        </Card>
        
        {/* Show Notes if they exist */}
        {appointment.notes && (
            <Card title="Clinical Notes">
                <p>{appointment.notes}</p>
            </Card>
        )}
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
        footer={
          <>
            <Button variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No, Keep It</Button>
          </>
        }
      >
        <p>Are you sure you want to cancel this appointment?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AppointmentDetails;