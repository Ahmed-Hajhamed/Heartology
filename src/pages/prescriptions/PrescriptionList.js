import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);
        
        let queryParams = '';

        // 1. Role-based filtering
        if (user.role === 'patient') {
            const pRes = await api.get('/patients');
            const myProfile = pRes.data.data.find(p => p.userId === user.id);
            if (myProfile) queryParams = `?patientId=${myProfile.id}`;
        } else if (user.role === 'doctor') {
            const dRes = await api.get('/doctors');
            const myProfile = dRes.data.data.find(d => d.userId === user.id);
            if (myProfile) queryParams = `?doctorId=${myProfile.id}`;
        }

        // 2. Fetch Data
        const response = await api.get(`/prescriptions${queryParams}`);
        
        // Fetch doctors and patients lists for name mapping
        const [doctorsRes, patientsRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients')
        ]);
        
        const doctorsList = doctorsRes.data.data;
        const patientsList = patientsRes.data.data;
        setDoctors(doctorsList);
        setPatients(patientsList);
        
        // 3. Map Data for Table with names instead of IDs
        const mappedData = await Promise.all(response.data.data.map(async (rx) => {
            // Get doctor name
            const doctor = doctorsList.find(d => d.id === rx.doctorId);
            const doctorName = doctor ? `Dr. ${doctor.name || doctor.lastName}` : 'Unknown Doctor';
            
            // Get patient name
            const patient = patientsList.find(p => p.id === rx.patientId);
            let patientName = 'Unknown Patient';
            if (patient && patient.userId) {
              try {
                const userRes = await api.get(`/users/${patient.userId}`);
                const userData = userRes.data.data;
                patientName = `${userData.firstName} ${userData.lastName}`;
              } catch (err) {
                console.error('Error fetching patient user data:', err);
              }
            }
            
            return {
                prescriptionId: rx.id,
                patientName: patientName,
                doctorName: doctorName,
                date: new Date(rx.prescriptionDate).toLocaleDateString(),
                medicationCount: rx.medications ? rx.medications.length : 0,
                status: rx.status,
                rawDate: rx.prescriptionDate
            };
        }));

        setPrescriptions(mappedData);

      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const columns = [
    { header: 'Prescription ID', accessor: 'prescriptionId' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Doctor Name', accessor: 'doctorName' },
    { header: 'Date', accessor: 'date' },
    { header: 'Medications', render: (row) => `${row.medicationCount} items` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status?.toLowerCase()}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          {/* We will fix the Details page next */}
          <Button size="small" onClick={() => navigate(`/prescriptions/${row.prescriptionId}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredPrescriptions = prescriptions.filter(rx =>
    !statusFilter || rx.status === statusFilter
  );

  if (loading) return <div className="page-container">Loading prescriptions...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Prescriptions</h1>
        {userRole === 'doctor' && (
            <Button onClick={() => navigate('/prescriptions/create')}>Create New Prescription</Button>
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
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        {filteredPrescriptions.length > 0 ? (
            <Table columns={columns} data={filteredPrescriptions} />
        ) : (
            <p style={{textAlign: 'center', padding: '20px'}}>No prescriptions found.</p>
        )}
      </Card>
    </div>
  );
};

export default PrescriptionList;