import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Accordion } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMenuItemByIdMutation, useCreateMenuItemMutation, useUpdateMenuItemMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaLink, FaHome, FaCaretDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getMenuItemById, { isLoading }] = useGetMenuItemByIdMutation();
  const [createMenuItem, { isLoading: createLoading }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: updateLoading }] = useUpdateMenuItemMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'page',
    url: '',
    pageId: '',
    isExternal: false,
    isActive: true,
    icon: '',
    description: '',
    openInNewTab: false,
    children: []
  });

  const menuTypes = [
    { value: 'page', label: 'Internal Page', icon: FaHome, description: 'Link to a page within your website' },
    { value: 'link', label: 'External Link', icon: FaLink, description: 'Link to an external website' },
    { value: 'dropdown', label: 'Dropdown Menu', icon: FaCaretDown, description: 'Parent menu with sub-items' }
  ];

  const commonPages = [
    { value: 'home', label: 'Home Page' },
    { value: 'about', label: 'About Us' },
    { value: 'services', label: 'Services' },
    { value: 'contact', label: 'Contact' },
    { value: 'blog', label: 'Blog' },
    { value: 'team', label: 'Team' },
    { value: 'events', label: 'Events' }
  ];

  const commonIcons = [
    'home', 'info-circle', 'cog', 'envelope', 'newspaper', 'question-circle',
    'users', 'chart-line', 'dollar-sign', 'calendar', 'phone', 'map-marker-alt',
    'star', 'heart', 'thumbs-up', 'eye', 'download', 'upload', 'search', 'filter'
  ];

  const fetchMenuItem = async () => {
    if (!id) return;

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on id
        const demoData = {
          _id: id,
          title: 'Sample Menu Item',
          type: 'page',
          url: '/sample',
          pageId: 'about',
          isExternal: false,
          isActive: true,
          icon: 'info-circle',
          description: 'Sample menu item description',
          openInNewTab: false,
          children: [
            {
              _id: 'child1',
              title: 'Sub Item 1',
              type: 'page',
              url: '/sample/sub1',
              isExternal: false,
              isActive: true,
              order: 1
            }
          ]
        };
        
        setFormData(demoData);
        return;
      }

      // Real API call for production
      const data = await getMenuItemById(id).unwrap();
      setFormData(data?.menuItem || {});
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMenuItem();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate URL for page type
    if (name === 'pageId' && formData.type === 'page') {
      const selectedPage = commonPages.find(page => page.value === value);
      if (selectedPage) {
        setFormData(prev => ({
          ...prev,
          url: value === 'home' ? '/' : `/${value}`,
          title: prev.title || selectedPage.label
        }));
      }
    }

    // Clear pageId when type changes
    if (name === 'type' && value !== 'page') {
      setFormData(prev => ({
        ...prev,
        pageId: '',
        url: value === 'dropdown' ? '#' : prev.url
      }));
    }
  };

  const addChildItem = () => {
    setFormData(prev => ({
      ...prev,
      children: [
        ...prev.children,
        {
          title: '',
          type: 'page',
          url: '',
          isExternal: false,
          isActive: true,
          order: prev.children.length + 1
        }
      ]
    }));
  };

  const removeChildItem = (index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChildItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        order: formData.order || 999 // Will be adjusted by backend
      };

      const data = id 
        ? await updateMenuItem({ id, data: submitData }).unwrap()
        : await createMenuItem(submitData).unwrap();
      
      toast.success(data?.message || `Menu item ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/navigation-menu');
    } catch (error) {
      getError(error);
    }
  };

  const isLoading_ = isLoading || createLoading || updateLoading;

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/navigation-menu')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Menu
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'}</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Menu Item</span>
            </h2>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              {/* Basic Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="title"
                        label="Menu Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter menu title"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Menu Type <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          required
                        >
                          {menuTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          {menuTypes.find(t => t.value === formData.type)?.description}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Page Selection for Page Type */}
                  {formData.type === 'page' && (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Select Page</Form.Label>
                          <Form.Select
                            name="pageId"
                            value={formData.pageId}
                            onChange={handleChange}
                          >
                            <option value="">Custom URL</option>
                            {commonPages.map(page => (
                              <option key={page.value} value={page.value}>
                                {page.label}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Select a predefined page or use custom URL below
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <FormField
                          type="text"
                          name="url"
                          label="URL Path"
                          value={formData.url}
                          onChange={handleChange}
                          required
                          placeholder="/your-page-url"
                        />
                      </Col>
                    </Row>
                  )}

                  {/* URL for Link Type */}
                  {formData.type === 'link' && (
                    <Row>
                      <Col md={8}>
                        <FormField
                          type="url"
                          name="url"
                          label="External URL"
                          value={formData.url}
                          onChange={handleChange}
                          required
                          placeholder="https://example.com"
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>&nbsp;</Form.Label>
                          <Form.Check
                            type="checkbox"
                            name="openInNewTab"
                            label="Open in new tab"
                            checked={formData.openInNewTab}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {/* Description */}
                  <FormField
                    type="textarea"
                    name="description"
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of this menu item"
                    rows={2}
                  />
                </Card.Body>
              </Card>

              {/* Sub-menu Items for Dropdown Type */}
              {formData.type === 'dropdown' && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Sub-menu Items</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addChildItem}
                    >
                      <FaPlus className="me-1" />
                      Add Sub-item
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {formData.children && formData.children.length > 0 ? (
                      <Accordion>
                        {formData.children.map((child, index) => (
                          <Accordion.Item key={index} eventKey={index.toString()}>
                            <Accordion.Header>
                              Sub-item {index + 1}: {child.title || 'Untitled'}
                            </Accordion.Header>
                            <Accordion.Body>
                              <Row>
                                <Col md={6}>
                                  <FormField
                                    type="text"
                                    label="Title"
                                    value={child.title}
                                    onChange={(e) => updateChildItem(index, 'title', e.target.value)}
                                    placeholder="Sub-item title"
                                    required
                                  />
                                </Col>
                                <Col md={6}>
                                  <FormField
                                    type="text"
                                    label="URL"
                                    value={child.url}
                                    onChange={(e) => updateChildItem(index, 'url', e.target.value)}
                                    placeholder="/sub-page-url"
                                    required
                                  />
                                </Col>
                              </Row>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Check
                                      type="checkbox"
                                      label="External Link"
                                      checked={child.isExternal}
                                      onChange={(e) => updateChildItem(index, 'isExternal', e.target.checked)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Check
                                      type="checkbox"
                                      label="Active"
                                      checked={child.isActive}
                                      onChange={(e) => updateChildItem(index, 'isActive', e.target.checked)}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <div className="text-end">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeChildItem(index)}
                                >
                                  <FaTrash className="me-1" />
                                  Remove
                                </Button>
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    ) : (
                      <Alert variant="info">
                        <FaPlus className="me-2" />
                        No sub-items added yet. Click "Add Sub-item" to create dropdown menu items.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={4}>
              {/* Settings */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="isActive"
                      label="Active"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Inactive items won't appear in the navigation menu
                    </Form.Text>
                  </Form.Group>

                  {formData.type === 'link' && (
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="isExternal"
                        label="External Link"
                        checked={formData.isExternal}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Mark as external link for proper handling
                      </Form.Text>
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>

              {/* Icon Selection */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Icon (Optional)</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Icon Name</Form.Label>
                    <Form.Select
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                    >
                      <option value="">No Icon</option>
                      {commonIcons.map(icon => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </Form.Select>
                    {formData.icon && (
                      <div className="mt-2">
                        <small className="text-muted">Preview: </small>
                        <i className={`fa fa-${formData.icon} me-1`}></i>
                        {formData.title}
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
                      {isLoading_ ? 'Saving...' : (id ? 'Update Menu Item' : 'Create Menu Item')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dash/navigation-menu')}
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

export default AddEditMenuItem;