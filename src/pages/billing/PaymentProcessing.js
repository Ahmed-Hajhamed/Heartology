import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const PaymentProcessing = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const [paymentData, setPaymentData] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // 1. Fetch Invoice Amount
  useEffect(() => {
    const fetchInvoice = async () => {
        try {
            const response = await api.get(`/billing/invoices/${invoiceId}`);
            setInvoice(response.data.data);
        } catch (error) {
            alert("Error loading invoice.");
            navigate('/billing/invoices');
        } finally {
            setLoading(false);
        }
    };
    fetchInvoice();
  }, [invoiceId, navigate]);

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
        // 2. Process Payment (Simulate 2 second delay)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Update Backend Status
        await api.put(`/billing/invoices/${invoiceId}`, {
            status: 'Paid',
            paidAmount: invoice.totalAmount,
            balanceAmount: 0,
            paymentMethod: paymentData.method,
            paymentDate: new Date().toISOString()
        });

        alert('Payment Processed Successfully!');
        navigate(`/billing/invoices/${invoiceId}`);

    } catch (error) {
        console.error(error);
        alert('Payment failed. Please try again.');
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="page-container">Loading payment details...</div>;
  if (!invoice) return <div className="page-container">Invoice not found.</div>;

  // Calculate balance amount (use balanceAmount if available, otherwise calculate from totalAmount - paidAmount)
  const balanceAmount = invoice.balanceAmount ?? (invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Process Payment</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="payment-grid" style={{maxWidth: '600px', margin: '0 auto'}}>
        <Card title={`Total Due: $${balanceAmount.toFixed(2)}`}>
          <form onSubmit={handleSubmit}>
            <FormField
              label="Payment Method"
              type="select"
              name="method"
              value={paymentData.method}
              onChange={handleChange}
              options={[
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'cash', label: 'Cash' },
                { value: 'insurance', label: 'Insurance' }
              ]}
            />

            {['credit_card', 'debit_card'].includes(paymentData.method) && (
              <>
                <FormField
                  label="Card Number"
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleChange}
                  placeholder="0000 0000 0000 0000"
                  required
                />
                <div style={{display: 'flex', gap: '15px'}}>
                  <FormField
                    label="Expiry"
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    required
                  />
                  <FormField
                    label="CVV"
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    required
                  />
                </div>
              </>
            )}

            <div style={{marginTop: '20px'}}>
                <Button type="submit" variant="primary" disabled={processing} style={{width: '100%'}}>
                    {processing ? 'Processing...' : `Pay $${balanceAmount.toFixed(2)}`}
                </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PaymentProcessing;