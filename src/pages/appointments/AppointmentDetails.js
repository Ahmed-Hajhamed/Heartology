import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const appointmentData = {
    appointmentId: appointmentId,
    patientName: 'John Doe',
    patientId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorId: '1',
    scheduledDate: '2025-12-10',
    scheduledTime: '10:00 AM',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    reason: 'Chest pain and irregular heartbeat',
    createdAt: '2025-12-05 14:30:00'
  };

  const handleCancel = () => {
    console.log('Cancelling appointment:', appointmentId);
    setShowCancelModal(false);
    navigate('/appointments');
  };

  const handleConfirm = () => {
    console.log('Confirming appointment:', appointmentId);
    navigate('/appointments');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointment Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          {appointmentData.status === 'scheduled' && (
            <>
              <Button onClick={handleConfirm}>Confirm</Button>
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>Cancel</Button>
            </>
          )}
        </div>
      </div>

      <div className="details-grid">
        <Card title="Appointment Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Appointment ID:</label>
              <span>{appointmentData.appointmentId}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status status-${appointmentData.status}`}>{appointmentData.status}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span className="tag tag-info">{appointmentData.type}</span>
            </div>
            <div className="info-item">
              <label>Duration:</label>
              <span>{appointmentData.duration} minutes</span>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <span>{appointmentData.scheduledDate}</span>
            </div>
            <div className="info-item">
              <label>Time:</label>
              <span>{appointmentData.scheduledTime}</span>
            </div>
            <div className="info-item">
              <label>Created At:</label>
              <span>{appointmentData.createdAt}</span>
            </div>
          </div>
        </Card>

        <Card title="Patient Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Patient Name:</label>
              <span>{appointmentData.patientName}</span>
            </div>
            <div className="info-item">
              <label>Patient ID:</label>
              <span>{appointmentData.patientId}</span>
            </div>
          </div>
          <Button size="small" onClick={() => navigate(`/patients/${appointmentData.patientId}`)}>
            View Patient Profile
          </Button>
        </Card>

        <Card title="Doctor Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Doctor Name:</label>
              <span>{appointmentData.doctorName}</span>
            </div>
            <div className="info-item">
              <label>Doctor ID:</label>
              <span>{appointmentData.doctorId}</span>
            </div>
          </div>
          <Button size="small" onClick={() => navigate(`/doctors/${appointmentData.doctorId}`)}>
            View Doctor Profile
          </Button>
        </Card>

        <Card title="Reason for Visit">
          <p>{appointmentData.reason}</p>
        </Card>
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
