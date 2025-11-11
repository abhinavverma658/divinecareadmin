import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Image, InputGroup, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStoryByIdMutation, useCreateStoryMutation, useUpdateStoryMutation, useUploadImageMutation } from '../../features/apiSlice';
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
      
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Demo mode - use mock data
        console.log('🎭 Demo mode: Using mock story data');
        const mockStoryData = {
          _id: id,
          title: 'Sample Story Title',
          content: '<p>This is a sample story content in demo mode. You can edit this content and see how it works in the story editor.</p>',
          author: 'Demo Author',
          date: new Date().toISOString(),
          image: 'https://via.placeholder.com/600x400/007bff/ffffff?text=Demo+Story+Image',
          isPublished: Math.random() > 0.5,
          createdAt: new Date().toISOString()
        };
        
        setFormData({
          title: mockStoryData.title,
          content: mockStoryData.content,
          author: mockStoryData.author,
          date: new Date(mockStoryData.date).toISOString().split('T')[0],
          image: mockStoryData.image
        });
        
        if (mockStoryData.image) {
          setImagePreview(mockStoryData.image);
        }
        
        console.log('🎯 Demo story data populated successfully');
        toast.success('Demo story data loaded successfully');
        return;
      }
      
      const response = await getStoryById(id).unwrap();
      console.log('📥 Story Data Response:', response);
      
      // Check multiple possible response structures (similar to Stories.jsx)
      let storyData = null;
      
      if (response?.success && response?.data) {
        storyData = response.data;
        console.log('✅ Using response.data structure');
      } else if (response?.data && !response?.success) {
        storyData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (response?.success && response?.story) {
        storyData = response.story;
        console.log('✅ Using response.story structure');
      } else if (response?.story) {
        storyData = response.story;
        console.log('✅ Using response.story structure (no success flag)');
      } else if (response && typeof response === 'object' && response._id) {
        storyData = response;
        console.log('✅ Using response directly as story data');
      }
      
      if (storyData && storyData._id) {
        setFormData({
          title: storyData.title || '',
          content: storyData.content || '',
          author: storyData.author || '',
          date: storyData.date ? new Date(storyData.date).toISOString().split('T')[0] : '',
          image: storyData.image || '',
          imageKey: storyData.imageKey || ''
        });
        
        if (storyData.image) {
          setImagePreview(storyData.image);
        }
        
        console.log('🎯 Story data populated successfully');
        toast.success('Story data loaded successfully');
      } else {
        console.log('⚠️ No story data found or invalid story structure');
        console.log('⚠️ Response structure:', response);
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

  useEffect(() => {
    const applyRedAsterisks = () => {
      const labels = document.querySelectorAll('label, .form-label, h5, .text-danger');
      labels.forEach(label => {
        if (label.innerHTML && label.innerHTML.includes('*')) {
          label.innerHTML = label.innerHTML.replace(/\*/g, '<span style="color: red; font-weight: bold;">*</span>');
        }
      });
    };
    applyRedAsterisks();
    const timeoutId = setTimeout(applyRedAsterisks, 100);
    return () => clearTimeout(timeoutId);
  }, [formData]);

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
      formData.append('files', file); // Use 'files' key for backend
      formData.append('folder', 'stories');

      const response = await uploadImage(formData).unwrap();
      // Expecting response.files[0].url
      const fileObj = response?.files?.[0] || {};
      const imageUrl = fileObj.url;
      const imageKey = fileObj.key || fileObj.objectKey || fileObj.antrykKey;
      if (imageUrl) {
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl, imageKey: imageKey || '' }));
        console.log('✅ Story image uploaded:', imageUrl, 'key:', imageKey);
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
    setFormData(prev => ({ ...prev, image: '', imageKey: '' }));
  };

  const uploadImageFile = async () => {
    if (!imageFile) return formData.image;
    
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('files', imageFile); // Use 'files' key for backend
      formDataUpload.append('folder', 'stories');

      const response = await uploadImage(formDataUpload).unwrap();
      console.log('📤 Image upload response:', response);
      // Expecting response.files[0].url
  const fileObj = response?.files?.[0] || {};
  const imageUrl = fileObj.url;
  const imageKey = fileObj.key || fileObj.objectKey || fileObj.antrykKey;
  if (!imageUrl) throw new Error('No image URL returned from server');
  // Persist imageKey into formData so submit includes it
  setFormData(prev => ({ ...prev, image: imageUrl, imageKey: imageKey || '' }));
  return { url: imageUrl, key: imageKey };
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
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Demo mode - simulate save
        console.log('🎭 Demo mode: Simulating story save operation');
        toast.success(`Story ${id ? 'updated' : 'created'} successfully! (Demo Mode)`);
        navigate('/dash/stories');
        return;
      }

      // Upload image if new file selected
      let finalImageUrl = formData.image;
      if (imageFile) {
        const uploadResponse = await uploadImageFile();
        finalImageUrl = uploadResponse?.url || uploadResponse || finalImageUrl;
      }

      // Prepare data for story API (match required structure)
      const submitData = {
        title: formData.title.trim(),
        image: finalImageUrl,
        imageKey: formData.imageKey || undefined,
        author: formData.author.trim(),
        content: formData.content.trim(),
        date: new Date(formData.date).toISOString(),
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

  const getImageUrl = (val) =>
  !val ? '' : /^https?:\/\//i.test(val) ? val : `${BASE_URL.replace(/\/$/, '')}/${val.replace(/^\/+/, '')}`;


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
                        label="Story Title *"
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
                        label="Author *"
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
                        label="Publication Date *"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Story Content <span className="text-danger">*</span></Form.Label>
                    <TextEditor
                      value={typeof formData.content === 'string' ? formData.content : ''}
                      onChange={value => setFormData(prev => ({ ...prev, content: value }))}
                      placeholder="Write your story content here..."
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
                        src={getImageUrl(imagePreview)}
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