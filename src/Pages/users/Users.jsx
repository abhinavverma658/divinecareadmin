import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Button,
  Modal,
  Row,
  Col,
  Badge,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaEye,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import CustomTable from "../../Components/CustomTable";
import MotionDiv from "../../Components/MotionDiv";
import { toast } from "react-toastify";
import {
  useGetAcceptedCandidatesMutation,
  useGetPostAcceptanceFormMutation,
} from "../../features/apiSlice";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formDetails, setFormDetails] = useState(null);

  const [getAcceptedCandidates] = useGetAcceptedCandidatesMutation();
  const [getPostAcceptanceForm] = useGetPostAcceptanceFormMutation();

  // Prevent double fetch in React.StrictMode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Skip if already fetched (prevents double fetch in StrictMode)
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    const fetchAcceptedCandidates = async () => {
      setIsLoading(true);
      try {
        const response = await getAcceptedCandidates().unwrap();

        // Extract forms array from response
        const formsData = response.forms || [];

        // Map only necessary data to avoid large object spreading
        const mappedUsers = formsData.map((form) => ({
          _id: form._id,
          applicant: form.applicant,
          name: `${form.personalInfo?.firstName || ""} ${form.personalInfo?.lastName || ""}`.trim(),
          position:
            typeof form.positionAppliedFor === "object" &&
            form.positionAppliedFor !== null
              ? form.positionAppliedFor.title || "N/A"
              : form.positionAppliedFor || "N/A",
          email: form.personalInfo?.contactEmail || "",
          // Store full data for details view
          fullData: form,
        }));

        setUsers(mappedUsers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching accepted candidates:", error);
        toast.error("Failed to fetch accepted candidates");
        setIsLoading(false);
      }
    };

    fetchAcceptedCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);

    // Use the cached full data instead of making another API call
    if (user.fullData) {
      setFormDetails(user.fullData);
    } else {
      setFormDetails(null);
      toast.error("Form details not available");
    }
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: "var(--dark-color)" }}>Accepted</span>{" "}
              <span style={{ color: "var(--dark-color)" }}>Candidates</span>
            </h2>
            <p className="text-muted">
              View all accepted candidates and their details
            </p>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0 d-flex align-items-center">
              <FaUser className="me-2" />
              Accepted Candidates List
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <CustomTable
              column={[
                "S.No.",
                "Accepted Candidate Name",
                "Position Applied",
                "View Details",
              ]}
              isSearch={false}
              loading={isLoading}
            >
              {users && users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id || index}>
                    <td className="text-center">
                      <strong>{index + 1}</strong>
                    </td>
                    <td>
                      <div>
                        <h6 className="mb-0">{user.name}</h6>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </td>
                    <td>
                      <span>{user.position}</span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleViewDetails(user)}
                        title="View Details"
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No accepted candidates found
                  </td>
                </tr>
              )}
            </CustomTable>
          </Card.Body>
        </Card>

        {/* User Details Modal */}
        <Modal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Candidate Details -{" "}
              {selectedUser?.name ||
                formDetails?.personalInfo?.firstName +
                  " " +
                  formDetails?.personalInfo?.lastName ||
                "Loading..."}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formDetails ? (
              <div>
                {/* Position Applied */}
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h5 className="mb-3">
                          <Badge bg="primary" className="p-2">
                            {typeof formDetails.positionAppliedFor ===
                              "object" &&
                            formDetails.positionAppliedFor !== null
                              ? formDetails.positionAppliedFor.title || "N/A"
                              : formDetails.positionAppliedFor || "N/A"}
                          </Badge>
                        </h5>
                        <Row>
                          <Col md={6}>
                            <small className="text-muted">
                              Application Date:
                            </small>
                            <div>
                              <strong>
                                {formDetails.date
                                  ? new Date(
                                      formDetails.date,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">
                              Referral Source:
                            </small>
                            <div>
                              <strong>
                                {typeof formDetails.referralSource ===
                                  "object" &&
                                formDetails.referralSource !== null
                                  ? formDetails.referralSource.title ||
                                    JSON.stringify(formDetails.referralSource)
                                  : formDetails.referralSource || "N/A"}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Personal Information */}
                {formDetails.personalInfo && (
                  <>
                    <h5 className="mb-3 text-primary">Personal Information</h5>
                    <Card className="mb-4">
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={4}>
                            <small className="text-muted">First Name</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.firstName}
                              </strong>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">Middle Name</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.middleName || "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">Last Name</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.lastName}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={12}>
                            <small className="text-muted">Address</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.addressLine}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={4}>
                            <small className="text-muted">City</small>
                            <div>
                              <strong>{formDetails.personalInfo.city}</strong>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">State</small>
                            <div>
                              <strong>{formDetails.personalInfo.state}</strong>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">Zip Code</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.zipCode}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <small className="text-muted">Home Phone</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.homePhone}
                              </strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Email</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.contactEmail}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <small className="text-muted">
                              Best Time to Call
                            </small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.bestTimeToCall ||
                                  "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Work Time</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.workTime || "N/A"}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <small className="text-muted">
                              Contact at Work
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.mayContactAtWork
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.mayContactAtWork
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">
                              Contact at Home
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.mayContactAtHome
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.mayContactAtHome
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <small className="text-muted">
                              Desired Salary Range
                            </small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.desiredSalaryRange ||
                                  "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">
                              Employment Type
                            </small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.employmentType ||
                                  "N/A"}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <small className="text-muted">Available From</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.dateAvailableFrom
                                  ? new Date(
                                      formDetails.personalInfo
                                        .dateAvailableFrom,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Available To</small>
                            <div>
                              <strong>
                                {formDetails.personalInfo.dateAvailableTo
                                  ? new Date(
                                      formDetails.personalInfo.dateAvailableTo,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={3}>
                            <small className="text-muted">
                              Available Holidays
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.availableHolidays
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.availableHolidays
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              Available Weekends
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.availableWeekends
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.availableWeekends
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">On Call</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.onCall
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.onCall ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">Will Relocate</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.willRelocate
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.willRelocate
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={4}>
                            <small className="text-muted">Will Drive</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.willDrive
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.willDrive
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">
                              Meet Attendance
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.meetAttendance
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.meetAttendance
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={4}>
                            <small className="text-muted">
                              Will Work Overtime
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.personalInfo.willWorkOvertime
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.personalInfo.willWorkOvertime
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                        {formDetails.personalInfo.foreignLanguages &&
                          formDetails.personalInfo.foreignLanguages.length >
                            0 && (
                            <Row className="mb-3">
                              <Col md={12}>
                                <small className="text-muted">
                                  Foreign Languages
                                </small>
                                <div className="mt-2">
                                  {formDetails.personalInfo.foreignLanguages.map(
                                    (lang, idx) => (
                                      <div key={idx} className="mb-2">
                                        <strong>{lang.language}:</strong>{" "}
                                        {lang.read && (
                                          <Badge bg="info" className="me-1">
                                            Read
                                          </Badge>
                                        )}
                                        {lang.write && (
                                          <Badge bg="info" className="me-1">
                                            Write
                                          </Badge>
                                        )}
                                        {lang.speak && (
                                          <Badge bg="info" className="me-1">
                                            Speak
                                          </Badge>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </Col>
                            </Row>
                          )}
                        {formDetails.personalInfo.specialAccomplishments && (
                          <Row className="mb-3">
                            <Col md={12}>
                              <small className="text-muted">
                                Special Accomplishments
                              </small>
                              <div className="p-2 bg-light rounded mt-1">
                                {typeof formDetails.personalInfo
                                  .specialAccomplishments === "object"
                                  ? JSON.stringify(
                                      formDetails.personalInfo
                                        .specialAccomplishments,
                                    )
                                  : formDetails.personalInfo
                                      .specialAccomplishments}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {formDetails.personalInfo.skillsAndQualifications && (
                          <Row className="mb-3">
                            <Col md={12}>
                              <small className="text-muted">
                                Skills & Qualifications
                              </small>
                              <div className="p-2 bg-light rounded mt-1">
                                {typeof formDetails.personalInfo
                                  .skillsAndQualifications === "object"
                                  ? JSON.stringify(
                                      formDetails.personalInfo
                                        .skillsAndQualifications,
                                    )
                                  : formDetails.personalInfo
                                      .skillsAndQualifications}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {formDetails.personalInfo.additionalInfo && (
                          <Row className="mb-3">
                            <Col md={12}>
                              <small className="text-muted">
                                Additional Information
                              </small>
                              <div className="p-2 bg-light rounded mt-1">
                                {typeof formDetails.personalInfo
                                  .additionalInfo === "object"
                                  ? JSON.stringify(
                                      formDetails.personalInfo.additionalInfo,
                                    )
                                  : formDetails.personalInfo.additionalInfo}
                              </div>
                            </Col>
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* Legal Status */}
                {formDetails.legal && (
                  <>
                    <h5 className="mb-3 text-primary">Legal Status</h5>
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={3}>
                            <small className="text-muted">US Citizen</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.legal.usCitizen
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.legal.usCitizen ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              Authorized to Work
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.legal.authorized
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.legal.authorized ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              Can Work Legally
                            </small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.legal.canWork
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.legal.canWork ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">Felony Record</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.legal.felony
                                    ? "warning"
                                    : "success"
                                }
                              >
                                {formDetails.legal.felony ? "Yes" : "No"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                        {formDetails.legal.felonyDetails && (
                          <Row className="mt-3">
                            <Col md={12}>
                              <small className="text-muted">
                                Felony Details
                              </small>
                              <div className="p-2 bg-light rounded mt-1">
                                {formDetails.legal.felonyDetails}
                              </div>
                            </Col>
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* Education */}
                {formDetails.education && formDetails.education.length > 0 && (
                  <>
                    <h5 className="mb-3 text-primary">Education</h5>
                    <Card className="mb-4">
                      <Card.Body>
                        {formDetails.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className={idx > 0 ? "border-top pt-3 mt-3" : ""}
                          >
                            <Row className="mb-2">
                              <Col md={6}>
                                <small className="text-muted">
                                  Institution
                                </small>
                                <div>
                                  <strong>{edu.institution}</strong>
                                </div>
                              </Col>
                              <Col md={6}>
                                <small className="text-muted">Address</small>
                                <div>{edu.address}</div>
                              </Col>
                            </Row>
                            <Row className="mb-2">
                              <Col md={4}>
                                <small className="text-muted">Major</small>
                                <div>
                                  <strong>{edu.major}</strong>
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">Minor</small>
                                <div>{edu.minor || "N/A"}</div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">Degree</small>
                                <div>
                                  <Badge bg="primary">{edu.degree}</Badge>
                                </div>
                              </Col>
                            </Row>
                            <Row className="mb-2">
                              <Col md={4}>
                                <small className="text-muted">CGPA</small>
                                <div>
                                  <strong>{edu.cgpa}</strong>
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">Start Date</small>
                                <div>
                                  {new Date(edu.startDate).toLocaleDateString()}
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">End Date</small>
                                <div>
                                  {edu.ongoing ? (
                                    <Badge bg="info">Ongoing</Badge>
                                  ) : (
                                    new Date(edu.endDate).toLocaleDateString()
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* Employment History */}
                {formDetails.employmentHistory &&
                  formDetails.employmentHistory.length > 0 && (
                    <>
                      <h5 className="mb-3 text-primary">Employment History</h5>
                      <Card className="mb-4">
                        <Card.Body>
                          {formDetails.employmentHistory.map((emp, idx) => (
                            <div
                              key={idx}
                              className={idx > 0 ? "border-top pt-3 mt-3" : ""}
                            >
                              <Row className="mb-2">
                                <Col md={6}>
                                  <small className="text-muted">Employer</small>
                                  <div>
                                    <strong>{emp.employer}</strong>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <small className="text-muted">
                                    Job Title
                                  </small>
                                  <div>
                                    <strong>{emp.jobTitle}</strong>
                                  </div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={6}>
                                  <small className="text-muted">
                                    Department
                                  </small>
                                  <div>{emp.department}</div>
                                </Col>
                                <Col md={6}>
                                  <small className="text-muted">
                                    Supervisor
                                  </small>
                                  <div>{emp.supervisor}</div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={12}>
                                  <small className="text-muted">Address</small>
                                  <div>{emp.address}</div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={6}>
                                  <small className="text-muted">Phone</small>
                                  <div>{emp.phone}</div>
                                </Col>
                                <Col md={6}>
                                  <small className="text-muted">
                                    Work Phone
                                  </small>
                                  <div>{emp.workPhone || "N/A"}</div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={4}>
                                  <small className="text-muted">
                                    Start Date
                                  </small>
                                  <div>
                                    {new Date(
                                      emp.startDate,
                                    ).toLocaleDateString()}
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">End Date</small>
                                  <div>
                                    {emp.currentlyWorking ? (
                                      <Badge bg="success">
                                        Currently Working
                                      </Badge>
                                    ) : (
                                      new Date(emp.endDate).toLocaleDateString()
                                    )}
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">
                                    May Contact
                                  </small>
                                  <div>
                                    <Badge
                                      bg={
                                        emp.mayContact ? "success" : "secondary"
                                      }
                                    >
                                      {emp.mayContact ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={6}>
                                  <small className="text-muted">
                                    Beginning Salary
                                  </small>
                                  <div>
                                    <strong>${emp.beginningSalary}</strong>
                                  </div>
                                </Col>
                                <Col md={6}>
                                  <small className="text-muted">
                                    Ending Salary
                                  </small>
                                  <div>
                                    <strong>${emp.endingSalary}</strong>
                                  </div>
                                </Col>
                              </Row>
                              {emp.reasonForLeaving && (
                                <Row className="mb-2">
                                  <Col md={12}>
                                    <small className="text-muted">
                                      Reason for Leaving
                                    </small>
                                    <div className="p-2 bg-light rounded mt-1">
                                      {emp.reasonForLeaving}
                                    </div>
                                  </Col>
                                </Row>
                              )}
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </>
                  )}

                {/* Licenses */}
                {formDetails.licenses && formDetails.licenses.length > 0 && (
                  <>
                    <h5 className="mb-3 text-primary">
                      Licenses & Certifications
                    </h5>
                    <Card className="mb-4">
                      <Card.Body>
                        {formDetails.licenses.map((license, idx) => (
                          <div
                            key={idx}
                            className={idx > 0 ? "border-top pt-3 mt-3" : ""}
                          >
                            <Row className="mb-2">
                              <Col md={4}>
                                <small className="text-muted">Type</small>
                                <div>
                                  <Badge bg="primary">{license.type}</Badge>
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">
                                  License Number
                                </small>
                                <div>
                                  <strong>{license.number}</strong>
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">State</small>
                                <div>
                                  <strong>{license.state}</strong>
                                </div>
                              </Col>
                            </Row>
                            <Row className="mb-2">
                              <Col md={4}>
                                <small className="text-muted">Status</small>
                                <div>
                                  <Badge
                                    bg={
                                      license.statusOfIssuance === "Active"
                                        ? "success"
                                        : "warning"
                                    }
                                  >
                                    {license.statusOfIssuance}
                                  </Badge>
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">
                                  Date of Issue
                                </small>
                                <div>
                                  {new Date(
                                    license.dateOfIssue,
                                  ).toLocaleDateString()}
                                </div>
                              </Col>
                              <Col md={4}>
                                <small className="text-muted">
                                  Expiration Date
                                </small>
                                <div>
                                  {new Date(
                                    license.expirationDate,
                                  ).toLocaleDateString()}
                                </div>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* References */}
                {formDetails.references &&
                  formDetails.references.length > 0 && (
                    <>
                      <h5 className="mb-3 text-primary">References</h5>
                      <Card className="mb-4">
                        <Card.Body>
                          {formDetails.references.map((ref, idx) => (
                            <div
                              key={idx}
                              className={idx > 0 ? "border-top pt-3 mt-3" : ""}
                            >
                              <Row className="mb-2">
                                <Col md={4}>
                                  <small className="text-muted">Name</small>
                                  <div>
                                    <strong>{ref.name}</strong>
                                  </div>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">
                                    Relationship
                                  </small>
                                  <div>{ref.relationship}</div>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">
                                    Years Known
                                  </small>
                                  <div>{ref.yearsKnown} years</div>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={12}>
                                  <small className="text-muted">Phone</small>
                                  <div>{ref.phone}</div>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </>
                  )}

                {/* Voluntary Information */}
                {formDetails.voluntaryInfo && (
                  <>
                    <h5 className="mb-3 text-primary">Voluntary Information</h5>
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={3}>
                            <small className="text-muted">Gender</small>
                            <div>
                              <strong>
                                {formDetails.voluntaryInfo.gender || "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">Race</small>
                            <div>
                              <strong>
                                {formDetails.voluntaryInfo.race || "N/A"}
                              </strong>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">Veteran</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.voluntaryInfo.veteran
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {formDetails.voluntaryInfo.veteran
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">Disability</small>
                            <div>
                              <Badge
                                bg={
                                  formDetails.voluntaryInfo.disability
                                    ? "info"
                                    : "secondary"
                                }
                              >
                                {formDetails.voluntaryInfo.disability
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* Signature */}
                {formDetails.signature && (
                  <>
                    <h5 className="mb-3 text-primary">Signature</h5>
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <small className="text-muted">Signed By</small>
                            <div>
                              <strong>{formDetails.signature.name}</strong>
                            </div>
                          </Col>
                          <Col md={6}>
                            <small className="text-muted">Signature Date</small>
                            <div>
                              <strong>
                                {new Date(
                                  formDetails.signature.date,
                                ).toLocaleDateString()}
                              </strong>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </>
                )}

                {/* Submission Info */}
                <Row className="mt-4">
                  <Col md={6}>
                    <small className="text-muted">Submitted On</small>
                    <div>
                      <strong>
                        {new Date(formDetails.createdAt).toLocaleString()}
                      </strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">Last Updated</small>
                    <div>
                      <strong>
                        {new Date(formDetails.updatedAt).toLocaleString()}
                      </strong>
                    </div>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                No details available
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default Users;
