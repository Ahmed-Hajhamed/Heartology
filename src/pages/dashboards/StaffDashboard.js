import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/Dashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, waiting: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch All Appointments
        const response = await api.get('/appointments');
        const allAppts = response.data.data;

        // 2. Filter for Today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAppts = allAppts.filter(a => a.appointmentDate === todayStr);

        // 3. Calculate Stats
        const checkedIn = todayAppts.filter(a => a.status === 'Confirmed' || a.status === 'In Progress').length;
        const waiting = todayAppts.filter(a => a.status === 'Scheduled').length;

        setAppointments(todayAppts);
        setStats({
            total: todayAppts.length,
            checkedIn,
            waiting
        });

      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <p>Manage patient flow and daily operations</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.checkedIn}</h3>
              <p>Checked In / Active</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.waiting}</h3>
              <p>Waiting</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="Today's Schedule">
          <div className="appointment-list">
            {appointments.length === 0 ? (
                <p style={{padding: '20px', color: '#666'}}>No appointments today.</p>
            ) : (
                appointments.map(apt => (
                <div key={apt.id} className="appointment-item">
                    <div className="appointment-info">
                    {/* Ideally fetch patient name, using ID for now */}
                    <h4>Patient ID: {apt.patientId ? apt.patientId.substring(0, 8) : 'N/A'}...</h4> 
                    <p>{apt.type}</p>
                    </div>
                    <div className="appointment-details">
                    <span className="time">{apt.appointmentTime}</span>
                    <span className={`status status-${apt.status.toLowerCase()}`}>{apt.status}</span>
                    </div>
                </div>
                ))
            )}
          </div>
        </Card>

        <Card title="Quick Tasks">
          <div className="task-list">
            <div className="task-item" onClick={() => navigate('/billing/invoices')}>
              <span className="task-icon">💰</span>
              <span className="task-text">Process pending invoices</span>
            </div>
            <div className="task-item" onClick={() => navigate('/appointments/book')}>
              <span className="task-icon">📞</span>
              <span className="task-text">Book walk-in appointment</span>
            </div>
            <div className="task-item" onClick={() => navigate('/register')}>
              <span className="task-icon">👤</span>
              <span className="task-text">Register new patient</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;