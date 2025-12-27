import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import api from '../../services/api';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Call Backend to Login
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Save Token & User
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update Global State
        if (setUser) setUser(user);

        // Redirect based on role
        console.log('Logged in as:', user.role);
        switch (user.role) {
          case 'doctor':
            navigate('/dashboard/doctor');
            break;
          case 'patient':
            navigate('/dashboard/patient');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'staff':
            navigate('/dashboard/staff');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-form">
      <h2>Login to Heartology</h2>
      <p className="auth-subtitle">Enter your credentials to access the system</p>

      {error && <div className="error-alert" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

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