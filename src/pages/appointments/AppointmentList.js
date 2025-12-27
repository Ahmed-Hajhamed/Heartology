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

        // 3. Fetch Doctors for name mapping
        const doctorsRes = await api.get('/doctors');
        const doctorsMap = {};
        doctorsRes.data.data.forEach(d => {
          doctorsMap[d.id] = `Dr. ${d.name || d.lastName || 'Unknown'}`;
        });

        // 4. Fetch patient names (using personalInfo for better accuracy)
        const patientsRes = await api.get('/patients');
        const patientsMap = {};
        for (const p of patientsRes.data.data) {
            // Try to get user info for patient name
            try {
                const userRes = await api.get(`/patients/${p.id}`);
                const userData = userRes.data.data;
                const firstName = userData.personalInfo?.firstName || '';
                const lastName = userData.personalInfo?.lastName || '';
                patientsMap[p.id] = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown';
            } catch {
                patientsMap[p.id] = 'Unknown';
            }
        }

        // 5. Fetch Invoices to map invoice status to appointments
        const invoicesRes = await api.get('/billing/invoices');
        const invoicesMap = {};
        invoicesRes.data.data.forEach(inv => {
          if (inv.appointmentId) {
            invoicesMap[inv.appointmentId] = inv.status; // 'Pending' or 'Paid'
          }
        });

        // 6. Transform Data for Table
        const mappedData = response.data.data.map(apt => ({
          appointmentId: apt.id,
          patientName: patientsMap[apt.patientId] || apt.patientName || 'Unknown',
          doctorName: doctorsMap[apt.doctorId] || 'Unknown',
          date: new Date(apt.appointmentDate).toLocaleDateString('en-GB'), // dd/mm/yyyy format
          time: apt.appointmentTime,
          type: apt.type,
          status: apt.status,
          invoiceStatus: invoicesMap[apt.id] || null, // Real invoice status
          rawDate: apt.appointmentDate
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
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    // Only show Patient column for non-patient users
    ...(userRole !== 'patient' ? [{ header: 'Patient', accessor: 'patientName' }] : []),
    { header: 'Doctor', accessor: 'doctorName' },
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
      header: 'Invoice',
      accessor: 'invoiceStatus',
      render: (row) => {
        // Show real invoice status
        if (row.invoiceStatus === 'Paid') {
          return <span className="status status-completed">Paid</span>;
        } else if (row.invoiceStatus === 'Pending') {
          return <span className="status status-pending">Pending</span>;
        } else {
          return <span style={{ color: '#999' }}>-</span>;
        }
      }
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
  const filteredAppointments = appointments
    .filter(apt => !statusFilter || apt.status.toLowerCase() === statusFilter.toLowerCase())
    // Sort by nearest date/time first
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.rawDate}T${a.time}`);
      const dateTimeB = new Date(`${b.rawDate}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

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