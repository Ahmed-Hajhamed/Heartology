import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const AppointmentBooking = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '30',
    type: '',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking appointment:', formData);
    navigate('/appointments');
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
            <FormField
              label="Patient"
              type="select"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              options={[
                { value: '1', label: 'John Doe' },
                { value: '2', label: 'Jane Smith' },
                { value: '3', label: 'Robert Johnson' }
              ]}
              required
            />

            <FormField
              label="Doctor"
              type="select"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={[
                { value: '1', label: 'Dr. Sarah Johnson - Cardiology' },
                { value: '2', label: 'Dr. Michael Brown - Interventional Cardiology' },
                { value: '3', label: 'Dr. Emily Davis - Electrophysiology' }
              ]}
              required
            />

            <FormField
              label="Appointment Date"
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />

            <FormField
              label="Appointment Time"
              type="time"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
            />

            <FormField
              label="Duration (minutes)"
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
              label="Appointment Type"
              type="select"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'test', label: 'Test' }
              ]}
              required
            />
          </div>

          <FormField
            label="Reason for Visit"
            type="textarea"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Describe the reason for this appointment"
            required
          />
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Book Appointment</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentBooking;
