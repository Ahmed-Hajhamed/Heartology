import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const DoctorList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  const doctors = [
    { 
      doctorId: '1', 
      name: 'Dr. Sarah Johnson', 
      specialization: 'Cardiology',
      email: 'sarah@heartology.com',
      phone: '+1234567891',
      yearsOfExperience: 15
    },
    { 
      doctorId: '2', 
      name: 'Dr. Michael Brown', 
      specialization: 'Interventional Cardiology',
      email: 'michael@heartology.com',
      phone: '+1234567892',
      yearsOfExperience: 12
    },
    { 
      doctorId: '3', 
      name: 'Dr. Emily Davis', 
      specialization: 'Electrophysiology',
      email: 'emily@heartology.com',
      phone: '+1234567893',
      yearsOfExperience: 10
    },
  ];

  const columns = [
    { header: 'Doctor ID', accessor: 'doctorId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Experience', render: (row) => `${row.yearsOfExperience} years` },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/doctors/${row.doctorId}`)}>View</Button>
          <Button size="small" variant="secondary" onClick={() => navigate(`/doctors/${row.doctorId}/schedule`)}>Schedule</Button>
        </div>
      )
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doctor Management</h1>
        <Button onClick={() => navigate('/register')}>Add New Doctor</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormField
            type="select"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            options={[
              { value: '', label: 'All Specializations' },
              { value: 'Cardiology', label: 'Cardiology' },
              { value: 'Interventional Cardiology', label: 'Interventional Cardiology' },
              { value: 'Electrophysiology', label: 'Electrophysiology' },
              { value: 'Cardiac Surgery', label: 'Cardiac Surgery' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredDoctors} />
      </Card>
    </div>
  );
};

export default DoctorList;
