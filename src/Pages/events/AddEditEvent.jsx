import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventByIdMutation, useCreateEventMutation, useUpdateEventMutation, useUploadImageMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import TextEditor from '../../Components/TextEditor';
import { 
  FaSave, FaArrowLeft, FaUpload, FaTrash, FaImage, FaCalendarAlt, 
  FaClock, FaMapMarkerAlt
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getEventById, { isLoading }] = useGetEventByIdMutation();
  const [createEvent, { isLoading: createLoading }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updateLoading }] = useUpdateEventMutation();
  const [uploadImage] = useUploadImageMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    venue: '',
    images: [],
    featuredImage: '',
    isActive: true,
    featured: false,
    priority: 'medium',
    maxAttendees: '',
    currentAttendees: 0
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({});

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const fetchEvent = async () => {
    if (!id) return;

    try {
      console.log('🔄 Starting Event Data fetch for ID:', id);
      
      const response = await getEventById(id).unwrap();
      console.log('📥 Event Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      
      // Check multiple possible response structures
      let eventData = null;
      
      console.log('🔍 Analyzing event response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response?.event) {
        eventData = response.event;
        console.log('✅ Using response.event structure (success + event)');
      } else if (response?.success && response?.events && Array.isArray(response.events)) {
        // Handle case where API returns events array even for single event
        eventData = response.events[0]; 
        console.log('✅ Using response.events[0] structure (events array)');
      } else if (response?.event) {
        eventData = response.event;
        console.log('✅ Using response.event structure (no success flag)');
      } else if (response?.success && response?.data) {
        eventData = response.data;
        console.log('✅ Using response.data structure (with success flag)');
      } else if (response?.data && !response?.success) {
        eventData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        eventData = response;
        console.log('✅ Using response directly as data');
      }
      
      console.log('📝 Extracted event data:', eventData);
      
      if (eventData && Object.keys(eventData).length > 0) {
        console.log('🔄 Processing event data for form...');
        
        // Safe date conversion with error handling
        const formatDateForInput = (dateString) => {
          try {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              console.warn('Invalid date:', dateString);
              return '';
            }
            // Return in YYYY-MM-DD format for date inputs
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return '';
          }
        };

        const processedFormData = {
          title: eventData.title || '',
          description: eventData.description || '',
          shortDescription: eventData.shortDescription || '',
          startDate: formatDateForInput(eventData.startDate),
          endDate: formatDateForInput(eventData.endDate),
          registrationDeadline: formatDateForInput(eventData.registrationDeadline),
          location: eventData.location || '',
          venue: eventData.venueDetails || eventData.venue || '', // Handle both venueDetails and venue
          images: Array.isArray(eventData.images) ? eventData.images : (eventData.image ? [eventData.image] : []),
          featuredImage: eventData.featuredImage || eventData.image || '', // Handle both featuredImage and image
          isActive: typeof eventData.isActive === 'boolean' ? eventData.isActive : true,
          featured: typeof eventData.featured === 'boolean' ? eventData.featured : false,
          priority: eventData.priority || 'medium',
          maxAttendees: eventData.maxAttendees || '',
          currentAttendees: eventData.currentAttendees || 0
        };

        console.log('✅ Processed form data:', processedFormData);
        setFormData(processedFormData);
        
        if (eventData.images && Array.isArray(eventData.images)) {
          setImagePreviews(eventData.images);
        }
        
        console.log('🎯 Event data populated successfully');
        toast.success('Event data loaded successfully');
      } else {
        console.log('⚠️ No event data found');
        toast.error('Event not found');
        navigate('/dash/events');
      }
    } catch (error) {
      console.error('❌ Error fetching event data:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Don't navigate away immediately, show error but allow form to render
      toast.error(error?.data?.message || 'Failed to load event. You can still create a new event.');
      
      // Set default form data to prevent blank page
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        location: '',
        venue: '',
        images: [],
        featuredImage: '',
        isActive: true,
        featured: false,
        priority: 'medium',
        maxAttendees: '',
        currentAttendees: 0
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Upload images
    for (const file of validFiles) {
      const fileId = Date.now() + Math.random();
      setUploadingImages(prev => ({ ...prev, [fileId]: true }));

      try {
        console.log('🖼️ Uploading event image:', file.name);
        
        const uploadFormData = new FormData();
        uploadFormData.append('files', file); // Use 'files' key for new API format
        
        const response = await uploadImage(uploadFormData).unwrap();
        console.log('📥 Image upload response:', response);
        
        // Handle new API response format with files array
        let imageUrl = '';
        if (response.success && response.files && response.files.length > 0) {
          imageUrl = response.files[0].url; // Get URL from first file in array
          console.log('✅ Using new API format - files[0].url:', imageUrl);
        } else if (response?.imageUrl) {
          imageUrl = response.imageUrl; // Fallback to old format
          console.log('✅ Using fallback format - imageUrl:', imageUrl);
        } else if (response?.url) {
          imageUrl = response.url; // Another fallback
          console.log('✅ Using fallback format - url:', imageUrl);
        } else {
          throw new Error('Invalid upload response format - no URL found');
        }
        
        if (imageUrl) {
          setImagePreviews(prev => [...prev, imageUrl]);
          
          // Set as featured image if no featured image is set
          if (!formData.featuredImage) {
            setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
          }
          
          console.log('✅ Event image uploaded successfully:', imageUrl);
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          throw new Error('No valid image URL found in response');
        }
      } catch (error) {
        console.error('❌ Error uploading event image:', error);
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      } finally {
        setUploadingImages(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Update featured image if it was removed
    if (formData.featuredImage === imagePreviews[index]) {
      setFormData(prev => ({ ...prev, featuredImage: '' }));
    }
  };

  const setFeaturedImage = (imageUrl) => {
    setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Event description is required');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start date and time is required');
      return;
    }
    if (!formData.endDate) {
      toast.error('End date and time is required');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Event location is required');
      return;
    }

    try {
      let submitData = { 
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null,
        images: imagePreviews,
        maxAttendees: parseInt(formData.maxAttendees) || 0,
        // Map frontend field names to API field names
        venueDetails: formData.venue, // API expects venueDetails
      };

      // Handle featured image - if single image, use 'image' field for API compatibility
      if (!submitData.featuredImage && submitData.images.length > 0) {
        submitData.featuredImage = submitData.images[0];
      }
      
      // For API compatibility, also set 'image' field if single image
      if (submitData.images.length > 0) {
        submitData.image = submitData.featuredImage || submitData.images[0];
      }

      // Remove venue field since API expects venueDetails
      delete submitData.venue;

      console.log('📤 Submitting event data:', submitData);

      // API call
      const response = id 
        ? await updateEvent({ id, data: submitData }).unwrap()
        : await createEvent(submitData).unwrap();
      
      console.log('✅ Submit Response:', response);
      
      toast.success(response?.message || `Event ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/events');
    } catch (error) {
      console.error('❌ Error submitting event:', error);
      toast.error(error?.data?.message || `Failed to ${id ? 'update' : 'create'} event`);
    }
  };

  const isLoading_ = isLoading || createLoading || updateLoading;

  // Show loading spinner while fetching event data for edit mode
  if (id && isLoading) {
    return (
      <MotionDiv>
        <Container fluid className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading event data...</div>
        </Container>
      </MotionDiv>
    );
  }

  // Add error boundary check - more comprehensive validation
  if (!formData || typeof formData !== 'object' || Object.keys(formData).length === 0) {
    return (
      <MotionDiv>
        <Container fluid className="text-center py-5">
          <Alert variant="danger">
            <h4>Error Loading Event</h4>
            <p>There was an issue loading the event data. Please try refreshing the page or go back to events list.</p>
            <div className="mt-3">
              <Button variant="outline-primary" onClick={() => window.location.reload()} className="me-2">
                Refresh Page
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/dash/events')}>
                Back to Events
              </Button>
            </div>
          </Alert>
        </Container>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/events')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Events
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'}</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Event</span>
            </h2>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <FormField
                    type="text"
                    name="title"
                    label="Event Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter event title"
                    maxLength="100"
                  />
                  <Form.Text className="text-muted">
                    {(formData.title || '').length}/100 characters
                  </Form.Text>

                  <FormField
                    type="text"
                    name="shortDescription"
                    label="Short Description"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    required
                    placeholder="Brief one-line description for event cards"
                    maxLength="200"
                  />
                  <Form.Text className="text-muted">
                    {(formData.shortDescription || '').length}/200 characters
                  </Form.Text>

                  <Form.Group className="mb-3">
                    <Form.Label>Detailed Description <span className="text-danger">*</span></Form.Label>
                    <TextEditor
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Write a detailed description of the event..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Date & Time Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    Date Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="date"
                        name="startDate"
                        label="Start Date"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="date"
                        name="endDate"
                        label="End Date"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Location & Venue */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2" />
                    Location & Venue
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="location"
                        label="Location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="e.g., New York, NY or Virtual Platform"
                        maxLength="100"
                      />
                      <Form.Text className="text-muted">
                        {(formData.location || '').length}/100 characters
                      </Form.Text>
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="venue"
                        label="Venue Details"
                        value={formData.venue}
                        onChange={handleChange}
                        placeholder="e.g., Conference Hall A or Zoom Meeting Room"
                        maxLength="150"
                      />
                      <Form.Text className="text-muted">
                        {(formData.venue || '').length}/150 characters
                      </Form.Text>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Event Images */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaImage className="me-2" />
                    Event Images
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Images</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={Object.keys(uploadingImages).length > 0}
                    />
                    <Form.Text className="text-muted">
                      Upload event images (Max 5MB each, JPG/PNG recommended)
                    </Form.Text>
                    {Object.keys(uploadingImages).length > 0 && (
                      <div className="mt-2">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <small className="text-muted">Uploading images...</small>
                      </div>
                    )}
                  </Form.Group>

                  {imagePreviews.length > 0 && (
                    <div>
                      <Form.Label>Current Images:</Form.Label>
                      <Row>
                        {imagePreviews.map((img, index) => (
                          <Col xs={6} key={index} className="mb-3">
                            <div className="position-relative">
                              <Image
                                src={img}
                                alt={`Preview ${index + 1}`}
                                fluid
                                rounded
                                style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                              />
                              <div className="position-absolute top-0 end-0 p-1">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className="rounded-circle"
                                  style={{ width: '25px', height: '25px', padding: '0' }}
                                >
                                  <FaTrash size={10} />
                                </Button>
                              </div>
                              {img === formData.featuredImage && (
                                <Badge bg="warning" className="position-absolute bottom-0 start-0 m-1">
                                  Featured
                                </Badge>
                              )}
                              {img !== formData.featuredImage && (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="position-absolute bottom-0 start-0 m-1"
                                  onClick={() => setFeaturedImage(img)}
                                >
                                  Set Featured
                                </Button>
                              )}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Settings */}
              {/* <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Event Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="isActive"
                      label="Active Event"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Inactive events won't appear on the website
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="featured"
                      label="Featured Event"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Featured events appear prominently on the website
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Priority Level</Form.Label>
                    <Form.Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card> */}

              {/* Action Buttons */}
              <Card>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading_}
                    >
                      <FaSave className="me-1" />
                      {isLoading_ ? 'Saving...' : (id ? 'Update Event' : 'Create Event')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dash/events')}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </MotionDiv>
  );
};

export default AddEditEvent;