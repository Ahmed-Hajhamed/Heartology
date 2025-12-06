import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const invoices = [
    { 
      invoiceId: '1', 
      patientName: 'John Doe',
      issueDate: '2025-12-05',
      totalAmount: 550.00,
      status: 'pending'
    },
    { 
      invoiceId: '2', 
      patientName: 'Jane Smith',
      issueDate: '2025-12-03',
      totalAmount: 320.00,
      status: 'paid'
    },
    { 
      invoiceId: '3', 
      patientName: 'Robert Johnson',
      issueDate: '2025-12-01',
      totalAmount: 890.00,
      status: 'paid'
    },
  ];

  const columns = [
    { header: 'Invoice ID', accessor: 'invoiceId' },
    { header: 'Patient', accessor: 'patientName' },
    { header: 'Issue Date', accessor: 'issueDate' },
    { 
      header: 'Total Amount', 
      render: (row) => `$${row.totalAmount.toFixed(2)}`
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <span className={`status status-${row.status}`}>{row.status}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <Button size="small" onClick={() => navigate(`/billing/invoices/${row.invoiceId}`)}>View</Button>
          {row.status === 'pending' && (
            <Button size="small" variant="primary" onClick={() => navigate(`/billing/payment/${row.invoiceId}`)}>Pay</Button>
          )}
        </div>
      )
    }
  ];

  const filteredInvoices = invoices.filter(inv =>
    !statusFilter || inv.status === statusFilter
  );

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Billing & Invoices</h1>
        <Button onClick={() => navigate('/billing/invoices/create')}>Create New Invoice</Button>
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
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        </div>

        <Table columns={columns} data={filteredInvoices} />
      </Card>
    </div>
  );
};

export default InvoiceList;
