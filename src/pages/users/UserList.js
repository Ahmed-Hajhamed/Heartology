import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages/UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users on Load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // NOTE: This assumes you have a GET /api/users endpoint.
        // If this fails with 404, we need to create the UserController in the backend.
        const response = await api.get('/users');
        
        const mappedData = response.data.data.map(user => ({
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone || 'N/A',
            ssn: user.ssn || '***-**-****' // Mask SSN for privacy
        }));

        setUsers(mappedData);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback for demo if backend endpoint is missing
        if (error.response && error.response.status === 404) {
            alert("Backend Warning: GET /api/users endpoint might be missing.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => <span className={`tag tag-${row.role}`}>{row.role}</span> 
    },
    { header: 'Phone', accessor: 'phone' },
    { header: 'SSN', accessor: 'ssn' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/users/${row.userId}`)}>View</Button>
        </div>
      )
    }
  ];

  // 2. Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="page-container">Loading users...</div>;

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

        {filteredUsers.length > 0 ? (
            <Table columns={columns} data={filteredUsers} />
        ) : (
            <p style={{textAlign: 'center', padding: '20px'}}>No users found.</p>
        )}
      </Card>
    </div>
  );
};

export default UserList;