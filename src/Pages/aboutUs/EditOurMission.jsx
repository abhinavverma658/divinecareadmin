import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutMissionDataMutation, useUpdateAboutMissionDataMutation, useUploadImageMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';


// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';

const EditOurMission = () => {
  const [formData, setFormData] = useState({
    missionHeading: '',
    missionDescription: '',
    missionImage: '',
    missionPoints: ['', '', '', '']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // API mutations - using Mission endpoints
  const [getAboutMissionData] = useGetAboutMissionDataMutation();
  const [updateAboutMissionData] = useUpdateAboutMissionDataMutation();
  const [uploadImage] = useUploadImageMutation();

  // Demo data for testing
  const demoData = {
    missionHeading: 'Our Mission',
    missionDescription: 'We are dedicated to addressing urgent needs such as clean water, education, healthcare, and food security, ensuring that every person has the foundation. Through targeted programs, sustainable initiatives, & the collective power of compassionate supporters, we strive to make a real and lasting impact.',
    missionImage: 'https://creative-story.s3.amazonaws.com/about/mission-image.jpg',
    missionPoints: [
      'Client-Focused Solutions and Results',
      'Flexible, Value Driven Approach',
      'Warning of updated legal risks for customers',
      'A team of experienced and highly specialized'
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
      console.log('🎭 Demo mode activated for mission, using demo data');
    } else {
      console.log('🔐 Real token found for mission, fetching from API');
      fetchMissionData();
    }
  }, []);

  // Debug form data changes for mission
  useEffect(() => {
    console.log('🔄 Mission form data updated:', {
      missionHeading: formData.missionHeading,
      missionDescription: formData.missionDescription?.substring(0, 50) + '...',
      hasImage: !!formData.missionImage,
      pointsCount: formData.missionPoints?.length,
      points: formData.missionPoints?.map(p => p.substring(0, 30) + '...')
    });
  }, [formData]);

  const fetchMissionData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting About Mission Data fetch...');
      
      const response = await getAboutMissionData().unwrap();
      console.log('📥 About Mission Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      console.log('📋 Response type:', typeof response);
      
      // Check multiple possible response structures
      let data = null;
      
      console.log('🔍 Analyzing mission response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      console.log('🔑 Response keys:', response ? Object.keys(response) : 'No keys');
      
      if (response?.success && response?.mission) {
        data = response.mission;
        console.log('✅ Using response.mission structure (success + mission)');
      } else if (response?.mission) {
        data = response.mission;
        console.log('✅ Using response.mission structure (no success flag)');
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
      
      console.log('📝 Extracted mission data:', data);
      console.log('🔑 Mission data keys:', data ? Object.keys(data) : 'No data keys');
      
      if (data && Object.keys(data).length > 0) {
        console.log('📝 Setting mission form data with:', {
          missionHeading: data.missionHeading || data.heading || 'MISSING',
          missionDescription: data.missionDescription || data.description || 'MISSING',
          missionImage: data.missionImage || data.image || 'MISSING',
          missionPoints: data.missionPoints || data.points || 'MISSING'
        });
        
        const newFormData = {
          missionHeading: data.missionHeading || data.heading || '',
          missionDescription: data.missionDescription || data.description || '',
          missionImage: data.missionImage || data.image || '',
          missionPoints: Array.isArray(data.missionPoints) ? data.missionPoints : 
                        Array.isArray(data.points) ? data.points : 
                        ['', '', '', '']
        };
        
        console.log('🎯 Final mission form data to set:', newFormData);
        setFormData(newFormData);
        toast.success('Mission section data loaded successfully');
      } else {
        console.log('⚠️ No mission data found or empty data object');
        console.log('📊 Full mission response debug:', JSON.stringify(response, null, 2));
        setFormData(demoData);
        toast.info('No saved data found. Using demo data.');
      }
    } catch (error) {
      console.error('❌ Error fetching mission data:', error);
      console.log('📊 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load mission data. Using demo data.');
      setFormData(demoData);
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

  const handlePointChange = (index, value) => {
    const updatedPoints = [...formData.missionPoints];
    updatedPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      missionPoints: updatedPoints
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (isDemoMode) {
      // Demo mode - use base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          missionImage: e.target.result
        }));
        toast.success('Mission image uploaded successfully (Demo mode)');
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      setUploadingImage(true);
      // Create FormData for API upload
      const formData = new FormData();
      formData.append('files', file); // Use 'files' key for backend compatibility
      formData.append('folder', 'about-us/mission');
      console.log('🖼️ Uploading mission image:', file.name);
      const response = await uploadImage(formData).unwrap();
      // Support multiple possible keys for image URL, including files[0].url
      let imageUrl = response?.imageUrl || response?.url || response?.data?.imageUrl || response?.data?.url;
      if (!imageUrl && Array.isArray(response?.files) && response.files[0]?.url) {
        imageUrl = response.files[0].url;
      }
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          missionImage: imageUrl
        }));
        toast.success('Mission image uploaded successfully!');
        console.log('✅ Mission image uploaded:', imageUrl);
      } else {
        console.error('❌ Upload response:', response);
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading mission image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.missionHeading.trim()) errors.push('Mission heading is required');
    if (!formData.missionDescription.trim()) errors.push('Mission description is required');
    if (!formData.missionImage) errors.push('Mission image is required');
    
    // Check if all mission points are filled
    formData.missionPoints.forEach((point, index) => {
      if (!point.trim()) errors.push(`Mission point ${index + 1} is required`);
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
      toast.success('Our Mission section updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      // Map frontend keys to backend keys
      const payload = {
        heading: formData.missionHeading,
        description: formData.missionDescription,
        image: formData.missionImage,
        points: formData.missionPoints
      };
      console.log('📤 Updating About Mission Data (payload):', payload);
      const response = await updateAboutMissionData({ 
        id: "68ee0bc170e1bfc20b375413", 
        data: payload 
      }).unwrap();
      console.log('✅ Update Response:', response);
      if (response?.success) {
        toast.success(response.message || 'Mission section updated successfully!');
        // Refresh data to show updated values
        setTimeout(() => {
          fetchMissionData();
        }, 1000);
      } else {
        toast.error('Failed to update mission section');
      }
    } catch (error) {
      console.error('❌ Error updating mission data:', error);
      toast.error(error?.data?.message || 'Failed to update mission section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading mission data...</p>
      </Container>
    );
  }

  const getImageUrl = (val) =>
  !val ? '' : /^https?:\/\//i.test(val) ? val : `${BASE_URL.replace(/\/$/, '')}/${val.replace(/^\/+/, '')}`;

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
            <h2 className="mb-1">Edit Our Mission Section</h2>
            <p className="text-muted mb-0">Manage the mission section content</p>
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
            form="missionForm"
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
                Save Mission Section
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="missionForm" onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Mission Content */}
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Mission Content</h5>
              </Card.Header>
              <Card.Body>
                {/* Mission Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Mission Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="missionHeading"
                    value={formData.missionHeading}
                    onChange={handleChange}
                    placeholder="Enter mission heading"
                    maxLength={60}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.missionHeading.length}/60 characters
                  </Form.Text>
                </Form.Group>

                {/* Mission Description */}
                <Form.Group className="mb-4">
                  <Form.Label>Mission Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="missionDescription"
                    value={formData.missionDescription}
                    onChange={handleChange}
                    placeholder="Enter detailed mission description"
                    maxLength={500}
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.missionDescription.length}/500 characters
                  </Form.Text>
                </Form.Group>

                {/* Mission Points */}
                <h6 className="mb-3">Mission Points</h6>
                {formData.missionPoints.map((point, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>Mission Point {index + 1} <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      placeholder={`Enter mission point ${index + 1}`}
                      maxLength={100}
                      required
                    />
                    <Form.Text className="text-muted">
                      {point.length}/100 characters
                    </Form.Text>
                  </Form.Group>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Mission Image */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Mission Image</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Left Column Image <span className="text-danger">*</span></Form.Label>
                  <div className="text-center">
                    {formData.missionImage && (
                      <Image
                        src={getImageUrl(formData.missionImage)}
                        alt="Mission Image"
                        className="img-fluid rounded mb-3"
                        style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                      />
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      className="mb-3"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="text-center mb-3">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <small className="text-muted">Uploading...</small>
                      </div>
                    )}
                    <Form.Text className="text-muted">
                      This image will appear on the left column of the mission section
                    </Form.Text>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditOurMission;