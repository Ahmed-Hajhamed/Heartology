import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const doctorData = {
    doctorId: doctorId,
    name: 'Dr. Sarah Johnson',
    email: 'sarah@heartology.com',
    phone: '+1234567891',
    specialization: 'Cardiology',
    qualifications: ['MD - Cardiology', 'Board Certified Cardiologist', 'FACC'],
    licenseNumber: 'MD123456',
    yearsOfExperience: 15,
    availability: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00'
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doctor Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/doctors/${doctorId}/schedule`)}>Manage Schedule</Button>
        </div>
      </div>

      <div className="details-grid">
        <Card title="Personal Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Doctor ID:</label>
              <span>{doctorData.doctorId}</span>
            </div>
            <div className="info-item">
              <label>Full Name:</label>
              <span>{doctorData.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{doctorData.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{doctorData.phone}</span>
            </div>
          </div>
        </Card>

        <Card title="Professional Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Specialization:</label>
              <span className="tag tag-primary">{doctorData.specialization}</span>
            </div>
            <div className="info-item">
              <label>License Number:</label>
              <span>{doctorData.licenseNumber}</span>
            </div>
            <div className="info-item">
              <label>Years of Experience:</label>
              <span>{doctorData.yearsOfExperience} years</span>
            </div>
            <div className="info-item full-width">
              <label>Qualifications:</label>
              <div className="tag-list">
                {doctorData.qualifications.map((qual, index) => (
                  <span key={index} className="tag tag-info">{qual}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Availability">
          <div className="info-grid">
            <div className="info-item full-width">
              <label>Working Days:</label>
              <div className="tag-list">
                {doctorData.availability.workingDays.map((day, index) => (
                  <span key={index} className="tag tag-success">{day}</span>
                ))}
              </div>
            </div>
            <div className="info-item">
              <label>Start Time:</label>
              <span>{doctorData.availability.startTime}</span>
            </div>
            <div className="info-item">
              <label>End Time:</label>
              <span>{doctorData.availability.endTime}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/appointments?doctorId=${doctorId}`)}>View Appointments</Button>
          <Button variant="secondary" onClick={() => navigate(`/medical-records?doctorId=${doctorId}`)}>View Medical Records</Button>
          <Button variant="secondary" onClick={() => navigate(`/patients`)}>View Patients</Button>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDetails;
