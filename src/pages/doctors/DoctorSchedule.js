import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [scheduleData, setScheduleData] = useState({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '17:00'
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleDayToggle = (day) => {
    setScheduleData({
      ...scheduleData,
      workingDays: scheduleData.workingDays.includes(day)
        ? scheduleData.workingDays.filter(d => d !== day)
        : [...scheduleData.workingDays, day]
    });
  };

  const handleChange = (e) => {
    setScheduleData({
      ...scheduleData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated schedule:', scheduleData);
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manage Doctor Schedule</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Working Schedule">
          <div className="schedule-section">
            <label className="section-label">Working Days</label>
            <div className="day-selector">
              {daysOfWeek.map((day) => (
                <label key={day.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={scheduleData.workingDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>

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
          </div>
        </Card>

        <Card title="Weekly Schedule Overview">
          <div className="weekly-overview">
            {scheduleData.workingDays.map((day) => (
              <div key={day} className="day-schedule">
                <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                <span className="day-hours">{scheduleData.startTime} - {scheduleData.endTime}</span>
              </div>
            ))}
            {scheduleData.workingDays.length === 0 && (
              <p className="no-schedule">No working days selected</p>
            )}
          </div>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Save Schedule</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
