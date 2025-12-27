import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/firebase'; // Ensure this path matches your folder structure
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import api from '../../services/api';
import '../../styles/pages/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    ssn: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'male',
    building: '',
    street: '',
    city: ''
  });

  // Get today's date for max birth date validation
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Phone validation (10-15 characters)
    if (formData.phone.length < 10 || formData.phone.length > 15) {
      setError('Phone number must be between 10 and 15 characters');
      return;
    }

    // Birth date validation (no future dates)
    if (new Date(formData.birthDate) > new Date()) {
      setError('Birth date cannot be in the future');
      return;
    }

    try {
      // 2. Create User in Firebase Authentication first
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // 3. Prepare Data for Backend (using Firebase UID)
      const payload = {
        uid: firebaseUser.uid, // CRITICAL: Send Firebase UID to backend
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ssn: formData.ssn,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.birthDate,
        address: {
          building: formData.building,
          street: formData.street,
          city: formData.city
        }
      };

      // 4. Save Profile to Backend
      await api.post('/auth/register', payload);

      // 5. Auto Login (Get Token)
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('accessToken', token);
      
      alert("Registration Successful!");
      navigate('/login');

    } catch (err) {
      console.error(err);
      // specific error handling for firebase or backend
      if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="auth-form register-form">
      <h2>Create New Account</h2>
      <p className="auth-subtitle">Register to access Heartology services</p>
      
      {error && <div className="error-alert" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
          
          <FormField
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>

        <div className="form-row">
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
            minLength={10}
            maxLength={15}
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
            max={today}
            required
          />
          
          <FormField
            label="Gender"
            type="select"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            required
          />
        </div>

        <div className="form-row">
          <FormField
            label="Building"
            type="text"
            name="building"
            value={formData.building}
            onChange={handleChange}
            placeholder="Building number/name"
            required
          />
          
          <FormField
            label="Street"
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Street name"
            required
          />
          
          <FormField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>

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