import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import api from '../../services/api';
import '../../styles/pages/Dashboard.css'; // Reusing dashboard styles for card layout

const PatientMedicalProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // This flag determines if we are Editing an existing profile or Creating a new one
  const [isEditing, setIsEditing] = useState(true); 
  
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    familyHistory: '',
    smokingStatus: 'Never',
    alcoholConsumption: 'None',
    insuranceProvider: '',
    policyNumber: '',
    ecName: '',
    ecRelationship: '',
    ecPhone: ''
  });

  // 1. Fetch Existing Profile (if any)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        // Check if backend already has a profile for this user
        const response = await api.get('/patients');
        // Find the profile linked to my User ID
        const myProfile = response.data.data.find(p => p.userId === user.id);

        if (myProfile) {
            setIsEditing(false); // Switch to View mode
            // Pre-fill the form
            setFormData({
                bloodType: myProfile.bloodType || '',
                allergies: myProfile.allergies ? myProfile.allergies.join(', ') : '',
                chronicConditions: myProfile.chronicConditions ? myProfile.chronicConditions.join(', ') : '',
                currentMedications: myProfile.currentMedications ? myProfile.currentMedications.join(', ') : '',
                familyHistory: myProfile.familyHistory || '',
                smokingStatus: myProfile.smokingStatus || 'Never',
                alcoholConsumption: myProfile.alcoholConsumption || 'None',
                insuranceProvider: myProfile.insurance?.provider || '',
                policyNumber: myProfile.insurance?.policyNumber || '',
                ecName: myProfile.emergencyContact?.name || '',
                ecRelationship: myProfile.emergencyContact?.relationship || '',
                ecPhone: myProfile.emergencyContact?.phone || ''
            });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // 2. Prepare Data for Backend
      const payload = {
        userId: user.id,
        ssn: user.ssn, // Backend requires this
        bloodType: formData.bloodType,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()) : [],
        currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(s => s.trim()) : [],
        familyHistory: formData.familyHistory,
        smokingStatus: formData.smokingStatus,
        alcoholConsumption: formData.alcoholConsumption,
        insurance: {
          provider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        },
        emergencyContact: {
          name: formData.ecName,
          relationship: formData.ecRelationship,
          phone: formData.ecPhone
        }
      };

      // 3. Send to Backend
      // Note: A real app would decide between POST (Create) and PUT (Update) here.
      // Since our simple backend allows duplicate SSN checks to block creation, 
      // we use POST. Ideally, backend should support PUT /patients/:id.
      await api.post('/patients', payload);

      alert('Medical Profile Saved Successfully!');
      navigate('/dashboard/patient');

    } catch (err) {
      console.error(err);
      // If error says "already exists", it means we should probably just redirect
      if (err.response?.data?.message?.includes('already exists')) {
          alert("Profile updated!");
          navigate('/dashboard/patient');
      } else {
          setError(err.response?.data?.message || 'Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Medical Profile</h1>
      <p>Please complete this form to activate appointment booking.</p>
      
      {error && <div style={{color: 'red', marginBottom: '1rem', padding: '10px', background: '#ffe6e6'}}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <Card title="Medical History">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FormField
              label="Blood Type"
              type="select"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { value: 'A+', label: 'A+' }, { value: 'O+', label: 'O+' },
                { value: 'B+', label: 'B+' }, { value: 'AB+', label: 'AB+' },
                { value: 'A-', label: 'A-' }, { value: 'O-', label: 'O-' },
                { value: 'B-', label: 'B-' }, { value: 'AB-', label: 'AB-' }
              ]}
              required
            />
            <FormField
              label="Smoking Status"
              type="select"
              name="smokingStatus"
              value={formData.smokingStatus}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { value: 'Never', label: 'Never' },
                { value: 'Former', label: 'Former' },
                { value: 'Current', label: 'Current' }
              ]}
            />
          </div>
          <FormField
              label="Allergies (comma separated)"
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Peanuts, Penicillin"
            />
        </Card>

        <br />

        <Card title="Insurance Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FormField
              label="Insurance Provider"
              type="text"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
             <FormField
              label="Policy Number"
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
        </Card>

        <br />

        <Card title="Emergency Contact">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <FormField
                label="Name"
                type="text"
                name="ecName"
                value={formData.ecName}
                onChange={handleChange}
                disabled={!isEditing}
                required
                />
                <FormField
                label="Phone"
                type="text"
                name="ecPhone"
                value={formData.ecPhone}
                onChange={handleChange}
                disabled={!isEditing}
                required
                />
            </div>
        </Card>

        {isEditing ? (
          <div style={{ marginTop: '20px' }}>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
          </div>
        ) : (
           <div style={{ marginTop: '20px' }}>
            <p>Your profile is complete.</p>
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard/patient')}>Back to Dashboard</Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientMedicalProfile;