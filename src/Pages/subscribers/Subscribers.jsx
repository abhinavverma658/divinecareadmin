import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import CustomTable from '../../Components/CustomTable';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = useSelector(selectAuth);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const url = 'https://divinecare-backend.onrender.com/api/subscribe';
      const token = auth?.token;
      if (!token) {
        toast.error('Not authenticated.');
        setSubscribers([]);
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch subscribers: ${res.status} ${text}`);
      }
      const data = await res.json();
      // Expecting an array
      if (Array.isArray(data)) setSubscribers(data);
      else if (Array.isArray(data.data)) setSubscribers(data.data);
      else if (Array.isArray(data.subscribers)) setSubscribers(data.subscribers);
      else setSubscribers([]);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      toast.error('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when component mounts or when token changes
    if (auth?.token) fetchSubscribers();
  }, [auth?.token]);

  return (
    <Container fluid>
      <Row className="mb-4 mt-2">
        <Col>
          <h2>
            <span style={{ color: 'var(--dark-color)' , marginLeft:'10px'}}>Subscribers</span>{' '}
          </h2>
          <p className="text-muted" style={{ color: 'var(--dark-color)' , marginLeft:'10px'}}>Manage newsletter subscribers</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <CustomTable
                column={["S.No.", "Email", "Subscribed At"]}
                isSearch={false}
                loading={loading}
              >
                {subscribers && subscribers.length > 0 ? (
                  subscribers.map((s, idx) => (
                    <tr key={s._id || idx}>
                      <td className="text-center"><strong>{idx + 1}</strong></td>
                        <td className="text-center">{s.email}</td>
                      <td>{s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">No subscribers found</td>
                  </tr>
                )}
              </CustomTable>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Subscribers;
