import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Badge, Alert, Spinner, Modal } from "react-bootstrap";
import { FaBell, FaEnvelope, FaCheck, FaTimes, FaPlay, FaCog, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import MotionDiv from "../../Components/MotionDiv";
import CustomTable from "../../Components/CustomTable";
import FormField from "../../Components/FormField";
import ModalTemplate from "../../Components/ModalTemplate";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";
import {
  useGetEmailAlertSettingsMutation,
  useUpdateEmailAlertSettingsMutation,
  useTestEmailAlertMutation,
  useSendNotificationMutation
} from "../../features/apiSlice";

const EmailAlerts = () => {
  const { token } = useSelector(selectAuth);
  const [alertSettings, setAlertSettings] = useState({
    jobApplications: {
      enabled: true,
      immediate: true,
      daily: false,
      weekly: false
    },
    contactForms: {
      enabled: true,
      immediate: true,
      daily: false,
      weekly: false
    },
    // eventRegistrations: {
    //   enabled: false,
    //   immediate: false,
    //   daily: false,
    //   weekly: false
    // },
  });

  const [notificationEmails, setNotificationEmails] = useState([
    { id: 1, email: "admin@sayv.net", name: "Primary Admin", active: true, createdAt: "2024-01-15" },
    { id: 2, email: "manager@sayv.net", name: "Content Manager", active: true, createdAt: "2024-01-20" },
    { id: 3, email: "support@sayv.net", name: "Support Team", active: false, createdAt: "2024-02-01" }
  ]);

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 1,
      type: "Job Application",
      recipient: "admin@sayv.net",
      subject: "New Job Application Received",
      status: "delivered",
      sentAt: "2024-03-15 10:30:00",
      details: "Application for Senior Developer position"
    },
    {
      id: 2,
      type: "Contact Form",
      recipient: "admin@sayv.net",
      subject: "New Contact Form Submission",
      status: "delivered",
      sentAt: "2024-03-15 09:15:00",
      details: "Inquiry about financial planning services"
    },
    {
      id: 3,
      type: "Event Registration",
      recipient: "manager@sayv.net",
      subject: "New Event Registration",
      status: "failed",
      sentAt: "2024-03-14 16:45:00",
      details: "Registration for Investment Workshop"
    },
    {
      id: 4,
      type: "Job Application",
      recipient: "admin@sayv.net",
      subject: "New Job Application Received",
      status: "delivered",
      sentAt: "2024-03-14 14:20:00",
      details: "Application for Marketing Specialist position"
    },
    {
      id: 5,
      type: "Contact Form",
      recipient: "support@sayv.net",
      subject: "New Contact Form Submission",
      status: "delivered",
      sentAt: "2024-03-13 11:10:00",
      details: "Question about retirement planning"
    }
  ]);

  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [newEmailForm, setNewEmailForm] = useState({ email: "", name: "" });
  const [testEmailForm, setTestEmailForm] = useState({ email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  // Statistics
  const stats = {
    totalEmails: notificationEmails.length,
    activeEmails: notificationEmails.filter(email => email.active).length,
    totalNotifications: notificationHistory.length,
    deliveredToday: notificationHistory.filter(n => 
      new Date(n.sentAt).toDateString() === new Date().toDateString() && n.status === 'delivered'
    ).length,
    failedToday: notificationHistory.filter(n => 
      new Date(n.sentAt).toDateString() === new Date().toDateString() && n.status === 'failed'
    ).length
  };

  useEffect(() => {
    fetchEmailAlertSettings();
  }, []);

  const fetchEmailAlertSettings = async () => {
    try {
      setLoading(true);
      if (token && !token.startsWith("demo-token")) {
        const result = await getEmailAlertSettings().unwrap();
        if (result.data) {
          setAlertSettings(result.data.settings);
          setNotificationEmails(result.data.emails);
        }
      }
    } catch (error) {
      console.error("Error fetching email alert settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      if (token && !token.startsWith("demo-token")) {
        await updateEmailAlertSettings({ settings: alertSettings }).unwrap();
        toast.success("Email alert settings updated successfully!");
      } else {
        // Demo mode
        toast.success("Email alert settings updated successfully! (Demo Mode)");
      }
    } catch (error) {
      toast.error("Failed to update email alert settings");
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmailForm.email || !newEmailForm.name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Demo mode only for now
      const newEmail = {
        id: Date.now(),
        email: newEmailForm.email,
        name: newEmailForm.name,
        active: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setNotificationEmails(prev => [...prev, newEmail]);
      toast.success("Email address added successfully! (Demo Mode)");
      setNewEmailForm({ email: "", name: "" });
      setShowAddEmailModal(false);
    } catch (error) {
      toast.error("Failed to add email address");
      console.error("Error adding email:", error);
    }
  };

  const handleDeleteEmail = async (id) => {
    try {
      // Demo mode only for now
      setNotificationEmails(prev => prev.filter(email => email.id !== id));
      toast.success("Email address deleted successfully! (Demo Mode)");
    } catch (error) {
      toast.error("Failed to delete email address");
      console.error("Error deleting email:", error);
    }
  };

  const handleToggleEmailStatus = (id) => {
    setNotificationEmails(prev => 
      prev.map(email => 
        email.id === id ? { ...email, active: !email.active } : email
      )
    );
  };

  const handleTestEmail = async () => {
    if (!testEmailForm.email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setTestLoading(true);
      if (token && !token.startsWith("demo-token")) {
        await testEmailAlert(testEmailForm).unwrap();
        toast.success("Test email sent successfully!");
      } else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Test email sent successfully! (Demo Mode)");
      }
      setTestEmailForm({ email: "", message: "" });
      setShowTestEmailModal(false);
    } catch (error) {
      toast.error("Failed to send test email");
      console.error("Error sending test email:", error);
    } finally {
      setTestLoading(false);
    }
  };

  const emailColumns = [
    {
      key: "email",
      label: "Email Address",
      render: (email) => (
        <div>
          <div className="fw-bold">{email.email}</div>
          <small className="text-muted">{email.name}</small>
        </div>
      )
    },
    {
      key: "active",
      label: "Status",
      render: (email) => (
        <Badge bg={email.active ? "success" : "secondary"}>
          {email.active ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "createdAt",
      label: "Added Date",
      render: (email) => new Date(email.createdAt).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (email) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant={email.active ? "outline-warning" : "outline-success"}
            onClick={() => handleToggleEmailStatus(email.id)}
          >
            {email.active ? <FaTimes /> : <FaCheck />}
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDeleteEmail(email.id)}
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ];

  const historyColumns = [
    {
      key: "type",
      label: "Notification Type",
      render: (item) => (
        <Badge bg="primary" className="px-2 py-1">
          {item.type}
        </Badge>
      )
    },
    {
      key: "recipient",
      label: "Recipient",
      render: (item) => item.recipient
    },
    {
      key: "subject",
      label: "Subject",
      render: (item) => (
        <div>
          <div className="fw-bold">{item.subject}</div>
          <small className="text-muted">{item.details}</small>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge bg={item.status === 'delivered' ? "success" : "danger"}>
          {item.status}
        </Badge>
      )
    },
    {
      key: "sentAt",
      label: "Sent At",
      render: (item) => new Date(item.sentAt).toLocaleString()
    }
  ];

  return (
    <MotionDiv>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaBell className="me-2 text-primary" />
            Email Alert Settings
          </h2>
          <p className="text-muted mb-0">
            Configure email notifications for new applications and inquiries
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowTestEmailModal(true)}
          >
            <FaPlay className="me-2" />
            Test Email
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <FaCheck className="me-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-primary mb-2">
                <FaEnvelope size={24} />
              </div>
              <h4 className="mb-1">{stats.totalEmails}</h4>
              <small className="text-muted">Total Email Recipients</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2">
                <FaCheck size={24} />
              </div>
              <h4 className="mb-1">{stats.activeEmails}</h4>
              <small className="text-muted">Active Recipients</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <FaBell size={24} />
              </div>
              <h4 className="mb-1">{stats.deliveredToday}</h4>
              <small className="text-muted">Delivered Today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">
                <FaTimes size={24} />
              </div>
              <h4 className="mb-1">{stats.failedToday}</h4>
              <small className="text-muted">Failed Today</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Notification Settings */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <FaCog className="me-2" />
                Notification Preferences
              </h5>
            </Card.Header>
            <Card.Body>
              {Object.entries(alertSettings).map(([category, settings]) => (
                <div key={category} className="mb-4 pb-3 border-bottom">
                  <h6 className="text-capitalize mb-3">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h6>
                  <Row>
                    <Col md={3}>
                      <Form.Check
                        type="switch"
                        id={`${category}-enabled`}
                        label="Enable Notifications"
                        checked={settings.enabled}
                        onChange={(e) => handleSettingChange(category, 'enabled', e.target.checked)}
                      />
                    </Col>
                    {settings.enabled && (
                      <>
                        <Col md={3}>
                          <Form.Check
                            type="radio"
                            name={`${category}-frequency`}
                            id={`${category}-immediate`}
                            label="Immediate"
                            checked={settings.immediate}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSettingChange(category, 'immediate', true);
                                handleSettingChange(category, 'daily', false);
                                handleSettingChange(category, 'weekly', false);
                              }
                            }}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Check
                            type="radio"
                            name={`${category}-frequency`}
                            id={`${category}-daily`}
                            label="Daily Digest"
                            checked={settings.daily}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSettingChange(category, 'immediate', false);
                                handleSettingChange(category, 'daily', true);
                                handleSettingChange(category, 'weekly', false);
                              }
                            }}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Check
                            type="radio"
                            name={`${category}-frequency`}
                            id={`${category}-weekly`}
                            label="Weekly Summary"
                            checked={settings.weekly}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSettingChange(category, 'immediate', false);
                                handleSettingChange(category, 'daily', false);
                                handleSettingChange(category, 'weekly', true);
                              }
                            }}
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Email Recipients */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaEnvelope className="me-2" />
                Email Recipients
              </h5>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => setShowAddEmailModal(true)}
              >
                <FaPlus className="me-1" />
                Add Email
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <CustomTable
                data={notificationEmails}
                columns={emailColumns}
                showPagination={false}
                className="mb-0"
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Notification History */}
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <FaBell className="me-2" />
                Recent Notifications
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <CustomTable
                data={notificationHistory}
                columns={historyColumns}
                showPagination={true}
                itemsPerPage={10}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Email Modal */}
      <ModalTemplate
        show={showAddEmailModal}
        handleClose={() => {
          setShowAddEmailModal(false);
          setNewEmailForm({ email: "", name: "" });
        }}
        title="Add Notification Email"
        size="md"
      >
        <Form>
          <FormField
            label="Email Address"
            type="email"
            name="email"
            value={newEmailForm.email}
            onChange={(e) => setNewEmailForm({ ...newEmailForm, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
          <FormField
            label="Name/Description"
            type="text"
            name="name"
            value={newEmailForm.name}
            onChange={(e) => setNewEmailForm({ ...newEmailForm, name: e.target.value })}
            placeholder="Enter name or description"
            required
          />
        </Form>
        <div className="text-end mt-3">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => setShowAddEmailModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddEmail}>
            Add Email
          </Button>
        </div>
      </ModalTemplate>

      {/* Test Email Modal */}
      <ModalTemplate
        show={showTestEmailModal}
        handleClose={() => {
          setShowTestEmailModal(false);
          setTestEmailForm({ email: "", message: "" });
        }}
        title="Send Test Email"
        size="md"
      >
        <Form>
          <FormField
            label="Test Email Address"
            type="email"
            name="email"
            value={testEmailForm.email}
            onChange={(e) => setTestEmailForm({ ...testEmailForm, email: e.target.value })}
            placeholder="Enter email address to test"
            required
          />
          <FormField
            label="Test Message (Optional)"
            type="textarea"
            name="message"
            value={testEmailForm.message}
            onChange={(e) => setTestEmailForm({ ...testEmailForm, message: e.target.value })}
            placeholder="Enter optional test message"
            rows={3}
          />
        </Form>
        <div className="text-end mt-3">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => setShowTestEmailModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleTestEmail}
            disabled={testLoading}
          >
            {testLoading ? <Spinner size="sm" className="me-2" /> : <FaPlay className="me-2" />}
            Send Test Email
          </Button>
        </div>
      </ModalTemplate>
    </MotionDiv>
  );
};

export default EmailAlerts;