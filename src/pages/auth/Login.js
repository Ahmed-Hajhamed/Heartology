import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import '../../styles/pages/Auth.css';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication - Replace with actual API call
    const mockUser = {
      userId: '123',
      name: 'Dr. John Smith',
      email: formData.email,
      role: 'doctor', // Can be: patient, doctor, admin, staff
      phone: '+1234567890'
    };

    setUser(mockUser);
    navigate(`/dashboard/${mockUser.role}`);
  };

  return (
    <div className="auth-form">
      <h2>Login to Heartology</h2>
      <p className="auth-subtitle">Enter your credentials to access the system</p>
      
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
        
        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
        
        <Button type="submit" variant="primary" className="auth-btn">
          Login
        </Button>
      </form>
      
      <div className="auth-links">
        <a href="/forgot-password">Forgot Password?</a>
        <span>•</span>
        <a href="/register">Create New Account</a>
      </div>
    </div>
  );
};

export default Login;
