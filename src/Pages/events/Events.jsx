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


// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';
 


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

  const fetchEvents = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Events Data fetch...');
      
      const response = await getEvents().unwrap();
      console.log('📥 Events Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      console.log('📋 Response type:', typeof response);
      
      // Check multiple possible response structures
      let eventsData = null;
      
      console.log('🔍 Analyzing events response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      console.log('🔑 Response keys:', response ? Object.keys(response) : 'No keys');
      
      if (response?.success && response?.events) {
        eventsData = response.events;
        console.log('✅ Using response.events structure (success + events)');
      } else if (response?.events) {
        eventsData = response.events;
        console.log('✅ Using response.events structure (no success flag)');
      } else if (response?.success && response?.data) {
        eventsData = response.data;
        console.log('✅ Using response.data structure (with success flag)');
      } else if (response?.data && !response?.success) {
        eventsData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (Array.isArray(response)) {
        eventsData = response;
        console.log('✅ Using response directly as array');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        eventsData = response;
        console.log('✅ Using response directly as data');
      }
      
      console.log('📝 Extracted events data:', eventsData);
      console.log('🔑 Events data type:', Array.isArray(eventsData) ? 'Array' : typeof eventsData);
      console.log('📊 Events count:', Array.isArray(eventsData) ? eventsData.length : 'Not an array');
      
      if (Array.isArray(eventsData) && eventsData.length >= 0) {
        console.log('🎯 Setting events data:', eventsData);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        calculateStats(eventsData);
        
        if (eventsData.length === 0) {
          toast.info('No events found. Create your first event!');
        } else {
          toast.success(`${eventsData.length} events loaded successfully`);
        }
      } else {
        console.log('⚠️ No events data found or invalid format');
        console.log('📊 Full events response debug:', JSON.stringify(response, null, 2));
        setEvents([]);
        setFilteredEvents([]);
        calculateStats([]);
        toast.info('No events found.');
      }
    } catch (error) {
      console.error('❌ Error fetching events data:', error);
      console.log('📊 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load events. Please try again.');
      setEvents([]);
      setFilteredEvents([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
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
      completed: eventsData.filter(event => {
        const end = new Date(event.endDate);
        return (end < now && event.status !== 'cancelled') || event.status === 'completed';
      }).length,
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
        (event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.shortDescription && event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const now = new Date();
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.startDate) > now && event.status !== 'cancelled');
      } else if (statusFilter === 'ongoing') {
        filtered = filtered.filter(event => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          return start <= now && end >= now && event.status !== 'cancelled';
        });
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(event => {
          const end = new Date(event.endDate);
          return (end < now && event.status !== 'cancelled') || event.status === 'completed';
        });
      } else if (statusFilter === 'cancelled') {
        filtered = filtered.filter(event => event.status === 'cancelled');
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const handleToggleStatus = async (eventId, currentStatus) => {
    try {
      console.log('🔄 Toggling event status:', eventId, 'to:', !currentStatus);
      
      const response = await toggleEventStatus({ id: eventId, isActive: !currentStatus }).unwrap();
      console.log('✅ Toggle Response:', response);
      
      toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('❌ Error toggling event status:', error);
      toast.error(error?.data?.message || 'Failed to update event status');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      console.log('🗑️ Deleting event:', selectedEvent._id);
      
      const response = await deleteEvent(selectedEvent._id).unwrap();
      console.log('✅ Delete Response:', response);
      
      toast.success(response?.message || 'Event deleted successfully');
      
      // Refresh events list
      fetchEvents();
      
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      toast.error(error?.data?.message || 'Failed to delete event');
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (event.status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (end < now) {
      return <Badge bg="success">Completed</Badge>;
    } else if (start <= now && end >= now) {
      return <Badge bg="warning">Ongoing</Badge>;
    } else if (start > now) {
      return <Badge bg="info">Upcoming</Badge>;
    } else {
      return <Badge bg="secondary">Past</Badge>;
    }
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

    const getImageUrl = (val) =>
    !val ? '' : (() => {
      const str = String(val).trim();
      if (/^https?:\/\//i.test(str)) return str;
      const clean = str.replace(/^\/+/, '');
      return `${BASE_URL.replace(/\/$/, '')}/${encodeURI(clean)}`;
    })();

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Event</span>{' '}
              <span style={{ color: 'var(--dark-color)' }}>Management</span>
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
                  query={searchTerm}
                  setQuery={setSearchTerm}
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
                            src={getImageUrl(event.featuredImage || event.image || event.images?.[0])}
                            alt={event.title}
                            width={60}
                            height={60}
                            className="rounded me-3"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                            }}
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
                            <small className="text-muted">{event.venueDetails || event.venue || 'Venue details not specified'}</small>
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
                    src={getImageUrl(selectedEvent.featuredImage || selectedEvent.image || selectedEvent.images?.[0])}
                    alt={selectedEvent.title}
                    fluid
                    rounded
                    className="mb-3"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
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
                    <strong>Location:</strong> {selectedEvent.location}
                  </p>
                  {selectedEvent.venueDetails && (
                    <p className="text-muted mb-2">
                      <strong>Venue:</strong> {selectedEvent.venueDetails}
                    </p>
                  )}
                  <p className="text-muted mb-3">
                    <strong>Date:</strong> {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
                  </p>
                  
                  {selectedEvent.shortDescription && (
                    <div className="mb-3">
                      <h6>Short Description:</h6>
                      <p>{selectedEvent.shortDescription}</p>
                    </div>
                  )}
                  
                  {selectedEvent.description && (
                    <div className="mb-3">
                      <h6>Detailed Description:</h6>
                      <div 
                        className="event-description"
                        dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                        style={{ 
                          maxHeight: '300px', 
                          overflowY: 'auto',
                          padding: '10px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          backgroundColor: '#f9f9f9'
                        }}
                      />
                    </div>
                  )}
                  
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
          onDiscard={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Event"
          description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone and all registrations will be lost.`}
          loading={deleteLoading}
          buttonCancelTxt="Cancel"
          buttonConfirmTxt="Delete"
        />
      </Container>
    </MotionDiv>
  );
};

export default Events;