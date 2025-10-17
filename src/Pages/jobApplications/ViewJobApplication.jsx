import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Image, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetJobApplicationByIdMutation, useUpdateJobApplicationStatusMutation, useDeleteJobApplicationMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import DeleteModal from '../../Components/DeleteModal';
import { 
  FaArrowLeft, FaDownload, FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, 
  FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt,
  FaLinkedin, FaGlobe, FaClock, FaCheckCircle, FaTimes, FaStar, FaEye,
  FaFileAlt, FaQuoteLeft, FaTools, FaUserTie, FaSave
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const ViewJobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getJobApplicationById, { isLoading }] = useGetJobApplicationByIdMutation();
  const [updateJobApplicationStatus, { isLoading: updateLoading }] = useUpdateJobApplicationStatusMutation();
  const [deleteJobApplication, { isLoading: deleteLoading }] = useDeleteJobApplicationMutation();
  
  const [application, setApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const fetchJobApplication = async () => {
    if (!id) return;

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on id
        const demoData = {
          _id: id,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          position: 'Financial Analyst',
          department: 'Finance',
          experience: '3-5 years',
          education: 'MBA in Finance from Harvard Business School',
          location: 'New York, NY',
          salary: '$75,000 - $85,000',
          resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/john-smith-resume.pdf',
          resumeFileName: 'john-smith-resume.pdf',
          coverLetter: `Dear Hiring Manager,

I am excited to apply for the Financial Analyst position at SAYV Financial. With my strong background in financial analysis, MBA in Finance, and passion for helping clients achieve their financial goals, I am confident I would be a valuable addition to your team.

In my previous role at ABC Financial Services, I successfully:
• Conducted comprehensive financial analysis for over 100 client portfolios
• Developed automated reporting systems that reduced processing time by 40%
• Collaborated with senior analysts to identify investment opportunities
• Maintained client relationships and provided ongoing financial guidance

My expertise in financial modeling, combined with my proficiency in Excel, SQL, and Power BI, allows me to deliver accurate and insightful analysis. I am particularly drawn to SAYV Financial's commitment to personalized financial planning and would love to contribute to your mission of helping clients secure their financial futures.

I am available for an interview at your convenience and can start immediately. Thank you for considering my application.

Sincerely,
John Smith`,
          status: 'pending',
          priority: 'high',
          appliedDate: '2024-01-15T10:30:00Z',
          lastUpdated: '2024-01-15T10:30:00Z',
          skills: ['Financial Modeling', 'Excel', 'SQL', 'Power BI', 'Risk Analysis', 'Portfolio Management'],
          references: [
            { 
              name: 'Jane Doe', 
              position: 'Senior Financial Manager',
              company: 'ABC Financial Services', 
              phone: '+1 (555) 987-6543',
              email: 'jane.doe@abcfinancial.com',
              relationship: 'Direct Supervisor'
            },
            { 
              name: 'Robert Johnson', 
              position: 'Director of Finance',
              company: 'XYZ Investment Group', 
              phone: '+1 (555) 876-5432',
              email: 'robert.johnson@xyzinvest.com',
              relationship: 'Former Manager'
            }
          ],
          additionalInfo: {
            linkedIn: 'https://linkedin.com/in/johnsmith',
            portfolio: 'https://johnsmith-portfolio.com',
            availability: 'Immediate',
            relocation: 'Yes',
            expectedSalary: '$80,000',
            noticePeriod: 'Immediate',
            workAuthorization: 'US Citizen',
            travelWillingness: 'Up to 25%'
          },
          notes: 'Strong candidate with excellent educational background. Previous experience aligns well with our requirements.',
          interviewHistory: [
            {
              date: '2024-01-20T14:00:00Z',
              type: 'Phone Screen',
              interviewer: 'Sarah Wilson',
              notes: 'Great communication skills, technical knowledge is solid',
              rating: 4
            }
          ]
        };
        
        setApplication(demoData);
        setNewStatus(demoData.status);
        setNotes(demoData.notes);
        return;
      }

      // Real API call for production
      const data = await getJobApplicationById(id).unwrap();
      const appData = data?.application || {};
      setApplication(appData);
      setNewStatus(appData.status);
      setNotes(appData.notes || '');
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    fetchJobApplication();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedApp = { 
          ...application, 
          status: newStatus, 
          lastUpdated: new Date().toISOString(),
          notes: notes
        };
        setApplication(updatedApp);
        toast.success(`Application status updated to ${newStatus}`);
        return;
      }

      // Real API call
      await updateJobApplicationStatus({ 
        id: application._id, 
        status: newStatus,
        notes: notes 
      }).unwrap();
      toast.success(`Application status updated to ${newStatus}`);
      fetchJobApplication();
    } catch (error) {
      getError(error);
    }
  };

  const handleDownloadResume = () => {
    if (!application?.resumeUrl) return;
    
    const link = document.createElement('a');
    link.href = application.resumeUrl;
    link.download = application.resumeFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Resume download started');
  };

  const handleDelete = async () => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        toast.success('Job application deleted successfully');
        navigate('/dash/job-applications');
        return;
      }

      // Real API call
      await deleteJobApplication(application._id).unwrap();
      toast.success('Job application deleted successfully');
      navigate('/dash/job-applications');
    } catch (error) {
      getError(error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pending Review', icon: <FaClock /> },
      reviewed: { bg: 'info', text: 'Reviewed', icon: <FaEye /> },
      shortlisted: { bg: 'primary', text: 'Shortlisted', icon: <FaStar /> },
      rejected: { bg: 'danger', text: 'Rejected', icon: <FaTimes /> },
      hired: { bg: 'success', text: 'Hired', icon: <FaCheckCircle /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.bg} className="d-flex align-items-center fs-6">
        {config.icon}
        <span className="ms-1">{config.text}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: 'danger', text: 'High Priority' },
      medium: { bg: 'warning', text: 'Medium Priority' },
      low: { bg: 'secondary', text: 'Low Priority' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <MotionDiv>
        <Container fluid>
          <div className="mb-4">
            <Skeleton height={40} width={300} />
          </div>
          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Body>
                  <Skeleton height={200} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Body>
                  <Skeleton height={150} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </MotionDiv>
    );
  }

  if (!application) {
    return (
      <MotionDiv>
        <Container fluid>
          <Alert variant="danger">
            Job application not found or you don't have permission to view it.
          </Alert>
        </Container>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/job-applications')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Applications
            </Button>
            <div>
              <h2 className="mb-0">
                <span style={{ color: 'var(--dark-color)' }}>
                  {application.firstName} {application.lastName}
                </span>
              </h2>
              <p className="text-muted mb-0">Applied for {application.position}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="success"
              onClick={handleDownloadResume}
              className="d-flex align-items-center"
            >
              <FaDownload className="me-1" />
              Download Resume
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
              className="d-flex align-items-center"
            >
              <FaTrash className="me-1" />
              Delete
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={8}>
            {/* Personal Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaUser className="me-2" />
                  Personal Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Full Name:</strong>
                      <div>{application.firstName} {application.lastName}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Email:</strong>
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-muted" />
                        <a href={`mailto:${application.email}`}>{application.email}</a>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Phone:</strong>
                      <div className="d-flex align-items-center">
                        <FaPhone className="me-2 text-muted" />
                        <a href={`tel:${application.phone}`}>{application.phone}</a>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Location:</strong>
                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-muted" />
                        {application.location}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Expected Salary:</strong>
                      <div className="d-flex align-items-center">
                        <FaDollarSign className="me-2 text-muted" />
                        {application.salary}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Availability:</strong>
                      <div>{application.additionalInfo?.availability || 'Not specified'}</div>
                    </div>
                  </Col>
                </Row>

                {/* Social Links */}
                {(application.additionalInfo?.linkedIn || application.additionalInfo?.portfolio) && (
                  <div className="mt-3 pt-3 border-top">
                    <strong>Online Presence:</strong>
                    <div className="mt-2">
                      {application.additionalInfo?.linkedIn && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={application.additionalInfo.linkedIn}
                          target="_blank"
                          className="me-2 mb-2"
                        >
                          <FaLinkedin className="me-1" />
                          LinkedIn
                        </Button>
                      )}
                      {application.additionalInfo?.portfolio && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          href={application.additionalInfo.portfolio}
                          target="_blank"
                          className="me-2 mb-2"
                        >
                          <FaGlobe className="me-1" />
                          Portfolio
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Professional Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaBriefcase className="me-2" />
                  Professional Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Position Applied For:</strong>
                      <div>{application.position}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Department:</strong>
                      <div>{application.department}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Experience Level:</strong>
                      <div>{application.experience}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Education:</strong>
                      <div className="d-flex align-items-center">
                        <FaGraduationCap className="me-2 text-muted" />
                        {application.education}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Work Authorization:</strong>
                      <div>{application.additionalInfo?.workAuthorization || 'Not specified'}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Willing to Relocate:</strong>
                      <div>{application.additionalInfo?.relocation}</div>
                    </div>
                  </Col>
                </Row>

                {/* Skills */}
                {application.skills && application.skills.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <strong className="d-flex align-items-center mb-2">
                      <FaTools className="me-2" />
                      Skills & Expertise:
                    </strong>
                    <div className="d-flex flex-wrap gap-2">
                      {application.skills.map((skill, index) => (
                        <Badge key={index} bg="primary" className="fs-6">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Cover Letter */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaQuoteLeft className="me-2" />
                  Cover Letter
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {application.coverLetter}
                </div>
              </Card.Body>
            </Card>

            {/* References */}
            {application.references && application.references.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaUserTie className="me-2" />
                    References
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {application.references.map((ref, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card className="border-light">
                          <Card.Body>
                            <h6>{ref.name}</h6>
                            <p className="mb-1 text-muted">{ref.position}</p>
                            <p className="mb-1">{ref.company}</p>
                            <small className="text-muted">
                              <FaPhone className="me-1" />
                              {ref.phone}
                            </small>
                            {ref.email && (
                              <div>
                                <small className="text-muted">
                                  <FaEnvelope className="me-1" />
                                  {ref.email}
                                </small>
                              </div>
                            )}
                            {ref.relationship && (
                              <div>
                                <small><strong>Relationship:</strong> {ref.relationship}</small>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            {/* Status & Actions */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Application Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 text-center">
                  {getStatusBadge(application.status)}
                </div>
                <div className="mb-3 text-center">
                  {getPriorityBadge(application.priority)}
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Update Status</Form.Label>
                  <Form.Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={handleStatusUpdate}
                  disabled={updateLoading}
                >
                  <FaSave className="me-1" />
                  {updateLoading ? 'Updating...' : 'Update Status'}
                </Button>
              </Card.Body>
            </Card>

            {/* Application Details */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Application Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Applied Date:</strong>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-muted" />
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Last Updated:</strong>
                  <div>{new Date(application.lastUpdated).toLocaleDateString()}</div>
                </div>
                <div className="mb-3">
                  <strong>Resume File:</strong>
                  <div className="d-flex align-items-center">
                    <FaFileAlt className="me-2 text-muted" />
                    {application.resumeFileName}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Button
                  variant="outline-success"
                  className="w-100 mb-2"
                  onClick={handleDownloadResume}
                >
                  <FaDownload className="me-1" />
                  Download Resume
                </Button>
                <Button
                  variant="outline-info"
                  className="w-100 mb-2"
                  onClick={() => setShowResumeModal(true)}
                >
                  <FaEye className="me-1" />
                  Preview Resume
                </Button>
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2"
                  href={`mailto:${application.email}?subject=Regarding your application for ${application.position}`}
                >
                  <FaEnvelope className="me-1" />
                  Send Email
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Resume Preview Modal */}
        <Modal show={showResumeModal} onHide={() => setShowResumeModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Resume Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <iframe
                src={application.resumeUrl}
                width="100%"
                height="600px"
                title="Resume Preview"
                style={{ border: '1px solid #ddd' }}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleDownloadResume}>
              <FaDownload className="me-1" />
              Download Resume
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          title="Delete Job Application"
          message={`Are you sure you want to delete the application from "${application.firstName} ${application.lastName}"? This action cannot be undone.`}
          isLoading={deleteLoading}
        />
      </Container>
    </MotionDiv>
  );
};

export default ViewJobApplication;