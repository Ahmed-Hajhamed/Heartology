import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const prescriptions = [
    { 
      prescriptionId: '1', 
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-11-30',
      medicationCount: 2,
      status: 'active'
    },
    { 
      prescriptionId: '2', 
      patientName: 'Jane Smith',
      doctorName: 'Dr. Michael Brown',
      date: '2025-12-01',
      medicationCount: 3,
      status: 'active'
    },
    { 
      prescriptionId: '3', 
      patientName: 'Robert Johnson',
      doctorName: 'Dr. Emily Davis',
      date: '2025-11-15',
      medicationCount: 1,
      status: 'completed'
    },
  ];

  const columns = [
    { header: 'Prescription ID', accessor: 'prescriptionId' },
    { header: 'Patient', accessor: 'patientName' },
    { header: 'Doctor', accessor: 'doctorName' },
    { header: 'Date', accessor: 'date' },
    { header: 'Medications', render: (row) => `${row.medicationCount} items` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/prescriptions/${row.prescriptionId}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredPrescriptions = prescriptions.filter(rx =>
    !statusFilter || rx.status === statusFilter
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Prescriptions</h1>
        <Button onClick={() => navigate('/prescriptions/create')}>Create New Prescription</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredPrescriptions} />
      </Card>
    </div>
  );
};

export default PrescriptionList;
