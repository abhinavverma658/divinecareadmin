import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useCreateDocumentMutation, 
  useUpdateDocumentMutation, 
  useGetDocumentByIdMutation,
  useGetDocumentCategoriesMutation 
} from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { 
  FaSave, 
  FaArrowLeft, 
  FaFileUpload,
  FaFileContract,
  FaUserTie,
  FaCalendarAlt,
  FaChartLine,
  FaBook,
  FaBriefcase,
  FaExclamationTriangle,
  FaClock,
  FaGraduationCap,
  FaUniversity,
  FaIdCard,
  FaCalculator,
  FaHandshake,
  FaFolder,
  FaGlobe,
  FaLock,
  FaInfoCircle
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditDocument = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useSelector(selectAuth);
  
  const [createDocument, { isLoading: createLoading }] = useCreateDocumentMutation();
  const [updateDocument, { isLoading: updateLoading }] = useUpdateDocumentMutation();
  const [getDocumentById, { isLoading: loadingDocument }] = useGetDocumentByIdMutation();
  const [getDocumentCategories, { isLoading: loadingCategories }] = useGetDocumentCategoriesMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fileName: '',
    fileUrl: '',
    fileSize: 0,
    isPublic: false,
    isActive: true
  });
  
  const [categories, setCategories] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Icon mapping for categories
  const getCategoryIcon = (categoryKey) => {
    const iconMap = {
      'policies-procedures': FaFileContract,
      'employee-records': FaUserTie,
      'schedules': FaCalendarAlt,
      'performance-reviews': FaChartLine,
      'handbooks': FaBook,
      'job-descriptions': FaBriefcase,
      'disciplinary-actions': FaExclamationTriangle,
      'attendance-records': FaClock,
      'training-records': FaGraduationCap,
      'direct-deposit': FaUniversity,
      'form-i9': FaIdCard,
      'w4-forms': FaCalculator,
      'employment-contracts': FaHandshake,
      'miscellaneous': FaFolder
    };
    return iconMap[categoryKey] || FaFolder;
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchDocument();
    }
  }, [isEdit, id]);

  const fetchCategories = async () => {
    try {
      const response = await getDocumentCategories().unwrap();
      if (response?.success && response?.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      getError(error);
    }
  };

  const fetchDocument = async () => {
    if (!id) return;
    
    try {
      const response = await getDocumentById(id).unwrap();
      if (response?.success && response?.document) {
        const doc = response.document;
        setFormData({
          title: doc.title || '',
          description: doc.description || '',
          category: doc.category || '',
          fileName: doc.fileName || '',
          fileUrl: doc.fileUrl || '',
          fileSize: doc.fileSize || 0,
          isPublic: Boolean(doc.isPublic),
          isActive: Boolean(doc.isActive)
        });
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      getError(error);
      navigate('/dash/documents');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handleFileUpload = (fileUrl) => {
    if (uploadedFile && fileUrl) {
      setFormData(prev => ({
        ...prev,
        fileUrl: fileUrl,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size
      }));
      setHasChanges(true);
    }
  };

  const handleFileChange = (file) => {
    setUploadedFile(file);
  };

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.category && 
           formData.fileUrl && 
           formData.fileName;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Document title is required');
      return false;
    }
    
    if (!formData.category) {
      toast.error('Document category is required');
      return false;
    }
    
    if (!formData.fileUrl) {
      toast.error('File upload is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };
      
      if (isEdit) {
        const data = await updateDocument({ id, data: submitData }).unwrap();
        toast.success(data?.message || 'Document updated successfully!');
      } else {
        const data = await createDocument(submitData).unwrap();
        toast.success(data?.message || 'Document uploaded successfully!');
      }
      
      setHasChanges(false);
      navigate('/dash/documents');
    } catch (error) {
      console.error('Error saving document:', error);
      getError(error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryInfo = (categoryKey) => {
    return categories[categoryKey] || { name: categoryKey, description: '', public: true };
  };

  const isLoading = createLoading || updateLoading || loadingDocument;

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/documents')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Documents
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>
                {isEdit ? 'Edit Document' : 'Upload New Document'}
              </span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
            >
              <FaSave className="me-1" />
              {isLoading ? 'Saving...' : (isEdit ? 'Update Document' : 'Upload Document')}
            </Button>
          </div>
        </div>

        {loadingDocument ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Loading document...</div>
          </div>
        ) : (
          <Row>
            <Col lg={8}>
              <Form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaInfoCircle className="me-2" />
                      Document Information
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12}>
                        <FormField
                          type="text"
                          name="title"
                          label="Document Title *"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter document title..."
                          required={true}
                          maxLength={100}
                        />
                        <small className="text-muted">{formData.title.length}/100 characters</small>
                      </Col>
                      <Col md={12}>
                        <FormField
                          type="textarea"
                          name="description"
                          label="Description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter document description..."
                          rows={3}
                          maxLength={500}
                        />
                        <small className="text-muted">{formData.description.length}/500 characters</small>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Category Selection */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaFolder className="me-2" />
                      Document Category *
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12}>
                        <FormField
                          type="select"
                          name="category"
                          label="Select Category *"
                          value={formData.category}
                          onChange={handleInputChange}
                          options={[
                            { value: '', label: 'Choose a category...' },
                            ...Object.entries(categories).map(([key, category]) => ({
                              value: key,
                              label: category.name
                            }))
                          ]}
                          required={true}
                        />
                      </Col>
                      {formData.category && (
                        <Col md={12}>
                          <Alert variant="info" className="mt-3">
                            <div className="d-flex align-items-start">
                              {React.createElement(getCategoryIcon(formData.category), { 
                                className: 'me-2 mt-1', 
                                size: 16 
                              })}
                              <div>
                                <strong>{getCategoryInfo(formData.category).name}</strong>
                                <div className="small mt-1">
                                  {getCategoryInfo(formData.category).description}
                                </div>
                                <div className="mt-2">
                                  <Badge bg={getCategoryInfo(formData.category).public ? 'info' : 'dark'}>
                                    {getCategoryInfo(formData.category).public ? (
                                      <><FaGlobe className="me-1" />Can be Public</>
                                    ) : (
                                      <><FaLock className="me-1" />Private Only</>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Alert>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>

                {/* File Upload */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaFileUpload className="me-2" />
                      File Upload {!isEdit && '*'}
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12}>
                        <FormField
                          type="image"
                          name="fileUrl"
                          label={isEdit ? "Replace File" : "Upload File *"}
                          value={formData.fileUrl}
                          onChange={(e) => {
                            handleInputChange(e);
                            handleFileUpload(e.target.value);
                          }}
                          required={!isEdit}
                        />
                        {formData.fileName && (
                          <Alert variant="success" className="mt-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Current File:</strong> {formData.fileName}
                                {formData.fileSize > 0 && (
                                  <div className="small text-muted">
                                    Size: {formatFileSize(formData.fileSize)}
                                  </div>
                                )}
                              </div>
                              {formData.fileUrl && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => window.open(formData.fileUrl, '_blank')}
                                >
                                  Preview
                                </Button>
                              )}
                            </div>
                          </Alert>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Settings */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Document Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Check
                          type="switch"
                          id="isActive"
                          name="isActive"
                          label="Active Document"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="mb-3"
                        />
                        <small className="text-muted">
                          Active documents are visible in the admin panel and can be accessed by users.
                        </small>
                      </Col>
                      <Col md={6}>
                        <Form.Check
                          type="switch"
                          id="isPublic"
                          name="isPublic"
                          label="Public Document"
                          checked={formData.isPublic}
                          onChange={handleInputChange}
                          className="mb-3"
                          disabled={formData.category && !getCategoryInfo(formData.category).public}
                        />
                        <small className="text-muted">
                          Public documents are visible on the website. Private documents are admin-only.
                        </small>
                        {formData.category && !getCategoryInfo(formData.category).public && (
                          <Alert variant="warning" className="mt-2 mb-0">
                            <small>
                              <FaLock className="me-1" />
                              This category only supports private documents for security reasons.
                            </small>
                          </Alert>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Form>
            </Col>

            <Col lg={4}>
              {/* Help Card */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaInfoCircle className="me-2" />
                    Upload Guidelines
                  </h6>
                </Card.Header>
                <Card.Body>
                  <ul className="small mb-0">
                    <li>Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Use descriptive titles for better organization</li>
                    <li>Add descriptions to help users understand the content</li>
                    <li>Choose the appropriate category for proper classification</li>
                    <li>Private documents are only visible to admin users</li>
                    <li>Public documents will appear on the website</li>
                  </ul>
                </Card.Body>
              </Card>

              {/* Category Legend */}
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <FaFolder className="me-2" />
                    Document Categories
                  </h6>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {Object.entries(categories).map(([key, category]) => (
                    <div key={key} className="d-flex align-items-start mb-3 pb-2 border-bottom">
                      <div className="me-2 mt-1">
                        {React.createElement(getCategoryIcon(key), { 
                          size: 16, 
                          className: 'text-primary' 
                        })}
                      </div>
                      <div>
                        <strong className="small">{category.name}</strong>
                        <div className="small text-muted">{category.description}</div>
                        <Badge 
                          bg={category.public ? 'info' : 'dark'} 
                          className="mt-1"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {category.public ? 'Public/Private' : 'Private Only'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </MotionDiv>
  );
};

export default AddEditDocument;