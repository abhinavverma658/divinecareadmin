import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaUpload, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditMainAboutSection = () => {
  const [formData, setFormData] = useState({
    heading: '',
    smallDescription: '',
    leftImage1: '',
    leftImage2: '',
    rightImage: '',
    description: '',
    keyPoints: ['', '', '']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations
  const [getAboutUsData] = useGetAboutUsDataMutation();
  const [updateAboutUsData] = useUpdateAboutUsDataMutation();

  // Demo data for testing
  const demoData = {
    heading: 'About SAYV Financial Services',
    smallDescription: 'Empowering your financial future with expert guidance and personalized solutions',
    leftImage1: 'https://creative-story.s3.amazonaws.com/about/about-image-1.jpg',
    leftImage2: 'https://creative-story.s3.amazonaws.com/about/about-image-2.jpg',
    rightImage: 'https://creative-story.s3.amazonaws.com/about/about-main-image.jpg',
    description: 'At SAYV, we believe that everyone deserves access to professional financial guidance. Our team of experienced advisors is committed to helping you navigate the complexities of financial planning, investment management, and wealth building. With over a decade of experience in the financial services industry, we have helped thousands of clients achieve their financial goals and secure their future.',
    keyPoints: [
      'Personalized financial planning tailored to your unique goals and circumstances',
      'Expert investment management with a focus on long-term growth and risk management',
      'Comprehensive retirement planning to ensure a comfortable and secure future'
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
    } else {
      fetchAboutUsData();
    }
  }, []);

  const fetchAboutUsData = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsData().unwrap();
      if (response?.data) {
        setFormData({
          heading: response.data.heading || '',
          smallDescription: response.data.smallDescription || '',
          leftImage1: response.data.leftImage1 || '',
          leftImage2: response.data.leftImage2 || '',
          rightImage: response.data.rightImage || '',
          description: response.data.description || '',
          keyPoints: response.data.keyPoints || ['', '', '']
        });
      }
    } catch (error) {
      console.error('Error fetching about us data:', error);
      toast.error('Failed to load about us data');
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

  const handleKeyPointChange = (index, value) => {
    const updatedKeyPoints = [...formData.keyPoints];
    updatedKeyPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      keyPoints: updatedKeyPoints
    }));
  };

  const handleImageUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.heading.trim()) errors.push('Heading is required');
    if (formData.heading.length > 25) errors.push('Heading must be 25 characters or less');
    if (!formData.smallDescription.trim()) errors.push('Small description is required');
    if (formData.smallDescription.length > 130) errors.push('Small description must be 130 characters or less');
    if (!formData.leftImage1) errors.push('Left image 1 is required');
    if (!formData.leftImage2) errors.push('Left image 2 is required');
    if (!formData.rightImage) errors.push('Right image is required');
    if (!formData.description.trim()) errors.push('Description is required');
    
    // Check if all key points are filled
    formData.keyPoints.forEach((point, index) => {
      if (!point.trim()) errors.push(`Key point ${index + 1} is required`);
    });

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
      toast.success('About Us section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateAboutUsData(formData).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('About Us section updated successfully!');
      }
    } catch (error) {
      console.error('Error updating about us data:', error);
      toast.error(error?.data?.message || 'Failed to update about us section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading about us data...</p>
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
            <h2 className="mb-1">Edit Main About Section</h2>
            <p className="text-muted mb-0">Manage the main about us section content</p>
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
            form="aboutUsForm"
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
                Save About Section
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="aboutUsForm" onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Basic Information */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Basic Information</h5>
              </Card.Header>
              <Card.Body>
                {/* Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    placeholder="Enter heading"
                    maxLength={25}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.heading.length}/25 characters
                  </Form.Text>
                </Form.Group>

                {/* Small Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Small Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="smallDescription"
                    value={formData.smallDescription}
                    onChange={handleChange}
                    placeholder="Enter small description"
                    maxLength={130}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.smallDescription.length}/130 characters
                  </Form.Text>
                </Form.Group>

                {/* Main Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Main Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description"
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Images */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Images</h5>
              </Card.Header>
              <Card.Body>
                {/* Left Images Row */}
                <Row className="mb-4">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Left Image 1 <span className="text-danger">*</span></Form.Label>
                      <div className="text-center">
                        {formData.leftImage1 && (
                          <Image
                            src={formData.leftImage1}
                            alt="Left Image 1"
                            className="img-fluid rounded mb-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('leftImage1', e.target.files[0])}
                          className="mb-2"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Left Image 2 <span className="text-danger">*</span></Form.Label>
                      <div className="text-center">
                        {formData.leftImage2 && (
                          <Image
                            src={formData.leftImage2}
                            alt="Left Image 2"
                            className="img-fluid rounded mb-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('leftImage2', e.target.files[0])}
                          className="mb-2"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Right Image */}
                <Form.Group>
                  <Form.Label>Right Main Image <span className="text-danger">*</span></Form.Label>
                  <div className="text-center">
                    {formData.rightImage && (
                      <Image
                        src={formData.rightImage}
                        alt="Right Main Image"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('rightImage', e.target.files[0])}
                      className="mb-2"
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Key Points Section */}
        <Row>
          <Col xs={12}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">Key Points</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted mb-3">Add three key points that highlight your main features or benefits</p>
                {formData.keyPoints.map((point, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>Key Point {index + 1} <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={point}
                      onChange={(e) => handleKeyPointChange(index, e.target.value)}
                      placeholder={`Enter key point ${index + 1}`}
                      required
                    />
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditMainAboutSection;