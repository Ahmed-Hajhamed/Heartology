import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>1,234</h3>
              <p>Total Patients</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-info">
              <h3>45</h3>
              <p>Active Doctors</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>78</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>$45,600</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="System Statistics">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">1,325</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Medical Records</span>
              <span className="stat-value">5,432</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Prescriptions</span>
              <span className="stat-value">892</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Invoices</span>
              <span className="stat-value">156</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <span className="activity-text">New patient registered: John Doe</span>
              <span className="activity-time">5 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📅</span>
              <span className="activity-text">Appointment scheduled with Dr. Smith</span>
              <span className="activity-time">15 min ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">💰</span>
              <span className="activity-text">Invoice #12345 paid</span>
              <span className="activity-time">1 hour ago</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/users')}>Manage Users</Button>
        <Button variant="secondary" onClick={() => navigate('/doctors')}>Manage Doctors</Button>
        <Button variant="secondary" onClick={() => navigate('/billing/invoices')}>View Billing</Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
