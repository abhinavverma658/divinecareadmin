import React, { useState, useEffect } from 'react';
import TextEditor from '../../Components/TextEditor';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner, Nav, Tab } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutVisionDataMutation, useUpdateAboutVisionDataMutation, useUploadImageMutation } from '../../features/apiSlice';
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
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // API mutations - using Vision endpoints
  const [getAboutVisionData] = useGetAboutVisionDataMutation();
  const [updateAboutVisionData] = useUpdateAboutVisionDataMutation();
  const [uploadImage] = useUploadImageMutation();

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
      console.log('🎭 Demo mode activated for vision, using demo data');
    } else {
      console.log('🔐 Real token found for vision, fetching from API');
      fetchMissionVisionData();
    }
  }, []);

  // Debug form data changes for vision
  useEffect(() => {
    console.log('🔄 Vision form data updated:', {
      mvHeading: formData.mvHeading,
      mvDescription: formData.mvDescription?.substring(0, 50) + '...',
      hasImage: !!formData.mvImage,
      tabs: {
        mission: formData.ourMissionTab?.title || 'Empty',
        vision: formData.ourVisionTab?.title || 'Empty',
        history: formData.charityHistoryTab?.title || 'Empty'
      }
    });
  }, [formData]);

  const fetchMissionVisionData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting About Vision Data fetch...');
      
      const response = await getAboutVisionData().unwrap();
      console.log('📥 About Vision Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      console.log('📋 Response type:', typeof response);
      
      // Check multiple possible response structures
      let data = null;
      
      console.log('🔍 Analyzing vision response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      console.log('🔑 Response keys:', response ? Object.keys(response) : 'No keys');
      
      if (response?.success && response?.vision) {
        data = response.vision;
        console.log('✅ Using response.vision structure (success + vision)');
      } else if (response?.vision) {
        data = response.vision;
        console.log('✅ Using response.vision structure (no success flag)');
      } else if (response?.success && response?.data) {
        data = response.data;
        console.log('✅ Using response.data structure (with success flag)');
      } else if (response?.data && !response?.success) {
        data = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (Array.isArray(response) && response.length > 0) {
        data = response[0];
        console.log('✅ Using first array item');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        data = response;
        console.log('✅ Using response directly as data');
      }
      
      console.log('📝 Extracted vision data:', data);
      console.log('🔑 Vision data keys:', data ? Object.keys(data) : 'No data keys');
      
      if (data && Object.keys(data).length > 0) {
        // Map tabs array to individual tab objects
        let missionTab = { title: '', content: '' };
        let visionTab = { title: '', content: '' };
        let historyTab = { title: '', content: '' };
        if (Array.isArray(data.tabs)) {
          missionTab = data.tabs[0] || missionTab;
          visionTab = data.tabs[1] || visionTab;
          historyTab = data.tabs[2] || historyTab;
        }
        // Fallback to legacy keys if available
        missionTab = data.ourMissionTab || data.missionTab || missionTab;
        visionTab = data.ourVisionTab || data.visionTab || visionTab;
        historyTab = data.charityHistoryTab || data.historyTab || historyTab;

        const newFormData = {
          mvHeading: data.mvHeading || data.heading || '',
          mvDescription: data.mvDescription || data.description || '',
          mvImage: data.mvImage || data.image || '',
          ourMissionTab: missionTab,
          ourVisionTab: visionTab,
          charityHistoryTab: historyTab
        };
        console.log('🎯 Final vision form data to set:', newFormData);
        setFormData(newFormData);
        toast.success('Vision section data loaded successfully');
      } else {
        console.log('⚠️ No vision data found or empty data object');
        console.log('📊 Full vision response debug:', JSON.stringify(response, null, 2));
        setFormData(demoData);
        toast.info('No saved data found. Using demo data.');
      }
    } catch (error) {
      console.error('❌ Error fetching vision data:', error);
      console.log('📊 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load vision data. Using demo data.');
      setFormData(demoData);
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

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (isDemoMode) {
      // Demo mode - use base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          mvImage: e.target.result
        }));
        toast.success('Mission & Vision image uploaded successfully (Demo mode)');
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create FormData for API upload
      const formData = new FormData();
      formData.append('files', file); // Use 'files' key for backend compatibility
      formData.append('folder', 'about-us/mission-vision');
      console.log('🖼️ Uploading mission & vision image:', file.name);
      const response = await uploadImage(formData).unwrap();
      // Support multiple possible keys for image URL, including files[0].url
      let imageUrl = response?.imageUrl || response?.url || response?.data?.imageUrl || response?.data?.url;
      if (!imageUrl && Array.isArray(response?.files) && response.files[0]?.url) {
        imageUrl = response.files[0].url;
      }
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          mvImage: imageUrl
        }));
        toast.success('Mission & Vision image uploaded successfully!');
        console.log('✅ Mission & Vision image uploaded:', imageUrl);
      } else {
        console.error('❌ Upload response:', response);
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading mission & vision image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
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

    // Map frontend state to backend payload
    const payload = {
      heading: formData.mvHeading,
      description: formData.mvDescription,
      image: formData.mvImage,
      tabs: [
        {
          title: formData.ourMissionTab.title,
          content: formData.ourMissionTab.content
        },
        {
          title: formData.ourVisionTab.title,
          content: formData.ourVisionTab.content
        },
        {
          title: formData.charityHistoryTab.title,
          content: formData.charityHistoryTab.content
        }
      ]
    };

    try {
      setIsLoading(true);
      console.log('📤 Updating About Vision Data (payload):', payload);
      const response = await updateAboutVisionData({ 
        id: "68ee0dce70e1bfc20b375416", 
        data: payload 
      }).unwrap();
      console.log('✅ Update Response:', response);
      if (response?.success) {
        toast.success(response.message || 'Mission & Vision section updated successfully!');
        setTimeout(() => {
          fetchMissionVisionData();
        }, 1000);
      } else {
        toast.error('Failed to update mission & vision section');
      }
    } catch (error) {
      console.error('❌ Error updating vision data:', error);
      toast.error(error?.data?.message || 'Failed to update mission & vision section');
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
                    maxLength={80}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.mvHeading.length}/80 characters
                  </Form.Text>
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
                    maxLength={400}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.mvDescription.length}/400 characters
                  </Form.Text>
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
                          maxLength={30}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.ourMissionTab.title.length}/30 characters
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        {/* Use TextEditor for rich text editing */}
                        <TextEditor
                          description={formData.ourMissionTab.content}
                          onChange={(value) => handleTabChange('ourMissionTab', 'content', value)}
                          placeholder="Enter tab content"
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
                          maxLength={30}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.ourVisionTab.title.length}/30 characters
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        {/* Use TextEditor for rich text editing */}
                        <TextEditor
                          description={formData.ourVisionTab.content}
                          onChange={(value) => handleTabChange('ourVisionTab', 'content', value)}
                          placeholder="Enter tab content"
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
                          maxLength={30}
                          required
                        />
                        <Form.Text className="text-muted">
                          {formData.charityHistoryTab.title.length}/30 characters
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Tab Content <span className="text-danger">*</span></Form.Label>
                        {/* Use TextEditor for rich text editing */}
                        <TextEditor
                          description={formData.charityHistoryTab.content}
                          onChange={(value) => handleTabChange('charityHistoryTab', 'content', value)}
                          placeholder="Enter tab content"
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
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="text-center mb-3">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <small className="text-muted">Uploading...</small>
                      </div>
                    )}
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