import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [scheduleData, setScheduleData] = useState({
    workingDays: [],
    startTime: '09:00',
    endTime: '17:00',
    availability: 'Available'
  });

  const daysOfWeek = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  // 1. Fetch Existing Schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}`);
        const doc = response.data.data;
        
        setScheduleData({
            workingDays: doc.workingDays || [],
            startTime: doc.workingHours?.start || '09:00',
            endTime: doc.workingHours?.end || '17:00',
            availability: doc.availability || 'Available'
        });
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [doctorId]);

  const handleDayToggle = (day) => {
    setScheduleData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleChange = (e) => {
    setScheduleData({ ...scheduleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // 2. Save Schedule to Backend
        await api.put(`/doctors/${doctorId}/schedule`, {
            workingDays: scheduleData.workingDays,
            workingHours: {
                start: scheduleData.startTime,
                end: scheduleData.endTime
            },
            availability: scheduleData.availability
        });
        alert('Schedule updated successfully!');
        navigate(`/doctors/${doctorId}`);
    } catch (error) {
        console.error(error);
        alert('Failed to update schedule.');
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Schedule</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Working Hours">
          <div className="form-grid">
            <FormField
              label="Start Time"
              type="time"
              name="startTime"
              value={scheduleData.startTime}
              onChange={handleChange}
              required
            />
            <FormField
              label="End Time"
              type="time"
              name="endTime"
              value={scheduleData.endTime}
              onChange={handleChange}
              required
            />
             <FormField
              label="Status"
              type="select"
              name="availability"
              value={scheduleData.availability}
              onChange={handleChange}
              options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Busy', label: 'Busy' },
                  { value: 'On Leave', label: 'On Leave' }
              ]}
            />
          </div>
        </Card>

        <Card title="Working Days">
          <div className="days-grid" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            {daysOfWeek.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={scheduleData.workingDays.includes(day.value) ? 'primary' : 'outline'}
                onClick={() => handleDayToggle(day.value)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </Card>

        <div className="form-actions" style={{marginTop: '20px'}}>
          <Button type="submit" variant="primary">Save Schedule</Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;