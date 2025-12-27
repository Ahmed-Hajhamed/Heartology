import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import '../../styles/pages/UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="page-container">Loading profile...</div>;
  if (!user) return <div className="page-container">User not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Profile</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="profile-grid">
        <Card title="Account Details">
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className={`tag tag-${user.role}`}>{user.role}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{user.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Date of Birth:</label>
              <span>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Role Specific Actions */}
        {user.role === 'patient' && (
          <Card title="Patient Actions">
            <div className="quick-links">
               {/* We use a search/filter trick to find the patient profile linked to this user */}
              <Button size="small" onClick={() => navigate(`/patients`)}>Go to Patient List</Button>
            </div>
          </Card>
        )}

        {user.role === 'doctor' && (
          <Card title="Doctor Actions">
            <div className="quick-links">
              <Button size="small" onClick={() => navigate(`/doctors`)}>Go to Doctor Directory</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;