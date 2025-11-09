import { useEffect, useState } from 'react'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Auth from './Pages/Auth.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import Aos from "aos";
import { useDispatch, useSelector } from 'react-redux'
import SideNavbar from './layout/SideNavBar.jsx'
import Header from './layout/Header.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { selectAuth } from './features/authSlice.js'
import DashHome from './Pages/dashboard/DashHome.jsx'
import Testimonials from './Pages/testimonials/Testimonials.jsx'
import AddEditTestimonial from './Pages/testimonials/AddEditTestimonial.jsx'
import { ToastContainer } from 'react-toastify'
import Blogs from './Pages/blogs/Blogs.jsx'
import AddEditBlog from './Pages/blogs/AddEditBlog.jsx'
import Stories from './Pages/stories/Stories.jsx'
import AddEditStory from './Pages/stories/AddEditStory.jsx'
import Queries from './Pages/queries/Queries.jsx'
import EditContactPage from './Pages/queries/EditContactPage.jsx'
import Profile from './Pages/Profile.jsx'
import NotFound from './Pages/NotFound.jsx'
import { SkeletonTheme } from 'react-loading-skeleton'

import RecentActivity from './Pages/recentActivity/RecentActivity.jsx'
import WebsitePages from './Pages/websitePages/WebsitePages.jsx'
import EditWebsitePage from './Pages/websitePages/EditWebsitePage.jsx'
import NavigationMenu from './Pages/navigationMenu/NavigationMenu.jsx'
import AddEditMenuItem from './Pages/navigationMenu/AddEditMenuItem.jsx'
import Services from './Pages/services/Services.jsx'
import AddEditService from './Pages/services/AddEditService.jsx'
import JobApplications from './Pages/jobApplications/JobApplications.jsx'
import ViewJobApplication from './Pages/jobApplications/ViewJobApplication.jsx'
import Events from './Pages/events/Events.jsx'
import AddEditEvent from './Pages/events/AddEditEvent.jsx'
import ViewEventParticipants from './Pages/events/ViewEventParticipants.jsx'
import EmailAlerts from './Pages/emailAlerts/EmailAlerts.jsx'
import HomePage from './Pages/homePage/HomePage.jsx'
import Subscribers from './Pages/subscribers/Subscribers.jsx'
import EditHomeHero from './Pages/homePage/EditHomeHero.jsx'
import EditAboutUs from './Pages/homePage/EditAboutUs.jsx'
import EditEvents from './Pages/homePage/EditEvents.jsx'
import EditTestimonials from './Pages/homePage/EditTestimonials.jsx'
import EditGallery from './Pages/homePage/EditGallery.jsx'
import EditTeamMembers from './Pages/homePage/EditTeamMembers.jsx'
import AboutUsPage from './Pages/aboutUs/AboutUsPage.jsx'
import EditMainAboutSection from './Pages/aboutUs/EditMainAboutSection.jsx'
import EditOurMission from './Pages/aboutUs/EditOurMission.jsx'
import EditMissionVision from './Pages/aboutUs/EditMissionVision.jsx'
import EditAboutBanner from './Pages/aboutUs/EditAboutBanner.jsx'
import EditCompanyStatistics from './Pages/aboutUs/EditCompanyStatistics.jsx'
import EditTestimonialSection from './Pages/aboutUs/EditTestimonialSection.jsx'
import Documents from './Pages/documents/Documents.jsx'


function App() {
  
  const { token } = useSelector(selectAuth);
  const dispatch = useDispatch();
  
  const pageLocation = useLocation();

  const [isExpanded, setExpandState] = useState(window.innerWidth > 768);
  const sidebarHandler = () => setExpandState((prev) => !prev);


  useEffect(() => {
    Aos.init();
  }, []);

  const routeList = [
    { path: "/dash/home", comp: <HomePage /> },
    { path: "/dash/dashboard", comp: <DashHome /> },
    { path: "/dash/event-registrations", comp: <RecentActivity /> },
    { path: "/dash/recent-activity", comp: <RecentActivity /> },
    { path: "/dash/navigation-menu", comp: <NavigationMenu /> },
    { path: "/dash/navigation-menu/add", comp: <AddEditMenuItem /> },
    { path: "/dash/navigation-menu/edit/:id", comp: <AddEditMenuItem /> },
    { path: "/dash/services", comp: <Services /> },
    { path: "/dash/services/add", comp: <AddEditService /> },
    { path: "/dash/services/edit/:id", comp: <AddEditService /> },
    { path: "/dash/job-applications", comp: <JobApplications /> },
    { path: "/dash/job-applications/view/:id", comp: <ViewJobApplication /> },
    { path: "/dash/events", comp: <Events /> },
    { path: "/dash/events/add", comp: <AddEditEvent /> },
    { path: "/dash/events/edit/:id", comp: <AddEditEvent /> },
    { path: "/dash/events/participants/:id", comp: <ViewEventParticipants /> },
    { path: "/dash/email-alerts", comp: <EmailAlerts /> },
  { path: "/dash/subscribers", comp: <Subscribers /> },
    { path: "/dash/website-pages", comp: <WebsitePages /> },
    { path: "/dash/website-pages/edit/:pageId", comp: <EditWebsitePage /> },
    { path: "/dash/testimonials", comp: <Testimonials /> },
    { path: "/dash/testimonials/add-testimonial", comp: <AddEditTestimonial /> },
    { path: "/dash/testimonials/edit-testimonial/:id", comp: <AddEditTestimonial /> },
    { path: "/dash/blogs", comp: <Blogs /> },
    { path: "/dash/blogs/add-blog", comp: <AddEditBlog /> },
    { path: "/dash/blogs/edit-blog/:id", comp: <AddEditBlog /> },
    { path: "/dash/stories", comp: <Stories /> },
    { path: "/dash/stories/add", comp: <AddEditStory /> },
    { path: "/dash/stories/edit/:id", comp: <AddEditStory /> },
    { path: "/dash/homepage", comp: <HomePage /> },
    { path: "/dash/homepage/hero", comp: <EditHomeHero /> },
    { path: "/dash/homepage/about", comp: <EditAboutUs /> },
    { path: "/dash/homepage/events", comp: <EditEvents /> },
    { path: "/dash/homepage/testimonials", comp: <EditTestimonials /> },
    { path: "/dash/homepage/gallery", comp: <EditGallery /> },
    { path: "/dash/homepage/team-members", comp: <EditTeamMembers /> },
    { path: "/dash/about-us", comp: <AboutUsPage /> },
    { path: "/dash/about-us/main-section", comp: <EditMainAboutSection /> },
    { path: "/dash/about-us/our-mission", comp: <EditOurMission /> },
    { path: "/dash/about-us/mission-vision", comp: <EditMissionVision /> },
    { path: "/dash/about-us/banner", comp: <EditAboutBanner /> },
    { path: "/dash/about-us/statistics", comp: <EditCompanyStatistics /> },
    { path: "/dash/about-us/testimonial", comp: <EditTestimonialSection /> },
    { path: "/dash/documents", comp: <Documents /> },
    { path: "/dash/queries", comp: <Queries /> },
    { path: "/dash/queries/edit-contact-page", comp: <EditContactPage /> },

    { path: "/dash/profile", comp: <Profile /> },
    
  ];

  
  return (
    <div className={`main-wrapper ${token?'dash-section':''}`}>
            <SkeletonTheme baseColor="rgba(0,0,0,0.1)" highlightColor="rgba(250,250,250,0.1)"  enableAnimation={true} duration={1}>

    {isExpanded && token && (
      <div className="sidebar-overlay" onClick={sidebarHandler}></div>
    )}
    <div className="sidebar-wrapper">
      <SideNavbar isExpanded={isExpanded} />
    </div>
    <div
      className={`body-wrapper ${isExpanded ? "mini-body" : "full-body"} 
      ${token ? "" : "m-0"} d-flex flex-column`}
    >
      <Header sidebarHandler={sidebarHandler} />

      <Routes location={pageLocation} key={pageLocation.pathname}>
        <Route path="/" element={<Auth />  } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {routeList?.map(({ path, comp }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{comp}</ProtectedRoute>}
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* <Footer /> */}
    </div>
    </SkeletonTheme>
    <ToastContainer />
  </div>
  )
}

export default App
