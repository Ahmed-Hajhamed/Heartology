import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const MedicalRecordList = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('');

  const records = [
    { 
      recordId: '1', 
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      recordType: 'consultation',
      date: '2025-12-05',
      assessment: 'Hypertension'
    },
    { 
      recordId: '2', 
      patientName: 'Jane Smith',
      doctorName: 'Dr. Michael Brown',
      recordType: 'test_result',
      date: '2025-12-03',
      assessment: 'ECG Normal'
    },
    { 
      recordId: '3', 
      patientName: 'Robert Johnson',
      doctorName: 'Dr. Emily Davis',
      recordType: 'diagnosis',
      date: '2025-12-01',
      assessment: 'Arrhythmia'
    },
  ];

  const columns = [
    { header: 'Record ID', accessor: 'recordId' },
    { header: 'Patient', accessor: 'patientName' },
    { header: 'Doctor', accessor: 'doctorName' },
    { 
      header: 'Type', 
      accessor: 'recordType',
      render: (row) => <span className="tag tag-info">{row.recordType}</span>
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Assessment', accessor: 'assessment' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/medical-records/${row.recordId}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredRecords = records.filter(record =>
    !typeFilter || record.recordType === typeFilter
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Records</h1>
        <Button onClick={() => navigate('/medical-records/create')}>Create New Record</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'consultation', label: 'Consultation' },
              { value: 'test_result', label: 'Test Result' },
              { value: 'procedure', label: 'Procedure' },
              { value: 'diagnosis', label: 'Diagnosis' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredRecords} />
      </Card>
    </div>
  );
};

export default MedicalRecordList;
