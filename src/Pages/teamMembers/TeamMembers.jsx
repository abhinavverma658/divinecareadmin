import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { useGetTeamMembersMutation, useDeleteTeamMemberMutation, useToggleTeamMemberStatusMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import CustomTable from '../../Components/CustomTable';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUsers, 
  FaUserTie,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaGlobe,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import Skeleton from 'react-loading-skeleton';
import DeleteModal from '../../Components/DeleteModal';
import { imgAddr } from '../../features/apiSlice';

const TeamMembers = () => {
  const [getTeamMembers, { isLoading }] = useGetTeamMembersMutation();
  const [deleteTeamMember, { isLoading: deleteLoading }] = useDeleteTeamMemberMutation();
  const [toggleTeamMemberStatus, { isLoading: toggleLoading }] = useToggleTeamMemberStatusMutation();
  
  const { token } = useSelector(selectAuth);
  const navigate = useNavigate();
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTeamMembers = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo team members data
        const demoTeamMembers = [
          {
            _id: '1',
            name: 'John Smith',
            title: 'CEO & Founder',
            department: 'Executive',
            bio: 'John brings over 20 years of experience in financial services and strategic leadership. He founded SAYV Financial with a vision to democratize financial planning and make it accessible to everyone.',
            email: 'john.smith@sayv.net',
            phone: '+1 (555) 123-4567',
            image: `${imgAddr}/team/john-smith.jpg`,
            isActive: true,
            featured: true,
            order: 1,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/johnsmith',
              twitter: 'https://twitter.com/johnsmith',
              website: 'https://johnsmith.com'
            },
            skills: ['Leadership', 'Strategic Planning', 'Financial Analysis'],
            joinDate: '2008-01-15',
            createdAt: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
            updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            _id: '2',
            name: 'Sarah Johnson',
            title: 'Chief Investment Officer',
            department: 'Investment',
            bio: 'Sarah is a seasoned investment professional with expertise in portfolio management, risk assessment, and market analysis. She holds a CFA designation and has been instrumental in developing our investment strategies.',
            email: 'sarah.johnson@sayv.net',
            phone: '+1 (555) 123-4568',
            image: `${imgAddr}/team/sarah-johnson.jpg`,
            isActive: true,
            featured: true,
            order: 2,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/sarahjohnson',
              twitter: 'https://twitter.com/sarahjohnson'
            },
            skills: ['Portfolio Management', 'Risk Analysis', 'Market Research'],
            joinDate: '2010-03-20',
            createdAt: new Date(Date.now() - 4320000000).toISOString(), // 50 days ago
            updatedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            _id: '3',
            name: 'Michael Chen',
            title: 'Senior Financial Advisor',
            department: 'Advisory',
            bio: 'Michael specializes in retirement planning and wealth management for high-net-worth individuals. His client-first approach and attention to detail have earned him recognition as a top advisor.',
            email: 'michael.chen@sayv.net',
            phone: '+1 (555) 123-4569',
            image: `${imgAddr}/team/michael-chen.jpg`,
            isActive: true,
            featured: false,
            order: 3,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/michaelchen'
            },
            skills: ['Retirement Planning', 'Wealth Management', 'Client Relations'],
            joinDate: '2012-08-10',
            createdAt: new Date(Date.now() - 3456000000).toISOString(), // 40 days ago
            updatedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          },
          {
            _id: '4',
            name: 'Emily Rodriguez',
            title: 'Marketing Director',
            department: 'Marketing',
            bio: 'Emily leads our marketing initiatives and brand development. She has a passion for digital marketing and has successfully grown our online presence and client acquisition.',
            email: 'emily.rodriguez@sayv.net',
            phone: '+1 (555) 123-4570',
            image: `${imgAddr}/team/emily-rodriguez.jpg`,
            isActive: true,
            featured: false,
            order: 4,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/emilyrodriguez',
              twitter: 'https://twitter.com/emilyrodriguez',
              website: 'https://emilyrodriguez.com'
            },
            skills: ['Digital Marketing', 'Brand Development', 'Content Strategy'],
            joinDate: '2015-11-05',
            createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
            updatedAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
          },
          {
            _id: '5',
            name: 'David Thompson',
            title: 'Senior Operations Manager',
            department: 'Operations',
            bio: 'David oversees daily operations and ensures our processes run smoothly. His background in operations management and commitment to excellence keep our team functioning at peak efficiency.',
            email: 'david.thompson@sayv.net',
            phone: '+1 (555) 123-4571',
            image: `${imgAddr}/team/david-thompson.jpg`,
            isActive: false, // Inactive member for demo
            featured: false,
            order: 5,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/davidthompson'
            },
            skills: ['Operations Management', 'Process Optimization', 'Team Leadership'],
            joinDate: '2018-02-14',
            createdAt: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
            updatedAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
          }
        ];
        
        setTeamMembers(demoTeamMembers);
        return;
      }

      // Real API call for production
      const data = await getTeamMembers().unwrap();
      setTeamMembers(data?.teamMembers || []);
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [token]);

  const handleDelete = async () => {
    if (!selectedMember) return;
    
    try {
      const data = await deleteTeamMember(selectedMember._id).unwrap();
      toast.success(data?.message || 'Team member deleted successfully');
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchTeamMembers();
    } catch (error) {
      getError(error);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const data = await toggleTeamMemberStatus({ 
        id: member._id, 
        isActive: !member.isActive 
      }).unwrap();
      
      toast.success(`Team member ${!member.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchTeamMembers();
    } catch (error) {
      getError(error);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    if (filterStatus === 'active') return member.isActive;
    if (filterStatus === 'inactive') return !member.isActive;
    if (filterStatus === 'featured') return member.featured;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartmentColor = (department) => {
    const colors = {
      Executive: 'primary',
      Investment: 'success',
      Advisory: 'info',
      Marketing: 'warning',
      Operations: 'secondary',
      HR: 'danger',
      IT: 'dark'
    };
    return colors[department] || 'secondary';
  };

  const tableColumns = [
    {
      key: 'image',
      label: 'Photo',
      render: (member) => (
        <div className="d-flex align-items-center">
          <img
            src={member.image || '/avatar.png'}
            alt={member.name}
            className="rounded-circle me-2"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/avatar.png';
            }}
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name & Title',
      render: (member) => (
        <div>
          <div className="fw-bold">{member.name}</div>
          <small className="text-muted">{member.title}</small>
          {member.featured && (
            <Badge bg="warning" className="ms-2" style={{ fontSize: '10px' }}>
              Featured
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (member) => (
        <Badge bg={getDepartmentColor(member.department)}>
          {member.department}
        </Badge>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (member) => (
        <div>
          <div className="text-truncate" style={{ maxWidth: '150px' }}>
            <small>{member.email}</small>
          </div>
          {member.phone && (
            <div>
              <small className="text-muted">{member.phone}</small>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (member) => (
        <div>
          <Badge bg={member.isActive ? 'success' : 'secondary'}>
            {member.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <div className="mt-1">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handleToggleStatus(member)}
              disabled={toggleLoading}
              title={`${member.isActive ? 'Deactivate' : 'Activate'} member`}
            >
              {member.isActive ? <FaToggleOn /> : <FaToggleOff />}
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      render: (member) => (
        <small className="text-muted">
          {formatDate(member.joinDate)}
        </small>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (member) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => {
              setSelectedMember(member);
              setShowViewModal(true);
            }}
            title="View Details"
          >
            <FaEye />
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/dash/team-members/edit/${member._id}`)}
            title="Edit"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              setSelectedMember(member);
              setShowDeleteModal(true);
            }}
            title="Delete"
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ];

  const renderViewModal = () => (
    <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUsers className="me-2" />
          Team Member Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedMember && (
          <Row>
            <Col md={4} className="text-center">
              <img
                src={selectedMember.image || '/avatar.png'}
                alt={selectedMember.name}
                className="rounded-circle mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/avatar.png';
                }}
              />
              <div className="mb-2">
                <Badge bg={getDepartmentColor(selectedMember.department)}>
                  {selectedMember.department}
                </Badge>
                {selectedMember.featured && (
                  <Badge bg="warning" className="ms-2">
                    Featured
                  </Badge>
                )}
              </div>
              <Badge bg={selectedMember.isActive ? 'success' : 'secondary'}>
                {selectedMember.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Col>
            <Col md={8}>
              <h4>{selectedMember.name}</h4>
              <h6 className="text-muted mb-3">{selectedMember.title}</h6>
              
              <div className="mb-3">
                <strong>Bio:</strong>
                <p className="mt-1">{selectedMember.bio}</p>
              </div>

              <div className="mb-3">
                <strong>Contact Information:</strong>
                <div className="mt-1">
                  <div><FaEnvelope className="me-2" />{selectedMember.email}</div>
                  {selectedMember.phone && (
                    <div className="mt-1">{selectedMember.phone}</div>
                  )}
                </div>
              </div>

              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div className="mb-3">
                  <strong>Skills:</strong>
                  <div className="mt-1">
                    {selectedMember.skills.map((skill, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember.socialLinks && Object.keys(selectedMember.socialLinks).length > 0 && (
                <div className="mb-3">
                  <strong>Social Links:</strong>
                  <div className="mt-1">
                    {selectedMember.socialLinks.linkedin && (
                      <a 
                        href={selectedMember.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="me-2"
                      >
                        <FaLinkedin />
                      </a>
                    )}
                    {selectedMember.socialLinks.twitter && (
                      <a 
                        href={selectedMember.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="me-2"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {selectedMember.socialLinks.website && (
                      <a 
                        href={selectedMember.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="me-2"
                      >
                        <FaGlobe />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="text-muted">
                <small>Joined: {formatDate(selectedMember.joinDate)}</small>
              </div>
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
            navigate(`/dash/team-members/edit/${selectedMember._id}`);
          }}
        >
          <FaEdit className="me-1" />
          Edit Member
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
              <span style={{ color: 'var(--dark-color)' }}>Team</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Members</span>
            </h2>
            <p className="text-muted mb-0">
              Manage your team member profiles and information
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/dash/team-members/add')}
          >
            <FaPlus className="me-1" />
            Add Team Member
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <FaUsers size={24} className="text-primary mb-2" />
                <h4 className="text-primary mb-0">
                  {isLoading ? <Skeleton width={40} /> : teamMembers.length}
                </h4>
                <small className="text-muted">Total Members</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <FaUserTie size={24} className="text-success mb-2" />
                <h4 className="text-success mb-0">
                  {isLoading ? <Skeleton width={40} /> : teamMembers.filter(member => member.isActive).length}
                </h4>
                <small className="text-muted">Active Members</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <div className="text-warning mb-2">⭐</div>
                <h4 className="text-warning mb-0">
                  {isLoading ? <Skeleton width={40} /> : teamMembers.filter(member => member.featured).length}
                </h4>
                <small className="text-muted">Featured Members</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={12} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <div className="text-info mb-2">🏢</div>
                <h4 className="text-info mb-0">
                  {isLoading ? <Skeleton width={40} /> : new Set(teamMembers.map(member => member.department)).size}
                </h4>
                <small className="text-muted">Departments</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter Buttons */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All Members ({teamMembers.length})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'success' : 'outline-success'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({teamMembers.filter(m => m.isActive).length})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'secondary' : 'outline-secondary'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({teamMembers.filter(m => !m.isActive).length})
              </Button>
              <Button
                variant={filterStatus === 'featured' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setFilterStatus('featured')}
              >
                Featured ({teamMembers.filter(m => m.featured).length})
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Team Members Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Team Members</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {isLoading ? (
              <div className="p-4">
                <Skeleton count={5} height={80} className="mb-2" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <Alert variant="info" className="m-4">
                <FaUsers className="me-2" />
                {filterStatus === 'all' 
                  ? 'No team members found. Click "Add Team Member" to get started.'
                  : `No ${filterStatus} team members found.`
                }
              </Alert>
            ) : (
              <CustomTable
                data={filteredMembers.sort((a, b) => a.order - b.order)}
                columns={tableColumns}
              />
            )}
          </Card.Body>
        </Card>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Team Member"
          message={`Are you sure you want to delete "${selectedMember?.name}"? This action cannot be undone.`}
          loading={deleteLoading}
        />

        {/* View Details Modal */}
        {renderViewModal()}
      </Container>
    </MotionDiv>
  );
};

export default TeamMembers;