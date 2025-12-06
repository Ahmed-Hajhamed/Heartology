import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const RadiologyUpload = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: '',
    studyType: '',
    fileName: '',
    file: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file,
      fileName: file ? file.name : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Uploading radiology scan:', formData);
    navigate('/radiology');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Upload Radiology Scan</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Scan Information">
          <div className="form-grid">
            <FormField
              label="Patient"
              type="select"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              options={[
                { value: '1', label: 'John Doe' },
                { value: '2', label: 'Jane Smith' },
                { value: '3', label: 'Robert Johnson' }
              ]}
              required
            />

            <FormField
              label="Study Type"
              type="select"
              name="studyType"
              value={formData.studyType}
              onChange={handleChange}
              options={[
                { value: 'ECG', label: 'ECG' },
                { value: 'ct_scan', label: 'CT Scan' },
                { value: 'mri', label: 'MRI' },
                { value: 'xray', label: 'X-Ray' }
              ]}
              required
            />
          </div>

          <div className="file-upload-section">
            <label htmlFor="file-upload" className="file-upload-label">
              Upload DICOM or Image File <span className="required">*</span>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".dcm,.jpg,.jpeg,.png,.pdf"
              required
            />
            {formData.fileName && (
              <p className="file-name">Selected file: {formData.fileName}</p>
            )}
          </div>

          <div className="upload-info">
            <h4>Supported File Types:</h4>
            <ul>
              <li>DICOM files (.dcm)</li>
              <li>Image files (.jpg, .jpeg, .png)</li>
              <li>PDF documents (.pdf)</li>
            </ul>
          </div>
        </Card>

        <div className="form-actions">
          <Button type="submit" variant="primary">Upload Scan</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default RadiologyUpload;
