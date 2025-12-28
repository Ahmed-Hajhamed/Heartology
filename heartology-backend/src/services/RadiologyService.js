const http = require('http');
const https = require('https');

/**
 * RadiologyService - Handles DICOM study modification in Orthanc
 */

const ORTHANC_URL = process.env.ORTHANC_URL || 'http://localhost:8042';

/**
 * Makes an HTTP POST request to Orthanc
 * @param {string} url - Full URL to the Orthanc endpoint
 * @param {object} data - Request body data
 * @returns {Promise<object>} - Parsed JSON response
 */
const makePostRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error('Failed to parse JSON response from Orthanc'));
          }
        } else {
          reject(new Error(`Orthanc returned HTTP ${res.statusCode}: ${res.statusMessage}. Response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Assigns a scan template to a patient by modifying DICOM metadata
 * This creates a new study with the patient's information while keeping the original template
 * 
 * @param {string} templateStudyUid - The Study Instance UID of the template scan in Orthanc
 * @param {object} patientData - Patient information object
 * @param {string} patientData.fullName - Patient's full name (e.g., "Ahmed Mohamed")
 * @param {string} patientData.id - Patient's ID (will be used as PatientID in DICOM)
 * @returns {Promise<string>} - The new Study Instance UID returned by Orthanc
 */
const assignScanToPatient = async (templateStudyUid, patientData) => {
  try {
    if (!templateStudyUid) {
      throw new Error('Template Study UID is required');
    }

    if (!patientData || !patientData.fullName || !patientData.id) {
      throw new Error('Patient data with fullName and id is required');
    }

    const modifyUrl = `${ORTHANC_URL}/studies/${templateStudyUid}/modify`;
    
    const requestBody = {
      Replace: {
        PatientName: patientData.fullName,
        PatientID: patientData.id,
        AccessionNumber: `ACC-${Date.now()}` // Unique order ID
      },
      KeepSource: true, // Don't delete the original template!
      Force: true // Allow modification of UID
    };

    console.log(`Calling Orthanc modify endpoint: ${modifyUrl}`);
    console.log(`Request body:`, JSON.stringify(requestBody, null, 2));

    const response = await makePostRequest(modifyUrl, requestBody);

    // Orthanc returns the new Study Instance UID in the ID field
    if (!response.ID) {
      throw new Error('Orthanc did not return a new Study Instance UID');
    }

    console.log(`Successfully created new study with UID: ${response.ID}`);
    return response.ID;

  } catch (error) {
    console.error('Error in assignScanToPatient:', error);
    throw new Error(`Failed to assign scan to patient: ${error.message}`);
  }
};

/**
 * Fetch a PNG preview image for a study from Orthanc and return as Buffer
 * @param {string} studyUid
 * @returns {Promise<Buffer>} - PNG image buffer
 */
const fetchStudyPreview = (studyUid) => {
  return new Promise((resolve, reject) => {
    try {
      if (!studyUid) return reject(new Error('studyUid is required'));

      const url = `${ORTHANC_URL}/studies/${studyUid}/preview`;
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET'
      };

      const req = protocol.request(options, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(buffer);
          } else {
            reject(new Error(`Orthanc preview returned ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.end();

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  assignScanToPatient,
  fetchStudyPreview
};

