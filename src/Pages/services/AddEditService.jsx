import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetServiceByIdMutation, useCreateServiceMutation, useUpdateServiceMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import TextEditor from '../../Components/TextEditor';
import { FaSave, FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getServiceById, { isLoading }] = useGetServiceByIdMutation();
  const [createService, { isLoading: createLoading }] = useCreateServiceMutation();
  const [updateService, { isLoading: updateLoading }] = useUpdateServiceMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    image: '',
    isActive: true,
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchService = async () => {
    if (!id) return;

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on id
        const demoData = {
          _id: id,
          title: 'Financial Planning',
          description: 'Comprehensive financial planning services to help you achieve your financial goals. Our expert advisors will work with you to create a personalized financial roadmap.',
          shortDescription: 'Complete financial planning solutions',
          image: 'https://creative-story.s3.amazonaws.com/services/financial-planning.jpg',
          isActive: true,
          featured: true,
          duration: '2-3 hours'
        };
        
        setFormData(demoData);
        setImagePreview(demoData.image);
        return;
      }

      // Real API call for production
      const data = await getServiceById(id).unwrap();
      const serviceData = data?.service || {};
      
      setFormData({
        ...serviceData
      });
      
      if (serviceData.image) {
        setImagePreview(serviceData.image);
      }
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchService();
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
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Service title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Service description is required');
      return;
    }

    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        toast.success(`Service ${id ? 'updated' : 'created'} successfully`);
        navigate('/dash/services');
        return;
      }

      let submitData = { ...formData };

      // Handle image upload
      if (imageFile) {
        // In a real application, you would upload the image to a service like AWS S3
        // For demo purposes, we'll use a placeholder URL
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        
        // This would be replaced with actual image upload logic
        submitData.image = `https://creative-story.s3.amazonaws.com/services/${Date.now()}-${imageFile.name}`;
      }

      const data = id 
        ? await updateService({ id, data: submitData }).unwrap()
        : await createService(submitData).unwrap();
      
      toast.success(data?.message || `Service ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/services');
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
              onClick={() => navigate('/dash/services')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Services
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'}</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Service</span>
            </h2>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={12}>
              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <FormField
                    type="text"
                    name="title"
                    label="Service Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter service title"
                  />

                  <FormField
                    type="text"
                    name="shortDescription"
                    label="Short Description"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    required
                    placeholder="Brief one-line description"
                    maxLength="150"
                  />

                  <Form.Group className="mb-3">
                    <Form.Label>Detailed Description <span className="text-danger">*</span></Form.Label>
                    <TextEditor
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Write a detailed description of the service..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Service Image */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Service Image</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  {imagePreview ? (
                    <div className="mb-3">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fluid
                        rounded
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                      <div className="mt-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removeImage}
                        >
                          <FaTrash className="me-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div 
                        className="bg-light rounded mx-auto d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
                        <FaUpload size={40} className="text-muted" />
                      </div>
                    </div>
                  )}
                  
                  <Form.Group>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Upload service image (Max 5MB, JPG/PNG recommended)
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

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
                      {isLoading_ ? 'Saving...' : (id ? 'Update Service' : 'Create Service')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dash/services')}
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

export default AddEditService;