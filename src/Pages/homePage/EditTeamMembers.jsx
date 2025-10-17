import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGetTeamMembersMutation, useUpdateTeamMembersDataMutation, useAddTeamMemberMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaUsers, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const EditTeamMembers = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getTeamMembers, { isLoading: loadingTeam }] = useGetTeamMembersMutation();
  const [updateTeamMembersData, { isLoading: updateLoading }] = useUpdateTeamMembersDataMutation();
  const [addTeamMemberToAPI, { isLoading: addingMember }] = useAddTeamMemberMutation();
  
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    teamMembers: [
      {
        id: 1,
        picture: '',
        name: '',
        designation: '',
        isNew: true, // Track if this is a new member
        isSaving: false // Track saving state for individual members
      }
    ],
    isActive: true
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [savedMembers, setSavedMembers] = useState([]); // Track saved members

  useEffect(() => {
    fetchTeamMembersData();
  }, []);

  const fetchTeamMembersData = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo team members data
        const demoData = {
          heading: 'Meet our Volunteer',
          description: 'Provide tips, articles, or expert advice on maintaining a healthy work-life balance, managing, Workshops or seminars organizational.',
          teamMembers: [
            {
              id: 1,
              picture: '/demo-images/team-member-1.jpg',
              name: 'Anita Gusikowski',
              designation: 'General Manager',
              isNew: false, // Already saved in demo
              isSaving: false
            },
            {
              id: 2,
              picture: '/demo-images/team-member-2.jpg',
              name: 'Larry Bartoletti',
              designation: 'Manager Head',
              isNew: false,
              isSaving: false
            },
            {
              id: 3,
              picture: '/demo-images/team-member-3.jpg',
              name: 'Samuel Corwin',
              designation: 'Senior Manager',
              isNew: false,
              isSaving: false
            },
            {
              id: 4,
              picture: '/demo-images/team-member-4.jpg',
              name: 'Jessica Parker',
              designation: 'Project Manager',
              isNew: false,
              isSaving: false
            }
          ],
          isActive: true
        };
        
        setFormData(demoData);
        return;
      }

      // Real API call for production - get existing team members
      const data = await getTeamMembers().unwrap();
      
      if (data?.success && data?.teamMembers) {
        // Convert backend team members to our format
        const convertedMembers = data.teamMembers.map(member => ({
          id: member.id,
          picture: member.image || member.picture || '',
          name: member.name || member.fullName || '',
          designation: member.title || member.designation || '',
          isNew: false, // Existing members from backend
          isSaving: false,
          backendId: member.id
        }));

        setFormData({
          heading: 'Meet our Volunteer',
          description: 'Provide tips, articles, or expert advice on maintaining a healthy work-life balance, managing, Workshops or seminars organizational.',
          teamMembers: convertedMembers.length > 0 ? convertedMembers : [
            {
              id: 1,
              picture: '',
              name: '',
              designation: '',
              isNew: true,
              isSaving: false
            }
          ],
          isActive: true
        });
      } else {
        // No existing team members, start with empty form
        setFormData({
          heading: 'Meet our Volunteer', 
          description: 'Provide tips, articles, or expert advice on maintaining a healthy work-life balance, managing, Workshops or seminars organizational.',
          teamMembers: [
            {
              id: 1,
              picture: '',
              name: '',
              designation: '',
              isNew: true,
              isSaving: false
            }
          ],
          isActive: true
        });
      }
    } catch (error) {
      console.warn('Failed to fetch team members, starting with empty form:', error);
      
      // Fallback to empty form if API fails
      setFormData({
        heading: 'Meet our Volunteer',
        description: 'Provide tips, articles, or expert advice on maintaining a healthy work-life balance, managing, Workshops or seminars organizational.',
        teamMembers: [
          {
            id: 1,
            picture: '',
            name: '',
            designation: '',
            isNew: true,
            isSaving: false
          }
        ],
        isActive: true
      });
      
      toast.info('Starting with a fresh team members form. Add your team members and save them individually.');
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

  const handleTeamMemberChange = (memberId, field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => 
        member.id === memberId 
          ? { ...member, [field]: value }
          : member
      )
    }));
    setHasChanges(true);
  };

  const addTeamMember = () => {
    const newId = Math.max(...formData.teamMembers.map(member => member.id)) + 1;
    const newMember = {
      id: newId,
      picture: '',
      name: '',
      designation: '',
      isNew: true,
      isSaving: false
    };
    
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }));
    setHasChanges(true);
  };

  const removeTeamMember = (memberId) => {
    if (formData.teamMembers.length <= 1) {
      toast.error('At least one team member is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
    }));
    setHasChanges(true);
  };

  const saveTeamMemberToBackend = async (member) => {
    // Check if all required fields are filled
    if (!member.picture || !member.name || !member.designation) {
      toast.error('Please fill in all fields (picture, name, and designation) before saving');
      return false;
    }

    try {
      // Mark this member as saving
      setFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.map(m => 
          m.id === member.id ? { ...m, isSaving: true } : m
        )
      }));

      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mark as saved in demo mode
        setFormData(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.map(m => 
            m.id === member.id ? { ...m, isNew: false, isSaving: false } : m
          )
        }));
        
        setSavedMembers(prev => [...prev, member.id]);
        toast.success(`${member.name} saved successfully! (Demo Mode)`);
        return true;
      }

      // Real API call
      const memberData = {
        image: member.picture,
        fullName: member.name,
        designation: member.designation
      };

      const response = await addTeamMemberToAPI(memberData).unwrap();
      
      // Mark as saved
      setFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.map(m => 
          m.id === member.id ? { ...m, isNew: false, isSaving: false, backendId: response.teamMember?.id } : m
        )
      }));
      
      setSavedMembers(prev => [...prev, member.id]);
      toast.success(response?.message || `${member.name} saved successfully!`);
      return true;
      
    } catch (error) {
      console.error('Error saving team member:', error);
      
      // Reset saving state
      setFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.map(m => 
          m.id === member.id ? { ...m, isSaving: false } : m
        )
      }));
      
      // Handle connection errors gracefully
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        toast.warn('Backend server is offline. Member saved locally only.', {
          position: 'top-center',
          autoClose: 3000,
        });
        
        // Mark as saved locally
        setFormData(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.map(m => 
            m.id === member.id ? { ...m, isNew: false, isSaving: false } : m
          )
        }));
        setSavedMembers(prev => [...prev, member.id]);
        return true;
      } else {
        toast.error(error?.message || `Failed to save ${member.name}. Please try again.`);
        return false;
      }
    }
  };

  const validateForm = () => {
    // Check section header fields
    if (!formData.heading.trim()) {
      toast.error('Team section heading is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Team section description is required');
      return false;
    }

    // Check if there's at least one team member
    if (!formData.teamMembers || formData.teamMembers.length === 0) {
      toast.error('At least one team member is required');
      return false;
    }

    // Validate each team member - all fields required
    for (let i = 0; i < formData.teamMembers.length; i++) {
      const member = formData.teamMembers[i];
      
      if (!member.picture || !member.picture.trim()) {
        toast.error(`Profile picture is required for team member ${i + 1}`);
        return false;
      }
      
      if (!member.name || !member.name.trim()) {
        toast.error(`Name is required for team member ${i + 1}`);
        return false;
      }
      
      if (!member.designation || !member.designation.trim()) {
        toast.error(`Designation is required for team member ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const isFormValid = () => {
    // Check section header (commented out since it's disabled)
    // if (!formData.heading.trim() || !formData.description.trim()) {
    //   return false;
    // }
    
    // Check team members
    if (!formData.teamMembers || formData.teamMembers.length === 0) {
      return false;
    }
    
    // Check if at least one team member is saved to backend
    const savedMembersCount = formData.teamMembers.filter(member => !member.isNew).length;
    if (savedMembersCount === 0) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if at least one team member is saved
    const savedMembersCount = formData.teamMembers.filter(member => !member.isNew).length;
    
    if (savedMembersCount === 0) {
      toast.error('Please save at least one team member to the backend before finishing');
      return;
    }
    
    // Check for unsaved members
    const unsavedMembers = formData.teamMembers.filter(member => member.isNew);
    if (unsavedMembers.length > 0) {
      const memberNames = unsavedMembers.map((m, index) => `Team Member ${formData.teamMembers.indexOf(m) + 1}`).join(', ');
      toast.warning(`You have unsaved team members: ${memberNames}. Please save them or remove them before finishing.`);
      return;
    }

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call
        toast.success('Team Members section completed successfully! (Demo Mode)');
        navigate('/dash/homepage');
        return;
      }

      // In real mode, just navigate since all members are already saved individually
      toast.success(`Team Members section completed! ${savedMembersCount} members saved successfully.`);
      navigate('/dash/homepage');
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <MotionDiv>
      <Container fluid>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/homepage')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Home Page
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>Edit Team Members Section</span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updateLoading || !isFormValid()}
            >
              <FaSave className="me-1" />
              {updateLoading ? 'Finishing...' : 'Finish Team Setup'}
            </Button>
          </div>
        </div>

        <Row>
          <Col lg={12}>
            {/* Required Fields Notice */}
            <Alert variant="info" className="mb-4">
              <div className="d-flex align-items-center">
                <FaUsers className="me-2" />
                <div>
                  <strong>Team members must be saved individually.</strong> Please add team member details and click "Save Member" for each member before finishing.
                  <div className="small mt-1">All team member fields are required and must be saved to the backend.</div>
                </div>
              </div>
            </Alert>
            
            <Form onSubmit={handleSubmit}>
              {/* Section Header */}
              {/* <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaUsers className="me-2" />
                    Section Header
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <FormField
                        type="text"
                        name="heading"
                        label="Team Section Heading *"
                        value={formData.heading}
                        onChange={handleInputChange}
                        placeholder="e.g., Meet our Volunteer"
                        required={true}
                        maxLength={25}
                      />
                      <small className="text-muted">{formData.heading.length}/25 characters</small>
                    </Col>
                    <Col md={12}>
                      <FormField
                        type="textarea"
                        name="description"
                        label="Team Section Description *"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter the team section description..."
                        rows={3}
                        required={true}
                        maxLength={130}
                      />
                      <small className="text-muted">{formData.description.length}/130 characters</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card> */}

              {/* Team Members */}
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Team Members ({formData.teamMembers.length})</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addTeamMember}
                  >
                    <FaPlus className="me-1" />
                    Add Team Member
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {formData.teamMembers.map((member, index) => (
                      <Col md={6} key={member.id} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Team Member {index + 1}</h6>
                            {formData.teamMembers.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeTeamMember(member.id)}
                                title="Remove team member"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </Card.Header>
                          <Card.Body>
                            <FormField
                              type="image"
                              name={`member_${member.id}_picture`}
                              value={member.picture}
                              onChange={(e) => handleTeamMemberChange(member.id, 'picture', e.target.value)}
                              placeholder="Upload or enter image URL..."
                              required={true}
                            />
                            
                            <FormField
                              type="text"
                              name={`member_${member.id}_name`}
                              label="Full Name *"
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange(member.id, 'name', e.target.value)}
                              placeholder="Enter team member's name..."
                              required={true}
                            />
                            
                            <FormField
                              type="text"
                              name={`member_${member.id}_designation`}
                              label="Designation *"
                              value={member.designation}
                              onChange={(e) => handleTeamMemberChange(member.id, 'designation', e.target.value)}
                              placeholder="e.g., General Manager"
                              required={true}
                            />
                            
                            {member.picture && (
                              <div className="mt-3">
                                <label className="form-label">Profile Preview</label>
                                <div className="text-center border rounded" style={{ padding: '15px' }}>
                                  <img
                                    src={member.picture}
                                    alt={`${member.name || 'Team member'} profile`}
                                    style={{ 
                                      width: '200px', 
                                      height: '200px', 
                                      objectFit: 'cover',
                                      borderRadius: '5%',
                                      border: '2px solid #dee2e6'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                  {member.name && (
                                    <div className="mt-2">
                                      <div className="fw-bold small">{member.name}</div>
                                      {member.designation && (
                                        <div className="text-muted small">{member.designation}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Save/Status Section */}
                            <div className="mt-3 d-flex justify-content-between align-items-center">
                              {member.isNew ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => saveTeamMemberToBackend(member)}
                                  disabled={member.isSaving || !member.picture || !member.name || !member.designation}
                                  className="flex-grow-1"
                                >
                                  {member.isSaving ? (
                                    <>
                                      <FaSpinner className="me-1 fa-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <FaSave className="me-1" />
                                      Save Member
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <div className="d-flex align-items-center text-success">
                                  <FaSave className="me-1" />
                                  <small>Saved Member</small>
                                </div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Section Status */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Section Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Section is active and visible on website
                        </label>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
};

export default EditTeamMembers;