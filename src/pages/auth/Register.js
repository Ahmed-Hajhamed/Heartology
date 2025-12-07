import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import api from '../../services/api'; // Import your API service
import '../../styles/pages/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(''); // State to show errors
  const [formData, setFormData] = useState({
    ssn: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default to patient
    phone: '',
    name: '',
    birthDate: '',
    gender: 'male',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // 2. Prepare Data for Backend
      // The backend expects "firstName" and "lastName", but form has "name"
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        ssn: formData.ssn,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: firstName,
        lastName: lastName,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.birthDate,
        // Backend expects address as an object
        address: { 
          street: formData.address,
          city: '', // You can add these fields to the form later
          country: '' 
        }
      };

      // 3. Send to Backend
      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        // Optional: Auto-login here if you want
        console.log('Registration Successful:', response.data);
        alert('Registration successful! Please login.');
        navigate('/login');
      }

    } catch (err) {
      console.error('Registration Error:', err);
      // Show the exact error message from the backend (e.g. "User already exists")
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-form register-form">
      <h2>Create New Account</h2>
      <p className="auth-subtitle">Register to access Heartology services</p>
      
      {/* Show Error Message */}
      {error && <div className="alert alert-danger" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
          
          <FormField
            label="Social Security Number"
            type="text"
            name="ssn"
            value={formData.ssn}
            onChange={handleChange}
            placeholder="XXX-XX-XXXX"
            required
          />
        </div>

        <div className="form-row">
          <FormField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
          
          <FormField
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
            required
          />
        </div>

        <div className="form-row">
          <FormField
            label="Birth Date"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Gender"
            type="select"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            required
          />
        </div>

        <FormField
          label="Address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter address"
          required
        />

        <FormField
          label="Role"
          type="select"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: 'patient', label: 'Patient' },
            { value: 'doctor', label: 'Doctor' },
            { value: 'staff', label: 'Staff' }
          ]}
          required
        />

        <div className="form-row">
          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
          
          <FormField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
          />
        </div>
        
        <Button type="submit" variant="primary" className="auth-btn">
          Register
        </Button>
      </form>
      
      <div className="auth-links">
        <span>Already have an account?</span>
        <a href="/login">Login Here</a>
      </div>
    </div>
  );
};

export default Register;