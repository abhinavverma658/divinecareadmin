import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useGetEventRegistrationsMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import MotionDiv from '../../Components/MotionDiv';
import CustomTable from '../../Components/CustomTable';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const RecentActivity = () => {
  const [getEventRegistrations, { isLoading: eventLoading }] = useGetEventRegistrationsMutation();
  
  const { token } = useSelector(selectAuth);
  
  const [activities, setActivities] = useState({
    eventRegistrations: []
  });
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    recentEvents: 0
  });

  const fetchData = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data for recent activity
        const demoData = {
          eventRegistrations: [
            {
              _id: '1',
              name: 'Emma Davis',
              email: 'emma@example.com',
              phone: '+1234567892',
              eventName: 'Financial Planning Workshop',
              registrationDate: new Date().toISOString(),
              status: 'confirmed'
            },
            {
              _id: '2',
              name: 'Robert Taylor',
              email: 'robert@example.com',
              phone: '+1234567893',
              eventName: 'Investment Seminar',
              registrationDate: new Date(Date.now() - 86400000).toISOString(),
              status: 'pending'
            },
            {
              _id: '3',
              name: 'Lisa Anderson',
              email: 'lisa@example.com',
              phone: '+1234567894',
              eventName: 'Retirement Planning Webinar',
              registrationDate: new Date(Date.now() - 172800000).toISOString(),
              status: 'confirmed'
            }
          ]
        };
        
        setActivities(demoData);
        setStats({
          totalEvents: 25,
          recentEvents: demoData.eventRegistrations.length
        });
        return;
      }

      // Real API calls for production
      const [eventResponse] = await Promise.allSettled([
        getEventRegistrations().unwrap()
      ]);

      const eventData = eventResponse.status === 'fulfilled' ? eventResponse.value?.data || [] : [];

      setActivities({
        eventRegistrations: eventData.slice(0, 10) // Get recent 10
      });

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentEvents = eventData.filter(item => new Date(item.registrationDate || item.createdAt) > weekAgo).length;

      setStats({
        totalEvents: eventData.length,
        recentEvents
      });

    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { variant: 'primary', text: 'New' },
      responded: { variant: 'success', text: 'Responded' },
      under_review: { variant: 'warning', text: 'Under Review' },
      shortlisted: { variant: 'info', text: 'Shortlisted' },
      confirmed: { variant: 'success', text: 'Confirmed' },
      pending: { variant: 'warning', text: 'Pending' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const eventColumns = [
    {
      key: 'name',
      label: 'Participant',
      render: (item) => <strong>{item.name}</strong>
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => item.email
    },
    {
      key: 'eventName',
      label: 'Event',
      render: (item) => item.eventName
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      render: (item) => formatDate(item.registrationDate || item.createdAt)
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => getStatusBadge(item.status)
    }
  ];

  const isLoading = eventLoading;

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <span style={{ color: 'var(--dark-color)' }}>Event </span>{' '}
            <span style={{ color: 'var(--neutral-color)' }}>Registrations</span>
          </h2>
        </div>

        {/* Stats Card */}
        <Row className="mb-4">
          <Col lg={12} md={8} sm={12} className="mx-auto mb-3">
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                  <FaCalendarAlt size={30} style={{ color: 'var(--warning-color)' }} />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton count={2} />
                  ) : (
                    <>
                      <h4 className="mb-0">{stats.totalEvents}</h4>
                      <p className="text-muted mb-0">Event Registrations</p>
                      </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>



        {/* Recent Event Registrations */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2" style={{ color: 'var(--warning-color)' }} />
                  Recent Event Registrations
                </h5>
                <Badge bg="warning">{activities.eventRegistrations.length}</Badge>
              </Card.Header>
              <Card.Body>
                {isLoading ? (
                  <Skeleton count={5} height={40} />
                ) : activities.eventRegistrations.length > 0 ? (
                  <CustomTable 
                    data={activities.eventRegistrations}
                    columns={eventColumns}
                    // onView={(item) => console.log('View event registration:', item)}
                  />
                ) : (
                  <Alert variant="info">
                    <FaCalendarAlt className="me-2" />
                    No recent event registrations found.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default RecentActivity;