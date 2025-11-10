import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetGalleryDataMutation, useUpdateGalleryDataMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import ImageUpload from '../../Components/ImageUpload';
import { FaSave, FaArrowLeft, FaImages, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';


const EditGallery = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getGalleryData, { isLoading: loadingGallery }] = useGetGalleryDataMutation();
  const [updateGalleryData, { isLoading: updateLoading }] = useUpdateGalleryDataMutation();
  
  const [formData, setFormData] = useState({
    _id: null, // Backend gallery ID
    heading: '',
    description: '',
    images: [
      { id: 1, url: '', public_id: '', _id: null },
      { id: 2, url: '', public_id: '', _id: null },
      { id: 3, url: '', public_id: '', _id: null },
      { id: 4, url: '', public_id: '', _id: null },
      { id: 5, url: '', public_id: '', _id: null },
      { id: 6, url: '', public_id: '', _id: null }
    ]
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API base URL
  const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    return 'https://divinecare-backend.onrender.com/api';
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo gallery data
        const demoData = {
          heading: 'The Frontlines of Relief',
          description: 'These titles aim to convey emotion and meaning while showcasing the importance of your organization\'s work through visuals.',
          images: [
            {
              _id: 'demo-img-1',
              url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image1'
            },
            {
              _id: 'demo-img-2',
              url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image2'
            },
            {
              _id: 'demo-img-3',
              url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image3'
            },
            {
              _id: 'demo-img-4',
              url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image4'
            },
            {
              _id: 'demo-img-5',
              url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image5'
            },
            {
              _id: 'demo-img-6',
              url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              public_id: 'gallery/image6'
            }
          ]
        };
        
        setFormData(demoData);
        setIsLoading(false);
        return;
      }

      // Real API call for production
      const data = await getGalleryData().unwrap();
      
      console.log('📄 Gallery data received:', data);
      
      if (data?.success && data?.gallery) {
        // Convert backend image structure to frontend structure
        const convertedImages = data.gallery.images.map((img, index) => ({
          id: index + 1, // Use index-based ID for frontend
          _id: img._id, // Keep backend ID for reference
          url: img.url,
          public_id: img.public_id
        }));
        
        setFormData({
          _id: data.gallery._id, // Store backend ID
          heading: data.gallery.heading || '',
          description: data.gallery.description || '',
          images: convertedImages
        });
      }
    } catch (error) {
      console.warn('Failed to fetch gallery data, switching to offline mode:', error);
      
      // Fallback to demo data if API fails
      const offlineData = {
        heading: 'The Frontlines of Relief (Offline)',
        description: 'These titles aim to convey emotion and meaning while showcasing the importance of your organization\'s work through visuals.',
        images: [
          {
            id: 1,
            _id: 'offline-img-1',
            url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            public_id: 'gallery/image1'
          },
          {
            id: 2,
            _id: 'offline-img-2',
            url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            public_id: 'gallery/image2'
          },
          {
            id: 3,
            _id: 'offline-img-3',
            url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            public_id: 'gallery/image3'
          }
        ]
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handleImageChange = (imageId, field, value) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === imageId 
          ? { ...img, [field]: value }
          : img
      )
    }));
    setHasChanges(true);
  };

  const addImage = () => {
    const newId = Math.max(...formData.images.map(img => img.id)) + 1;
    const newImage = {
      id: newId,
      url: '',
      public_id: '',
      _id: null // Will be assigned by backend when saved
    };
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
    setHasChanges(true);
  };

  const removeImage = (imageId) => {
    if (formData.images.length <= 1) {
      toast.error('At least one image is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
    setHasChanges(true);
  };

  const isFormValid = () => {
    // Check required fields
    if (!formData.heading.trim() || !formData.description.trim()) {
      return false;
    }
    
    // Check images - at least one image with URL required
    const validImages = formData.images.filter(img => img.url && img.url.trim());
    if (validImages.length === 0) {
      return false;
    }
    
    return true;
  };

  const validateForm = () => {
    if (!formData.heading.trim()) {
      toast.error('Gallery heading is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Gallery description is required');
      return false;
    }

    // Validate images - at least one image with URL required
    const validImages = formData.images.filter(img => img.url && img.url.trim());
    if (validImages.length === 0) {
      toast.error('At least one gallery image is required');
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
        toast.success('Gallery section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Real API call
      const requestData = {
        heading: formData.heading,
        description: formData.description,
        images: formData.images.filter(img => img.url && img.url.trim()).map(img => ({
          url: img.url,
          public_id: img.public_id,
          ...(img._id && { _id: img._id }) // Include backend ID if available
        }))
      };

      // Use the stored gallery ID or default
      const galleryId = formData._id || "68ebd5e97deb89d1105fd730";

      const data = await updateGalleryData({ 
        id: galleryId, 
        ...requestData 
      }).unwrap();
      
      toast.success(data?.message || 'Gallery section updated successfully!');
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
        toast.error(error?.message || 'Failed to update gallery section. Please try again.');
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
              <span style={{ color: 'var(--dark-color)' }}>Edit Gallery Section</span>
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
              {updateLoading ? 'Saving...' : 'Save Gallery Section'}
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
                  <p>Loading gallery data...</p>
                </Card.Body>
              </Card>
            ) : (
              <>
                {/* Required Fields Notice */}
                <Alert variant="info" className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaImages className="me-2" />
                    <div>
                      <strong>Gallery images are required.</strong> Please add a heading, description, and at least one gallery image.
                      <div className="small mt-1">Fields marked with <span className="text-danger">*</span> are mandatory.</div>
                    </div>
                  </div>
                </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Section Header */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaImages className="me-2" />
                    Section Header
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heading"
                        label="Gallery Heading *"
                        value={formData.heading}
                        onChange={handleInputChange}
                        placeholder="e.g., The Frontlines of Relief"
                        required={true}
                        maxLength={90}
                      />
                      <small className="text-muted">{formData.heading.length}/90 characters</small>
                    </Col>
                    <Col md={12}>
                      <FormField
                              type="textarea"
                              name="description"
                              label="Gallery Description *"
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="Enter the gallery description..."
                              rows={3}
                              required={true}
                              maxLength={225}
                      />
                      <small className="text-muted">{formData.description.length}/225 characters</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Gallery Images */}
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Gallery Images ({formData.images.length})</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addImage}
                  >
                    <FaPlus className="me-1" />
                    Add Image
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {formData.images.map((image, index) => (
                      <Col md={6} key={image.id} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Image {index + 1}</h6>
                            {formData.images.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeImage(image.id)}
                                title="Remove image"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </Card.Header>
                          <Card.Body>
                            <ImageUpload
                              value={getImageUrl(image.url)}
                              onChange={(imageUrl) => {
                                handleImageChange(image.id, 'url', imageUrl);
                                // Generate a public_id when image URL changes
                                if (imageUrl) {
                                  handleImageChange(image.id, 'public_id', `gallery/image_${image.id}_${Date.now()}`);
                                } else {
                                  handleImageChange(image.id, 'public_id', '');
                                }
                              }}
                              label={`Upload Gallery Image ${index + 1}`}
                              required={false}
                              maxSize={5}
                              acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                              previewHeight="150px"
                              showPreview={true}
                            />
                            
                            {image.url && (
                              <div className="mt-3 text-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    handleImageChange(image.id, 'url', '');
                                    handleImageChange(image.id, 'public_id', '');
                                  }}
                                >
                                  <FaTrash className="me-1" />
                                  Remove Image
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
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

export default EditGallery;