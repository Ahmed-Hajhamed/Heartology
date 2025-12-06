import React, { useState } from 'react';
import Card from '../../components/common/Card';
import FormField from '../../components/common/FormField';
import Table from '../../components/common/Table';

const Icd10Lookup = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock ICD-10 codes data
  const icd10Codes = [
    { code: 'I10', description: 'Essential (primary) hypertension', category: 'Diseases of the circulatory system' },
    { code: 'I11.0', description: 'Hypertensive heart disease with heart failure', category: 'Diseases of the circulatory system' },
    { code: 'I11.9', description: 'Hypertensive heart disease without heart failure', category: 'Diseases of the circulatory system' },
    { code: 'I20.0', description: 'Unstable angina', category: 'Diseases of the circulatory system' },
    { code: 'I20.1', description: 'Angina pectoris with documented spasm', category: 'Diseases of the circulatory system' },
    { code: 'I20.8', description: 'Other forms of angina pectoris', category: 'Diseases of the circulatory system' },
    { code: 'I20.9', description: 'Angina pectoris, unspecified', category: 'Diseases of the circulatory system' },
    { code: 'I21.0', description: 'ST elevation (STEMI) myocardial infarction of anterior wall', category: 'Diseases of the circulatory system' },
    { code: 'I21.1', description: 'ST elevation (STEMI) myocardial infarction of inferior wall', category: 'Diseases of the circulatory system' },
    { code: 'I21.2', description: 'ST elevation (STEMI) myocardial infarction of other sites', category: 'Diseases of the circulatory system' },
    { code: 'I21.3', description: 'ST elevation (STEMI) myocardial infarction of unspecified site', category: 'Diseases of the circulatory system' },
    { code: 'I21.4', description: 'Non-ST elevation (NSTEMI) myocardial infarction', category: 'Diseases of the circulatory system' },
    { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Diseases of the circulatory system' },
    { code: 'I48.0', description: 'Paroxysmal atrial fibrillation', category: 'Diseases of the circulatory system' },
    { code: 'I48.1', description: 'Persistent atrial fibrillation', category: 'Diseases of the circulatory system' },
    { code: 'I48.2', description: 'Chronic atrial fibrillation', category: 'Diseases of the circulatory system' },
    { code: 'I49.01', description: 'Ventricular fibrillation', category: 'Diseases of the circulatory system' },
    { code: 'I49.02', description: 'Ventricular flutter', category: 'Diseases of the circulatory system' },
    { code: 'I50.1', description: 'Left ventricular failure', category: 'Diseases of the circulatory system' },
    { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Diseases of the circulatory system' }
  ];

  const columns = [
    { 
      header: 'ICD-10 Code', 
      accessor: 'code',
      render: (row) => <span className="code-badge">{row.code}</span>
    },
    { header: 'Description', accessor: 'description' },
    { header: 'Category', accessor: 'category' }
  ];

  const filteredCodes = icd10Codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ICD-10 Code Lookup</h1>
        <p className="page-subtitle">Search and reference ICD-10 diagnostic codes</p>
      </div>

      <Card>
        <div className="search-section">
          <FormField
            type="text"
            placeholder="Search by code, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="search-results-count">
            {filteredCodes.length} code{filteredCodes.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <Table columns={columns} data={filteredCodes} />
      </Card>

      <Card title="Common Cardiology ICD-10 Categories">
        <div className="category-list">
          <div className="category-item">
            <h4>I10-I16: Hypertensive diseases</h4>
            <p>Essential hypertension, hypertensive heart disease, hypertensive kidney disease</p>
          </div>
          <div className="category-item">
            <h4>I20-I25: Ischemic heart diseases</h4>
            <p>Angina pectoris, myocardial infarction, atherosclerotic heart disease</p>
          </div>
          <div className="category-item">
            <h4>I30-I52: Other forms of heart disease</h4>
            <p>Pericarditis, myocarditis, cardiomyopathy, heart failure</p>
          </div>
          <div className="category-item">
            <h4>I44-I49: Conduction disorders and cardiac arrhythmias</h4>
            <p>Atrial fibrillation, ventricular fibrillation, heart blocks</p>
          </div>
          <div className="category-item">
            <h4>I60-I69: Cerebrovascular diseases</h4>
            <p>Stroke, cerebral infarction, intracranial hemorrhage</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Icd10Lookup;
