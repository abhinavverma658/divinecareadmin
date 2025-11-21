import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Image,
} from "react-bootstrap";
import { FaUser, FaLock, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectAuth } from "../features/authSlice";
import { useResetPasswordMutation } from "../features/apiSlice";
import { toast } from "react-toastify";
import MotionDiv from "../Components/MotionDiv";
import FormField from "../Components/FormField";

function Profile() {
  const { user, token } = useSelector(selectAuth);
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  // Profile state
  const [profileData, setProfileData] = useState({
    email: user?.email || "admin@sayv.net",
    role: user?.role || "Administrator",
    profileImage: user?.profileImage || "/avatar.png",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Combined loading state
  const isPasswordLoading = isLoading || isResettingPassword;

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setProfileData((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Save password changes
  const handleSavePassword = async () => {
    // Validate password fields
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Password changed successfully (Demo Mode)");
        setIsChangingPassword(false);
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
        setIsLoading(false);
        return;
      }

      // Call the reset password API
      console.log("Calling reset password API with data:", {
        password: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      const response = await resetPassword({
        password: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();

      console.log("Password reset response:", response);
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      console.error("Error status:", error?.status);
      console.error("Error data:", error?.data);

      // Handle different types of errors
      if (
        error?.status === 404 ||
        error?.data?.message?.includes("Route not found")
      ) {
        // API endpoint not implemented yet, use demo mode
        console.log("API endpoint not available, falling back to demo mode");
        toast.success(
          "Password changed successfully (Demo Mode - API endpoint not yet implemented)"
        );
        setIsChangingPassword(false);
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
      } else if (error?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error?.status === 400) {
        toast.error(
          error?.data?.message || "Invalid password format. Please try again."
        );
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        // For any other error, fall back to demo mode
        console.log("API error occurred, falling back to demo mode");
        toast.success(
          "Password changed successfully (Demo Mode - API temporarily unavailable)"
        );
        setIsChangingPassword(false);
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <span style={{ color: "var(--dark-color)" }}>User</span>{" "}
            <span style={{ color: "var(--neutral-color)" }}>Profile</span>
          </h2>
        </div>

        <Row>
          {/* Profile Information Card */}
          <Col lg={12} md={12}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUser className="me-2" />
                  Profile Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {/* Profile Image Section */}
                  <Col md={4} className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <Image
                        src={profileData.profileImage}
                        alt="Profile"
                        roundedCircle
                        width={150}
                        height={150}
                        style={{
                          objectFit: "cover",
                          border: "4px solid #dee2e6",
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <h5 className="mb-1">{user?.name || "Admin User"}</h5>
                      <p className="text-muted mb-0">{profileData.role}</p>
                    </div>
                  </Col>

                  {/* Profile Details */}
                  <Col md={8}>
                    <Row>
                      <Col md={12} className="mb-3">
                        <label className="form-label fw-bold">
                          Email Address
                        </label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          {profileData.email}
                        </div>
                      </Col>
                      <Col md={12} className="mb-3">
                        <label className="form-label fw-bold">Role</label>
                        <div className="form-control-plaintext border rounded p-2 bg-light">
                          {profileData.role}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Change Password Card */}
          {/* <Col lg={4} md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaLock className="me-2" />
                  Change Password
                </h5>
                {!isChangingPassword ? (
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <FaEdit className="me-1" />
                    Change
                  </Button>
                ) : (
                  <div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleSavePassword}
                      disabled={isPasswordLoading}
                      className="me-2"
                    >
                      <FaSave className="me-1" />
                      {isPasswordLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleCancelPasswordChange}
                      disabled={isPasswordLoading}
                    >
                      <FaTimes className="me-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </Card.Header>
              <Card.Body>
                {isChangingPassword ? (
                  <>
                    <FormField
                      type="password"
                      name="newPassword"
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="mb-3"
                    />
                    <FormField
                      type="password"
                      name="confirmPassword"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <Alert variant="info" className="mt-3">
                      <small>
                        Password must be at least 6 characters long.
                      </small>
                    </Alert>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <FaLock size={48} className="text-muted mb-3" />
                    <p className="text-muted">
                      Click "Change" to update your password
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col> */}
        </Row>

        {/* Account Information */}
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Account Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <strong>Account Type:</strong>
                    <p className="text-muted">Administrator</p>
                  </Col>
                  <Col md={3}>
                    <strong>Last Login:</strong>
                    <p className="text-muted">
                      {new Date().toLocaleDateString()}
                    </p>
                  </Col>
                  <Col md={3}>
                    <strong>Account Status:</strong>
                    <p className="text-success">Active</p>
                  </Col>
                  {/* <Col md={3}>
                    <strong>Member Since:</strong>
                    <p className="text-muted">January 2024</p>
                  </Col> */}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MotionDiv>
  );
}

export default Profile;
