import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, ProgressBar } from 'react-bootstrap';
import { useGetJobApplicationsMutation, useDeleteJobApplicationMutation, useUpdateJobApplicationStatusMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MotionDiv from '../../Components/MotionDiv';
import CustomTable from '../../Components/CustomTable';
import SearchField from '../../Components/SearchField';
import DeleteModal from '../../Components/DeleteModal';
import { 
  FaEye, FaTrash, FaDownload, FaUser, FaEnvelope, FaPhone, FaBriefcase, 
  FaCalendarAlt, FaFileAlt, FaCheckCircle, FaClock, FaTimes, FaStar,
  FaGraduationCap, FaMapMarkerAlt, FaFilter
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const JobApplications = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getJobApplications, { isLoading }] = useGetJobApplicationsMutation();
  const [deleteJobApplication, { isLoading: deleteLoading }] = useDeleteJobApplicationMutation();
  const [updateJobApplicationStatus, { isLoading: updateLoading }] = useUpdateJobApplicationStatusMutation();
  
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  });

  // Demo data for job applications
  const demoApplications = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      position: 'Financial Analyst',
      department: 'Finance',
      experience: '3-5 years',
      education: 'MBA in Finance',
      location: 'New York, NY',
      salary: '$75,000 - $85,000',
      resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/john-smith-resume.pdf',
      resumeFileName: 'john-smith-resume.pdf',
      coverLetter: 'I am excited to apply for the Financial Analyst position at SAYV Financial. With my strong background in financial analysis and passion for helping clients achieve their financial goals...',
      status: 'pending',
      priority: 'high',
      appliedDate: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-15T10:30:00Z',
      skills: ['Financial Modeling', 'Excel', 'SQL', 'Power BI'],
      references: [
        { name: 'Jane Doe', company: 'ABC Corp', phone: '+1 (555) 987-6543' }
      ],
      additionalInfo: {
        linkedIn: 'https://linkedin.com/in/johnsmith',
        portfolio: 'https://johnsmith-portfolio.com',
        availability: 'Immediate',
        relocation: 'Yes'
      }
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 234-5678',
      position: 'Investment Advisor',
      department: 'Investment',
      experience: '5-7 years',
      education: 'CFA, Bachelor in Economics',
      location: 'Chicago, IL',
      salary: '$95,000 - $110,000',
      resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/sarah-johnson-resume.pdf',
      resumeFileName: 'sarah-johnson-resume.pdf',
      coverLetter: 'As a seasoned investment professional with CFA certification, I am thrilled about the opportunity to join SAYV Financial as an Investment Advisor...',
      status: 'reviewed',
      priority: 'high',
      appliedDate: '2024-01-12T14:20:00Z',
      lastUpdated: '2024-01-14T09:15:00Z',
      skills: ['Portfolio Management', 'Risk Analysis', 'Client Relations', 'Market Research'],
      references: [
        { name: 'Michael Brown', company: 'Investment Firm LLC', phone: '+1 (555) 876-5432' },
        { name: 'Lisa Wilson', company: 'Financial Group Inc', phone: '+1 (555) 765-4321' }
      ],
      additionalInfo: {
        linkedIn: 'https://linkedin.com/in/sarahjohnson',
        portfolio: '',
        availability: '2 weeks notice',
        relocation: 'No'
      }
    },
    {
      _id: '3',
      firstName: 'Michael',
      lastName: 'Davis',
      email: 'michael.davis@email.com',
      phone: '+1 (555) 345-6789',
      position: 'Marketing Specialist',
      department: 'Marketing',
      experience: '2-3 years',
      education: 'Bachelor in Marketing',
      location: 'Los Angeles, CA',
      salary: '$55,000 - $65,000',
      resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/michael-davis-resume.pdf',
      resumeFileName: 'michael-davis-resume.pdf',
      coverLetter: 'I am writing to express my interest in the Marketing Specialist position. My creative approach to digital marketing and proven track record...',
      status: 'shortlisted',
      priority: 'medium',
      appliedDate: '2024-01-10T16:45:00Z',
      lastUpdated: '2024-01-13T11:30:00Z',
      skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics'],
      references: [
        { name: 'Amanda Taylor', company: 'Marketing Agency Pro', phone: '+1 (555) 654-3210' }
      ],
      additionalInfo: {
        linkedIn: 'https://linkedin.com/in/michaeldavis',
        portfolio: 'https://michaeldavis-marketing.com',
        availability: '1 month notice',
        relocation: 'Yes'
      }
    },
    {
      _id: '4',
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily.brown@email.com',
      phone: '+1 (555) 456-7890',
      position: 'Customer Service Representative',
      department: 'Customer Service',
      experience: '1-2 years',
      education: 'Bachelor in Business Administration',
      location: 'Miami, FL',
      salary: '$40,000 - $45,000',
      resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/emily-brown-resume.pdf',
      resumeFileName: 'emily-brown-resume.pdf',
      coverLetter: 'I am excited to apply for the Customer Service Representative position. My passion for helping people and strong communication skills...',
      status: 'rejected',
      priority: 'low',
      appliedDate: '2024-01-08T12:15:00Z',
      lastUpdated: '2024-01-12T15:20:00Z',
      skills: ['Customer Service', 'Communication', 'Problem Solving', 'CRM Software'],
      references: [
        { name: 'Robert Green', company: 'Service Solutions Inc', phone: '+1 (555) 543-2109' }
      ],
      additionalInfo: {
        linkedIn: 'https://linkedin.com/in/emilybrown',
        portfolio: '',
        availability: 'Immediate',
        relocation: 'No'
      }
    },
    {
      _id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 567-8901',
      position: 'Financial Analyst',
      department: 'Finance',
      experience: '4-6 years',
      education: 'Master in Finance',
      location: 'Boston, MA',
      salary: '$80,000 - $90,000',
      resumeUrl: 'https://creative-story.s3.amazonaws.com/resumes/david-wilson-resume.pdf',
      resumeFileName: 'david-wilson-resume.pdf',
      coverLetter: 'With my extensive background in financial analysis and my Master\'s degree in Finance, I am confident I would be a valuable addition to your team...',
      status: 'hired',
      priority: 'high',
      appliedDate: '2024-01-05T09:30:00Z',
      lastUpdated: '2024-01-11T14:45:00Z',
      skills: ['Financial Analysis', 'Forecasting', 'Excel', 'Python', 'Tableau'],
      references: [
        { name: 'Jennifer Lee', company: 'Financial Corp', phone: '+1 (555) 432-1098' },
        { name: 'Thomas Anderson', company: 'Investment Bank', phone: '+1 (555) 321-0987' }
      ],
      additionalInfo: {
        linkedIn: 'https://linkedin.com/in/davidwilson',
        portfolio: 'https://davidwilson-finance.com',
        availability: '3 weeks notice',
        relocation: 'Yes'
      }
    }
  ];

  const fetchJobApplications = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        setApplications(demoApplications);
        setFilteredApplications(demoApplications);
        calculateStats(demoApplications);
        return;
      }

      // Real API call for production
      const data = await getJobApplications().unwrap();
      const applicationsData = data?.applications || [];
      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
      calculateStats(applicationsData);
    } catch (error) {
      getError(error);
    }
  };

  const calculateStats = (applicationsData) => {
    const stats = {
      total: applicationsData.length,
      pending: applicationsData.filter(app => app.status === 'pending').length,
      reviewed: applicationsData.filter(app => app.status === 'reviewed').length,
      shortlisted: applicationsData.filter(app => app.status === 'shortlisted').length,
      rejected: applicationsData.filter(app => app.status === 'rejected').length,
      hired: applicationsData.filter(app => app.status === 'hired').length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchJobApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by position
    if (positionFilter !== 'all') {
      filtered = filtered.filter(app => app.position === positionFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, positionFilter]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedApplications = applications.map(app =>
          app._id === applicationId ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() } : app
        );
        setApplications(updatedApplications);
        calculateStats(updatedApplications);
        toast.success(`Application status updated to ${newStatus}`);
        return;
      }

      // Real API call
      await updateJobApplicationStatus({ id: applicationId, status: newStatus }).unwrap();
      toast.success(`Application status updated to ${newStatus}`);
      fetchJobApplications();
    } catch (error) {
      getError(error);
    }
  };

  const handleDownloadResume = (resumeUrl, fileName) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = fileName;
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
        const updatedApplications = applications.filter(app => app._id !== selectedApplication._id);
        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        calculateStats(updatedApplications);
        toast.success('Job application deleted successfully');
        setShowDeleteModal(false);
        setSelectedApplication(null);
        return;
      }

      // Real API call
      await deleteJobApplication(selectedApplication._id).unwrap();
      toast.success('Job application deleted successfully');
      setShowDeleteModal(false);
      setSelectedApplication(null);
      fetchJobApplications();
    } catch (error) {
      setShowDeleteModal(false);
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
      <Badge bg={config.bg} className="d-flex align-items-center">
        {config.icon}
        <span className="ms-1">{config.text}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: 'danger', text: 'High' },
      medium: { bg: 'warning', text: 'Medium' },
      low: { bg: 'secondary', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const uniquePositions = [...new Set(applications.map(app => app.position))];

  const columns = [
    {
      header: 'Applicant',
      render: (app) => (
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
               style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
            {app.firstName.charAt(0)}{app.lastName.charAt(0)}
          </div>
          <div>
            <h6 className="mb-1">{app.firstName} {app.lastName}</h6>
            <small className="text-muted d-flex align-items-center">
              <FaEnvelope className="me-1" />
              {app.email}
            </small>
            <small className="text-muted d-flex align-items-center">
              <FaPhone className="me-1" />
              {app.phone}
            </small>
          </div>
        </div>
      )
    },
    {
      header: 'Position & Location',
      render: (app) => (
        <div>
          <h6 className="mb-1 d-flex align-items-center">
            <FaBriefcase className="me-1 text-primary" />
            {app.position}
          </h6>
          <small className="text-muted d-flex align-items-center">
            <FaMapMarkerAlt className="me-1" />
            {app.location}
          </small>
          <Badge bg="light" className="text-dark mt-1">
            {app.department}
          </Badge>
        </div>
      )
    },
    {
      header: 'Experience & Education',
      render: (app) => (
        <div>
          <div className="mb-1">
            <strong>Experience:</strong> {app.experience}
          </div>
          <div className="d-flex align-items-center">
            <FaGraduationCap className="me-1 text-success" />
            <small>{app.education}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Status & Priority',
      render: (app) => (
        <div className="text-center">
          <div className="mb-2">
            {getStatusBadge(app.status)}
          </div>
          <div>
            {getPriorityBadge(app.priority)}
          </div>
        </div>
      )
    },
    {
      header: 'Applied Date',
      render: (app) => (
        <div className="text-center">
          <div className="d-flex align-items-center justify-content-center mb-1">
            <FaCalendarAlt className="me-1 text-muted" />
            <small>{new Date(app.appliedDate).toLocaleDateString()}</small>
          </div>
          <small className="text-muted">
            Updated: {new Date(app.lastUpdated).toLocaleDateString()}
          </small>
        </div>
      )
    },
    {
      header: 'Actions',
      render: (app) => (
        <div className="d-flex gap-1 justify-content-center">
          <Button
            size="sm"
            variant="outline-info"
            onClick={() => navigate(`/dash/job-applications/view/${app._id}`)}
            title="View Details"
          >
            <FaEye />
          </Button>
          <Button
            size="sm"
            variant="outline-success"
            onClick={() => handleDownloadResume(app.resumeUrl, app.resumeFileName)}
            title="Download Resume"
          >
            <FaDownload />
          </Button>
          <Form.Select
            size="sm"
            value={app.status}
            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
            disabled={updateLoading}
            style={{ width: '120px' }}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </Form.Select>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => {
              setSelectedApplication(app);
              setShowDeleteModal(true);
            }}
            title="Delete Application"
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ];

  const StatCard = ({ title, value, icon, color, bgColor, percentage }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div 
          className={`rounded-circle p-3 me-3`}
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
        <div className="flex-grow-1">
          <h3 className="mb-0" style={{ color: 'var(--dark-color)' }}>
            {isLoading ? <Skeleton width={50} /> : value}
          </h3>
          <p className="text-muted mb-1 small">{title}</p>
          {percentage !== undefined && (
            <ProgressBar 
              now={percentage} 
              style={{ height: '4px' }}
              variant={color === '#28a745' ? 'success' : color === '#dc3545' ? 'danger' : 'primary'}
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Job</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Applications</span>
            </h2>
            <p className="text-muted">Manage submitted job applications and resumes</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md className="mb-3">
            <StatCard
              title="Total Applications"
              value={stats.total}
              icon={<FaFileAlt size={24} />}
              color="#6f42c1"
              bgColor="rgba(111, 66, 193, 0.1)"
            />
          </Col>
          <Col md className="mb-3">
            <StatCard
              title="Pending Review"
              value={stats.pending}
              icon={<FaClock size={24} />}
              color="#ffc107"
              bgColor="rgba(255, 193, 7, 0.1)"
              percentage={stats.total ? (stats.pending / stats.total) * 100 : 0}
            />
          </Col>
          <Col md className="mb-3">
            <StatCard
              title="Shortlisted"
              value={stats.shortlisted}
              icon={<FaStar size={24} />}
              color="#007bff"
              bgColor="rgba(0, 123, 255, 0.1)"
              percentage={stats.total ? (stats.shortlisted / stats.total) * 100 : 0}
            />
          </Col>
          <Col md className="mb-3">
            <StatCard
              title="Hired"
              value={stats.hired}
              icon={<FaCheckCircle size={24} />}
              color="#28a745"
              bgColor="rgba(40, 167, 69, 0.1)"
              percentage={stats.total ? (stats.hired / stats.total) * 100 : 0}
            />
          </Col>
          <Col md className="mb-3">
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<FaTimes size={24} />}
              color="#dc3545"
              bgColor="rgba(220, 53, 69, 0.1)"
              percentage={stats.total ? (stats.rejected / stats.total) * 100 : 0}
            />
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={4}>
                <SearchField
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Search applications..."
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="all">All Positions</option>
                  {uniquePositions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2} className="text-end">
                <small className="text-muted">
                  {filteredApplications.length} of {applications.length}
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Applications Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0 d-flex align-items-center">
              <FaFilter className="me-2" />
              Job Applications
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <CustomTable
              data={filteredApplications}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No job applications found"
            />
          </Card.Body>
        </Card>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          title="Delete Job Application"
          message={`Are you sure you want to delete the application from "${selectedApplication?.firstName} ${selectedApplication?.lastName}"? This action cannot be undone.`}
          isLoading={deleteLoading}
        />
      </Container>
    </MotionDiv>
  );
};

export default JobApplications;