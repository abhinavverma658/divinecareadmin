import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../Components/FormField';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Get token from URL query params

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    try {
      setLoading(true);
      // Call backend API to reset password
      const res = await fetch(`https://divinecare-backend.onrender.com/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: password.trim(),
          confirmPassword: confirmPassword.trim()
        })
      });

      let payload;
      try {
        payload = await res.json();
      } catch (jsonErr) {
        payload = null;
      }

      if (res.ok && payload && payload.success) {
        toast.success('Password reset successfully. Please login with your new password.');
        navigate('/');
      } else {
        // Prefer server message if available
        const msg = (payload && (payload.message || payload.error)) || `Failed to reset password (status ${res.status})`;
        toast.error(msg);
      }
    } catch (err) {
      // Network or unexpected error
      console.error('Reset password error:', err);
      toast.error('Failed to reset password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: 'var(--dark-color)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container className="custom-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Card className="shadow rounded-4 p-4 text-white" style={{ background: 'var(--secondary-color)', width: '500px', maxWidth: '100%' }}>
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-3">
              <h3>Reset Password</h3>
              <p className="text-muted">Enter your new password below.</p>
            </div>
            <Row>
              <Col sm={12}>
                <FormField
                  label="New Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col sm={12}>
                <FormField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="text-center">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Reset Password'}
                </Button>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="text-center">
                <Link to="/" className="text-decoration-none">Back to Login</Link>
              </Col>
            </Row>
          </form>
        </Card>
      </Container>
    </section>
  );
};

export default ResetPassword;
