import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Image base URL for team member photos and other images
export const imgAddr = "https://creative-story.s3.amazonaws.com";

// Determine API base URL based on environment
const getBaseUrl = () => {
  // Force use of remote backend since it's working (as shown in Postman)
  return "https://divinecare-backend.onrender.com/api"; // Always use remote backend for all API calls
};

const baseQueryOriginal = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'omit', // Use 'omit' for CORS compatibility
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      console.log('🔑 Adding auth token to request:', endpoint, token.substring(0, 20) + '...');
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.log('⚠️ No token found for request:', endpoint);
    }
    
    // Only set essential headers - let browser handle CORS
    // Don't set Access-Control-* headers from client side
    if (!endpoint.includes('upload') && !endpoint.includes('Upload')) {
      headers.set("Content-Type", "application/json");
    }
    
    console.log('📤 Request headers for', endpoint, ':', Array.from(headers.entries()));
    return headers;
  },
});

// Enhanced baseQuery with fallback for compatibility
const baseQuery = async (args, api, extraOptions) => {
  let result = await baseQueryOriginal(args, api, extraOptions);
  
  // If request fails with 404 or network error, try direct fetch fallback
  if (result.error && (result.error.status === 404 || result.error.status === 'FETCH_ERROR')) {
    console.log('🔄 RTK Query failed, trying direct fetch fallback for:', args.url);
    
    try {
      const token = api.getState().auth.token;
      const baseUrl = getBaseUrl();
      const fullUrl = `${baseUrl}${args.url}`;
      
      const fetchOptions = {
        method: args.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        ...(args.body && { body: JSON.stringify(args.body) }),
      };
      
      console.log('🌐 Direct fetch attempt:', fullUrl, fetchOptions);
      
      const response = await fetch(fullUrl, fetchOptions);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Direct fetch successful:', data);
        return { data };
      } else {
        console.log('❌ Direct fetch also failed:', response.status, data);
        return result; // Return original error
      }
    } catch (fetchError) {
      console.log('💥 Direct fetch error:', fetchError);
      return result; // Return original error
    }
  }
  
  return result;
};export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    // Authentication
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/auth/signin",
        method: "POST",
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Generate access token
    generateAccessToken: builder.mutation({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),

    // Reset password
    resetPassword: builder.mutation({
      query: (data) => {
        const token = JSON.parse(localStorage.getItem('token') || 'null');
        return {
          url: "/auth/reset-password/",
          method: "PUT",
          body: data,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };
      },
    }),

    // Dashboard
    getDashboardData: builder.mutation({
      query: () => ({
        url: "/admin/get-dashboard-data",
        method: "GET",
      }),
    }),



    // Queries/Contact forms
    getQueries: builder.mutation({
      query: () => ({
        url: "/query/get-queries",
        method: "GET",
      }),
    }),
    // Admin contacts (new unified endpoint)
    getAdminContacts: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/admin/contacts`;
          console.log('🔄 Fetching admin contacts:', { endpoint, hasToken: !!cleanToken });
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const text = await response.text();
          let data;
          try { data = text ? JSON.parse(text) : {}; } catch(e) { data = text; }
          console.log('🔁 Admin contacts response:', { status: response.status, ok: response.ok, data });
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('getAdminContacts error:', error);
          throw error;
        }
      }
      }),
    // Delete a contact by id
    deleteContact: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/contacts/${id}`;
          console.log('🔄 Deleting contact:', { endpoint, id, hasToken: !!cleanToken });
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const text = await response.text();
          let data;
          try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }
          console.log('🔁 Delete contact response:', { status: response.status, ok: response.ok, data });
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('deleteContact error:', error);
          throw error;
        }
      }
    }),
    deleteQuery: builder.mutation({
      query: (id) => ({
        url: `/query/delete-query/${id}`,
        method: "DELETE",
      }),
    }),

    // Blogs
    getBlogs: builder.mutation({
      query: () => ({
        url: "/blog/get-blogs",
        method: "GET",
      }),
    }),
    getBlogById: builder.mutation({
      query: (id) => ({
        url: `/blog/get-blog/${id}`,
        method: "GET",
      }),
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blog/create-blog",
        method: "POST",
        body: data,
      }),
    }),
    updateBlogById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blog/update-blog/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/delete-blog/${id}`,
        method: "DELETE",
      }),
    }),

    // Testimonials
    getTestimonials: builder.mutation({
      query: () => ({
        url: "/testimonial",
        method: "GET",
      }),
    }),
    createTestimonial: builder.mutation({
      queryFn: async (data, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/testimonials/testimonial`;
          console.log('🔄 Creating testimonial:', { endpoint, hasToken: !!cleanToken, data });
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Testimonial created:', result);
            return { data: result };
          } else {
            console.log('❌ Create testimonial failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Create testimonial error:', error);
          throw error;
        }
      },
    }),
    updateTestimonialById: builder.mutation({
      query: ({ id, data }) => ({
        url: `/testimonial/update-testimonial/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteTestimonial: builder.mutation({
      query: (id) => ({
        url: `/testimonial/delete-testimonial/${id}`,
        method: "DELETE",
      }),
    }),



    // Contact forms
    getContactForms: builder.mutation({
      query: () => ({
        url: "/contact/get-contact-forms",
        method: "GET",
      }),
    }),
    getContactFormById: builder.mutation({
      query: (id) => ({
        url: `/contact/get-contact-form/${id}`,
        method: "GET",
      }),
    }),
    deleteContactForm: builder.mutation({
      query: (id) => ({
        url: `/contact/delete-contact-form/${id}`,
        method: "DELETE",
      }),
    }),
    updateContactFormStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/update-contact-form-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
    }),

    // Job applications
    getJobApplications: builder.mutation({
      query: (id) => ({
        url: `/careers/${id}/applicants`,
        method: "GET",
      }),
    }),
    getJobApplicationById: builder.mutation({
      query: (id) => ({
        url: `/job-applications/get-application/${id}`,
        method: "GET",
      }),
    }),
    deleteJobApplication: builder.mutation({
      query: (id) => ({
        url: `/job-applications/delete-application/${id}`,
        method: "DELETE",
      }),
    }),
    updateJobApplicationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/job-applications/update-application-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
    }),
    // Careers (job postings)
    createCareer: builder.mutation({
      query: (data) => ({
        url: "/careers",
        method: "POST",
        body: data,
      }),
    }),
    getCareers: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/careers`;
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const data = await response.json();
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('getCareers error:', error);
          throw error;
        }
      },
    }),
    getCareerById: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/careers/${id}`;
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const data = await response.json();
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('getCareerById error:', error);
          throw error;
        }
      },
    }),
    updateCareer: builder.mutation({
      queryFn: async ({ id, data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/careers/${id}`;
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          if (response.ok) return { data: result };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
        } catch (error) {
          console.error('updateCareer error:', error);
          throw error;
        }
      },
    }),
    deleteCareer: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/careers/${id}`;
          console.log('🔄 deleteCareer request:', { endpoint, id, hasToken: !!cleanToken });
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          let resultText;
          try {
            resultText = await response.text();
          } catch (e) {
            resultText = '';
          }
          let result;
          try {
            result = resultText ? JSON.parse(resultText) : {};
          } catch (e) {
            result = resultText;
          }
          console.log('🔁 deleteCareer response:', { status: response.status, ok: response.ok, result });
          if (response.ok) return { data: result };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
        } catch (error) {
          console.error('deleteCareer error:', error);
          throw error;
        }
      },
    }),

    // Get applicants for a specific career/job posting
    getCareerApplicants: builder.mutation({
      queryFn: async (careerId, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/careers/${careerId}/applicants`;
          console.log('🔄 Fetching career applicants:', { endpoint, careerId, hasToken: !!cleanToken });
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const text = await response.text();
          let data;
          try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }
          console.log('🔁 Career applicants response:', { status: response.status, ok: response.ok, data });
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('getCareerApplicants error:', error);
          throw error;
        }
      }
    }),

    // Event registrations
    getEventRegistrations: builder.mutation({
      query: () => ({
        url: "/event-registrations/get-registrations",
        method: "GET",
      }),
    }),
    getEventRegistrationById: builder.mutation({
      query: (id) => ({
        url: `/event-registrations/get-registration/${id}`,
        method: "GET",
      }),
    }),
    deleteEventRegistration: builder.mutation({
      query: (id) => ({
        url: `/event-registrations/delete-registration/${id}`,
        method: "DELETE",
      }),
    }),
    updateEventRegistrationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/event-registrations/update-registration-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
    }),

    // Core website pages
    getCorePages: builder.mutation({
      query: () => ({
        url: "/core-pages/get-core-pages",
        method: "GET",
      }),
    }),
    getCorePageById: builder.mutation({
      query: (id) => ({
        url: `/core-pages/get-core-page/${id}`,
        method: "GET",
      }),
    }),
    updateCorePage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/core-pages/update-core-page/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    publishCorePage: builder.mutation({
      query: (id) => ({
        url: `/core-pages/publish-core-page/${id}`,
        method: "PATCH",
      }),
    }),
    resetCorePageToDefault: builder.mutation({
      query: (id) => ({
        url: `/core-pages/reset-core-page/${id}`,
        method: "PATCH",
      }),
    }),

    // Navigation Menu
    getNavigationMenu: builder.mutation({
      query: () => ({
        url: "/navigation/get-navigation-menu",
        method: "GET",
      }),
    }),
    getMenuItemById: builder.mutation({
      query: (id) => ({
        url: `/navigation/get-menu-item/${id}`,
        method: "GET",
      }),
    }),
    createMenuItem: builder.mutation({
      query: (data) => ({
        url: "/navigation/create-menu-item",
        method: "POST",
        body: data,
      }),
    }),
    updateMenuItem: builder.mutation({
      query: ({ id, data }) => ({
        url: `/navigation/update-menu-item/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteMenuItem: builder.mutation({
      query: (id) => ({
        url: `/navigation/delete-menu-item/${id}`,
        method: "DELETE",
      }),
    }),
    updateMenuOrder: builder.mutation({
      query: (data) => ({
        url: "/navigation/update-menu-order",
        method: "PATCH",
        body: data,
      }),
    }),
    toggleMenuItemStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/navigation/toggle-menu-item-status/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
    }),

    // Team Members
    getTeamMembers: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Fetching team members data:', {
            endpoint: `${baseUrl}/team-members`,
            hasToken: !!cleanToken
          });
          
          const response = await fetch(`${baseUrl}/team-members`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Team members data received:', data);
            return { data };
          } else {
            console.log('❌ Team members fetch failed:', response.status);
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 Team Members API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo team members data (backend fallback)',
              section: {
                _id: 'demo-team-section',
                heading: 'Meet our Volunteer members',
                description: 'Provide tips, articles, or expert advice on maintaining a healthy work-life balance, managing, Workshops or seminars organizational.',
                members: [
                  {
                    _id: 'demo-member-1',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
                    fullName: 'John Doe',
                    designation: 'General Manager'
                  },
                  {
                    _id: 'demo-member-2',
                    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
                    fullName: 'Jane Smith',
                    designation: 'Community Coordinator'
                  }
                ],
                updatedAt: new Date().toISOString()
              }
            }
          };
        }
      },
    }),

    createTeamMember: builder.mutation({
      queryFn: async (data, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Creating team member:', {
            endpoint: `${baseUrl}/team-members/member`,
            hasToken: !!cleanToken,
            data
          });
          
          const response = await fetch(`${baseUrl}/team-members/member`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Team member created:', result);
            return { data: result };
          } else {
            console.log('❌ Create team member failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Create team member error:', error);
          throw error;
        }
      },
    }),
    addTeamMember: builder.mutation({
      queryFn: async (data, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Adding team member:', {
            endpoint: `${baseUrl}/team-members/member`,
            hasToken: !!cleanToken,
            data
          });
          
          const response = await fetch(`${baseUrl}/team-members/member`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Team member added:', result);
            return { data: result };
          } else {
            console.log('❌ Add team member failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Add team member error:', error);
          throw error;
        }
      },
    }),
    updateTeamMember: builder.mutation({
      queryFn: async ({ id, data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating team member:', {
            endpoint: `${baseUrl}/team-members/${id}`,
            hasToken: !!cleanToken,
            id,
            data
          });
          
          const response = await fetch(`${baseUrl}/team-members/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Team member updated:', result);
            return { data: result };
          } else {
            console.log('❌ Update team member failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Update team member error:', error);
          throw error;
        }
      },
    }),
    deleteTeamMember: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Deleting team member:', {
            endpoint: `${baseUrl}/team-members/${id}`,
            hasToken: !!cleanToken,
            id
          });
          
          const response = await fetch(`${baseUrl}/team-members/member/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Team member deleted:', result);
            return { data: result };
          } else {
            console.log('❌ Delete team member failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Delete team member error:', error);
          throw error;
        }
      },
    }),
    toggleTeamMemberStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/team-members/toggle-team-member-status/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
    }),
    toggleTeamMemberFeatured: builder.mutation({
      query: ({ id, featured }) => ({
        url: `/team-members/toggle-team-member-featured/${id}`,
        method: "PATCH",
        body: { featured },
      }),
    }),
    updateTeamMemberOrder: builder.mutation({
      query: (data) => ({
        url: "/team-members/update-team-member-order",
        method: "PATCH",
        body: data,
      }),
    }),

    // Services
    getServices: builder.mutation({
      query: () => ({
        url: "/services",
        method: "GET",
      }),
    }),
    getServiceById: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: "GET",
      }),
    }),
    createService: builder.mutation({
      query: (data) => ({
        url: "/services",
        method: "POST",
        body: data,
      }),
    }),
    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
    }),

    // Events
    getEvents: builder.mutation({
      query: () => ({
        url: "/events",
        method: "GET",
      }),
    }),
    getEventById: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: "GET",
      }),
    }),
    // Get registrations for a specific event
    getEventRegistrationsByEventId: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/events/${id}/registrations`;
          console.log('🔄 Fetching event registrations:', { endpoint, id, hasToken: !!cleanToken });
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            data = text;
          }
          console.log('🔁 Event registrations response:', { status: response.status, ok: response.ok, data });
          if (response.ok) return { data };
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        } catch (error) {
          console.error('getEventRegistrationsByEventId error:', error);
          throw error;
        }
      },
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/events",
        method: "POST",
        body: data,
      }),
    }),
   updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: data,
      }), 
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
    }),
    toggleEventStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/events/toggle-event-status/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
    }),
    toggleEventFeatured: builder.mutation({
      query: ({ id, featured }) => ({
        url: `/api/events/toggle-event-featured/${id}`,
        method: "PATCH",
        body: { featured },
      }),
    }),
    updateEventOrder: builder.mutation({
      query: (data) => ({
        url: "/api/events/update-event-order",
        method: "PATCH",
        body: data,
      }),
    }),

    // Stories
    getStories: builder.mutation({
      query: () => ({
        url: "/stories",
        method: "GET",
      }),
    }),
    getStoryById: builder.mutation({
      query: (id) => ({
        url: `/stories/${id}`,
        method: "GET",
      }),
    }),
    createStory: builder.mutation({
      query: (data) => ({
        url: "/stories",
        method: "POST",
        body: data,
      }),
    }),
    updateStory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/stories/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteStory: builder.mutation({
      query: (id) => ({
        url: `/stories/${id}`,
        method: "DELETE",
      }),
    }),
    toggleStoryStatus: builder.mutation({
      query: ({ id, isPublished }) => ({
        url: `/stories/${id}/toggle-status`,
        method: "PATCH",
        body: { isPublished },
      }),
    }),
    toggleStoryFeatured: builder.mutation({
      query: ({ id, featured }) => ({
        url: `/stories/${id}/toggle-featured`,
        method: "PATCH",
        body: { featured },
      }),
    }),
    updateStoryOrder: builder.mutation({
      query: (data) => ({
        url: "/stories/update-story-order",
        method: "PATCH",
        body: data,
      }),
    }),

    // Home Page Management with fallback
    getHomePageData: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const baseUrl = getBaseUrl();
          
          const response = await fetch(`${baseUrl}/home-page/get-home-page-data`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 HomePage API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo home page data (backend fallback)',
              data: {
                hero: {
                  heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                  heroTitle: "Welcome to DivineCare",
                  heroHeading: "Empowering Relief & Support",
                  description: "We provide compassionate care and support to those in need, making a difference every day through our dedicated services and community outreach programs.",
                  facebookUrl: "https://facebook.com/divinecare1",
                  instagramUrl: "https://instagram.com/divinecare1",
                  xUrl: "https://x.com/divinecare"
                },
                about: {
                  title: 'About DivineCare',
                  description: 'Making a difference in communities worldwide',
                  image: 'https://via.placeholder.com/600x400/28a745/ffffff?text=About+DivineCare'
                },
                stats: {
                  volunteersCount: 1250,
                  communitiesHelped: 85,
                  projectsCompleted: 320,
                  fundsRaised: 150000
                },
                lastUpdated: new Date().toISOString()
              }
            }
          };
        }
      },
    }),
    getHomeHeroData: builder.mutation({
      query: () => ({
        url: "/home-page/get-hero-data",
        method: "GET",
      }),
    }),
    updateHomeHeroData: builder.mutation({
      query: (data) => ({
        url: "/home-page/update-hero-data",
        method: "PATCH",
        body: data,
      }),
    }),
    
    // Home Carousel Management with fallback
    getHomeCarousel: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          // Clean the token (remove quotes if JSON stringified)
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          // Use the correct working endpoint from Postman
          const response = await fetch(`${baseUrl}/home`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ getHomeCarousel success:', data);
            return { data };
          } else {
            // If 404 or other error, provide fallback data
            console.log('🏠 Backend endpoint not available, using fallback data');
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('🏠 Using demo home carousel data (backend not available)');
            return {
              data: {
                success: true,
                message: 'Demo home carousel data (backend fallback)',
                data: {
                  heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                  heroTitle: "Welcome to DivineCare",
                  heroHeading: "Empowering Relief & Support",
                  description: "We provide compassionate care and support to those in need, making a difference every day through our dedicated services and community outreach programs.",
                  facebookUrl: "https://facebook.com/divinecare1",
                  instagramUrl: "https://instagram.com/divinecare1",
                  xUrl: "https://x.com/divinecare",
                  lastUpdated: new Date().toISOString()
                }
              }
            };
          }
        },
      }),
    
            updateHomeCarousel: builder.mutation({
          queryFn: async ({ id = "68ebd3247deb89d1105fd728", data }, { getState }) => {
            try {
              const token = getState().auth.token;
              const cleanToken = token ? token.replace(/"/g, '') : null;
              const baseUrl = getBaseUrl();
              
              console.log('🔄 Updating home carousel:', {
                endpoint: `${baseUrl}/home/${id}`,
                hasToken: !!cleanToken,
                tokenPreview: cleanToken ? cleanToken.substring(0, 20) + '...' : 'None',
                data
              });
              
              // Use the correct working endpoint with PUT method (with auth as backend expects it)
              const response = await fetch(`${baseUrl}/home/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data), // Send the data object as received from component
              });
              
              if (response.ok) {
            const result = await response.json();
            console.log('✅ updateHomeCarousel success:', result);
            return { data: result };
              } else {
            throw new Error(`HTTP ${response.status}`);
              }
            } catch (error) {
              console.log('💾 Demo update - backend not available:', data);
              return {
            data: {
              success: true,
              message: 'Demo mode: Changes simulated (backend not available)',
              data: {
                ...data,
                lastUpdated: new Date().toISOString()
              }
            }
              };
            }
          },
            }),
            getAboutUsData: builder.mutation({
          queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          const response = await fetch(`${baseUrl}/about`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 About Us API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo about us data (backend fallback)',
              about: {
                mainHeading: 'Committed to Relief, Our Work Dedicated to Hope',
                mainDescription: 'At the heart of our organization lies simple yet powerful mission provide immediate relief & lasting hope to communities affected.',
                topRightDescription: 'At the heart of our lies a simple yet powerful mission: to provide and immediate relief affected by disaster organization.',
                keyPointers: [
                  {
                    heading: 'Helping people rebuild and prepare',
                    description: 'We help them rebuild stronger more resilient for the future. Together with supporters like.',
                    icon: 'fa-hands-helping'
                  },
                  {
                    heading: 'Putting people first in everything we do',
                    description: 'Guided by compassion driven the belief that every act kindness makes a difference.',
                    icon: 'fa-heart'
                  }
                ],
                centerImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                rightImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
              }
            }
          };
        }
      },
    }),
    updateAboutUsData: builder.mutation({
      queryFn: async (formData, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          const endpoint = `${baseUrl}/about/68ebd47d7deb89d1105fd72d`;
          
          // Use the exact field names from the form without mapping
          const dataToSend = {
            mainHeading: formData.mainHeading,
            mainDescription: formData.mainDescription,
            topRightDescription: formData.topRightDescription,
            keyPointers: formData.keyPointers,
            centerImage: formData.centerImage,
            rightImage: formData.rightImage
          };
          
          console.log('🔄 Attempting to update About Us data:', {
            endpoint,
            hasToken: !!cleanToken,
            tokenPreview: cleanToken ? cleanToken.substring(0, 20) + '...' : 'None',
            dataToSend
          });
          
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(dataToSend),
          });
          
          console.log('📥 Update About Us response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ About Us update successful:', result);
            return { data: result };
          } else {
            // Get error details
            let errorDetails = `HTTP ${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorDetails = errorData.message || errorDetails;
              console.log('❌ About Us update failed with JSON error:', errorData);
            } catch (parseError) {
              const errorText = await response.text();
              console.log('❌ About Us update failed with text error:', errorText.substring(0, 200));
              if (errorText.includes('<!DOCTYPE')) {
                errorDetails = 'Server returned HTML error page - backend may be unavailable';
              }
            }
            throw new Error(errorDetails);
          }
        } catch (error) {
          console.error('❌ About Us update error:', error);
          
          // For debugging - let's not fall back to demo mode immediately
          // Instead, show the actual error to understand what's wrong
          if (error.message.includes('fetch') || error.message.includes('network')) {
            console.log('💾 Network error - using demo fallback:', error.message);
            return {
              data: {
                success: true,
                message: `Demo mode: Network error (${error.message})`,
                about: formData
              }
            };
          } else {
            // For HTTP errors, let's throw them so we can see what's wrong
            throw error;
          }
        }
      },
    }),

    // Specific About Us section endpoints
    getSpecificAboutUsData: builder.mutation({
      query: (id = "68ebd47d7deb89d1105fd72d") => ({
        url: `/about/${id}`,
        method: "GET",
      }),
    }),
    updateSpecificAboutUsData: builder.mutation({
      query: ({ id = "68ebd47d7deb89d1105fd72d", data }) => ({
        url: `/about/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // About Main Section endpoints
    getAboutMainData: builder.mutation({
      query: () => ({
        url: "/about/main",
        method: "GET",
      }),
    }),
    updateAboutMainData: builder.mutation({
      query: ({ id = "68ee09ee70e1bfc20b375410", data }) => ({
        url: `/about/main/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // About Vision endpoints
    getAboutVisionData: builder.mutation({
      query: () => ({
        url: "/about/vision",
        method: "GET",
      }),
    }),
    updateAboutVisionData: builder.mutation({
      query: ({ id = "68ee0dce70e1bfc20b375416", data }) => ({
        url: `/about/vision/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // About Company Statistics endpoints
    getAboutCompanyData: builder.mutation({
      query: () => ({
        url: "/about/company",
        method: "GET",
      }),
    }),
    updateAboutCompanyData: builder.mutation({
      query: ({ id = "68ee145370e1bfc20b375419", data }) => ({
        url: `/about/company/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // About Mission endpoints
    getAboutMissionData: builder.mutation({
      query: () => ({
        url: "/about/mission",
        method: "GET",
      }),
    }),
    updateAboutMissionData: builder.mutation({
      query: ({ id = "68ee0bc170e1bfc20b375413", data }) => ({
        url: `/about/mission/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // About Us Testimonials endpoints
    getAboutTestimonials: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Fetching about testimonials data:', {
            endpoint: `${baseUrl}/about/testimonials`,
            hasToken: !!cleanToken
          });
          
          const response = await fetch(`${baseUrl}/about/testimonials`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ About testimonials data received:', data);
            return { data };
          } else {
            console.log('❌ About testimonials fetch failed:', response.status);
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 About testimonials API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo about testimonials data (backend fallback)',
              section: {
                _id: 'demo-about-testimonials',
                sectionHeading: 'Lifelong Lessons: Stories from Our Elders',
                sectionDescription: 'Our seniors are heart of our community, each one with a unique story and a lifetime of experiences that inspire us daily.',
                ctaButtonText: 'Learn More',
                ctaButtonLink: '/testimonials',
                stat1Number: '569 +',
                stat1Label: 'Satisfied Clients',
                stat2Number: '12 +',
                stat2Label: 'Years of Experience',
                testimonials: [
                  {
                    _id: 'demo-testimonial-1',
                    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
                    starRating: 5,
                    name: 'Sharon McClure',
                    role: 'Volunteer',
                    content: 'Through their words, we\'re reminded that a legacy isn\'t just something you leave behind it\'s something you create every day inspiring all generations.'
                  }
                ]
              }
            }
          };
        }
      },
    }),
    
    createAboutTestimonial: builder.mutation({
      queryFn: async (data, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          // Map frontend fields to backend schema
          const mappedData = {
            image: data.profileImage || data.image,
            rating: data.starRating || data.rating,
            title: data.role || data.title,
            name: data.name,
            content: data.content
          };
          
          console.log('🔄 Creating about testimonial:', {
            endpoint: `${baseUrl}/about/testimonials/testimonial`,
            hasToken: !!cleanToken,
            originalData: data,
            mappedData
          });
          
          const response = await fetch(`${baseUrl}/about/testimonials/testimonial`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(mappedData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ About testimonial created:', result);
            return { data: result };
          } else {
            console.log('❌ Create about testimonial failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Create about testimonial error:', error);
          throw error;
        }
      },
    }),
    
    updateAboutTestimonialsSection: builder.mutation({
      queryFn: async ({ id = "68ee1f0770e1bfc20b37541c", ...data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating about testimonials section:', {
            endpoint: `${baseUrl}/about/testimonials/${id}`,
            hasToken: !!cleanToken,
            id,
            data
          });
          
          const response = await fetch(`${baseUrl}/about/testimonials/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ About testimonials section updated:', result);
            return { data: result };
          } else {
            console.log('❌ Update about testimonials section failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Update about testimonials section error:', error);
          throw error;
        }
      },
    }),
    
    updateAboutTestimonial: builder.mutation({
      queryFn: async ({ id, data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          // Map frontend fields to backend schema
          const mappedData = {
            image: data.profileImage || data.image,
            rating: data.starRating || data.rating,
            title: data.role || data.title,
            name: data.name,
            content: data.content
          };
          
          console.log('🔄 Updating about testimonial:', {
            endpoint: `${baseUrl}/about/testimonials/testimonial/${id}`,
            hasToken: !!cleanToken,
            id,
            originalData: data,
            mappedData
          });
          
          const response = await fetch(`${baseUrl}/about/testimonials/testimonial/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(mappedData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ About testimonial updated:', result);
            return { data: result };
          } else {
            console.log('❌ Update about testimonial failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Update about testimonial error:', error);
          throw error;
        }
      },
    }),
    
    deleteAboutTestimonial: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Deleting about testimonial:', {
            endpoint: `${baseUrl}/about/testimonials/testimonial/${id}`,
            hasToken: !!cleanToken,
            id
          });
          
          const response = await fetch(`${baseUrl}/about/testimonials/testimonial/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ About testimonial deleted:', result);
            return { data: result };
          } else {
            console.log('❌ Delete about testimonial failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Delete about testimonial error:', error);
          throw error;
        }
      },
    }),

    // Contact page content
    getContactPageData: builder.mutation({
      query: () => ({
        url: "/contact-page",
        method: "GET",
      }),
    }),
    updateContactPageData: builder.mutation({
      query: (data) => ({
        url: "/contact-page",
        method: "PUT",
        body: data,
      }),
    }),

    getEventsData: builder.mutation({
      query: () => ({
        url: "/home-page/get-events-data",
        method: "GET",
      }),
    }),
    updateEventsData: builder.mutation({
      query: (data) => ({
        url: "/home-page/update-events-data",
        method: "PATCH",
        body: data,
      }),
    }),
    getTestimonialsData: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Fetching testimonials data:', {
            endpoint: `${baseUrl}/testimonials`,
            hasToken: !!cleanToken
          });
          
          const response = await fetch(`${baseUrl}/testimonials`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Testimonials data received:', data);
            return { data };
          } else {
            console.log('❌ Testimonials API failed:', response.status);
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 Testimonials API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo testimonials data (backend fallback)',
              section: {
                _id: 'demo-testimonials',
                sectionHeading: 'Stories from the Heart',
                sectionDescription: 'Long-term recovery requires sustainable livelihoods. We support individuals & families in rebuilding.',
                testimonials: [
                  {
                    _id: 'demo1',
                    rating: 5,
                    content: 'The support we received after the disaster was nothing short of life-changing. When everything we had was lost, the kindness and quick response from this organization.',
                    name: 'Johnnie Lind',
                    designation: 'Volunteer',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
                  }
                ]
              }
            }
          };
        }
      },
    }),
    // Home testimonials CRUD (public-facing testimonials section)
    createTestimonials: builder.mutation({
      queryFn: async (data, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Creating testimonials:', {
            endpoint: `${baseUrl}/testimonials`,
            hasToken: !!cleanToken,
            data
          });
          
          const response = await fetch(`${baseUrl}/testimonials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Testimonials created:', result);
            return { data: result };
          } else {
            console.log('❌ Create testimonials failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Create testimonials error:', error);
          throw error;
        }
      },
    }),
    updateTestimonialsById: builder.mutation({
      queryFn: async ({ id, data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating testimonials:', {
            endpoint: `${baseUrl}/testimonials/${id}`,
            hasToken: !!cleanToken,
            id,
            data
          });
          
          const response = await fetch(`${baseUrl}/testimonials/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Testimonials updated:', result);
            return { data: result };
          } else {
            console.log('❌ Update testimonials failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Update testimonials error:', error);
          throw error;
        }
      },
    }),
    deleteTestimonialsById: builder.mutation({
      queryFn: async (id, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Deleting testimonials:', {
            endpoint: `${baseUrl}/testimonials/${id}`,
            hasToken: !!cleanToken,
            id
          });
          
          const response = await fetch(`${baseUrl}/testimonials/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Testimonials deleted:', result);
            return { data: result };
          } else {
            console.log('❌ Delete testimonials failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Delete testimonials error:', error);
          throw error;
        }
      },
    }),
    getGalleryData: builder.mutation({
      queryFn: async (arg, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Fetching gallery data:', {
            endpoint: `${baseUrl}/gallery`,
            hasToken: !!cleanToken
          });
          
          const response = await fetch(`${baseUrl}/gallery`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Gallery data received:', data);
            return { data };
          } else {
            const errorText = await response.text();
            console.log('❌ Gallery fetch failed:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.log('📄 Gallery API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo gallery data (backend fallback)',
              gallery: {
                _id: 'demo-gallery-id',
                heading: 'The Frontlines of Relief',
                description: 'These titles aim to convey emotion and meaning while showcasing the importance of your organization\'s work through visuals.',
                images: [
                  { 
                    url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
                    public_id: 'gallery/image1',
                    _id: 'demo-img-1'
                  },
                  { 
                    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
                    public_id: 'gallery/image2',
                    _id: 'demo-img-2'
                  },
                  { 
                    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 
                    public_id: 'gallery/image3',
                    _id: 'demo-img-3'
                  }
                ],
                updatedAt: new Date().toISOString()
              }
            }
          };
        }
      },
    }),
    updateGalleryData: builder.mutation({
      queryFn: async ({ id = "68e7f16f09f48a2ea19cdc48", ...data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating gallery data:', {
            endpoint: `${baseUrl}/gallery/${id}`,
            hasToken: !!cleanToken,
            data
          });
          
          const response = await fetch(`${baseUrl}/gallery/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Gallery updated successfully:', result);
            return { data: result };
          } else {
            const errorText = await response.text();
            console.error('❌ Gallery update failed:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.error('Gallery update error:', error);
          throw error;
        }
      },
    }),
    getTeamMembersData: builder.mutation({
      query: () => ({
        url: "/home-page/get-team-members-data",
        method: "GET",
      }),
    }),
    updateTeamMembersData: builder.mutation({
      queryFn: async ({ id = "68ebd9437deb89d1105fd733", ...data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating team members section data:', {
            endpoint: `${baseUrl}/team-members/${id}`,
            hasToken: !!cleanToken,
            id,
            data
          });
          
          const response = await fetch(`${baseUrl}/team-members/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Team members section updated:', result);
            return { data: result };
          } else {
            console.log('❌ Update team members section failed:', response.status);
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error('Update team members section error:', error);
          
          // Handle connection errors gracefully
          if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
            console.log('💾 Demo update - backend not available:', data);
            return {
              data: {
                success: true,
                message: 'Demo mode: Section update simulated (backend not available)',
                section: {
                  id,
                  ...data,
                  updatedAt: new Date().toISOString()
                }
              }
            };
          } else {
            throw error;
          }
        }
      },
    }),
    getHomeFeaturesData: builder.mutation({
      query: () => ({
        url: "/home-page/get-features-data",
        method: "GET",
      }),
    }),
    updateHomeFeaturesData: builder.mutation({
      query: (data) => ({
        url: "/home-page/update-features-data",
        method: "PATCH",
        body: data,
      }),
    }),
    getHomeAboutData: builder.mutation({
      query: () => ({
        url: "/home-page/get-about-data",
        method: "GET",
      }),
    }),
    updateHomeAboutData: builder.mutation({
      query: (data) => ({
        url: "/home-page/update-about-data",
        method: "PATCH",
        body: data,
      }),
    }),
    toggleHomeSectionStatus: builder.mutation({
      query: ({ section, isActive }) => ({
        url: `/home-page/toggle-section-status/${section}`,
        method: "PATCH",
        body: { isActive },
      }),
    }),

    // Email Alerts
    getEmailAlertSettings: builder.mutation({
      query: () => ({
        url: "/email-alerts/get-settings",
        method: "GET",
      }),
    }),
    updateEmailAlertSettings: builder.mutation({
      query: (data) => ({
        url: "/email-alerts/update-settings",
        method: "PATCH",
        body: data,
      }),
    }),
    testEmailAlert: builder.mutation({
      query: (data) => ({
        url: "/email-alerts/test-email",
        method: "POST",
        body: data,
      }),
    }),
    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/email-alerts/send-notification",
        method: "POST",
        body: data,
      }),
    }),

    // Image Upload with fallback
    uploadImage: builder.mutation({
      queryFn: async (inputFormData, { getState }) => {
        try {
          const token = getState().auth.token;
          const uploadBaseUrl = 'https://divinecare-backend.onrender.com/api';
          console.log('🖼️ Starting image upload to:', `${uploadBaseUrl}/upload`);
          const cleanToken = token ? token.replace(/"/g, '') : null;

          // Ensure file is sent as 'files' key (plural)
          let formData = new FormData();
          // If inputFormData is already FormData, extract file and append as 'files'
          if (inputFormData instanceof FormData) {
            // Try to get file from 'file' or 'files' key
            let file = inputFormData.get('file') || inputFormData.get('files');
            if (file) {
              formData.append('files', file);
            } else {
              // If no file found, copy all entries as fallback
              for (let [key, value] of inputFormData.entries()) {
                formData.append(key, value);
              }
            }
          } else if (inputFormData?.file) {
            formData.append('files', inputFormData.file);
          } else {
            // Fallback: copy all entries
            for (let key in inputFormData) {
              formData.append(key, inputFormData[key]);
            }
          }

          const response = await fetch(`${uploadBaseUrl}/upload`, {
            method: 'POST',
            headers: {
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: formData,
          });
          const responseText = await response.text();
          let data, errorMessage;
          try {
            data = JSON.parse(responseText);
          } catch (jsonError) {
            if (responseText.includes('<!DOCTYPE')) {
              errorMessage = 'Server error - please try again later';
            } else {
              errorMessage = responseText.substring(0, 100);
            }
            throw new Error(errorMessage);
          }
          if (response.ok) {
            if (data.success && Array.isArray(data.files)) {
              return { data };
            }
            return { data };
          } else {
            errorMessage = data?.message || `Upload failed with status ${response.status}`;
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('❌ Upload error:', error);
          // Demo fallback logic can remain if needed
          let file = null;
          if (inputFormData instanceof FormData) {
            file = inputFormData.get('file') || inputFormData.get('files');
          } else if (inputFormData?.file) {
            file = inputFormData.file;
          }
          if (file && file.name) {
            const timestamp = Date.now();
            const demoUrl = `https://picsum.photos/800/600?random=${timestamp}`;
            return {
              data: {
                success: true,
                message: 'Demo mode: File upload simulated (backend not available)',
                imageUrl: demoUrl,
                url: demoUrl,
                file: {
                  filename: file.name,
                  originalName: file.name,
                  note: 'Demo placeholder image'
                }
              }
            };
          }
          throw error;
        }
      },
    }),
    uploadMultipleImages: builder.mutation({
      queryFn: async (formData, { getState }) => {
        try {
          const token = getState().auth.token;
          const baseUrl = getBaseUrl();
          
          console.log('🖼️ Starting multiple image upload to:', `${baseUrl}/upload/multiple`);
          
          const response = await fetch(`${baseUrl}/upload/multiple`, {
            method: 'POST',
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
              // Don't set Content-Type - let browser handle it for FormData
            },
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Multiple upload successful:', data);
            return { data };
          } else {
            // Try to parse error response
            let errorMessage = `Upload failed with status ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
              // If response is HTML (common in 500 errors), extract meaningful text
              const responseText = await response.text();
              if (responseText.includes('<!DOCTYPE')) {
                errorMessage = 'Server error - please try again later';
              } else {
                errorMessage = responseText.substring(0, 100);
              }
            }
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('❌ Multiple upload error:', error);
          
          // For demo purposes, return placeholder URLs using actual files
          const files = formData.getAll('files');
          if (files && files.length > 0) {
            console.log('🎭 Using demo placeholders for files:', files.map(f => f.name));
            
            // Process each file to base64
            return Promise.all(files.map((file, index) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    filename: file.name,
                    originalName: file.name,
                    url: e.target.result,
                    note: 'Demo - using uploaded file as base64'
                  });
                };
                reader.onerror = () => {
                  const fallbackUrl = `https://picsum.photos/800/600?random=${Date.now()}&idx=${index}`;
                  resolve({
                    filename: file.name,
                    originalName: file.name,
                    url: fallbackUrl,
                    note: 'Demo placeholder image'
                  });
                };
                reader.readAsDataURL(file);
              });
            })).then(processedFiles => {
              return {
                data: {
                  success: true,
                  message: 'Demo mode: Multiple file upload simulated (backend not available)',
                  urls: processedFiles.map(f => f.url),
                  files: processedFiles
                }
              };
            });
          }
          
          // If no files or other error, throw the original error
          throw error;
        }
      },
    }),
    deleteImage: builder.mutation({
      queryFn: async (imageUrl, { getState }) => {
        try {
          const token = getState().auth.token;
          const baseUrl = getBaseUrl();
          
          console.log('🗑️ Starting image delete:', imageUrl);
          
          const response = await fetch(`${baseUrl}/upload/delete-image`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ imageUrl }),
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Delete successful:', data);
            return { data };
          } else {
            throw new Error(`Delete failed with status ${response.status}`);
          }
        } catch (error) {
          console.log('💾 Demo delete - backend not available:', imageUrl);
          return {
            data: {
              success: true,
              message: 'Demo mode: Image delete simulated (backend not available)'
            }
          };
        }
      },
    }),
    getUploadedImages: builder.mutation({
      queryFn: async (folder = '', { getState }) => {
        try {
          const token = getState().auth.token;
          const baseUrl = getBaseUrl();
          
          const url = `${baseUrl}/upload/get-images${folder ? `?folder=${folder}` : ''}`;
          console.log('📁 Getting uploaded images from:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Get images successful:', data);
            return { data };
          } else {
            throw new Error(`Get images failed with status ${response.status}`);
          }
        } catch (error) {
          console.log('💾 Demo get images - backend not available');
          return {
            data: {
              success: true,
              message: 'Demo mode: Using placeholder images (backend not available)',
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                  filename: 'demo-image-1.jpg',
                  note: 'Demo placeholder'
                },
                {
                  url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                  filename: 'demo-image-2.jpg',
                  note: 'Demo placeholder'
                }
              ]
            }
          };
        }
      },
    }),

    // Document Management
    uploadDocument: builder.mutation({
      // Use queryFn so we can send FormData (multipart) and handle non-JSON responses (HTML 500 page)
      queryFn: async (formData, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();

          const response = await fetch(`${baseUrl}/upload`, {
            method: 'POST',
            headers: {
              // Don't set Content-Type so browser can set multipart/form-data boundary
              ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
            },
            body: formData,
          });

          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (jsonErr) {
            // Response is not JSON (could be HTML error page). Return raw text for debugging.
            data = { success: false, raw: text };
          }

          if (response.ok) {
            return { data };
          }

          // Non-2xx response: surface status and parsed/raw body
          return {
            error: {
              status: response.status,
              data,
            },
          };
        } catch (error) {
          console.error('uploadDocument queryFn error:', error);
          return { error };
        }
      },
    }),

    getDocuments: builder.mutation({
      query: () => ({
        url: "/documents",
        method: "GET",
      }),
    }),
    getDocumentById: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "GET",
      }),
    }),
    updateDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/documents/${id}`,
        method: "PUT",
        body: data,
      }),
      // Transform the response to match what the component expects
      transformResponse: (response) => {
        if (response.success && response.document) {
          return {
            success: true,
            document: response.document
          };
        }
        return response;
      },
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
    }),
    toggleDocumentStatus: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}/toggle-status`,
        method: "PATCH",
      }),
    }),
    toggleDocumentPublic: builder.mutation({
      query: (id) => ({
        url: `/documents/${id}/toggle-public`,
        method: "PATCH",
      }),
    }),
    getDocumentCategories: builder.mutation({
      query: () => ({
        url: "/documents/categories",
        method: "GET",
      }),
    }),
    getDocumentStats: builder.mutation({
      query: () => ({
        url: "/documents/stats/summary",
        method: "GET",
      }),
    }),

    // Home Events Section
    getHomeEventsData: builder.mutation({
      queryFn: async (id = "68ee3ad670e1bfc20b37541f", { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          const response = await fetch(`${baseUrl}/home/event`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.log('📄 Events API not available, using demo data:', error);
          return {
            data: {
              success: true,
              message: 'Demo events data (backend fallback)',
              event: {
                heading: 'Heroes in Action Disaster Relief Fundraiser',
                description: 'Join us for a special event to support disaster relief efforts and make a difference in our community.',
                image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                ctaButton: {
                  text: 'Events',
                  link: '/events',
                  style: 'primary'
                },
                isActive: true
              }
            }
          };
        }
      },
    }),
    createDocumentUser: builder.mutation({
      query: (data) => ({
       url: "/users/create",
       method: "POST",
       body: data
      }),
    }),
    updateHomeEventsData: builder.mutation({
      queryFn: async ({ id = "68ee3ad670e1bfc20b37541f", ...data }, { getState }) => {
        try {
          const token = getState().auth.token;
          const cleanToken = token ? token.replace(/"/g, '') : null;
          const baseUrl = getBaseUrl();
          
          console.log('🔄 Updating events data:', {
            endpoint: `${baseUrl}/home/event/68ee3ad670e1bfc20b37541f`,
            hasToken: !!cleanToken,
            data
          });
          
          const response = await fetch(`${baseUrl}/home/event/68ee3ad670e1bfc20b37541f`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(cleanToken && { 'Authorization': `Bearer ${cleanToken}` }),
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            return { data: result };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('Events update error:', error);
          throw error;
        }
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useCreateDocumentUserMutation,
  useGenerateAccessTokenMutation,
  useResetPasswordMutation,
  useGetDashboardDataMutation,
  useGetQueriesMutation,
  useGetAdminContactsMutation,
  useDeleteQueryMutation,
  useGetBlogsMutation,
  useGetBlogByIdMutation,
  useCreateBlogMutation,
  useUpdateBlogByIdMutation,
  useDeleteBlogMutation,
  useGetTestimonialsMutation,
  useGetTestimonialByIdMutation,
  useCreateTestimonialMutation,
  useUpdateTestimonialByIdMutation,
  useDeleteTestimonialMutation,
  useGetContactFormsMutation,
  useGetContactFormByIdMutation,
  useDeleteContactFormMutation,
  useUpdateContactFormStatusMutation,
  useGetJobApplicationsMutation,
  useGetJobApplicationByIdMutation,
  useDeleteJobApplicationMutation,
  useUpdateJobApplicationStatusMutation,
  useCreateCareerMutation,
  useGetCareersMutation,
  useGetCareerByIdMutation,
  useGetCareerApplicantsMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
  useGetEventRegistrationsByEventIdMutation,
  useGetEventRegistrationsMutation,
  useGetEventRegistrationByIdMutation,
  useDeleteEventRegistrationMutation,
  useUpdateEventRegistrationStatusMutation,
  useGetCorePagesMutation,
  useGetCorePageByIdMutation,
  useUpdateCorePageMutation,
  usePublishCorePageMutation,
  useResetCorePageToDefaultMutation,
  useGetNavigationMenuMutation,
  useGetMenuItemByIdMutation,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUpdateMenuOrderMutation,
  useToggleMenuItemStatusMutation,
  useGetTeamMembersMutation,
  useGetTeamMemberByIdMutation,
  useCreateTeamMemberMutation,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useToggleTeamMemberStatusMutation,
  useToggleTeamMemberFeaturedMutation,
  useUpdateTeamMemberOrderMutation,
  useGetServicesMutation,
  useGetServiceByIdMutation,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetEventsMutation,
  useGetEventByIdMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useToggleEventStatusMutation,
  useToggleEventFeaturedMutation,
  useUpdateEventOrderMutation,
  useGetStoriesMutation,
  useGetStoryByIdMutation,
  useCreateStoryMutation,
  useUpdateStoryMutation,
  useDeleteStoryMutation,
  useToggleStoryStatusMutation,
  useToggleStoryFeaturedMutation,
  useUpdateStoryOrderMutation,
  useGetHomePageDataMutation,
  useGetHomeHeroDataMutation,
  useUpdateHomeHeroDataMutation,
  useGetHomeCarouselMutation,
  useUpdateHomeCarouselMutation,
  useGetAboutUsDataMutation,
  useUpdateAboutUsDataMutation,
  useGetSpecificAboutUsDataMutation,
  useUpdateSpecificAboutUsDataMutation,
  useGetAboutMainDataMutation,
  useUpdateAboutMainDataMutation,
  useGetAboutVisionDataMutation,
  useUpdateAboutVisionDataMutation,
  useGetAboutCompanyDataMutation,
  useUpdateAboutCompanyDataMutation,
  useGetAboutMissionDataMutation,
  useUpdateAboutMissionDataMutation,
  useGetAboutTestimonialsMutation,
  useCreateAboutTestimonialMutation,
  useUpdateAboutTestimonialsSectionMutation,
  useUpdateAboutTestimonialMutation,
  useDeleteAboutTestimonialMutation,
  useGetContactPageDataMutation,
  useUpdateContactPageDataMutation,
  useGetEventsDataMutation,
  useUpdateEventsDataMutation,
  useGetTestimonialsDataMutation,
  useCreateTestimonialsMutation,
  useUpdateTestimonialsByIdMutation,
  useDeleteTestimonialsByIdMutation,
  useUpdateTestimonialsDataMutation,
  useGetGalleryDataMutation,
  useUpdateGalleryDataMutation,
  useGetTeamMembersDataMutation,
  useUpdateTeamMembersDataMutation,
  useGetHomeFeaturesDataMutation,
  useUpdateHomeFeaturesDataMutation,
  useGetHomeAboutDataMutation,
  useUpdateHomeAboutDataMutation,
  useToggleHomeSectionStatusMutation,
  useGetEmailAlertSettingsMutation,
  useUpdateEmailAlertSettingsMutation,
  useTestEmailAlertMutation,
  useSendNotificationMutation,
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useDeleteImageMutation,
  useGetUploadedImagesMutation,
  useGetDocumentsMutation,
  useGetDocumentByIdMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useToggleDocumentStatusMutation,
  useToggleDocumentPublicMutation,
  useGetDocumentCategoriesMutation,
  useGetDocumentStatsMutation,
  useUploadDocumentMutation,
  useGetHomeEventsDataMutation,
  useUpdateHomeEventsDataMutation,
} = apiSlice;