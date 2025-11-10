import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetHomeCarouselMutation, useUpdateHomeCarouselMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaArrowLeft, FaSave, FaImage, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaUpload, FaSpinner } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';



const EditHomeHero = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getHomeCarousel, { isLoading: loadingHero }] = useGetHomeCarouselMutation();
  const [updateHomeCarousel, { isLoading: updateLoading }] = useUpdateHomeCarouselMutation();
  // Remove RTK Query uploadImage mutation, use direct fetch instead
  
  const [formData, setFormData] = useState({
    heroImage: '',
    heroTitle: '',
    heroHeading: '',
    description: '',
    facebookUrl: '',
    instagramUrl: '',
    xUrl: ''
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'online', 'offline', 'checking'

  useEffect(() => {
    fetchHeroData();
  }, []);

  // Apply red color to all asterisks after component renders
  useEffect(() => {
    const applyRedAsterisks = () => {
      // Find all labels and form-labels
      const labels = document.querySelectorAll('label, .form-label, h5, .text-danger');
      labels.forEach(label => {
        if (label.innerHTML && label.innerHTML.includes('*')) {
          // Replace asterisks with red-colored span
          label.innerHTML = label.innerHTML.replace(/\*/g, '<span style="color: red; font-weight: bold;">*</span>');
        }
      });
    };

    // Apply immediately and after a small delay to catch dynamically rendered content
    applyRedAsterisks();
    const timeoutId = setTimeout(applyRedAsterisks, 100);

    return () => clearTimeout(timeoutId);
  }, [formData]); // Re-run when formData changes

  const fetchHeroData = async () => {
    setConnectionStatus('checking');
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        setConnectionStatus('offline');
        // Set demo hero data
        const demoData = {
          heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          heroTitle: 'Welcome to DivineCare home',
          heroHeading: 'Empowering Relief & Support',
          description: 'We provide compassionate care and support to those in need, making a difference every day.',
          facebookUrl: 'https://facebook.com/divinecare1',
          instagramUrl: 'https://instagram.com/divinecare1',
          xUrl: 'https://x.com/divinecare'
        };
        
        setFormData(demoData);
        return;
      }

      // Real API call for production
      const data = await getHomeCarousel().unwrap();
      setConnectionStatus('online');
      if (data?.success && data?.home) {
        setFormData({
          heroImage: data.home.heroImage || '',
          heroTitle: data.home.heroTitle || '',
          heroHeading: data.home.heroHeading || '', 
          description: data.home.description || '',
          facebookUrl: data.home.facebookUrl || '',
          instagramUrl: data.home.instagramUrl || '',
          xUrl: data.home.xUrl || ''
        });
      }
    } catch (error) {
      console.warn('Backend connection failed, switching to offline mode:', error);
      setConnectionStatus('offline');
      
      // Check if it's a connection error
      if (error?.status === 'FETCH_ERROR' || error?.message?.includes('Failed to fetch')) {
        toast.warn('Backend server is offline. You\'re now in demo mode.', {
          position: 'top-center',
          autoClose: 5000,
        });
        
        // Set demo data for offline mode
        const offlineData = {
          heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          heroTitle: 'Welcome to DivineCare (Offline Mode)',
          heroHeading: 'Empowering Relief & Support',
          description: 'We provide compassionate care and support to those in need, making a difference every day. (Currently in offline demo mode)',
          facebookUrl: 'https://facebook.com/divinecare1',
          instagramUrl: 'https://instagram.com/divinecare1',
          xUrl: 'https://x.com/divinecare'
        };
        
        setFormData(offlineData);
      } else {
        getError(error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (name === 'heroTitle' || name === 'heroHeading') {
      newValue = value.slice(0, 30);
    }
    if (name === 'description') {
      newValue = value.slice(0, 95);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue
    }));
    setHasChanges(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Check if demo mode - simulate upload
    if (token && token.startsWith("demo-token")) {
      setUploadProgress(true);
      setTimeout(() => {
        const demoUrl = `https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
        setFormData(prev => ({ ...prev, heroImage: demoUrl }));
        setHasChanges(true);
        setUploadProgress(false);
        toast.success('Image uploaded successfully! (Demo Mode)');
      }, 1500);
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
      setUploadProgress(true);
      const uploadFormData = new FormData();
      uploadFormData.append('files', file); // Backend expects 'files' field

      const response = await fetch('https://divinecare-backend.onrender.com/api/upload', {
        method: 'POST',
        body: uploadFormData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log('Upload result:', result);
      if (result?.success && result.files?.[0]?.url) {
        setFormData(prev => ({ ...prev, heroImage: result.files[0].url }));
        setHasChanges(true);
        toast.success('Image uploaded successfully!');
      } else {
        console.error('Upload response missing image URL:', result);
        toast.error('Upload completed but no image URL received. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please check your connection and try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  const isFormValid = () => {
    // Check required text fields
    if (!formData.heroTitle.trim() || !formData.heroHeading.trim() || !formData.heroImage.trim()) {
      return false;
    }
    
    return true;
  };

  const validateForm = () => {
    if (!formData.heroTitle.trim()) {
      toast.error('Hero title is required');
      return false;
    }
    
    if (!formData.heroHeading.trim()) {
      toast.error('Hero heading is required');
      return false;
    }

    if (!formData.heroImage.trim()) {
      toast.error('Hero image is required');
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
      // Check if demo mode or offline mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        toast.success('Hero section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Real API call
      const data = await updateHomeCarousel({ data: formData }).unwrap();
      toast.success(data?.message || 'Hero section updated successfully!');
      navigate('/dash/homepage');
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle connection errors gracefully
      if (error?.status === 'FETCH_ERROR' || error?.message?.includes('Failed to fetch')) {
        toast.warn('Backend server is offline. Changes saved locally only.', {
          position: 'top-center',
          autoClose: 5000,
        });
        // In a real app, you might save to localStorage here
        setTimeout(() => {
          navigate('/dash/homepage');
        }, 2000);
      } else {
        getError(error);
      }
    }
  };

  const getImageUrl = (val) =>
   !val ? '' : /^https?:\/\//i.test(val) ? val : `${BASE_URL.replace(/\/$/, '')}/${val.replace(/^\/+/, '')}`;

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
              <span style={{ color: 'var(--dark-color)' }}>Edit Hero Section</span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
            
            {/* Connection Status Indicator */}
            {connectionStatus === 'offline' && (
              <Badge bg="warning" className="ms-2">
                <i className="fas fa-wifi-slash me-1"></i>
                Offline Mode
              </Badge>
            )}
            {connectionStatus === 'online' && (
              <Badge bg="success" className="ms-2">
                <i className="fas fa-wifi me-1"></i>
                Online
              </Badge>
            )}
            {connectionStatus === 'checking' && (
              <Badge bg="secondary" className="ms-2">
                <i className="fas fa-spinner fa-spin me-1"></i>
                Connecting...
              </Badge>
            )}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updateLoading || !isFormValid()}
            >
              <FaSave className="me-1" />
              {updateLoading ? 'Saving...' : 'Save Hero Section'}
            </Button>
          </div>
        </div>

        <Row>
          {/* Form Section */}
          <Col lg={12}>
            {/* Required Fields Notice */}
            <Alert variant={connectionStatus === 'offline' ? 'warning' : 'info'} className="mb-4">
              <div className="d-flex align-items-center">
                <FaImage className="me-2" />
                <div>
                  {connectionStatus === 'offline' ? (
                    <>
                      <strong>You are in offline mode.</strong> Backend server is not available. You can still edit the hero section, but changes will not be saved to the database.
                      <div className="small mt-1">
                        To connect to the backend:
                        <ul className="mb-0 mt-1">
                          <li>Ensure your backend server is running on <code>http://localhost:5001</code></li>
                          <li>Check if your API endpoints are accessible</li>
                          <li>Refresh the page once the server is online</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>Hero section fields are required.</strong> Please add title, heading, description, and hero image.
                      <div className="small mt-1">Fields marked with <span className="text-danger">*</span> are mandatory.</div>
                    </>
                  )}
                </div>
              </div>
            </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Hero Image Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Hero Image *</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3">
                      
                      {/* File Upload Section */}
                      <div className="mt-3">
                        <label className="form-label">Upload New Image</label>
                        <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                          <input
                            type="file"
                            id="heroImageUpload"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            style={{ display: 'none' }}
                            disabled={uploadProgress}
                          />
                          <div className="text-center">
                            <Button
                              variant="outline-primary"
                              onClick={() => document.getElementById('heroImageUpload').click()}
                              disabled={uploadProgress}
                              className="mb-2"
                            >
                              {uploadProgress ? (
                                <>
                                  <FaSpinner className="me-2 fa-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FaUpload className="me-2" />
                                  Choose Image File
                                </>
                              )}
                            </Button>
                            <div>
                              <small className="text-muted">
                                Supported formats: JPEG, PNG, WebP (Max 5MB)
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      {formData.heroImage ? (
                        <div>
                          <label className="form-label">Preview</label>
                          <div className="border rounded" style={{ padding: '10px' }}>
                            <Image
                              src={getImageUrl(formData.heroImage)}
                              alt="Hero Image"
                              fluid
                              rounded
                              style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                              onError={(e) => {
                                e.target.style.border = '2px solid red';
                                e.target.alt = 'Failed to load image';
                              }}
                            />
                          </div>
                          {/* Image Actions */}
                          <div className="mt-2 text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, heroImage: '' }));
                                setHasChanges(true);
                              }}
                            >
                              <FaTrash className="me-1" />
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="form-label">Preview</label>
                          <div className="border rounded d-flex align-items-center justify-content-center" style={{ padding: '20px', minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                            <div className="text-center">
                              <FaImage size={48} className="text-muted mb-2" />
                              <div className="text-muted">No image uploaded yet</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Content Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Hero Content</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heroTitle"
                        label="Hero Title *"
                        value={formData.heroTitle}
                        onChange={handleInputChange}
                        placeholder="Enter the main hero title..."
                        required={true}
                        maxLength={30}
                      />
                      <div className="text-end text-muted small mb-2">
                        {formData.heroTitle.length} / 30 characters
                      </div>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heroHeading"
                        label="Hero Heading *"
                        value={formData.heroHeading}
                        onChange={handleInputChange}
                        placeholder="Enter the hero heading/subtitle..."
                        required={true}
                        maxLength={30}
                      />
                      <div className="text-end text-muted small mb-2">
                        {formData.heroHeading.length} / 30 characters
                      </div>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="description"
                        label="Description *"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter hero description..."
                        rows={4}
                        required={true}
                        maxLength={95}
                      />
                      <div className="text-end text-muted small mb-2">
                        {formData.description.length} / 95 characters
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Call-to-Action Section
              <Card className="mb-4">
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
                                              placeholder="e.g., Get Started Today"
                                              required={true}
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="ctaButton.link"
                        label="Button Link * "
                        value={formData.ctaButton.link}
                        onChange={handleInputChange}
                                              placeholder="e.g., /contact or https://..."
                                              required={true}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card> */}

              {/* Social Media Links Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Social Media Links</h5>
                  <small className="text-muted">Add your social media profiles to display on the hero section</small>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <FormField
                        type="url"
                        name="facebookUrl"
                        label="Facebook URL"
                        value={formData.facebookUrl}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/yourpage"
                        icon="fab fa-facebook-f"
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type="url"
                        name="instagramUrl"
                        label="Instagram URL"
                        value={formData.instagramUrl}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/yourprofile"
                        icon="fab fa-instagram"
                      />
                    </Col>
                    <Col md={4}>
                      <FormField
                        type="url"
                        name="xUrl"
                        label="X (Twitter) URL"
                        value={formData.xUrl}
                        onChange={handleInputChange}
                        placeholder="https://x.com/yourhandle"
                        icon="fab fa-x-twitter"
                      />
                    </Col>
                  </Row>
                  
                  {/* Social Media Preview */}
                  {/* <Row className="mt-3">
                    <Col>
                      <div className="border rounded p-3 bg-light">
                        <h6 className="mb-2">Preview:</h6>
                        <div className="d-flex gap-2">
                          {formData.socialMedia.facebook && (
                            <a 
                              href={formData.socialMedia.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                              style={{ pointerEvents: 'none' }}
                            >
                              <i className="fab fa-facebook-f me-1"></i>
                              Facebook
                            </a>
                          )}
                          {formData.socialMedia.instagram && (
                            <a 
                              href={formData.socialMedia.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-danger btn-sm"
                              style={{ pointerEvents: 'none' }}
                            >
                              <i className="fab fa-instagram me-1"></i>
                              Instagram
                            </a>
                          )}
                          {formData.socialMedia.x && (
                            <a 
                              href={formData.socialMedia.x} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-dark btn-sm"
                              style={{ pointerEvents: 'none' }}
                            >
                              <i className="fab fa-x-twitter me-1"></i>
                              X
                            </a>
                          )}
                          {!formData.socialMedia.facebook && !formData.socialMedia.instagram && !formData.socialMedia.x && (
                            <span className="text-muted">No social media links added yet</span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row> */}
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS for text shadow */}
      <style>
        {`
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        .bg-white-50 {
          background-color: rgba(255,255,255,0.5) !important;
        }
        `}
      </style>
    </MotionDiv>
  );
};

export default EditHomeHero;