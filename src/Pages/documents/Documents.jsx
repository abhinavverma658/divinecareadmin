import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import MotionDiv from '../../Components/MotionDiv';
import { FaUpload, FaFileContract, FaUserTie, FaCalendarAlt, FaChartLine, FaBook, FaBriefcase, FaExclamationTriangle, FaClock, FaGraduationCap, FaUniversity, FaIdCard, FaCalculator, FaHandshake } from 'react-icons/fa';
import ImageUpload from '../../Components/ImageUpload';


const documentFields = [
  { key: 'policies-procedures', label: 'Policies/Procedures and Benefits', icon: FaFileContract },
  { key: 'employee-records', label: 'Employee Records', icon: FaUserTie },
  { key: 'schedules', label: 'Workers Schedules', icon: FaCalendarAlt },
  { key: 'performance-reviews', label: 'Performance Review', icon: FaChartLine },
  { key: 'handbooks', label: 'Signed Employee Handbook/Acknowledgement', icon: FaBook },
  { key: 'job-descriptions', label: 'Job Descriptions', icon: FaBriefcase },
  { key: 'disciplinary-actions', label: 'Disciplinary Actions Report', icon: FaExclamationTriangle },
  { key: 'attendance-records', label: 'Attendance Records', icon: FaClock },
  { key: 'training-records', label: 'Training Records', icon: FaGraduationCap },
  { key: 'direct-deposit', label: 'Direct Deposit Form', icon: FaUniversity },
  { key: 'form-i9', label: 'Form I-9 (US Employment Eligibility)', icon: FaIdCard },
  { key: 'w4-forms', label: 'W-4 Forms (Federal Tax Withholding)', icon: FaCalculator },
  { key: 'employment-contracts', label: 'Employment Contract/Agreement', icon: FaHandshake }
];

const Documents = () => {
  const [uploadedDocs, setUploadedDocs] = useState({});

  const handleUpload = (key, url) => {
    setUploadedDocs(prev => ({ ...prev, [key]: url }));
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="mb-4">
          <h2 style={{ color: 'var(--dark-color)' }}>Document Management</h2>
          <p className="text-muted">Upload company documents, policies, and employee records</p>
        </div>
        <Row>
          {documentFields.map(field => (
            <Col md={6} lg={4} key={field.key} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex align-items-center">
                    {React.createElement(field.icon, { className: 'me-2 text-primary', size: 20 })}
                    <strong>{field.label}</strong>
                  </div>
                </Card.Header>
                <Card.Body>
                  <ImageUpload
                    value={uploadedDocs[field.key] || ''}
                    onChange={val => handleUpload(field.key, val)}
                    label={`Upload ${field.label}`}
                    acceptedTypes={[
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    ]}
                    maxSize={10}
                  />
                  {uploadedDocs[field.key] && (
                    <Alert variant="success" className="mt-3">
                      <div className="d-flex align-items-center">
                        <FaUpload className="me-2" />
                        <a href={uploadedDocs[field.key]} target="_blank" rel="noopener noreferrer">
                          View Uploaded Document
                        </a>
                      </div>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default Documents;