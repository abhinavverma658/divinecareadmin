import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStoryByIdMutation, useCreateStoryMutation, useUpdateStoryMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import TextEditor from '../../Components/TextEditor';
import { FaSave, FaArrowLeft, FaEye, FaImage, FaCalendar, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector(selectAuth);
  
  const [getStoryById, { isLoading: loadingStory }] = useGetStoryByIdMutation();
  const [createStory, { isLoading: createLoading }] = useCreateStoryMutation();
  const [updateStory, { isLoading: updateLoading }] = useUpdateStoryMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    isPublished: false,
    author: user?.name || 'Admin User'
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const isEdit = !!id;
  const isLoading = createLoading || updateLoading;

  useEffect(() => {
    if (isEdit) {
      fetchStory();
    }
  }, [id]);

  const fetchStory = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo story data
        const demoStories = {
          'story1': {
            _id: 'story1',
            title: 'Our Journey to Success',
            content: `This is the story of how our company started from a small idea and grew into what we are today. It began with a simple vision to help people achieve their financial goals.

When we first started, we had nothing but passion and determination. Our founders believed that everyone deserves access to quality financial advice, not just the wealthy. This belief became the cornerstone of our company culture.

Over the years, we've faced numerous challenges. The 2008 financial crisis tested our resolve, but it also proved our resilience. We adapted, evolved, and emerged stronger than ever.

Today, we're proud to serve thousands of clients across the country. Our success is measured not just in profits, but in the dreams we've helped make reality. Every client who achieves their financial goals is a testament to our mission.

Looking forward, we remain committed to innovation while staying true to our core values. The future of finance is digital, and we're leading the charge while maintaining the personal touch that sets us apart.

Our journey continues, and we're excited about what lies ahead. Thank you for being part of our story.`,
            image: '/demo-images/story1.jpg',
            author: 'Admin User',
            isPublished: true,
            createdAt: new Date().toISOString()
          },
          'story2': {
            _id: 'story2',
            title: 'Innovation in Financial Services',
            content: `The financial industry is constantly evolving, and we pride ourselves on staying ahead of the curve. Our latest innovations have revolutionized how people manage their money.

In the early days of fintech, many traditional institutions were slow to adapt. We saw this as an opportunity to bridge the gap between cutting-edge technology and personalized service.

Our first major breakthrough came with the development of our AI-powered financial advisory platform. This tool analyzes market trends, personal spending habits, and financial goals to provide customized recommendations.

But technology is only as good as the people behind it. We've invested heavily in training our team to understand both the technical aspects and the human elements of financial planning.

The pandemic accelerated digital adoption across all industries, and finance was no exception. Our clients appreciated being able to access their accounts, schedule consultations, and receive advice from the safety of their homes.

As we look to the future, we're exploring blockchain technology, cryptocurrency integration, and even more sophisticated AI applications. However, we never lose sight of our primary goal: helping real people achieve real financial success.

Innovation without purpose is just novelty. Our innovations are always driven by our commitment to improving our clients' financial well-being.`,
            image: '/demo-images/story2.jpg',
            author: 'Sarah Johnson',
            isPublished: true,
            createdAt: new Date().toISOString()
          }
        };
        
        const demoStory = demoStories[id];
        if (demoStory) {
          setFormData({
            title: demoStory.title,
            content: demoStory.content,
            image: demoStory.image,
            isPublished: demoStory.isPublished,
            author: demoStory.author
          });
        }
        return;
      }

      // Real API call for production
      const data = await getStoryById(id).unwrap();
      if (data?.story) {
        setFormData({
          title: data.story.title || '',
          content: data.story.content || '',
          image: data.story.image || '',
          isPublished: data.story.isPublished || false,
          author: data.story.author || user?.name || 'Admin User'
        });
      }
    } catch (error) {
      getError(error);
      navigate('/dash/stories');
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

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
    setHasChanges(true);
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.value
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a story title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please write your story content');
      return;
    }

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        const action = isEdit ? 'updated' : 'created';
        toast.success(`Story ${action} successfully! (Demo Mode)`);
        navigate('/dash/stories');
        return;
      }

      // Real API call
      let data;
      if (isEdit) {
        data = await updateStory({ id, data: formData }).unwrap();
      } else {
        data = await createStory(formData).unwrap();
      }
      
      toast.success(data?.message || `Story ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/dash/stories');
    } catch (error) {
      getError(error);
    }
  };

  const handlePublishToggle = () => {
    setFormData(prev => ({
      ...prev,
      isPublished: !prev.isPublished
    }));
    setHasChanges(true);
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  const getWordCount = (content) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
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
              <span style={{ color: 'var(--dark-color)' }}>
                {isEdit ? 'Edit' : 'Create'} Story
              </span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="outline-info"
              onClick={() => setShowPreview(!showPreview)}
              className="me-2"
            >
              <FaEye className="me-1" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
            >
              <FaSave className="me-1" />
              {isLoading ? 'Saving...' : (isEdit ? 'Update Story' : 'Create Story')}
            </Button>
          </div>
        </div>

        <Row>
          {/* Form Section */}
          <Col lg={showPreview ? 6 : 12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Story Details</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Title */}
                  <FormField
                    type="text"
                    name="title"
                    label="Story Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your story title..."
                    required={true}
                  />

                  {/* Image Upload */}
                  <FormField
                    type="image"
                    name="image"
                    label="Story Image"
                    value={formData.image}
                    onChange={handleImageChange}
                    required={false}
                  />

                  {/* Author */}
                  <FormField
                    type="text"
                    name="author"
                    label="Author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Story author..."
                    required={true}
                  />

                  {/* Content Editor */}
                  <div className="mb-3">
                    <label className="form-label">
                      Story Content <span className="text-danger">*</span>
                    </label>
                    <TextEditor
                      description={formData.content}
                      onChange={handleContentChange}
                      placeholder="Write your story here..."
                    />
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">
                        {getWordCount(formData.content)} words • 
                        ~{estimateReadTime(formData.content)} min read
                      </small>
                      <small className="text-muted">
                        Rich text editor with formatting options
                      </small>
                    </div>
                  </div>

                  {/* Publishing Options */}
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Publishing Options</h6>
                      <Form.Check
                        type="checkbox"
                        id="isPublished"
                        name="isPublished"
                        label="Publish this story immediately"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">
                        {formData.isPublished ? 
                          'This story will be visible to website visitors' : 
                          'This story will be saved as a draft'
                        }
                      </small>
                    </Card.Body>
                  </Card>

                  {/* Story Metadata */}
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>Story Information</h6>
                      <Row>
                        <Col md={6}>
                          <div className="d-flex align-items-center mb-2">
                            <FaUser className="text-muted me-2" />
                            <span>Author: {formData.author}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex align-items-center mb-2">
                            <FaCalendar className="text-muted me-2" />
                            <span>{isEdit ? 'Last Updated' : 'Created'}: {new Date().toLocaleDateString()}</span>
                          </div>
                        </Col>
                      </Row>
                      <div className="d-flex align-items-center">
                        <Badge bg={formData.isPublished ? 'success' : 'warning'}>
                          {formData.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={handlePublishToggle}
                          className="p-0 ms-2"
                        >
                          {formData.isPublished ? 'Change to Draft' : 'Publish Now'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Preview Section */}
          {showPreview && (
            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Story Preview</h5>
                </Card.Header>
                <Card.Body>
                  {formData.title || formData.content || formData.image ? (
                    <div className="story-preview">
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt={formData.title}
                          className="img-fluid rounded mb-3"
                          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {formData.title && (
                        <h3 className="mb-3">{formData.title}</h3>
                      )}
                      
                      <div className="d-flex align-items-center text-muted mb-3">
                        <FaUser className="me-1" size={14} />
                        <span className="me-3">{formData.author}</span>
                        <FaCalendar className="me-1" size={14} />
                        <span className="me-3">{new Date().toLocaleDateString()}</span>
                        <span>~{estimateReadTime(formData.content)} min read</span>
                      </div>
                      
                      {formData.content && (
                        <div 
                          className="story-content"
                          dangerouslySetInnerHTML={{ __html: formData.content }}
                        />
                      )}
                    </div>
                  ) : (
                    <Alert variant="info">
                      <FaImage className="me-2" />
                      Start writing your story to see the preview here
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default AddEditStory;