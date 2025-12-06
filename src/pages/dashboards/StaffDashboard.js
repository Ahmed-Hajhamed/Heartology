import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Dashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <p>Manage appointments and administrative tasks</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>32</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>18</h3>
              <p>Checked In</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>14</h3>
              <p>Waiting</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>8</h3>
              <p>Pending Payments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="Quick Tasks">
          <div className="task-list">
            <div className="task-item">
              <span className="task-icon">📞</span>
              <span className="task-text">Call patients for appointment confirmations</span>
            </div>
            <div className="task-item">
              <span className="task-icon">📄</span>
              <span className="task-text">Process pending insurance claims</span>
            </div>
            <div className="task-item">
              <span className="task-icon">🔬</span>
              <span className="task-text">Upload radiology scans for review</span>
            </div>
          </div>
        </Card>

        <Card title="Today's Schedule">
          <div className="schedule-list">
            <div className="schedule-item">
              <span className="schedule-time">09:00 - 12:00</span>
              <span className="schedule-text">Morning appointments</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">12:00 - 01:00</span>
              <span className="schedule-text">Lunch break</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">01:00 - 05:00</span>
              <span className="schedule-text">Afternoon appointments</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/appointments/book')}>Book Appointment</Button>
        <Button variant="secondary" onClick={() => navigate('/billing/invoices/create')}>Create Invoice</Button>
        <Button variant="secondary" onClick={() => navigate('/users')}>Manage Users</Button>
      </div>
    </div>
  );
};

export default StaffDashboard;
