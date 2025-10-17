import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetEventByIdMutation, useCreateEventMutation, useUpdateEventMutation } from '../../features/apiSlice';
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
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    images: [],
    featuredImage: '',
    isActive: true,
    featured: false,
    priority: 'medium'
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const fetchEvent = async () => {
    if (!id) return;

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on id
        const demoData = {
          _id: id,
          title: 'Financial Planning Webinar',
          description: 'Join our comprehensive webinar on personal financial planning strategies for 2024. Learn from industry experts about investment opportunities, retirement planning, and wealth management. This interactive session will cover essential topics including portfolio diversification, tax optimization, and risk assessment.',
          shortDescription: 'Learn essential financial planning strategies from industry experts',
          startDate: '2024-02-15T14:00:00',
          endDate: '2024-02-15T16:00:00',
          registrationDeadline: '2024-02-14T23:59:59',
          location: 'Virtual - Zoom Platform',
          venue: 'Online Meeting Room',
          images: [
            'https://creative-story.s3.amazonaws.com/events/financial-planning-webinar.jpg',
            'https://creative-story.s3.amazonaws.com/events/webinar-speakers.jpg'
          ],
          featuredImage: 'https://creative-story.s3.amazonaws.com/events/financial-planning-webinar.jpg',
          isActive: true,
          featured: true,
          priority: 'high'
        };
        
        setFormData({
          ...demoData,
          startDate: demoData.startDate.slice(0, 10), // Format for date input (YYYY-MM-DD)
          endDate: demoData.endDate.slice(0, 10),
          registrationDeadline: demoData.registrationDeadline.slice(0, 10)
        });
        setImagePreviews(demoData.images);
        return;
      }

      // Real API call for production
      const data = await getEventById(id).unwrap();
      const eventData = data?.event || {};
      
      setFormData({
        ...eventData,
        startDate: eventData.startDate ? new Date(eventData.startDate).toISOString().slice(0, 10) : '',
        endDate: eventData.endDate ? new Date(eventData.endDate).toISOString().slice(0, 10) : '',
        registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline).toISOString().slice(0, 10) : ''
      });
      
      if (eventData.images) {
        setImagePreviews(eventData.images);
      }
    } catch (error) {
      getError(error);
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

  const handleImageChange = (e) => {
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

    setImageFiles(prevFiles => [...prevFiles, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
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
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : null
      };

      // Handle image uploads
      if (imageFiles.length > 0) {
        // In a real application, you would upload the images to a service like AWS S3
        // For demo purposes, we'll use placeholder URLs
        const uploadedImages = imageFiles.map((file, index) => 
          `https://creative-story.s3.amazonaws.com/events/${Date.now()}-${index}-${file.name}`
        );
        
        submitData.images = [...imagePreviews.filter(img => img.startsWith('https')), ...uploadedImages];
        
        // Set featured image if not already set
        if (!submitData.featuredImage && submitData.images.length > 0) {
          submitData.featuredImage = submitData.images[0];
        }
      } else {
        submitData.images = imagePreviews.filter(img => img.startsWith('https'));
      }

      const data = id 
        ? await updateEvent({ id, data: submitData }).unwrap()
        : await createEvent(submitData).unwrap();
      
      toast.success(data?.message || `Event ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/events');
    } catch (error) {
      getError(error);
    }
  };

  const isLoading_ = isLoading || createLoading || updateLoading;

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
                  />

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
                    Date & Time Information
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
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="venue"
                        label="Venue Details"
                        value={formData.venue}
                        onChange={handleChange}
                        placeholder="e.g., Conference Hall A or Zoom Meeting Room"
                      />
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
                    />
                    <Form.Text className="text-muted">
                      Upload event images (Max 5MB each, JPG/PNG recommended)
                    </Form.Text>
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