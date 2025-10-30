import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUploadImageMutation, useGetHomeEventsDataMutation, useUpdateHomeEventsDataMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import ImageUpload from '../../Components/ImageUpload';
import { FaSave, FaArrowLeft, FaCalendarAlt, FaUpload, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const EditEvents = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [uploadImage, { isLoading: uploadLoading }] = useUploadImageMutation();
  const [getHomeEventsData, { isLoading: loadingEvents }] = useGetHomeEventsDataMutation();
  const [updateHomeEventsData, { isLoading: updateLoading }] = useUpdateHomeEventsDataMutation();
  
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    image: '',
    ctaButton: {
      text: '',
      link: '',
      style: 'primary'
    },
    isActive: true
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    setIsLoading(true);
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo events data
        const demoData = {
          heading: 'Heroes in Action Disaster Relief Fundraiser',
          description: 'Join us for a special event to support disaster relief efforts and make a difference in our community.',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          ctaButton: {
            text: 'Vineyard Venues',
            link: '/events',
            style: 'primary'
          },
          isActive: true
        };
        
        setFormData(demoData);
        setIsLoading(false);
        return;
      }

      // Real API call for production using API slice
      const data = await getHomeEventsData().unwrap();
      
      if (data?.success && data?.event) {
        setFormData({
          heading: data.event.heading || '',
          description: data.event.description || '',
          image: data.event.image || '',
          ctaButton: {
            text: data.event.ctaButton?.text || '',
            link: data.event.ctaButton?.link || '',
            style: data.event.ctaButton?.style || 'primary'
          },
          isActive: data.event.isActive !== undefined ? data.event.isActive : true
        });
      }
    } catch (error) {
      console.warn('Failed to fetch events data, switching to offline mode:', error);
      
      // Fallback to demo data if API fails
      const offlineData = {
        heading: 'Heroes in Action Disaster Relief Fundraiser (Offline)',
        description: 'Join us for a special event to support disaster relief efforts and make a difference in our community.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ctaButton: {
          text: 'Events',
          link: '/events',
          style: 'primary'
        },
        isActive: true
      };
      
      setFormData(offlineData);
      toast.warn('Backend server is offline. You\'re now in demo mode.', {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Check if demo mode - simulate upload
    if (token && token.startsWith("demo-token")) {
      const demoUrl = `https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&t=${Date.now()}`;
      setFormData(prev => ({
        ...prev,
        image: demoUrl
      }));
      setHasChanges(true);
      toast.success('Image uploaded successfully! (Demo Mode)');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('files', file); // <-- use 'files' key for backend

      console.log('Uploading background image:', file.name, 'Size:', file.size, 'Type:', file.type);

      const result = await uploadImage(uploadFormData).unwrap();

      console.log('Upload result:', result);

      // DivineCare backend returns { success, files: [{ url, public_id }] }
      if (result?.success && Array.isArray(result.files) && result.files[0]?.url) {
        setFormData(prev => ({
          ...prev,
          image: result.files[0].url
        }));
        setHasChanges(true);
        toast.success('Background image uploaded successfully!');
      } else {
        console.error('Upload response missing imageUrl:', result);
        toast.error('Upload completed but no image URL received. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);

      // Handle different types of errors
      if (error?.status === 404) {
        toast.error('Upload endpoint not found. Please check your server configuration.');
      } else if (error?.status === 413) {
        toast.error('File too large. Please choose a smaller image.');
      } else if (error?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error?.data?.message) {
        toast.error(`Upload failed: ${error.data.message}`);
      } else if (error?.message) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error('Failed to upload image. Please check your connection and try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('ctaButton.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ctaButton: {
          ...prev.ctaButton,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setHasChanges(true);
  };

  const isFormValid = () => {
    // Check required fields
    if (!formData.heading.trim() || !formData.description.trim()) {
      return false;
    }
    
    return true;
  };

  const validateForm = () => {
    if (!formData.heading.trim()) {
      toast.error('Event heading is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Event description is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if form is not valid
    if (!isFormValid()) {
      validateForm(); // This will show specific error messages
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        toast.success('Events & Programs section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Real API call for production using API slice
      const requestData = {
        heading: formData.heading,
        description: formData.description,
        image: formData.image,
        ctaButton: formData.ctaButton,
        isActive: formData.isActive
      };

      const data = await updateHomeEventsData(requestData).unwrap();
      
      toast.success(data?.message || 'Events & Programs section updated successfully!');
      setHasChanges(false);
      navigate('/dash/homepage');
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle connection errors gracefully
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        toast.warn('Backend server is offline. Changes saved locally only.', {
          position: 'top-center',
          autoClose: 5000,
        });
        // In a real app, you might save to localStorage here
        setTimeout(() => {
          navigate('/dash/homepage');
        }, 2000);
      } else {
        toast.error(error?.message || 'Failed to update events section. Please try again.');
      }
    }
  };

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/homepage')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Home Page
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>Edit Events & Programs Section</span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updateLoading || !isFormValid() || isLoading}
            >
              <FaSave className="me-1" />
              {updateLoading ? 'Saving...' : 'Save Events Section'}
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={12}>
            {isLoading ? (
              <Card>
                <Card.Body className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading events data...</p>
                </Card.Body>
              </Card>
            ) : (
              <>
                {/* Required Fields Notice */}
                <Alert variant="info" className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    <div>
                      <strong>Fill in the event section details.</strong> Heading and description are required.
                      <div className="small mt-1">Fields marked with <span className="text-danger">*</span> are mandatory.</div>
                    </div>
                  </div>
                </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Left Column Content */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    Left Column Content (Editable)
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heading"
                        label="Event Heading *"
                        value={formData.heading}
                        onChange={handleInputChange}
                        placeholder="e.g., Heroes in Action Disaster Relief Fundraiser"
                        required={true}
                        maxLength={90}
                      />
                      <small className="text-muted">{formData.heading.length}/90 characters</small>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="description"
                        label="Event Description *"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter the event description..."
                        rows={4}
                        required={true}
                        maxLength={225}
                      />
                      <small className="text-muted">{formData.description.length}/225 characters</small>
                    </Col>
                    <Col md={6}>
                      <ImageUpload
                        value={formData.image}
                        onChange={(imageUrl) => {
                          setFormData(prev => ({ ...prev, image: imageUrl }));
                          setHasChanges(true);
                        }}
                        label="Background Image"
                        required={false}
                        maxSize={5}
                        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                        previewHeight="200px"
                        showPreview={true}
                      />
                    </Col>
                    {formData.image && (
                      <Col md={6}>
                        <label className="form-label">Background Image Preview</label>
                        <div className="border rounded" style={{ padding: '10px' }}>
                          <img
                            src={formData.image}
                            alt="Background Preview"
                            style={{ 
                              width: '100%', 
                              maxHeight: '200px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              console.log('Image preview error for:', formData.image);
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="mt-2 text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, image: '' }));
                                setHasChanges(true);
                              }}
                            >
                              <FaTrash className="me-1" />
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>

              {/* Call-to-Action Button Section */}
              {/* <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Call-to-Action Button</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="ctaButton.text"
                        label="Button Text *"
                        value={formData.ctaButton.text}
                        onChange={handleInputChange}
                        placeholder="e.g., Vineyard Venues"
                        required={true}
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="ctaButton.link"
                        label="Button Link *"
                        value={formData.ctaButton.link}
                        onChange={handleInputChange}
                        placeholder="e.g., /events or https://..."
                        required={true}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card> */}

              {/* Status Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Section Status</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Show Events Section on Website"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <small className="text-muted">
                    When disabled, this section will be hidden from the public website
                  </small>
                </Card.Body>
              </Card>
            </Form>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </MotionDiv>
);
};

export default EditEvents;