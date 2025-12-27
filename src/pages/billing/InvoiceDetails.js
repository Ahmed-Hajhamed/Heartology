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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // 1. Fetch Invoice on Load
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await api.get(`/billing/invoices/${invoiceId}`);
        const invData = response.data.data;
        setInvoice(invData);
        setPaymentAmount(invData.balanceAmount || invData.totalAmount || 0);

        // 2. Fetch Patient Name
        if (invData.patientId) {
          try {
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

  // 3. Handle Payment (Full Payment Only)
  const handlePayment = async () => {
    try {
      const response = await api.post(`/billing/invoices/${invoiceId}/pay`, {
        paymentMethod: paymentMethod
      });

      alert(response.data.message);
      setShowPaymentModal(false);
      // Navigate back to invoices list instead of reloading
      navigate('/billing/invoices');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Payment failed.");
    }
  };

  if (loading) return <div className="page-container">Loading invoice...</div>;
  if (!invoice) return <div className="page-container">Invoice not found.</div>;

  const balance = invoice.balanceAmount ?? (invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoice Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => window.print()}>Print Invoice</Button>

          {/* Only show Pay button if balance > 0 */}
          {invoice.status !== 'Paid' && balance > 0 && (
            <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
              💳 Pay Now
            </Button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <Card style={{ width: '400px', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>💳 Process Payment</h2>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Amount to Pay:</p>
              <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>{balance?.toFixed(2)} EGP</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={handlePayment}>Confirm Payment</Button>
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="invoice-header-card" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Card className="flex-1">
          <h3>Patient Info</h3>
          <p><strong>Name:</strong> {patientName}</p>
          <p><strong>Patient ID:</strong> {invoice.patientId}</p>
        </Card>
        <Card className="flex-1">
          <h3>Invoice Info</h3>
          <p><strong>Invoice #:</strong> {invoice.invoiceNumber || invoice.id}</p>
          <p><strong>Date:</strong> {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
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
            {invoice.items && invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{(item.unitPrice || item.amount)?.toFixed(2)} EGP</td>
                <td>{item.quantity || 1}</td>
                <td>{(item.total || item.amount)?.toFixed(2)} EGP</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #eee' }}>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '10px' }}>Total Amount:</td>
              <td style={{ fontWeight: 'bold', paddingTop: '10px' }}>{invoice.totalAmount?.toFixed(2)} EGP</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', color: 'green' }}>Paid:</td>
              <td style={{ color: 'green' }}>{(invoice.paidAmount || 0)?.toFixed(2)} EGP</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', color: 'red', fontWeight: 'bold' }}>Balance Due:</td>
              <td style={{ color: 'red', fontWeight: 'bold' }}>{balance?.toFixed(2)} EGP</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
};

export default InvoiceDetails;