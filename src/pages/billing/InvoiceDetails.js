import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const invoiceData = {
    invoiceId: invoiceId,
    patientName: 'John Doe',
    patientId: '1',
    issueDate: '2025-12-05',
    status: 'pending',
    services: [
      { serviceName: 'Cardiology Consultation', price: 150.00 },
      { serviceName: 'ECG Test', price: 200.00 },
      { serviceName: 'Blood Pressure Monitoring', price: 50.00 },
      { serviceName: 'Lab Work', price: 150.00 }
    ],
    totalPrice: 550.00,
    payments: []
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoice Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          {invoiceData.status === 'pending' && (
            <Button onClick={() => navigate(`/billing/payment/${invoiceId}`)}>Process Payment</Button>
          )}
          <Button variant="secondary" onClick={() => window.print()}>Print Invoice</Button>
        </div>
      </div>

      <Card title="Invoice Information">
        <div className="info-grid">
          <div className="info-item">
            <label>Invoice ID:</label>
            <span>{invoiceData.invoiceId}</span>
          </div>
          <div className="info-item">
            <label>Issue Date:</label>
            <span>{invoiceData.issueDate}</span>
          </div>
          <div className="info-item">
            <label>Patient:</label>
            <span>{invoiceData.patientName}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status status-${invoiceData.status}`}>{invoiceData.status}</span>
          </div>
        </div>
      </Card>

      <Card title="Services">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Service Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.services.map((service, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{service.serviceName}</td>
                <td>${service.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="2"><strong>Total Amount</strong></td>
              <td><strong>${invoiceData.totalPrice.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {invoiceData.payments.length > 0 && (
        <Card title="Payment History">
          <div className="payment-history">
            {invoiceData.payments.map((payment, index) => (
              <div key={index} className="payment-item">
                <span>Payment #{payment.paymentId}</span>
                <span>${payment.amount.toFixed(2)}</span>
                <span>{payment.method}</span>
                <span>{payment.paymentDate}</span>
                <span className={`status status-${payment.status}`}>{payment.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/patients/${invoiceData.patientId}`)}>View Patient Profile</Button>
          <Button variant="secondary" onClick={() => navigate('/billing/invoices')}>Back to Invoices</Button>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
