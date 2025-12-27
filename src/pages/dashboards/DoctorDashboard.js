import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/Dashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, totalPatients: 0 });

  // Onboarding State
  const [onboardingData, setOnboardingData] = useState({
    specialization: 'Cardiology',
    licenseNumber: '',
    yearsOfExperience: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Set doctor name from logged-in user
        setDoctorName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Doctor');

        // 1. Check for Doctor Profile
        const docRes = await api.get('/doctors');
        const myProfile = docRes.data.data.find(d => d.userId === user.id);

        if (myProfile) {
          setDoctorProfile(myProfile);

          // 2. Fetch Appointments for this Doctor
          const apptRes = await api.get(`/appointments?doctorId=${myProfile.id}`);
          const myAppts = apptRes.data.data;

          // Filter for "Today" - only active appointments (Scheduled or Confirmed)
          const todayStr = new Date().toISOString().split('T')[0];
          const todayAppts = myAppts.filter(a =>
            a.appointmentDate === todayStr &&
            ['Scheduled', 'Confirmed'].includes(a.status)
          );

          setAppointments(todayAppts);
          setStats({
            today: todayAppts.length,
            pending: myAppts.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length,
            totalPatients: new Set(myAppts.map(a => a.patientId)).size
          });
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOnboardingChange = (e) => {
    setOnboardingData({ ...onboardingData, [e.target.name]: e.target.value });
  };

  const createDoctorProfile = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await api.post('/doctors', {
        userId: user.id,
        ...onboardingData,
        // Default Schedule
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: "09:00", end: "17:00" }
      });

      alert("Profile Created! Reloading...");
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create profile");
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  // --- VIEW 1: ONBOARDING (If no profile exists) ---
  if (!doctorProfile) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Doctor Registration</h1>
          <p>Please complete your professional details to access the system.</p>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={createDoctorProfile}>
            <Card title="Professional Details">
              <FormField
                label="Specialization"
                name="specialization"
                value={onboardingData.specialization}
                onChange={handleOnboardingChange}
                required
              />
              <FormField
                label="License Number"
                name="licenseNumber"
                value={onboardingData.licenseNumber}
                onChange={handleOnboardingChange}
                placeholder="e.g. LIC-123456"
                required
              />
              <FormField
                label="Years of Experience"
                type="number"
                name="yearsOfExperience"
                value={onboardingData.yearsOfExperience}
                onChange={handleOnboardingChange}
                required
              />
              <div style={{ marginTop: '20px' }}>
                <Button type="submit">Complete Registration</Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: REAL DASHBOARD ---
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {doctorName}</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.today}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="Today's Schedule">
          <div className="appointment-list">
            {appointments.length === 0 ? (
              <p style={{ padding: '20px', color: '#666' }}>No appointments scheduled for today.</p>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-info">
                    {/* We show Patient ID for now, usually you'd fetch the name */}
                    <h4>Patient ID: {apt.patientId.substring(0, 8)}...</h4>
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
      </div>

      <div className="quick-actions">
        <Button onClick={() => navigate('/medical-records/create')}>New Medical Record</Button>
        <Button variant="secondary" onClick={() => navigate('/prescriptions/create')}>New Prescription</Button>
        <Button variant="secondary" onClick={() => navigate('/patients')}>View Patients</Button>
        <Button variant="secondary" onClick={() => navigate(`/doctors/${doctorProfile.id}/schedule`)}>Manage Schedule</Button>
      </div>
    </div>
  );
};

export default DoctorDashboard;