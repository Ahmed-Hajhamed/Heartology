import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [patientName, setPatientName] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Invoice on Load
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await api.get(`/billing/invoices/${invoiceId}`);
        const invData = response.data.data;
        setInvoice(invData);

        // 2. Fetch Patient Name
        if (invData.patientId) {
            try {
                // Try fetching from patient profile first
                const pRes = await api.get(`/patients/${invData.patientId}`);
                const pData = pRes.data.data;
                const name = pData.personalInfo 
                    ? `${pData.personalInfo.firstName} ${pData.personalInfo.lastName}`
                    : 'Unknown Patient';
                setPatientName(name);
            } catch (err) {
                setPatientName('Unknown ID');
            }
        }

      } catch (error) {
        console.error("Error fetching invoice:", error);
        alert("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  // 3. Handle Payment (Simulation)
  const handlePayment = async () => {
      const confirmPayment = window.confirm(`Process payment of $${invoice.balanceAmount.toFixed(2)}?`);
      if (!confirmPayment) return;

      try {
          // In a real app, this would redirect to Stripe/PayPal or open a modal
          // For now, we update the status to 'Paid'
          await api.put(`/billing/invoices/${invoiceId}`, {
              status: 'Paid',
              paidAmount: invoice.totalAmount,
              balanceAmount: 0
          });
          
          alert("Payment Processed Successfully!");
          window.location.reload(); // Refresh to see new status

      } catch (error) {
          console.error(error);
          alert("Payment failed.");
      }
  };

  if (loading) return <div className="page-container">Loading invoice...</div>;
  if (!invoice) return <div className="page-container">Invoice not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoice Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => window.print()}>Print Invoice</Button>
          
          {/* Only show Pay button if balance > 0 */}
          {invoice.status !== 'Paid' && invoice.balanceAmount > 0 && (
            <Button variant="primary" onClick={handlePayment}>
                Process Payment
            </Button>
          )}
        </div>
      </div>

      <div className="invoice-header-card" style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
          <Card className="flex-1">
              <h3>Patient Info</h3>
              <p><strong>Name:</strong> {patientName}</p>
              <p><strong>Patient ID:</strong> {invoice.patientId}</p>
          </Card>
          <Card className="flex-1">
              <h3>Invoice Info</h3>
              <p><strong>Invoice #:</strong> {invoice.id}</p>
              <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`status status-${invoice.status?.toLowerCase()}`}>{invoice.status}</span></p>
          </Card>
      </div>

      <Card title="Services & Charges">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.services && invoice.services.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>${item.unitPrice?.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{borderTop: '2px solid #eee'}}>
              <td colSpan="4" style={{textAlign: 'right', fontWeight: 'bold', paddingTop: '10px'}}>Total Amount:</td>
              <td style={{fontWeight: 'bold', paddingTop: '10px'}}>${invoice.totalAmount?.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{textAlign: 'right', color: 'green'}}>Paid:</td>
              <td style={{color: 'green'}}>${invoice.paidAmount?.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{textAlign: 'right', color: 'red', fontWeight: 'bold'}}>Balance Due:</td>
              <td style={{color: 'red', fontWeight: 'bold'}}>${invoice.balanceAmount?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
};

export default InvoiceDetails;