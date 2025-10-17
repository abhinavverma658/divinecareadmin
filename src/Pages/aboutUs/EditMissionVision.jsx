import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner, Nav, Tab } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditMissionVision = () => {
  const [formData, setFormData] = useState({
    mvHeading: '',
    mvDescription: '',
    mvImage: '',
    ourMissionTab: {
      title: '',
      content: ''
    },
    ourVisionTab: {
      title: '',
      content: ''
    },
    charityHistoryTab: {
      title: '',
      content: ''
    }
  });
  
  const [activeTab, setActiveTab] = useState('mission');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using existing About Us endpoints
  const [getAboutUsData] = useGetAboutUsDataMutation();
  const [updateAboutUsData] = useUpdateAboutUsDataMutation();

  // Demo data for testing
  const demoData = {
    mvHeading: 'Our Purpose: Mission and Vision for a Better',
    mvDescription: 'Our mission to bring hope, resources, & opportunities communities in need, empowering individuals to build brighter, sustainable futures we are committed to tackling critical challenges.',
    mvImage: 'https://creative-story.s3.amazonaws.com/about/mission-vision-image.jpg',
    ourMissionTab: {
      title: 'Our Mission',
      content: 'Our vision is a world where everyone has the opportunity to thrive, with access the resources and support necessary for lasting change guided by compassion, integrity.'
    },
    ourVisionTab: {
      title: 'Our Vision',
      content: 'Our vision is a world where everyone has the opportunity to thrive, with access the resources and support necessary for lasting change guided by compassion, integrity.'
    },
    charityHistoryTab: {
      title: 'Charity History',
      content: 'Guided by compassion, integrity, and community, we work tirelessly to make this vision a reality. Together, with our supporters, partners, and volunteers, we are creating lasting impact in communities worldwide.'
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
    } else {
      fetchMissionVisionData();
    }
  }, []);

  const fetchMissionVisionData = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsData().unwrap();
      if (response?.data) {
        setFormData({
          mvHeading: response.data.mvHeading || '',
          mvDescription: response.data.mvDescription || '',
          mvImage: response.data.mvImage || '',
          ourMissionTab: response.data.ourMissionTab || { title: '', content: '' },
          ourVisionTab: response.data.ourVisionTab || { title: '', content: '' },
          charityHistoryTab: response.data.charityHistoryTab || { title: '', content: '' }
        });
      }
    } catch (error) {
      console.error('Error fetching mission vision data:', error);
      toast.error('Failed to load mission vision data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (tabName, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        [field]: value
      }
    }));
  };

  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          mvImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.mvHeading.trim()) errors.push('Main heading is required');
    if (!formData.mvDescription.trim()) errors.push('Main description is required');
    if (!formData.mvImage) errors.push('Left column image is required');
    
    // Validate tab content
    if (!formData.ourMissionTab.title.trim()) errors.push('Tab 1 title is required');
    if (!formData.ourMissionTab.content.trim()) errors.push('Tab 1 content is required');
    if (!formData.ourVisionTab.title.trim()) errors.push('Tab 2 title is required');
    if (!formData.ourVisionTab.content.trim()) errors.push('Tab 2 content is required');
    if (!formData.charityHistoryTab.title.trim()) errors.push('Tab 3 title is required');
    if (!formData.charityHistoryTab.content.trim()) errors.push('Tab 3 content is required');

    return errors;
  };

  const isFormValid = () => {
    return validateForm().length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    if (isDemoMode) {
      toast.success('Mission & Vision section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateAboutUsData(formData).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Mission & Vision section updated successfully!');
      }
    } catch (error) {
      console.error('Error updating mission vision data:', error);
      toast.error(error?.data?.message || 'Failed to update mission vision section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading mission vision data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link 
            to="/dash/about-us" 
            className="btn btn-outline-secondary me-3 d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" />
            Back to About Us
          </Link>
          <div>
            <h2 className="mb-1">Edit Mission & Vision Section</h2>
            <p className="text-muted mb-0">Manage the mission and vision section content</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          {isDemoMode && (
            <Alert variant="info" className="mb-0 py-2 px-3">
              <small>Demo Mode - Changes won't be saved to server</small>
            </Alert>
          )}
          <Button
            type="submit"
            form="missionVisionForm"
            variant="primary"
            disabled={isLoading || !isFormValid()}
            className="d-flex align-items-center"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Save Mission & Vision
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="missionVisionForm" onSubmit={handleSubmit}>
        <Row>
          {/* Right Column - Content */}
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Main Content</h5>
              </Card.Header>
              <Card.Body>
                {/* Main Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Main Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="mvHeading"
                    value={formData.mvHeading}
                    onChange={handleChange}
                    placeholder="Enter main heading"
                    required
                  />
                </Form.Group>

                {/* Main Description */}
                <Form.Group className="mb-4">
                  <Form.Label>Main Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="mvDescription"
                    value={formData.mvDescription}
                    onChange={handleChange}
                    placeholder="Enter main description"
                    required
                  />
                </Form.Group>

                {/* Tabs Section */}
                <h6 className="mb-3">Tab Content</h6>
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="mission">Tab 1</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="vision">Tab 2</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="history">Tab 3</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  
                  <Tab.Content>
                    <Tab.Pane eventKey="mission">
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.ourMissionTab.title}
                          onChange={(e) => handleTabChange('ourMissionTab', 'title', e.target.value)}
                          placeholder="Enter tab title"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.ourMissionTab.content}
                          onChange={(e) => handleTabChange('ourMissionTab', 'content', e.target.value)}
                          placeholder="Enter tab content"
                          required
                        />
                      </Form.Group>
                    </Tab.Pane>
                    
                    <Tab.Pane eventKey="vision">
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.ourVisionTab.title}
                          onChange={(e) => handleTabChange('ourVisionTab', 'title', e.target.value)}
                          placeholder="Enter tab title"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.ourVisionTab.content}
                          onChange={(e) => handleTabChange('ourVisionTab', 'content', e.target.value)}
                          placeholder="Enter tab content"
                          required
                        />
                      </Form.Group>
                    </Tab.Pane>
                    
                    <Tab.Pane eventKey="history">
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.charityHistoryTab.title}
                          onChange={(e) => handleTabChange('charityHistoryTab', 'title', e.target.value)}
                          placeholder="Enter tab title"
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.charityHistoryTab.content}
                          onChange={(e) => handleTabChange('charityHistoryTab', 'content', e.target.value)}
                          placeholder="Enter tab content"
                          required
                        />
                      </Form.Group>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
                  </Col>
                    {/* Left Column - Image */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Left Column Image</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Mission & Vision Image <span className="text-danger">*</span></Form.Label>
                  <div className="text-center">
                    {formData.mvImage && (
                      <Image
                        src={formData.mvImage}
                        alt="Mission Vision Image"
                        className="img-fluid rounded mb-3"
                        style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                      />
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="mb-3"
                    />
                    <Form.Text className="text-muted">
                      This image will appear on the left side of the mission & vision section
                    </Form.Text>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditMissionVision;