import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState(''); // Optional link
  const [dueDate, setDueDate] = useState('');
  
  const [services, setServices] = useState([
    { description: '', price: '', quantity: '1' }
  ]);

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { description: '', price: '', quantity: '1' }]);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return services.reduce((sum, service) => {
        const qty = parseFloat(service.quantity) || 0;
        const price = parseFloat(service.price) || 0;
        return sum + (qty * price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patientId,
        appointmentId: appointmentId || null,
        invoiceDate: new Date().toISOString(),
        dueDate: dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Default 30 days
        services: services.map(s => ({
            description: s.description,
            unitPrice: parseFloat(s.price),
            quantity: parseFloat(s.quantity),
            total: parseFloat(s.price) * parseFloat(s.quantity)
        })),
        totalAmount: calculateTotal(),
        status: 'Pending',
        paidAmount: 0,
        balanceAmount: calculateTotal()
      };

      await api.post('/billing/invoices', payload);
      
      alert('Invoice Created Successfully!');
      navigate('/billing/invoices');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Invoice</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Invoice Details">
            <div className="form-grid">
                <FormField
                    label="Patient ID"
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter Patient ID"
                    required
                />
                <FormField
                    label="Due Date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                <FormField
                    label="Appointment ID (Optional)"
                    type="text"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    placeholder="Link to appointment"
                />
            </div>
        </Card>

        <Card title="Services & Charges" className="mt-4">
          {services.map((service, index) => (
            <div key={index} className="service-row" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '15px' }}>
              <div style={{ flex: 3 }}>
                <FormField
                  label="Description"
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  placeholder="e.g., Consultation, ECG Test"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Qty"
                  type="number"
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormField
                  label="Price ($)"
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              {services.length > 1 && (
                <Button size="small" variant="danger" onClick={() => removeService(index)} style={{ marginBottom: '15px' }}>X</Button>
              )}
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={addService}>
            Add Another Service
          </Button>
        </Card>

        <Card title="Summary" className="mt-4">
          <div className="invoice-summary" style={{ fontSize: '1.2em', fontWeight: 'bold', textAlign: 'right' }}>
            <div className="summary-row total">
              <label>Total Amount: </label>
              <span className="total-amount">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;