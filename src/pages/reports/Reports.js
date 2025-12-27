import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import '../../styles/pages/Reports.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [systemStats, setSystemStats] = useState(null);
    const [financialStats, setFinancialStats] = useState(null);
    const [appointmentStats, setAppointmentStats] = useState(null);
    const [patientStats, setPatientStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chart refs for PDF export
    const appointmentMonthChartRef = useRef(null);
    const appointmentStatusChartRef = useRef(null);
    const invoiceStatusChartRef = useRef(null);
    const genderChartRef = useRef(null);
    const ageChartRef = useRef(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [sysRes, finRes, apptRes, patRes] = await Promise.all([
                    api.get('/analytics/system'),
                    api.get('/analytics/financial'),
                    api.get('/analytics/appointments'),
                    api.get('/analytics/patients')
                ]);

                setSystemStats(sysRes.data.data);
                setFinancialStats(finRes.data.data);
                setAppointmentStats(apptRes.data.data);
                setPatientStats(patRes.data.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Download PDF Report with Charts
    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        // ========== PAGE 1: Title & Tables ==========
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text('Heartology Analytics Report', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

        let yPos = 40;

        // System Overview Table
        doc.setFontSize(14);
        doc.setTextColor(52, 152, 219);
        doc.text('System Overview', margin, yPos);
        yPos += 8;

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Patients', systemStats?.totalPatients || 0],
                ['Total Doctors', systemStats?.totalDoctors || 0],
                ['Total Appointments', systemStats?.totalAppointments || 0],
                ['Total Users', systemStats?.totalUsers || 0],
            ],
            theme: 'striped',
            headStyles: { fillColor: [52, 152, 219] },
            margin: { left: margin },
            tableWidth: 85,
        });

        // Financial table on right side
        autoTable(doc, {
            startY: yPos,
            head: [['Financial', 'Value (EGP)']],
            body: [
                ['Total Revenue', financialStats?.totalRevenue?.toLocaleString() || 0],
                ['Paid Amount', financialStats?.paidAmount?.toLocaleString() || 0],
                ['Pending Amount', financialStats?.pendingAmount?.toLocaleString() || 0],
                ['Paid Invoices', financialStats?.paidCount || 0],
                ['Pending Invoices', financialStats?.pendingCount || 0],
            ],
            theme: 'striped',
            headStyles: { fillColor: [46, 204, 113] },
            margin: { left: 110 },
            tableWidth: 85,
        });

        yPos = doc.lastAutoTable.finalY + 20;

        // Appointment Charts on Page 1
        doc.setFontSize(14);
        doc.setTextColor(155, 89, 182);
        doc.text('Appointments Analysis', margin, yPos);
        yPos += 10;

        const chartWidth = 85;
        const chartHeight = 55;

        if (appointmentMonthChartRef.current) {
            const chartImage = appointmentMonthChartRef.current.toBase64Image();
            doc.addImage(chartImage, 'PNG', margin, yPos, chartWidth, chartHeight);
        }

        if (appointmentStatusChartRef.current) {
            const chartImage = appointmentStatusChartRef.current.toBase64Image();
            doc.addImage(chartImage, 'PNG', 108, yPos, chartWidth, chartHeight);
        }

        // ========== PAGE 2: More Charts ==========
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text('Financial & Patient Analytics', pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;

        doc.setFontSize(14);
        doc.setTextColor(46, 204, 113);
        doc.text('Invoice Status', margin, yPos);
        doc.setTextColor(231, 76, 60);
        doc.text('Gender Distribution', 108, yPos);
        yPos += 10;

        if (invoiceStatusChartRef.current) {
            const chartImage = invoiceStatusChartRef.current.toBase64Image();
            doc.addImage(chartImage, 'PNG', margin, yPos, chartWidth, chartHeight);
        }

        if (genderChartRef.current) {
            const chartImage = genderChartRef.current.toBase64Image();
            doc.addImage(chartImage, 'PNG', 108, yPos, chartWidth, chartHeight);
        }

        yPos += chartHeight + 25;

        doc.setFontSize(14);
        doc.setTextColor(142, 68, 173);
        doc.text('Patient Age Distribution', margin, yPos);
        yPos += 10;

        if (ageChartRef.current) {
            const chartImage = ageChartRef.current.toBase64Image();
            doc.addImage(chartImage, 'PNG', margin, yPos, 180, 70);
        }

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by Heartology Hospital Information System', pageWidth / 2, pageHeight - 10, { align: 'center' });

        doc.save(`Heartology_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return <div className="reports-container"><p>Loading analytics...</p></div>;
    }

    if (error) {
        return <div className="reports-container"><p className="error">{error}</p></div>;
    }

    // Chart Data
    const appointmentStatusData = {
        labels: Object.keys(appointmentStats?.byStatus || {}),
        datasets: [{
            label: 'Appointments',
            data: Object.values(appointmentStats?.byStatus || {}),
            backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0'],
        }]
    };

    const appointmentMonthData = {
        labels: Object.keys(appointmentStats?.byMonth || {}).sort(),
        datasets: [{
            label: 'Appointments',
            data: Object.keys(appointmentStats?.byMonth || {}).sort().map(k => appointmentStats.byMonth[k]),
            backgroundColor: '#3498db',
        }]
    };

    const invoiceStatusData = {
        labels: ['Paid', 'Pending'],
        datasets: [{
            data: [financialStats?.paidCount || 0, financialStats?.pendingCount || 0],
            backgroundColor: ['#27ae60', '#e74c3c'],
        }]
    };

    const genderChartData = {
        labels: Object.keys(patientStats?.byGender || {}),
        datasets: [{
            data: Object.values(patientStats?.byGender || {}),
            backgroundColor: ['#3498db', '#e91e63', '#9b59b6'],
        }]
    };

    const ageData = {
        labels: Object.keys(patientStats?.byAgeGroup || {}),
        datasets: [{
            label: 'Patients',
            data: Object.values(patientStats?.byAgeGroup || {}),
            backgroundColor: '#8e44ad',
        }]
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'appointments', label: 'Appointments', icon: '📅' },
        { id: 'financial', label: 'Financial', icon: '💰' },
        { id: 'patients', label: 'Patients', icon: '👥' },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h1>Reports & Analytics</h1>
                <button className="download-btn" onClick={downloadPDF}>
                    📥 Download PDF Report
                </button>
            </div>

            {/* Hidden charts for PDF export */}
            <div style={{ position: 'absolute', left: '-9999px', width: '400px', height: '300px' }}>
                <Bar ref={appointmentMonthChartRef} data={appointmentMonthData} options={chartOptions} />
                <Pie ref={appointmentStatusChartRef} data={appointmentStatusData} options={chartOptions} />
                <Doughnut ref={invoiceStatusChartRef} data={invoiceStatusData} options={chartOptions} />
                <Doughnut ref={genderChartRef} data={genderChartData} options={chartOptions} />
                <Bar ref={ageChartRef} data={ageData} options={chartOptions} />
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-nav">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="tab-panel">
                        <div className="stats-cards">
                            <div className="stat-card">
                                <h3>Total Patients</h3>
                                <p className="stat-value">{systemStats?.totalPatients || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Doctors</h3>
                                <p className="stat-value">{systemStats?.totalDoctors || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Appointments</h3>
                                <p className="stat-value">{systemStats?.totalAppointments || 0}</p>
                            </div>
                            <div className="stat-card revenue">
                                <h3>Total Revenue</h3>
                                <p className="stat-value">{financialStats?.totalRevenue?.toLocaleString() || 0} EGP</p>
                            </div>
                            <div className="stat-card paid">
                                <h3>Paid Invoices</h3>
                                <p className="stat-value">{financialStats?.paidAmount?.toLocaleString() || 0} EGP</p>
                            </div>
                            <div className="stat-card pending">
                                <h3>Pending Invoices</h3>
                                <p className="stat-value">{financialStats?.pendingAmount?.toLocaleString() || 0} EGP</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="tab-panel">
                        <div className="charts-row">
                            <div className="chart-card">
                                <h3>Appointments by Month</h3>
                                <div className="chart-wrapper">
                                    <Bar data={appointmentMonthData} options={chartOptions} />
                                </div>
                            </div>
                            <div className="chart-card">
                                <h3>Appointments by Status</h3>
                                <div className="chart-wrapper">
                                    <Pie data={appointmentStatusData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="tab-panel">
                        <div className="stats-cards mini">
                            <div className="stat-card revenue">
                                <h3>Total Revenue</h3>
                                <p className="stat-value">{financialStats?.totalRevenue?.toLocaleString() || 0} EGP</p>
                            </div>
                            <div className="stat-card paid">
                                <h3>Paid ({financialStats?.paidCount || 0})</h3>
                                <p className="stat-value">{financialStats?.paidAmount?.toLocaleString() || 0} EGP</p>
                            </div>
                            <div className="stat-card pending">
                                <h3>Pending ({financialStats?.pendingCount || 0})</h3>
                                <p className="stat-value">{financialStats?.pendingAmount?.toLocaleString() || 0} EGP</p>
                            </div>
                        </div>
                        <div className="charts-row single">
                            <div className="chart-card">
                                <h3>Invoice Status Distribution</h3>
                                <div className="chart-wrapper">
                                    <Doughnut data={invoiceStatusData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="tab-panel">
                        <div className="charts-row">
                            <div className="chart-card">
                                <h3>Gender Distribution</h3>
                                <div className="chart-wrapper">
                                    <Doughnut data={genderChartData} options={chartOptions} />
                                </div>
                            </div>
                            <div className="chart-card">
                                <h3>Age Groups</h3>
                                <div className="chart-wrapper">
                                    <Bar data={ageData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
