import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Dashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const todayAppointments = [
    { id: '1', patient: 'John Doe', time: '09:00 AM', type: 'Consultation', status: 'confirmed' },
    { id: '2', patient: 'Jane Smith', time: '10:30 AM', type: 'Follow-up', status: 'confirmed' },
    { id: '3', patient: 'Robert Johnson', time: '02:00 PM', type: 'Emergency', status: 'scheduled' }
  ];

  const pendingReviews = [
    { id: '1', patient: 'Alice Williams', type: 'CT Scan', date: '2025-12-05' },
    { id: '2', patient: 'Bob Anderson', type: 'ECG', date: '2025-12-06' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage your patients and appointments</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{todayAppointments.length}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>45</h3>
              <p>Total Patients</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🔬</div>
            <div className="stat-info">
              <h3>{pendingReviews.length}</h3>
              <p>Pending Reviews</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💊</div>
            <div className="stat-info">
              <h3>8</h3>
              <p>Prescriptions Today</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card 
          title="Today's Appointments"
          actions={<Button size="small" onClick={() => navigate('/appointments')}>View All</Button>}
        >
          <div className="appointment-list">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-info">
                  <h4>{apt.patient}</h4>
                  <p>{apt.type}</p>
                </div>
                <div className="appointment-details">
                  <span className="time">{apt.time}</span>
                  <span className={`status status-${apt.status}`}>{apt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Pending Reviews"
          actions={<Button size="small" onClick={() => navigate('/radiology')}>View All</Button>}
        >
          <div className="review-list">
            {pendingReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-info">
                  <h4>{review.patient}</h4>
                  <p>{review.type}</p>
                </div>
                <div className="review-date">
                  {review.date}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/medical-records/create')}>New Medical Record</Button>
        <Button variant="secondary" onClick={() => navigate('/prescriptions/create')}>New Prescription</Button>
        <Button variant="secondary" onClick={() => navigate('/patients')}>View Patients</Button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
