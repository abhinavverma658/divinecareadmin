import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutUsDataMutation, useUpdateAboutUsDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditOurMission = () => {
  const [formData, setFormData] = useState({
    missionHeading: '',
    missionDescription: '',
    missionImage: '',
    missionPoints: ['', '', '', '']
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using existing About Us endpoints
  const [getAboutUsData] = useGetAboutUsDataMutation();
  const [updateAboutUsData] = useUpdateAboutUsDataMutation();

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
    } else {
      fetchMissionData();
    }
  }, []);

  const fetchMissionData = async () => {
    try {
      setIsLoading(true);
      const response = await getAboutUsData().unwrap();
      if (response?.data) {
        setFormData({
          missionHeading: response.data.missionHeading || '',
          missionDescription: response.data.missionDescription || '',
          missionImage: response.data.missionImage || '',
          missionPoints: response.data.missionPoints || ['', '', '', '']
        });
      }
    } catch (error) {
      console.error('Error fetching mission data:', error);
      toast.error('Failed to load mission data');
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

  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          missionImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
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
      const response = await updateAboutUsData(formData).unwrap();
      
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Our Mission section updated successfully!');
      }
    } catch (error) {
      console.error('Error updating mission data:', error);
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
                    required
                  />
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
                    required
                  />
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
                      required
                    />
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
                        src={formData.missionImage}
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
                    />
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