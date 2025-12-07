import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AppointmentList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  // Fetch Appointments on Load
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);
        
        let queryParams = '';

        // 1. Determine Identity (Patient vs Doctor)
        if (user.role === 'patient') {
            // Find my Patient ID
            const pRes = await api.get('/patients');
            const myProfile = pRes.data.data.find(p => p.userId === user.id);
            if (myProfile) queryParams = `?patientId=${myProfile.id}`;
        } 
        else if (user.role === 'doctor') {
            // Find my Doctor ID
            const dRes = await api.get('/doctors');
            const myDocProfile = dRes.data.data.find(d => d.userId === user.id);
            if (myDocProfile) queryParams = `?doctorId=${myDocProfile.id}`;
        }

        // 2. Fetch Appointments
        const response = await api.get(`/appointments${queryParams}`);
        
        // 3. Transform Data for Table
        // We need to fetch Doctor names manually since the backend might not send them yet
        const doctorsRes = await api.get('/doctors');
        const doctorsMap = {};
        doctorsRes.data.data.forEach(d => {
            doctorsMap[d.id] = `Dr. ${d.name || d.lastName || 'Unknown'}`;
        });

        const mappedData = response.data.data.map(apt => ({
            appointmentId: apt.id, // Map backend '_id' to table 'appointmentId'
            patientName: apt.patientName || 'Loading...', // Backend sends this
            doctorName: doctorsMap[apt.doctorId] || 'Unknown', // Map ID to Name
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            time: apt.appointmentTime,
            type: apt.type,
            status: apt.status,
            rawDate: apt.appointmentDate // Keep raw for sorting if needed
        }));

        setAppointments(mappedData);

      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const columns = [
    { header: 'Appointment ID', accessor: 'appointmentId' },
    { header: 'Patient', accessor: 'patientName' },
    { header: 'Doctor', accessor: 'doctorName' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    { 
      header: 'Type', 
      accessor: 'type',
      render: (row) => <span className="tag tag-info">{row.type}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status.toLowerCase()}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/appointments/${row.appointmentId}`)}>View</Button>
        </div>
      )
    }
  ];

  // Filter Logic
  const filteredAppointments = appointments.filter(apt =>
    !statusFilter || apt.status.toLowerCase() === statusFilter.toLowerCase()
  );

  if (loading) return <div className="page-container">Loading appointments...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointments</h1>
        {/* Only Patients and Staff can book new appointments here */}
        {['patient', 'staff'].includes(userRole) && (
            <Button onClick={() => navigate('/appointments/book')}>Book New Appointment</Button>
        )}
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredAppointments} />
      </Card>
    </div>
  );
};

export default AppointmentList;