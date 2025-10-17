import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Alert, Dropdown } from 'react-bootstrap';
import { useGetNavigationMenuMutation, useDeleteMenuItemMutation, useUpdateMenuOrderMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaBars, 
  FaLink, 
  FaCaretDown, 
  FaHome,
  FaGripVertical,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';
import DeleteModal from '../../Components/DeleteModal';

const NavigationMenu = () => {
  const [getNavigationMenu, { isLoading }] = useGetNavigationMenuMutation();
  const [deleteMenuItem, { isLoading: deleteLoading }] = useDeleteMenuItemMutation();
  const [updateMenuOrder, { isLoading: orderLoading }] = useUpdateMenuOrderMutation();
  
  const { token } = useSelector(selectAuth);
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchMenuItems = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo navigation menu data
        const demoMenuItems = [
          {
            _id: '1',
            title: 'Home',
            type: 'page',
            url: '/',
            pageId: 'home',
            isExternal: false,
            isActive: true,
            order: 1,
            icon: 'home',
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'About Us',
            type: 'page',
            url: '/about',
            pageId: 'about',
            isExternal: false,
            isActive: true,
            order: 2,
            icon: 'info-circle',
            children: [
              {
                _id: '2a',
                title: 'Our Story',
                type: 'page',
                url: '/about/story',
                isExternal: false,
                isActive: true,
                order: 1
              },
              {
                _id: '2b',
                title: 'Our Team',
                type: 'page',
                url: '/about/team',
                isExternal: false,
                isActive: true,
                order: 2
              }
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            title: 'Services',
            type: 'page',
            url: '/services',
            pageId: 'services',
            isExternal: false,
            isActive: true,
            order: 3,
            icon: 'cog',
            children: [
              {
                _id: '3a',
                title: 'Wealth Management',
                type: 'page',
                url: '/services/wealth-management',
                isExternal: false,
                isActive: true,
                order: 1
              },
              {
                _id: '3b',
                title: 'Retirement Planning',
                type: 'page',
                url: '/services/retirement-planning',
                isExternal: false,
                isActive: true,
                order: 2
              },
              {
                _id: '3c',
                title: 'Investment Advisory',
                type: 'page',
                url: '/services/investment-advisory',
                isExternal: false,
                isActive: true,
                order: 3
              }
            ],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            _id: '4',
            title: 'Blog',
            type: 'page',
            url: '/blog',
            isExternal: false,
            isActive: true,
            order: 4,
            icon: 'newspaper',
            children: [],
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString()
          },
          {
            _id: '5',
            title: 'Contact',
            type: 'page',
            url: '/contact',
            pageId: 'contact',
            isExternal: false,
            isActive: true,
            order: 5,
            icon: 'envelope',
            children: [],
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString()
          },
          {
            _id: '6',
            title: 'Resources',
            type: 'dropdown',
            url: '#',
            isExternal: false,
            isActive: true,
            order: 6,
            icon: 'folder',
            children: [
              {
                _id: '6a',
                title: 'Financial Calculator',
                type: 'page',
                url: '/resources/calculator',
                isExternal: false,
                isActive: true,
                order: 1
              },
              {
                _id: '6b',
                title: 'Team',
                type: 'page',
                url: '/team',
                isExternal: false,
                isActive: true,
                order: 2
              },
              {
                _id: '6c',
                title: 'Downloads',
                type: 'link',
                url: 'https://downloads.sayv.net',
                isExternal: true,
                isActive: true,
                order: 3
              }
            ],
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            updatedAt: new Date(Date.now() - 432000000).toISOString()
          }
        ];
        
        setMenuItems(demoMenuItems);
        return;
      }

      // Real API call for production
      const data = await getNavigationMenu().unwrap();
      setMenuItems(data?.menuItems || []);
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [token]);

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const data = await deleteMenuItem(selectedItem._id).unwrap();
      toast.success(data?.message || 'Menu item deleted successfully');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchMenuItems();
    } catch (error) {
      getError(error);
    }
  };

  const moveItem = async (itemId, direction) => {
    const currentIndex = menuItems.findIndex(item => item._id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const newMenuItems = [...menuItems];
    [newMenuItems[currentIndex], newMenuItems[newIndex]] = [newMenuItems[newIndex], newMenuItems[currentIndex]];
    
    // Update order values
    newMenuItems.forEach((item, index) => {
      item.order = index + 1;
    });

    try {
      setMenuItems(newMenuItems);
      const orderData = newMenuItems.map(item => ({ id: item._id, order: item.order }));
      await updateMenuOrder({ items: orderData }).unwrap();
      toast.success('Menu order updated successfully');
    } catch (error) {
      getError(error);
      // Revert on error
      fetchMenuItems();
    }
  };

  const getMenuTypeIcon = (type) => {
    switch (type) {
      case 'page':
        return <FaHome className="text-primary" />;
      case 'link':
        return <FaLink className="text-success" />;
      case 'dropdown':
        return <FaCaretDown className="text-warning" />;
      default:
        return <FaBars className="text-secondary" />;
    }
  };

  const getMenuTypeBadge = (type) => {
    const variants = {
      page: 'primary',
      link: 'success',
      dropdown: 'warning'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMenuPreview = () => (
    <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye className="me-2" />
          Navigation Menu Preview
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <strong>Preview:</strong> This is how your navigation menu will appear on the website.
        </Alert>
        
        <div className="navbar navbar-expand-lg navbar-light bg-light p-3 rounded">
          <div className="navbar-brand fw-bold">SAYV Financial</div>
          <div className="navbar-nav">
            {menuItems
              .filter(item => item.isActive)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item._id} className="nav-item dropdown">
                  <a 
                    className={`nav-link ${item.children?.length > 0 ? 'dropdown-toggle' : ''}`}
                    href={item.url}
                  >
                    {item.icon && <i className={`fa fa-${item.icon} me-1`}></i>}
                    {item.title}
                  </a>
                  {item.children && item.children.length > 0 && (
                    <div className="dropdown-menu show position-static">
                      {item.children
                        .filter(child => child.isActive)
                        .sort((a, b) => a.order - b.order)
                        .map((child) => (
                          <a key={child._id} className="dropdown-item" href={child.url}>
                            {child.title}
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPreview(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Navigation</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Menu</span>
            </h2>
            <p className="text-muted mb-0">
              Manage your website's navigation menu structure and links
            </p>
          </div>
          <div>
            <Button
              variant="outline-info"
              onClick={() => setShowPreview(true)}
              className="me-2"
            >
              <FaEye className="me-1" />
              Preview Menu
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/dash/navigation-menu/add')}
            >
              <FaPlus className="me-1" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h4 className="text-primary mb-0">
                  {isLoading ? <Skeleton width={40} /> : menuItems.length}
                </h4>
                <small className="text-muted">Total Menu Items</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h4 className="text-success mb-0">
                  {isLoading ? <Skeleton width={40} /> : menuItems.filter(item => item.isActive).length}
                </h4>
                <small className="text-muted">Active Items</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h4 className="text-warning mb-0">
                  {isLoading ? <Skeleton width={40} /> : menuItems.filter(item => item.type === 'dropdown').length}
                </h4>
                <small className="text-muted">Dropdown Menus</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h4 className="text-info mb-0">
                  {isLoading ? <Skeleton width={40} /> : menuItems.reduce((acc, item) => acc + (item.children?.length || 0), 0)}
                </h4>
                <small className="text-muted">Sub-menu Items</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Menu Items Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Menu Items</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {isLoading ? (
              <div className="p-4">
                <Skeleton count={5} height={60} className="mb-2" />
              </div>
            ) : menuItems.length === 0 ? (
              <Alert variant="info" className="m-4">
                <FaBars className="me-2" />
                No menu items found. Click "Add Menu Item" to create your first navigation item.
              </Alert>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="50">Order</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Children</th>
                    <th>Last Updated</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2">{item.order}</span>
                            <div className="d-flex flex-column">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => moveItem(item._id, 'up')}
                                disabled={index === 0 || orderLoading}
                                className="mb-1"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                              >
                                <FaArrowUp />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => moveItem(item._id, 'down')}
                                disabled={index === menuItems.length - 1 || orderLoading}
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                              >
                                <FaArrowDown />
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getMenuTypeIcon(item.type)}
                            <span className="ms-2 fw-medium">{item.title}</span>
                          </div>
                        </td>
                        <td>{getMenuTypeBadge(item.type)}</td>
                        <td>
                          <small className="text-muted">
                            {item.url}
                            {item.isExternal && (
                              <Badge bg="info" className="ms-1" style={{ fontSize: '10px' }}>
                                External
                              </Badge>
                            )}
                          </small>
                        </td>
                        <td>
                          <Badge bg={item.isActive ? 'success' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {item.children && item.children.length > 0 ? (
                            <Badge bg="primary">{item.children.length} items</Badge>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(item.updatedAt)}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/dash/navigation-menu/edit/${item._id}`)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
          loading={deleteLoading}
        />

        {/* Menu Preview Modal */}
        {renderMenuPreview()}
      </Container>
    </MotionDiv>
  );
};

export default NavigationMenu;