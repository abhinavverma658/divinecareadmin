import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import { useGetCorePagesMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import MotionDiv from '../../Components/MotionDiv';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaCog, FaUsers, FaEnvelope, FaEdit, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const WebsitePages = () => {
  const [getCorePages, { isLoading }] = useGetCorePagesMutation();
  const { token } = useSelector(selectAuth);
  const navigate = useNavigate();
  
  const [pages, setPages] = useState([]);
  const [activeTab, setActiveTab] = useState('main');

  const corePageTypes = {
    main: [
      {
        id: 'home',
        title: 'Home Page',
        description: 'Complete homepage with hero, about, gallery, CTA sections and all interactive elements',
        icon: <FaHome size={24} />,
        color: 'primary',
        sections: ['Hero Banner', 'About Us', 'About Features', 'Gallery', 'Multiple CTAs']
      },
      {
        id: 'about',
        title: 'About Us',
        description: 'Company information, mission, vision, and team details',
        icon: <FaInfoCircle size={24} />,
        color: 'info',
        sections: ['About Header', 'About Section', 'Key Points', 'Mission', 'Vision', 'Values', 'Leadership', 'Team', 'History']
      },
      {
        id: 'services',
        title: 'Services',
        description: 'Service offerings and detailed descriptions',
        icon: <FaCog size={24} />,
        color: 'success',
        sections: ['Services Header', 'Service Cards', 'Process Steps', 'Pricing']
      }
    ],
    secondary: [
      {
        id: 'contact',
        title: 'Contact Us',
        description: 'Contact information, form, and location details',
        icon: <FaEnvelope size={24} />,
        color: 'warning',
        sections: ['Contact Header', 'Contact Form', 'Office Locations', 'Map Integration']
      },
      {
        id: 'team',
        title: 'Our Team',
        description: 'Team member profiles and organizational structure',
        icon: <FaUsers size={24} />,
        color: 'secondary',
        sections: ['Team Header', 'Leadership', 'Team Members', 'Join Us']
      }
    ]
  };

  const fetchPages = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data for core pages
        const demoPages = [
          {
            _id: 'home',
            pageType: 'home',
            title: 'Home Page',
            sections: {
              hero: {
                title: 'Welcome to SAYV Financial',
                subtitle: 'Your trusted partner in financial planning',
                description: 'We help you achieve your financial goals with expert advice and personalized solutions.',
                primaryButtonText: 'Get Started Today',
                primaryButtonLink: '/contact',
                secondaryButtonText: 'Learn More',
                secondaryButtonLink: '/about',
                backgroundImage: '/hero-bg.jpg'
              },
              aboutUs: {
                title: 'About SAYV Financial',
                subtitle: 'Building Financial Futures Since 2008',
                description: 'We are a leading financial services company dedicated to helping individuals and businesses achieve their financial objectives.',
                buttonText: 'Read Our Story',
                buttonLink: '/about'
              },
              aboutFeatures: [
                {
                  title: 'Expert Financial Planning',
                  description: 'Professional guidance for your financial future',
                  icon: 'fas fa-chart-line',
                  color: '#007bff',
                  buttonText: 'Learn More',
                  buttonLink: '/services/planning'
                },
                {
                  title: 'Investment Management',
                  description: 'Tailored investment strategies for growth',
                  icon: 'fas fa-coins',
                  color: '#28a745',
                  buttonText: 'View Services',
                  buttonLink: '/services/investment'
                },
                {
                  title: '24/7 Support',
                  description: 'Round-the-clock assistance when you need it',
                  icon: 'fas fa-headset',
                  color: '#ffc107',
                  buttonText: 'Contact Support',
                  buttonLink: '/contact'
                }
              ],
              gallery: {
                title: 'Our Gallery',
                subtitle: 'Moments that Matter',
                description: 'Take a look at our office, team events, and client interactions.'
              },
              galleryImages: [
                {
                  image: '/gallery/office-1.jpg',
                  title: 'Modern Office Space',
                  description: 'Our state-of-the-art office',
                  category: 'office'
                },
                {
                  image: '/gallery/team-meeting.jpg',
                  title: 'Team Collaboration',
                  description: 'Expert team working together',
                  category: 'team'
                },
                {
                  image: '/gallery/client-consultation.jpg',
                  title: 'Client Consultation',
                  description: 'One-on-one financial planning',
                  category: 'client'
                }
              ],
              ctaSections: [
                {
                  title: 'Ready to Start Your Financial Journey?',
                  description: 'Contact us today for a free consultation.',
                  primaryButtonText: 'Schedule Consultation',
                  primaryButtonLink: '/contact',
                  secondaryButtonText: 'View Services',
                  secondaryButtonLink: '/services'
                },
                {
                  title: 'Download Our Financial Guide',
                  description: 'Get our comprehensive planning guide.',
                  primaryButtonText: 'Download Guide',
                  primaryButtonLink: '/downloads/guide.pdf'
                }
              ]
            },
            lastUpdated: new Date().toISOString(),
            isPublished: true
          },
          {
            _id: 'about',
            pageType: 'about',
            title: 'About Us',
            sections: {
              header: {
                title: 'About SAYV Financial',
                subtitle: 'Building Financial Futures Since 2008',
                description: 'We are a leading financial services company dedicated to helping individuals and businesses achieve their financial objectives through innovative solutions and expert guidance.'
              },
              aboutSection: {
                title: 'Who We Are',
                description: 'At SAYV Financial, we believe that everyone deserves access to professional financial guidance.',
                leftImage: '/images/about/office-exterior.jpg',
                rightImage: '/images/about/team-discussion.jpg',
                bottomLeftImage: '/images/about/client-meeting.jpg',
                bottomRightImage: '/images/about/technology-tools.jpg'
              },
              aboutPointers: [
                {
                  title: 'Personalized Financial Planning',
                  description: 'Tailored strategies designed specifically for your financial goals.',
                  icon: 'fas fa-user-check',
                  color: '#007bff'
                },
                {
                  title: 'Expert Investment Management',
                  description: 'Professional portfolio management with proven track record.',
                  icon: 'fas fa-chart-line',
                  color: '#28a745'
                },
                {
                  title: 'Ongoing Support & Guidance',
                  description: '24/7 access to our team of financial experts.',
                  icon: 'fas fa-headset',
                  color: '#dc3545'
                }
              ],
              mission: {
                title: 'Our Mission',
                description: 'To empower individuals and families to achieve financial independence through comprehensive planning, expert guidance, and innovative solutions.',
                image: '/images/about/mission-image.jpg',
                buttonText: 'Learn About Our Approach',
                buttonLink: '/services'
              },
              vision: {
                title: 'Our Vision',
                description: 'To be the most trusted financial partner, helping clients build lasting wealth and achieve their dreams.',
                image: '/images/about/vision-image.jpg',
                buttonText: 'Explore Our Services',
                buttonLink: '/services'
              },
              values: {
                title: 'Our Core Values',
                subtitle: 'The principles that guide everything we do',
                description: 'Our values are the foundation of every interaction and strategy we develop.'
              },
              valuesList: [
                {
                  title: 'Integrity',
                  description: 'We operate with the highest ethical standards.',
                  icon: 'fas fa-handshake',
                  color: '#007bff'
                },
                {
                  title: 'Excellence',
                  description: 'We strive for excellence in everything we do.',
                  icon: 'fas fa-star',
                  color: '#28a745'
                },
                {
                  title: 'Innovation',
                  description: 'We embrace new technologies and strategies.',
                  icon: 'fas fa-lightbulb',
                  color: '#ffc107'
                }
              ],
              leadership: {
                title: 'Our Leadership Team',
                subtitle: 'Meet the experts leading SAYV Financial',
                description: 'Our leadership team brings decades of combined experience.'
              },
              leadershipTeam: [
                {
                  name: 'John Smith',
                  position: 'CEO & Founder',
                  bio: 'With over 20 years in financial services...',
                  image: '/images/leadership/john-smith.jpg',
                  linkedin: 'https://linkedin.com/in/johnsmith-ceo',
                  email: 'john.smith@sayv.net'
                },
                {
                  name: 'Sarah Johnson',
                  position: 'Chief Investment Officer',
                  bio: 'Expert in portfolio management and investment strategies...',
                  image: '/images/leadership/sarah-johnson.jpg',
                  linkedin: 'https://linkedin.com/in/sarah-johnson-cio',
                  email: 'sarah.johnson@sayv.net'
                }
              ]
            },
            lastUpdated: new Date(Date.now() - 86400000).toISOString(),
            isPublished: true
          },
          {
            _id: 'services',
            pageType: 'services',
            title: 'Our Services',
            sections: {
              header: {
                title: 'Financial Services',
                subtitle: 'Comprehensive solutions for all your financial needs',
                description: 'From investment planning to retirement strategies, we offer a full range of financial services.'
              },
              services: [
                {
                  title: 'Wealth Management',
                  description: 'Comprehensive wealth management solutions for high-net-worth individuals.',
                  features: ['Portfolio Management', 'Tax Planning', 'Estate Planning'],
                  price: 'Custom Pricing',
                  icon: 'gem'
                },
                {
                  title: 'Retirement Planning',
                  description: 'Secure your future with our retirement planning services.',
                  features: ['401k Management', 'IRA Planning', 'Social Security Optimization'],
                  price: 'Starting at $199/month',
                  icon: 'piggy-bank'
                },
                {
                  title: 'Investment Advisory',
                  description: 'Professional investment advice tailored to your goals.',
                  features: ['Market Analysis', 'Risk Assessment', 'Portfolio Rebalancing'],
                  price: 'Starting at $149/month',
                  icon: 'chart-line'
                }
              ]
            },
            lastUpdated: new Date(Date.now() - 172800000).toISOString(),
            isPublished: true
          }
        ];
        
        setPages(demoPages);
        return;
      }

      // Real API call for production
      const data = await getCorePages().unwrap();
      setPages(data?.pages || []);
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const getPageData = (pageId) => {
    return pages.find(page => page.pageType === pageId || page._id === pageId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PageCard = ({ pageConfig, pageData }) => (
    <Col lg={6} md={6} sm={12} className="mb-4">
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <div className={`me-3 p-2 rounded bg-${pageConfig.color} text-white`}>
              {pageConfig.icon}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0">{pageConfig.title}</h5>
              <small className="text-muted">{pageConfig.description}</small>
            </div>
            <Badge bg={pageData?.isPublished ? 'success' : 'warning'}>
              {pageData?.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          
          <div className="mb-3">
            <h6 className="mb-2">Content Sections:</h6>
            <div className="d-flex flex-wrap gap-1">
              {pageConfig.sections.map((section, index) => (
                <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                  {section}
                </Badge>
              ))}
            </div>
          </div>

          {pageData && (
            <div className="mb-3">
              <small className="text-muted">
                Last updated: {formatDate(pageData.lastUpdated)}
              </small>
            </div>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/dash/website-pages/edit/${pageConfig.id}`)}
              className="flex-grow-1"
            >
              <FaEdit className="me-1" />
              Edit Content
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.open(`/pages/${pageConfig.id}`, '_blank')}
            >
              <FaEye />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Website</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Pages</span>
            </h2>
            <p className="text-muted mb-0">
              Manage core website pages and their content sections
            </p>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="main" title="Main Pages">
            <Row>
              {isLoading ? (
                <>
                  <Col lg={6} md={6} sm={12} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Skeleton height={150} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={6} md={6} sm={12} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Skeleton height={150} />
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              ) : (
                corePageTypes.main.map((pageConfig) => (
                  <PageCard
                    key={pageConfig.id}
                    pageConfig={pageConfig}
                    pageData={getPageData(pageConfig.id)}
                  />
                ))
              )}
            </Row>
          </Tab>

          <Tab eventKey="secondary" title="Secondary Pages">
            <Row>
              {isLoading ? (
                <>
                  <Col lg={6} md={6} sm={12} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Skeleton height={150} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={6} md={6} sm={12} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Skeleton height={150} />
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              ) : (
                corePageTypes.secondary.map((pageConfig) => (
                  <PageCard
                    key={pageConfig.id}
                    pageConfig={pageConfig}
                    pageData={getPageData(pageConfig.id)}
                  />
                ))
              )}
            </Row>
          </Tab>
        </Tabs>

        {/* Quick Stats */}
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <h6>Quick Stats</h6>
                <Row className="text-center">
                  <Col>
                    <div className="h4 mb-0 text-primary">
                      {isLoading ? <Skeleton width={40} /> : pages.filter(p => p.isPublished).length}
                    </div>
                    <small className="text-muted">Published Pages</small>
                  </Col>
                  <Col>
                    <div className="h4 mb-0 text-warning">
                      {isLoading ? <Skeleton width={40} /> : pages.filter(p => !p.isPublished).length}
                    </div>
                    <small className="text-muted">Draft Pages</small>
                  </Col>
                  <Col>
                    <div className="h4 mb-0 text-success">
                      {isLoading ? <Skeleton width={40} /> : pages.length}
                    </div>
                    <small className="text-muted">Total Pages</small>
                  </Col>
                  <Col>
                    <div className="h4 mb-0 text-info">
                      {isLoading ? <Skeleton width={40} /> : 
                        pages.filter(p => {
                          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          return new Date(p.lastUpdated) > weekAgo;
                        }).length
                      }
                    </div>
                    <small className="text-muted">Updated This Week</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default WebsitePages;