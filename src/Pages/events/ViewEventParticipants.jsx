import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Image, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import { imgAddr } from '../../features/apiSlice';
import SearchField from '../../Components/SearchField';
import { 
  FaArrowLeft, FaUsers, FaEnvelope, FaPhone, FaCalendarAlt, 
  FaMapMarkerAlt, FaDownload, FaEye, FaCheckCircle, FaTimesCircle,
  FaClock, FaUser, FaIdCard
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import { useGetEventByIdMutation, useGetEventRegistrationsByEventIdMutation } from '../../features/apiSlice';
import Skeleton from 'react-loading-skeleton';

const ViewEventParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [getEventById] = useGetEventByIdMutation();
  const [getEventRegistrationsByEventId] = useGetEventRegistrationsByEventIdMutation();

  // Demo event data
  const demoEvents = {
    '1': {
      _id: '1',
      title: 'Financial Planning Webinar',
      description: 'Join our comprehensive webinar on personal financial planning strategies for 2024.',
      shortDescription: 'Learn essential financial planning strategies from industry experts',
      startDate: '2024-02-15T14:00:00Z',
      endDate: '2024-02-15T16:00:00Z',
      location: 'Virtual - Zoom Platform',
      venue: 'Online Meeting Room',
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/financial-planning-webinar.jpg',
      maxAttendees: 100,
      currentAttendees: 45
    },
    '2': {
      _id: '2',
      title: 'SAYV Financial Summit 2024',
      description: 'Annual financial summit bringing together industry leaders and investors.',
      shortDescription: 'Annual summit for financial professionals and investors',
      startDate: '2024-03-20T09:00:00Z',
      endDate: '2024-03-22T17:00:00Z',
      location: 'New York Convention Center, NY',
      venue: 'Grand Ballroom, 2nd Floor',
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/financial-summit-2024.jpg',
      maxAttendees: 500,
      currentAttendees: 287
    },
    '3': {
      _id: '3',
      title: 'Small Business Financial Workshop',
      description: 'Interactive workshop for small business owners to learn financial management.',
      shortDescription: 'Financial management workshop for small business owners',
      startDate: '2024-02-28T13:00:00Z',
      endDate: '2024-02-28T17:00:00Z',
      location: 'SAYV Financial Office & Online',
      venue: 'Conference Room A',
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/small-business-workshop.jpg',
      maxAttendees: 50,
      currentAttendees: 32
    }
  };

  // Demo participants data
  const demoParticipants = {
    '1': [
      {
        _id: 'p1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        company: 'ABC Financial Services',
        position: 'Financial Advisor',
        registrationDate: '2024-01-20T10:30:00Z',
        status: 'confirmed',
        willingToDonate: true,
        notes: 'Interested in retirement planning strategies'
      },
      {
        _id: 'p2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0456',
        company: 'Johnson Consulting',
        position: 'Business Owner',
        registrationDate: '2024-01-22T14:15:00Z',
        status: 'confirmed',
        willingToDonate: false,
        notes: 'Looking for investment guidance'
      },
      {
        _id: 'p3',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0789',
        company: 'TechStart Inc.',
        position: 'CEO',
        registrationDate: '2024-01-25T09:45:00Z',
        status: 'pending',
        willingToDonate: true,
        notes: 'First-time entrepreneur seeking financial advice'
      },
      {
        _id: 'p4',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1-555-0321',
        company: 'Creative Solutions LLC',
        position: 'Marketing Director',
        registrationDate: '2024-01-28T16:20:00Z',
        status: 'confirmed',
        willingToDonate: true,
        notes: 'Interested in personal finance planning'
      },
      {
        _id: 'p5',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '+1-555-0654',
        company: 'Wilson & Associates',
        position: 'Partner',
        registrationDate: '2024-02-01T11:10:00Z',
        status: 'cancelled',
        willingToDonate: false,
        notes: 'Schedule conflict - may attend future events'
      }
    ],
    '2': [
      {
        _id: 'p6',
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+1-555-1111',
        company: 'Global Investment Bank',
        position: 'Senior Analyst',
        registrationDate: '2024-02-05T08:30:00Z',
        status: 'confirmed',
        willingToDonate: true,
        notes: 'Interested in networking opportunities'
      },
      {
        _id: 'p7',
        firstName: 'Robert',
        lastName: 'Thompson',
        email: 'robert.thompson@email.com',
        phone: '+1-555-2222',
        company: 'Thompson Capital',
        position: 'Fund Manager',
        registrationDate: '2024-02-08T13:45:00Z',
        status: 'confirmed',
        willingToDonate: true,
        notes: 'Looking forward to keynote speakers'
      }
    ],
    '3': [
      {
        _id: 'p8',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jennifer.martinez@email.com',
        phone: '+1-555-3333',
        company: 'Martinez Bakery',
        position: 'Owner',
        registrationDate: '2024-02-10T15:20:00Z',
        status: 'confirmed',
        willingToDonate: false,
        notes: 'New business owner seeking cash flow guidance'
      },
      {
        _id: 'p9',
        firstName: 'Kevin',
        lastName: 'Brown',
        email: 'kevin.brown@email.com',
        phone: '+1-555-4444',
        company: 'Brown Construction',
        position: 'General Contractor',
        registrationDate: '2024-02-12T10:15:00Z',
        status: 'pending',
        willingToDonate: true,
        notes: 'Expanding business - needs financial planning'
      }
    ]
  };

  const fetchEventAndParticipants = async () => {
    setIsLoading(true);
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        const eventData = demoEvents[id];
        const participantsData = demoParticipants[id] || [];
        
        if (eventData) {
          setEvent(eventData);
          setParticipants(participantsData);
          setFilteredParticipants(participantsData);
        } else {
          toast.error('Event not found');
          navigate('/dash/events');
        }
        setIsLoading(false);
        return;
      }

      // Real API calls
      const eventResp = await getEventById(id).unwrap();
      // eventResp may be { event } or { data } or the event object itself
      const eventData = eventResp?.event || eventResp?.data || eventResp;

      const regsResp = await getEventRegistrationsByEventId(id).unwrap();
      // regsResp expected shape: { success: true, registrations: [...] }
      const participantsData = regsResp?.registrations || regsResp?.data || regsResp || [];

      if (!eventData) {
        toast.error('Event not found');
        navigate('/dash/events');
        setIsLoading(false);
        return;
      }

      setEvent(eventData);
      setParticipants(Array.isArray(participantsData) ? participantsData : []);
      setFilteredParticipants(Array.isArray(participantsData) ? participantsData : []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      getError(error);
      navigate('/dash/events');
    }
  };

  useEffect(() => {
    fetchEventAndParticipants();
  }, [id]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = participants.filter(participant =>
        participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [participants, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resolveImageUrl = (path) => {
    if (!path) return null;
    // If it's already a full URL, return as-is
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) return path;
    // If it's an object with url property
    if (typeof path === 'object' && path.url) {
      return resolveImageUrl(path.url);
    }
    // Otherwise prefix with imgAddr
    const cleanPath = typeof path === 'string' ? path.replace(/^\//, '') : '';
    return `${imgAddr}/${cleanPath}`;
  };

  const exportParticipants = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Registration Date', 'Status', 'Willing to Donate', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => [
        `"${p.firstName} ${p.lastName}"`,
        p.email,
        p.phone,
        `"${p.company}"`,
        `"${p.position}"`,
        formatDate(p.registrationDate),
        p.status,
        p.willingToDonate ? 'Yes' : 'No',
        `"${p.notes}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: participants.length,
    confirmed: participants.filter(p => p.status === 'confirmed').length,
    pending: participants.filter(p => p.status === 'pending').length,
    cancelled: participants.filter(p => p.status === 'cancelled').length,
    willingToDonate: participants.filter(p => p.willingToDonate).length
  };

  if (isLoading) {
    return (
      <MotionDiv>
        <Container fluid>
          <Skeleton height={40} className="mb-4" />
          <Row>
            {[1, 2, 3, 4].map(i => (
              <Col lg={3} key={i} className="mb-3">
                <Card>
                  <Card.Body>
                    <Skeleton height={80} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Card>
            <Card.Body>
              <Skeleton height={300} />
            </Card.Body>
          </Card>
        </Container>
      </MotionDiv>
    );
  }

  if (!event) {
    return (
      <MotionDiv>
        <Container fluid>
          <div className="text-center py-5">
            <h3>Event not found</h3>
            <Button variant="primary" onClick={() => navigate('/dash/events')}>
              Back to Events
            </Button>
          </div>
        </Container>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/events')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Events
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>Event</span>{' '}
              <span style={{ color: 'var(--dark-color)' }}>Participants</span>
            </h2>
          </div>
        </div>

        {/* Event Info Card */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Image
                  src={resolveImageUrl(event.featuredImage || event.image || event.images?.[0]) || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={event.title}
                  fluid
                  rounded
                  style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                />
              </Col>
              <Col md={9}>
                <h4>{event.title}</h4>
                <p className="text-muted mb-2">{event.shortDescription}</p>
                <Row>
                  <Col sm={6}>
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </Col>
                  {/* <Col sm={6}>
                    <div className="d-flex align-items-center mb-2">
                      <FaUsers className="me-2 text-primary" />
                      <span>{event.maxAttendees} Max Capacity</span>
                    </div>
                  </Col> */}
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col lg className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div 
                  className="rounded-circle p-3 me-3"
                  style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}
                >
                  <FaUsers size={24} />
                </div>
                <div>
                  <h3 className="mb-0" style={{ color: 'var(--dark-color)' }}>{stats.total}</h3>
                  <p className="text-muted mb-0 small">Total Registrations</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <SearchField
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Search participants..."
                />
              </Col>
              <Col md={6} className="text-end">
                <small className="text-muted">
                  {filteredParticipants.length} of {participants.length} participants
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Participants Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0 d-flex align-items-center">
              <FaUsers className="me-2" />
              Registered Participants
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No participants found</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                            style={{ width: '40px', height: '40px', fontSize: '16px' }}
                          >
                            {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                          </div>
                          <div>
                            <h6 className="mb-0">{participant.firstName}</h6>
                            <small className="text-muted">ID: {participant._id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <h6 className="mb-0">{participant.lastName}</h6>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="me-2 text-muted" size={12} />
                          <span>{participant.email}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </MotionDiv>
  );
};

export default ViewEventParticipants;