import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DICOMViewer from '../../components/radiology/DICOMViewer';

const RadiologyViewer = () => {
  const { studyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studyInfo, setStudyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get study info from URL params or fetch from Orthanc
  const studyInstanceUID = searchParams.get('studyInstanceUID') || studyId;
  const patientId = searchParams.get('patientId');

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
    </div>
  );
};

export default RadiologyViewer;

