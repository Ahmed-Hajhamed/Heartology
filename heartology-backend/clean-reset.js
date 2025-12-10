/**
 * Clean Reset Script for Heartology
 * Clears ALL data and re-seeds fresh
 * Run with: node clean-reset.js
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const serviceAccount = require('./src/config/serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper to hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Delete all documents in a collection
const deleteCollection = async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`  ✓ Cleared ${collectionName} (${snapshot.size} documents)`);
};

const cleanAndSeed = async () => {
    console.log('🗑️  Clearing all existing data...\n');

    try {
        // Clear all collections
        await deleteCollection('users');
        await deleteCollection('doctors');
        await deleteCollection('patients');
        await deleteCollection('appointments');
        await deleteCollection('invoices');
        await deleteCollection('medicalRecords');
        await deleteCollection('prescriptions');

        console.log('\n🌱 Starting fresh seed...\n');

        // ========== 1. CREATE USERS ==========
        console.log('Creating users...');
        const hashedPassword = await hashPassword('password123');

        const users = [
            // Doctors
            { ssn: '111-11-1111', email: 'dr.ahmed@heartology.com', password: hashedPassword, role: 'doctor', firstName: 'Ahmed', lastName: 'Hassan', phone: '+20123456789', gender: 'Male', dateOfBirth: '1980-05-15' },
            { ssn: '222-22-2222', email: 'dr.sarah@heartology.com', password: hashedPassword, role: 'doctor', firstName: 'Sarah', lastName: 'Ali', phone: '+20123456790', gender: 'Female', dateOfBirth: '1985-08-20' },
            { ssn: '333-33-3333', email: 'dr.omar@heartology.com', password: hashedPassword, role: 'doctor', firstName: 'Omar', lastName: 'Mahmoud', phone: '+20123456791', gender: 'Male', dateOfBirth: '1978-03-10' },

            // Patients
            { ssn: '444-44-4444', email: 'patient1@gmail.com', password: hashedPassword, role: 'patient', firstName: 'Mohamed', lastName: 'Ahmed', phone: '+20111222333', gender: 'Male', dateOfBirth: '1990-01-15' },
            { ssn: '555-55-5555', email: 'patient2@gmail.com', password: hashedPassword, role: 'patient', firstName: 'Fatima', lastName: 'Ibrahim', phone: '+20111222334', gender: 'Female', dateOfBirth: '1988-07-22' },
            { ssn: '666-66-6666', email: 'patient3@gmail.com', password: hashedPassword, role: 'patient', firstName: 'Youssef', lastName: 'Khaled', phone: '+20111222335', gender: 'Male', dateOfBirth: '1975-11-30' },
            { ssn: '777-77-7777', email: 'patient4@gmail.com', password: hashedPassword, role: 'patient', firstName: 'Nour', lastName: 'Hassan', phone: '+20111222336', gender: 'Female', dateOfBirth: '1995-04-18' },
            { ssn: '888-88-8888', email: 'patient5@gmail.com', password: hashedPassword, role: 'patient', firstName: 'Ali', lastName: 'Mostafa', phone: '+20111222337', gender: 'Male', dateOfBirth: '1982-09-05' },

            // Admin
            { ssn: '999-99-9999', email: 'admin@heartology.com', password: hashedPassword, role: 'admin', firstName: 'Admin', lastName: 'User', phone: '+20100000000', gender: 'Male', dateOfBirth: '1990-01-01' },

            // Staff
            { ssn: '000-00-0001', email: 'staff@heartology.com', password: hashedPassword, role: 'staff', firstName: 'Receptionist', lastName: 'Staff', phone: '+20100000001', gender: 'Female', dateOfBirth: '1992-06-15' },
        ];

        const userIds = {};
        for (const user of users) {
            const docRef = await db.collection('users').add({
                ...user,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            userIds[user.email] = docRef.id;
            console.log(`  ✓ Created user: ${user.firstName} ${user.lastName} (${user.role})`);
        }

        // ========== 2. CREATE DOCTORS ==========
        console.log('\nCreating doctor profiles...');
        const doctors = [
            { userId: userIds['dr.ahmed@heartology.com'], name: 'Dr. Ahmed Hassan', specialization: 'Cardiology', qualifications: ['MD', 'PhD Cardiology', 'FACC'], yearsOfExperience: 15, consultationFee: 500, licenseNumber: 'LIC-CARD-001', workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], workingHours: { start: '09:00', end: '17:00' }, availability: 'Available' },
            { userId: userIds['dr.sarah@heartology.com'], name: 'Dr. Sarah Ali', specialization: 'Interventional Cardiology', qualifications: ['MD', 'Fellowship Interventional Cardiology'], yearsOfExperience: 10, consultationFee: 600, licenseNumber: 'LIC-INTC-002', workingDays: ['Sunday', 'Monday', 'Wednesday'], workingHours: { start: '10:00', end: '18:00' }, availability: 'Available' },
            { userId: userIds['dr.omar@heartology.com'], name: 'Dr. Omar Mahmoud', specialization: 'Electrophysiology', qualifications: ['MD', 'Board Certified EP'], yearsOfExperience: 20, consultationFee: 700, licenseNumber: 'LIC-ELEC-003', workingDays: ['Monday', 'Tuesday', 'Thursday'], workingHours: { start: '08:00', end: '16:00' }, availability: 'Available' },
        ];

        const doctorIds = {};
        for (const doc of doctors) {
            const docRef = await db.collection('doctors').add({
                ...doc,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            doctorIds[doc.name] = docRef.id;
            console.log(`  ✓ Created doctor: ${doc.name}`);
        }

        // ========== 3. CREATE PATIENTS ==========
        console.log('\nCreating patient profiles...');
        const patients = [
            { userId: userIds['patient1@gmail.com'], bloodType: 'A+', allergies: ['Penicillin'], chronicConditions: ['Hypertension'], emergencyContact: { name: 'Salma Ahmed', phone: '+20111999888', relationship: 'Wife' }, insuranceInfo: { provider: 'MetLife', policyNumber: 'ML-123456', expiryDate: '2025-12-31' } },
            { userId: userIds['patient2@gmail.com'], bloodType: 'O-', allergies: [], chronicConditions: ['Diabetes Type 2'], emergencyContact: { name: 'Hassan Ibrahim', phone: '+20111999887', relationship: 'Husband' }, insuranceInfo: { provider: 'AXA', policyNumber: 'AX-789012', expiryDate: '2025-06-30' } },
            { userId: userIds['patient3@gmail.com'], bloodType: 'B+', allergies: ['Aspirin', 'Sulfa'], chronicConditions: ['Coronary Artery Disease', 'High Cholesterol'], emergencyContact: { name: 'Layla Khaled', phone: '+20111999886', relationship: 'Daughter' }, insuranceInfo: { provider: 'Allianz', policyNumber: 'AL-345678', expiryDate: '2026-01-15' } },
            { userId: userIds['patient4@gmail.com'], bloodType: 'AB+', allergies: [], chronicConditions: [], emergencyContact: { name: 'Mohamed Hassan', phone: '+20111999885', relationship: 'Father' }, insuranceInfo: { provider: 'Bupa', policyNumber: 'BP-901234', expiryDate: '2025-09-20' } },
            { userId: userIds['patient5@gmail.com'], bloodType: 'A-', allergies: ['Latex'], chronicConditions: ['Arrhythmia'], emergencyContact: { name: 'Amina Mostafa', phone: '+20111999884', relationship: 'Sister' }, insuranceInfo: { provider: 'MetLife', policyNumber: 'ML-567890', expiryDate: '2025-11-30' } },
        ];

        const patientIds = [];
        for (let i = 0; i < patients.length; i++) {
            const docRef = await db.collection('patients').add({
                ...patients[i],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            patientIds.push(docRef.id);
            console.log(`  ✓ Created patient profile ${i + 1}`);
        }

        // ========== 4. CREATE APPOINTMENTS ==========
        console.log('\nCreating appointments...');
        const doctorIdList = Object.values(doctorIds);

        const appointments = [
            { patientId: patientIds[0], doctorId: doctorIdList[0], appointmentDate: '2025-12-10', appointmentTime: '09:00', type: 'Check-up', status: 'Scheduled', reasonForVisit: 'Routine heart check-up' },
            { patientId: patientIds[1], doctorId: doctorIdList[1], appointmentDate: '2025-12-10', appointmentTime: '10:30', type: 'Consultation', status: 'Confirmed', reasonForVisit: 'Chest pain evaluation' },
            { patientId: patientIds[2], doctorId: doctorIdList[0], appointmentDate: '2025-12-11', appointmentTime: '11:00', type: 'Follow-up', status: 'Scheduled', reasonForVisit: 'Post-surgery follow-up' },
            { patientId: patientIds[3], doctorId: doctorIdList[2], appointmentDate: '2025-12-11', appointmentTime: '14:00', type: 'Consultation', status: 'Confirmed', reasonForVisit: 'Palpitations and dizziness' },
            { patientId: patientIds[4], doctorId: doctorIdList[1], appointmentDate: '2025-12-12', appointmentTime: '09:30', type: 'Check-up', status: 'Scheduled', reasonForVisit: 'Annual cardiac screening' },
            { patientId: patientIds[0], doctorId: doctorIdList[2], appointmentDate: '2025-12-05', appointmentTime: '15:00', type: 'Consultation', status: 'Completed', reasonForVisit: 'ECG review' },
            { patientId: patientIds[2], doctorId: doctorIdList[0], appointmentDate: '2025-12-03', appointmentTime: '10:00', type: 'Follow-up', status: 'Completed', reasonForVisit: 'Medication adjustment' },
            { patientId: patientIds[1], doctorId: doctorIdList[0], appointmentDate: '2025-12-08', appointmentTime: '16:00', type: 'Check-up', status: 'Cancelled', reasonForVisit: 'Regular check-up - Patient cancelled' },
        ];

        const appointmentIds = [];
        for (const appt of appointments) {
            const docRef = await db.collection('appointments').add({
                ...appt,
                notes: '',
                reminderSent: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            appointmentIds.push(docRef.id);
            console.log(`  ✓ Created appointment: ${appt.appointmentDate} at ${appt.appointmentTime}`);
        }

        // ========== 5. CREATE INVOICES ==========
        console.log('\nCreating invoices...');
        const invoices = [
            {
                patientId: patientIds[0],
                appointmentId: appointmentIds[5],
                items: [{ description: 'Consultation Fee', amount: 500 }, { description: 'ECG Test', amount: 200 }],
                totalAmount: 700,
                paidAmount: 700,
                balanceAmount: 0,
                status: 'Paid',
                paymentMethod: 'Credit Card',
                paidAt: '2025-12-05',
                invoiceDate: '2025-12-05',
                dueDate: '2026-01-05'
            },
            {
                patientId: patientIds[2],
                appointmentId: appointmentIds[6],
                items: [{ description: 'Follow-up Consultation', amount: 300 }],
                totalAmount: 300,
                paidAmount: 300,
                balanceAmount: 0,
                status: 'Paid',
                paymentMethod: 'Cash',
                paidAt: '2025-12-03',
                invoiceDate: '2025-12-03',
                dueDate: '2026-01-03'
            },
            {
                patientId: patientIds[0],
                appointmentId: appointmentIds[0],
                items: [{ description: 'Check-up Fee', amount: 500 }, { description: 'Blood Test', amount: 150 }],
                totalAmount: 650,
                paidAmount: 0,
                balanceAmount: 650,
                status: 'Pending',
                paymentMethod: null,
                paidAt: null,
                invoiceDate: '2025-12-10',
                dueDate: '2026-01-10'
            },
            {
                patientId: patientIds[1],
                appointmentId: appointmentIds[1],
                items: [{ description: 'Consultation Fee', amount: 600 }, { description: 'Stress Test', amount: 400 }],
                totalAmount: 1000,
                paidAmount: 0,
                balanceAmount: 1000,
                status: 'Pending',
                paymentMethod: null,
                paidAt: null,
                invoiceDate: '2025-12-10',
                dueDate: '2026-01-10'
            },
            {
                patientId: patientIds[3],
                appointmentId: appointmentIds[3],
                items: [{ description: 'Consultation Fee', amount: 700 }, { description: 'Holter Monitor (24h)', amount: 800 }],
                totalAmount: 1500,
                paidAmount: 0,
                balanceAmount: 1500,
                status: 'Pending',
                paymentMethod: null,
                paidAt: null,
                invoiceDate: '2025-12-11',
                dueDate: '2026-01-11'
            },
        ];

        for (const inv of invoices) {
            await db.collection('invoices').add({
                ...inv,
                invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`  ✓ Created invoice: ${inv.totalAmount} EGP (${inv.status})`);
        }

        // ========== 6. CREATE MEDICAL RECORDS ==========
        console.log('\nCreating medical records...');
        const medicalRecords = [
            {
                patientId: patientIds[0],
                doctorId: doctorIdList[0],
                appointmentId: appointmentIds[5],
                visitDate: '2025-12-05',
                vitalSigns: {
                    bloodPressure: '130/85',
                    heartRate: 78,
                    temperature: 36.8,
                    weight: 82,
                    height: 175,
                    oxygenSaturation: 98,
                    respiratoryRate: 16
                },
                diagnoses: [{ code: 'I10', description: 'Essential (primary) hypertension' }],
                symptoms: ['Mild headache', 'Occasional dizziness'],
                chiefComplaint: 'Routine follow-up for hypertension management',
                subjective: 'Patient reports occasional mild headaches in the morning, improved with medication. Denies chest pain, palpitations, or shortness of breath. Compliant with prescribed medications.',
                objective: 'Alert and oriented. BP 130/85 mmHg, HR 78 bpm regular. Heart sounds normal, no murmurs. Lungs clear bilaterally. No peripheral edema.',
                assessment: 'Essential hypertension - well controlled on current regimen. No evidence of end-organ damage.',
                plan: 'Continue Amlodipine 5mg daily and Lisinopril 10mg daily. Low sodium diet. Follow-up in 2 weeks for BP recheck. Labs: BMP and lipid panel before next visit.',
                treatmentPlan: 'Continue current medication. Reduce salt intake. Follow-up in 2 weeks.',
                notes: 'Patient responding well to treatment. Encouraged lifestyle modifications.'
            },
            {
                patientId: patientIds[2],
                doctorId: doctorIdList[0],
                appointmentId: appointmentIds[6],
                visitDate: '2025-12-03',
                vitalSigns: {
                    bloodPressure: '145/90',
                    heartRate: 72,
                    temperature: 36.5,
                    weight: 90,
                    height: 170,
                    oxygenSaturation: 96,
                    respiratoryRate: 18
                },
                diagnoses: [
                    { code: 'I25.1', description: 'Atherosclerotic heart disease of native coronary artery' },
                    { code: 'Z95.5', description: 'Presence of coronary angioplasty implant and graft' }
                ],
                symptoms: ['Chest discomfort on exertion', 'Shortness of breath', 'Fatigue'],
                chiefComplaint: 'Post-stent placement follow-up - 6 months status post LAD stent',
                subjective: 'Patient reports mild chest discomfort with heavy exertion, improved from pre-procedure. Occasional shortness of breath when climbing stairs. Taking all medications as prescribed. Denies rest pain or nocturnal symptoms.',
                objective: 'BP 145/90 mmHg (elevated), HR 72 bpm regular. Heart sounds S1/S2 normal, no S3/S4, no murmurs. Lungs with bibasilar crackles. Mild bilateral ankle edema +1. Surgical site well healed.',
                assessment: '1. CAD s/p LAD stent - stable but with residual symptoms on exertion. 2. Hypertension - suboptimally controlled. 3. Mild fluid retention.',
                plan: '1. Increase Lisinopril to 20mg daily for better BP control. 2. Add Furosemide 20mg daily for fluid management. 3. Continue dual antiplatelet therapy (Aspirin + Clopidogrel). 4. Schedule stress test in 2 weeks. 5. Consider cardiology referral if symptoms worsen. 6. Dietary counseling: low sodium, heart-healthy diet.',
                treatmentPlan: 'Adjust medication dosage. Schedule stress test. Consider angiography if symptoms persist.',
                notes: 'Post-stent placement follow-up. Stent functioning well. Patient educated on warning signs requiring immediate attention.'
            },
        ];

        for (const record of medicalRecords) {
            await db.collection('medicalRecords').add({
                ...record,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`  ✓ Created medical record`);
        }

        // ========== 7. CREATE PRESCRIPTIONS ==========
        console.log('\nCreating prescriptions...');
        const prescriptions = [
            {
                patientId: patientIds[0],
                doctorId: doctorIdList[0],
                medications: [
                    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
                    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
                ],
                status: 'Active',
                notes: 'Take with food. Monitor blood pressure daily.'
            },
            {
                patientId: patientIds[2],
                doctorId: doctorIdList[0],
                medications: [
                    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '90 days' },
                    { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime', duration: '90 days' },
                    { name: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', duration: '90 days' }
                ],
                status: 'Active',
                notes: 'Post-stent medication regimen. Do not stop without consulting doctor.'
            },
            {
                patientId: patientIds[4],
                doctorId: doctorIdList[2],
                medications: [
                    { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', duration: '60 days' }
                ],
                status: 'Active',
                notes: 'For arrhythmia management. Report any dizziness or fatigue.'
            }
        ];

        for (const rx of prescriptions) {
            await db.collection('prescriptions').add({
                ...rx,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            console.log(`  ✓ Created prescription`);
        }

        console.log('\n✅ Clean reset completed successfully!');
        console.log('\n📋 Login Credentials (password: password123):');
        console.log('   Doctors: dr.ahmed@heartology.com, dr.sarah@heartology.com, dr.omar@heartology.com');
        console.log('   Patients: patient1@gmail.com, patient2@gmail.com, patient3@gmail.com');
        console.log('   Admin: admin@heartology.com');
        console.log('   Staff: staff@heartology.com');

    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
};

// Run the clean reset
cleanAndSeed();
