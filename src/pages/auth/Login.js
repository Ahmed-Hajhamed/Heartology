import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      // 1. Authenticate with Firebase Auth first
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // 2. Get Firebase token
      const firebaseToken = await firebaseUser.getIdToken();

      // 3. Get user profile from backend using Firebase UID
      // The backend will find the user by uid and return the profile
      const response = await api.post('/auth/login', {
        uid: firebaseUser.uid,
        email: formData.email
      });

      if (response.data.success) {
        const { user, token } = response.data;

        // Save the JWT token from backend (not Firebase token) & User
        // The backend returns a custom JWT token that the middleware expects
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
      // Handle Firebase Auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Login failed. Please try again.');
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