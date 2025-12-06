import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import '../../styles/pages/UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    userId: userId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    ssn: '123-45-6789',
    role: 'patient',
    birthDate: '1985-05-15',
    gender: 'male',
    address: '123 Main St, City, State 12345'
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle update logic
    setIsEditing(false);
    console.log('Updated user data:', userData);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Profile</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <Card title="Personal Information">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="User ID"
              type="text"
              name="userId"
              value={userData.userId}
              disabled={true}
            />

            <FormField
              label="Role"
              type="text"
              name="role"
              value={userData.role}
              disabled={true}
            />

            <FormField
              label="Full Name"
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <FormField
              label="Social Security Number"
              type="text"
              name="ssn"
              value={userData.ssn}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <FormField
              label="Phone Number"
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <FormField
              label="Birth Date"
              type="date"
              name="birthDate"
              value={userData.birthDate}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />

            <FormField
              label="Gender"
              type="select"
              name="gender"
              value={userData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
              required
            />
          </div>

          <FormField
            label="Address"
            type="text"
            name="address"
            value={userData.address}
            onChange={handleChange}
            disabled={!isEditing}
            required
          />

          {isEditing && (
            <div className="form-actions">
              <Button type="submit" variant="primary">Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </form>
      </Card>

      {userData.role === 'patient' && (
        <Card title="Patient Quick Links">
          <div className="quick-links">
            <Button onClick={() => navigate(`/patients/${userId}`)}>View Patient Details</Button>
            <Button variant="secondary" onClick={() => navigate(`/patients/${userId}/medical-profile`)}>Medical Profile</Button>
          </div>
        </Card>
      )}

      {userData.role === 'doctor' && (
        <Card title="Doctor Quick Links">
          <div className="quick-links">
            <Button onClick={() => navigate(`/doctors/${userId}`)}>View Doctor Details</Button>
            <Button variant="secondary" onClick={() => navigate(`/doctors/${userId}/schedule`)}>Manage Schedule</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
