import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/firebase';
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
      // 1. Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Get JWT Token
      const token = await user.getIdToken();
      localStorage.setItem('accessToken', token);

      // 3. Call Backend to get Role and Profile Data
      // We send a request to /auth/login with the token header
      const response = await api.post('/auth/login', {}, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
          const dbUser = response.data.user;
          
          // Save User Data
          localStorage.setItem('user', JSON.stringify(dbUser));
          
          // Update Global State
          if (setUser) setUser(dbUser);

          // Redirect based on role
          console.log('Logged in as:', dbUser.role);
          switch(dbUser.role) {
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
      // Handle Firebase specific errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-form">
      <h2>Login to Heartology</h2>
      <p className="auth-subtitle">Enter your credentials to access the system</p>
      
      {error && <div className="error-alert" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      
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