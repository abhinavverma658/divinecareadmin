import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaInfoCircle, FaImages, FaUsers, FaHistory, FaChartBar, FaQuoteLeft } from 'react-icons/fa';

const AboutUsPage = () => {
    const sections = [
//    {
//       title: 'About Us Banner',
//       description: 'Replace the banner image that appears at the top of the About Us page',
//       icon: <FaImages className="text-warning" size={24} />,
//       path: '/dash/about-us/banner',
//       color: 'warning'
//     },
    {
      title: 'Main About Section',
      description: 'Edit the main about us section with heading, description, images and key points',
      icon: <FaInfoCircle className="text-primary" size={24} />,
      path: '/dash/about-us/main-section',
      color: 'primary'
    },
    {
      title: 'Our Mission',
      description: 'Manage mission heading, description, image and mission points',
      icon: <FaHistory className="text-success" size={24} />,
      path: '/dash/about-us/our-mission',
      color: 'success'
    },
    {
      title: 'Our Mission & Vision',
      description: 'Edit mission & vision section with tabs, image and detailed content',
      icon: <FaUsers className="text-info" size={24} />,
      path: '/dash/about-us/mission-vision',
      color: 'info'
    },
    {
      title: 'Company Statistics',
      description: 'Manage statistics heading, description, CTA button and 4 key statistics',
      icon: <FaChartBar className="text-warning" size={24} />,
      path: '/dash/about-us/statistics',
      color: 'warning'
    },
    {
      title: 'Testimonial Section',
      description: 'Edit testimonial with profile, star rating, and content alongside section details',
      icon: <FaQuoteLeft className="text-danger" size={24} />,
      path: '/dash/about-us/testimonial',
      color: 'danger'
    },
   
    // Future sections can be added here
    // {
    //   title: 'Company History',
    //   description: 'Edit company timeline and milestones',
    //   icon: <FaHistory className="text-info" size={24} />,
    //   path: '/dash/about-us/history',
    //   color: 'info'
    // },
    // {
    //   title: 'Our Values',
    //   description: 'Manage company values and principles',
    //   icon: <FaUsers className="text-warning" size={24} />,
    //   path: '/dash/about-us/values',
    //   color: 'warning'
    // }
  ];

  return (
    <Container fluid className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">About Us Management</h2>
          <p className="text-muted mb-0">Manage different sections of the About Us page</p>
        </div>
      </div>

      <Row>
        {sections.map((section, index) => (
          <Col xl={4} lg={6} md={6} sm={12} key={index} className="mb-4">
            <Card className="h-100 border border-black">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div className={`p-3 rounded-circle bg-${section.color}-subtle me-3`}>
                    {section.icon}
                  </div>
                  <div>
                    <h5 className="mb-1">{section.title}</h5>
                  </div>
                </div>
                
                <p className="text-muted flex-grow-1 mb-3">
                  {section.description}
                </p>
                
                <Link to={section.path} className="text-decoration-none">
                  <Button 
                    variant={`outline-${section.color}`} 
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <FaEdit className="me-2" />
                    Edit Section
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Stats */}
      {/* <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">
                <FaInfoCircle className="text-primary me-2" />
                About Us Overview
              </h5>
              <Row>
                <Col md={3} sm={6} className="text-center mb-3">
                  <div className="border-end border-light">
                    <h4 className="text-primary mb-1">5</h4>
                    <small className="text-muted">Active Sections</small>
                  </div>
                </Col>
                <Col md={3} sm={6} className="text-center mb-3">
                  <div className="border-end border-light">
                    <h4 className="text-success mb-1">16</h4>
                    <small className="text-muted">Key Points</small>
                  </div>
                </Col>
                <Col md={3} sm={6} className="text-center mb-3">
                  <div className="border-end border-light">
                    <h4 className="text-info mb-1">7</h4>
                    <small className="text-muted">Images</small>
                  </div>
                </Col>
                <Col md={3} sm={6} className="text-center mb-3">
                  <h4 className="text-warning mb-1">5</h4>
                  <small className="text-muted">Editable Forms</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
};

export default AboutUsPage;