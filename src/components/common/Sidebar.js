import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/Sidebar.css';

const Sidebar = ({ user }) => {
  if (!user) return null;

  const getMenuItems = () => {
    const commonItems = [
      { path: `/dashboard/${user.role}`, label: 'Dashboard', icon: '📊' }
    ];

    switch (user.role) {
      case 'patient':
        return [
          ...commonItems,
          { path: '/appointments', label: 'My Appointments', icon: '📅' },
          { path: '/appointments/book', label: 'Book Appointment', icon: '➕' },
          { path: '/medical-records', label: 'Medical Records', icon: '📋' },
          { path: '/prescriptions', label: 'Prescriptions', icon: '💊' },
          { path: '/billing/invoices', label: 'Billing', icon: '💰' },
        ];

      case 'doctor':
        return [
          ...commonItems,
          { path: '/appointments', label: 'Appointments', icon: '📅' },
          { path: '/patients', label: 'Patients', icon: '👥' },
          { path: '/medical-records', label: 'Medical Records', icon: '📋' },
          { path: '/medical-records/create', label: 'New Record', icon: '➕' },
          { path: '/prescriptions', label: 'Prescriptions', icon: '💊' },
          { path: '/prescriptions/create', label: 'New Prescription', icon: '📝' },
          { path: '/radiology', label: 'Radiology', icon: '🔬' },
          { path: '/icd10', label: 'ICD-10 Lookup', icon: '🔍' },
        ];

      case 'admin':
        return [
          ...commonItems,
          { path: '/users', label: 'User Management', icon: '👤' },
          { path: '/patients', label: 'Patients', icon: '👥' },
          { path: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
          { path: '/appointments', label: 'Appointments', icon: '📅' },
          { path: '/medical-records', label: 'Medical Records', icon: '📋' },
          { path: '/billing/invoices', label: 'Billing', icon: '💰' },
          { path: '/radiology', label: 'Radiology', icon: '🔬' },
          { path: '/icd10', label: 'ICD-10 Lookup', icon: '🔍' },
          { path: '/reports', label: 'Reports', icon: '📈' },
        ];

      case 'staff':
        return [
          ...commonItems,
          { path: '/users', label: 'User Management', icon: '👤' },
          { path: '/appointments', label: 'Appointments', icon: '📅' },
          { path: '/appointments/book', label: 'Book Appointment', icon: '➕' },
          { path: '/billing/invoices', label: 'Billing', icon: '💰' },
          { path: '/billing/invoices/create', label: 'New Invoice', icon: '📄' },
          { path: '/radiology', label: 'Radiology', icon: '🔬' },
          { path: '/reports', label: 'Reports', icon: '📈' },
        ];

      default:
        return commonItems;
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {getMenuItems().map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
