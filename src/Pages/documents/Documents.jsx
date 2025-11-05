import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Table } from 'react-bootstrap';
import MotionDiv from '../../Components/MotionDiv';
import { FaUpload, FaFileContract, FaUserTie, FaCalendarAlt, FaChartLine, FaBook, FaBriefcase, FaExclamationTriangle, FaClock, FaGraduationCap, FaUniversity, FaIdCard, FaCalculator, FaHandshake, FaEye, FaEdit, FaTrash, FaFile, FaPlus, FaUserPlus, FaUsers, FaSave } from 'react-icons/fa';
import ImageUpload from '../../Components/ImageUpload';
import { toast } from 'react-toastify';


const documentFields = [
  { key: 'policies-procedures', label: 'Policies/Procedures and Benefits', icon: FaFileContract },
  { key: 'employee-records', label: 'Employee Records', icon: FaUserTie },
  { key: 'schedules', label: 'Workers Schedules', icon: FaCalendarAlt },
  { key: 'performance-reviews', label: 'Performance Review', icon: FaChartLine },
  { key: 'handbooks', label: 'Signed Employee Handbook/Acknowledgement', icon: FaBook },
  { key: 'job-descriptions', label: 'Job Descriptions', icon: FaBriefcase },
  { key: 'disciplinary-actions', label: 'Disciplinary Actions Report', icon: FaExclamationTriangle },
  { key: 'attendance-records', label: 'Attendance Records', icon: FaClock },
  { key: 'training-records', label: 'Training Records', icon: FaGraduationCap },
  { key: 'direct-deposit', label: 'Direct Deposit Form', icon: FaUniversity },
  { key: 'form-i9', label: 'Form I-9 (US Employment Eligibility)', icon: FaIdCard },
  { key: 'w4-forms', label: 'W-4 Forms (Federal Tax Withholding)', icon: FaCalculator },
  { key: 'employment-contracts', label: 'Employment Contract/Agreement', icon: FaHandshake }
];

const Documents = () => {
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewUsersModal, setShowViewUsersModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]); // Sample data - replace with API call
  const [editingUser, setEditingUser] = useState(null);

  const handleUpload = (key, url) => {
    setUploadedDocs(prev => ({ ...prev, [key]: url }));
  };

  const handleDelete = (key) => {
    setUploadedDocs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const getFileName = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleCreateUser = () => {
    // TODO: Implement API call to create user
    console.log('Creating user:', newUser);
    // Add user to list
    const newUserWithId = { ...newUser, id: Date.now() };
    setUsers([...users, newUserWithId]);
    // Reset form and close modal
    setNewUser({ name: '', email: '' });
    setShowUserModal(false);
    // You can add toast notification here
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({ name: user.name, email: user.email });
    // Don't close the View Users modal
    setShowUserModal(true);
  };

  const handleUpdateUser = () => {
    // Update user in the list
    setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...newUser } : u));
    setNewUser({ name: '', email: '' });
    setEditingUser(null);
    setShowUserModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveDocuments = () => {
    // TODO: Implement API call to save all documents
    const documentsToSave = Object.keys(uploadedDocs).map(key => ({
      type: key,
      url: uploadedDocs[key],
      label: documentFields.find(f => f.key === key)?.label
    }));
    
    console.log('Saving documents:', documentsToSave);
    
    // Simulate saving
    toast.success('All documents saved successfully!');
    
    // You can add API call here to save to backend
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 style={{ color: 'var(--dark-color)' }}>Document Management</h2>
            <p className="text-muted">Upload company documents, policies, and employee records</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              onClick={() => {
                setEditingUser(null);
                setNewUser({ name: '', email: '' });
                setShowUserModal(true);
              }}
              className="d-flex align-items-center gap-2"
            >
              <FaUserPlus />
              Add User
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowViewUsersModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaUsers />
              View Users
            </Button>
            <Button 
              variant="success" 
              onClick={handleSaveDocuments}
              className="d-flex align-items-center gap-2"
              disabled={Object.keys(uploadedDocs).length === 0}
            >
              <FaSave />
              Save Documents
            </Button>
          </div>
        </div>
        <Row>
          {documentFields.map(field => (
            <Col md={6} lg={4} key={field.key} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex align-items-center">
                    {React.createElement(field.icon, { className: 'me-2 text-primary', size: 20 })}
                    <strong>{field.label}</strong>
                  </div>
                </Card.Header>
                <Card.Body>
                  <ImageUpload
                    value={uploadedDocs[field.key] || ''}
                    onChange={val => handleUpload(field.key, val)}
                    label={uploadedDocs[field.key] ? 'Edit File' : `Upload ${field.label}`}
                    buttonText={uploadedDocs[field.key] ? 'Edit File' : 'Select File'}
                    successMessage="Document uploaded successfully"
                    helpText="Upload a single document"
                    showPreview={false}
                    acceptedTypes={[
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    ]}
                    maxSize={10}
                  />
                  {uploadedDocs[field.key] && (
                    <div className="uploaded-file-info mt-3">
                      <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div className="d-flex align-items-center flex-grow-1">
                          <FaFile className="me-2 text-primary" size={24} />
                          <span className="text-truncate" style={{ maxWidth: '200px' }}>
                            {getFileName(uploadedDocs[field.key])}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => window.open(uploadedDocs[field.key], '_blank')}
                            title="View Document"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(field.key)}
                            title="Delete Document"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Add/Edit User Modal */}
        <Modal 
          show={showUserModal} 
          onHide={() => {
            setShowUserModal(false);
            setEditingUser(null);
            setNewUser({ name: '', email: '' });
          }} 
          centered 
          backdrop={editingUser ? false : true}
          style={{ zIndex: editingUser ? 1060 : 1050 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUserPlus className="me-2" />
              {editingUser ? 'Edit User' : 'Add New User'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Form.Group>
              <Button 
                variant="primary" 
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                className="w-100"
                disabled={!newUser.name || !newUser.email}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* View Users Modal */}
        <Modal 
          show={showViewUsersModal} 
          onHide={() => {
            setShowViewUsersModal(false);
            setShowUserModal(false);
            setEditingUser(null);
            setNewUser({ name: '', email: '' });
          }} 
          size="lg" 
          centered
          backdrop={true}
          enforceFocus={false}
        >
          <div style={{ 
            opacity: showUserModal && editingUser ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
          }}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUsers className="me-2" />
              All Users
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {users.length === 0 ? (
              <Alert variant="info">No users found. Add your first user!</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          </div>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default Documents;