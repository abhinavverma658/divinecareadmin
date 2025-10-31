import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { useGetStoriesMutation, useDeleteStoryMutation, useToggleStoryStatusMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import DeleteModal from '../../Components/DeleteModal';
import SearchField from '../../Components/SearchField';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImage, FaCalendar, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const Stories = () => {
  const [getStories, { isLoading }] = useGetStoriesMutation();
  const [deleteStory, { isLoading: deleteLoading }] = useDeleteStoryMutation();
  const [toggleStoryStatus, { isLoading: toggleLoading }] = useToggleStoryStatusMutation();
  
  const { token } = useSelector(selectAuth);
  const navigate = useNavigate();
  
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchStories = async () => {
    try {
      console.log('🔄 Starting Stories Data fetch...');
      
      const response = await getStories().unwrap();
      console.log('📥 Stories Data Response:', response);
      
      // Check multiple possible response structures
      let storiesData = null;
      
      if (response?.success && response?.stories) {
        storiesData = response.stories;
        console.log('✅ Using response.stories structure');
      } else if (response?.stories) {
        storiesData = response.stories;
        console.log('✅ Using response.stories structure (no success flag)');
      } else if (response?.success && response?.data) {
        storiesData = response.data;
        console.log('✅ Using response.data structure');
      } else if (response?.data && !response?.success) {
        storiesData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (Array.isArray(response)) {
        storiesData = response;
        console.log('✅ Using response directly as array');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        storiesData = response;
        console.log('✅ Using response directly as data');
      }
      
      if (Array.isArray(storiesData) && storiesData.length >= 0) {
        console.log('🎯 Setting stories data:', storiesData);
        setStories(storiesData);
        setFilteredStories(storiesData);
        
        if (storiesData.length === 0) {
          toast.info('No stories found. Create your first story!');
        } else {
          toast.success(`${storiesData.length} stories loaded successfully`);
        }
      } else {
        console.log('⚠️ No stories data found');
        setStories([]);
        setFilteredStories([]);
        toast.info('No stories found.');
      }
    } catch (error) {
      console.error('❌ Error fetching stories data:', error);
      toast.error('Failed to load stories. Please try again.');
      setStories([]);
      setFilteredStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStories(filtered);
    } else {
      setFilteredStories(stories);
    }
  }, [searchTerm, stories]);

  const handleDeleteStory = async () => {
    try {
      if (token && token.startsWith("demo-token")) {
        // Demo mode - simulate deletion
        setStories(prev => prev.filter(story => story._id !== selectedStory._id));
        setFilteredStories(prev => prev.filter(story => story._id !== selectedStory._id));
        toast.success('Story deleted successfully (Demo)');
        setShowDeleteModal(false);
        setSelectedStory(null);
        return;
      }

      // Real API call
      const data = await deleteStory(selectedStory._id).unwrap();
      toast.success(data?.message || 'Story deleted successfully');
      fetchStories();
      setShowDeleteModal(false);
      setSelectedStory(null);
    } catch (error) {
      getError(error);
    }
  };

  const handleToggleStatus = async (story) => {
    try {
      if (token && token.startsWith("demo-token")) {
        // Demo mode - simulate status toggle
        const updatedStories = stories.map(s => 
          s._id === story._id ? { ...s, isPublished: !(s.isPublished === true) } : s
        );
        setStories(updatedStories);
        setFilteredStories(updatedStories);
        toast.success(`Story ${story.isPublished === true ? 'unpublished' : 'published'} successfully (Demo)`);
        return;
      }

      // Real API call
      const data = await toggleStoryStatus({ 
        id: story._id, 
        isPublished: !(story.isPublished === true)
      }).unwrap();
      toast.success(data?.message || 'Story status updated successfully');
      fetchStories();
    } catch (error) {
      getError(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getStats = () => {
    const published = stories.filter(story => story.isPublished === true).length;
    const drafts = stories.filter(story => story.isPublished !== true).length;
    const totalViews = stories.reduce((sum, story) => sum + (story.views || 0), 0);
    
    return { published, drafts, total: stories.length, totalViews };
  };

  const stats = getStats();

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Stories</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Management</span>
            </h2>
            <p className="text-muted mb-0">
              Manage your company stories and share your journey with the world
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/dash/stories/add')}
          >
            <FaPlus className="me-1" />
            Add New Story
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="h3 mb-0 text-primary">
                  {isLoading ? <Skeleton width={40} /> : stats.total}
                </div>
                <small className="text-muted">Total Stories</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="h3 mb-0 text-success">
                  {isLoading ? <Skeleton width={40} /> : stats.published}
                </div>
                <small className="text-muted">Published</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="h3 mb-0 text-warning">
                  {isLoading ? <Skeleton width={40} /> : stats.drafts}
                </div>
                <small className="text-muted">Drafts</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <div className="h3 mb-0 text-info">
                  {isLoading ? <Skeleton width={40} /> : stats.totalViews}
                </div>
                <small className="text-muted">Total Views</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Row className="mb-4">
          <Col md={6}>
            <SearchField
              placeholder="Search stories by title, content, or author..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </Col>
        </Row>

        {/* Stories Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">All Stories ({filteredStories.length})</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {isLoading ? (
              <div className="p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="d-flex align-items-center mb-3">
                    <Skeleton circle width={60} height={60} className="me-3" />
                    <div className="grow">
                      <Skeleton height={20} width="80%" className="mb-2" />
                      <Skeleton height={16} width="60%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredStories.length === 0 ? (
              <Alert variant="info" className="m-4">
                <div className="text-center">
                  <FaImage size={50} className="text-muted mb-3" />
                  <h5>No Stories Found</h5>
                  <p className="mb-3">
                    {searchTerm ? 
                      'No stories match your search criteria.' : 
                      'You haven\'t created any stories yet.'
                    }
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/dash/stories/add')}
                  >
                    <FaPlus className="me-1" />
                    Create Your First Story
                  </Button>
                </div>
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Story</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStories.map((story) => (
                      <tr key={story._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              {story.image ? (
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center bg-light"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <FaImage className="text-muted" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-1">{story.title}</h6>
                              <div className="text-muted small mb-0" style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span dangerouslySetInnerHTML={{ __html: truncateContent(story.content, 80) }} />
                              </div>
                              {story.readTime && (
                                <small className="text-muted">
                                  <FaCalendar className="me-1" />
                                  {story.readTime}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUser className="text-muted me-1" size={14} />
                            {story.author}
                          </div>
                        </td>
                        <td>
                          <Badge bg={story.isPublished === true ? 'success' : 'warning'}>
                            {story.isPublished === true ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(story.createdAt)}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => {
                                setSelectedStory(story);
                                setShowPreviewModal(true);
                              }}
                              title="Preview Story"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/dash/stories/edit/${story._id}`)}
                              title="Edit Story"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant={story.isPublished === true ? 'outline-warning' : 'outline-success'}
                              size="sm"
                              onClick={() => handleToggleStatus(story)}
                              disabled={toggleLoading}
                              title={story.isPublished === true ? 'Unpublish' : 'Publish'}
                            >
                              {story.isPublished === true ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedStory(story);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Story"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Delete Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteStory}
          title="Delete Story"
          message={`Are you sure you want to delete "${selectedStory?.title}"? This action cannot be undone.`}
          isLoading={deleteLoading}
        />

        {/* Preview Modal */}
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Story Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedStory && (
              <div>
                {selectedStory.image && (
                  <img
                    src={selectedStory.image}
                    alt={selectedStory.title}
                    className="img-fluid rounded mb-3"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                  />
                )}
                <h3>{selectedStory.title}</h3>
                <div className="d-flex align-items-center text-muted mb-3">
                  <FaUser className="me-1" size={14} />
                  <span className="me-3">{selectedStory.author}</span>
                  <FaCalendar className="me-1" size={14} />
                  <span>{formatDate(selectedStory.createdAt)}</span>
                  {selectedStory.readTime && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{selectedStory.readTime}</span>
                    </>
                  )}
                </div>
                <div className="story-content">
                  <div dangerouslySetInnerHTML={{ __html: selectedStory.content }} />
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
            {selectedStory && (
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowPreviewModal(false);
                  navigate(`/dash/stories/edit/${selectedStory._id}`);
                }}
              >
                Edit Story
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default Stories;