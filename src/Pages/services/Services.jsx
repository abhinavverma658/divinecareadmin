import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Image } from 'react-bootstrap';
import { useGetServicesMutation, useDeleteServiceMutation, useToggleServiceStatusMutation } from '../../features/apiSlice';
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
  const [toggleServiceStatus, { isLoading: toggleLoading }] = useToggleServiceStatusMutation();
  
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

  // Demo data for services
  const demoServices = [
    {
      _id: '1',
      title: 'Financial Planning',
      description: 'Comprehensive financial planning services to help you achieve your financial goals.',
      shortDescription: 'Complete financial planning solutions',
      image: 'https://creative-story.s3.amazonaws.com/services/financial-planning.jpg',
      isActive: true,
      featured: true,
      duration: '2-3 hours',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '2',
      title: 'Investment Advisory',
      description: 'Expert investment advice tailored to your risk tolerance and financial objectives.',
      shortDescription: 'Professional investment guidance',
      image: 'https://creative-story.s3.amazonaws.com/services/investment-advisory.jpg',
      isActive: true,
      featured: false,
      duration: 'Ongoing',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      _id: '3',
      title: 'Retirement Planning',
      description: 'Strategic retirement planning to ensure a comfortable and secure retirement.',
      shortDescription: 'Secure your retirement future',
      image: 'https://creative-story.s3.amazonaws.com/services/retirement-planning.jpg',
      isActive: true,
      featured: true,
      duration: '3-4 hours',
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z'
    },
    {
      _id: '4',
      title: 'Tax Consultation',
      description: 'Professional tax consultation and planning services to minimize your tax burden.',
      shortDescription: 'Expert tax planning services',
      image: 'https://creative-story.s3.amazonaws.com/services/tax-consultation.jpg',
      isActive: false,
      featured: false,
      duration: '1-2 hours',
      createdAt: '2024-01-01T16:45:00Z',
      updatedAt: '2024-01-01T16:45:00Z'
    },
    {
      _id: '5',
      title: 'Estate Planning',
      description: 'Comprehensive estate planning to protect your assets and ensure your legacy.',
      shortDescription: 'Protect your legacy',
      image: 'https://creative-story.s3.amazonaws.com/services/estate-planning.jpg',
      isActive: true,
      featured: false,
      duration: '4-5 hours',
      createdAt: '2023-12-20T11:20:00Z',
      updatedAt: '2023-12-20T11:20:00Z'
    }
  ];

  const fetchServices = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        setServices(demoServices);
        setFilteredServices(demoServices);
        calculateStats(demoServices);
        return;
      }

      // Real API call for production
      const data = await getServices().unwrap();
      const servicesData = data?.services || [];
      setServices(servicesData);
      setFilteredServices(servicesData);
      calculateStats(servicesData);
    } catch (error) {
      getError(error);
    }
  };

  const calculateStats = (servicesData) => {
    const stats = {
      total: servicesData.length,
      active: servicesData.filter(service => service.isActive).length,
      inactive: servicesData.filter(service => !service.isActive).length,
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
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(service => service.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(service => !service.isActive);
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter(service => service.featured);
      }
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, statusFilter]);

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedServices = services.map(service =>
          service._id === serviceId ? { ...service, isActive: !currentStatus } : service
        );
        setServices(updatedServices);
        calculateStats(updatedServices);
        toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        return;
      }

      // Real API call
      await toggleServiceStatus({ id: serviceId, isActive: !currentStatus }).unwrap();
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchServices();
    } catch (error) {
      getError(error);
    }
  };

  const handleDelete = async () => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedServices = services.filter(service => service._id !== selectedService._id);
        setServices(updatedServices);
        setFilteredServices(updatedServices);
        calculateStats(updatedServices);
        toast.success('Service deleted successfully');
        setShowDeleteModal(false);
        setSelectedService(null);
        return;
      }

      // Real API call
      await deleteService(selectedService._id).unwrap();
      toast.success('Service deleted successfully');
      setShowDeleteModal(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      setShowDeleteModal(false);
      getError(error);
    }
  };

  const columns = [
    {
      header: 'Service',
      render: (service) => (
        <div className="d-flex align-items-center">
          <Image
            src={service.image}
            alt={service.title}
            width={50}
            height={50}
            className="rounded me-3"
            style={{ objectFit: 'cover' }}
          />
          <div>
            <h6 className="mb-1">{service.title}</h6>
            <small className="text-muted">{service.shortDescription}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Duration',
      render: (service) => (
        <div className="text-center">
          <span className="text-muted">{service.duration}</span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (service) => (
        <div className="text-center">
          <Badge bg={service.isActive ? 'success' : 'secondary'} className="me-1">
            {service.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {service.featured && (
            <Badge bg="warning" className="text-dark">
              <FaStar className="me-1" />
              Featured
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (service) => (
        <div className="d-flex gap-2">
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
            variant={service.isActive ? 'outline-warning' : 'outline-success'}
            onClick={() => handleToggleStatus(service._id, service.isActive)}
            disabled={toggleLoading}
          >
            {service.isActive ? <FaToggleOff /> : <FaToggleOn />}
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
      )
    }
  ];

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
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
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
              data={filteredServices}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No services found"
            />
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
                  <Image
                    src={selectedService.image}
                    alt={selectedService.title}
                    fluid
                    rounded
                    className="mb-3"
                  />
                  <div className="text-center">
                    <div>
                      <Badge bg={selectedService.isActive ? 'success' : 'secondary'} className="me-1">
                        {selectedService.isActive ? 'Active' : 'Inactive'}
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
                    <strong>Duration:</strong> {selectedService.duration}
                  </p>
                  <p>{selectedService.description}</p>
                  
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
          onDelete={handleDelete}
          title="Delete Service"
          message={`Are you sure you want to delete "${selectedService?.title}"? This action cannot be undone.`}
          isLoading={deleteLoading}
        />
      </Container>
    </MotionDiv>
  );
};

export default Services;