import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/PatientList.css';

const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Patients on Load
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients');
        
        // 2. Map Backend Data to Table Format
        const mappedData = response.data.data.map(p => ({
            patientId: p.id,
            // Access personal info from the joined user data (if backend sends it)
            // Or fallback to top-level fields if your backend structure varies
            name: p.personalInfo ? `${p.personalInfo.firstName} ${p.personalInfo.lastName}` : 'Unknown',
            email: p.personalInfo?.email || 'N/A',
            phone: p.personalInfo?.phone || 'N/A',
            bloodType: p.bloodType || 'N/A',
            lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'Never'
        }));

        setPatients(mappedData);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Blood Type', 
      accessor: 'bloodType',
      render: (row) => <span className="tag tag-info">{row.bloodType}</span> 
    },
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

  // 3. Filter Logic (Applies to the real data)
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="page-container">Loading patients...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Management</h1>
        {/* Only Staff/Admins usually add new patients manually */}
        <Button onClick={() => navigate('/register')}>Add New Patient</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPatients.length > 0 ? (
            <Table columns={columns} data={filteredPatients} />
        ) : (
            <p style={{textAlign: 'center', padding: '20px'}}>No patients found.</p>
        )}
      </Card>
    </div>
  );
};

export default PatientList;