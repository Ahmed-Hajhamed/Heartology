import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import '../../styles/pages/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ssn: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    name: '',
    birthDate: '',
    gender: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registration data:', formData);
    navigate('/login');
  };

  return (
    <div className="auth-form register-form">
      <h2>Create New Account</h2>
      <p className="auth-subtitle">Register to access Heartology services</p>
      
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
