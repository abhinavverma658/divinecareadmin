import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetTestimonialsDataMutation, useUpdateTestimonialsDataMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaQuoteLeft, FaPlus, FaTrash, FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const EditTestimonials = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getTestimonialsData, { isLoading: loadingTestimonials }] = useGetTestimonialsDataMutation();
  const [updateTestimonialsData, { isLoading: updateLoading }] = useUpdateTestimonialsDataMutation();
  
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    testimonials: [
      {
        id: 1,
        rating: 5,
        content: '',
        name: '',
        designation: '',
        profilePhoto: ''
      }
    ],
    isActive: true
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  const fetchTestimonialsData = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo testimonials data
        const demoData = {
          heading: 'Stories from the Heart',
          description: 'Long-term recovery requires sustainable livelihoods. We support individuals & families in rebuilding.',
          testimonials: [
            {
              id: 1,
              rating: 5,
              content: 'The support we received after the disaster was nothing short of life-changing. When everything we had was lost, the kindness and quick response from this organization.',
              name: 'Johnnie Lind',
              designation: 'Volunteer',
            },
          ],
          isActive: true
        };
        
        setFormData(demoData);
        return;
      }

      // Real API call for production
      const data = await getTestimonialsData().unwrap();
      if (data?.testimonialsData) {
        setFormData(data.testimonialsData);
      }
    } catch (error) {
      getError(error);
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

  const handleTestimonialChange = (testimonialId, field, value) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(testimonial => 
        testimonial.id === testimonialId 
          ? { ...testimonial, [field]: value }
          : testimonial
      )
    }));
    setHasChanges(true);
  };

  const addTestimonial = () => {
    const newId = Math.max(...formData.testimonials.map(t => t.id)) + 1;
    const newTestimonial = {
      id: newId,
      rating: 5,
      content: '',
      name: '',
      designation: '',
      profilePhoto: ''
    };
    
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
    setHasChanges(true);
  };

  const removeTestimonial = (testimonialId) => {
    if (formData.testimonials.length <= 1) {
      toast.error('At least one testimonial is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(testimonial => testimonial.id !== testimonialId)
    }));
    setHasChanges(true);
  };

  const renderStars = (rating, testimonialId) => {
    return (
      <div className="d-flex align-items-center mb-2">
        <label className="form-label me-2 mb-0">Rating:</label>
        {[1, 2, 3, 4, 5].map(star => (
          <FaStar
            key={star}
            size={20}
            className={`me-1 ${star <= rating ? 'text-warning' : 'text-muted'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => handleTestimonialChange(testimonialId, 'rating', star)}
          />
        ))}
        <span className="ms-2 small text-muted">({rating}/5)</span>
      </div>
    );
  };

  const isFormValid = () => {
    // Check section header
    if (!formData.heading.trim() || !formData.description.trim()) {
      return false;
    }
    
    // Check testimonials
    if (!formData.testimonials || formData.testimonials.length === 0) {
      return false;
    }
    
    // Check each testimonial has all required fields
    return formData.testimonials.every(testimonial => 
      testimonial.content && testimonial.content.trim() &&
      testimonial.name && testimonial.name.trim() &&
      testimonial.designation && testimonial.designation.trim()
    );
  };

  const validateForm = () => {
    if (!formData.heading.trim()) {
      toast.error('Section heading is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Section description is required');
      return false;
    }

    // Check if there's at least one testimonial
    if (!formData.testimonials || formData.testimonials.length === 0) {
      toast.error('At least one testimonial is required');
      return false;
    }

    // Validate each testimonial - all fields required
    for (let i = 0; i < formData.testimonials.length; i++) {
      const testimonial = formData.testimonials[i];
      
      if (!testimonial.content || !testimonial.content.trim()) {
        toast.error(`Testimonial content is required for testimonial ${i + 1}`);
        return false;
      }
      
      if (!testimonial.name || !testimonial.name.trim()) {
        toast.error(`Name is required for testimonial ${i + 1}`);
        return false;
      }
      
      if (!testimonial.designation || !testimonial.designation.trim()) {
        toast.error(`Designation is required for testimonial ${i + 1}`);
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
        toast.success('Testimonial section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Real API call
      const data = await updateTestimonialsData(formData).unwrap();
      toast.success(data?.message || 'Testimonial section updated successfully!');
      navigate('/dash/homepage');
    } catch (error) {
      getError(error);
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
              <span style={{ color: 'var(--dark-color)' }}>Edit Testimonial Section</span>
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
              {updateLoading ? 'Saving...' : 'Save Testimonial Section'}
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={12}>
            {/* Required Fields Notice */}
            <Alert variant="info" className="mb-4">
              <div className="d-flex align-items-center">
                <FaQuoteLeft className="me-2" />
                <div>
                  <strong>All testimonial fields are required.</strong> Please fill in section details and all testimonial information.
                  <div className="small mt-1">Fields marked with <span className="text-danger">*</span> are mandatory.</div>
                </div>
              </div>
            </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Section Header */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaQuoteLeft className="me-2" />
                    Section Header
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heading"
                        label="Section Heading *"
                        value={formData.heading}
                        onChange={handleInputChange}
                        placeholder="e.g., Stories from the Heart"
                        required={true}
                        maxLength={30}
                      />
                      <small className="text-muted">{formData.heading.length}/30 characters</small>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="description"
                        label="Section Description *"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter the section description..."
                        rows={3}
                        required={true}
                        maxLength={130}
                      />
                      <small className="text-muted">{formData.description.length}/130 characters</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Testimonials */}
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Testimonials ({formData.testimonials.length})</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addTestimonial}
                  >
                    <FaPlus className="me-1" />
                    Add Testimonial
                  </Button>
                </Card.Header>
                <Card.Body>
                  {formData.testimonials.map((testimonial, index) => (
                    <Card key={testimonial.id} className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <h6 className="mb-0">
                            Testimonial {index + 1}
                            {testimonial.name && (
                              <span className="text-muted ms-2">- {testimonial.name}</span>
                            )}
                          </h6>
                        </div>
                        <div className="d-flex align-items-center">
                          {formData.testimonials.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeTestimonial(testimonial.id)}
                              title="Delete testimonial"
                              className="ms-2"
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={12}>
                            {renderStars(testimonial.rating, testimonial.id)}
                          </Col>
                          <Col md={12}>
                            <FormField
                              type="textarea"
                              name={`testimonial_${testimonial.id}_content`}
                              label="Testimonial Content *"
                              value={testimonial.content}
                              onChange={(e) => handleTestimonialChange(testimonial.id, 'content', e.target.value)}
                              placeholder="Enter the testimonial content..."
                              rows={3}
                              required={true}
                              maxLength={167}
                            />
                            <small className="text-muted">{testimonial.content.length}/167 characters</small>
                          </Col>
                          <Col md={6}>
                            <FormField
                              type="text"
                              name={`testimonial_${testimonial.id}_name`}
                              label="Name *"
                              value={testimonial.name}
                              onChange={(e) => handleTestimonialChange(testimonial.id, 'name', e.target.value)}
                              placeholder="Enter person's name..."
                              required={true}
                            />
                          </Col>
                          <Col md={6}>
                            <FormField
                              type="text"
                              name={`testimonial_${testimonial.id}_designation`}
                              label="Designation *"
                              value={testimonial.designation}
                              onChange={(e) => handleTestimonialChange(testimonial.id, 'designation', e.target.value)}
                              placeholder="e.g., Volunteer, Client, etc."
                              required={true}
                            />
                          </Col>
                          <Col md={12}>
                            <FormField
                              type="image"
                              name={`testimonial_${testimonial.id}_profilePhoto`}
                              value={testimonial.profilePhoto}
                              onChange={(e) => handleTestimonialChange(testimonial.id, 'profilePhoto', e.target.value)}
                              placeholder="Upload profile photo..."
                              required={true}
                            />
                            {testimonial.profilePhoto && (
                              <div className="mt-2">
                                <img
                                  src={testimonial.profilePhoto}
                                  alt="Profile Preview"
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    border: '2px solid #ddd'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default EditTestimonials;