import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const RadiologyViewer = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();

  const imageData = {
    imageId: imageId,
    patientName: 'John Doe',
    patientId: '1',
    studyType: 'ECG',
    fileName: 'ecg_scan_2025_12_05.dcm',
    filePath: '/storage/scans/ecg_scan_2025_12_05.dcm',
    uploadDate: '2025-12-05',
    uploadedBy: 'Dr. Sarah Johnson'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Radiology Image Viewer</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/radiology/${imageId}/analysis`)}>View Analysis</Button>
          <Button variant="secondary" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <div className="details-grid">
        <Card title="Scan Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Image ID:</label>
              <span>{imageData.imageId}</span>
            </div>
            <div className="info-item">
              <label>Patient:</label>
              <span>{imageData.patientName}</span>
            </div>
            <div className="info-item">
              <label>Study Type:</label>
              <span className="tag tag-info">{imageData.studyType}</span>
            </div>
            <div className="info-item">
              <label>Upload Date:</label>
              <span>{imageData.uploadDate}</span>
            </div>
            <div className="info-item">
              <label>Uploaded By:</label>
              <span>{imageData.uploadedBy}</span>
            </div>
            <div className="info-item">
              <label>File Name:</label>
              <span>{imageData.fileName}</span>
            </div>
          </div>
        </Card>

        <Card title="Image Viewer">
          <div className="image-viewer-container">
            <div className="image-placeholder">
              <div className="placeholder-icon">🔬</div>
              <p>DICOM Image Viewer</p>
              <p className="placeholder-subtitle">Study Type: {imageData.studyType}</p>
              <p className="placeholder-note">
                In a production environment, this would display the actual DICOM image 
                using a DICOM viewer library like Cornerstone.js or OHIF Viewer.
              </p>
            </div>
          </div>

          <div className="viewer-controls">
            <Button size="small">Zoom In</Button>
            <Button size="small">Zoom Out</Button>
            <Button size="small">Reset</Button>
            <Button size="small">Measure</Button>
            <Button size="small">Annotate</Button>
          </div>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/patients/${imageData.patientId}`)}>View Patient Profile</Button>
          <Button variant="secondary" onClick={() => navigate(`/radiology/${imageId}/analysis`)}>Request CDSS Analysis</Button>
          <Button variant="secondary" onClick={() => navigate('/medical-records')}>Related Medical Records</Button>
        </div>
      </Card>
    </div>
  );
};

export default RadiologyViewer;
