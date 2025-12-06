import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/PatientList.css';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { 
      patientId: '1', 
      name: 'John Doe', 
      email: 'john@example.com', 
      phone: '+1234567890', 
      bloodType: 'A+',
      lastVisit: '2025-11-30'
    },
    { 
      patientId: '2', 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      phone: '+1234567891', 
      bloodType: 'B-',
      lastVisit: '2025-12-01'
    },
    { 
      patientId: '3', 
      name: 'Robert Johnson', 
      email: 'robert@example.com', 
      phone: '+1234567892', 
      bloodType: 'O+',
      lastVisit: '2025-12-03'
    },
  ];

  const columns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Type', accessor: 'bloodType' },
    { header: 'Last Visit', accessor: 'lastVisit' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/patients/${row.patientId}`)}>View</Button>
          <Button size="small" variant="secondary" onClick={() => navigate(`/appointments/book?patientId=${row.patientId}`)}>Book</Button>
        </div>
      )
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.includes(searchTerm)
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Management</h1>
        <Button onClick={() => navigate('/register')}>Add New Patient</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table columns={columns} data={filteredPatients} />
      </Card>
    </div>
  );
};

export default PatientList;
