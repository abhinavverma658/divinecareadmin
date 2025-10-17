import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useGetHomePageDataMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import MotionDiv from '../../Components/MotionDiv';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaEye, FaImage, FaArrowRight, FaHome, FaCalendarAlt, FaQuoteLeft, FaImages, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';
import { color } from 'framer-motion';

const HomePage = () => {
  const [getHomePageData, { isLoading }] = useGetHomePageDataMutation();
  const { token } = useSelector(selectAuth);
  const navigate = useNavigate();
  
  const [homePageData, setHomePageData] = useState(null);

  const homePageSections = [
    {
      id: 'hero',
      title: 'Hero Section',
      description: 'Main banner with rotating images, title, heading, description and call-to-action button',
      icon: <FaImage size={24} />,
      color: 'primary',
      route: '/dash/homepage/hero'
    },
    {
      id: 'about',
      title: 'About Section',
      description: 'Company overview with key pointers, images',
      icon: <FaHome size={24} />,
      color: 'info',
      route: '/dash/homepage/about',
      comingSoon: false
    },
    {
      id: 'events',
      title: 'Events & Programs',
      description: 'Manage events and programs section',
      icon: <FaCalendarAlt size={24} />,
      color: 'success',
      route: '/dash/homepage/events',
      comingSoon: false
    },
    {
      id: 'testimonials',
      title: 'Testimonial Section',
      description: 'Manage customer testimonials and reviews',
      icon: <FaQuoteLeft size={24} />,
      color: 'warning',
      route: '/dash/homepage/testimonials',
      comingSoon: false
    },
    {
      id: 'gallery',
      title: 'Our Gallery',
      description: 'Manage photo gallery with images and descriptions',
      icon: <FaImages size={24} />,
      color: 'danger',
      route: '/dash/homepage/gallery',
      comingSoon: false
    },
    {
      id: 'teamMembers',
      title: 'Team Members',
      description: 'Manage team member profiles with pictures and designations',
      icon: <FaUsers size={24} />,
      color: 'dark',
      route: '/dash/homepage/team-members',
      comingSoon: false
    }
  ];

  const fetchHomePageData = async () => {
    try {
      // Check if demo mode or if we should use demo data as fallback
      if (token && (token.startsWith("demo-token") || token.startsWith("authenticated-"))) {
        // Set demo home page data
        const demoData = {
          hero: {
            bannerImages: [
              {
                id: 1,
                image: '/demo-images/hero-banner-1.jpg',
                title: 'Welcome to SAYV Financial',
                alt: 'Financial Planning Services'
              },
              {
                id: 2,
                image: '/demo-images/hero-banner-2.jpg',
                title: 'Your Financial Future Starts Here',
                alt: 'Investment Management'
              },
              {
                id: 3,
                image: '/demo-images/hero-banner-3.jpg',
                title: 'Expert Financial Guidance',
                alt: 'Financial Advisory Services'
              }
            ],
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          about: {
            isActive: false,
            lastUpdated: null
          },
          events: {
            backgroundImage: '/demo-images/events-bg.jpg',
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          testimonials: {
            // testimonials: [
            //   {
            //     id: 1,
            //     rating: 5,
            //     content: 'The support we received after the disaster was nothing short of life-changing. When everything we had was lost, the kindness and quick response from this organization.',
            //     name: 'Johnnie Lind',
            //     designation: 'Volunteer',
            //     profilePhoto: '/demo-images/testimonial-1.jpg'
            //   },
            //   {
            //     id: 2,
            //     rating: 5,
            //     content: 'My family and I were able to rebuild not only our home but also a sense of security and future. We are forever grateful to the volunteers & donors who made this possible.',
            //     name: 'Sharon McClure',
            //     designation: 'Volunteer',
            //     profilePhoto: '/demo-images/testimonial-2.jpg'
            //   }
            // ],
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          gallery: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          teamMembers: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          }
        };
        
        setHomePageData(demoData);
        return;
      }

      // Real API call for production
      try {
        const data = await getHomePageData().unwrap();
        setHomePageData(data?.homePageData || data?.data || {});
      } catch (apiError) {
        console.log('HomePage API not available, using demo data:', apiError);
        // If API fails, use demo data as fallback
        const demoData = {
          hero: {
            bannerImages: [
              {
                id: 1,
                image: '/demo-images/hero-banner-1.jpg',
                title: 'Welcome to DivineCare',
                alt: 'DivineCare Services'
              }
            ],
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          about: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          events: {
            backgroundImage: '/demo-images/events-bg.jpg',
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          testimonials: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          gallery: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          },
          teamMembers: {
            isActive: true,
            lastUpdated: new Date().toISOString()
          }
        };
        setHomePageData(demoData);
      }
    } catch (error) {
      console.error('HomePage component error:', error);
      // Set minimal demo data even on complete failure
      setHomePageData({
        hero: { isActive: true },
        about: { isActive: true },
        events: { isActive: true },
        testimonials: { isActive: true },
        gallery: { isActive: true },
        teamMembers: { isActive: true }
      });
    }
  };

  useEffect(() => {
    fetchHomePageData();
  }, [token]);



  const SectionCard = ({ section }) => {
    return (
      <Col lg={4} md={6} sm={12}>
        <Card className={`h-100 border border-black ${section.comingSoon ? 'opacity-75' : ''}`} style={{ borderRadius: '10px' }}>
          <Card.Body className="p-3">
            <div className="d-flex flex-column h-100">
              {/* Icon and Title */}
              <div className="d-flex align-items-start mb-3">
                <div 
                  className={`me-3 d-flex align-items-center justify-content-center`}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: section.color === 'primary' ? '#007bff20' :
                                    section.color === 'info' ? '#17a2b820' :
                                    section.color === 'success' ? '#28a74520' :
                                    section.color === 'warning' ? '#ffc10720' :
                                    section.color === 'danger' ? '#dc354520' :
                                    '#6c757d20'
                  }}
                >
                  <span style={{
                    color: section.color === 'primary' ? '#007bff' :
                           section.color === 'info' ? '#17a2b8' :
                           section.color === 'success' ? '#28a745' :
                           section.color === 'warning' ? '#ffc107' :
                           section.color === 'danger' ? '#dc3545' :
                           '#6c757d'
                  }}>
                    {section.icon}
                  </span>
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-2 fw-semibold" style={{ color: '#2c3e50', fontSize: '1.125rem' }}>
                    {section.title}
                  </h5>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted mb-4 flex-grow-1" style={{ 
                fontSize: '0.875rem', 
                lineHeight: '1.5',
                color: '#6c757d'
              }}>
                {section.description}
              </p>

              {/* Button */}
              <div className="mt-auto">
                <Button
                  variant={section.comingSoon ? "outline-secondary" : "outline-primary"}
                  className="w-100 d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    border: section.comingSoon ? '1px solid #6c757d' : '1px solid #007bff',
                    color: section.comingSoon ? '#6c757d' : '#007bff'
                  }}
                  onClick={() => !section.comingSoon && navigate(section.route)}
                  disabled={section.comingSoon}
                >
                  <FaEdit className="me-2" size={14} />
                  {section.comingSoon ? 'Coming Soon' : 'Edit Section'}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <MotionDiv>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
              Home Page Management
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              Manage your website's home page sections and content
            </p>
          </div>
        </div>

        {/* Section Overview */}
        <Row className="g-4 mb-5">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <Col key={index} lg={4} md={6} sm={12} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Skeleton height={150} />
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </>
          ) : (
            homePageSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))
          )}
        </Row>
        {/* Getting Started Guide */}
        {!isLoading && (!homePageData?.hero || !homePageData.hero.isActive) && (
          <Row className="mt-4">
            <Col>
              <Alert variant="info">
                <div className="d-flex align-items-center">
                  <FaArrowRight className="me-2" />
                  <div>
                    <h6 className="mb-1">Get Started with Your Home Page</h6>
                    <p className="mb-2">
                      Start by setting up your hero section with banner images, title, and call-to-action button.
                    </p>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate('/dash/homepage/hero')}
                    >
                      Setup Hero Section
                    </Button>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        )}
      </Container>
    </MotionDiv>
  );
};

export default HomePage;