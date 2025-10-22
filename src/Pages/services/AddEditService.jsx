import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetServiceByIdMutation, useCreateServiceMutation, useUpdateServiceMutation, useUploadImageMutation } from '../../features/apiSlice';
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
  const [uploadImage] = useUploadImageMutation();
  
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
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchService = async () => {
    if (!id) return;

    try {
      console.log('🔄 Starting Service Data fetch for ID:', id);
      
      const response = await getServiceById(id).unwrap();
      console.log('📥 Service Data Response:', response);
      
      // Check multiple possible response structures
      let serviceData = null;
      
      if (response?.success && response?.service) {
        serviceData = response.service;
        console.log('✅ Using response.service structure');
      } else if (response?.service) {
        serviceData = response.service;
        console.log('✅ Using response.service structure (no success flag)');
      } else if (response?.success && response?.data) {
        serviceData = response.data;
        console.log('✅ Using response.data structure');
      } else if (response?.data && !response?.success) {
        serviceData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        serviceData = response;
        console.log('✅ Using response directly as data');
      }
      
      if (serviceData && Object.keys(serviceData).length > 0) {
        setFormData({
          ...serviceData
        });
        
        if (serviceData.image) {
          setImagePreview(serviceData.image);
        }
        
        console.log('🎯 Service data populated successfully');
        toast.success('Service data loaded successfully');
      } else {
        console.log('⚠️ No service data found');
        toast.error('Service not found');
        navigate('/dash/services');
      }
    } catch (error) {
      console.error('❌ Error fetching service data:', error);
      toast.error(error?.data?.message || 'Failed to load service');
      navigate('/dash/services');
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    setUploadingImage(true);

    try {
      console.log('🖼️ Uploading service image:', file.name);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'services');
      
      const response = await uploadImage(formData).unwrap();
      
      if (response?.imageUrl) {
        setImagePreview(response.imageUrl);
        setFormData(prev => ({ ...prev, image: response.imageUrl }));
        console.log('✅ Service image uploaded:', response.imageUrl);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading service image:', error);
      toast.error(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setUploadingImage(false);
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
      let submitData = { ...formData };

      console.log('📤 Submitting service data:', submitData);

      const response = id 
        ? await updateService({ id, data: submitData }).unwrap()
        : await createService(submitData).unwrap();
      
      console.log('✅ Submit Response:', response);
      
      toast.success(response?.message || `Service ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/services');
    } catch (error) {
      console.error('❌ Error submitting service:', error);
      toast.error(error?.data?.message || `Failed to ${id ? 'update' : 'create'} service`);
    }
  };

  const isLoading_ = isLoading || createLoading || updateLoading || uploadingImage;

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
                      disabled={uploadingImage}
                    />
                    <Form.Text className="text-muted">
                      Upload service image (Max 5MB, JPG/PNG recommended)
                    </Form.Text>
                    {uploadingImage && (
                      <div className="mt-2">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <small className="text-muted">Uploading image...</small>
                      </div>
                    )}
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