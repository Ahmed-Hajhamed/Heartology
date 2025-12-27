import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');

  const [formData, setFormData] = useState({
    doctorId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '30',
    type: 'Check-up',
    reason: ''
  });

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];
  
  // Max date is 2 years from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // 1. Fetch Data on Load
  useEffect(() => {
    const initializeBooking = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);
        
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

        // C. If staff/admin, fetch all patients for dropdown with full details
        if (user.role === 'staff' || user.role === 'admin') {
          const patientsRes = await api.get('/patients');
          // Fetch full details for each patient to get names
          const patientsWithDetails = await Promise.all(
            patientsRes.data.data.map(async (p) => {
              try {
                const detailRes = await api.get(`/patients/${p.id}`);
                return detailRes.data.data;
              } catch {
                return p;
              }
            })
          );
          setPatients(patientsWithDetails);
        }

        // D. Fetch Doctors for Dropdown
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
    // Clear availability error when user changes selection
    setAvailabilityError('');
  };

  const handlePatientChange = (e) => {
    const value = e.target.value;
    if (value === 'new_patient') {
      navigate('/register');
    } else {
      setPatientId(value);
    }
  };

  // Validate doctor availability (skip for Emergency appointments)
  const validateDoctorAvailability = () => {
    // Skip availability check for Emergency appointments
    if (formData.type === 'Emergency') {
      return true;
    }

    if (!formData.doctorId || !formData.scheduledDate || !formData.scheduledTime) {
      return true; // Let required fields handle this
    }

    const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
    if (!selectedDoctor) return true;

    // Check working days
    const selectedDate = new Date(formData.scheduledDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[selectedDate.getDay()];

    if (selectedDoctor.workingDays && !selectedDoctor.workingDays.includes(selectedDayName)) {
      setAvailabilityError(`Dr. ${selectedDoctor.name || selectedDoctor.lastName} does not work on ${selectedDayName}. Working days: ${selectedDoctor.workingDays.join(', ')}`);
      return false;
    }

    // Check working hours
    if (selectedDoctor.workingHours) {
      const startTime = selectedDoctor.workingHours.start;
      const endTime = selectedDoctor.workingHours.end;
      const selectedTime = formData.scheduledTime;

      if (selectedTime < startTime || selectedTime > endTime) {
        setAvailabilityError(`Dr. ${selectedDoctor.name || selectedDoctor.lastName} works from ${startTime} to ${endTime}. Please select a time within working hours.`);
        return false;
      }
    }

    // Check doctor availability status
    if (selectedDoctor.availability && selectedDoctor.availability !== 'Available') {
      setAvailabilityError(`Dr. ${selectedDoctor.name || selectedDoctor.lastName} is currently ${selectedDoctor.availability}.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAvailabilityError('');

    // Validate year range
    const selectedYear = new Date(formData.scheduledDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear || selectedYear > currentYear + 2) {
      setAvailabilityError(`Please select a date within a valid year range (${currentYear} - ${currentYear + 2})`);
      setLoading(false);
      return;
    }

    // Validate doctor availability (skip for Emergency)
    if (formData.type !== 'Emergency' && !validateDoctorAvailability()) {
      setLoading(false);
      return;
    }

    // Validate patient ID for staff
    if ((userRole === 'staff' || userRole === 'admin') && !patientId) {
      setAvailabilityError('Please select a patient');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patientId: patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.scheduledDate,
        appointmentTime: formData.scheduledTime,
        duration: parseInt(formData.duration),
        type: formData.type,
        reasonForVisit: formData.reason,
        status: 'Scheduled'
      };

      await api.post('/appointments', payload);
      
      alert('Appointment Booked Successfully!');
      navigate(userRole === 'patient' ? '/dashboard/patient' : '/appointments');

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
          {availabilityError && (
            <div style={{color: 'red', marginBottom: '1rem', padding: '10px', background: '#ffe6e6', borderRadius: '4px'}}>
              {availabilityError}
            </div>
          )}

          <div className="form-grid">
            {/* Patient Selection (for Staff/Admin only) */}
            {(userRole === 'staff' || userRole === 'admin') && (
              <FormField
                label="Select Patient"
                type="select"
                name="patientId"
                value={patientId || ''}
                onChange={handlePatientChange}
                options={[
                  { value: '', label: '-- Select Patient --' },
                  ...patients.map(p => ({
                    value: p.id,
                    label: `${p.personalInfo?.firstName || 'Unknown'} ${p.personalInfo?.lastName || ''} (${p.ssn || 'N/A'})`
                  })),
                  { value: 'new_patient', label: '➕ Add New Patient' }
                ]}
                required
              />
            )}

            {/* Doctor Selection */}
            <FormField
              label="Select Doctor"
              type="select"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Select Doctor --' },
                ...doctors.map(doc => ({
                  value: doc.id,
                  label: `Dr. ${doc.name || doc.lastName} (${doc.specialization})${doc.availability && doc.availability !== 'Available' ? ` - ${doc.availability}` : ''}`
                }))
              ]}
              required
            />

            <div className="form-row">
              <FormField
                label="Date"
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={today}
                max={maxDateStr}
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