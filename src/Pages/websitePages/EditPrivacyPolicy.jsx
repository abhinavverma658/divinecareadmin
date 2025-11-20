import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import TextEditor from "../../Components/TextEditor";
import FormField from "../../Components/FormField";
import {
  useGetPrivacyPolicyMutation,
  useUpdatePrivacyPolicyMutation,
} from "../../features/apiSlice";

const EditPrivacyPolicy = () => {
  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [getPrivacyPolicy, { isLoading: fetchLoading }] =
    useGetPrivacyPolicyMutation();
  const [updatePrivacyPolicy, { isLoading: updateLoading }] =
    useUpdatePrivacyPolicyMutation();

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await getPrivacyPolicy().unwrap();
      if (response.success && response.page) {
        setForm({
          title: response.page.title || "",
          content: response.page.content || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch privacy policy:", error);
      toast.error("Failed to load privacy policy");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleEditorChange = (content) => {
    setForm({ ...form, content });
    if (errors.content) {
      setErrors({ ...errors, content: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title || form.title.trim() === "") {
      newErrors.title = "Title is required";
    }

    if (
      !form.content ||
      form.content.trim() === "" ||
      form.content === "<p><br></p>"
    ) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await updatePrivacyPolicy(form).unwrap();

      if (response.success) {
        toast.success("Privacy Policy updated successfully!");
        fetchPrivacyPolicy();
      } else {
        toast.error(response.message || "Failed to update privacy policy");
      }
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      toast.error(error?.data?.message || "Failed to update privacy policy");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Edit Privacy Policy</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col lg={12}>
                    <FormField
                      label="Title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      required={true}
                      error={errors.title}
                      placeholder="Enter privacy policy title"
                    />
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Content <span className="text-danger">*</span>
                      </Form.Label>
                      <TextEditor
                        value={form.content}
                        onChange={handleEditorChange}
                        placeholder="Enter privacy policy content..."
                      />
                      {errors.content && (
                        <Form.Text className="text-danger">
                          {errors.content}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || updateLoading}
                      >
                        {loading || updateLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Updating...
                          </>
                        ) : (
                          "Update Privacy Policy"
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditPrivacyPolicy;
