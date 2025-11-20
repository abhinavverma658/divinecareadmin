import "./SideNavBar.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { LuDatabase, LuUsers } from "react-icons/lu";
import {
  MdOutlineAnalytics,
  MdOutlineTipsAndUpdates,
  MdOutlineTroubleshoot,
} from "react-icons/md";
import {
  FaChartPie,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaUsersCog,
  FaBars,
  FaUsers,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { FaServicestack } from "react-icons/fa6";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, selectAuth } from "../features/authSlice";
import { BiBookContent, BiCalendar, BiSolidDashboard } from "react-icons/bi";
import { FaBell, FaBookOpen, FaHome } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { BsBank, BsDatabaseAdd, BsFileText } from "react-icons/bs";
import {
  FaDatabase,
  FaDollarSign,
  FaGear,
  FaKey,
  FaListUl,
  FaQuestion,
  FaRegMessage,
  FaTableList,
  FaTags,
} from "react-icons/fa6";
import { TbStars } from "react-icons/tb";
import { Image } from "react-bootstrap";
import { IoNewspaperOutline } from "react-icons/io5";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

const linkList = [
  // Events
  {
    icon: <BiCalendar className="icon-md" />,
    text: "Events",
    url: "/dash/events",
  },
  // Services
  {
    icon: <FaServicestack className="icon-md" />,
    text: "Services",
    url: "/dash/services",
  },
  // Careers
  {
    icon: <HiOutlineNewspaper className="icon-md" />,
    text: "Careers",
    url: "/dash/job-applications",
  },
  // Stories
  {
    icon: <FaBookOpen className="icon-md" />,
    text: "Stories",
    url: "/dash/stories",
  },
  // Contact Us
  {
    icon: <FaRegMessage className="icon-md" />,
    text: "Contact Us",
    url: "/dash/queries",
  },
  // Documents
  {
    icon: <FaClipboardList className="icon-md" />,
    text: "Documents",
    url: "/dash/documents",
  },
  // Subscribers
  {
    icon: <LuUsers className="icon-md" />,
    text: "Subscribers",
    url: "/dash/subscribers",
  },
  // Privacy Policy
  {
    icon: <BsFileText className="icon-md" />,
    text: "Privacy Policy",
    url: "/dash/privacy-policy",
  },
  // Terms & Conditions
  {
    icon: <BsFileText className="icon-md" />,
    text: "Terms & Conditions",
    url: "/dash/terms-conditions",
  },
  //  {
  //   icon: <FaClockRotateLeft className="icon-md" />,
  //   text: "Event Registrations",
  //   url: "/dash/event-registrations",
  // },
  // {
  //   icon: <FaClockRotateLeft className="icon-md" />,
  //   text: "Recent Activity",
  //   url: "/dash/recent-activity",
  // },
  // {
  //   icon: <BiBookContent className="icon-md" />,
  //   text: "Blogs",
  //   url: "/dash/blogs",
  // },
  // {
  //   icon: <TbStars className="icon-md" />,
  //   text: "Testimonials",
  //   url: "/dash/testimonials",
  // },

  // {
  //   icon: <FaBars className="icon-md" />,
  //   text: "Navigation Menu",
  //   url: "/dash/navigation-menu",
  // },
  // {
  //   icon: <IoNewspaperOutline  className="icon-md" />,
  //   text: "Website Pages",
  //   url: "/dash/website-pages",
  // },

  // {
  //   icon: <FaUsers className="icon-md" />,
  //   text: "Team Members",
  //   url: "/dash/team-members",
  // },

  // {
  //   icon: <FaBell className="icon-md" />,
  //   text: "Email Alerts",
  //   url: "/dash/email-alerts",
  // },
];

const active_text = {
  Dashboard: "dashboard",
  Users: "users",
  Strings: "strings",
};

export default function SideNavbar({ isExpanded, sidebarHandler }) {
  const pathname = window.location.pathname;
  const [activeLink, setActiveLink] = useState("Dashboard");
  const [homePageDropdown, setHomePageDropdown] = useState(false);
  const [aboutUsDropdown, setAboutUsDropdown] = useState(false);
  const { token } = useSelector(selectAuth);
  const userInfo = {
    fullname: "Abhinav_Verma",
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(clearAuth());

    navigate("/");
  };

  const activeLinkHandler = (url) => {
    return pathname.includes(url);
  };

  const toggleHomePageDropdown = () => {
    setHomePageDropdown(!homePageDropdown);
  };

  const toggleAboutUsDropdown = () => {
    setAboutUsDropdown(!aboutUsDropdown);
  };

  const cls = `nav-item has-treeview ${
    isExpanded ? "menu-item" : "menu-item menu-item-NX"
  }`;

  // const logoWidth = isExpanded?"100px":"55px";

  console.log({ userInfo });
  return (
    <>
      {token && isExpanded ? (
        <div
          className={
            isExpanded
              ? "side-nav-container"
              : "side-nav-container side-nav-container-NX"
          }
        >
          {/* Mobile close icon - only show on mobile */}
          {window.innerWidth <= 768 && (
            <div
              style={{ position: "absolute", top: 12, right: 18, zIndex: 9999 }}
            >
              <button
                aria-label="Close sidebar"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  cursor: "pointer",
                  padding: 0,
                  zIndex: 99999,
                }}
                onClick={sidebarHandler}
              >
                &times;
              </button>
            </div>
          )}
          <div className="brand-link">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: window.innerWidth <= 768 ? "16px 0 8px 0" : "12px 0",
                boxSizing: "border-box",
                background: "transparent",
              }}
            >
              <Image
                // src={window.innerWidth <= 768 ? "/Group_32.png" : "/16.png"}
                src="/16.png"
                alt="Logo"
                style={{
                  width: window.innerWidth <= 768 ? "60px" : "100px",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 0,
                  display: "block",
                }}
                className="mb-2"
              />
            </div>
          </div>

          <div className="sidebar">
            {/* Sidebar user panel (optional) */}
            {/* <div className="user-panel mt-3 pb-3 mb-3 d-flex">
              <div className="info">
                <Link to="/view-profile" className="d-block">
                  {userInfo?.avatar && (
                    <img
                      src={userInfo?.avatar}
                      alt=""
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "0.5rem",
                      }}
                    />
                  )}
                  <FaUserCircle className="text-white mx-2" size={"25px"} />

                  <span className="info-text">
                    Welcome {userInfo ? `${userInfo.fullname}` : "Back"}
                  </span>
                </Link>
              </div>
            </div> */}
            {/* Sidebar Menu */}
            <nav className="pt-4">
              <ul
                className="nav-pills nav-sidebar px-0 d-flex flex-column flex-wrap"
                data-widget="treeview"
                role="menu"
                data-accordion="false"
              >
                {/* Home Page Dropdown */}
                <li
                  className={`${cls} ${
                    pathname.includes("/dash/homepage") && "active-item"
                  } dropdown-parent`}
                >
                  <div
                    className="nav-link dropdown-toggle-btn"
                    onClick={toggleHomePageDropdown}
                  >
                    <div className="nav-link-content">
                      <span className="">
                        <FaHome className="icon-md" />
                      </span>
                      <p className="ms-2 pb-0">Home Page</p>
                      <span className="dropdown-arrow">
                        {homePageDropdown ? (
                          <FaChevronDown className="icon-sm" />
                        ) : (
                          <FaChevronRight className="icon-sm" />
                        )}
                      </span>
                    </div>
                  </div>

                  {homePageDropdown && (
                    <div className="dropdown-menu-container">
                      <ul className="dropdown-submenu">
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage" ? "active" : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Overview</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/hero"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/hero" ? "active" : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Hero Section</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/about"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/about"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">About Section</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/events"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/events"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Events & Programs</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/testimonials"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/testimonials"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Testimonials</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/gallery"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/gallery"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Gallery</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/homepage/team-members"
                            className={`dropdown-link ${
                              pathname === "/dash/homepage/team-members"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Team Members</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>

                {/* About Us Dropdown */}
                <li
                  className={`${cls} ${
                    pathname.includes("/dash/about-us") && "active-item"
                  } dropdown-parent`}
                >
                  <div
                    className="nav-link dropdown-toggle-btn"
                    onClick={toggleAboutUsDropdown}
                  >
                    <div className="nav-link-content">
                      <span className="">
                        <FaUser className="icon-md" />
                      </span>
                      <p className="ms-2 pb-0">About Us</p>
                      <span className="dropdown-arrow">
                        {aboutUsDropdown ? (
                          <FaChevronDown className="icon-sm" />
                        ) : (
                          <FaChevronRight className="icon-sm" />
                        )}
                      </span>
                    </div>
                  </div>

                  {aboutUsDropdown && (
                    <div className="dropdown-menu-container">
                      <ul className="dropdown-submenu">
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us" ? "active" : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Overview</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us/main-section"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us/main-section"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Main About Section</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us/our-mission"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us/our-mission"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Our Mission</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us/mission-vision"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us/mission-vision"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Mission & Vision</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us/statistics"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us/statistics"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Company Statistics</span>
                          </Link>
                        </li>
                        <li className="dropdown-item">
                          <Link
                            to="/dash/about-us/testimonial"
                            className={`dropdown-link ${
                              pathname === "/dash/about-us/testimonial"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="nav-icon">•</span>
                            <span className="ms-1">Testimonials</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>

                {/* Render all other menu items in order */}
                {linkList.map(({ icon, text, url }) => (
                  <li
                    key={url}
                    className={`${cls} ${
                      activeLinkHandler(url) && "active-item"
                    }`}
                    onClick={() => setActiveLink(url)}
                  >
                    <Link to={url} className="nav-link ">
                      <span className="">{icon}</span>
                      <p className="ms-2 pb-0 ">{text}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* /.sidebar-menu */}
          </div>

          <div className="sidebar-footer">
            <ul
              className="nav-pills nav-sidebar px-0 d-flex flex-column flex-wrap"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className={cls}>
                <Link onClick={signoutHandler} to="/" className="nav-link">
                  <FaSignOutAlt className="icon-md" />
                  <p className="ms-2">Log Out</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
