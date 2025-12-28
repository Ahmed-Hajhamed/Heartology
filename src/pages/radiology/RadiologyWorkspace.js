import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import api from '../../services/api';
import './RadiologyWorkspace.css';

const RadiologyWorkspace = () => {
  const { pacsStudyId } = useParams();
  const navigate = useNavigate();
  const [analysisState, setAnalysisState] = useState('initial'); // 'initial', 'loading', 'result', 'error'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Validate pacsStudyId
  if (!pacsStudyId) {
    return (
      <div className="radiology-workspace">
        <div className="workspace-header">
          <h1>Radiology Workstation</h1>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
        <div style={{ padding: '50px', textAlign: 'center', color: '#ffffff' }}>
          <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>⚠️ No Study ID provided</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Construct OHIF viewer URL
  const ohifUrl = `http://localhost:3000/viewer?StudyInstanceUIDs=${encodeURIComponent(pacsStudyId)}`;

  const handleRunAnalysis = async () => {
    if (!pacsStudyId) {
      alert('No Study ID available');
      return;
    }

    setAnalysisState('loading');
    setError(null);

    try {
      const response = await api.post('/radiology/predict', {
        pacsStudyId: pacsStudyId
      });

      if (response.data && response.data.data) {
        setAnalysisResult(response.data.data);
        setAnalysisState('result');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error running AI analysis:', err);
      setError(err.response?.data?.message || err.message || 'Failed to run AI analysis');
      setAnalysisState('error');
    }
  };

  const getClinicalNote = (diagnosis) => {
    if (!diagnosis) return '';
    
    const normalTerms = ['Normal'];
    const isNormal = normalTerms.some(term => 
      diagnosis.toLowerCase().includes(term.toLowerCase())
    );
    
    return isNormal 
      ? 'Routine follow-up recommended'
      : 'Immediate consultation recommended';
  };

  return (
    <div className="radiology-workspace">
      <div className="workspace-header">
        <h1>Radiology Workstation</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="workspace-container">
        {/* Top Section: OHIF Viewer (70% height) */}
        <div className="viewer-section">
          <iframe
            src={ohifUrl}
            className="ohif-viewer-iframe"
            frameBorder="0"
            title="OHIF DICOM Viewer"
            allowFullScreen
          />
        </div>

        {/* Bottom Section: AI Panel (30% height) */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <h2>Clinical Decision Support</h2>
          </div>

          <div className="ai-panel-content">
            {analysisState === 'initial' && (
              <div className="ai-initial-state">
                <Button
                  onClick={handleRunAnalysis}
                  variant="primary"
                  className="run-analysis-button"
                  style={{
                    fontSize: '1.2em',
                    padding: '15px 40px',
                    fontWeight: 'bold'
                  }}
                >
                  🤖 Run AI Analysis
                </Button>
                <p className="ai-description">
                  Click to analyze DICOM frames and generate clinical insights
                </p>
              </div>
            )}

            {analysisState === 'loading' && (
              <div className="ai-loading-state">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p className="loading-text">Processing DICOM Frames (ED/ES)...</p>
                <p className="loading-subtext">This may take a few moments</p>
              </div>
            )}

            {analysisState === 'result' && analysisResult && (
              <div className="ai-result-state">
                <div className="analysis-report">
                  {/* Primary Diagnosis */}
                  <div className="diagnosis-section">
                    <label className="report-label">Primary Diagnosis</label>
                    <h3 className="diagnosis-text">{analysisResult.diagnosis || 'N/A'}</h3>
                  </div>

                  {/* Confidence Score */}
                  <div className="confidence-section">
                    <label className="report-label">Confidence Score</label>
                    <div className="confidence-badge">
                      {((analysisResult.confidence || 0) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Segmentation Data */}
                  {analysisResult.segmentation && (
                    <div className="segmentation-section">
                      <label className="report-label">Segmentation Data</label>
                      <div className="segmentation-data">
                        <div className="segmentation-item">
                          <span className="segmentation-label">ED Frame:</span>
                          <span className="segmentation-value">
                            {analysisResult.segmentation.ed_frame ?? 'N/A'}
                          </span>
                        </div>
                        <div className="segmentation-item">
                          <span className="segmentation-label">ES Frame:</span>
                          <span className="segmentation-value">
                            {analysisResult.segmentation.es_frame ?? 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Derived Metrics */}
                  {analysisResult.derived_metrics && analysisResult.derived_metrics.LVEF !== undefined && (
                    <div className="metrics-section">
                      <label className="report-label">Derived Metrics</label>
                      <div className="metrics-data">
                        <div className="metric-item">
                          <span className="metric-label">LVEF:</span>
                          <span className="metric-value">
                            {analysisResult.derived_metrics.LVEF}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clinical Note */}
                  <div className="clinical-note-section">
                    <label className="report-label">Clinical Note</label>
                    <p className="clinical-note-text">
                      {getClinicalNote(analysisResult.diagnosis)}
                    </p>
                  </div>
                </div>

                <div className="analysis-actions">
                  <Button
                    onClick={() => {
                      setAnalysisState('initial');
                      setAnalysisResult(null);
                    }}
                    variant="secondary"
                  >
                    Run New Analysis
                  </Button>
                </div>
              </div>
            )}

            {analysisState === 'error' && (
              <div className="ai-error-state">
                <div className="error-icon">⚠️</div>
                <p className="error-text">{error || 'An error occurred during analysis'}</p>
                <Button
                  onClick={() => {
                    setAnalysisState('initial');
                    setError(null);
                  }}
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyWorkspace;

