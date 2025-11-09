import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Image } from 'react-bootstrap';
import { useGetServicesMutation, useDeleteServiceMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MotionDiv from '../../Components/MotionDiv';
import CustomTable from '../../Components/CustomTable';
import SearchField from '../../Components/SearchField';
import DeleteModal from '../../Components/DeleteModal';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaDollarSign, FaStar, FaUsers, FaServicestack } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';

const Services = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getServices, { isLoading }] = useGetServicesMutation();
  const [deleteService, { isLoading: deleteLoading }] = useDeleteServiceMutation();
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0
  });

  const fetchServices = async () => {
    try {
      console.log('🔄 Starting Services Data fetch...');
      
      const response = await getServices().unwrap();
      console.log('📥 Services Data Response:', response);
      
      // Check multiple possible response structures
      let servicesData = null;
      
      if (response?.success && response?.services) {
        servicesData = response.services;
        console.log('✅ Using response.services structure');
      } else if (response?.services) {
        servicesData = response.services;
        console.log('✅ Using response.services structure (no success flag)');
      } else if (response?.success && response?.data) {
        servicesData = response.data;
        console.log('✅ Using response.data structure');
      } else if (response?.data && !response?.success) {
        servicesData = response.data;
        console.log('✅ Using response.data structure (no success flag)');
      } else if (Array.isArray(response)) {
        servicesData = response;
        console.log('✅ Using response directly as array');
      } else if (response && typeof response === 'object' && !response.error && !response.message && !response.success) {
        servicesData = response;
        console.log('✅ Using response directly as data');
      }
      
      if (Array.isArray(servicesData) && servicesData.length >= 0) {
        console.log('🎯 Setting services data:', servicesData);
        console.log('🔍 First service structure:', servicesData[0]);
        setServices(servicesData);
        setFilteredServices(servicesData);
        calculateStats(servicesData);
        
        if (servicesData.length === 0) {
          toast.info('No services found. Create your first service!');
        } else {
          toast.success(`${servicesData.length} services loaded successfully`);
        }
      } else {
        console.log('⚠️ No services data found');
        setServices([]);
        setFilteredServices([]);
        calculateStats([]);
        toast.info('No services found.');
      }
    } catch (error) {
      console.error('❌ Error fetching services data:', error);
      toast.error('Failed to load services. Please try again.');
      setServices([]);
      setFilteredServices([]);
      calculateStats([]);
    }
  };

  const calculateStats = (servicesData) => {
    const stats = {
      total: servicesData.length,
      active: servicesData.filter(service => service.isActive !== false).length, // Active by default
      inactive: servicesData.filter(service => service.isActive === false).length,
      featured: servicesData.filter(service => service.featured).length
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service => {
        const title = (service.title || '').toLowerCase();
        const shortDesc = (service.shortDescription || '').toLowerCase();
        const desc = (service.description || service.detailedDescription || '').toLowerCase();
        
        return title.includes(searchLower) || 
               shortDesc.includes(searchLower) || 
               desc.includes(searchLower);
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(service => service.isActive !== false); // Active by default
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(service => service.isActive === false);
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter(service => service.featured);
      }
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      console.log('🗑️ Deleting service:', selectedService._id);
      
      const response = await deleteService(selectedService._id).unwrap();
      console.log('✅ Delete Response:', response);
      
      toast.success(response?.message || 'Service deleted successfully');
      
      setShowDeleteModal(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      toast.error(error?.data?.message || 'Failed to delete service');
      setShowDeleteModal(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div 
          className={`rounded-circle p-3 me-3`}
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
        <div>
          <h3 className="mb-0" style={{ color: 'var(--dark-color)' }}>
            {isLoading ? <Skeleton width={50} /> : value}
          </h3>
          <p className="text-muted mb-0 small">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: 'var(--dark-color)' }}>Service</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Management</span>
            </h2>
            <p className="text-muted">Manage website services and offerings</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/dash/services/add')}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            Add Service
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <StatCard
              title="Total Services"
              value={stats.total}
              icon={<FaServicestack size={24} />}
              color="#6f42c1"
              bgColor="rgba(111, 66, 193, 0.1)"
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Active Services"
              value={stats.active}
              icon={<FaToggleOn size={24} />}
              color="#28a745"
              bgColor="rgba(40, 167, 69, 0.1)"
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Inactive Services"
              value={stats.inactive}
              icon={<FaToggleOff size={24} />}
              color="#6c757d"
              bgColor="rgba(108, 117, 125, 0.1)"
            />
          </Col>
          <Col md={3} className="mb-3">
            <StatCard
              title="Featured Services"
              value={stats.featured}
              icon={<FaStar size={24} />}
              color="#ffc107"
              bgColor="rgba(255, 193, 7, 0.1)"
            />
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <SearchField
                  query={searchTerm}
                  setQuery={setSearchTerm}
                  placeholder="Search services..."
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Services</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="featured">Featured Only</option>
                </Form.Select>
              </Col>
              <Col md={3} className="text-end">
                <small className="text-muted">
                  Showing {filteredServices.length} of {services.length} services
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Services Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Services List</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <CustomTable
              column={['Service', 'Description', 'Status', 'Actions']}
              isSearch={false}
              loading={isLoading}
            >
              {filteredServices && filteredServices.map((service, index) => (
                <tr key={service._id || index}>
                  <td>
                    <div className="d-flex align-items-center">
                      {service.image1 && (
                        <Image
                          src={service.image1}
                          alt={service.title}
                          width={50}
                          height={50}
                          className="rounded me-3"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h6 className="mb-1" style={{ textAlign:'left'}}>{service.title}</h6>
                        <small className="text-muted"  style={{ textAlign:'left'}}>{service.shortDescription}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-start">
                      <span
                        className="text-muted"
                        style={{ width: '100%' }}
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: `
                              <style>
                                .service-desc-table h1, .service-desc-table h2, .service-desc-table h3, .service-desc-table h4, .service-desc-table h5, .service-desc-table h6 {
                                  font-size: 1rem !important;
                                  font-weight: 500 !important;
                                  text-align: left !important;
                                  margin: 0 0 0.25em 0 !important;
                                }
                              </style>
                              <div class='service-desc-table'>
                                ${(service.description || service.detailedDescription || '').substring(0, 100) + ((service.description || service.detailedDescription || '').length > 100 ? '...' : '')}
                              </div>
                            `
                          }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg={service.isActive !== false ? 'success' : 'secondary'} className="me-1">
                      {service.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                    {service.featured && (
                      <Badge bg="warning" className="text-dark">
                        <FaStar className="me-1" />
                        Featured
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => {
                          setSelectedService(service);
                          setShowViewModal(true);
                        }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/dash/services/edit/${service._id}`)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setSelectedService(service);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </CustomTable>
          </Card.Body>
        </Card>

        {/* View Service Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Service Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedService && (
              <Row>
                <Col md={4}>
                  {selectedService.image1 && (
                    <div className="mb-3">
                      <p className="text-muted mb-2"><strong>Outer Image:</strong></p>
                      <Image
                        src={selectedService.image1}
                        alt={selectedService.title}
                        fluid
                        rounded
                        className="mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {selectedService.image2 && (
                    <div className="mb-3">
                      <p className="text-muted mb-2"><strong>Inner Image:</strong></p>
                      <Image
                        src={selectedService.image2}
                        alt={selectedService.title}
                        fluid
                        rounded
                        className="mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <div>
                      <Badge bg={selectedService.isActive !== false ? 'success' : 'secondary'} className="me-1">
                        {selectedService.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                      {selectedService.featured && (
                        <Badge bg="warning" className="text-dark">
                          <FaStar className="me-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={8}>
                  <h4>{selectedService.title}</h4>
                  <p className="text-muted mb-3">
                    <strong>Short Description:</strong> {selectedService.shortDescription}
                  </p>
                  <div 
                    className="text-start"
                    dangerouslySetInnerHTML={{
                      __html: selectedService.description || selectedService.detailedDescription || ''
                    }}
                  />
                  
                  <small className="text-muted">
                    Created: {new Date(selectedService.createdAt).toLocaleDateString()}
                  </small>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                navigate(`/dash/services/edit/${selectedService._id}`);
              }}
            >
              <FaEdit className="me-1" />
              Edit Service
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDiscard={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Service"
          description={`Are you sure you want to delete "${selectedService?.title}"? This action cannot be undone.`}
          loading={deleteLoading}
          buttonCancelTxt="Cancel"
          buttonConfirmTxt="Delete"
        />
      </Container>
    </MotionDiv>
  );
};

export default Services;