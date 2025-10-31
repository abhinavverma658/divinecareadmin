import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaUpload, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutMainDataMutation, useUpdateAboutMainDataMutation, useUploadImageMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';
import { store } from '../../store';

const EditMainAboutSection = () => {
  const [formData, setFormData] = useState({
    heading: '',
    smallDescription: '',
    leftImage1: '',
    leftImage2: '',
    rightImage: '',
    description: '',
    keyPoints: ['', '', '']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({
    leftImage1: false,
    leftImage2: false,
    rightImage: false
  });
  
  // API mutations
  const [getAboutMainData] = useGetAboutMainDataMutation();
  const [updateAboutMainData] = useUpdateAboutMainDataMutation();
  const [uploadImage] = useUploadImageMutation();

  // Demo data for testing
  const demoData = {
    heading: 'About SAYV Financial Services',
    smallDescription: 'Empowering your financial future with expert guidance and personalized solutions',
    leftImage1: 'https://creative-story.s3.amazonaws.com/about/about-image-1.jpg',
    leftImage2: 'https://creative-story.s3.amazonaws.com/about/about-image-2.jpg',
    rightImage: 'https://creative-story.s3.amazonaws.com/about/about-main-image.jpg',
    description: 'At SAYV, we believe that everyone deserves access to professional financial guidance. Our team of experienced advisors is committed to helping you navigate the complexities of financial planning, investment management, and wealth building. With over a decade of experience in the financial services industry, we have helped thousands of clients achieve their financial goals and secure their future.',
    keyPoints: [
      'Personalized financial planning tailored to your unique goals and circumstances',
      'Expert investment management with a focus on long-term growth and risk management',
      'Comprehensive retirement planning to ensure a comfortable and secure future'
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
      console.log('🎭 Demo mode activated, using demo data');
    } else {
      console.log('🔐 Real token found, fetching from API');
      fetchAboutUsData();
    }
  }, []);

  // Debug form data changes
  useEffect(() => {
    console.log('🔄 Form data updated:', {
      heading: formData.heading,
      smallDescription: formData.smallDescription,
      hasImages: {
        leftImage1: !!formData.leftImage1,
        leftImage2: !!formData.leftImage2, 
        rightImage: !!formData.rightImage
      },
      description: formData.description?.substring(0, 50) + '...',
      keyPointsCount: formData.keyPoints?.length
    });
  }, [formData]);

  const fetchAboutUsData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting About Main Data fetch...');
      
      // Direct fetch test for debugging
      const state = store.getState();
      const token = state?.auth?.token;
      const cleanToken = token ? token.replace(/"/g, '') : null;
      
      console.log('🔑 Using token (first 20 chars):', cleanToken?.substring(0, 20) + '...');
      console.log('🌐 Backend URL:', 'https://divinecare-backend.onrender.com/api/about/main');
      
      // Test direct fetch first
      try {
        const directResponse = await fetch('https://divinecare-backend.onrender.com/api/about/main', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` })
          }
        });
        
        const directData = await directResponse.json();
        console.log('🧪 Direct fetch result:', {
          status: directResponse.status,
          ok: directResponse.ok,
          data: directData
        });
      } catch (directError) {
        console.error('🧪 Direct fetch failed:', directError);
      }
      
      // Now try RTK Query mutation
      const response = await getAboutMainData().unwrap();
      console.log('📥 About Main Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      console.log('📋 Response type:', typeof response);
      
      // Check multiple possible response structures
      let data = null;
      
      console.log('🔍 Analyzing response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      console.log('📋 Response type:', typeof response);
      console.log('🔑 Response keys:', response ? Object.keys(response) : 'No keys');
      
      if (response?.success && response?.about) {
        data = response.about;
        console.log('✅ Using response.about structure (success + about)');
      } else if (response?.about) {
        data = response.about;
        console.log('✅ Using response.about structure (no success flag)');
      } else if (response?.success && response?.data) {
        data = response.data;
        console.log('✅ Using response.data structure (with success flag)');
      } else if (response?.data && !response?.success) {
        data = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (Array.isArray(response) && response.length > 0) {
        data = response[0];
        console.log('✅ Using first array item');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        data = response;
        console.log('✅ Using response directly as data');
      }
      
      console.log('📝 Extracted data:', data);
      console.log('🔑 Data keys:', data ? Object.keys(data) : 'No data keys');
      
      if (data && Object.keys(data).length > 0) {
        console.log('📝 Setting form data with:', {
          heading: data.heading || 'MISSING',
          smallDescription: data.smallDescription || 'MISSING', 
          leftImage1: data.images?.[0] || data.leftImage1 || 'MISSING',
          leftImage2: data.images?.[1] || data.leftImage2 || 'MISSING',
          rightImage: data.images?.[2] || data.rightImage || 'MISSING',
          description: data.mainDescription || data.description || 'MISSING',
          keyPoints: data.keyPoints || 'MISSING'
        });
        
        const newFormData = {
          heading: data.heading || '',
          smallDescription: data.smallDescription || '',
          leftImage1: data.images?.[0] || data.leftImage1 || '',
          leftImage2: data.images?.[1] || data.leftImage2 || '',
          rightImage: data.images?.[2] || data.rightImage || '',
          description: data.mainDescription || data.description || '',
          keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : ['', '', '']
        };
        
        console.log('🎯 Final form data to set:', newFormData);
        setFormData(newFormData);
        toast.success('Main About section data loaded successfully');
      } else {
        // No data found, show message and keep demo data
        console.log('⚠️ No main about data found or empty data object');
        console.log('📊 Full response debug:', JSON.stringify(response, null, 2));
        setFormData(demoData);
        toast.info('No saved data found. Using demo data.');
      }
    } catch (error) {
      console.error('❌ Error fetching about main data:', error);
      console.log('📊 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load about main data. Using demo data.');
      // Keep demo data on error
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

  const handleKeyPointChange = (index, value) => {
    const updatedKeyPoints = [...formData.keyPoints];
    updatedKeyPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      keyPoints: updatedKeyPoints
    }));
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;

    if (isDemoMode) {
      // Demo mode - use base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.result
        }));
        toast.success(`${field} uploaded successfully (Demo mode)`);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      setUploadingImages(prev => ({ ...prev, [field]: true }));

      // Create FormData for API upload
      const imageFormData = new FormData();
      imageFormData.append('files', file); // <-- use 'files' not 'image'
      imageFormData.append('folder', 'about-us'); // Optional: organize uploads

      console.log(`🖼️ Uploading ${field}:`, file.name);

      // Force correct backend URL for upload
      const uploadUrl = 'https://divinecare-backend.onrender.com/api/upload';
      const state = store.getState();
      const token = state?.auth?.token;
      const cleanToken = token ? token.replace(/"/g, '') : null;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` })
        },
        body: imageFormData
      });
      const result = await response.json();
      const uploadedUrl = result?.files?.[0]?.url || result?.imageUrl || result?.url || result?.data?.imageUrl || result?.data?.url;

      if (uploadedUrl) {
        setFormData(prev => ({
          ...prev,
          [field]: uploadedUrl
        }));
        toast.success(`${field} uploaded successfully!`);
        console.log(`✅ ${field} uploaded:`, uploadedUrl);
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error(`❌ Error uploading ${field}:`, error);
      toast.error(`Failed to upload ${field}. Please try again.`);
    } finally {
      setUploadingImages(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.heading.trim()) errors.push('Heading is required');
    if (formData.heading.length > 30) errors.push('Heading must be 30 characters or less');
    if (!formData.smallDescription.trim()) errors.push('Small description is required');
    if (formData.smallDescription.length > 225) errors.push('Small description must be 2 characters or less');
    if (!formData.leftImage1) errors.push('Left image 1 is required');
    if (!formData.leftImage2) errors.push('Left image 2 is required');
    if (!formData.rightImage) errors.push('Right image is required');
    if (!formData.description.trim()) errors.push('Description is required');
    
    // Check if all key points are filled
    formData.keyPoints.forEach((point, index) => {
      if (!point.trim()) errors.push(`Key point ${index + 1} is required`);
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
      toast.success('About Us section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📤 Updating About Main Data:', formData);

      // Prepare payload to match backend structure
      const payload = {
        heading: formData.heading,
        smallDescription: formData.smallDescription,
        mainDescription: formData.description,
        images: [formData.leftImage1, formData.leftImage2, formData.rightImage],
        keyPoints: formData.keyPoints
      };

      const response = await updateAboutMainData({ 
        id: "68ee09ee70e1bfc20b375410", 
        data: payload 
      }).unwrap();

      console.log('✅ Update Response:', response);

      if (response?.success) {
        toast.success(response.message || 'Main About section updated successfully!');
        // Refresh data to show updated values
        setTimeout(() => {
          fetchAboutUsData();
        }, 1000);
      } else {
        toast.error('Failed to update main about section');
      }
    } catch (error) {
      console.error('❌ Error updating about main data:', error);
      toast.error(error?.data?.message || 'Failed to update main about section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading about us data...</p>
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
            <h2 className="mb-1">Edit Main About Section</h2>
            <p className="text-muted mb-0">Manage the main about us section content</p>
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
            form="aboutUsForm"
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
                Save About Section
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="aboutUsForm" onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Basic Information */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Basic Information</h5>
              </Card.Header>
              <Card.Body>
                {/* Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    placeholder="Enter heading"
                    maxLength={30}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.heading.length}/30 characters
                  </Form.Text>
                </Form.Group>

                {/* Small Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Small Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="smallDescription"
                    value={formData.smallDescription}
                    onChange={handleChange}
                    placeholder="Enter small description"
                    maxLength={225}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.smallDescription.length}/225 characters
                  </Form.Text>
                </Form.Group>

                {/* Main Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Main Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description"
                    maxLength={500}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.description.length}/500 characters
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Images */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Images</h5>
              </Card.Header>
              <Card.Body>
                {/* Left Images Row */}
                <Row className="mb-4">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Left Image 1 <span className="text-danger">*</span></Form.Label>
                      <div className="text-center">
                        {formData.leftImage1 && (
                          <Image
                            src={formData.leftImage1}
                            alt="Left Image 1"
                            className="img-fluid rounded mb-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('leftImage1', e.target.files[0])}
                          className="mb-2"
                          disabled={uploadingImages.leftImage1}
                        />
                        {uploadingImages.leftImage1 && (
                          <div className="text-center">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <small className="text-muted">Uploading...</small>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Left Image 2 <span className="text-danger">*</span></Form.Label>
                      <div className="text-center">
                        {formData.leftImage2 && (
                          <Image
                            src={formData.leftImage2}
                            alt="Left Image 2"
                            className="img-fluid rounded mb-2"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('leftImage2', e.target.files[0])}
                          className="mb-2"
                          disabled={uploadingImages.leftImage2}
                        />
                        {uploadingImages.leftImage2 && (
                          <div className="text-center">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <small className="text-muted">Uploading...</small>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Right Image */}
                <Form.Group>
                  <Form.Label>Right Main Image <span className="text-danger">*</span></Form.Label>
                  <div className="text-center">
                    {formData.rightImage && (
                      <Image
                        src={formData.rightImage}
                        alt="Right Main Image"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('rightImage', e.target.files[0])}
                      className="mb-2"
                      disabled={uploadingImages.rightImage}
                    />
                    {uploadingImages.rightImage && (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <small className="text-muted">Uploading...</small>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Key Points Section */}
        <Row>
          <Col xs={12}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">Key Points</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted mb-3">Add three key points that highlight your main features or benefits</p>
                {formData.keyPoints.map((point, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>Key Point {index + 1} <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={point}
                      onChange={(e) => handleKeyPointChange(index, e.target.value)}
                      placeholder={`Enter key point ${index + 1}`}
                      maxLength={80}
                      required
                    />
                    <Form.Text className="text-muted">
                      {point.length}/80 characters
                    </Form.Text>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditMainAboutSection;