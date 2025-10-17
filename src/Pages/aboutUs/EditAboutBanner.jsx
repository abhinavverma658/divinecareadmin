import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditAboutBanner = () => {
  const [formData, setFormData] = useState({
    bannerImage: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using existing About Us endpoints
  const [getAboutUsData] = useGetAboutUsDataMutation();
  const [updateAboutUsData] = useUpdateAboutUsDataMutation();

  // Demo data for testing
  const demoData = {
    bannerImage: 'https://creative-story.s3.amazonaws.com/about/about-banner.jpg'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
    } else {
      fetchBannerData();
    }
  }, []);

  const fetchBannerData = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsData().unwrap();
      if (response?.data) {
        setFormData({
          bannerImage: response.data.bannerImage || ''
        });
      }
    } catch (error) {
      console.error('Error fetching banner data:', error);
      toast.error('Failed to load banner data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          bannerImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.bannerImage) errors.push('Banner image is required');

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
      toast.success('About Us banner updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateAboutUsData(formData).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('About Us banner updated successfully!');
      }
    } catch (error) {
      console.error('Error updating banner data:', error);
      toast.error(error?.data?.message || 'Failed to update banner');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading banner data...</p>
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
            <h2 className="mb-1">Edit About Us Banner</h2>
            <p className="text-muted mb-0">Manage the banner image for the About Us page</p>
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
            form="bannerForm"
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
                Save Banner
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="bannerForm" onSubmit={handleSubmit}>
        <Row>
          {/* Banner Image Upload */}
          <Col lg={8} mx="auto">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaImage className="me-2" />
                  About Us Banner Image
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Banner Image <span className="text-danger">*</span></Form.Label>
                  <div className="text-center">
                    {formData.bannerImage && (
                      <div className="mb-3">
                        <Image
                          src={formData.bannerImage}
                          alt="About Us Banner"
                          className="img-fluid rounded"
                          style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                        />
                      </div>
                    )}
                    
                    <div className="upload-section">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="mb-3"
                      />
                      <div className="text-center mb-3">
                        <span className="text-muted">OR</span>
                      </div>
                      <Form.Control
                        type="url"
                        placeholder="Enter image URL"
                        value={formData.bannerImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
                      />
                    </div>
                    
                    <Form.Text className="text-muted d-block mt-3">
                      <strong>Recommended specifications:</strong><br />
                      • Dimensions: 1920x400 pixels (or similar 16:3.3 ratio)<br />
                      • File formats: JPG, PNG, WebP<br />
                      • File size: Under 2MB for optimal loading<br />
                      • High contrast images work best with white text overlay
                    </Form.Text>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Preview Section */}
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">Banner Preview</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="position-relative" style={{ height: '300px', overflow: 'hidden' }}>
                  {formData.bannerImage ? (
                    <Image
                      src={formData.bannerImage}
                      alt="Banner Preview"
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                    >
                      <div className="text-center text-muted">
                        <FaImage size={60} className="mb-3" />
                        <p>Banner image preview will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Text overlay simulation */}
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-start text-white"
                    style={{ 
                      background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))',
                      padding: '0 5%'
                    }}
                  >
                    <h1 className="display-4 fw-bold mb-3">About Us</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                          <span className="text-white-50">Home</span>
                        </li>
                        <li className="breadcrumb-item active text-white" aria-current="page">
                          About Us
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
                <div className="p-3 bg-light">
                  <small className="text-muted">
                    <strong>Preview Note:</strong> This shows how your banner will appear on the About Us page with the title and breadcrumb overlay.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditAboutBanner;