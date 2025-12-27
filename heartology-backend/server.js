const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const medicalRecordRoutes = require('./src/routes/medicalRecordRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');




const { db } = require('./src/config/firebase');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test Route to check Database Connection
app.get('/', async (req, res) => {
  try {
    // Try to read a test collection to ensure connection works
    const snapshot = await db.collection('test').get();
    res.send(`Heartology Backend with Firebase is running. Test doc count: ${snapshot.size}`);
  } catch (error) {
    res.status(500).send(`Firebase connection error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});