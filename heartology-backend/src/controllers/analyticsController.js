const { db } = require('../config/firebase');

// @desc    Get System Overview Stats
// @route   GET /api/analytics/system
// @access  Private (Admin/Staff)
const getSystemStats = async (req, res) => {
    try {
        const [usersSnap, patientsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
            db.collection('users').get(),
            db.collection('patients').get(),
            db.collection('doctors').get(),
            db.collection('appointments').get()
        ]);

        // Count appointments by status
        const appointmentsByStatus = {};
        appointmentsSnap.forEach(doc => {
            const status = doc.data().status || 'Unknown';
            appointmentsByStatus[status] = (appointmentsByStatus[status] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers: usersSnap.size,
                totalPatients: patientsSnap.size,
                totalDoctors: doctorsSnap.size,
                totalAppointments: appointmentsSnap.size,
                appointmentsByStatus
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Financial Statistics
// @route   GET /api/analytics/financial
// @access  Private (Admin/Staff)
const getFinancialStats = async (req, res) => {
    try {
        const invoicesSnap = await db.collection('invoices').get();

        let totalRevenue = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        let paidCount = 0;
        let pendingCount = 0;

        const revenueByMonth = {};

        invoicesSnap.forEach(doc => {
            const invoice = doc.data();
            const amount = invoice.totalAmount || 0;
            totalRevenue += amount;

            if (invoice.status === 'Paid') {
                paidAmount += amount;
                paidCount++;

                // Group by month
                if (invoice.paidAt) {
                    const month = invoice.paidAt.substring(0, 7); // YYYY-MM
                    revenueByMonth[month] = (revenueByMonth[month] || 0) + amount;
                }
            } else {
                pendingAmount += amount;
                pendingCount++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                paidAmount,
                pendingAmount,
                paidCount,
                pendingCount,
                revenueByMonth
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Appointment Statistics
// @route   GET /api/analytics/appointments
// @access  Private (Admin/Staff)
const getAppointmentStats = async (req, res) => {
    try {
        const appointmentsSnap = await db.collection('appointments').get();

        const byStatus = {};
        const byMonth = {};
        const byType = {};

        appointmentsSnap.forEach(doc => {
            const appt = doc.data();

            // By Status
            const status = appt.status || 'Unknown';
            byStatus[status] = (byStatus[status] || 0) + 1;

            // By Month
            if (appt.appointmentDate) {
                const month = appt.appointmentDate.substring(0, 7);
                byMonth[month] = (byMonth[month] || 0) + 1;
            }

            // By Type
            const type = appt.type || 'Other';
            byType[type] = (byType[type] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            data: {
                total: appointmentsSnap.size,
                byStatus,
                byMonth,
                byType
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Patient Demographics
// @route   GET /api/analytics/patients
// @access  Private (Admin/Staff)
const getPatientStats = async (req, res) => {
    try {
        const patientsSnap = await db.collection('patients').get();
        const userIds = [];

        patientsSnap.forEach(doc => {
            const patient = doc.data();
            if (patient.userId) userIds.push(patient.userId);
        });

        // Fetch user data for demographics
        const byGender = {};
        const byAgeGroup = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };

        for (const userId of userIds) {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const user = userDoc.data();

                // Gender - Normalize case (e.g., 'male' -> 'Male')
                let gender = user.gender || 'Unknown';
                gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
                byGender[gender] = (byGender[gender] || 0) + 1;

                // Age
                if (user.dateOfBirth) {
                    const birthDate = new Date(user.dateOfBirth);
                    const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                    if (age <= 18) byAgeGroup['0-18']++;
                    else if (age <= 35) byAgeGroup['19-35']++;
                    else if (age <= 50) byAgeGroup['36-50']++;
                    else if (age <= 65) byAgeGroup['51-65']++;
                    else byAgeGroup['65+']++;
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalPatients: patientsSnap.size,
                byGender,
                byAgeGroup
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getFinancialStats,
    getAppointmentStats,
    getPatientStats
};
