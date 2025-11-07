import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../Components/FormField';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      // Call backend API to send reset link
      const res = await fetch('https://divinecare-backend.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      let payload;
      try {
        payload = await res.json();
      } catch (jsonErr) {
        payload = null;
      }

      if (res.ok && payload && payload.success) {
        // Show the requested success message
        toast.success('Password reset email sent successfully. Please check on you Email Id');
        navigate('/');
      } else {
        // Prefer server message if available
        const msg = (payload && (payload.message || payload.error)) || `Failed to send reset link (status ${res.status})`;
        toast.error(msg);
      }
    } catch (err) {
      // Network or unexpected error
      console.error('Forgot password error:', err);
      toast.error('Failed to send reset link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: 'var(--dark-color)' }}>
      <Container className="p-5 custom-section d-flex justify-content-center align-items-center">
        <Card className="shadow rounded-4 p-4 text-white" style={{ background: 'var(--secondary-color)', maxWidth: 480 }}>
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-3">
              <h3>Forgot Password</h3>
              <p className="text-muted">Enter the email associated with your account and we'll send a reset link.</p>
            </div>
            <Row>
              <Col sm={12}>
                <FormField
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="text-center">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
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

export default ForgotPassword;
