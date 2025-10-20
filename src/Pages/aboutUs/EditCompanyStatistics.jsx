import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetAboutCompanyDataMutation, useUpdateAboutCompanyDataMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const EditCompanyStatistics = () => {
  const [formData, setFormData] = useState({
    statsHeading: '',
    statsDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: '',
    stat3Number: '',
    stat3Label: '',
    stat4Number: '',
    stat4Label: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // API mutations - using Company endpoints
  const [getAboutCompanyData] = useGetAboutCompanyDataMutation();
  const [updateAboutCompanyData] = useUpdateAboutCompanyDataMutation();

  // Demo data for testing
  const demoData = {
    statsHeading: 'Highest Ambition is to Help People',
    statsDescription: 'Our impact is reflected in the numbers—and each statistic represents lives changed and futures improved over the past year alone.',
    ctaButtonText: 'Donate Now',
    ctaButtonLink: '/donate',
    stat1Number: '12+',
    stat1Label: 'Years of Fundation',
    stat2Number: '69+',
    stat2Label: 'Monthly Donate',
    stat3Number: '3+',
    stat3Label: 'Global Partners',
    stat4Number: '93+',
    stat4Label: 'Project Complete'
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === '"demo-token"') {
      setIsDemoMode(true);
      setFormData(demoData);
      console.log('🎭 Demo mode activated for statistics, using demo data');
    } else {
      console.log('🔐 Real token found for statistics, fetching from API');
      fetchStatisticsData();
    }
  }, []);

  // Debug form data changes for statistics
  useEffect(() => {
    console.log('🔄 Statistics form data updated:', {
      statsHeading: formData.statsHeading,
      statsDescription: formData.statsDescription?.substring(0, 50) + '...',
      ctaButton: formData.ctaButtonText,
      statistics: {
        stat1: `${formData.stat1Number} - ${formData.stat1Label}`,
        stat2: `${formData.stat2Number} - ${formData.stat2Label}`,
        stat3: `${formData.stat3Number} - ${formData.stat3Label}`,
        stat4: `${formData.stat4Number} - ${formData.stat4Label}`
      }
    });
  }, [formData]);

  const fetchStatisticsData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Starting About Company Data fetch...');
      
      const response = await getAboutCompanyData().unwrap();
      console.log('📥 About Company Data Response:', response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      console.log('📋 Response type:', typeof response);
      
      // Check multiple possible response structures
      let data = null;
      
      console.log('🔍 Analyzing company response structure:');
      console.log('📊 Response:', JSON.stringify(response, null, 2));
      console.log('🔑 Response keys:', response ? Object.keys(response) : 'No keys');
      
      if (response?.success && response?.company) {
        data = response.company;
        console.log('✅ Using response.company structure (success + company)');
      } else if (response?.company) {
        data = response.company;
        console.log('✅ Using response.company structure (no success flag)');
      } else if (response?.success && response?.statistics) {
        data = response.statistics;
        console.log('✅ Using response.statistics structure (success + statistics)');
      } else if (response?.statistics) {
        data = response.statistics;
        console.log('✅ Using response.statistics structure (no success flag)');
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
      
      console.log('📝 Extracted company data:', data);
      console.log('🔑 Company data keys:', data ? Object.keys(data) : 'No data keys');
      
      if (data && Object.keys(data).length > 0) {
        console.log('📝 Setting company form data with:', {
          statsHeading: data.statsHeading || data.heading || 'MISSING',
          statsDescription: data.statsDescription || data.description || 'MISSING',
          ctaButtonText: data.ctaButtonText || data.buttonText || 'MISSING',
          ctaButtonLink: data.ctaButtonLink || data.buttonLink || 'MISSING',
          stat1Number: data.stat1Number || data.statistics?.[0]?.number || 'MISSING',
          stat1Label: data.stat1Label || data.statistics?.[0]?.label || 'MISSING',
          stat2Number: data.stat2Number || data.statistics?.[1]?.number || 'MISSING',
          stat2Label: data.stat2Label || data.statistics?.[1]?.label || 'MISSING',
          stat3Number: data.stat3Number || data.statistics?.[2]?.number || 'MISSING',
          stat3Label: data.stat3Label || data.statistics?.[2]?.label || 'MISSING',
          stat4Number: data.stat4Number || data.statistics?.[3]?.number || 'MISSING',
          stat4Label: data.stat4Label || data.statistics?.[3]?.label || 'MISSING'
        });
        
        const newFormData = {
          statsHeading: data.statsHeading || data.heading || '',
          statsDescription: data.statsDescription || data.description || '',
          ctaButtonText: data.ctaButtonText || data.buttonText || '',
          ctaButtonLink: data.ctaButtonLink || data.buttonLink || '',
          stat1Number: data.stat1Number || data.statistics?.[0]?.number || '',
          stat1Label: data.stat1Label || data.statistics?.[0]?.label || '',
          stat2Number: data.stat2Number || data.statistics?.[1]?.number || '',
          stat2Label: data.stat2Label || data.statistics?.[1]?.label || '',
          stat3Number: data.stat3Number || data.statistics?.[2]?.number || '',
          stat3Label: data.stat3Label || data.statistics?.[2]?.label || '',
          stat4Number: data.stat4Number || data.statistics?.[3]?.number || '',
          stat4Label: data.stat4Label || data.statistics?.[3]?.label || ''
        };
        
        console.log('🎯 Final company form data to set:', newFormData);
        setFormData(newFormData);
        toast.success('Company statistics data loaded successfully');
      } else {
        console.log('⚠️ No company statistics data found or empty data object');
        console.log('📊 Full company response debug:', JSON.stringify(response, null, 2));
        setFormData(demoData);
        toast.info('No saved data found. Using demo data.');
      }
    } catch (error) {
      console.error('❌ Error fetching company statistics data:', error);
      console.log('📊 Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      toast.error('Failed to load company statistics data. Using demo data.');
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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.statsHeading.trim()) errors.push('Statistics heading is required');
    if (!formData.statsDescription.trim()) errors.push('Statistics description is required');
    if (!formData.ctaButtonText.trim()) errors.push('CTA button text is required');
    if (!formData.ctaButtonLink.trim()) errors.push('CTA button link is required');
    
    // Validate all 4 statistics
    if (!formData.stat1Number.trim()) errors.push('Statistic 1 number is required');
    if (!formData.stat1Label.trim()) errors.push('Statistic 1 label is required');
    if (!formData.stat2Number.trim()) errors.push('Statistic 2 number is required');
    if (!formData.stat2Label.trim()) errors.push('Statistic 2 label is required');
    if (!formData.stat3Number.trim()) errors.push('Statistic 3 number is required');
    if (!formData.stat3Label.trim()) errors.push('Statistic 3 label is required');
    if (!formData.stat4Number.trim()) errors.push('Statistic 4 number is required');
    if (!formData.stat4Label.trim()) errors.push('Statistic 4 label is required');

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
      toast.success('Company Statistics updated successfully! (Demo mode)');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📤 Updating About Company Data:', formData);
      
      const response = await updateAboutCompanyData({ 
        id: "68ee145370e1bfc20b375419", 
        data: formData 
      }).unwrap();
      
      console.log('✅ Update Response:', response);
      
      if (response?.success) {
        toast.success(response.message || 'Company Statistics updated successfully!');
        // Refresh data to show updated values
        setTimeout(() => {
          fetchStatisticsData();
        }, 1000);
      } else {
        toast.error('Failed to update company statistics section');
      }
    } catch (error) {
      console.error('❌ Error updating company statistics data:', error);
      toast.error(error?.data?.message || 'Failed to update statistics section');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <Container fluid className="px-4 py-3 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading statistics data...</p>
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
            <h2 className="mb-1">Edit Company Statistics</h2>
            <p className="text-muted mb-0">Manage the company statistics section content</p>
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
            form="statisticsForm"
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
                Save Statistics
              </>
            )}
          </Button>
        </div>
      </div>

      <Form id="statisticsForm" onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Main Content */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaChartBar className="me-2" />
                  Main Content
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Statistics Heading */}
                <Form.Group className="mb-3">
                  <Form.Label>Statistics Heading <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="statsHeading"
                    value={formData.statsHeading}
                    onChange={handleChange}
                    placeholder="Enter statistics heading"
                    required
                  />
                </Form.Group>

                {/* Statistics Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Statistics Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="statsDescription"
                    value={formData.statsDescription}
                    onChange={handleChange}
                    placeholder="Enter statistics description"
                    required
                  />
                </Form.Group>

                {/* CTA Button */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CTA Button Text <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="ctaButtonText"
                        value={formData.ctaButtonText}
                        onChange={handleChange}
                        placeholder="e.g., Donate Now"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CTA Button Link <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="ctaButtonLink"
                        value={formData.ctaButtonLink}
                        onChange={handleChange}
                        placeholder="e.g., /donate or https://example.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Statistics */}
          <Col lg={6} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Statistics (4 Stats)</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {/* Statistic 1 */}
                  <Col md={6} className="mb-3">
                    <h6 className="text-primary">Statistic 1</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat1Number"
                        value={formData.stat1Number}
                        onChange={handleChange}
                        placeholder="e.g., 12+"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat1Label"
                        value={formData.stat1Label}
                        onChange={handleChange}
                        placeholder="e.g., Years of Foundation"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Statistic 2 */}
                  <Col md={6} className="mb-3">
                    <h6 className="text-info">Statistic 2</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat2Number"
                        value={formData.stat2Number}
                        onChange={handleChange}
                        placeholder="e.g., 69+"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat2Label"
                        value={formData.stat2Label}
                        onChange={handleChange}
                        placeholder="e.g., Monthly Donate"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Statistic 3 */}
                  <Col md={6} className="mb-3">
                    <h6 className="text-warning">Statistic 3</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat3Number"
                        value={formData.stat3Number}
                        onChange={handleChange}
                        placeholder="e.g., 3+"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat3Label"
                        value={formData.stat3Label}
                        onChange={handleChange}
                        placeholder="e.g., Global Partners"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Statistic 4 */}
                  <Col md={6} className="mb-3">
                    <h6 className="text-danger">Statistic 4</h6>
                    <Form.Group className="mb-2">
                      <Form.Label>Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat4Number"
                        value={formData.stat4Number}
                        onChange={handleChange}
                        placeholder="e.g., 93+"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Label <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="stat4Label"
                        value={formData.stat4Label}
                        onChange={handleChange}
                        placeholder="e.g., Project Complete"
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

export default EditCompanyStatistics;