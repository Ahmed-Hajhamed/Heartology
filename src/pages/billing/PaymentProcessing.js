import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const PaymentProcessing = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    amount: '550.00',
    method: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const invoiceTotal = 550.00;

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Processing payment:', paymentData);
    alert('Payment processed successfully!');
    navigate(`/billing/invoices/${invoiceId}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Process Payment</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="payment-grid">
        <Card title="Payment Summary">
          <div className="payment-summary">
            <div className="summary-item">
              <label>Invoice ID:</label>
              <span>{invoiceId}</span>
            </div>
            <div className="summary-item">
              <label>Patient:</label>
              <span>John Doe</span>
            </div>
            <div className="summary-item total">
              <label>Total Amount:</label>
              <span className="amount">${invoiceTotal.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card title="Payment Details">
            <FormField
              label="Payment Amount"
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              step="0.01"
              required
            />

            <FormField
              label="Payment Method"
              type="select"
              name="method"
              value={paymentData.method}
              onChange={handleChange}
              options={[
                { value: 'card', label: 'Credit/Debit Card' },
                { value: 'cash', label: 'Cash' },
                { value: 'insurance', label: 'Insurance' },
                { value: 'online', label: 'Online Payment' }
              ]}
              required
            />

            {paymentData.method === 'card' && (
              <>
                <FormField
                  label="Card Number"
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />

                <FormField
                  label="Card Holder Name"
                  type="text"
                  name="cardHolder"
                  value={paymentData.cardHolder}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />

                <div className="form-grid">
                  <FormField
                    label="Expiry Date"
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

            {paymentData.method === 'insurance' && (
              <div className="insurance-info">
                <p>Insurance claim will be submitted to the provider on record.</p>
                <p><strong>Provider:</strong> Blue Cross Blue Shield</p>
                <p><strong>Policy Number:</strong> POL123456789</p>
              </div>
            )}
          </Card>

          <div className="form-actions">
            <Button type="submit" variant="primary">Process Payment - ${paymentData.amount}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentProcessing;
