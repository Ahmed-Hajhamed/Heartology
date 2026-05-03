import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState('');
  const [services, setServices] = useState([
    { serviceName: '', price: '' }
  ]);

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { serviceName: '', price: '' }]);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const invoiceData = {
      patientId,
      services,
      totalPrice: calculateTotal()
    };
    console.log('Creating invoice:', invoiceData);
    navigate('/billing/invoices');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Invoice</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Patient Information">
          <FormField
            label="Patient"
            type="select"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={[
              { value: '1', label: 'John Doe' },
              { value: '2', label: 'Jane Smith' },
              { value: '3', label: 'Robert Johnson' }
            ]}
            required
          />
        </Card>

        <Card title="Services">
          {services.map((service, index) => (
            <div key={index} className="service-section">
              <div className="service-header">
                <h4>Service {index + 1}</h4>
                {services.length > 1 && (
                  <Button 
                    type="button" 
                    variant="danger" 
                    size="small"
                    onClick={() => removeService(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="form-grid">
                <FormField
                  label="Service Name"
                  type="text"
                  value={service.serviceName}
                  onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                  placeholder="e.g., Consultation, ECG Test"
                  required
                />

                <FormField
                  label="Price ($)"
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={addService}>
            Add Another Service
          </Button>
        </Card>

        <Card title="Invoice Summary">
          <div className="invoice-summary">
            <div className="summary-row">
              <label>Total Services:</label>
              <span>{services.length}</span>
            </div>
            <div className="summary-row total">
              <label>Total Amount:</label>
              <span className="total-amount">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Create Invoice</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
