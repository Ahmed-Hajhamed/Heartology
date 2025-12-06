import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const AppointmentList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const appointments = [
    { 
      appointmentId: '1', 
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-12-10',
      time: '10:00 AM',
      type: 'consultation',
      status: 'scheduled'
    },
    { 
      appointmentId: '2', 
      patientName: 'Jane Smith',
      doctorName: 'Dr. Michael Brown',
      date: '2025-12-15',
      time: '02:00 PM',
      type: 'follow_up',
      status: 'confirmed'
    },
    { 
      appointmentId: '3', 
      patientName: 'Robert Johnson',
      doctorName: 'Dr. Emily Davis',
      date: '2025-12-08',
      time: '11:30 AM',
      type: 'test',
      status: 'completed'
    },
  ];

  const columns = [
    { header: 'ID', accessor: 'appointmentId' },
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
      render: (row) => <span className={`status status-${row.status}`}>{row.status}</span>
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

  const filteredAppointments = appointments.filter(apt =>
    !statusFilter || apt.status === statusFilter
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointments</h1>
        <Button onClick={() => navigate('/appointments/book')}>Book New Appointment</Button>
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
