/**
 * Cleanup Duplicates Script for Heartology
 * Removes old/duplicate data that doesn't have the correct fields
 * Run with: node cleanup-duplicates.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./src/config/serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const cleanupDuplicates = async () => {
    console.log('🧹 Starting cleanup of duplicate data...\n');

    try {
        // ========== 1. CLEANUP DOCTORS ==========
        console.log('Cleaning up doctors...');
        const doctorsSnapshot = await db.collection('doctors').get();
        const doctorsByUserId = {};

        // Group doctors by userId
        doctorsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!doctorsByUserId[data.userId]) {
                doctorsByUserId[data.userId] = [];
            }
            doctorsByUserId[data.userId].push({ id: doc.id, ...data });
        });

        // For each userId, keep only the one with licenseNumber (new data)
        for (const userId in doctorsByUserId) {
            const doctors = doctorsByUserId[userId];
            if (doctors.length > 1) {
                // Find the one with licenseNumber (correct new data)
                const toKeep = doctors.find(d => d.licenseNumber);
                const toDelete = doctors.filter(d => !d.licenseNumber);

                for (const doc of toDelete) {
                    await db.collection('doctors').doc(doc.id).delete();
                    console.log(`  ✓ Deleted duplicate doctor: ${doc.name || doc.id}`);
                }
            }
        }

        // ========== 2. CLEANUP USERS ==========
        console.log('\nCleaning up users...');
        const usersSnapshot = await db.collection('users').get();
        const usersByEmail = {};

        // Group users by email
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!usersByEmail[data.email]) {
                usersByEmail[data.email] = [];
            }
            usersByEmail[data.email].push({ id: doc.id, ...data });
        });

        // Keep only the latest one (by createdAt)
        for (const email in usersByEmail) {
            const users = usersByEmail[email];
            if (users.length > 1) {
                // Sort by createdAt descending, keep latest
                users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = users.slice(1); // All except first (newest)

                for (const user of toDelete) {
                    await db.collection('users').doc(user.id).delete();
                    console.log(`  ✓ Deleted duplicate user: ${user.email}`);
                }
            }
        }

        // ========== 3. CLEANUP PATIENTS ==========
        console.log('\nCleaning up patients...');
        const patientsSnapshot = await db.collection('patients').get();
        const patientsByUserId = {};

        patientsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!patientsByUserId[data.userId]) {
                patientsByUserId[data.userId] = [];
            }
            patientsByUserId[data.userId].push({ id: doc.id, ...data });
        });

        for (const userId in patientsByUserId) {
            const patients = patientsByUserId[userId];
            if (patients.length > 1) {
                patients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = patients.slice(1);

                for (const patient of toDelete) {
                    await db.collection('patients').doc(patient.id).delete();
                    console.log(`  ✓ Deleted duplicate patient: ${patient.id}`);
                }
            }
        }

        // ========== 4. CLEANUP APPOINTMENTS ==========
        console.log('\nCleaning up appointments...');
        const apptsSnapshot = await db.collection('appointments').get();
        const apptsByKey = {};

        apptsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.patientId}-${data.doctorId}-${data.appointmentDate}-${data.appointmentTime}`;
            if (!apptsByKey[key]) {
                apptsByKey[key] = [];
            }
            apptsByKey[key].push({ id: doc.id, ...data });
        });

        for (const key in apptsByKey) {
            const appts = apptsByKey[key];
            if (appts.length > 1) {
                appts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = appts.slice(1);

                for (const appt of toDelete) {
                    await db.collection('appointments').doc(appt.id).delete();
                    console.log(`  ✓ Deleted duplicate appointment: ${appt.appointmentDate} ${appt.appointmentTime}`);
                }
            }
        }

        // ========== 5. CLEANUP INVOICES ==========
        console.log('\nCleaning up invoices...');
        const invoicesSnapshot = await db.collection('invoices').get();
        const invoicesByKey = {};

        invoicesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.patientId}-${data.appointmentId}-${data.totalAmount}`;
            if (!invoicesByKey[key]) {
                invoicesByKey[key] = [];
            }
            invoicesByKey[key].push({ id: doc.id, ...data });
        });

        for (const key in invoicesByKey) {
            const invoices = invoicesByKey[key];
            if (invoices.length > 1) {
                invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = invoices.slice(1);

                for (const inv of toDelete) {
                    await db.collection('invoices').doc(inv.id).delete();
                    console.log(`  ✓ Deleted duplicate invoice: ${inv.invoiceNumber}`);
                }
            }
        }

        // ========== 6. CLEANUP MEDICAL RECORDS ==========
        console.log('\nCleaning up medical records...');
        const recordsSnapshot = await db.collection('medicalRecords').get();
        const recordsByKey = {};

        recordsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.patientId}-${data.appointmentId}`;
            if (!recordsByKey[key]) {
                recordsByKey[key] = [];
            }
            recordsByKey[key].push({ id: doc.id, ...data });
        });

        for (const key in recordsByKey) {
            const records = recordsByKey[key];
            if (records.length > 1) {
                records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = records.slice(1);

                for (const rec of toDelete) {
                    await db.collection('medicalRecords').doc(rec.id).delete();
                    console.log(`  ✓ Deleted duplicate medical record`);
                }
            }
        }

        // ========== 7. CLEANUP PRESCRIPTIONS ==========
        console.log('\nCleaning up prescriptions...');
        const rxSnapshot = await db.collection('prescriptions').get();
        const rxByKey = {};

        rxSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.patientId}-${data.doctorId}-${JSON.stringify(data.medications)}`;
            if (!rxByKey[key]) {
                rxByKey[key] = [];
            }
            rxByKey[key].push({ id: doc.id, ...data });
        });

        for (const key in rxByKey) {
            const prescriptions = rxByKey[key];
            if (prescriptions.length > 1) {
                prescriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toDelete = prescriptions.slice(1);

                for (const rx of toDelete) {
                    await db.collection('prescriptions').doc(rx.id).delete();
                    console.log(`  ✓ Deleted duplicate prescription`);
                }
            }
        }

        console.log('\n✅ Cleanup completed successfully!');
        console.log('Please refresh your browser to see the updated data.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }

    process.exit(0);
};

// Run the cleanup
cleanupDuplicates();
