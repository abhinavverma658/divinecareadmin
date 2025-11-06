import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Table } from 'react-bootstrap';
import MotionDiv from '../../Components/MotionDiv';
import { useGetDocumentsMutation, useUpdateDocumentMutation, useUploadDocumentMutation, useGetTeamUsersMutation } from '../../features/apiSlice';
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
  // Team users state from API
  const [users, setUsers] = useState([]);
  const [getTeamUsers, { isLoading: isUsersLoading }] = useGetTeamUsersMutation();
  const [editingUser, setEditingUser] = useState(null);
  
  const [getDocuments] = useGetDocumentsMutation();
  const [updateDocument] = useUpdateDocumentMutation();

  useEffect(() => {
    // Map API categories to our internal documentFields keys
    const categoryMap = {
      'Direct_Deposit': 'direct-deposit',
      'Direct Deposit': 'direct-deposit',
      'Disciplinary_Actions_Report': 'disciplinary-actions',
      'Attendance_Records': 'attendance-records',
      'Performance_Review': 'performance-reviews',
      'Form_I-9': 'form-i9',
      'W-4_Forms': 'w4-forms',
      'Policies': 'policies-procedures',
      'Policies_Procedures_and_Benefits': 'policies-procedures',
      'Job_Description': 'job-descriptions',
      'Job_Descriptions': 'job-descriptions',
      'Employment_Contract': 'employment-contracts',
      'Signed_Employee': 'handbooks',
      'Workers_Schedules': 'schedules',
      'Training_Records': 'training-records',
      'Employee_Records': 'employee-records'
    };

    const fetchDocuments = async () => {
      try {
        const response = await getDocuments().unwrap();
        if (response && response.success && Array.isArray(response.documents)) {
          const docsMap = {};
          response.documents.forEach(doc => {
            let key = null;

            // 1) exact mapping from API category
            if (doc.category && categoryMap[doc.category]) {
              key = categoryMap[doc.category];
            }

            // 2) fallback: normalize category (underscores/spaces -> hyphens) and try to match existing keys
            if (!key && doc.category) {
              const normalized = doc.category.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
              if (documentFields.some(f => f.key === normalized)) key = normalized;
              else if (documentFields.some(f => f.key === normalized + 's')) key = normalized + 's';
            }

            // 3) fallback: use title similarly
            if (!key && doc.title) {
              const normalizedTitle = doc.title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
              if (documentFields.some(f => f.key === normalizedTitle)) key = normalizedTitle;
              else if (documentFields.some(f => f.key === normalizedTitle + 's')) key = normalizedTitle + 's';
            }

            if (key) {
              // store complete document metadata for updating later
              docsMap[key] = { 
                url: doc.fileUrl, 
                mimeType: doc.mimeType, 
                title: doc.title || '',
                id: doc._id,
                docId: doc.docId,
                category: doc.category,
                filePublicId: doc.filePublicId
              };
            } else {
              // keep a console warning so unmapped categories can be added to the map later
              // eslint-disable-next-line no-console
              console.warn('Unmapped document category:', doc.category, 'title:', doc.title);
            }
          });
          setUploadedDocs(docsMap);
        } else {
          toast.error('Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Error loading documents');
      }
    };

    fetchDocuments();
  }, [getDocuments]);

  const [uploadDocument] = useUploadDocumentMutation();

  const handleUpload = async (key, uploadData) => {
    if (!uploadData) return;

    // If we got a raw File object from ImageUpload
    if (uploadData instanceof File) {
      try {
        const formData = new FormData();
        formData.append('files', uploadData);
        formData.append('folder', 'documents'); // Store in documents folder

        const uploadResponse = await uploadDocument(formData).unwrap();
        
        if (uploadResponse.success && uploadResponse.files && uploadResponse.files[0]) {
          const fileData = uploadResponse.files[0];
          
          // Store the complete document metadata
          setUploadedDocs(prev => ({
            ...prev,
            [key]: {
              url: fileData.url,
              filePublicId: fileData.public_id,
              mimeType: uploadData.type,
              size: uploadData.size,
              title: uploadData.name,
              category: key
            }
          }));
          
          toast.success('Document uploaded successfully');
        } else {
          toast.error('Upload failed: ' + (uploadResponse.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Upload failed: ' + (error.message || 'Unknown error'));
      }
      return;
    }

    // Handle legacy string URL or object case
    const entryFromUpload = typeof uploadData === 'string' ? { url: uploadData } : uploadData || { url: '' };

    setUploadedDocs(prev => {
      const prevEntry = prev[key] || {};
      const merged = { ...prevEntry, ...entryFromUpload };
      return { ...prev, [key]: merged };
    });
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
    // support passing an object { url }
    const realUrl = typeof url === 'object' && url.url ? url.url : url;
    try {
      const parts = realUrl.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return '';
    }
  };

  const handleView = (url, mimeType) => {
    if (!url) return;

    // PDF: use Google Docs viewer (works well for inline preview)
    if (mimeType === 'application/pdf' || url.toLowerCase().endsWith('.pdf')) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(viewerUrl, '_blank');
      return;
    }

    // Images: open directly
    if (mimeType && mimeType.startsWith('image/') ) {
      window.open(url, '_blank');
      return;
    }

    // Office docs (doc/docx/xls/xlsx/ppt/pptx) - use Microsoft Office viewer
    const officeTypes = ['word', 'msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document', 'excel', 'presentation', 'powerpoint', 'vnd.ms-excel', 'vnd.ms-powerpoint'];
    if (mimeType && officeTypes.some(t => mimeType.includes(t)) || /\.(docx?|xlsx?|pptx?)$/i.test(url)) {
      const officeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(officeViewer, '_blank');
      return;
    }

    // Fallback: open directly (server may force download if Content-Disposition: attachment)
    window.open(url, '_blank');
  };

  // Local create user handler (backend create user API was removed/unused here)
  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }

    // Create a simple local user entry (the app previously used an API; keep local behavior)
    const id = Date.now();
    const userEntry = { id, name: newUser.name, email: newUser.email };
    setUsers(prev => [...prev, userEntry]);
    setNewUser({ name: '', email: '' });
    setShowUserModal(false);
    toast.success('User added (local)');
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

  const handleSaveDocument = async (key) => {
    const doc = uploadedDocs[key];
    if (!doc || !doc.id) {
      toast.error('Cannot save document: missing document ID');
      return;
    }

    try {
      const response = await updateDocument({
        id: doc.id,
        data: {
          title: doc.title,
          category: doc.category,
          fileUrl: doc.url,
          filePublicId: doc.filePublicId,
          mimeType: doc.mimeType,
          docId: doc.docId,
          size: doc.size || 0
        }
      }).unwrap();

      if (response.success) {
        toast.success('Document saved successfully!');
      } else {
        toast.error(response.message || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Error saving document. Please try again.');
    }
  };

  // Save all documents function now triggers individual saves
  const handleSaveDocuments = async () => {
    const savePromises = Object.keys(uploadedDocs).map(key => handleSaveDocument(key));
    try {
      await Promise.all(savePromises);
      toast.success('All documents saved successfully!');
    } catch (error) {
      toast.error('Error saving some documents. Please try again.');
    }
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
              onClick={async () => {
                setShowViewUsersModal(true);
                try {
                  const res = await getTeamUsers().unwrap();
                  if (res && res.success && Array.isArray(res.users)) {
                    setUsers(res.users);
                  } else {
                    setUsers([]);
                  }
                } catch (e) {
                  setUsers([]);
                }
              }}
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
                    value={(uploadedDocs[field.key] && uploadedDocs[field.key].url) || ''}
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
                  {uploadedDocs[field.key] && uploadedDocs[field.key].url && (
                    <div className="uploaded-file-info mt-3">
                      <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div className="d-flex align-items-center grow">
                          <FaFile className="me-2 text-primary" size={24} />
                          <span className="text-truncate" style={{ maxWidth: '200px' }}>
                            {getFileName(uploadedDocs[field.key] && uploadedDocs[field.key].url)}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleView(
                              uploadedDocs[field.key].url,
                              uploadedDocs[field.key].mimeType
                            )}
                            title="View Document"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleSaveDocument(field.key)}
                            title="Save Document"
                            className="me-2"
                          >
                            <FaSave />
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
            {isUsersLoading ? (
              <Alert variant="info">Loading users...</Alert>
            ) : users.length === 0 ? (
              <Alert variant="info">No users found.</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.isActive ? 'Yes' : 'No'}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>
                      <td>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
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