import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Mock data
  const users = [
    { userId: '1', name: 'John Doe', email: 'john@example.com', role: 'patient', phone: '+1234567890', ssn: '***-**-1234' },
    { userId: '2', name: 'Dr. Sarah Johnson', email: 'sarah@heartology.com', role: 'doctor', phone: '+1234567891', ssn: '***-**-5678' },
    { userId: '3', name: 'Jane Smith', email: 'jane@heartology.com', role: 'staff', phone: '+1234567892', ssn: '***-**-9012' },
    { userId: '4', name: 'Admin User', email: 'admin@heartology.com', role: 'admin', phone: '+1234567893', ssn: '***-**-3456' },
  ];

  const columns = [
    { header: 'User ID', accessor: 'userId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'SSN', accessor: 'ssn' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => <span className={`role-badge role-${row.role}`}>{row.role}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/users/${row.userId}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <Button onClick={() => navigate('/register')}>Add New User</Button>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormField
            type="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'patient', label: 'Patient' },
              { value: 'doctor', label: 'Doctor' },
              { value: 'admin', label: 'Admin' },
              { value: 'staff', label: 'Staff' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredUsers} />
      </Card>
    </div>
  );
};

export default UserList;
