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

// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';
 


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
    image1: '',
    image1PublicId: '',
    image2: '',
    image2PublicId: '',
    isActive: true,
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [innerImagePreview, setInnerImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingInnerImage, setUploadingInnerImage] = useState(false);

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
        // Handle different field names for description
        const description = serviceData.description || serviceData.detailedDescription || '';
        
        setFormData({
          title: serviceData.title || '',
          description: description,
          shortDescription: serviceData.shortDescription || '',
          image1: serviceData.image1 || '',
          image1PublicId: serviceData.image1PublicId || '',
          image2: serviceData.image2 || '',
          image2PublicId: serviceData.image2PublicId || '',
          isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
          featured: serviceData.featured || false,
        });
        
        if (serviceData.image1) {
          setImagePreview(serviceData.image1);
        }
        
        if (serviceData.image2) {
          setInnerImagePreview(serviceData.image2);
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
      console.log('🖼️ Uploading outer service image:', file.name);

      const formDataUpload = new FormData();
      formDataUpload.append('files', file); // Use 'files' key for backend
      formDataUpload.append('folder', 'services');

      const response = await uploadImage(formDataUpload).unwrap();
      console.log('📤 Image upload response:', response);
      
      // Expecting response.files[0].url based on new API format
      const imageUrl = response?.files?.[0]?.url;
      const publicId = response?.files?.[0]?.public_id || '';
      
      if (imageUrl) {
        setImagePreview(imageUrl);
        setFormData(prev => {
          const updated = { 
            ...prev, 
            image1: imageUrl,
            image1PublicId: publicId
          };
          console.log('🔍 Updated formData after image1 upload:', updated);
          return updated;
        });
        console.log('✅ Outer service image uploaded:', imageUrl);
        console.log('✅ Outer service publicId:', publicId);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading outer service image:', error);
      toast.error(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInnerImageChange = async (e) => {
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

    setUploadingInnerImage(true);

    try {
      console.log('🖼️ Uploading inner service image:', file.name);

      const formDataUpload = new FormData();
      formDataUpload.append('files', file); // Use 'files' key for backend
      formDataUpload.append('folder', 'services');

      const response = await uploadImage(formDataUpload).unwrap();
      console.log('📤 Inner image upload response:', response);
      
      // Expecting response.files[0].url based on new API format
      const imageUrl = response?.files?.[0]?.url;
      const publicId = response?.files?.[0]?.public_id || '';
      
      if (imageUrl) {
        setInnerImagePreview(imageUrl);
        setFormData(prev => {
          const updated = { 
            ...prev, 
            image2: imageUrl,
            image2PublicId: publicId
          };
          console.log('🔍 Updated formData after image2 upload:', updated);
          return updated;
        });
        console.log('✅ Inner service image uploaded:', imageUrl);
        console.log('✅ Inner service publicId:', publicId);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading inner service image:', error);
      toast.error(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setUploadingInnerImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ 
      ...prev, 
      image1: '',
      image1PublicId: ''
    }));
  };

  const removeInnerImage = () => {
    setInnerImagePreview('');
    setFormData(prev => ({ 
      ...prev, 
      image2: '',
      image2PublicId: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced validation
    if (!formData.title.trim()) {
      toast.error('Service title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Service description is required');
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Short description is required');
      return;
    }

    try {
      // Debug: Check formData before submission
      console.log('🔍 FormData before submission:', formData);
      console.log('🔍 image1:', formData.image1);
      console.log('🔍 image1PublicId:', formData.image1PublicId);
      console.log('🔍 image2:', formData.image2);
      console.log('🔍 image2PublicId:', formData.image2PublicId);
      
      // Prepare data with correct field mapping for backend
      let submitData = {
        title: formData.title.trim(),
        detailedDescription: formData.description.trim(), // Backend expects 'detailedDescription'
        shortDescription: formData.shortDescription.trim(),
        image1: formData.image1 || '',
        image1PublicId: formData.image1PublicId || '',
        image2: formData.image2 || '',
        image2PublicId: formData.image2PublicId || '',
        isActive: Boolean(formData.isActive),
        featured: Boolean(formData.featured),
      };

      console.log('📤 Submitting service data:', submitData);
      console.log('📤 Request type:', id ? 'UPDATE' : 'CREATE');
      console.log('📤 Service ID:', id || 'N/A');
      console.log('📤 Stringified submitData:', JSON.stringify(submitData, null, 2));

      const response = id 
        ? await updateService({ id, data: submitData }).unwrap()
        : await createService(submitData).unwrap();
      
      console.log('✅ Submit Response:', response);
      
      toast.success(response?.message || `Service ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/services');
    } catch (error) {
      console.error('❌ Error submitting service:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Better error handling
      let errorMessage = `Failed to ${id ? 'update' : 'create'} service`;
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status) {
        errorMessage = `Server error (${error.status}): ${errorMessage}`;
      }
      
      toast.error(errorMessage);
    }
  };

  const isLoading_ = isLoading || createLoading || updateLoading || uploadingImage || uploadingInnerImage;

    const getImageUrl = (val) =>
  !val ? '' : /^https?:\/\//i.test(val) ? val : `${BASE_URL.replace(/\/$/, '')}/${val.replace(/^\/+/, '')}`;

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
                    placeholder="Brief one-line description"
                    maxLength="150"
                  />
                  <Form.Text className="text-muted">
                    {(formData.shortDescription || '').length}/150 characters
                  </Form.Text>

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

              {/* Service Images */}
              <Row className="mb-4">
                {/* Outer Image Card */}
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Outer Image</h5>
                    </Card.Header>
                    <Card.Body className="text-center">
                      {imagePreview ? (
                        <div className="mb-3">
                          <Image
                            src={getImageUrl(imagePreview)}
                            alt="Outer Image Preview"
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
                          Upload outer image (Max 5MB)
                        </Form.Text>
                        {uploadingImage && (
                          <div className="mt-2">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <small className="text-muted">Uploading...</small>
                          </div>
                        )}
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Inner Image Card */}
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Inner Image</h5>
                    </Card.Header>
                    <Card.Body className="text-center">
                      {innerImagePreview ? (
                        <div className="mb-3">
                          <Image
                            src={getImageUrl(innerImagePreview)}
                            alt="Inner Image Preview"
                            fluid
                            rounded
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                          />
                          <div className="mt-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={removeInnerImage}
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
                          onChange={handleInnerImageChange}
                          className="mb-2"
                          disabled={uploadingInnerImage}
                        />
                        <Form.Text className="text-muted">
                          Upload inner image (Max 5MB)
                        </Form.Text>
                        {uploadingInnerImage && (
                          <div className="mt-2">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <small className="text-muted">Uploading...</small>
                          </div>
                        )}
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

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