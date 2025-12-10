import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointmentsToday: 0,
    pendingInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Run all requests in parallel for speed
        const [patientsRes, doctorsRes, apptsRes, invoicesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/doctors'),
          api.get('/appointments'),
          api.get('/billing/invoices') // or /invoices
        ]);

        const todayStr = new Date().toISOString().split('T')[0];

        // Only count active appointments (Scheduled or Confirmed) for today
        const todayActiveAppts = apptsRes.data.data.filter(a =>
          a.appointmentDate === todayStr &&
          ['Scheduled', 'Confirmed'].includes(a.status)
        );

        setStats({
          patients: patientsRes.data.count || patientsRes.data.data.length,
          doctors: doctorsRes.data.count || doctorsRes.data.data.length,
          appointmentsToday: todayActiveAppts.length,
          pendingInvoices: invoicesRes.data.data.filter(i => i.status === 'Pending').length
        });

      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading system data...</div>;

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
              <h3>{stats.patients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-info">
              <h3>{stats.doctors}</h3>
              <p>Active Doctors</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.appointmentsToday}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{stats.pendingInvoices}</h3>
              <p>Pending Invoices</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/users')}>Manage Users</Button>
        <Button variant="secondary" onClick={() => navigate('/doctors')}>Manage Doctors</Button>
        <Button variant="secondary" onClick={() => navigate('/billing/invoices')}>View Financials</Button>
        <Button variant="secondary" onClick={() => navigate('/register')}>Register New Staff</Button>
      </div>
    </div>
  );
};

export default AdminDashboard;