import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaMapMarkerAlt, FaHeading, FaAlignLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetContactPageDataMutation, useUpdateContactPageDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditContactPage = () => {
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    mapLink: '',
    // Call Us Today section
    serviceTitle: '',
    serviceSubtitle: '',
    phone1: '',
    phone2: '',
    // Mail Information section
    emailTitle: '',
    emailSubtitle: '',
    email1: '',
    email2: '',
    // Our Location section
    addressTitle: '',
    addressSubtitle: '',
    fullAddress: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using existing pattern
  const [getContactPageData] = useGetContactPageDataMutation();
  const [updateContactPageData] = useUpdateContactPageDataMutation();

  // Demo data for testing
  const demoData = {
    heading: 'Get in Touch with Us',
    description: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.148514808389!2d90.3647!3d23.8103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM3LjEiTiA5MMKwMjEnNTMuMCJF!5e0!3m2!1sen!2sbd!4v1635784234567!5m2!1sen!2sbd',
    // Call Us Today section
    serviceTitle: '24/7 Service',
    serviceSubtitle: 'Call Us Today',
    phone1: '+00 123 456 789',
    phone2: '+00 987 654 321',
    // Mail Information section
    emailTitle: 'Drop Line',
    emailSubtitle: 'Mail Information',
    email1: 'info@charity.com',
    email2: 'Infocharity@gmail.com',
    // Our Location section
    addressTitle: 'Address',
    addressSubtitle: 'Our Location',
    fullAddress: '8708 Technology Forest Pl Suite 125-G, The Woodlands, TX 77381'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
    } else {
      fetchContactPageData();
    }
  }, []);

  const fetchContactPageData = async () => {
    try {
      setIsLoading(true);
      const response = await getContactPageData().unwrap();
      if (response?.data) {
        setFormData({
          heading: response.data.contactHeading || '',
          description: response.data.contactDescription || '',
          mapLink: response.data.contactMapLink || '',
          // Call Us Today section
          serviceTitle: response.data.serviceTitle || '',
          serviceSubtitle: response.data.serviceSubtitle || '',
          phone1: response.data.phone1 || '',
          phone2: response.data.phone2 || '',
          // Mail Information section
          emailTitle: response.data.emailTitle || '',
          emailSubtitle: response.data.emailSubtitle || '',
          email1: response.data.email1 || '',
          email2: response.data.email2 || '',
          // Our Location section
          addressTitle: response.data.addressTitle || '',
          addressSubtitle: response.data.addressSubtitle || '',
          fullAddress: response.data.fullAddress || ''
        });
      }
    } catch (error) {
      console.error('Error fetching contact page data:', error);
      toast.error('Failed to load contact page data');
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 60) {
      newErrors.heading = 'Heading must be 60 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    if (formData.mapLink && !formData.mapLink.includes('maps') && !formData.mapLink.includes('embed')) {
      newErrors.mapLink = 'Please enter a valid Google Maps embed URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return formData.heading.trim() && formData.description.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (isDemoMode) {
      toast.success('Contact page updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await updateContactPageData({
        contactHeading: formData.heading,
        contactDescription: formData.description,
        contactMapLink: formData.mapLink,
        // Call Us Today section
        serviceTitle: formData.serviceTitle,
        serviceSubtitle: formData.serviceSubtitle,
        phone1: formData.phone1,
        phone2: formData.phone2,
        // Mail Information section
        emailTitle: formData.emailTitle,
        emailSubtitle: formData.emailSubtitle,
        email1: formData.email1,
        email2: formData.email2,
        // Our Location section
        addressTitle: formData.addressTitle,
        addressSubtitle: formData.addressSubtitle,
        fullAddress: formData.fullAddress
      }).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Contact page updated successfully!');
      }
    } catch (error) {
      console.error('Error updating contact page:', error);
      toast.error(error?.data?.message || 'Failed to update contact page');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading contact page data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link 
            to="/dash/queries" 
            className="btn btn-outline-secondary me-3 d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" />
            Back to Queries
          </Link>
          <div>
            <h2 className="mb-1">Edit Contact Us Page</h2>
            <p className="text-muted mb-0">Manage the contact page content and information</p>
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
            form="contactPageForm"
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="contactPageForm" onSubmit={handleSubmit}>
        <Row>
          {/* Main Content */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaHeading className="me-2" />
                  Page Content
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Page Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    placeholder="Enter contact page heading"
                    isInvalid={!!errors.heading}
                    maxLength={60}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.heading}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.heading.length}/60 characters
                  </Form.Text>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Page Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter contact page description"
                    isInvalid={!!errors.description}
                    maxLength={200}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.description.length}/200 characters
                  </Form.Text>
                </Form.Group>

                {/* Map Link */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    Google Maps Embed Link
                  </Form.Label>
                  <Form.Control
                    type="url"
                    name="mapLink"
                    value={formData.mapLink}
                    onChange={handleChange}
                    placeholder="Enter Google Maps embed URL"
                    isInvalid={!!errors.mapLink}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mapLink}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Get embed code from Google Maps → Share → Embed a map
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Contact Information Row */}
        <Row>
          {/* Call Us Today Section */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  📞 Call Us Today
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Service Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceTitle"
                    value={formData.serviceTitle}
                    onChange={handleChange}
                    placeholder="e.g., 24/7 Service"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Service Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceSubtitle"
                    value={formData.serviceSubtitle}
                    onChange={handleChange}
                    placeholder="e.g., Call Us Today"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number 1</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={handleChange}
                    placeholder="+00 123 456 789"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number 2</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleChange}
                    placeholder="+00 987 654 321"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Mail Information Section */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  ✉️ Mail Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Email Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="emailTitle"
                    value={formData.emailTitle}
                    onChange={handleChange}
                    placeholder="e.g., Drop Line"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    name="emailSubtitle"
                    value={formData.emailSubtitle}
                    onChange={handleChange}
                    placeholder="e.g., Mail Information"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address 1</Form.Label>
                  <Form.Control
                    type="email"
                    name="email1"
                    value={formData.email1}
                    onChange={handleChange}
                    placeholder="info@charity.com"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address 2</Form.Label>
                  <Form.Control
                    type="email"
                    name="email2"
                    value={formData.email2}
                    onChange={handleChange}
                    placeholder="Infocharity@gmail.com"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Our Location Section */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                  📍 Our Location
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Address Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressTitle"
                    value={formData.addressTitle}
                    onChange={handleChange}
                    placeholder="e.g., Address"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address Subtitle</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressSubtitle"
                    value={formData.addressSubtitle}
                    onChange={handleChange}
                    placeholder="e.g., Our Location"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Full Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>


        </Row>


      </Form>
    </Container>
  );
};

export default EditContactPage;