import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaStar, FaRegStar, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditTestimonialSection = () => {
  const [formData, setFormData] = useState({
    // Left side - Multiple Testimonials
    testimonials: [
      {
        id: 1,
        profileImage: '',
        starRating: 5,
        name: '',
        role: '',
        content: ''
      }
    ],
    // Right side - Content
    sectionHeading: '',
    sectionDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using existing About Us endpoints
  const [getAboutUsData] = useGetAboutUsDataMutation();
  const [updateAboutUsData] = useUpdateAboutUsDataMutation();

  // Demo data for testing
  const demoData = {
    testimonials: [
      {
        id: 1,
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/sharon-mcclure.jpg',
        starRating: 5,
        name: 'Sharon McClure',
        role: 'Volunteer',
        content: '"Through their words, we\'re reminded that a legacy isn\'t just something you leave behind it\'s something you create every day inspiring all generations to follow in their footsteps."'
      },
      {
        id: 2,
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/john-doe.jpg',
        starRating: 4,
        name: 'John Doe',
        role: 'Community Leader',
        content: '"The impact this organization has made in our community is truly remarkable. They have brought hope and positive change to countless lives."'
      },
      {
        id: 3,
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/mary-smith.jpg',
        starRating: 5,
        name: 'Mary Smith',
        role: 'Beneficiary',
        content: '"Thanks to their support, I was able to rebuild my life and give back to others in need. Their compassion knows no bounds."'
      }
    ],
    sectionHeading: 'Lifelong Lessons: Stories from Our Elders',
    sectionDescription: 'Our seniors are heart of our community, each one with a unique story and a lifetime of experiences that inspire us daily. Their testimonials speak to the resilience, kindness, and courage.',
    ctaButtonText: 'Learn More',
    ctaButtonLink: '/testimonials',
    stat1Number: '569 +',
    stat1Label: 'Satisfied Clients',
    stat2Number: '12 +',
    stat2Label: 'Years of Experience'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
    } else {
      fetchTestimonialData();
    }
  }, []);

  const fetchTestimonialData = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsData().unwrap();
      if (response?.data) {
        setFormData({
          testimonials: response.data.testimonials || [
            {
              id: 1,
              profileImage: '',
              starRating: 5,
              name: '',
              role: '',
              content: ''
            }
          ],
          sectionHeading: response.data.testimonialSectionHeading || '',
          sectionDescription: response.data.testimonialSectionDescription || '',
          ctaButtonText: response.data.testimonialCtaButtonText || '',
          ctaButtonLink: response.data.testimonialCtaButtonLink || '',
          stat1Number: response.data.testimonialStat1Number || '',
          stat1Label: response.data.testimonialStat1Label || '',
          stat2Number: response.data.testimonialStat2Number || '',
          stat2Label: response.data.testimonialStat2Label || ''
        });
      }
    } catch (error) {
      console.error('Error fetching testimonial data:', error);
      toast.error('Failed to load testimonial data');
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

  const handleImageUpload = (testimonialId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(testimonial =>
            testimonial.id === testimonialId
              ? { ...testimonial, profileImage: e.target.result }
              : testimonial
          )
        }));
      };
      reader.readAsDataURL(file);
    }
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
  };

  const handleStarRating = (testimonialId, rating) => {
    handleTestimonialChange(testimonialId, 'starRating', rating);
  };

  const addTestimonial = () => {
    const newId = Math.max(...formData.testimonials.map(t => t.id)) + 1;
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, {
        id: newId,
        profileImage: '',
        starRating: 5,
        name: '',
        role: '',
        content: ''
      }]
    }));
  };

  const removeTestimonial = (testimonialId) => {
    if (formData.testimonials.length > 1) {
      setFormData(prev => ({
        ...prev,
        testimonials: prev.testimonials.filter(testimonial => testimonial.id !== testimonialId)
      }));
    } else {
      toast.error('At least one testimonial is required');
    }
  };

  const renderStars = (rating, interactive = false, testimonialId = null) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      return (
        <span
          key={starIndex}
          className={interactive ? 'cursor-pointer' : ''}
          onClick={interactive && testimonialId ? () => handleStarRating(testimonialId, starIndex) : undefined}
        >
          {starIndex <= rating ? (
            <FaStar className="text-warning" />
          ) : (
            <FaRegStar className="text-muted" />
          )}
        </span>
      );
    });
  };

  const validateForm = () => {
    const errors = [];
    
    // Section validation
    if (!formData.sectionHeading.trim()) errors.push('Section heading is required');
    if (!formData.sectionDescription.trim()) errors.push('Section description is required');
    if (!formData.ctaButtonText.trim()) errors.push('CTA button text is required');
    if (!formData.ctaButtonLink.trim()) errors.push('CTA button link is required');
    if (!formData.stat1Number.trim()) errors.push('Statistic 1 number is required');
    if (!formData.stat1Label.trim()) errors.push('Statistic 1 label is required');
    if (!formData.stat2Number.trim()) errors.push('Statistic 2 number is required');
    if (!formData.stat2Label.trim()) errors.push('Statistic 2 label is required');

    // Testimonials validation
    formData.testimonials.forEach((testimonial, index) => {
      if (!testimonial.name.trim()) errors.push(`Testimonial ${index + 1} name is required`);
      if (!testimonial.role.trim()) errors.push(`Testimonial ${index + 1} role is required`);
      if (!testimonial.content.trim()) errors.push(`Testimonial ${index + 1} content is required`);
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
      toast.success('Testimonial Section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateAboutUsData(formData).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Testimonial Section updated successfully!');
      }
    } catch (error) {
      console.error('Error updating testimonial data:', error);
      toast.error(error?.data?.message || 'Failed to update testimonial section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading testimonial data...</p>
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
            <h2 className="mb-1">Edit Testimonial Section</h2>
            <p className="text-muted mb-0">Manage the testimonial section with profile and content</p>
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
            form="testimonialForm"
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
                Save Testimonial
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="testimonialForm" onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Testimonials */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Testimonials (Left Side)</h5>
                <Button
                  variant="light"
                  size="sm"
                  onClick={addTestimonial}
                  className="d-flex align-items-center"
                >
                  <FaPlus className="me-1" />
                  Add Testimonial
                </Button>
              </Card.Header>
              <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {formData.testimonials.map((testimonial, index) => (
                  <Card key={testimonial.id} className="mb-3 border">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
                      <h6 className="mb-0">Testimonial {index + 1}</h6>
                      {formData.testimonials.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeTestimonial(testimonial.id)}
                          className="d-flex align-items-center"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body>
                      {/* Profile Image */}
                      <Form.Group className="mb-3">
                        <Form.Label>Profile Picture</Form.Label>
                        <div className="text-center">
                          {testimonial.profileImage && (
                            <Image
                              src={testimonial.profileImage}
                              alt="Profile"
                              className="rounded-circle mb-3"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                          )}
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(testimonial.id, e.target.files[0])}
                            className="mb-2"
                          />
                        </div>
                      </Form.Group>

                      {/* Star Rating */}
                      <Form.Group className="mb-3">
                        <Form.Label>Star Rating <span className="text-danger">*</span></Form.Label>
                        <div className="d-flex align-items-center gap-2">
                          {renderStars(testimonial.starRating, true, testimonial.id)}
                          <span className="ms-2 text-muted">({testimonial.starRating}/5)</span>
                        </div>
                      </Form.Group>

                      {/* Name */}
                      <Form.Group className="mb-3">
                        <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => handleTestimonialChange(testimonial.id, 'name', e.target.value)}
                          placeholder="Enter person's name"
                          required
                        />
                      </Form.Group>

                      {/* Role */}
                      <Form.Group className="mb-3">
                        <Form.Label>Role/Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={testimonial.role}
                          onChange={(e) => handleTestimonialChange(testimonial.id, 'role', e.target.value)}
                          placeholder="Enter role (e.g., Volunteer)"
                          required
                        />
                      </Form.Group>

                      {/* Testimonial Content */}
                      <Form.Group className="mb-3">
                        <Form.Label>Testimonial Content <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={testimonial.content}
                          onChange={(e) => handleTestimonialChange(testimonial.id, 'content', e.target.value)}
                          placeholder="Enter testimonial quote"
                          required
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

         
              </Row>
              <Row>
                   {/* Right Column - Section Content */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Section Content (Right Side)</h5>
              </Card.Header>
              <Card.Body>
                {/* Section Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Section Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="sectionHeading"
                    value={formData.sectionHeading}
                    onChange={handleChange}
                    placeholder="Enter section heading"
                    required
                  />
                </Form.Group>

                {/* Section Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Section Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="sectionDescription"
                    value={formData.sectionDescription}
                    onChange={handleChange}
                    placeholder="Enter section description"
                    required
                  />
                </Form.Group>

                {/* Statistics */}
                <h6 className="mb-3">Statistics</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Stat 1 Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat1Number"
                        value={formData.stat1Number}
                        onChange={handleChange}
                        placeholder="e.g., 569 +"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Stat 1 Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat1Label"
                        value={formData.stat1Label}
                        onChange={handleChange}
                        placeholder="e.g., Satisfied Clients"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Stat 2 Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat2Number"
                        value={formData.stat2Number}
                        onChange={handleChange}
                        placeholder="e.g., 12 +"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Stat 2 Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat2Label"
                        value={formData.stat2Label}
                        onChange={handleChange}
                        placeholder="e.g., Years of Experience"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
              </Row>
      </Form>
    </Container>
  );
};

export default EditTestimonialSection;

// Add custom styles
const styles = `
  .cursor-pointer {
    cursor: pointer;
  }
  
  .testimonials-container .card {
    transition: all 0.3s ease;
  }
  
  .testimonials-container .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;