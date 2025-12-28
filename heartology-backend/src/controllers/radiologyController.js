const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * @desc    Run AI prediction on a DICOM study
 * @route   POST /api/radiology/predict
 * @access  Private
 */
const predictRadiology = async (req, res) => {
  try {
    const { pacsStudyId } = req.body;

    if (!pacsStudyId) {
      return res.status(400).json({
        success: false,
        message: 'pacsStudyId is required'
      });
    }

    // Path to the Python script (it's in the project root, 3 levels up from controllers)
    const scriptPath = path.join(__dirname, '../../../', 'cdss_inference.py');
    const projectRoot = path.join(__dirname, '../../../');

    // Execute the Python script with the working directory set to project root
    // On Windows, use 'python'; on Linux/Mac, may need 'python3'
    const { stdout, stderr } = await execPromise(
      `python "${scriptPath}" --id "${pacsStudyId}"`,
      { cwd: projectRoot }
    );

    if (stderr && !stderr.includes('Warning')) {
      // Python warnings can go to stderr, but actual errors should be handled
      console.error('Python script stderr:', stderr);
    }

    // Parse the JSON output from the Python script
    try {
      const result = JSON.parse(stdout.trim());

      // Check if the result contains an error (the Python script returns error objects in JSON)
      if (result.error) {
        return res.status(500).json({
          success: false,
          message: result.message || 'Error running AI prediction',
          error: result.error
        });
      }

      // Return the successful result
      return res.status(200).json({ success: true, data: result });

    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      console.error('Raw output:', stdout);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI prediction result',
        error: parseError.message,
        rawOutput: stdout
      });
    }
  } catch (error) {
    console.error('Error running AI prediction:', error);

    // Handle specific error cases
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        success: false,
        message: 'Python script not found. Please ensure cdss_inference.py exists in the project root.',
        error: error.message
      });
    }

    if (error.code === 127 || (error.message && error.message.includes('python'))) {
      return res.status(500).json({
        success: false,
        message: 'Python not found. Please ensure Python is installed and accessible from PATH.',
        error: error.message
      });
    }

    return res.status(500).json({ success: false, message: 'Failed to run AI prediction', error: error.message });
  }
};

// Get study thumbnail from Orthanc
const getStudyThumbnail = async (req, res) => {
  try {
    const studyId = req.params.id;
    if (!studyId) return res.status(400).json({ success: false, message: 'Study ID required' });

    const { fetchStudyPreview } = require('../services/RadiologyService');
    const buffer = await fetchStudyPreview(studyId);

    // Convert to base64 and return directly
    const imageBase64 = buffer.toString('base64');

    res.status(200).json({ success: true, data: { imageBase64 } });
  } catch (error) {
    console.error('Error fetching study thumbnail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  predictRadiology,
  getStudyThumbnail
};

