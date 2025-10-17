import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTeamMemberByIdMutation, useCreateTeamMemberMutation, useUpdateTeamMemberMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import { FaSave, FaArrowLeft, FaUpload, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const AddEditTeamMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getTeamMemberById, { isLoading }] = useGetTeamMemberByIdMutation();
  const [createTeamMember, { isLoading: createLoading }] = useCreateTeamMemberMutation();
  const [updateTeamMember, { isLoading: updateLoading }] = useUpdateTeamMemberMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    department: '',
    bio: '',
    email: '',
    phone: '',
    image: '',
    isActive: true,
    featured: false,
    order: 999,
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: '',
      facebook: '',
      instagram: ''
    },
    skills: [],
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const departments = [
    'Executive',
    'Investment',
    'Advisory',
    'Marketing',
    'Operations',
    'HR',
    'IT',
    'Finance',
    'Legal',
    'Customer Service'
  ];

  const fetchTeamMember = async () => {
    if (!id) return;

    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on id
        const demoData = {
          _id: id,
          name: 'John Smith',
          title: 'CEO & Founder',
          department: 'Executive',
          bio: 'John brings over 20 years of experience in financial services and strategic leadership. He founded SAYV Financial with a vision to democratize financial planning.',
          email: 'john.smith@sayv.net',
          phone: '+1 (555) 123-4567',
          image: 'https://creative-story.s3.amazonaws.com/team/john-smith.jpg',
          isActive: true,
          featured: true,
          order: 1,
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johnsmith',
            twitter: 'https://twitter.com/johnsmith',
            website: 'https://johnsmith.com',
            facebook: '',
            instagram: ''
          },
          skills: ['Leadership', 'Strategic Planning', 'Financial Analysis'],
          joinDate: '2008-01-15'
        };
        
        setFormData(demoData);
        setImagePreview(demoData.image);
        return;
      }

      // Real API call for production
      const data = await getTeamMemberById(id).unwrap();
      const memberData = data?.teamMember || {};
      
      setFormData({
        ...memberData,
        socialLinks: memberData.socialLinks || {
          linkedin: '',
          twitter: '',
          website: '',
          facebook: '',
          instagram: ''
        },
        skills: memberData.skills || [],
        joinDate: memberData.joinDate ? memberData.joinDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
      
      if (memberData.image) {
        setImagePreview(memberData.image);
      }
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeamMember();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let submitData = { ...formData };

      // Handle image upload
      if (imageFile) {
        // In a real application, you would upload the image to a service like AWS S3
        // For demo purposes, we'll use a placeholder URL
        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);
        
        // This would be replaced with actual image upload logic
        submitData.image = `https://creative-story.s3.amazonaws.com/team/${Date.now()}-${imageFile.name}`;
      }

      const data = id 
        ? await updateTeamMember({ id, data: submitData }).unwrap()
        : await createTeamMember(submitData).unwrap();
      
      toast.success(data?.message || `Team member ${id ? 'updated' : 'created'} successfully`);
      navigate('/dash/team-members');
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
              onClick={() => navigate('/dash/team-members')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back to Team
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'}</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>Team Member</span>
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
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="text"
                        name="title"
                        label="Job Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., CEO & Founder"
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="date"
                        name="joinDate"
                        label="Join Date"
                        value={formData.joinDate}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>

                  <FormField
                    type="textarea"
                    name="bio"
                    label="Biography"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    placeholder="Write a brief biography about this team member..."
                    rows={4}
                  />
                </Card.Body>
              </Card>

              {/* Contact Information */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Contact Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="email"
                        name="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@company.com"
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="tel"
                        name="phone"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Social Links */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Social Links (Optional)</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="url"
                        name="socialLinks.linkedin"
                        label="LinkedIn Profile"
                        value={formData.socialLinks.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="url"
                        name="socialLinks.twitter"
                        label="Twitter Profile"
                        value={formData.socialLinks.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormField
                        type="url"
                        name="socialLinks.website"
                        label="Personal Website"
                        value={formData.socialLinks.website}
                        onChange={handleChange}
                        placeholder="https://website.com"
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        type="url"
                        name="socialLinks.facebook"
                        label="Facebook Profile"
                        value={formData.socialLinks.facebook}
                        onChange={handleChange}
                        placeholder="https://facebook.com/username"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Skills */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Skills & Expertise</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Form.Label>Add Skill</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Enter a skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button
                        variant="outline-primary"
                        className="ms-2"
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div>
                      <Form.Label>Current Skills:</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            bg="primary" 
                            className="d-flex align-items-center"
                            style={{ fontSize: '0.9em' }}
                          >
                            {skill}
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 ms-1 text-white"
                              onClick={() => removeSkill(skill)}
                              style={{ fontSize: '0.8em' }}
                            >
                              <FaMinus />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Profile Image */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Profile Photo</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  {imagePreview ? (
                    <div className="mb-3">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        roundedCircle
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                      <div className="mt-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removeImage}
                        >
                          <FaTrash className="me-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div 
                        className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{ width: '150px', height: '150px' }}
                      >
                        <FaUpload size={40} className="text-muted" />
                      </div>
                    </div>
                  )}
                  
                  <Form.Group>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Upload a profile photo (Max 5MB, JPG/PNG)
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

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
                      label="Active Member"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Inactive members won't appear on the website
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="featured"
                      label="Featured Member"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Featured members appear prominently on the website
                    </Form.Text>
                  </Form.Group>

                  <FormField
                    type="number"
                    name="order"
                    label="Display Order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    placeholder="999"
                  />
                  <Form.Text className="text-muted">
                    Lower numbers appear first
                  </Form.Text>
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
                      {isLoading_ ? 'Saving...' : (id ? 'Update Team Member' : 'Add Team Member')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dash/team-members')}
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

export default AddEditTeamMember;