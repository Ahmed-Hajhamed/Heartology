import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import '../../styles/pages/Dashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  // 1. State
  const [user, setUser] = useState(null); // Registration Data (Name, Age, Address)
  const [patientProfile, setPatientProfile] = useState(null); // Medical Data (Blood type, etc.)
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // A. Get User Data immediately from LocalStorage (fastest)
        const userStr = localStorage.getItem('user');
        const userData = userStr ? JSON.parse(userStr) : null;
        setUser(userData);

        if (userData) {
          // B. Check for existing Patient Medical Profile
          // The backend connects the User ID to the Patient Profile
          const patientsRes = await api.get('/patients');
          const myProfile = patientsRes.data.data.find(p => p.userId === userData.id);

          if (myProfile) {
            setPatientProfile(myProfile);

            // C. Fetch Appointments for this Patient
            const apptRes = await api.get(`/appointments?patientId=${myProfile.id}`);
            setAppointments(apptRes.data.data);

            // D. Fetch Prescriptions for this Patient
            const rxRes = await api.get(`/prescriptions?patientId=${myProfile.id}`);
            setPrescriptions(rxRes.data.data);

            // E. Fetch All Doctors (to map doctor IDs to names)
            const doctorsRes = await api.get('/doctors');
            setDoctors(doctorsRes.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper: Calculate Age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDt = new Date(difference);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Helper: Format Address Object
  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    // Handle both string and object formats (just in case)
    if (typeof addr === 'string') return addr;
    return `${addr.street || ''} ${addr.city || ''} ${addr.country || ''}`;
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome back, <strong>{user?.firstName} {user?.lastName}</strong>!</p>
      </div>

      {/* SECTION 1: Personal Information (From Registration) */}
      <div className="profile-section" style={{ marginBottom: '20px' }}>
        <Card title="Personal Information">
            <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Full Name:</label>
                    <span style={{ fontSize: '1.1em' }}>{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Gender:</label>
                    <span>{user?.gender}</span>
                </div>
                <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Age:</label>
                    <span>{calculateAge(user?.dateOfBirth)} years</span>
                </div>
                <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Phone:</label>
                    <span>{user?.phone}</span>
                </div>
                 <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Address:</label>
                    <span>{formatAddress(user?.address)}</span>
                </div>
                 <div className="info-item">
                    <label style={{ fontWeight: 'bold', color: '#666', display: 'block' }}>Email:</label>
                    <span>{user?.email}</span>
                </div>
            </div>
        </Card>
      </div>

      {/* SECTION 2: Medical Profile Warning (If missing) */}
      {!patientProfile && (
        <Card className="warning-card" style={{ borderLeft: '4px solid #f0ad4e', marginBottom: '20px', backgroundColor: '#fff8e1' }}>
            <div style={{ padding: '10px' }}>
                <h3 style={{ color: '#8a6d3b', marginTop: 0 }}>Medical Profile Incomplete</h3>
                <p style={{ color: '#8a6d3b' }}>
                  We have your contact details, but we still need your medical history (Blood type, Allergies, Insurance) before you can book appointments.
                </p>
                <div style={{ marginTop: '15px' }}>
                  <Button 
                      variant="primary" 
                      onClick={() => navigate('/patients/create')} // Make sure this route works!
                  >
                      Complete Medical Profile
                  </Button>
                </div>
            </div>
        </Card>
      )}

      {/* SECTION 3: Dashboard Stats */}
      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">💊</div>
            <div className="stat-info">
              <h3>{prescriptions.filter(p => p.status === 'Active').length}</h3>
              <p>Active Prescriptions</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>--</h3>
              <p>Medical Records</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: Upcoming Appointments List */}
      <div className="dashboard-content">
        <Card 
          title="Upcoming Appointments" 
          actions={<Button size="small" onClick={() => navigate('/appointments/book')}>Book New</Button>}
        >
          <div className="appointment-list">
            {appointments.length === 0 ? (
                <p style={{ padding: '1rem', color: '#666' }}>No upcoming appointments.</p>
            ) : (
                appointments.map(apt => {
                    const doctor = doctors.find(d => d.id === apt.doctorId);
                    const doctorName = doctor ? `Dr. ${doctor.name || doctor.lastName}` : 'Doctor';
                    
                    return (
                    <div key={apt.id} className="appointment-item">
                        <div className="appointment-info">
                        <h4>{doctorName}</h4> 
                        <p>{apt.type}</p>
                        </div>
                        <div className="appointment-datetime">
                        <span className="date">{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                        <span className="time">{apt.appointmentTime}</span>
                        </div>
                    </div>
                    );
                })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;