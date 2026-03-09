import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import CustomTable from "../../Components/CustomTable";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";
import { FaTrash } from "react-icons/fa";

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = useSelector(selectAuth);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_URL}/api/subscribe`;
      const token = auth?.token;
      if (!token) {
        toast.error("Not authenticated.");
        setSubscribers([]);
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch subscribers: ${res.status} ${text}`);
      }
      const data = await res.json();
      // Expecting an array
      if (Array.isArray(data)) setSubscribers(data);
      else if (Array.isArray(data.data)) setSubscribers(data.data);
      else if (Array.isArray(data.subscribers))
        setSubscribers(data.subscribers);
      else setSubscribers([]);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      toast.error("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when component mounts or when token changes
    if (auth?.token) fetchSubscribers();
  }, [auth?.token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) {
      return;
    }
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/subscribe/${id}`;
      const token = auth?.token;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete subscriber: ${res.status} ${text}`);
      }
      toast.success("Subscriber deleted successfully");
      fetchSubscribers();
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      toast.error("Failed to delete subscriber");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL subscribers? This action cannot be undone!",
      )
    ) {
      return;
    }
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/subscribe`;
      const token = auth?.token;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to delete all subscribers: ${res.status} ${text}`,
        );
      }
      toast.success("All subscribers deleted successfully");
      fetchSubscribers();
    } catch (err) {
      console.error("Error deleting all subscribers:", err);
      toast.error("Failed to delete all subscribers");
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4 mt-2">
        <Col>
          <h2>
            <span style={{ color: "var(--dark-color)", marginLeft: "10px" }}>
              Subscribers
            </span>{" "}
          </h2>
          <p
            className="text-muted"
            style={{ color: "var(--dark-color)", marginLeft: "10px" }}
          >
            Manage newsletter subscribers
          </p>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <Button
            variant="danger"
            onClick={handleDeleteAll}
            disabled={!subscribers || subscribers.length === 0}
          >
            Delete All Subscribers
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <CustomTable
                column={["S.No.", "Email", "Subscribed At", "Delete"]}
                isSearch={false}
                loading={loading}
              >
                {subscribers && subscribers.length > 0 ? (
                  subscribers.map((s, idx) => (
                    <tr key={s._id || idx}>
                      <td className="text-center">
                        <strong>{idx + 1}</strong>
                      </td>
                      <td className="text-center">{s.email}</td>
                      <td>
                        {s.subscribedAt
                          ? new Date(s.subscribedAt).toLocaleString()
                          : ""}
                      </td>
                      <td className="text-center">
                        <FaTrash
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => handleDelete(s._id)}
                          title="Delete subscriber"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      No subscribers found
                    </td>
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
