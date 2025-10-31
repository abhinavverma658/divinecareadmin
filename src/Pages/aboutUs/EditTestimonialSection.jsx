import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaStar, FaRegStar, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { 
  useGetAboutTestimonialsMutation, 
  useUpdateAboutTestimonialsSectionMutation,
  useCreateAboutTestimonialMutation,
  useUpdateAboutTestimonialMutation,
  useDeleteAboutTestimonialMutation
} from '../../features/apiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const EditTestimonialSection = () => {
  const { token } = useSelector(selectAuth);
  
  const [formData, setFormData] = useState({
    _id: null, // Backend section ID
    // Left side - Multiple Testimonials
    testimonials: [
      {
        id: 1,
        _id: null, // Backend testimonial ID
        profileImage: '',
        starRating: 5,
        name: '',
        role: '',
        content: '',
        isNew: true, // Track if this is a new testimonial
        isSaving: false, // Track saving state
        isEditing: false // Track if testimonial is in edit mode
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
  const [savedTestimonials, setSavedTestimonials] = useState([]);
  
  // API mutations - using new About Us testimonials endpoints
  const [getAboutTestimonials] = useGetAboutTestimonialsMutation();
  const [updateAboutTestimonialsSection] = useUpdateAboutTestimonialsSectionMutation();
  const [createAboutTestimonial] = useCreateAboutTestimonialMutation();
  const [updateAboutTestimonial] = useUpdateAboutTestimonialMutation();
  const [deleteAboutTestimonial] = useDeleteAboutTestimonialMutation();

  // Demo data for testing
  const demoData = {
    _id: 'demo-about-testimonials-section',
    testimonials: [
      {
        id: 1,
        _id: 'demo-testimonial-1',
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/sharon-mcclure.jpg',
        starRating: 5,
        name: 'Sharon McClure',
        role: 'Volunteer',
        content: '"Through their words, we\'re reminded that a legacy isn\'t just something you leave behind it\'s something you create every day inspiring all generations to follow in their footsteps."',
        isNew: false,
        isSaving: false
      },
      {
        id: 2,
        _id: 'demo-testimonial-2',
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/john-doe.jpg',
        starRating: 4,
        name: 'John Doe',
        role: 'Community Leader',
        content: '"The impact this organization has made in our community is truly remarkable. They have brought hope and positive change to countless lives."',
        isNew: false,
        isSaving: false
      },
      {
        id: 3,
        _id: 'demo-testimonial-3',
        profileImage: 'https://creative-story.s3.amazonaws.com/testimonials/mary-smith.jpg',
        starRating: 5,
        name: 'Mary Smith',
        role: 'Beneficiary',
        content: '"Thanks to their support, I was able to rebuild my life and give back to others in need. Their compassion knows no bounds."',
        isNew: false,
        isSaving: false
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
    if (token && token.startsWith("demo-token")) {
      setIsDemoMode(true);
      setFormData(demoData);
      // Mark all demo testimonials as saved
      setSavedTestimonials(demoData.testimonials.map(t => t.id));
    } else {
      fetchTestimonialData();
    }
  }, []);

  const fetchTestimonialData = async () => {
    try {
      setIsLoading(true);
      console.log('📄 Fetching about testimonials data...');
      
      const response = await getAboutTestimonials().unwrap();
      console.log('📥 About Testimonials API Response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response keys:', Object.keys(response || {}));
      
      // Check multiple possible response structures
      let sectionData = null;
      
      if (response?.success && response?.about) {
        sectionData = response.about;
        console.log('✅ Using response.about structure');
      } else if (response?.about) {
        sectionData = response.about;
        console.log('✅ Using response.about structure (no success flag)');
      } else if (response?.success && response?.section) {
        sectionData = response.section;
        console.log('✅ Using response.section structure');
      } else if (response?.section) {
        sectionData = response.section;
        console.log('✅ Using response.section structure (no success flag)');
      } else if (response?.success && response?.data) {
        sectionData = response.data;
        console.log('✅ Using response.data structure');
      } else if (response?.data && !response?.success) {
        sectionData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (response && typeof response === 'object' && !response.error && !response.message) {
        sectionData = response;
        console.log('✅ Using response directly as section data');
      }
      
      if (sectionData && Object.keys(sectionData).length > 0) {
        console.log('🔍 Section data found:', sectionData);
        console.log('🔍 Testimonials in section:', sectionData.testimonials);
        
        // Convert backend testimonials to frontend format
        const convertedTestimonials = sectionData.testimonials?.map((testimonial, index) => {
          console.log(`🔍 Processing testimonial ${index + 1}:`, testimonial);
          return {
            id: index + 1, // Frontend ID
            _id: testimonial._id, // Backend ID
            profileImage: testimonial.image || testimonial.profileImage || '',
            starRating: testimonial.rating || testimonial.starRating || 5,
            name: testimonial.name || '',
            role: testimonial.title || testimonial.role || '',
            content: testimonial.content || testimonial.message || '',
            isNew: false, // Existing testimonial
            isSaving: false,
            isEditing: false // Not in edit mode by default
          };
        }) || [];
        
        console.log('🔄 Converted testimonials:', convertedTestimonials);
        
        // Parse statistics array format
        const stats1 = sectionData.statistics?.[0] || {};
        const stats2 = sectionData.statistics?.[1] || {};
        
        setFormData({
          _id: sectionData._id, // Store backend section ID
          testimonials: convertedTestimonials.length > 0 ? convertedTestimonials : [
            {
              id: 1,
              _id: null,
              profileImage: '',
              starRating: 5,
              name: '',
              role: '',
              content: '',
              isNew: true,
              isSaving: false,
              isEditing: false
            }
          ],
          sectionHeading: sectionData.sectionHeading || sectionData.heading || '',
          sectionDescription: sectionData.sectionDescription || sectionData.description || '',
          ctaButtonText: sectionData.ctaButtonText || sectionData.buttonText || '',
          ctaButtonLink: sectionData.ctaButtonLink || sectionData.buttonLink || '',
          stat1Number: stats1.number || sectionData.stat1Number || '',
          stat1Label: stats1.label || sectionData.stat1Label || '',
          stat2Number: stats2.number || sectionData.stat2Number || '',
          stat2Label: stats2.label || sectionData.stat2Label || ''
        });
        
        // Track all existing testimonials as saved
        setSavedTestimonials(convertedTestimonials.map(t => t.id));
        
        console.log('✅ About testimonials data loaded and populated successfully');
        console.log('🎯 Final form data:', {
          testimonials: convertedTestimonials,
          sectionHeading: sectionData.sectionHeading || sectionData.heading || '',
          sectionDescription: sectionData.sectionDescription || sectionData.description || ''
        });
        
        if (convertedTestimonials.length > 0) {
          toast.success(`Loaded ${convertedTestimonials.length} testimonials successfully`);
        }
      } else {
        console.log('📄 No existing about testimonials section found, starting fresh');
        console.log('⚠️ Full response structure:', response);
        toast.info('No existing testimonials found. Starting with a fresh form.');
        // Initialize with default structure if no data exists
      }
    } catch (error) {
      console.error('❌ Error fetching about testimonials data:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      toast.info('Starting with a fresh testimonials form. Add your testimonials and save them individually.');
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
        _id: null,
        profileImage: '',
        starRating: 5,
        name: '',
        role: '',
        content: '',
        isNew: true,
        isSaving: false,
        isEditing: false
      }]
    }));
  };

  const removeTestimonial = async (testimonialId) => {
    const testimonial = formData.testimonials.find(t => t.id === testimonialId);
    
    if (formData.testimonials.length <= 1) {
      toast.error('At least one testimonial is required');
      return;
    }
    
    // If it's an existing testimonial (has backend _id), delete from backend
    if (testimonial && testimonial._id && !testimonial.isNew) {
      try {
        if (!isDemoMode) {
          await deleteAboutTestimonial(testimonial._id).unwrap();
          toast.success('Testimonial deleted from backend');
        }
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Failed to delete testimonial from backend');
        return;
      }
    }
    
    // Remove from frontend state
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== testimonialId)
    }));
    
    // Remove from saved testimonials tracking
    setSavedTestimonials(prev => prev.filter(id => id !== testimonialId));
  };

  const enableEditTestimonial = (testimonialId) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(t => 
        t.id === testimonialId ? { ...t, isEditing: true } : t
      )
    }));
  };

  const cancelEditTestimonial = async (testimonialId) => {
    // Reload the original data from backend
    try {
      const response = await getAboutTestimonials().unwrap();
      const sectionData = response?.about || response?.section || response?.data || response;
      const originalTestimonial = sectionData?.testimonials?.find(t => t._id === formData.testimonials.find(ft => ft.id === testimonialId)?._id);
      
      if (originalTestimonial) {
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(t => 
            t.id === testimonialId ? {
              ...t,
              profileImage: originalTestimonial.image || '',
              starRating: originalTestimonial.rating || 5,
              name: originalTestimonial.name || '',
              role: originalTestimonial.title || '',
              content: originalTestimonial.content || '',
              isEditing: false,
              isSaving: false
            } : t
          )
        }));
      } else {
        // Just cancel edit mode if we can't reload
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(t => 
            t.id === testimonialId ? { ...t, isEditing: false, isSaving: false } : t
          )
        }));
      }
    } catch (error) {
      console.error('Error reloading testimonial data:', error);
      // Just cancel edit mode
      setFormData(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(t => 
          t.id === testimonialId ? { ...t, isEditing: false, isSaving: false } : t
        )
      }));
    }
  };

  const saveTestimonialToBackend = async (testimonial) => {
    // Check if all required fields are filled
    if (!testimonial.name || !testimonial.role || !testimonial.content) {
      toast.error('Please fill in all required fields (name, role, and content) before saving');
      return false;
    }

    try {
      // Mark this testimonial as saving
      setFormData(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(t => 
          t.id === testimonial.id ? { ...t, isSaving: true } : t
        )
      }));

      // Check if demo mode
      if (isDemoMode) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mark as saved in demo mode and exit edit mode
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(t => 
            t.id === testimonial.id ? { ...t, isNew: false, isSaving: false, isEditing: false } : t
          )
        }));
        
        setSavedTestimonials(prev => [...prev, testimonial.id]);
        toast.success(`${testimonial.name} testimonial saved successfully! (Demo Mode)`);
        return true;
      }

      // Real API call - match backend field names
      const testimonialData = {
        image: testimonial.profileImage,
        rating: testimonial.starRating,
        title: testimonial.role,
        name: testimonial.name,
        content: testimonial.content
      };

      let response;
      if (testimonial.isNew) {
        // Create new testimonial
        response = await createAboutTestimonial(testimonialData).unwrap();
      } else {
        // Update existing testimonial
        response = await updateAboutTestimonial({ 
          id: testimonial._id, 
          data: testimonialData 
        }).unwrap();
      }
      
      // Mark as saved and exit edit mode
      setFormData(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(t => 
          t.id === testimonial.id ? { 
            ...t, 
            isNew: false, 
            isSaving: false, 
            isEditing: false,
            _id: response.testimonial?._id || response.data?._id || t._id 
          } : t
        )
      }));
      
      setSavedTestimonials(prev => [...prev, testimonial.id]);
      toast.success(response?.message || `${testimonial.name} testimonial saved successfully!`);
      return true;
      
    } catch (error) {
      console.error('Error saving testimonial:', error);
      
      // Reset saving state
      setFormData(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(t => 
          t.id === testimonial.id ? { ...t, isSaving: false } : t
        )
      }));
      
      // Handle connection errors gracefully
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        toast.warn('Backend server is offline. Testimonial saved locally only.', {
          position: 'top-center',
          autoClose: 3000,
        });
        
        // Mark as saved locally and exit edit mode
        setFormData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(t => 
            t.id === testimonial.id ? { ...t, isNew: false, isSaving: false, isEditing: false } : t
          )
        }));
        setSavedTestimonials(prev => [...prev, testimonial.id]);
        return true;
      } else {
        toast.error(error?.message || `Failed to save ${testimonial.name} testimonial. Please try again.`);
        return false;
      }
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
    // Check section header
    if (!formData.sectionHeading.trim() || !formData.sectionDescription.trim()) {
      return false;
    }
    
    // Check if at least one testimonial is saved to backend
    const savedTestimonialsCount = formData.testimonials.filter(t => !t.isNew).length;
    if (savedTestimonialsCount === 0) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate section header
    if (!formData.sectionHeading.trim() || !formData.sectionDescription.trim()) {
      toast.error('Please fill in both the section heading and description');
      return;
    }
    
    // Check if at least one testimonial is saved
    const savedTestimonialsCount = formData.testimonials.filter(t => !t.isNew).length;
    
    if (savedTestimonialsCount === 0) {
      toast.error('Please save at least one testimonial to the backend before finishing');
      return;
    }
    
    // Check for unsaved testimonials
    const unsavedTestimonials = formData.testimonials.filter(t => t.isNew);
    if (unsavedTestimonials.length > 0) {
      const testimonialNames = unsavedTestimonials.map((t, index) => 
        t.name || `Testimonial ${formData.testimonials.indexOf(t) + 1}`
      ).join(', ');
      toast.warning(`You have unsaved testimonials: ${testimonialNames}. Please save them or remove them before finishing.`);
      return;
    }

    if (isDemoMode) {
      toast.success('About Us Testimonial Section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare testimonials data for API (only saved testimonials)
      const savedTestimonialsData = formData.testimonials
        .filter(t => !t.isNew) // Only include saved testimonials
        .map(t => ({
          _id: t._id,
          image: t.profileImage,
          rating: t.starRating,
          name: t.name,
          title: t.role,
          content: t.content
        }));
      
      // Update section data with the exact format from your example
      const sectionData = {
        sectionHeading: formData.sectionHeading,
        sectionDescription: formData.sectionDescription,
        statistics: [
          {
            number: formData.stat1Number,
            label: formData.stat1Label
          },
          {
            number: formData.stat2Number,
            label: formData.stat2Label
          }
        ],
        testimonials: savedTestimonialsData
      };
      
      // Add optional fields if they exist
      if (formData.ctaButtonText) {
        sectionData.ctaButtonText = formData.ctaButtonText;
      }
      if (formData.ctaButtonLink) {
        sectionData.ctaButtonLink = formData.ctaButtonLink;
      }
      
      // Use the specific ID format: /api/about/testimonials/{id}
      const response = await updateAboutTestimonialsSection({
        id: formData._id || '68ee1f0770e1bfc20b37541c', // Use provided ID or fallback
        ...sectionData
      }).unwrap();
      
      toast.success(response?.message || `About Us Testimonial Section updated successfully! ${savedTestimonialsCount} testimonials saved.`);
    } catch (error) {
      console.error('Error updating testimonial section:', error);
      toast.error(error?.message || 'Failed to update testimonial section');
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
          {!isDemoMode && (
            <Alert variant="info" className="mb-0 py-2 px-3">
              <small>Save testimonials individually, then finish section setup</small>
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
                Finish Section Setup
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
                            disabled={!testimonial.isNew && !testimonial.isEditing}
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
                          disabled={!testimonial.isNew && !testimonial.isEditing}
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
                          disabled={!testimonial.isNew && !testimonial.isEditing}
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
                          disabled={!testimonial.isNew && !testimonial.isEditing}
                        />
                      </Form.Group>
                      
                      {/* Save/Status Section */}
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        {testimonial.isNew || testimonial.isEditing ? (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => saveTestimonialToBackend(testimonial)}
                              disabled={testimonial.isSaving || !testimonial.name || !testimonial.role || !testimonial.content}
                            >
                              {testimonial.isSaving ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FaSave className="me-1" />
                                  {testimonial.isNew ? 'Save Testimonial' : 'Update Testimonial'}
                                </>
                              )}
                            </Button>
                            {testimonial.isEditing && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => cancelEditTestimonial(testimonial.id)}
                                disabled={testimonial.isSaving}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-between w-100">
                            <div className="d-flex align-items-center text-success">
                              <FaSave className="me-1" />
                              <small>Saved Testimonial</small>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => enableEditTestimonial(testimonial.id)}
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
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