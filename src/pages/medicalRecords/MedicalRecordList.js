import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const MedicalRecordList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [userRole, setUserRole] = useState('');

  // 1. Fetch Records on Load
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);

        // Check for query params (e.g. ?patientId=123 from Patient Details page)
        const searchParams = new URLSearchParams(location.search);
        const patientIdParam = searchParams.get('patientId');
        
        let endpoint = '/medical-records';
        
        // Filter logic
        if (patientIdParam) {
            endpoint += `?patientId=${patientIdParam}`;
        } else if (user.role === 'patient') {
            // Get my own ID first
            const pRes = await api.get('/patients');
            const myProfile = pRes.data.data.find(p => p.userId === user.id);
            if (myProfile) endpoint += `?patientId=${myProfile.id}`;
        } else if (user.role === 'doctor') {
            // Doctors usually see all, or filtered by their ID. 
            // For now, let's show all or filter if backend supports it.
            const dRes = await api.get('/doctors');
            const myProfile = dRes.data.data.find(d => d.userId === user.id);
            if (myProfile) endpoint += `?doctorId=${myProfile.id}`;
        }

        const response = await api.get(endpoint);
        
        // 2. Enhance Data (Optional: Fetch Patient Names if missing)
        // For simplicity, we assume backend might populate names or we map them.
        // If backend sends raw IDs, the table will show IDs for now.
        setRecords(response.data.data);

      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [location.search]);

  const columns = [
    { header: 'Record ID', accessor: 'id' }, // Backend uses 'id' or '_id'
    { header: 'Record Date', render: (row) => new Date(row.recordDate).toLocaleDateString() },
    { 
      header: 'Type', 
      accessor: 'recordType',
      render: (row) => <span className="tag tag-info">{row.recordType}</span>
    },
    // Display Patient ID or Name if available
    { header: 'Patient ID', accessor: 'patientId' }, 
    { header: 'Diagnosis', render: (row) => row.diagnoses?.[0]?.description || 'N/A' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/medical-records/${row.id}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredRecords = records.filter(record =>
    !typeFilter || record.recordType === typeFilter
  );

  if (loading) return <div className="page-container">Loading medical records...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Records</h1>
        {/* Only Doctors can create records */}
        {['doctor', 'admin'].includes(userRole) && (
            <Button onClick={() => navigate('/medical-records/create')}>Create New Record</Button>
        )}
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Consultation', label: 'Consultation' },
              { value: 'Lab Results', label: 'Lab Result' },
              { value: 'Emergency', label: 'Emergency' },
              { value: 'Surgery', label: 'Surgery' }
            ]}
          />
        </div>

        {filteredRecords.length > 0 ? (
            <Table columns={columns} data={filteredRecords} />
        ) : (
            <p style={{padding: '20px', textAlign: 'center'}}>No records found.</p>
        )}
      </Card>
    </div>
  );
};

export default MedicalRecordList;