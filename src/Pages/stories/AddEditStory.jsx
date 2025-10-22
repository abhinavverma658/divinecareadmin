import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStoryByIdMutation, useCreateStoryMutation, useUpdateStoryMutation, useUploadImageMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaUpload, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getStoryById, { isLoading }] = useGetStoryByIdMutation();
  const [createStory, { isLoading: createLoading }] = useCreateStoryMutation();
  const [updateStory, { isLoading: updateLoading }] = useUpdateStoryMutation();
  const [uploadImage] = useUploadImageMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchStory = async () => {
    if (!id) return;

    try {
      console.log('🔄 Starting Story Data fetch for ID:', id);
      
      const response = await getStoryById(id).unwrap();
      console.log('📥 Story Data Response:', response);
      
      if (response?.success && response?.data) {
        const storyData = response.data;
        setFormData({
          title: storyData.title || '',
          content: storyData.content || '',
          author: storyData.author || '',
          date: storyData.date ? new Date(storyData.date).toISOString().split('T')[0] : '',
          image: storyData.image || ''
        });
        
        if (storyData.image) {
          setImagePreview(storyData.image);
        }
        
        console.log('🎯 Story data populated successfully');
        toast.success('Story data loaded successfully');
      } else {
        console.log('⚠️ No story data found');
        toast.error('Story not found');
        navigate('/dash/stories');
      }
    } catch (error) {
      console.error('❌ Error fetching story data:', error);
      toast.error(error?.data?.message || 'Failed to load story');
      navigate('/dash/stories');
    }
  };

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      console.log('🖼️ Uploading story image:', file.name);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'stories');
      
      const response = await uploadImage(formData).unwrap();
      
      if (response?.imageUrl) {
        setImagePreview(response.imageUrl);
        setFormData(prev => ({ ...prev, image: response.imageUrl }));
        console.log('✅ Story image uploaded:', response.imageUrl);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error) {
      console.error('❌ Error uploading story image:', error);
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

  const uploadImageFile = async () => {
    if (!imageFile) return formData.image;
    
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);
      
      const response = await uploadImage(formDataUpload).unwrap();
      console.log('📤 Image upload response:', response);
      return response.imageUrl;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for story fields
    if (!formData.title.trim()) {
      toast.error('Story title is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Story content is required');
      return;
    }
    if (!formData.author.trim()) {
      toast.error('Author name is required');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }

    try {
      // Upload image if new file selected
      let finalImageUrl = formData.image;
      if (imageFile) {
        const uploadResponse = await uploadImageFile();
        finalImageUrl = uploadResponse;
      }

      // Prepare data for story API
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        date: formData.date,
        image: finalImageUrl
      };

      console.log('📤 Submitting story data:', submitData);
      console.log('📤 Request type:', id ? 'UPDATE' : 'CREATE');

      let response;
      if (id) {
        // Update existing story
        response = await updateStory({ 
          id: id, 
          data: submitData 
        }).unwrap();
      } else {
        // Create new story
        response = await createStory(submitData).unwrap();
      }

      console.log('✅ Story operation successful:', response);
      toast.success(response.message || `Story ${id ? 'updated' : 'created'} successfully!`);
      navigate('/dash/stories');
    } catch (error) {
      console.error('❌ Error submitting story:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = `Failed to ${id ? 'update' : 'create'} story`;
      
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

  const isLoading_ = isLoading || createLoading || updateLoading || uploadingImage;

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/stories')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Stories
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'}</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Story</span>
            </h2>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={12}>
              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Story Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="title"
                        label="Story Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter story title"
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="author"
                        label="Author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        placeholder="Enter author name"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormField
                        type="date"
                        name="date"
                        label="Publication Date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Story Content <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={8}
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your story content here..."
                      style={{ minHeight: '200px' }}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Story Image */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Story Image</h5>
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
                      Upload story image (Max 5MB, JPG/PNG recommended)
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
                      {isLoading_ ? 'Saving...' : (id ? 'Update Story' : 'Create Story')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dash/stories')}
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

export default AddEditStory;