import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Image, Table } from 'react-bootstrap';
import { useGetEventsMutation, useDeleteEventMutation, useToggleEventStatusMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MotionDiv from '../../Components/MotionDiv';
import CustomTable from '../../Components/CustomTable';
import SearchField from '../../Components/SearchField';
import DeleteModal from '../../Components/DeleteModal';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaCalendarAlt, 
  FaClock, FaMapMarkerAlt, FaStar, FaUsers, FaImage, FaFilter, FaCalendarCheck,
  FaCalendarTimes, FaCalendarPlus, FaTicketAlt, FaDollarSign
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const Events = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getEvents, { isLoading: apiLoading }] = useGetEventsMutation();
  const [deleteEvent, { isLoading: deleteLoading }] = useDeleteEventMutation();
  const [toggleEventStatus, { isLoading: toggleLoading }] = useToggleEventStatusMutation();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    featured: 0
  });

  // Demo data for events
  const demoEvents = [
    {
      _id: '1',
      title: 'Financial Planning Webinar',
      description: 'Join our comprehensive webinar on personal financial planning strategies for 2024. Learn from industry experts about investment opportunities, retirement planning, and wealth management.',
      shortDescription: 'Learn essential financial planning strategies from industry experts',
      startDate: '2025-11-15T14:00:00Z',
      endDate: '2025-11-15T16:00:00Z',
      registrationDeadline: '2025-11-14T23:59:59Z',
      location: 'Virtual - Zoom Platform',
      venue: 'Online Meeting Room',
      images: [
        'https://creative-story.s3.amazonaws.com/events/financial-planning-webinar.jpg',
        'https://creative-story.s3.amazonaws.com/events/webinar-speakers.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/financial-planning-webinar.jpg',
      isActive: true,
      featured: true,
      status: 'upcoming',
      priority: 'high',
      maxAttendees: 100,
      currentAttendees: 45,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '2',
      title: 'SAYV Financial Summit 2024',
      description: 'Annual financial summit bringing together industry leaders, financial advisors, and investors. Network with professionals and discover the latest trends in financial services.',
      shortDescription: 'Annual summit for financial professionals and investors',
      startDate: '2025-12-20T09:00:00Z',
      endDate: '2025-12-22T17:00:00Z',
      registrationDeadline: '2025-12-15T23:59:59Z',
      location: 'New York Convention Center, NY',
      venue: 'Grand Ballroom, 2nd Floor',
      images: [
        'https://creative-story.s3.amazonaws.com/events/financial-summit-2024.jpg',
        'https://creative-story.s3.amazonaws.com/events/summit-venue.jpg',
        'https://creative-story.s3.amazonaws.com/events/networking-session.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/financial-summit-2024.jpg',
      isActive: true,
      featured: true,
      status: 'upcoming',
      priority: 'high',
      maxAttendees: 500,
      currentAttendees: 287,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z'
    },
    {
      _id: '3',
      title: 'Small Business Financial Workshop',
      description: 'Interactive workshop designed for small business owners to learn about business financial management, cash flow optimization, and growth funding strategies.',
      shortDescription: 'Financial management workshop for small business owners',
      startDate: '2025-11-28T13:00:00Z',
      endDate: '2025-11-28T17:00:00Z',
      registrationDeadline: '2025-11-26T23:59:59Z',
      location: 'SAYV Financial Office & Online',
      venue: 'Conference Room A',
      images: [
        'https://creative-story.s3.amazonaws.com/events/small-business-workshop.jpg',
        'https://creative-story.s3.amazonaws.com/events/workshop-materials.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/small-business-workshop.jpg',
      isActive: true,
      featured: false,
      status: 'upcoming',
      priority: 'medium',
      maxAttendees: 50,
      currentAttendees: 32,
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z'
    },
    {
      _id: '4',
      title: 'Retirement Planning Seminar',
      description: 'Comprehensive seminar covering retirement planning strategies, social security optimization, and healthcare considerations for retirees.',
      shortDescription: 'Complete guide to retirement planning and preparation',
      startDate: '2024-01-25T10:00:00Z',
      endDate: '2024-01-25T15:00:00Z',
      registrationDeadline: '2024-01-23T23:59:59Z',
      location: 'Community Center, Downtown',
      venue: 'Main Auditorium',
      images: [
        'https://creative-story.s3.amazonaws.com/events/retirement-seminar.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/retirement-seminar.jpg',
      isActive: false,
      featured: false,
      status: 'completed',
      priority: 'medium',
      maxAttendees: 75,
      currentAttendees: 68,
      createdAt: '2023-12-15T11:00:00Z',
      updatedAt: '2024-01-26T16:00:00Z'
    },
    {
      _id: '5',
      title: 'Youth Financial Literacy Camp',
      description: 'Fun and educational camp for teenagers to learn basic financial concepts, budgeting, saving, and responsible spending habits.',
      shortDescription: 'Financial education camp for teenagers',
      startDate: '2025-01-10T09:00:00Z',
      endDate: '2025-01-12T15:00:00Z',
      registrationDeadline: '2025-01-05T23:59:59Z',
      location: 'Youth Community Center',
      venue: 'Activity Hall',
      images: [
        'https://creative-story.s3.amazonaws.com/events/youth-financial-camp.jpg',
        'https://creative-story.s3.amazonaws.com/events/financial-games.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/youth-financial-camp.jpg',
      isActive: true,
      featured: false,
      status: 'cancelled',
      priority: 'low',
      maxAttendees: 30,
      currentAttendees: 12,
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-02-01T12:00:00Z'
    },
    {
      _id: '6',
      title: 'Investment Strategy Masterclass',
      description: 'Advanced masterclass for experienced investors looking to enhance their portfolio management skills and learn about emerging market opportunities.',
      shortDescription: 'Advanced investment strategies for experienced investors',
      startDate: '2025-12-05T10:00:00Z',
      endDate: '2025-12-05T16:00:00Z',
      registrationDeadline: '2025-12-03T23:59:59Z',
      location: 'Financial District Conference Center',
      venue: 'Executive Board Room',
      images: [
        'https://creative-story.s3.amazonaws.com/events/investment-masterclass.jpg'
      ],
      featuredImage: 'https://creative-story.s3.amazonaws.com/events/investment-masterclass.jpg',
      isActive: true,
      featured: true,
      status: 'upcoming',
      priority: 'high',
      maxAttendees: 25,
      currentAttendees: 18,
      createdAt: '2024-10-01T09:00:00Z',
      updatedAt: '2024-10-08T14:30:00Z'
    }
  ];

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Always use demo data for now (remove this condition later when API is ready)
      // if (token && token.startsWith("demo-token")) {
        setEvents(demoEvents);
        setFilteredEvents(demoEvents);
        calculateStats(demoEvents);
        setIsLoading(false);
        return;
      // }

      // Real API call for production (commented out for now)
      // const data = await getEvents().unwrap();
      // const eventsData = data?.events || [];
      // setEvents(eventsData);
      // setFilteredEvents(eventsData);
      // calculateStats(eventsData);
      // setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      getError(error);
    }
  };

  const calculateStats = (eventsData) => {
    const now = new Date();
    const stats = {
      total: eventsData.length,
      upcoming: eventsData.filter(event => new Date(event.startDate) > now && event.status !== 'cancelled').length,
      ongoing: eventsData.filter(event => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return start <= now && end >= now && event.status !== 'cancelled';
      }).length,
      completed: eventsData.filter(event => event.status === 'completed').length,
      cancelled: eventsData.filter(event => event.status === 'cancelled').length,
      featured: eventsData.filter(event => event.featured).length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'upcoming') {
        const now = new Date();
        filtered = filtered.filter(event => new Date(event.startDate) > now && event.status !== 'cancelled');
      } else if (statusFilter === 'ongoing') {
        const now = new Date();
        filtered = filtered.filter(event => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          return start <= now && end >= now && event.status !== 'cancelled';
        });
      } else {
        filtered = filtered.filter(event => event.status === statusFilter);
      }
    }

    // Filter by type
    // Type filter removed

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const handleToggleStatus = async (eventId, currentStatus) => {
    try {
      // Always use demo mode for now
      // if (token && token.startsWith("demo-token")) {
        const updatedEvents = events.map(event =>
          event._id === eventId ? { ...event, isActive: !currentStatus } : event
        );
        setEvents(updatedEvents);
        calculateStats(updatedEvents);
        toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        return;
      // }

      // Real API call (commented out for now)
      // await toggleEventStatus({ id: eventId, isActive: !currentStatus }).unwrap();
      // toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      // fetchEvents();
    } catch (error) {
      getError(error);
    }
  };

  const handleDelete = async () => {
    try {
      // Always use demo mode for now
      // if (token && token.startsWith("demo-token")) {
        const updatedEvents = events.filter(event => event._id !== selectedEvent._id);
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);
        calculateStats(updatedEvents);
        toast.success('Event deleted successfully');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        return;
      // }

      // Real API call (commented out for now)
      // await deleteEvent(selectedEvent._id).unwrap();
      // toast.success('Event deleted successfully');
      // setShowDeleteModal(false);
      // setSelectedEvent(null);
      // fetchEvents();
    } catch (error) {
      setShowDeleteModal(false);
      getError(error);
    }
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (event.status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (event.status === 'completed') {
      return <Badge bg="success">Completed</Badge>;
    } else if (start <= now && end >= now) {
      return <Badge bg="warning">Ongoing</Badge>;
    } else if (start > now) {
      return <Badge bg="info">Upcoming</Badge>;
    } else {
      return <Badge bg="secondary">Past</Badge>;
    }
  };

  const getEventTypeBadge = (type) => {
    const typeConfig = {
      'virtual': { bg: 'primary', text: 'Virtual' },
      'in-person': { bg: 'success', text: 'In-Person' },
      'hybrid': { bg: 'info', text: 'Hybrid' }
    };
    
    const config = typeConfig[type] || typeConfig['in-person'];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return (
        <div>
          <div>{start.toLocaleDateString()}</div>
          <small className="text-muted">
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </small>
        </div>
      );
    } else {
      return (
        <div>
          <div>{start.toLocaleDateString()} - {end.toLocaleDateString()}</div>
          <small className="text-muted">Multi-day event</small>
        </div>
      );
    }
  };

  const uniqueEventTypes = [...new Set(events.map(event => event.eventType))];

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div 
          className={`rounded-circle p-3 me-3`}
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
        <div>
          <h3 className="mb-0" style={{ color: 'var(--dark-color)' }}>
            {isLoading ? <Skeleton width={50} /> : value}
          </h3>
          <p className="text-muted mb-0 small">{title}</p>
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
              <span style={{ color: 'var(--dark-color)' }}>Event</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Management</span>
            </h2>
            <p className="text-muted">Manage events, workshops, and seminars</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/dash/events/add')}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            Add Event
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col lg className="mb-3">
            <StatCard
              title="Total Events"
              value={stats.total}
              icon={<FaCalendarAlt size={24} />}
              color="#6f42c1"
              bgColor="rgba(111, 66, 193, 0.1)"
            />
          </Col>
          <Col lg className="mb-3">
            <StatCard
              title="Upcoming Events"
              value={stats.upcoming}
              icon={<FaCalendarPlus size={24} />}
              color="#007bff"
              bgColor="rgba(0, 123, 255, 0.1)"
            />
          </Col>
          <Col lg className="mb-3">
            <StatCard
              title="Ongoing Events"
              value={stats.ongoing}
              icon={<FaCalendarCheck size={24} />}
              color="#ffc107"
              bgColor="rgba(255, 193, 7, 0.1)"
            />
          </Col>
          <Col lg className="mb-3">
            <StatCard
              title="Completed Events"
              value={stats.completed}
              icon={<FaCalendarCheck size={24} />}
              color="#28a745"
              bgColor="rgba(40, 167, 69, 0.1)"
            />
          </Col>
          <Col lg className="mb-3">
            <StatCard
              title="Featured Events"
              value={stats.featured}
              icon={<FaStar size={24} />}
              color="#fd7e14"
              bgColor="rgba(253, 126, 20, 0.1)"
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
                  placeholder="Search events..."
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Col>
              <Col md={3} className="text-end">
                <small className="text-muted">
                  {filteredEvents.length} of {events.length}
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Events Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0 d-flex align-items-center">
              <FaFilter className="me-2" />
              Events List
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {isLoading ? (
              <div className="text-center py-4">
                <div>Loading events...</div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No events found</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image
                            src={event.featuredImage}
                            alt={event.title}
                            width={60}
                            height={60}
                            className="rounded me-3"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-1">{event.title}</h6>
                            <small className="text-muted">{event.shortDescription}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <FaCalendarAlt className="text-primary mb-1" />
                          <div>{new Date(event.startDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <FaMapMarkerAlt className="me-1 text-muted" />
                            <small>{event.location}</small>
                          </div>
                          <div>
                            <small className="text-muted">{event.venue}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          {getStatusBadge(event)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowViewModal(true);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => navigate(`/dash/events/participants/${event._id}`)}
                            title="View Registrations"
                          >
                            <FaUsers />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(`/dash/events/edit/${event._id}`)}
                            title="Edit Event"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Event"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* View Event Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedEvent && (
              <Row>
                <Col md={5}>
                  <Image
                    src={selectedEvent.featuredImage}
                    alt={selectedEvent.title}
                    fluid
                    rounded
                    className="mb-3"
                  />
                  <div className="text-center mb-3">
                    {selectedEvent.isPaid ? (
                      <Badge bg="success" className="fs-6">
                        <FaDollarSign />
                        ${selectedEvent.price}
                      </Badge>
                    ) : (
                      <Badge bg="info" className="fs-6">
                        <FaTicketAlt className="me-1" />
                        Free Event
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    {getStatusBadge(selectedEvent)}
                    <div className="mt-2">
                      {getEventTypeBadge(selectedEvent.eventType)}
                    </div>
                    {selectedEvent.featured && (
                      <div className="mt-2">
                        <Badge bg="warning" className="text-dark">
                          <FaStar className="me-1" />
                          Featured Event
                        </Badge>
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={7}>
                  <h4>{selectedEvent.title}</h4>
                  <p className="text-muted mb-2">
                    <strong>Category:</strong> {selectedEvent.category}
                  </p>
                  <p className="text-muted mb-2">
                    <strong>Location:</strong> {selectedEvent.location}
                  </p>
                  <p className="text-muted mb-3">
                    <strong>Date:</strong> {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                  </p>
                  <p>{selectedEvent.shortDescription}</p>
                  
                  <div className="mb-3">
                    <strong>Attendees:</strong>
                    <div className="d-flex align-items-center">
                      <FaUsers className="me-2 text-success" />
                      <span>{selectedEvent.currentAttendees}/{selectedEvent.maxAttendees}</span>
                      <div className="progress ms-2 flex-grow-1" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${(selectedEvent.currentAttendees / selectedEvent.maxAttendees) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div>
                      <h6>Tags:</h6>
                      <div className="mb-3">
                        {selectedEvent.tags.map((tag, index) => (
                          <Badge key={index} bg="info" className="me-1 mb-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <small className="text-muted">
                    Registration Deadline: {new Date(selectedEvent.registrationDeadline).toLocaleDateString()}
                  </small>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                navigate(`/dash/events/edit/${selectedEvent._id}`);
              }}
            >
              <FaEdit className="me-1" />
              Edit Event
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          title="Delete Event"
          message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone and all registrations will be lost.`}
          isLoading={deleteLoading}
        />
      </Container>
    </MotionDiv>
  );
};

export default Events;