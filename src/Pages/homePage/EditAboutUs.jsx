import React, { useEffect, useState } from 'react';

import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { useUploadImageMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaUsers, FaHandsHelping, FaHeart, FaShieldAlt, FaHome, FaBullseye, FaStar, FaLeaf, FaHandHoldingHeart, FaGlobeAmericas, FaLightbulb, FaRocket } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';

const EditAboutUs = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getAboutUsData, { isLoading: loadingAbout }] = useGetAboutUsDataMutation();
  const [updateAboutUsData, { isLoading: updateLoading }] = useUpdateAboutUsDataMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadImageMutation();

  // Add CSS styles for icon selector
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .icon-selector .icon-option {
        transition: all 0.3s ease;
      }
      
      .icon-selector .icon-option:hover {
        border-color: var(--bs-primary) !important;
        background-color: var(--bs-light) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .icon-selector .icon-option.selected {
        border-color: var(--bs-primary) !important;
        background-color: var(--bs-primary) !important;
        color: white;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  
  const [formData, setFormData] = useState({
    mainHeading: '',
    mainDescription: '',
    topRightDescription: '',
    keyPointers: [
      {
        heading: '',
        description: '',
        icon: 'fa-hands-helping'
      },
      {
        heading: '',
        description: '',
        icon: 'fa-heart'
      },
      {
        heading: '',
        description: '',
        icon: 'fa-users'
      }
    ],
    centerImage: '',
    rightImage: ''
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  // Available icons for selection
  const availableIcons = [
    { name: 'fa-hands-helping', icon: FaHandsHelping, label: 'Helping Hands' },
    { name: 'fa-heart', icon: FaHeart, label: 'Heart' },
    { name: 'fa-users', icon: FaUsers, label: 'Users' },
    { name: 'fa-shield-alt', icon: FaShieldAlt, label: 'Shield' },
    { name: 'fa-home', icon: FaHome, label: 'Home' },
    { name: 'fa-bullseye', icon: FaBullseye, label: 'Target' },
    { name: 'fa-star', icon: FaStar, label: 'Star' },
    { name: 'fa-leaf', icon: FaLeaf, label: 'Leaf' },
    { name: 'fa-hand-holding-heart', icon: FaHandHoldingHeart, label: 'Caring Hand' },
    { name: 'fa-globe-americas', icon: FaGlobeAmericas, label: 'Globe' },
    { name: 'fa-lightbulb', icon: FaLightbulb, label: 'Lightbulb' },
    { name: 'fa-rocket', icon: FaRocket, label: 'Rocket' }
  ];

  // Function to get icon component by name
  const getIconComponent = (iconName) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : FaHandsHelping; // Default fallback
  };

  useEffect(() => {
    fetchAboutUsData();
  }, []);

  const fetchAboutUsData = async () => {
    try {
      console.log('Current token:', token);
      
      // Check if demo mode or no token
      if (!token || token.startsWith("demo-token")) {
        console.log('Using demo mode for about us data');
        // Set demo about us data
        const demoData = {
          mainHeading: 'Committed to Relief, Our Work Dedicated to Hope',
          mainDescription: 'At the heart of our organization lies simple yet powerful mission provide immediate relief & lasting hope to communities affected.',
          topRightDescription: 'At the heart of our lies a simple yet powerful mission: to provide and immediate relief affected by disaster organization.',
          keyPointers: [
            {
              heading: 'Helping people rebuild and prepare',
              description: 'We help them rebuild stronger more resilient for the future. Together with supporters like.',
              icon: 'fa-hands-helping'
            },
            {
              heading: 'Putting people first in everything we do',
              description: 'Guided by compassion driven the belief that every act kindness makes a difference.',
              icon: 'fa-heart'
            }
          ],
          centerImage: 'https://via.placeholder.com/600x400/28a745/ffffff?text=About+DivineCare+Center',
          rightImage: 'https://via.placeholder.com/300x400/007bff/ffffff?text=About+DivineCare+Right'
        };
        
        setFormData(demoData);
        return;
      }

      // Use home-page about us endpoint
      console.log('Fetching about us data from API...');
      const response = await getAboutUsData().unwrap();
      console.log('About Us API Response:', response);
      
      if (response && response.success && response.about) {
        // Map the API response to form data structure
        setFormData({
          mainHeading: response.about.mainHeading || '',
          mainDescription: response.about.mainDescription || '',
          topRightDescription: response.about.topRightDescription || '',
          keyPointers: response.about.keyPointers || [
            {
              heading: '',
              description: '',
              icon: 'fa-hands-helping'
            },
            {
              heading: '',
              description: '',
              icon: 'fa-heart'
            }
          ],
          centerImage: response.about.centerImage || '',
          rightImage: response.about.rightImage || ''
        });
        console.log('About data loaded successfully from home-page endpoint');
      } else {
        console.log('API response format not as expected:', response);
        console.log('Falling back to demo data');
        setFormData({
          mainHeading: 'Committed to Relief, Our Work Dedicated to Hope',
          mainDescription: 'At the heart of our organization lies simple yet powerful mission provide immediate relief & lasting hope to communities affected.',
          topRightDescription: 'At the heart of our lies a simple yet powerful mission: to provide and immediate relief affected by disaster organization.',
          keyPointers: [
            {
              heading: 'Helping people rebuild and prepare',
              description: 'We help them rebuild stronger more resilient for the future. Together with supporters like.',
              icon: 'fa-hands-helping'
            },
            {
              heading: 'Putting people first in everything we do',
              description: 'Guided by compassion driven the belief that every act kindness makes a difference.',
              icon: 'fa-heart'
            }
          ],
          centerImage: '',
          rightImage: ''
        });
      }
    } catch (error) {
      console.error('Error fetching about us data:', error);
      console.log('Using fallback demo data due to error');
      // Fallback to demo data on error
      setFormData({
        mainHeading: 'Committed to Relief, Our Work Dedicated to Hope',
        mainDescription: 'At the heart of our organization lies simple yet powerful mission provide immediate relief & lasting hope to communities affected.',
        topRightDescription: 'At the heart of our lies a simple yet powerful mission: to provide and immediate relief affected by disaster organization.',
        keyPointers: [
          {
            heading: 'Helping people rebuild and prepare',
            description: 'We help them rebuild stronger more resilient for the future. Together with supporters like.',
            icon: 'fa-hands-helping'
          },
          {
            heading: 'Putting people first in everything we do',
            description: 'Guided by compassion driven the belief that every act kindness makes a difference.',
            icon: 'fa-heart'
          }
        ],
        centerImage: '',
        rightImage: ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handlePointerChange = (pointerIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      keyPointers: prev.keyPointers.map((pointer, index) => 
        index === pointerIndex ? { ...pointer, [field]: value } : pointer
      )
    }));
    setHasChanges(true);
  };

  // Image upload handler: accepts File, uploads, sets Cloudinary URL
  const handleImageChange = async (field, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      // Prepare FormData for upload
      const formData = new FormData();
      formData.append('files', file);
      const result = await uploadImage(formData).unwrap();
      // Check for direct API response (not wrapped in .data)
      if (result?.success && Array.isArray(result.files) && result.files[0]?.url) {
        setFormData(prev => ({
          ...prev,
          [field]: result.files[0].url
        }));
        setHasChanges(true);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Image upload failed.');
      }
    } catch (error) {
      toast.error('Image upload error: ' + (error?.message || 'Unknown error'));
    }
  };

  const isFormValid = () => {
    // Check required main fields
    if (!formData.mainHeading.trim() || !formData.mainDescription.trim()) {
      return false;
    }
    
    // Check keyPointers
    if (!formData.keyPointers || formData.keyPointers.length === 0) {
      return false;
    }
    
    // Check each pointer has all required fields
    return formData.keyPointers.every(pointer => 
      pointer.heading && pointer.heading.trim() &&
      pointer.description && pointer.description.trim()
    );
  };

  const validateForm = () => {
    if (!formData.mainHeading.trim()) {
      toast.error('Main heading is required');
      return false;
    }
    
    if (!formData.mainDescription.trim()) {
      toast.error('Main description is required');
      return false;
    }

    // Check if there are keyPointers
    if (!formData.keyPointers || formData.keyPointers.length === 0) {
      toast.error('At least one key pointer is required');
      return false;
    }

    // Validate each pointer - all fields required
    for (let i = 0; i < formData.keyPointers.length; i++) {
      const pointer = formData.keyPointers[i];
      
      if (!pointer.heading || !pointer.heading.trim()) {
        toast.error(`Heading is required for key pointer ${i + 1}`);
        return false;
      }
      
      if (!pointer.description || !pointer.description.trim()) {
        toast.error(`Description is required for key pointer ${i + 1}`);
        return false;
      }
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
        toast.success('About Us section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Use home-page about us update endpoint
      const data = await updateAboutUsData(formData).unwrap();
      toast.success(data?.message || 'About Us section updated successfully!');
      setHasChanges(false);
      navigate('/dash/homepage');
    } catch (error) {
      console.error('Error updating about us data:', error);
      getError(error);
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
              <span style={{ color: 'var(--dark-color)' }}>Edit About Us Section</span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updateLoading || !isFormValid()}
            >
              <FaSave className="me-1" />
              {updateLoading ? 'Saving...' : 'Save About Us Section'}
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={12}>
            {/* Required Fields Notice */}
            <Alert variant="info" className="mb-4">
              <div className="d-flex align-items-center">
                <FaHome className="me-2" />
                <div>
                  <strong>All about section fields are required.</strong> Please fill in main content and all key pointers.
                  <div className="small mt-1">Fields marked with <span className="text-danger">*</span> are mandatory.</div>
                </div>
              </div>
            </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Main Content Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Main Content</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="mainHeading"
                        label="Main Heading *"
                        value={formData.mainHeading}
                        onChange={handleInputChange}
                        placeholder="e.g., Committed to Relief, Our Work Dedicated to Hope"
                        required={true}
                        maxLength={45}
                      />
                      <small className="text-muted">{formData.mainHeading.length}/45 characters</small>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="mainDescription"
                        label="Main Description *"
                        value={formData.mainDescription}
                        onChange={handleInputChange}
                        placeholder="Enter the main description..."
                        rows={3}
                        required={true}
                        maxLength={225}
                      />
                      <small className="text-muted">{formData.mainDescription.length}/225 characters</small>
                    </Col>
                  </Row>
                </Card.Body>
                          </Card>
                            {/* Top Right Content */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Top Right Content</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="topRightDescription"
                        label="Top Right Description *"
                        value={formData.topRightDescription}
                        onChange={handleInputChange}
                        placeholder="Enter the top right description..."
                        rows={4}
                        maxLength={225}
                      />
                      <small className="text-muted">{formData.topRightDescription.length}/225 characters</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              {/* Key Pointers Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Key Pointers</h5>
                </Card.Header>
                <Card.Body>
                  {formData.keyPointers.map((pointer, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Header>
                        <h6 className="mb-0 d-flex align-items-center">
                          <span className="me-2">Pointer {index + 1}</span>
                          {pointer.heading && (
                            <span className="text-muted">- {pointer.heading}</span>
                          )}
                          {pointer.icon && (
                            <span className="badge bg-primary ms-2">
                              {React.createElement(getIconComponent(pointer.icon), { size: 14, className: 'me-1' })}
                              {availableIcons.find(icon => icon.name === pointer.icon)?.label || 'Selected Icon'}
                            </span>
                          )}
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <FormField
                              type="select"
                              name={`pointer_${index}_icon`}
                              label="Choose Icon *"
                              value={pointer.icon}
                              onChange={(e) => handlePointerChange(index, 'icon', e.target.value)}
                              options={availableIcons.map(iconOption => ({
                                value: iconOption.name,
                                label: iconOption.label
                              }))}
                              required={true}
                            />
                          </Col>
                          <Col md={6}>
                            <label className="form-label">Icon Preview</label>
                            <div className="border rounded p-3 d-flex align-items-center" style={{ minHeight: '58px' }}>
                              {pointer.icon && (
                                <div className="d-flex align-items-center">
                                  {React.createElement(getIconComponent(pointer.icon), { size: 24, className: 'me-2' })}
                                  <span>{availableIcons.find(icon => icon.name === pointer.icon)?.label || 'Selected Icon'}</span>
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col md={6}>
                            <FormField
                              type="text"
                              name={`pointer_${index}_heading`}
                              label="Heading *"
                              value={pointer.heading}
                              onChange={(e) => handlePointerChange(index, 'heading', e.target.value)}
                              placeholder="Enter pointer heading..."
                              required={true}
                              maxLength={45}
                            />
                            <small className="text-muted">{pointer.heading?.length || 0}/45 characters</small>
                          </Col>
                          <Col md={6}>
                            <FormField
                              type="textarea"
                              name={`pointer_${index}_description`}
                              label="Description *"
                              value={pointer.description}
                              onChange={(e) => handlePointerChange(index, 'description', e.target.value)}
                              placeholder="Enter pointer description..."
                              rows={3}
                              required={true}
                              maxLength={150}
                            />
                            <small className="text-muted">{pointer.description?.length || 0}/150x characters</small>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>

              {/* Images Section */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Section Images</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">Center Image</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group controlId="centerImageUpload">
                                <Form.Label>Upload Center Image *</Form.Label>
                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange('centerImage', e)}
                                  disabled={uploadingImage}
                                />
                                {uploadingImage && <span className="text-info ms-2">Uploading...</span>}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              {formData.centerImage ? (
                                <div>
                                  <label className="form-label">Preview</label>
                                  <div className="border rounded" style={{ padding: '10px' }}>
                                    <img
                                      src={getImageUrl(formData.centerImage)}
                                      alt="Center Image"
                                      style={{ 
                                        width: '100%', 
                                        maxHeight: '200px', 
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="form-label">Preview</label>
                                  <div className="border rounded d-flex align-items-center justify-content-center" style={{ padding: '20px', minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                                    <span className="text-muted">No image uploaded yet</span>
                                  </div>
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={12}>
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">Right Image</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group controlId="rightImageUpload">
                                <Form.Label>Upload Right Image *</Form.Label>
                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange('rightImage', e)}
                                  disabled={uploadingImage}
                                />
                                {uploadingImage && <span className="text-info ms-2">Uploading...</span>}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              {formData.rightImage ? (
                                <div>
                                  <label className="form-label">Preview</label>
                                  <div className="border rounded" style={{ padding: '10px' }}>
                                    <img
                                      src={getImageUrl(formData.rightImage)}
                                      alt="Right Image"
                                      style={{ 
                                        width: '100%', 
                                        maxHeight: '200px', 
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="form-label">Preview</label>
                                  <div className="border rounded d-flex align-items-center justify-content-center" style={{ padding: '20px', minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                                    <span className="text-muted">No image uploaded yet</span>
                                  </div>
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default EditAboutUs;