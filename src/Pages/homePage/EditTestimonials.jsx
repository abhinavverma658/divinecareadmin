import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetTestimonialsDataMutation, useCreateTestimonialMutation, useUpdateTestimonialsByIdMutation, useDeleteTestimonialsByIdMutation } from '../../features/apiSlice';
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
  const [createTestimonial, { isLoading: creating }] = useCreateTestimonialMutation();
  const [updateTestimonialsById, { isLoading: updateLoading }] = useUpdateTestimonialsByIdMutation();
  const [deleteTestimonialsById, { isLoading: deleting }] = useDeleteTestimonialsByIdMutation();
  
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
      console.log('🔄 Fetching testimonials data...');
      
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        console.log('📊 Using demo mode');
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
      const response = await getTestimonialsData().unwrap();
      console.log('📥 Raw API response:', response);

      // Handle the new response format from backend
      let testimonialsData = null;
      
      // The response might be wrapped in { data: ... }
      const data = response.data || response;
      console.log('📋 Processed data:', data);
      
      // Handle the specific backend structure: { success: true, section: { ... } }
      if (data.success && data.section) {
        const section = data.section;
        testimonialsData = {
          heading: section.sectionHeading || 'Client Testimonials',
          description: section.sectionDescription || 'Client testimonials and feedback',
          testimonials: (section.testimonials || []).map((testimonial, index) => ({
            id: testimonial._id || testimonial.id || index + 1,
            rating: testimonial.rating || 5,
            content: testimonial.content || '',
            name: testimonial.name || '',
            designation: testimonial.designation || '',
            profilePhoto: testimonial.image || testimonial.profilePhoto || ''
          })),
          isActive: true
        };
      }
      // Handle fallback structures
      else if (data.testimonialsData) {
        testimonialsData = data.testimonialsData;
      } else if (data.testimonials || data.heading || data.description) {
        testimonialsData = data;
      } else if (Array.isArray(data)) {
        // If it's just an array of testimonials
        testimonialsData = {
          heading: 'Stories from the Heart',
          description: 'Client testimonials and feedback',
          testimonials: data.map((item, index) => ({
            ...item,
            id: item.id || item._id || index + 1,
            profilePhoto: item.image || item.profilePhoto || ''
          })),
          isActive: true
        };
      } else {
        // Use fallback data structure
        testimonialsData = {
          heading: 'Stories from the Heart',
          description: 'Client testimonials and feedback',
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
        };
      }

      // Ensure testimonials array exists and has proper structure
      if (!testimonialsData.testimonials || !Array.isArray(testimonialsData.testimonials)) {
        testimonialsData.testimonials = [
          {
            id: 1,
            rating: 5,
            content: '',
            name: '',
            designation: '',
            profilePhoto: ''
          }
        ];
      }

      // Ensure each testimonial has required fields and normalize field names
      testimonialsData.testimonials = testimonialsData.testimonials.map((testimonial, index) => ({
        id: testimonial.id || testimonial._id || index + 1,
        rating: testimonial.rating || 5,
        content: testimonial.content || '',
        name: testimonial.name || '',
        designation: testimonial.designation || '',
        profilePhoto: testimonial.image || testimonial.profilePhoto || ''
      }));

      console.log('✅ Final testimonials data:', testimonialsData);
      setFormData(testimonialsData);

    } catch (error) {
      console.error('❌ Error fetching testimonials:', error);
      getError(error);
      
      // Set fallback data on error
      setFormData({
        heading: 'Stories from the Heart',
        description: 'Client testimonials and feedback',
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
    console.log('🔄 Updating testimonial:', { testimonialId, field, value });
    
    setFormData(prev => {
      const updatedTestimonials = prev.testimonials.map(testimonial => 
        testimonial.id === testimonialId 
          ? { ...testimonial, [field]: value }
          : testimonial
      );
      
      const updatedData = {
        ...prev,
        testimonials: updatedTestimonials
      };
      
      console.log('✅ Updated testimonial data:', updatedData);
      return updatedData;
    });
    setHasChanges(true);
  };

  const addTestimonial = () => {
    // Generate a truly unique ID using timestamp + random number
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newTestimonial = {
      id: newId,
      rating: 5,
      content: '',
      name: '',
      designation: '',
      profilePhoto: ''
    };
    
    console.log('🔄 Adding new testimonial:', newTestimonial);
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        testimonials: [...prev.testimonials, newTestimonial]
      };
      console.log('✅ Updated formData:', updatedData);
      return updatedData;
    });
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
    // Check hheader
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
      console.log('🔄 Submitting testimonials data:', formData);
      
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        toast.success('Testimonial section updated successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // Transform data to match backend expected format
      const backendData = {
        sectionHeading: formData.heading,
        sectionDescription: formData.description,
        testimonials: formData.testimonials.map(testimonial => ({
          _id: testimonial.id !== 1 ? testimonial.id : undefined, // Don't send _id for new items
          rating: testimonial.rating,
          content: testimonial.content,
          name: testimonial.name,
          designation: testimonial.designation,
          image: testimonial.profilePhoto
        })),
        isActive: formData.isActive
      };

      console.log('📤 Sending backend data:', backendData);

      // Real API call - update the canonical testimonials document on the backend
      const id = '68f0f57e8514acf4a6b66b99';
      const response = await updateTestimonialsById({ id, data: backendData }).unwrap();
      
      console.log('✅ Update response:', response);
      
      // Handle response data
      const result = response.data || response;
      const message = result?.message || 'Testimonial section updated successfully!';
      
      toast.success(message);
      setHasChanges(false);
      navigate('/dash/homepage');
    } catch (error) {
      console.error('❌ Submit error:', error);
      getError(error);
    }
  };

  const handleCreate = async () => {
    try {
      console.log('🔄 Creating testimonial:', formData);
      if (token && token.startsWith("demo-token")) {
        toast.success('Testimonial created successfully! (Demo Mode)');
        setHasChanges(false);
        return;
      }
      // Only create one testimonial at a time (the last one added)
      const lastTestimonial = formData.testimonials[formData.testimonials.length - 1];
      const backendData = {
        rating: lastTestimonial.rating,
        content: lastTestimonial.content,
        name: lastTestimonial.name,
        designation: lastTestimonial.designation,
        image: lastTestimonial.profilePhoto
      };
      console.log('📤 Creating with backend data:', backendData);
      const response = await createTestimonial(backendData).unwrap();
      console.log('✅ Create response:', response);
      const result = response.data || response;
      const message = result?.message || 'Testimonial created successfully!';
      toast.success(message);
      setHasChanges(false);
      // Refresh data after creation
      fetchTestimonialsData();
    } catch (error) {
      console.error('❌ Create error:', error);
      getError(error);
    }
  };

  const handleDeleteSection = async () => {
    const confirmDelete = window.confirm('Delete the testimonials section from backend? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      console.log('🔄 Deleting testimonials section...');
      
      if (token && token.startsWith("demo-token")) {
        toast.success('Testimonial section deleted successfully! (Demo Mode)');
        setFormData({
          heading: '',
          description: '',
          testimonials: [
            { id: 1, rating: 5, content: '', name: '', designation: '', profilePhoto: '' }
          ],
          isActive: false
        });
        setHasChanges(false);
        return;
      }
      
      const id = '68e6a7051da9fcca3f194a7b';
      const response = await deleteTestimonialsById(id).unwrap();
      
      console.log('✅ Delete response:', response);
      
      const result = response.data || response;
      const message = result?.message || 'Testimonial section deleted successfully!';
      
      toast.success(message);
      setFormData({
        heading: '',
        description: '',
        testimonials: [
          { id: 1, rating: 5, content: '', name: '', designation: '', profilePhoto: '' }
        ],
        isActive: false
      });
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Delete error:', error);
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
          <div className="d-flex gap-2 align-items-center">
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
                        maxLength={90}
                      />
                      <small className="text-muted">{formData.heading.length}/90 characters</small>
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
                        maxLength={225}
                      />
                      <small className="text-muted">{formData.description.length}/225 characters</small>
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
                  {formData.testimonials.map((testimonial, index) => {
                    console.log('🎨 Rendering testimonial:', { index, testimonial });
                    const isTestimonialValid = testimonial.content && testimonial.content.trim() && testimonial.name && testimonial.name.trim() && testimonial.designation && testimonial.designation.trim();
                    const handleSaveTestimonial = async () => {
                      if (!isTestimonialValid) {
                        toast.error('Please fill all required fields for this testimonial before saving.');
                        return;
                      }
                      try {
                        const backendData = {
                          rating: testimonial.rating,
                          content: testimonial.content,
                          name: testimonial.name,
                          designation: testimonial.designation,
                          image: testimonial.profilePhoto
                        };
                        console.log('📤 Saving individual testimonial:', backendData);
                        const response = await createTestimonial(backendData).unwrap();
                        const result = response.data || response;
                        const message = result?.message || 'Testimonial created successfully!';
                        toast.success(message);
                        setHasChanges(false);
                        fetchTestimonialsData();
                      } catch (error) {
                        console.error('❌ Error saving testimonial:', error);
                        getError(error);
                      }
                    };
                    return (
                      <Card key={`testimonial-${testimonial.id}-${index}`} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <div className="grow">
                            <h6 className="mb-0">
                              Testimonial {index + 1}
                              {testimonial.name && (
                                <span className="text-muted ms-2">- {testimonial.name}</span>
                              )}
                            </h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              onClick={handleSaveTestimonial}
                              disabled={creating || !isTestimonialValid}
                              title="Save testimonial"
                            >
                              <FaSave className="me-1" />
                              {creating ? 'Saving...' : 'Save'}
                            </Button>
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
                                value={testimonial.content || ''}
                                onChange={(e) => {
                                  console.log('📝 Content field change:', { 
                                    id: testimonial.id, 
                                    value: e.target.value,
                                    currentContent: testimonial.content 
                                  });
                                  handleTestimonialChange(testimonial.id, 'content', e.target.value);
                                }}
                                placeholder="Enter the testimonial content..."
                                rows={3}
                                required={true}
                                maxLength={167}
                              />
                              <small className="text-muted">{(testimonial.content || '').length}/167 characters</small>
                            </Col>
                            <Col md={6}>
                              <FormField
                                type="text"
                                name={`testimonial_${testimonial.id}_name`}
                                label="Name *"
                                value={testimonial.name || ''}
                                onChange={(e) => {
                                  console.log('📝 Name field change:', { 
                                    id: testimonial.id, 
                                    value: e.target.value,
                                    currentName: testimonial.name 
                                  });
                                  handleTestimonialChange(testimonial.id, 'name', e.target.value);
                                }}
                                placeholder="Enter person's name..."
                                required={true}
                              />
                            </Col>
                            <Col md={6}>
                              <FormField
                                type="text"
                                name={`testimonial_${testimonial.id}_designation`}
                                label="Designation *"
                                value={testimonial.designation || ''}
                                onChange={(e) => {
                                  console.log('📝 Designation field change:', { 
                                    id: testimonial.id, 
                                    value: e.target.value,
                                    currentDesignation: testimonial.designation 
                                  });
                                  handleTestimonialChange(testimonial.id, 'designation', e.target.value);
                                }}
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
                    );
                  })}
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