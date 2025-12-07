import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}`);
        setDoctor(response.data.data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  if (loading) return <div className="page-container">Loading profile...</div>;
  if (!doctor) return <div className="page-container">Doctor not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doctor Profile</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="details-grid">
        <Card title="Professional Info">
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span style={{fontWeight: 'bold', fontSize: '1.1em'}}>Dr. {doctor.firstName} {doctor.lastName}</span>
            </div>
            <div className="info-item">
              <label>Specialization:</label>
              <span className="tag tag-info">{doctor.specialization}</span>
            </div>
            <div className="info-item">
              <label>Experience:</label>
              <span>{doctor.yearsOfExperience} years</span>
            </div>
            <div className="info-item">
              <label>License:</label>
              <span>{doctor.licenseNumber}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{doctor.email}</span>
            </div>
          </div>
        </Card>

        <Card title="Schedule & Availability">
          <div className="info-grid">
            <div className="info-item full-width">
              <label>Working Days:</label>
              <div className="tag-list" style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                {doctor.workingDays && doctor.workingDays.map((day, i) => (
                  <span key={i} className="tag tag-success">{day}</span>
                ))}
              </div>
            </div>
            <div className="info-item">
              <label>Hours:</label>
              <span>{doctor.workingHours?.start} - {doctor.workingHours?.end}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status status-${doctor.availability === 'Available' ? 'active' : 'inactive'}`}>
                {doctor.availability}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Actions" className="mt-4">
        <div className="quick-actions">
            <Button onClick={() => navigate(`/appointments/book?doctorId=${doctor.id}`)}>
                Book Appointment
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDetails;