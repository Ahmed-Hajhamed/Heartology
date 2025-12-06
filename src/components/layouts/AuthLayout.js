import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/layouts/AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon">❤️</div>
            <h1>Heartology</h1>
            <p className="tagline">Cardiology Center Information System</p>
          </div>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
        <div className="auth-footer">
          <p>&copy; 2025 Heartology Cardiology Center. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
