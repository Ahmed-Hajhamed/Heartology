import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import api from '../../services/api';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  // State for real data
  const [appointment, setAppointment] = useState(null);
  const [patientName, setPatientName] = useState('Loading...');
  const [doctorName, setDoctorName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Scan assignment state (old - keeping for backward compatibility)
  const [userRole, setUserRole] = useState('');
  const [showAssignScanModal, setShowAssignScanModal] = useState(false);
  const [availableScans, setAvailableScans] = useState([]);
  const [validScanCodes, setValidScanCodes] = useState([]);
  const [availableScanCodes, setAvailableScanCodes] = useState([]);
  const [usedScanCodes, setUsedScanCodes] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState('');
  const [selectedScanCode, setSelectedScanCode] = useState('');
  const [assigningScan, setAssigningScan] = useState(false);
  
  // Radiology Order state
  const [showRadiologyOrderModal, setShowRadiologyOrderModal] = useState(false);
  const [selectedIndication, setSelectedIndication] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // Study Instance UID arrays for random selection from Orthanc server
  const NORMAL_HEART_SCANS = [
    '1.2.826.0.1.3680043.8.498.65932550331660928509262777099721109252',
    '1.2.826.0.1.3680043.8.498.93860610018678669415400309565886088268',
    '1.2.826.0.1.3680043.8.498.16230640878550461263592119697880533664',
    '1.2.826.0.1.3680043.8.498.70493775531032013625068629168153348774',
    '1.2.826.0.1.3680043.8.498.62909792531251488518012102295631110640',
    '1.2.826.0.1.3680043.8.498.18036823888686057185019461954698582157',
    '1.2.826.0.1.3680043.8.498.71805375670784599698576703485251744630',
    '1.2.826.0.1.3680043.8.498.16745248682361182860928038522938653566',
    '1.2.826.0.1.3680043.8.498.6498038521325610489020693643369776880',
    '1.2.826.0.1.3680043.8.498.7022036604774013878789975655574534184'
  ];

  const PATHOLOGY_SCANS = [
    '1.2.826.0.1.3680043.8.498.18022695992288037033873592157909703020',
    '1.2.826.0.1.3680043.8.498.7820599399092157576391313312410202875',
    '1.2.826.0.1.3680043.8.498.50481687033231048677167096858227352461',
    '1.2.826.0.1.3680043.8.498.94990454134576571137582239688317624874',
    '1.2.826.0.1.3680043.8.498.83049522846639332443312661389619858155',
    '1.2.826.0.1.3680043.8.498.17516516330689793076318675615348960514',
    '1.2.826.0.1.3680043.8.498.27639721448444283872302994227385374925',
    '1.2.826.0.1.3680043.8.498.98271428593790177001153501071893376478',
    '1.2.826.0.1.3680043.8.498.51718206548003017673630543493327578116',
    '1.2.826.0.1.3680043.8.498.94307292311091491912285978384814594342'
  ];
  
  // Clinical indication options
  const clinicalIndications = [
    { value: 'routine', label: 'Routine Checkup' },
    { value: 'hypertrophy', label: 'Hypertrophy/Pathology' }
  ];

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Fetch Appointment Details
        const apptRes = await api.get(`/appointments/${appointmentId}`);
        const apptData = apptRes.data.data;
        setAppointment(apptData);

        // 2. Fetch Patient Name
        if (apptData.patientId) {
          try {
            const pRes = await api.get(`/patients/${apptData.patientId}`);
            // Patient API returns combined data usually, or we dig into personalInfo
            const pData = pRes.data.data;
            const name = pData.personalInfo
              ? `${pData.personalInfo.firstName} ${pData.personalInfo.lastName}`
              : 'Unknown Patient';
            setPatientName(name);
          } catch (err) {
            setPatientName('Unknown ID');
          }
        }

        // 3. Fetch Doctor Name
        if (apptData.doctorId) {
          try {
            const dRes = await api.get(`/doctors/${apptData.doctorId}`);
            const dData = dRes.data?.data;
            if (dData) {
              setDoctorName(`Dr. ${dData.firstName || ''} ${dData.lastName || ''}`.trim() || 'Unknown Doctor');
            } else {
              setDoctorName('Unknown Doctor');
            }
          } catch (err) {
            setDoctorName('Unknown Doctor');
          }
        }

      } catch (error) {
        console.error("Error fetching details:", error);
        alert("Could not load appointment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  const handleCancel = async () => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'Cancelled' });
      alert('Appointment cancelled successfully.');
      setShowCancelModal(false);
      navigate('/appointments'); // Go back to list
    } catch (error) {
      console.error(error);
      alert('Failed to cancel appointment.');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    const confirmMsg = newStatus === 'Completed'
      ? 'Mark as completed? This will auto-generate an invoice.'
      : `Update status to "${newStatus}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      alert(response.data.message);
      window.location.reload(); // Refresh to see new status
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update status.');
    }
  };

  // Handle submitting radiology order
  const handleSubmitRadiologyOrder = async () => {
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
        // Randomly pick from NORMAL_HEART_SCANS
        const randomIndex = Math.floor(Math.random() * NORMAL_HEART_SCANS.length);
        selectedStudyId = NORMAL_HEART_SCANS[randomIndex];
      } else if (selectedIndication === 'hypertrophy') {
        // Randomly pick from PATHOLOGY_SCANS
        const randomIndex = Math.floor(Math.random() * PATHOLOGY_SCANS.length);
        selectedStudyId = PATHOLOGY_SCANS[randomIndex];
      }

      if (!selectedStudyId) {
        throw new Error('Failed to select a study ID');
      }

      // Get the indication label
      const indicationLabel = clinicalIndications.find(ind => ind.value === selectedIndication)?.label || selectedIndication;

      // Update appointment with radiology order - status is 'ordered' (unpaid) initially
      await api.patch(`/appointments/${appointmentId}`, {
        radiologyOrder: {
          status: 'ordered',
          indication: indicationLabel,
          pacsStudyId: selectedStudyId,
          cost: 200,
          orderedAt: new Date().toISOString()
        }
      });

      // Close modal and refresh appointment data
      setShowRadiologyOrderModal(false);
      setSelectedIndication('');
      
      // Refresh appointment data
      const apptRes = await api.get(`/appointments/${appointmentId}`);
      setAppointment(apptRes.data.data);
      
      alert('Radiology order placed successfully! Please proceed to payment to complete the scan assignment.');
    } catch (error) {
      console.error('Error submitting radiology order:', error);
      alert(error.response?.data?.message || 'Failed to submit radiology order.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Handle simulating payment success (for demo purposes)
  const handleSimulatePayment = async () => {
    if (!window.confirm('Simulate payment success? This will mark the radiology order as paid and completed.')) {
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/radiology-order/pay`);
      
      // Refresh appointment data
      const apptRes = await api.get(`/appointments/${appointmentId}`);
      setAppointment(apptRes.data.data);
      
      alert('Payment simulated successfully! Scan is now available for viewing.');
    } catch (error) {
      console.error('Error simulating payment:', error);
      alert(error.response?.data?.message || 'Failed to simulate payment.');
    }
  };

  // Handle proceeding to payment - create invoice and navigate
  const handleProceedToPayment = async () => {
    try {
      // Create an invoice for the scan
      const invoiceData = {
        patientId: appointment.patientId,
        appointmentId: appointmentId,
        items: [{
          description: `Radiology Scan - ${appointment.radiologyOrder.indication}`,
          unitPrice: appointment.radiologyOrder.cost || 200,
          quantity: 1,
          total: appointment.radiologyOrder.cost || 200
        }],
        totalAmount: appointment.radiologyOrder.cost || 200
      };

      const invoiceResponse = await api.post('/billing/invoices', invoiceData);
      const invoiceId = invoiceResponse.data.data.id;

      // Navigate to payment processing page
      navigate(`/billing/payment/${invoiceId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. You can use the "Simulate Payment Success" button for demo purposes.');
    }
  };

  // Fetch available scans from Orthanc
  const fetchAvailableScans = async () => {
    setLoadingScans(true);
    try {
      const response = await api.get('/appointments/available-scans');
      setAvailableScans(response.data.data || []);
      setValidScanCodes(response.data.validScanCodes || []);
      setAvailableScanCodes(response.data.availableScanCodes || []);
      setUsedScanCodes(response.data.usedScanCodes || []);
    } catch (error) {
      console.error('Error fetching available scans:', error);
      alert(error.response?.data?.message || 'Failed to fetch available scans.');
      setAvailableScans([]);
      setValidScanCodes([]);
    } finally {
      setLoadingScans(false);
    }
  };

  // Handle opening assign scan modal
  const handleOpenAssignScanModal = () => {
    setShowAssignScanModal(true);
    setSelectedScanId('');
    setSelectedScanCode('');
    fetchAvailableScans();
  };

  // Handle assigning scan to appointment
  const handleAssignScan = async () => {
    if (!selectedScanId) {
      alert('Please select a scan to assign.');
      return;
    }

    if (!selectedScanCode) {
      alert('Please select a scan code.');
      return;
    }

    setAssigningScan(true);
    try {
      const selectedScan = availableScans.find(scan => scan.id === selectedScanId);
      if (!selectedScan) {
        alert('Selected scan not found.');
        setAssigningScan(false);
        return;
      }

      await api.patch(`/appointments/${appointmentId}/assign-scan`, {
        scanStudyInstanceUID: selectedScan.studyInstanceUID,
        scanStudyId: selectedScan.id,
        scanCode: selectedScanCode
      });

      alert('Scan assigned to appointment successfully!');
      setShowAssignScanModal(false);
      // Refresh appointment data
      const apptRes = await api.get(`/appointments/${appointmentId}`);
      setAppointment(apptRes.data.data);
    } catch (error) {
      console.error('Error assigning scan:', error);
      alert(error.response?.data?.message || 'Failed to assign scan to appointment.');
    } finally {
      setAssigningScan(false);
    }
  };

  if (loading) return <div className="page-container">Loading details...</div>;
  if (!appointment) return <div className="page-container">Appointment not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointment Details</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>

          {/* Status Update Buttons based on current status */}
          {appointment.status === 'Scheduled' && (
            <>
              <Button onClick={() => handleStatusUpdate('Confirmed')}>✅ Confirm</Button>
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>❌ Cancel</Button>
            </>
          )}

          {appointment.status === 'Confirmed' && (
            <>
              <Button onClick={() => handleStatusUpdate('Completed')}>✅ Mark Completed</Button>
              <Button variant="secondary" onClick={() => handleStatusUpdate('No Show')}>🚫 No Show</Button>
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>❌ Cancel</Button>
            </>
          )}

          {appointment.status === 'Completed' && (
            <Button onClick={() => navigate(`/billing/invoices`)}>💳 View Invoice</Button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <Card title="Appointment Info">
          <div className="info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span className={`status status-${appointment.status?.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Time:</label>
              <span>{appointment.appointmentTime}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span>{appointment.type}</span>
            </div>
          </div>
        </Card>

        <Card title="Patient Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Patient Name:</label>
              <span>{patientName}</span>
            </div>
            <div className="info-item">
              <label>Patient ID:</label>
              <span style={{ fontSize: '0.8em', color: '#666' }}>{appointment.patientId}</span>
            </div>
          </div>
          <Button size="small" onClick={() => navigate(`/patients/${appointment.patientId}/medical-profile`)}>
            View Medical Profile
          </Button>
        </Card>

        <Card title="Doctor Information">
          <div className="info-grid">
            <div className="info-item">
              <label>Doctor Name:</label>
              <span>{doctorName}</span>
            </div>
            <div className="info-item">
              <label>Doctor ID:</label>
              <span style={{ fontSize: '0.8em', color: '#666' }}>{appointment.doctorId}</span>
            </div>
          </div>
        </Card>

        <Card title="Reason for Visit">
          <p>{appointment.reasonForVisit || appointment.reason || 'No reason provided.'}</p>
        </Card>

        {/* Show Notes if they exist */}
        {appointment.notes && (
          <Card title="Clinical Notes">
            <p>{appointment.notes}</p>
          </Card>
        )}

        {/* Radiology Section */}
        <Card title="Radiology">
          {!appointment.radiologyOrder ? (
            <div>
              {userRole === 'doctor' || userRole === 'admin' || userRole === 'staff' ? (
                <>
                  <p style={{ marginBottom: '15px', color: '#666' }}>
                    Order a radiology scan for this appointment. The system will automatically assign an appropriate study based on the clinical indication.
                  </p>
                  <Button 
                    onClick={() => setShowRadiologyOrderModal(true)}
                    variant="primary"
                  >
                    Order Scan
                  </Button>
                </>
              ) : (
                <p style={{ color: '#666' }}>
                  No radiology scan has been ordered for this appointment yet.
                </p>
              )}
            </div>
          ) : (
            <div>
              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span 
                  className={`status status-${appointment.radiologyOrder.status === 'completed' ? 'completed' : 'pending'}`}
                  style={{ padding: '5px 10px', borderRadius: '4px', fontSize: '0.9em' }}
                >
                  {appointment.radiologyOrder.status === 'completed' 
                    ? 'Payment Verified & Scan Complete' 
                    : 'Order Placed - Waiting for Payment'}
                </span>
                <span style={{ color: '#666', fontSize: '0.9em' }}>
                  Indication: <strong>{appointment.radiologyOrder.indication}</strong>
                </span>
              </div>

              {/* Cost Display */}
              {appointment.radiologyOrder.cost && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>
                    Cost: <strong style={{ fontSize: '1.1em', color: '#0066cc' }}>${appointment.radiologyOrder.cost.toFixed(2)}</strong>
                  </span>
                </div>
              )}

              {/* Study ID (hidden until payment is complete, shown after payment) */}
              {appointment.radiologyOrder.status === 'completed' && appointment.radiologyOrder.pacsStudyId && (
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>
                    Study ID: <strong style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{appointment.radiologyOrder.pacsStudyId}</strong>
                  </span>
                </div>
              )}

              {/* Payment Section - Show when status is 'ordered' - Only for patients (not doctors) */}
              {appointment.radiologyOrder.status === 'ordered' && userRole === 'patient' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                  <p style={{ marginBottom: '15px', color: '#856404', fontWeight: 'bold' }}>
                    Payment Required
                  </p>
                  <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
                    Please complete payment to access the scan results. The scan has been assigned but is pending payment verification.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button 
                      onClick={handleProceedToPayment}
                      variant="primary"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Staff/Admin Demo Payment Section - Show simulate button for testing */}
              {appointment.radiologyOrder.status === 'ordered' && (userRole === 'admin' || userRole === 'staff') && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
                    Payment pending. Patient must complete payment to access scan results.
                  </p>
                  <Button 
                    onClick={handleSimulatePayment}
                    variant="secondary"
                    style={{ 
                      fontSize: '0.85em',
                      padding: '8px 12px'
                    }}
                    title="For demo/testing purposes only"
                  >
                    [Demo] Simulate Payment Success
                  </Button>
                </div>
              )}
              
              {/* Doctor View - Show message when status is 'ordered' */}
              {appointment.radiologyOrder.status === 'ordered' && userRole === 'doctor' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', border: '1px solid #0066cc', borderRadius: '4px' }}>
                  <p style={{ marginBottom: '0', color: '#004085', fontSize: '0.9em' }}>
                    ⏳ Scan order is pending payment. The patient will need to complete payment before the scan results become available.
                  </p>
                </div>
              )}

              {/* View Scan Section - Show only when status is 'completed' */}
              {appointment.radiologyOrder.status === 'completed' && appointment.radiologyOrder.pacsStudyId && (
                <div style={{ marginTop: '15px' }}>
                  <Button 
                    onClick={() => {
                      // Use StudyInstanceUIDs parameter to open only the specific scan directly in the viewer
                      // This bypasses the Study List and opens the viewer directly for this specific scan
                      const pacsStudyId = appointment.radiologyOrder.pacsStudyId;
                      
                      // Validate that we have a real Study Instance UID (not a mock ID)
                      if (!pacsStudyId || pacsStudyId.length < 20 || !pacsStudyId.includes('.')) {
                        alert(
                          `⚠️ Invalid Study Instance UID detected!\n\n` +
                          `The stored ID "${pacsStudyId}" appears to be a mock ID.\n\n` +
                          `Please create a new radiology order for this appointment to assign a real Study Instance UID from Orthanc.`
                        );
                        return;
                      }
                      
                      const ohifUrl = `http://localhost:3000/viewer?StudyInstanceUIDs=${encodeURIComponent(pacsStudyId)}`;
                      console.log('Opening OHIF viewer with Study Instance UID:', pacsStudyId);
                      console.log('Full URL:', ohifUrl);
                      window.open(ohifUrl, '_blank');
                    }}
                    variant="primary"
                  >
                    View Scan Results
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Show Invoice section for Completed appointments */}
        {appointment.status === 'Completed' && (
          <Card title="💳 Billing">
            <p style={{ marginBottom: '15px' }}>An invoice has been generated for this appointment.</p>
            <Button onClick={() => navigate('/billing/invoices')}>View Invoice</Button>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
        footer={
          <>
            <Button variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No, Keep It</Button>
          </>
        }
      >
        <p>Are you sure you want to cancel this appointment?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Assign Scan Modal */}
      <Modal
        isOpen={showAssignScanModal}
        onClose={() => setShowAssignScanModal(false)}
        title="Assign Scan to Appointment"
        footer={
          <>
            <Button 
              onClick={handleAssignScan}
              disabled={assigningScan || !selectedScanId || !selectedScanCode || loadingScans}
            >
              {assigningScan ? 'Assigning...' : 'Assign Scan'}
            </Button>
            <Button variant="secondary" onClick={() => setShowAssignScanModal(false)}>Cancel</Button>
          </>
        }
      >
        {loadingScans ? (
          <p>Loading available scans...</p>
        ) : availableScans.length === 0 ? (
          <div>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              No scans available. Make sure Orthanc is running and has studies loaded.
            </p>
            <Button variant="secondary" onClick={fetchAvailableScans}>Retry</Button>
          </div>
        ) : (
          <div>
            <FormField
              label="Select Scan Code"
              type="select"
              value={selectedScanCode}
              onChange={(e) => setSelectedScanCode(e.target.value)}
              options={[
                { value: '', label: '-- Select a scan code --' },
                ...validScanCodes.map(code => {
                  const isAvailable = availableScanCodes.includes(code);
                  const isUsed = usedScanCodes.includes(code);
                  return {
                    value: code,
                    label: `${code}${isUsed ? ' (Already Used)' : isAvailable ? ' (Available)' : ''}`
                  };
                })
              ]}
              required
            />
            <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
              Select one of the 20 predefined scan codes that corresponds to the MRI scan.
            </p>
            {availableScanCodes.length > 0 && (
              <p style={{ marginTop: '5px', fontSize: '0.85em', color: '#28a745' }}>
                Available codes: {availableScanCodes.join(', ')}
              </p>
            )}
            {usedScanCodes.length > 0 && (
              <p style={{ marginTop: '5px', fontSize: '0.85em', color: '#dc3545' }}>
                Used codes: {usedScanCodes.join(', ')}
              </p>
            )}
            
            <FormField
              label="Select Scan from Orthanc"
              type="select"
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
              options={[
                { value: '', label: '-- Select a scan --' },
                ...availableScans.map(scan => ({
                  value: scan.id,
                  label: `${scan.modality} - ${scan.studyDescription} (${scan.studyDate || 'No date'}) - Patient: ${scan.patientName}${scan.matchedScanCode ? ` [Code: ${scan.matchedScanCode}]` : ''}`
                }))
              ]}
              required
              style={{ marginTop: '15px' }}
            />
            
            {selectedScanId && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                {(() => {
                  const selected = availableScans.find(s => s.id === selectedScanId);
                  return selected ? (
                    <div>
                      <p><strong>Study ID:</strong> {selected.id}</p>
                      <p><strong>Modality:</strong> {selected.modality}</p>
                      <p><strong>Description:</strong> {selected.studyDescription}</p>
                      <p><strong>Date:</strong> {selected.studyDate || 'N/A'}</p>
                      <p><strong>Patient:</strong> {selected.patientName}</p>
                      <p><strong>Series:</strong> {selected.numberOfSeries}</p>
                      <p><strong>Instances:</strong> {selected.numberOfInstances}</p>
                      {selected.matchedScanCode && (
                        <p style={{ marginTop: '10px', padding: '5px', backgroundColor: '#e8f5e9', borderRadius: '3px' }}>
                          <strong>Matched Code:</strong> {selected.matchedScanCode}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Radiology Order Modal */}
      <Modal
        isOpen={showRadiologyOrderModal}
        onClose={() => !processingOrder && setShowRadiologyOrderModal(false)}
        title="Order Radiology Scan"
        footer={
          <>
            <Button 
              onClick={handleSubmitRadiologyOrder}
              disabled={!selectedIndication || processingOrder}
              variant="primary"
            >
              {processingOrder ? 'Processing...' : 'Submit Order'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowRadiologyOrderModal(false)}
              disabled={processingOrder}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.95em' }}>
            Select Scan Indication:
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
    </div>
  );
};

export default AppointmentDetails;