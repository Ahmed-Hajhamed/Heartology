import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import './DICOMViewer.css';

/**
 * DICOM Viewer Component
 * Embeds OHIF viewer running on port 3000
 * 
 * @param {string} studyInstanceUID - The study instance UID from Orthanc
 * @param {string} orthancStudyId - Alternative: Orthanc study ID (if studyInstanceUID is not available)
 * @param {string} patientId - Patient ID for context
 * @param {object} studyInfo - Additional study information
 * @param {string} ohifBaseUrl - Base URL for OHIF viewer (default: http://localhost:3000)
 */
const DICOMViewer = ({ 
  studyInstanceUID, 
  orthancStudyId,
  patientId, 
  studyInfo = {},
  ohifBaseUrl = 'http://localhost:3000'
}) => {
  const [viewerUrl, setViewerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studyInstanceUID || orthancStudyId) {
      try {
        // OHIF viewer URL - adjust based on your OHIF configuration
        // OHIF typically accepts studyInstanceUIDs as a query parameter
        // Some configurations might use different URL patterns
        
        let url;
        if (studyInstanceUID) {
          // Option 1: Using studyInstanceUIDs query parameter (most common)
          url = `${ohifBaseUrl}/viewer?studyInstanceUIDs=${encodeURIComponent(studyInstanceUID)}`;
        } else if (orthancStudyId) {
          // Option 2: Using Orthanc study ID (if OHIF is configured to accept it)
          // This might require custom OHIF configuration
          url = `${ohifBaseUrl}/viewer?studyInstanceUIDs=${encodeURIComponent(orthancStudyId)}`;
        }
        
        setViewerUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error constructing viewer URL:', err);
        setError('Failed to construct viewer URL');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No study identifier provided');
      setIsLoading(false);
    }
  }, [studyInstanceUID, orthancStudyId, ohifBaseUrl]);

  if (!studyInstanceUID && !orthancStudyId) {
    return (
      <Card title="DICOM Viewer">
        <div className="dicom-viewer-error">
          <p>No study identifier provided. Please select a radiology scan to view.</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="DICOM Viewer">
        <div className="dicom-viewer-error">
          <p>{error}</p>
          <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
            Make sure OHIF viewer is running on {ohifBaseUrl}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`DICOM Viewer - ${studyInfo.studyDescription || 'Study'}`}>
      <div className="dicom-viewer-container">
        {isLoading ? (
          <div className="dicom-viewer-loading">
            <p>Loading DICOM viewer...</p>
          </div>
        ) : (
          <iframe
            src={viewerUrl}
            className="dicom-viewer-iframe"
            title="OHIF DICOM Viewer"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>
      {studyInfo && (
        <div className="dicom-viewer-info">
          <div className="info-item">
            <label>Study Date:</label>
            <span>{studyInfo.studyDate || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Modality:</label>
            <span>{studyInfo.modality || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Study Description:</label>
            <span>{studyInfo.studyDescription || 'N/A'}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DICOMViewer;

