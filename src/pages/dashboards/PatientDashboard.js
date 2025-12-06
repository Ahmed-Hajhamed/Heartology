import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Dashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();

  const upcomingAppointments = [
    { id: '1', doctor: 'Dr. Sarah Johnson', date: '2025-12-10', time: '10:00 AM', type: 'Consultation' },
    { id: '2', doctor: 'Dr. Michael Brown', date: '2025-12-15', time: '02:00 PM', type: 'Follow-up' }
  ];

  const recentPrescriptions = [
    { id: '1', medication: 'Aspirin 75mg', prescribedBy: 'Dr. Sarah Johnson', date: '2025-11-30' },
    { id: '2', medication: 'Atorvastatin 20mg', prescribedBy: 'Dr. Sarah Johnson', date: '2025-11-30' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome back! Here's your health overview</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>2</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💊</div>
            <div className="stat-info">
              <h3>3</h3>
              <p>Active Prescriptions</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>12</h3>
              <p>Medical Records</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>$0</h3>
              <p>Pending Bills</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card 
          title="Upcoming Appointments" 
          actions={<Button size="small" onClick={() => navigate('/appointments/book')}>Book New</Button>}
        >
          <div className="appointment-list">
            {upcomingAppointments.map(apt => (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-info">
                  <h4>{apt.doctor}</h4>
                  <p>{apt.type}</p>
                </div>
                <div className="appointment-datetime">
                  <span className="date">{apt.date}</span>
                  <span className="time">{apt.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Recent Prescriptions"
          actions={<Button size="small" onClick={() => navigate('/prescriptions')}>View All</Button>}
        >
          <div className="prescription-list">
            {recentPrescriptions.map(rx => (
              <div key={rx.id} className="prescription-item">
                <div className="prescription-info">
                  <h4>{rx.medication}</h4>
                  <p>Prescribed by {rx.prescribedBy}</p>
                </div>
                <div className="prescription-date">
                  {rx.date}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/appointments/book')}>Book Appointment</Button>
        <Button variant="secondary" onClick={() => navigate('/medical-records')}>View Medical Records</Button>
        <Button variant="secondary" onClick={() => navigate('/billing/invoices')}>View Invoices</Button>
      </div>
    </div>
  );
};

export default PatientDashboard;
