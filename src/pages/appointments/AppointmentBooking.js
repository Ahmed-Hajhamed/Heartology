import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api'; // Import your API service

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]); // List of doctors from DB
  const [patientId, setPatientId] = useState(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '30',
    type: 'Check-up', // Default matches backend enum
    reason: ''
  });

  // 1. Fetch Data on Load
  useEffect(() => {
    const initializeBooking = async () => {
      try {
        // A. Get Current User
        const user = JSON.parse(localStorage.getItem('user'));
        
        // B. Get Patient ID (if user is a patient)
        if (user.role === 'patient') {
            const pRes = await api.get('/patients');
            const myProfile = pRes.data.data.find(p => p.userId === user.id);
            if (myProfile) {
                setPatientId(myProfile.id);
            } else {
                alert("Please complete your medical profile first.");
                navigate('/patients/create');
                return;
            }
        }

        // C. Fetch Doctors for Dropdown
        const docRes = await api.get('/doctors');
        setDoctors(docRes.data.data);

      } catch (error) {
        console.error("Error loading booking data:", error);
      }
    };

    initializeBooking();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patientId: patientId, // The ID we found earlier
        doctorId: formData.doctorId,
        appointmentDate: formData.scheduledDate,
        appointmentTime: formData.scheduledTime,
        duration: parseInt(formData.duration),
        type: formData.type,
        reasonForVisit: formData.reason,
        status: 'Scheduled'
      };

      // Send to Backend
      await api.post('/appointments', payload);
      
      alert('Appointment Booked Successfully!');
      navigate('/dashboard/patient');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Book New Appointment</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Appointment Details">
          <div className="form-grid">
            {/* Doctor Selection */}
            <FormField
              label="Select Doctor"
              type="select"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={doctors.map(doc => ({
                value: doc.id,
                label: `Dr. ${doc.name || doc.lastName} (${doc.specialization})`
              }))}
              required
            />

            <div className="form-row">
                <FormField
                label="Date"
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                />

                <FormField
                label="Time"
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                />
            </div>

            <div className="form-row">
                <FormField
                label="Duration"
                type="select"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                options={[
                    { value: '15', label: '15 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '45', label: '45 minutes' },
                    { value: '60', label: '60 minutes' }
                ]}
                required
                />

                <FormField
                label="Type"
                type="select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                    { value: 'Check-up', label: 'Check-up' },
                    { value: 'Consultation', label: 'Consultation' },
                    { value: 'Follow-up', label: 'Follow-up' },
                    { value: 'Emergency', label: 'Emergency' }
                ]}
                required
                />
            </div>
          </div>

          <FormField
            label="Reason for Visit"
            type="textarea"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Describe your symptoms..."
            required
          />
        </Card>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;