import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Modal,
  ProgressBar,
  Pagination,
} from "react-bootstrap";
import {
  useGetJobApplicationsMutation,
  useDeleteJobApplicationMutation,
  useUpdateJobApplicationStatusMutation,
  useCreateCareerMutation,
  useGetCareersMutation,
  useGetCareerByIdMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
  useGetCareerApplicantsMutation,
  useAcceptJobApplicantMutation,
  useRejectJobApplicantMutation,
  useDeleteJobApplicantMutation,
  useGetJobApplicantByIdMutation,
} from "../../features/apiSlice";
import { getError } from "../../utils/error";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import MotionDiv from "../../Components/MotionDiv";
import CustomTable from "../../Components/CustomTable";
import SearchField from "../../Components/SearchField";
import DeleteModal from "../../Components/DeleteModal";
import {
  FaEye,
  FaTrash,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaStar,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaFilter,
  FaEdit,
  FaUsers,
  FaCheck,
} from "react-icons/fa";
// FaUsers imported above
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";
import Skeleton from "react-loading-skeleton";

const JobApplications = () => {
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);

  const [getJobApplications, { isLoading }] = useGetJobApplicationsMutation();
  const [deleteJobApplication, { isLoading: deleteLoading }] =
    useDeleteJobApplicationMutation();
  const [updateJobApplicationStatus, { isLoading: updateLoading }] =
    useUpdateJobApplicationStatusMutation();
  const [createCareer, { isLoading: createLoading }] =
    useCreateCareerMutation();
  const [getCareers, { isLoading: jobsLoading }] = useGetCareersMutation();
  const [getCareerById, { isLoading: jobLoading }] = useGetCareerByIdMutation();
  const [updateCareer, { isLoading: updateJobLoading }] =
    useUpdateCareerMutation();
  const [deleteCareer, { isLoading: deleteJobLoading }] =
    useDeleteCareerMutation();
  const [getCareerApplicants] = useGetCareerApplicantsMutation();
  const [acceptJobApplicant, { isLoading: acceptLoading }] =
    useAcceptJobApplicantMutation();
  const [rejectJobApplicant, { isLoading: rejectLoading }] =
    useRejectJobApplicantMutation();
  const [deleteJobApplicant, { isLoading: deleteApplicantLoading }] =
    useDeleteJobApplicantMutation();
  const [getJobApplicantById, { isLoading: applicantDetailsLoading }] =
    useGetJobApplicantByIdMutation();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  // Create job form state
  const [jobTitle, setJobTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [experienceReq, setExperienceReq] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [openings, setOpenings] = useState(1);
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [responsibilities, setResponsibilities] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [keySkills, setKeySkills] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDetail, setJobDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [selectedJobToDelete, setSelectedJobToDelete] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [applicantsModalLoading, setApplicantsModalLoading] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] =
    useState(null);
  const [selectedApplicantToDelete, setSelectedApplicantToDelete] =
    useState(null);
  const [showDeleteApplicantModal, setShowDeleteApplicantModal] =
    useState(false);
  const [showApplicantDetailsModal, setShowApplicantDetailsModal] =
    useState(false);
  const [applicantDetails, setApplicantDetails] = useState(null);

  // Table pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Demo data for job applications
  const demoApplications = [
    {
      _id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      position: "Financial Analyst",
      department: "Finance",
      experience: "3-5 years",
      education: "MBA in Finance",
      location: "New York, NY",
      salary: "$75,000 - $85,000",
      resumeUrl:
        "https://creative-story.s3.amazonaws.com/resumes/john-smith-resume.pdf",
      resumeFileName: "john-smith-resume.pdf",
      coverLetter:
        "I am excited to apply for the Financial Analyst position at SAYV Financial. With my strong background in financial analysis and passion for helping clients achieve their financial goals...",
      status: "pending",
      priority: "high",
      appliedDate: "2024-01-15T10:30:00Z",
      lastUpdated: "2024-01-15T10:30:00Z",
      skills: ["Financial Modeling", "Excel", "SQL", "Power BI"],
      references: [
        { name: "Jane Doe", company: "ABC Corp", phone: "+1 (555) 987-6543" },
      ],
      additionalInfo: {
        linkedIn: "https://linkedin.com/in/johnsmith",
        portfolio: "https://johnsmith-portfolio.com",
        availability: "Immediate",
        relocation: "Yes",
      },
    },
    {
      _id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      position: "Investment Advisor",
      department: "Investment",
      experience: "5-7 years",
      education: "CFA, Bachelor in Economics",
      location: "Chicago, IL",
      salary: "$95,000 - $110,000",
      resumeUrl:
        "https://creative-story.s3.amazonaws.com/resumes/sarah-johnson-resume.pdf",
      resumeFileName: "sarah-johnson-resume.pdf",
      coverLetter:
        "As a seasoned investment professional with CFA certification, I am thrilled about the opportunity to join SAYV Financial as an Investment Advisor...",
      status: "reviewed",
      priority: "high",
      appliedDate: "2024-01-12T14:20:00Z",
      lastUpdated: "2024-01-14T09:15:00Z",
      skills: [
        "Portfolio Management",
        "Risk Analysis",
        "Client Relations",
        "Market Research",
      ],
      references: [
        {
          name: "Michael Brown",
          company: "Investment Firm LLC",
          phone: "+1 (555) 876-5432",
        },
        {
          name: "Lisa Wilson",
          company: "Financial Group Inc",
          phone: "+1 (555) 765-4321",
        },
      ],
      additionalInfo: {
        linkedIn: "https://linkedin.com/in/sarahjohnson",
        portfolio: "",
        availability: "2 weeks notice",
        relocation: "No",
      },
    },
    {
      _id: "3",
      firstName: "Michael",
      lastName: "Davis",
      email: "michael.davis@email.com",
      phone: "+1 (555) 345-6789",
      position: "Marketing Specialist",
      department: "Marketing",
      experience: "2-3 years",
      education: "Bachelor in Marketing",
      location: "Los Angeles, CA",
      salary: "$55,000 - $65,000",
      resumeUrl:
        "https://creative-story.s3.amazonaws.com/resumes/michael-davis-resume.pdf",
      resumeFileName: "michael-davis-resume.pdf",
      coverLetter:
        "I am writing to express my interest in the Marketing Specialist position. My creative approach to digital marketing and proven track record...",
      status: "shortlisted",
      priority: "medium",
      appliedDate: "2024-01-10T16:45:00Z",
      lastUpdated: "2024-01-13T11:30:00Z",
      skills: [
        "Digital Marketing",
        "Social Media",
        "Content Creation",
        "Analytics",
      ],
      references: [
        {
          name: "Amanda Taylor",
          company: "Marketing Agency Pro",
          phone: "+1 (555) 654-3210",
        },
      ],
      additionalInfo: {
        linkedIn: "https://linkedin.com/in/michaeldavis",
        portfolio: "https://michaeldavis-marketing.com",
        availability: "1 month notice",
        relocation: "Yes",
      },
    },
    {
      _id: "4",
      firstName: "Emily",
      lastName: "Brown",
      email: "emily.brown@email.com",
      phone: "+1 (555) 456-7890",
      position: "Customer Service Representative",
      department: "Customer Service",
      experience: "1-2 years",
      education: "Bachelor in Business Administration",
      location: "Miami, FL",
      salary: "$40,000 - $45,000",
      resumeUrl:
        "https://creative-story.s3.amazonaws.com/resumes/emily-brown-resume.pdf",
      resumeFileName: "emily-brown-resume.pdf",
      coverLetter:
        "I am excited to apply for the Customer Service Representative position. My passion for helping people and strong communication skills...",
      status: "rejected",
      priority: "low",
      appliedDate: "2024-01-08T12:15:00Z",
      lastUpdated: "2024-01-12T15:20:00Z",
      skills: [
        "Customer Service",
        "Communication",
        "Problem Solving",
        "CRM Software",
      ],
      references: [
        {
          name: "Robert Green",
          company: "Service Solutions Inc",
          phone: "+1 (555) 543-2109",
        },
      ],
      additionalInfo: {
        linkedIn: "https://linkedin.com/in/emilybrown",
        portfolio: "",
        availability: "Immediate",
        relocation: "No",
      },
    },
    {
      _id: "5",
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@email.com",
      phone: "+1 (555) 567-8901",
      position: "Financial Analyst",
      department: "Finance",
      experience: "4-6 years",
      education: "Master in Finance",
      location: "Boston, MA",
      salary: "$80,000 - $90,000",
      resumeUrl:
        "https://creative-story.s3.amazonaws.com/resumes/david-wilson-resume.pdf",
      resumeFileName: "david-wilson-resume.pdf",
      coverLetter:
        "With my extensive background in financial analysis and my Master's degree in Finance, I am confident I would be a valuable addition to your team...",
      status: "hired",
      priority: "high",
      appliedDate: "2024-01-05T09:30:00Z",
      lastUpdated: "2024-01-11T14:45:00Z",
      skills: [
        "Financial Analysis",
        "Forecasting",
        "Excel",
        "Python",
        "Tableau",
      ],
      references: [
        {
          name: "Jennifer Lee",
          company: "Financial Corp",
          phone: "+1 (555) 432-1098",
        },
        {
          name: "Thomas Anderson",
          company: "Investment Bank",
          phone: "+1 (555) 321-0987",
        },
      ],
      additionalInfo: {
        linkedIn: "https://linkedin.com/in/davidwilson",
        portfolio: "https://davidwilson-finance.com",
        availability: "3 weeks notice",
        relocation: "Yes",
      },
    },
  ];

  const fetchJobApplications = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        setApplications(demoApplications);
        setFilteredApplications(demoApplications);
        calculateStats(demoApplications);
        return;
      }

      // Real API call - fetch all jobs first, then get applicants for each
      const careersData = await getCareers().unwrap();
      const jobsList = careersData?.jobs || [];

      if (jobsList.length === 0) {
        setApplications([]);
        setFilteredApplications([]);
        return;
      }

      // Fetch applicants for all jobs and combine them
      const allApplicationsPromises = jobsList.map(async (job) => {
        try {
          const response = await getCareerApplicants(job._id).unwrap();
          const applicants = response?.applicants || [];

          // Log first applicant to debug status field
          if (applicants.length > 0) {
            console.log("Sample applicant data:", applicants[0]);
          }

          // Map applicants to include job position
          return applicants.map((applicant) => {
            // Check for status in different possible field names
            let backendStatus =
              applicant.status ||
              applicant.applicationStatus ||
              applicant.candidateStatus ||
              applicant.state ||
              "pending";

            // Normalize status values - map backend status to frontend expected values
            // Backend may use "accepted" but frontend uses "hired"
            if (backendStatus === "accepted") {
              backendStatus = "hired";
            }

            console.log(
              `Applicant ${applicant.name}: backend status = ${applicant.status}, normalized = ${backendStatus}`,
            );

            // Handle resumeKey - check if it's a relative path and construct full URL
            let resumeKey = applicant.resumeKey || applicant.resume || "";
            if (resumeKey && !resumeKey.startsWith("http")) {
              // If it's a relative path, construct the full URL
              const baseURL =
                "https://divine-care.ap-south-1.storage.onantryk.com";
              const relativePath = resumeKey.startsWith("/")
                ? resumeKey
                : `/${resumeKey}`;
              resumeKey = `${baseURL}${relativePath}`;
            }

            return {
              _id: applicant._id,
              name: applicant.name || "",
              firstName: applicant.name?.split(" ")[0] || applicant.name || "",
              lastName: applicant.name?.split(" ").slice(1).join(" ") || "",
              email: applicant.email || "",
              phone: applicant.contactNumber || applicant.phoneNumber || "",
              contactNumber:
                applicant.contactNumber || applicant.phoneNumber || "",
              phoneNumber:
                applicant.phoneNumber || applicant.contactNumber || "",
              position: job.title || "",
              department: job.department || "",
              location: applicant.address || "",
              address: applicant.address || "",
              resumeKey: resumeKey,
              resumeUrl: resumeKey,
              resumeFileName: `${
                applicant.name?.replace(/\s+/g, "-") || "resume"
              }.pdf`,
              coverLetter: applicant.coverLetter || "",
              status: backendStatus, // Use backend status directly
              appliedDate: applicant.createdAt || new Date().toISOString(),
              jobId: job._id,
            };
          });
        } catch (error) {
          console.warn(`Failed to fetch applicants for job ${job._id}:`, error);
          return [];
        }
      });

      const applicationsArrays = await Promise.all(allApplicationsPromises);
      const allApplications = applicationsArrays.flat();

      // Sort by appliedDate - latest first
      allApplications.sort(
        (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate),
      );

      setApplications(allApplications);
      setFilteredApplications(allApplications);
      calculateStats(allApplications);
    } catch (error) {
      // suppress noisy backend errors
      const msg = error?.data?.message || error?.message || "";
      if (
        typeof msg === "string" &&
        (msg.toLowerCase().includes("route not found") ||
          msg.toLowerCase().includes("cast to objectid failed") ||
          msg.toLowerCase().includes("undefined"))
      ) {
        console.warn(
          "Backend error when fetching job applications — suppressing toast",
          msg,
        );
        // Set empty applications on error
        setApplications([]);
        setFilteredApplications([]);
        return;
      }
      getError(error);
    }
  };

  const calculateStats = (applicationsData) => {
    const stats = {
      total: applicationsData.length,
      pending: applicationsData.filter((app) => app.status === "pending")
        .length,
      reviewed: applicationsData.filter((app) => app.status === "reviewed")
        .length,
      shortlisted: applicationsData.filter(
        (app) => app.status === "shortlisted",
      ).length,
      rejected: applicationsData.filter((app) => app.status === "rejected")
        .length,
      hired: applicationsData.filter((app) => app.status === "hired").length,
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchJobApplications();
    fetchCareers();
  }, []);

  const openJobModal = async (id) => {
    try {
      if (token && token.startsWith("demo-token")) {
        const demo = jobs.find((j) => j._id === id) || jobs[0];
        setJobDetail(demo);
        setShowJobModal(true);
        return;
      }

      const data = await getCareerById(id).unwrap();
      const job = data?.job || data;
      setJobDetail(job);
      setShowJobModal(true);
    } catch (error) {
      getError(error);
    }
  };

  const openEditJob = (job) => {
    setEditMode(true);
    setEditingJobId(job._id);
    // populate form
    setJobTitle(job.title || "");
    setShortDescription(job.shortDescription || "");
    setDescription(job.description || "");
    setLocation(job.location || "");
    setExperienceReq(job.experience || "");
    setSalaryRange(job.salary || "");
    setOpenings(job.openings || 1);
    setResponsibilities(job.responsibilities || []);
    setKeySkills(job.keySkills || []);
    setShowCreateJobModal(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJobId) return;
    if (!jobTitle.trim() || !description.trim()) {
      toast.error("Please provide at least a job title and description");
      return;
    }

    const payload = {
      title: jobTitle,
      shortDescription,
      description,
      location,
      experience: experienceReq,
      salary: salaryRange,
      openings: Number(openings) || 0,
      responsibilities,
      keySkills,
    };

    try {
      if (token && token.startsWith("demo-token")) {
        toast.success("Job updated (demo mode)");
        setShowCreateJobModal(false);
        setEditMode(false);
        setEditingJobId(null);
        resetCreateForm();
        return;
      }

      await updateCareer({ id: editingJobId, data: payload }).unwrap();
      toast.success("Job updated successfully");
      setShowCreateJobModal(false);
      setEditMode(false);
      setEditingJobId(null);
      resetCreateForm();
      fetchCareers();
    } catch (error) {
      getError(error);
    }
  };

  const handleDeleteJob = async () => {
    try {
      if (!selectedJobToDelete) return;
      console.log("Deleting job:", selectedJobToDelete);
      if (token && token.startsWith("demo-token")) {
        setJobs((prev) =>
          prev.filter((j) => j._id !== selectedJobToDelete._id),
        );
        toast.success("Job deleted (demo mode)");
        setShowDeleteJobModal(false);
        setSelectedJobToDelete(null);
        return;
      }

      await deleteCareer(selectedJobToDelete._id).unwrap();
      toast.success("Job deleted successfully");
      setShowDeleteJobModal(false);
      setSelectedJobToDelete(null);
      fetchCareers();
    } catch (error) {
      setShowDeleteJobModal(false);
      getError(error);
    }
  };

  const fetchCareers = async () => {
    try {
      if (token && token.startsWith("demo-token")) {
        // Demo jobs example
        const demoJobs = [
          {
            _id: "69084b5c6fec096df0885deb",
            title: "Disability Support Worker 2",
            shortDescription:
              "Support individuals with daily living tasks and community participation.",
            description:
              "Full description of responsibilities, shift patterns, salary and other details.",
            location: "Madurai, Coimbatore",
            experience: "0-2 years",
            salary: "1-2.5 Lacs P.A.",
            openings: 5,
            responsibilities: [
              "Develop and maintain strong relationships with clients",
              "Assist with daily living activities and personal care",
              "Support participation in community activities",
            ],
            keySkills: ["Compassion", "Communication", "Patience", "Teamwork"],
            postedAt: new Date().toISOString(),
            applicants: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setJobs(demoJobs);
        return;
      }

      const data = await getCareers().unwrap();
      const jobsData = data?.jobs || [];
      setJobs(jobsData);
    } catch (error) {
      const msg = error?.data?.message || error?.message || "";
      // Suppress common backend errors in demo/development
      if (
        typeof msg === "string" &&
        (msg.toLowerCase().includes("route not found") ||
          msg.toLowerCase().includes("cast to objectid failed") ||
          msg.toLowerCase().includes("undefined"))
      ) {
        console.warn(
          "Backend error when fetching careers — suppressing toast",
          msg,
        );
        // Set empty jobs array on error
        setJobs([]);
        return;
      }
      getError(error);
    }
  };

  useEffect(() => {
    let filtered = applications;

    // Filter by search term (applicant name only)
    if (searchTerm) {
      filtered = filtered.filter((app) =>
        `${app.firstName} ${app.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Filter by position
    if (positionFilter !== "all") {
      filtered = filtered.filter((app) => app.position === positionFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, positionFilter]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, positionFilter]);

  // Clamp current page when result set shrinks
  useEffect(() => {
    const total = filteredApplications?.length || 0;
    const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    if (currentPage > pages) setCurrentPage(pages);
  }, [filteredApplications, currentPage]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedApplications = applications.map((app) =>
          app._id === applicationId
            ? {
                ...app,
                status: newStatus,
                lastUpdated: new Date().toISOString(),
              }
            : app,
        );
        setApplications(updatedApplications);
        calculateStats(updatedApplications);
        toast.success(`Application status updated to ${newStatus}`);
        return;
      }

      // Find the application to get jobId
      const application = applications.find((app) => app._id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      const careerId = application.jobId;
      if (!careerId) {
        toast.error("Job information not found for this application");
        return;
      }

      // If accepting candidate (status is "hired"), use the accept endpoint
      if (newStatus === "hired") {
        console.log("Accepting candidate:", {
          careerId,
          applicantId: applicationId,
        });
        const result = await acceptJobApplicant({
          careerId,
          applicantId: applicationId,
        }).unwrap();
        console.log("Accept API response:", result);

        toast.success("Candidate accepted and notified successfully!");

        // Refetch applications to get updated status from backend
        await fetchJobApplications();
        return;
      }

      // If rejecting candidate, use the reject endpoint
      if (newStatus === "rejected") {
        console.log("Rejecting candidate:", {
          careerId,
          applicantId: applicationId,
        });
        const result = await rejectJobApplicant({
          careerId,
          applicantId: applicationId,
        }).unwrap();
        console.log("Reject API response:", result);

        toast.success("Candidate Rejected");

        // Refetch applications to get updated status from backend
        await fetchJobApplications();
        return;
      }

      // For other status updates, use the regular update endpoint
      await updateJobApplicationStatus({
        id: applicationId,
        status: newStatus,
      }).unwrap();
      toast.success(`Application status updated to ${newStatus}`);
      await fetchJobApplications();
    } catch (error) {
      getError(error);
    }
  };

  const handleDownloadResume = async (resumeUrl, fileName) => {
    try {
      console.log("Downloading resume from:", resumeUrl);

      // Fetch the file as a blob
      const response = await fetch(resumeUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch resume file");
      }

      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "resume.pdf";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Resume downloaded successfully");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume. Opening in new tab...");

      // Fallback: open in new tab
      window.open(resumeUrl, "_blank");
    }
  };

  const handleDelete = async () => {
    try {
      // Demo mode handling
      if (token && token.startsWith("demo-token")) {
        const updatedApplications = applications.filter(
          (app) => app._id !== selectedApplication._id,
        );
        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications);
        calculateStats(updatedApplications);
        toast.success("Job application deleted successfully");
        setShowDeleteModal(false);
        setSelectedApplication(null);
        return;
      }

      // Real API call
      await deleteJobApplication(selectedApplication._id).unwrap();
      toast.success("Job application deleted successfully");
      setShowDeleteModal(false);
      setSelectedApplication(null);
      fetchJobApplications();
    } catch (error) {
      setShowDeleteModal(false);
      getError(error);
    }
  };

  // Create job helpers
  const addResponsibility = () => {
    const val = responsibilityInput.trim();
    if (val) {
      setResponsibilities((prev) => [...prev, val]);
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index) => {
    setResponsibilities((prev) => prev.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val) {
      setKeySkills((prev) => [...prev, val]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setKeySkills((prev) => prev.filter((_, i) => i !== index));
  };

  const resetCreateForm = () => {
    setJobTitle("");
    setShortDescription("");
    setDescription("");
    setLocation("");
    setExperienceReq("");
    setSalaryRange("");
    setOpenings(1);
    setResponsibilities([]);
    setKeySkills([]);
    setResponsibilityInput("");
    setSkillInput("");
  };

  const handleCreateJob = async () => {
    // basic validation
    if (!jobTitle.trim() || !description.trim()) {
      toast.error("Please provide at least a job title and description");
      return;
    }

    const payload = {
      title: jobTitle,
      shortDescription,
      description,
      location,
      experience: experienceReq,
      salary: salaryRange,
      openings: Number(openings) || 0,
      responsibilities,
      keySkills,
    };

    try {
      // Demo mode: simulate creation
      if (token && token.startsWith("demo-token")) {
        const fakeId = `demo-${Date.now()}`;
        const job = {
          ...payload,
          _id: fakeId,
          postedAt: new Date().toISOString(),
          applicants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        toast.success("Job created (demo mode)");
        setShowCreateJobModal(false);
        resetCreateForm();
        return;
      }

      await createCareer(payload).unwrap();
      toast.success("Job created successfully");
      setShowCreateJobModal(false);
      resetCreateForm();
    } catch (error) {
      getError(error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "warning", text: "Pending Review", icon: <FaClock /> },
      reviewed: { bg: "info", text: "Reviewed", icon: <FaEye /> },
      shortlisted: { bg: "primary", text: "Shortlisted", icon: <FaStar /> },
      rejected: { bg: "danger", text: "Rejected", icon: <FaTimes /> },
      hired: { bg: "success", text: "Hired", icon: <FaCheckCircle /> },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.bg} className="d-flex align-items-center">
        {config.icon}
        <span className="ms-1">{config.text}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { bg: "danger", text: "High" },
      medium: { bg: "warning", text: "Medium" },
      low: { bg: "secondary", text: "Low" },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  // Get unique job positions from jobs (current openings) instead of applications
  const uniquePositions = jobs.map((job) => job.title);

  const openApplicantsModal = async (jobId, jobTitle) => {
    setSelectedJobForApplicants(jobTitle || null);
    setApplicants([]);
    setApplicantsModalLoading(true);
    setShowApplicantsModal(true); // Show modal immediately

    try {
      console.log("Fetching applicants for job:", jobId);
      const res = await getCareerApplicants(jobId).unwrap();
      console.log("Applicants API response:", res);

      // res may be { data: { success: true, applicants: [...] } } or { success: true, applicants: [...] }
      const payload = res?.data || res || {};
      let list = [];

      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload.applicants)) {
        list = payload.applicants;
      } else if (Array.isArray(payload.data)) {
        list = payload.data;
      }

      // Add careerId to each applicant for deletion and fix resume URLs
      list = list.map((applicant) => {
        // Handle resumeKey - check if it's a relative path and construct full URL
        let resumeKey = applicant.resumeKey || applicant.resume || "";
        if (resumeKey && !resumeKey.startsWith("http")) {
          // If it's a relative path, construct the full URL
          const baseURL = "https://divine-care.ap-south-1.storage.onantryk.com";
          const relativePath = resumeKey.startsWith("/")
            ? resumeKey
            : `/${resumeKey}`;
          resumeKey = `${baseURL}${relativePath}`;
        }

        // Normalize status - backend uses "accepted", frontend expects "hired"
        let status =
          applicant.status ||
          applicant.applicationStatus ||
          applicant.candidateStatus ||
          applicant.state ||
          "pending";
        if (status === "accepted") {
          status = "hired";
        }
        console.log(
          `Modal Applicant ${applicant.name}: backend status = ${applicant.status}, normalized = ${status}`,
        );

        return {
          ...applicant,
          careerId: jobId,
          resumeKey: resumeKey,
          resume: resumeKey,
          status: status,
        };
      });

      // Sort by createdAt in descending order (latest first)
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      console.log("Processed applicants list:", list);
      setApplicants(list);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      const msg =
        error?.data?.message || error?.message || "Failed to fetch applicants";
      toast.error(msg);
      setApplicants([]);
    } finally {
      setApplicantsModalLoading(false);
    }
  };

  const handleDeleteApplicant = async () => {
    try {
      if (!selectedApplicantToDelete) return;

      const { applicantId, careerId, applicantName } =
        selectedApplicantToDelete;

      console.log("Deleting applicant:", { careerId, applicantId });

      await deleteJobApplicant({ careerId, applicantId }).unwrap();

      toast.success(`Applicant ${applicantName} deleted successfully!`);

      // Remove from local state
      setApplicants((prev) => prev.filter((a) => a._id !== applicantId));

      // Close modal
      setShowDeleteApplicantModal(false);
      setSelectedApplicantToDelete(null);

      // Refresh applications list
      fetchJobApplications();
    } catch (error) {
      console.error("Error deleting applicant:", error);
      const msg =
        error?.data?.message || error?.message || "Failed to delete applicant";
      toast.error(msg);
      setShowDeleteApplicantModal(false);
    }
  };

  const handleViewApplicant = async (applicantId, careerId) => {
    try {
      console.log("Fetching applicant details:", { careerId, applicantId });

      const res = await getJobApplicantById({ careerId, applicantId }).unwrap();
      console.log("Applicant details response:", res);

      const details = res?.applicant || res?.data?.applicant || res;
      setApplicantDetails(details);
      setShowApplicantDetailsModal(true);
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      const msg =
        error?.data?.message ||
        error?.message ||
        "Failed to fetch applicant details";
      toast.error(msg);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, percentage }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div
          className={`rounded-circle p-3 me-3`}
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
        <div className="grow">
          <h3 className="mb-0" style={{ color: "var(--dark-color)" }}>
            {isLoading ? <Skeleton width={50} /> : value}
          </h3>
          <p className="text-muted mb-1 small">{title}</p>
          {percentage !== undefined && (
            <ProgressBar
              now={percentage}
              style={{ height: "4px" }}
              variant={
                color === "#28a745"
                  ? "success"
                  : color === "#dc3545"
                    ? "danger"
                    : "primary"
              }
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const totalFiltered = filteredApplications?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndexExclusive = startIndex + ITEMS_PER_PAGE;
  const paginatedApplications = (filteredApplications || []).slice(
    startIndex,
    endIndexExclusive,
  );

  const goToPage = (page) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
  };

  const getPageItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>
              <span style={{ color: "var(--dark-color)" }}>Job</span>{" "}
              <span style={{ color: "var(--dark-color)" }}>Applications</span>
            </h2>
            <p className="text-muted">
              Manage submitted job applications and resumes
            </p>
          </div>
          <div>
            <Button
              variant="primary"
              onClick={() => setShowCreateJobModal(true)}
            >
              Create Job
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <StatCard
              title="Total Applications"
              value={stats.total}
              icon={<FaFileAlt size={24} />}
              color="#6f42c1"
              bgColor="rgba(111, 66, 193, 0.1)"
            />
          </Col>
        </Row>

        {/* Open Jobs List */}
        <Row className="mb-4">
          <Col>
            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaBriefcase className="me-2" />
                  Open Jobs
                </h5>
              </Card.Header>
              <Card.Body>
                {jobsLoading && jobs.length === 0 ? (
                  <div className="text-center text-muted">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center text-muted">No open jobs</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {jobs.map((job) => (
                      <Card key={job._id} className="p-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{job.title}</h6>
                            <small className="text-muted">
                              {job.location} • {job.openings} opening(s)
                            </small>
                            <div className="mt-1">{job.shortDescription}</div>
                          </div>
                          <div className="d-flex flex-column gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openJobModal(job._id)}
                              title="View"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() =>
                                openApplicantsModal(job._id, job.title)
                              }
                              title="Applicants"
                            >
                              <FaUsers />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => openEditJob(job)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setSelectedJobToDelete(job);
                                setShowDeleteJobModal(true);
                              }}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={7}>
                <SearchField
                  query={searchTerm}
                  setQuery={setSearchTerm}
                  placeholder="Search by applicant name..."
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="all">All Positions</option>
                  {uniquePositions.map((position, index) => (
                    <option key={index} value={position}>
                      {position}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2} className="text-end">
                <small className="text-muted">
                  {filteredApplications.length} of {applications.length}
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Applications Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0 d-flex align-items-center">
              <FaFilter className="me-2" />
              Job Applications
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <CustomTable
              column={[
                "S.No.",
                "Applicant Name",
                "Email",
                "Phone No.",
                "Position Applied For",
                "View Resume",
                "Select/Reject",
                "View/Delete",
              ]}
              isSearch={false}
              loading={isLoading}
            >
              {filteredApplications && filteredApplications.length > 0 ? (
                paginatedApplications.map((app, index) => (
                  <tr key={app._id || index}>
                    <td className="text-center">
                      <strong>{startIndex + index + 1}</strong>
                    </td>
                    <td>
                      <h6 className="mb-0">
                        {app.name ||
                          `${app.firstName || ""} ${app.lastName || ""}`.trim()}
                      </h6>
                    </td>
                    <td>
                      <span className="text-muted">{app.email}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {app.contactNumber || app.phoneNumber}
                      </span>
                    </td>
                    <td>
                      <span>{app.position || "N/A"}</span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          if (app.resumeKey) {
                            console.log("Opening resume URL:", app.resumeKey);
                            console.log("Full applicant data:", app);
                            try {
                              let url = app.resumeKey;
                              // Check if it's a .doc or .docx file and use Microsoft Office Web Viewer
                              if (
                                url.toLowerCase().endsWith(".docx") ||
                                url.toLowerCase().endsWith(".doc")
                              ) {
                                url = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
                              }
                              const newWindow = window.open(
                                url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                              if (
                                !newWindow ||
                                newWindow.closed ||
                                typeof newWindow.closed === "undefined"
                              ) {
                                // toast.error(
                                //   "Pop-up blocked. Please allow pop-ups for this site.",
                                // );
                              }
                            } catch (error) {
                              console.error("Error opening resume:", error);
                              toast.error(
                                "Failed to open resume: " + error.message,
                              );
                            }
                          } else {
                            console.warn(
                              "No resume URL available for applicant:",
                              app,
                            );
                            toast.error(
                              "No resume available for this applicant",
                            );
                          }
                        }}
                        title="View Resume"
                        disabled={!app.resumeKey}
                      >
                        <FaEye className="me-1" />
                        View Resume
                      </Button>
                    </td>
                    <td className="text-center">
                      {app.status === "hired" ? (
                        <Badge bg="success" className="py-2 px-3">
                          <FaCheckCircle className="me-1" />
                          Selected
                        </Badge>
                      ) : app.status === "rejected" ? (
                        <Badge bg="danger" className="py-2 px-3">
                          <FaTimes className="me-1" />
                          Rejected
                        </Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusUpdate(app._id, "hired")}
                            title="Accept Candidate"
                            className="me-2"
                          >
                            <FaCheck />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleStatusUpdate(app._id, "rejected")
                            }
                            title="Reject Candidate"
                          >
                            <FaTimes />
                          </Button>
                        </>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleViewApplicant(app._id, app.jobId)}
                        title="View Applicant Details"
                        className="me-2 d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setSelectedApplicantToDelete({
                            applicantId: app._id,
                            careerId: app.jobId,
                            applicantName:
                              app.name ||
                              `${app.firstName || ""} ${app.lastName || ""}`.trim(),
                          });
                          setShowDeleteApplicantModal(true);
                        }}
                        title="Delete Applicant"
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No job applications found
                  </td>
                </tr>
              )}
            </CustomTable>
          </Card.Body>

          {totalFiltered > ITEMS_PER_PAGE && (
            <Card.Footer className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {totalFiltered === 0 ? 0 : startIndex + 1}–
                {Math.min(endIndexExclusive, totalFiltered)} of {totalFiltered}
              </small>
              <Pagination className="mb-0">
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => goToPage(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                />

                {getPageItems().map((item, idx) => {
                  if (item === "ellipsis") {
                    return <Pagination.Ellipsis key={`e-${idx}`} disabled />;
                  }
                  return (
                    <Pagination.Item
                      key={item}
                      active={item === currentPage}
                      onClick={() => goToPage(item)}
                    >
                      {item}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(totalPages)}
                />
              </Pagination>
            </Card.Footer>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {/* Create Job Modal */}
        <Modal
          show={showCreateJobModal}
          onHide={() => setShowCreateJobModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? "Edit Job" : "Create Job"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="mb-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Disability Support Worker"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Openings</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={openings}
                      onChange={(e) => setOpenings(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Short Description</Form.Label>
                <Form.Control
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Short summary"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Full Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full description, responsibilities, shifts, salary details"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Experience</Form.Label>
                    <Form.Control
                      value={experienceReq}
                      onChange={(e) => setExperienceReq(e.target.value)}
                      placeholder="e.g. 0-2 years"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Salary</Form.Label>
                    <Form.Control
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="e.g. 1-2.5 Lacs P.A."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Responsibilities</Form.Label>
                <div className="d-flex mb-2">
                  <Form.Control
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    placeholder="Add responsibility and click Add"
                  />
                  <Button className="ms-2" onClick={addResponsibility}>
                    Add
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {responsibilities.map((r, i) => (
                    <Badge
                      key={i}
                      bg="light"
                      className="text-dark p-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeResponsibility(i)}
                    >
                      {r} &times;
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Key Skills</Form.Label>
                <div className="d-flex mb-2">
                  <Form.Control
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add skill and click Add"
                  />
                  <Button className="ms-2" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {keySkills.map((s, i) => (
                    <Badge
                      key={i}
                      bg="light"
                      className="text-dark p-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeSkill(i)}
                    >
                      {s} &times;
                    </Badge>
                  ))}
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateJobModal(false)}
            >
              Cancel
            </Button>
            {editMode ? (
              <Button
                variant="primary"
                onClick={handleUpdateJob}
                disabled={updateJobLoading}
              >
                {updateJobLoading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleCreateJob}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Create Job"}
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Job Detail Modal */}
        <Modal
          show={showJobModal}
          onHide={() => setShowJobModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>{jobDetail?.title || "Job Details"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {jobDetail ? (
              <div>
                <p className="text-muted">{jobDetail.shortDescription}</p>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {jobDetail.description}
                </div>
                <hr />
                <div className="mb-2">
                  <strong>Location:</strong> {jobDetail.location}
                </div>
                <div className="mb-2">
                  <strong>Experience:</strong> {jobDetail.experience}
                </div>
                <div className="mb-2">
                  <strong>Salary:</strong> {jobDetail.salary}
                </div>
                <div className="mb-2">
                  <strong>Openings:</strong> {jobDetail.openings}
                </div>
                {jobDetail.responsibilities &&
                  jobDetail.responsibilities.length > 0 && (
                    <div className="mt-3">
                      <strong>Responsibilities</strong>
                      <ul>
                        {jobDetail.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {jobDetail.keySkills && jobDetail.keySkills.length > 0 && (
                  <div className="mt-3">
                    <strong>Key Skills</strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {jobDetail.keySkills.map((s, i) => (
                        <Badge key={i} bg="light" className="text-dark p-2">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted">Loading...</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowJobModal(false)}>
              Close
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowJobModal(false);
                openEditJob(jobDetail);
              }}
              disabled={!jobDetail}
              title="Edit"
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => {
                setShowJobModal(false);
                setSelectedJobToDelete(jobDetail);
                setShowDeleteJobModal(true);
              }}
              disabled={!jobDetail}
              title="Delete"
            >
              <FaTrash />
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Applicants Modal */}
        <Modal
          show={showApplicantsModal}
          onHide={() => setShowApplicantsModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Applicants{" "}
              {selectedJobForApplicants ? `- ${selectedJobForApplicants}` : ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {applicantsModalLoading ? (
              <div className="text-center text-muted py-4">
                Loading applicants...
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center text-muted py-4">
                No applicants found for this job.
              </div>
            ) : (
              <div className="list-group">
                {applicants.map((a, index) => {
                  // Safety check - skip if applicant is null/undefined
                  if (!a) return null;

                  return (
                    <div
                      key={a._id || a.id || `applicant-${index}`}
                      className="list-group-item"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {a.name ||
                              `${a.firstName || ""} ${a.lastName || ""}`.trim() ||
                              "Unnamed"}
                          </h6>
                          <small className="text-muted d-block">
                            {a.email || "No email provided"}
                          </small>
                          <small className="text-muted d-block">
                            {a.contactNumber || "No phone provided"}
                          </small>
                          {a.address && (
                            <div className="text-muted small mt-1">
                              <FaMapMarkerAlt className="me-1" />
                              {typeof a.address === "string"
                                ? a.address
                                : `${a.address.street || ""} ${a.address.city || ""} ${a.address.state || ""} ${a.address.zipCode || ""} ${a.address.country || ""}`.trim() ||
                                  "Address provided"}
                            </div>
                          )}
                        </div>
                        <div className="text-end ms-3">
                          {a.resumeKey && (
                            <a
                              href={
                                a.resumeKey.toLowerCase().endsWith(".docx") ||
                                a.resumeKey.toLowerCase().endsWith(".doc")
                                  ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(a.resumeKey)}`
                                  : a.resumeKey
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-primary mb-3"
                            >
                              <FaEye className="me-1" />
                              View Resume
                            </a>
                          )}
                          <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                            {a.createdAt && (
                              <div className="text-muted small me-2">
                                Applied:{" "}
                                {new Date(a.createdAt).toLocaleDateString()}
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() =>
                                handleViewApplicant(a._id, a.careerId)
                              }
                              title="View Applicant Details"
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                padding: "0",
                              }}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setSelectedApplicantToDelete({
                                  applicantId: a._id,
                                  careerId: a.careerId,
                                  applicantName: a.name || "this applicant",
                                });
                                setShowDeleteApplicantModal(true);
                              }}
                              title="Delete Applicant"
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                padding: "0",
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {a.coverLetter && (
                        <div className="mt-3 pt-2 border-top">
                          <strong className="small">Cover Letter:</strong>
                          <div
                            className="mt-1 text-muted small"
                            style={{
                              whiteSpace: "pre-wrap",
                              maxHeight: "150px",
                              overflow: "auto",
                            }}
                          >
                            {a.coverLetter}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowApplicantsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <DeleteModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onDiscard={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Job Application"
          description={`Are you sure you want to delete the application from "${selectedApplication?.firstName} ${selectedApplication?.lastName}"? This action cannot be undone.`}
          loading={deleteLoading}
        />
        {/* Delete Job Confirmation */}
        <DeleteModal
          show={showDeleteJobModal}
          onHide={() => setShowDeleteJobModal(false)}
          onDiscard={() => setShowDeleteJobModal(false)}
          onConfirm={handleDeleteJob}
          title="Delete Job"
          description={`Are you sure you want to delete the job "${selectedJobToDelete?.title}"? This action cannot be undone.`}
          loading={deleteJobLoading}
        />
        {/* Delete Applicant Confirmation */}
        <DeleteModal
          show={showDeleteApplicantModal}
          onHide={() => setShowDeleteApplicantModal(false)}
          onDiscard={() => setShowDeleteApplicantModal(false)}
          onConfirm={handleDeleteApplicant}
          title="Delete Applicant"
          description={`Are you sure you want to delete applicant "${selectedApplicantToDelete?.applicantName}"? This action cannot be undone.`}
          loading={deleteApplicantLoading}
        />

        {/* Applicant Details Modal */}
        <Modal
          show={showApplicantDetailsModal}
          onHide={() => setShowApplicantDetailsModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Applicant Details - {applicantDetails?.name || "Loading..."}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {applicantDetailsLoading ? (
              <div className="text-center text-muted py-4">
                Loading applicant details...
              </div>
            ) : applicantDetails ? (
              <div>
                <Row className="mb-3">
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Contact Information</h6>
                    <div className="mb-2">
                      <strong>Name:</strong> {applicantDetails.name}
                    </div>
                    <div className="mb-2">
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${applicantDetails.email}`}>
                        {applicantDetails.email}
                      </a>
                    </div>
                    <div className="mb-2">
                      <strong>Phone:</strong>{" "}
                      <a href={`tel:${applicantDetails.phoneNumber}`}>
                        {applicantDetails.phoneNumber}
                      </a>
                    </div>
                    {applicantDetails.dateContacted && (
                      <div className="mb-2">
                        <strong>Date Contacted:</strong>{" "}
                        {new Date(
                          applicantDetails.dateContacted,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Address</h6>
                    {applicantDetails.address ? (
                      <>
                        <div>{applicantDetails.address.street}</div>
                        <div>
                          {applicantDetails.address.state}{" "}
                          {applicantDetails.address.zipCode}
                        </div>
                        <div>{applicantDetails.address.country}</div>
                      </>
                    ) : (
                      <div className="text-muted">No address provided</div>
                    )}
                  </Col>
                </Row>

                <hr />

                <Row className="mb-3">
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Qualifications</h6>
                    <div className="mb-2">
                      <strong>Vaccinated:</strong>{" "}
                      {applicantDetails.vaccinated ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>First Aid/CPR:</strong>{" "}
                      {applicantDetails.firstAidCpr ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>M&T DDA:</strong>{" "}
                      {applicantDetails.mandtDda ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted mb-2">Experience & Licenses</h6>
                    <div className="mb-2">
                      <strong>Driver's License:</strong>{" "}
                      {applicantDetails.driversLicense ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>Disabilities Experience:</strong>{" "}
                      {applicantDetails.disabilitiesExperience ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>Schedule Interview:</strong>{" "}
                      {applicantDetails.scheduleInterview ? (
                        <Badge bg="primary">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </div>
                  </Col>
                </Row>

                <hr />

                {applicantDetails.interestedShifts &&
                  applicantDetails.interestedShifts.length > 0 && (
                    <>
                      <h6 className="text-muted mb-2">Interested Shifts</h6>
                      <ul className="mb-3">
                        {applicantDetails.interestedShifts.map((shift, idx) => (
                          <Badge
                            key={idx}
                            bg="info"
                            className="me-2 mb-2 p-2"
                            style={{
                              fontSize: "0.9rem",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              maxWidth: "100%",
                              display: "inline-block",
                            }}
                          >
                            {shift}
                          </Badge>
                        ))}
                      </ul>
                      <hr />
                    </>
                  )}

                {applicantDetails.coverLetter && (
                  <>
                    <h6 className="text-muted mb-2">Cover Letter</h6>
                    <div
                      className="p-3 bg-light rounded mb-3"
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {applicantDetails.coverLetter}
                    </div>
                    <hr />
                  </>
                )}

                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Status:</strong>{" "}
                      {applicantDetails.status === "accepted" ? (
                        <Badge bg="success">Accepted</Badge>
                      ) : applicantDetails.status === "rejected" ? (
                        <Badge bg="danger">Rejected</Badge>
                      ) : (
                        <Badge bg="warning">Pending</Badge>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    {applicantDetails.createdAt && (
                      <div className="mb-2">
                        <strong>Applied:</strong>{" "}
                        {new Date(applicantDetails.createdAt).toLocaleString()}
                      </div>
                    )}
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
              onClick={() => setShowApplicantDetailsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default JobApplications;
