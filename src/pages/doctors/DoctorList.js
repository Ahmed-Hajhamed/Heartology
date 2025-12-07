import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);

        const response = await api.get('/doctors');
        
        // Map Backend Data
        const mappedData = response.data.data.map(doc => ({
            doctorId: doc.id,
            name: doc.name || 'Unknown Doctor', // Backend controller sends this
            specialization: doc.specialization,
            email: doc.email || 'N/A', // Note: You might need to update backend to send this
            phone: doc.phone || 'N/A',
            yearsOfExperience: doc.yearsOfExperience
        }));

        setDoctors(mappedData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Experience', render: (row) => `${row.yearsOfExperience} years` },
    // Only show Actions to see details
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/doctors/${row.doctorId}`)}>View Profile</Button>
          {userRole === 'patient' && (
             <Button size="small" variant="secondary" onClick={() => navigate(`/appointments/book?doctorId=${row.doctorId}`)}>Book</Button>
          )}
        </div>
      )
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = !specializationFilter || doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpec;
  });

  if (loading) return <div className="page-container">Loading doctors...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doctor Directory</h1>
        {/* Only Admin adds doctors typically */}
        {['admin'].includes(userRole) && (
            <Button onClick={() => navigate('/register')}>Add New Doctor</Button>
        )}
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="text"
            placeholder="Search by name..."
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
              { value: 'Pediatrics', label: 'Pediatrics' },
              { value: 'Neurology', label: 'Neurology' },
              { value: 'Dermatology', label: 'Dermatology' }
            ]}
          />
        </div>

        {filteredDoctors.length > 0 ? (
            <Table columns={columns} data={filteredDoctors} />
        ) : (
            <p style={{textAlign: 'center', padding: '20px'}}>No doctors found.</p>
        )}
      </Card>
    </div>
  );
};

export default DoctorList;