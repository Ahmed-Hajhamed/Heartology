import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user.role);
        
        let queryParams = '';

        // 1. Role-based filtering
        if (user.role === 'patient') {
            const pRes = await api.get('/patients');
            const myProfile = pRes.data.data.find(p => p.userId === user.id);
            if (myProfile) queryParams = `?patientId=${myProfile.id}`;
        }
        // Staff/Admin see all by default

        // 2. Fetch Data
        // Note: Ensure your backend route is /invoices or /billing/invoices based on server.js
        const response = await api.get(`/billing/invoices${queryParams}`);
        
        // 3. Map Data
        const mappedData = response.data.data.map(inv => {
            // Use invoiceDate, createdAt, or fallback to current date
            const dateValue = inv.invoiceDate || inv.createdAt || new Date().toISOString();
            const dateObj = new Date(dateValue);
            
            return {
                invoiceId: inv.id,
                patientName: inv.patientName || inv.patientId, // Use patientName if available
                issueDate: isNaN(dateObj.getTime()) ? 'Invalid Date' : dateObj.toLocaleDateString(),
                totalAmount: inv.totalAmount || 0,
                status: inv.status,
                rawDate: dateValue
            };
        });

        setInvoices(mappedData);

      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const columns = [
    { header: 'Invoice ID', accessor: 'invoiceId' },
    { header: 'Patient Name', accessor: 'patientName' },
    { header: 'Issue Date', accessor: 'issueDate' },
    { header: 'Amount', render: (row) => `$${row.totalAmount.toFixed(2)}` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status?.toLowerCase()}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/billing/invoices/${row.invoiceId}`)}>View</Button>
        </div>
      )
    }
  ];

  const filteredInvoices = invoices.filter(inv =>
    !statusFilter || inv.status === statusFilter
  );

  const totalPending = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (loading) return <div className="page-container">Loading invoices...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Billing & Invoices</h1>
        {['admin', 'staff'].includes(userRole) && (
            <Button onClick={() => navigate('/billing/invoices/create')}>Create New Invoice</Button>
        )}
      </div>

      <div className="stats-row">
        <Card className="stat-card-small">
          <h3>Total Pending</h3>
          <p className="stat-value">${totalPending.toFixed(2)}</p>
        </Card>
        <Card className="stat-card-small">
          <h3>Total Invoices</h3>
          <p className="stat-value">{invoices.length}</p>
        </Card>
      </div>

      <Card>
        <div className="filters">
          <FormField
            type="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        {filteredInvoices.length > 0 ? (
            <Table columns={columns} data={filteredInvoices} />
        ) : (
            <p style={{textAlign: 'center', padding: '20px'}}>No invoices found.</p>
        )}
      </Card>
    </div>
  );
};

export default InvoiceList;