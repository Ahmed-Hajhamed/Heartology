import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const RadiologyList = () => {
  const navigate = useNavigate();
  const [studyTypeFilter, setStudyTypeFilter] = useState('');

  const radiologyScans = [
    { 
      imageId: '1', 
      patientName: 'John Doe',
      studyType: 'ECG',
      date: '2025-12-05',
      status: 'pending'
    },
    { 
      imageId: '2', 
      patientName: 'Jane Smith',
      studyType: 'ct_scan',
      date: '2025-12-03',
      status: 'approved'
    },
    { 
      imageId: '3', 
      patientName: 'Robert Johnson',
      studyType: 'mri',
      date: '2025-12-01',
      status: 'modified'
    },
  ];

  const columns = [
    { header: 'Image ID', accessor: 'imageId' },
    { header: 'Patient', accessor: 'patientName' },
    { 
      header: 'Study Type', 
      accessor: 'studyType',
      render: (row) => <span className="tag tag-info">{row.studyType.toUpperCase()}</span>
    },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Review Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/radiology/${row.imageId}`)}>View</Button>
          <Button size="small" variant="secondary" onClick={() => navigate(`/radiology/${row.imageId}/analysis`)}>Analysis</Button>
        </div>
      )
    }
  ];

  const filteredScans = radiologyScans.filter(scan =>
    !studyTypeFilter || scan.studyType === studyTypeFilter
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Radiology & Imaging</h1>
        <Button onClick={() => navigate('/radiology/upload')}>Upload New Scan</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={studyTypeFilter}
            onChange={(e) => setStudyTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Study Types' },
              { value: 'ECG', label: 'ECG' },
              { value: 'ct_scan', label: 'CT Scan' },
              { value: 'mri', label: 'MRI' },
              { value: 'xray', label: 'X-Ray' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredScans} />
      </Card>
    </div>
  );
};

export default RadiologyList;
