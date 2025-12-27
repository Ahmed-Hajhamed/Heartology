import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Modal from '../../components/common/Modal';
import DICOMViewer from '../../components/radiology/DICOMViewer';
import api from '../../services/api';

const RadiologyViewer = () => {
  const { studyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studyInfo, setStudyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Get study info from URL params or fetch from Orthanc
  const studyInstanceUID = searchParams.get('studyInstanceUID') || studyId;
  const patientId = searchParams.get('patientId');

  useEffect(() => {
    // Get user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  useEffect(() => {
    const fetchStudyInfo = async () => {
      if (!studyInstanceUID) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch study info from Orthanc
        const orthancUrl = 'http://localhost:8042';
        const response = await fetch(`${orthancUrl}/studies/${studyInstanceUID}?expand`);
        
        if (response.ok) {
          const study = await response.json();
          setStudyInfo({
            studyDate: study.MainDicomTags?.StudyDate,
            modality: study.MainDicomTags?.ModalitiesInStudy?.[0],
            studyDescription: study.MainDicomTags?.StudyDescription,
            patientName: study.PatientMainDicomTags?.PatientName,
            patientId: study.PatientMainDicomTags?.PatientID
          });
        } else {
          // If not found by ID, try to use it as studyInstanceUID
          setStudyInfo({
            studyDescription: 'Study',
            studyInstanceUID: studyInstanceUID
          });
        }
      } catch (error) {
        console.warn('Could not fetch study info from Orthanc:', error);
        setStudyInfo({
          studyDescription: 'Study',
          studyInstanceUID: studyInstanceUID
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudyInfo();
  }, [studyInstanceUID]);

  const handleLinkScan = async () => {
    if (!scanCode || !studyInstanceUID) {
      alert('Please enter a scan code');
      return;
    }

    setLinking(true);
    try {
      // First, find the appointment by scan code
      const appointmentsRes = await api.get('/appointments');
      const appointments = appointmentsRes.data.data;
      
      // Find appointment with matching scan code
      const appointment = appointments.find(apt => 
        apt.requiredScanCode && apt.requiredScanCode.toUpperCase() === scanCode.toUpperCase()
      );

      if (!appointment) {
        alert(`No appointment found with scan code: ${scanCode}`);
        setLinking(false);
        return;
      }

      // Link the scan to the appointment
      await api.patch(`/appointments/${appointment.id}/link-scan`, {
        scanStudyInstanceUID: studyInfo?.studyInstanceUID || studyInstanceUID,
        scanStudyId: studyId,
        scanCode: scanCode.toUpperCase()
      });

      alert('Scan linked to appointment successfully!');
      setShowLinkModal(false);
      setScanCode('');
    } catch (error) {
      console.error('Error linking scan:', error);
      alert(error.response?.data?.message || 'Failed to link scan to appointment');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return <div className="page-container">Loading viewer...</div>;
  }

  if (!studyInstanceUID) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Radiology Viewer</h1>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
        <Card>
          <p>No study ID provided. Please select a study to view.</p>
          <Button onClick={() => navigate('/radiology')}>Go to Radiology List</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>DICOM Viewer</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          {patientId && (
            <Button onClick={() => navigate(`/patients/${patientId}`)}>View Patient</Button>
          )}
        </div>
      </div>

      <DICOMViewer
        studyInstanceUID={studyInfo?.studyInstanceUID || studyInstanceUID}
        orthancStudyId={studyId}
        patientId={patientId}
        studyInfo={studyInfo}
        ohifBaseUrl="http://localhost:3000"
      />

      {/* Link Scan to Appointment - For Staff/Admin */}
      {(userRole === 'staff' || userRole === 'admin') && (
        <Card title="Link to Appointment" style={{ marginTop: '20px' }}>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Link this scan to an appointment by entering the scan code provided by the doctor.
          </p>
          <Button onClick={() => setShowLinkModal(true)}>Link Scan to Appointment</Button>
        </Card>
      )}

      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Scan to Appointment"
        footer={
          <>
            <Button 
              onClick={handleLinkScan}
              disabled={linking || !scanCode}
            >
              {linking ? 'Linking...' : 'Link Scan'}
            </Button>
            <Button variant="secondary" onClick={() => setShowLinkModal(false)}>Cancel</Button>
          </>
        }
      >
        <FormField
          label="Scan Code"
          type="text"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value.toUpperCase())}
          placeholder="e.g., A0S9V9"
          required
        />
        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
          Enter the scan code that was provided when the appointment was created.
        </p>
      </Modal>
    </div>
  );
};

export default RadiologyViewer;




