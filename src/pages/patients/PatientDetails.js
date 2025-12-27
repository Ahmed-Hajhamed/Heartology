import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Modal from '../../components/common/Modal';
import DICOMViewer from '../../components/radiology/DICOMViewer';
import api from '../../services/api';
import '../../styles/pages/PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radiologyScans, setRadiologyScans] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loadingScans, setLoadingScans] = useState(false);
  
  // Radiology Orders state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedIndication, setSelectedIndication] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // Hardcoded Study Instance UIDs - Replace with real IDs from Orthanc
  // These correspond to the 20 static MRI studies
  const NORMAL_CASES = [
    'A0S9V9', 'A1D0Q7', 'A1D9Z7', 'A1E9Q1', 'A1K2P5',
    'A1O8Z3', 'A2C0I1', 'A2E3W4', 'A2H5K9', 'A2L1N6'
  ];
  
  const PATHOLOGY_CASES = [
    'A2N8V0', 'A3B7E5', 'A3H1O5', 'A3H5R1', 'A3P9V7',
    'A4A8V9', 'A4B5U4', 'A4B9O6', 'A4J4S4', 'A4K8R4'
  ];
  
  // Clinical indication options
  const clinicalIndications = [
    { value: 'routine', label: 'Routine Checkup / Normal Function' },
    { value: 'hypertrophy', label: 'Suspected Hypertrophy / Heart Failure' },
    { value: 'dilated', label: 'Dilated Cardiomyopathy' }
  ];

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatient(response.data.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        alert("Failed to load patient details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  useEffect(() => {
    const fetchRadiologyScans = async () => {
      setLoadingScans(true);
      try {
        // First, fetch patient's appointments to get assigned scans
        const appointmentsRes = await api.get(`/appointments?patientId=${patientId}`);
        const appointments = appointmentsRes.data.data || [];
        
        // Filter appointments that have assigned scans
        const appointmentsWithScans = appointments.filter(apt => 
          apt.scanStatus === 'completed' && apt.scanStudyInstanceUID
        );
        
        if (appointmentsWithScans.length === 0) {
          setRadiologyScans([]);
          setLoadingScans(false);
          return;
        }
        
        // Fetch scan details from Orthanc for each assigned scan
        const orthancUrl = 'http://localhost:8042';
        const studies = [];
        
        for (const appointment of appointmentsWithScans) {
          try {
            // Try to fetch study by studyInstanceUID first
            if (appointment.scanStudyInstanceUID) {
              const studyResponse = await fetch(`${orthancUrl}/studies/${appointment.scanStudyInstanceUID}?expand`);
              if (studyResponse.ok) {
                const study = await studyResponse.json();
                studies.push({
                  ...study,
                  appointmentId: appointment.id,
                  appointmentDate: appointment.appointmentDate,
                  scanCode: appointment.requiredScanCode
                });
              }
            } 
            // Fallback to study ID if studyInstanceUID doesn't work
            else if (appointment.scanStudyId) {
              const studyResponse = await fetch(`${orthancUrl}/studies/${appointment.scanStudyId}?expand`);
              if (studyResponse.ok) {
                const study = await studyResponse.json();
                studies.push({
                  ...study,
                  appointmentId: appointment.id,
                  appointmentDate: appointment.appointmentDate,
                  scanCode: appointment.requiredScanCode
                });
              }
            }
          } catch (orthancError) {
            console.warn(`Could not fetch scan ${appointment.scanStudyInstanceUID || appointment.scanStudyId}:`, orthancError);
          }
        }
        
        setRadiologyScans(studies);
      } catch (error) {
        console.error("Error fetching radiology scans:", error);
        setRadiologyScans([]);
      } finally {
        setLoadingScans(false);
      }
    };

    if (patientId) {
      fetchRadiologyScans();
    }
  }, [patientId]);

  // Handle opening order modal
  const handleOpenOrderModal = () => {
    setShowOrderModal(true);
    setSelectedIndication('');
  };

  // Handle submitting radiology order
  const handleSubmitOrder = async () => {
    if (!selectedIndication) {
      alert('Please select a clinical indication.');
      return;
    }

    setProcessingOrder(true);

    // Simulate processing delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let selectedStudyId = null;

      // Randomly select a study ID based on clinical indication
      if (selectedIndication === 'routine') {
        // Randomly pick from NORMAL_CASES
        const randomIndex = Math.floor(Math.random() * NORMAL_CASES.length);
        selectedStudyId = NORMAL_CASES[randomIndex];
      } else if (selectedIndication === 'hypertrophy' || selectedIndication === 'dilated') {
        // Randomly pick from PATHOLOGY_CASES
        const randomIndex = Math.floor(Math.random() * PATHOLOGY_CASES.length);
        selectedStudyId = PATHOLOGY_CASES[randomIndex];
      }

      if (!selectedStudyId) {
        throw new Error('Failed to select a study ID');
      }

      // Update patient's pacsPatientId
      await api.patch(`/patients/${patientId}`, {
        pacsPatientId: selectedStudyId
      });

      // Close modal and refresh patient data
      setShowOrderModal(false);
      setSelectedIndication('');
      
      // Refresh patient data
      const response = await api.get(`/patients/${patientId}`);
      setPatient(response.data.data);
      
      alert('Radiology order submitted successfully! Scan has been assigned to patient.');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(error.response?.data?.message || 'Failed to submit radiology order.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Handle viewing PACS scans in OHIF viewer
  const handleViewPACS = () => {
    if (patient.pacsPatientId) {
      const ohifUrl = `http://localhost:3000/?PatientID=${patient.pacsPatientId}`;
      window.open(ohifUrl, '_blank');
    }
  };

  if (loading) return <div className="page-container">Loading details...</div>;
  if (!patient) return <div className="page-container">Patient not found.</div>;

  // Helper to safely access nested data
  const personal = patient.personalInfo || {};
  const insurance = patient.insurance || {};
  const emergency = patient.emergencyContact || {};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate(`/patients/${patientId}/medical-profile`)}>Edit Profile</Button>
        </div>
      </div>

      <div className="details-grid">
        {/* Personal Information */}
        <Card title="Personal Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{personal.firstName} {personal.lastName}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{personal.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{personal.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>SSN:</label>
              <span>{patient.ssn}</span>
            </div>
            {/* Note: If address/gender/dob are missing, it's because we need to add them to the Patient Controller response. 
                For now, we handle them gracefully. */}
            <div className="info-item">
              <label>Gender:</label>
              <span>{personal.gender || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Medical Profile */}
        <Card title="Medical Profile">
          <div className="info-grid">
            <div className="info-item">
              <label>Blood Type:</label>
              <span className="tag tag-info">{patient.bloodType || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Allergies:</label>
              <span>{patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}</span>
            </div>
            <div className="info-item">
              <label>Chronic Conditions:</label>
              <span>{patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'None'}</span>
            </div>
            <div className="info-item">
              <label>Smoking Status:</label>
              <span>{patient.smokingStatus || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact">
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{emergency.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Relationship:</label>
              <span>{emergency.relationship || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{emergency.phone || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Insurance Information */}
        <Card title="Insurance Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Provider:</label>
              <span>{insurance.provider || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Policy Number:</label>
              <span>{insurance.policyNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Expiry Date:</label>
              <span>{insurance.expiryDate ? new Date(insurance.expiryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Radiology Scans Section */}
      <Card title="Radiology Scans">
        {loadingScans ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading radiology scans...</div>
        ) : radiologyScans.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <p>No radiology scans available for this patient.</p>
            <Button 
              size="small" 
              onClick={() => navigate('/radiology/upload')}
              style={{ marginTop: '10px' }}
            >
              Upload New Scan
            </Button>
          </div>
        ) : (
          <div>
            <div className="radiology-scans-list" style={{ marginBottom: '20px' }}>
              {radiologyScans.map((study) => {
                const studyInfo = study.MainDicomTags || {};
                const studyDate = studyInfo.StudyDate || 'N/A';
                const studyDescription = studyInfo.StudyDescription || 'No description';
                const modality = studyInfo.ModalitiesInStudy?.[0] || 'N/A';
                const studyInstanceUID = study.MainDicomTags?.StudyInstanceUID || study.ID;
                const appointmentDate = study.appointmentDate ? new Date(study.appointmentDate).toLocaleDateString() : null;
                
                return (
                  <div 
                    key={study.ID} 
                    className={`radiology-scan-item ${selectedStudy?.ID === study.ID ? 'selected' : ''}`}
                    style={{
                      padding: '15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      backgroundColor: selectedStudy?.ID === study.ID ? '#f0f7ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedStudy(study)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{studyDescription}</h4>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#666', flexWrap: 'wrap' }}>
                          <span><strong>Scan Date:</strong> {studyDate}</span>
                          <span><strong>Modality:</strong> {modality}</span>
                          <span><strong>Series:</strong> {study.SeriesCount || 0}</span>
                          {appointmentDate && (
                            <span><strong>Appointment:</strong> {appointmentDate}</span>
                          )}
                          {study.scanCode && (
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#0066cc' }}>
                              <strong>Code:</strong> {study.scanCode}
                            </span>
                          )}
                        </div>
                        {study.appointmentId && (
                          <div style={{ marginTop: '8px' }}>
                            <Button 
                              size="small" 
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/appointments/${study.appointmentId}`);
                              }}
                            >
                              View Appointment
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudy(study);
                        }}
                        style={{ marginLeft: '10px' }}
                      >
                        View Scan
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedStudy && (
              <div style={{ marginTop: '20px' }}>
                <DICOMViewer
                  studyInstanceUID={selectedStudy.MainDicomTags?.StudyInstanceUID}
                  orthancStudyId={selectedStudy.ID}
                  patientId={patientId}
                  studyInfo={{
                    studyDate: selectedStudy.MainDicomTags?.StudyDate,
                    modality: selectedStudy.MainDicomTags?.ModalitiesInStudy?.[0],
                    studyDescription: selectedStudy.MainDicomTags?.StudyDescription
                  }}
                  ohifBaseUrl="http://localhost:3000"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Radiology Orders Section */}
      <Card title="Radiology Orders">
        {!patient.pacsPatientId ? (
          <div>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Order a Cardiac MRI scan for this patient. The system will automatically assign an appropriate study based on the clinical indication.
            </p>
            <Button 
              onClick={handleOpenOrderModal}
              variant="primary"
            >
              Order Cardiac MRI
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span className="status status-completed" style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '0.9em' }}>
                Scan Completed
              </span>
              <span style={{ color: '#666', fontSize: '0.9em' }}>
                Study ID: <strong style={{ fontFamily: 'monospace' }}>{patient.pacsPatientId}</strong>
              </span>
            </div>
            <div style={{ marginTop: '15px' }}>
              <Button 
                onClick={handleViewPACS}
                variant="primary"
              >
                View Radiology Scans (PACS)
              </Button>
            </div>
            <p style={{ marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
              Click "View Radiology Scans" to open the OHIF viewer with this patient's assigned scan.
            </p>
          </div>
        )}
      </Card>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => !processingOrder && setShowOrderModal(false)}
        title="Order Cardiac MRI"
        footer={
          <>
            <Button 
              onClick={handleSubmitOrder}
              disabled={!selectedIndication || processingOrder}
              variant="primary"
            >
              {processingOrder ? 'Processing...' : 'Submit Order'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowOrderModal(false)}
              disabled={processingOrder}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.95em' }}>
            Select Clinical Indication:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {clinicalIndications.map((indication) => (
              <div
                key={indication.value}
                onClick={() => !processingOrder && setSelectedIndication(indication.value)}
                style={{
                  padding: '15px',
                  border: `2px solid ${selectedIndication === indication.value ? '#0066cc' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: processingOrder ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedIndication === indication.value ? '#f0f7ff' : '#fff',
                  transition: 'all 0.2s',
                  opacity: processingOrder ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${selectedIndication === indication.value ? '#0066cc' : '#ccc'}`,
                      backgroundColor: selectedIndication === indication.value ? '#0066cc' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {selectedIndication === indication.value && (
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#fff'
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: '0.95em', fontWeight: selectedIndication === indication.value ? '600' : '400' }}>
                    {indication.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {processingOrder && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#0066cc' }}>
                Processing order and assigning scan...
              </p>
            </div>
          )}
          
          {selectedIndication && !processingOrder && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9em' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Order Summary:</p>
              <p style={{ margin: 0, color: '#666' }}>
                <strong>Procedure:</strong> Cardiac MRI<br />
                <strong>Indication:</strong> {clinicalIndications.find(ind => ind.value === selectedIndication)?.label}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button onClick={() => navigate(`/appointments/book?patientId=${patient.id}`)}>Book Appointment</Button>
          <Button variant="secondary" onClick={() => navigate(`/medical-records?patientId=${patient.id}`)}>View Medical Records</Button>
          <Button variant="secondary" onClick={() => navigate(`/billing/invoices?patientId=${patient.id}`)}>View Invoices</Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientDetails;