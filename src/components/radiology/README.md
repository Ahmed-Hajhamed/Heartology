# DICOM Viewer Integration

This component integrates OHIF DICOM viewer with Orthanc server for displaying radiology scans.

## Setup Requirements

1. **OHIF Viewer**: Must be running on `http://localhost:3000`
2. **Orthanc Server**: Must be running and accessible (default: `http://localhost:8042`)

## Configuration

### OHIF Viewer URL Format

The DICOM viewer component constructs URLs in the format:
```
http://localhost:3000/viewer?studyInstanceUIDs={studyInstanceUID}
```

If your OHIF configuration uses a different URL pattern, modify the `DICOMViewer.js` component accordingly.

### Orthanc API Access

The component fetches studies directly from Orthanc. Ensure:

1. **CORS is enabled** in Orthanc configuration:
   ```json
   {
     "HttpRequestTimeout": 30,
     "HttpsRequestTimeout": 30,
     "HttpVerbose": false,
     "HttpsVerifyPeers": true,
     "HttpsCaCertificates": "",
     "RemoteAccessAllowed": true,
     "OrthancPublicUrl": "http://localhost:8042/",
     "LimitRestrictedInstances": false,
     "LimitRestrictedSeries": false,
     "LimitRestrictedStudies": false,
     "LimitRestrictedPatients": false,
     "HttpCorsEnabled": true,
     "HttpCorsAllowedOrigins": ["http://localhost:3000", "http://localhost:3001"]
   }
   ```

2. **Patient ID Mapping**: The component matches patients by `PatientID` DICOM tag. Ensure your patient IDs in the HIS match the `PatientID` tag in Orthanc.

## Alternative: Backend Proxy

If CORS issues persist, create a backend endpoint that proxies Orthanc requests:

```javascript
// Backend route example
app.get('/api/patients/:patientId/radiology-scans', async (req, res) => {
  const { patientId } = req.params;
  // Fetch from Orthanc and return studies
  const response = await fetch(`http://localhost:8042/patients?expand`);
  // Filter and return studies for this patient
});
```

Then update `PatientDetails.js` to use this endpoint instead of direct Orthanc calls.

## Usage

The DICOM viewer is automatically integrated into the Patient Details page. When a patient has radiology scans:

1. Scans are listed in the "Radiology Scans" section
2. Click on a scan to view it in the embedded OHIF viewer
3. The viewer loads in an iframe with full OHIF functionality

## Troubleshooting

- **Viewer not loading**: Check that OHIF is running on port 3000
- **No scans showing**: Verify Orthanc has studies for the patient and CORS is enabled
- **CORS errors**: Use backend proxy approach or configure Orthanc CORS settings

