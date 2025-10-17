import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCorePageByIdMutation, useUpdateCorePageMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import MotionDiv from '../../Components/MotionDiv';
import FormField from '../../Components/FormField';
import TextEditor from '../../Components/TextEditor';
import SectionEditor from '../../Components/SectionEditor';
import PagePreview from '../../Components/PagePreview';
import { FaSave, FaEye, FaArrowLeft } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';

const EditWebsitePage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(selectAuth);
  
  const [getCorePageById, { isLoading }] = useGetCorePageByIdMutation();
  const [updateCorePage, { isLoading: updateLoading }] = useUpdateCorePageMutation();
  
  const [pageData, setPageData] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const pageConfigs = {
    home: {
      title: 'Home Page',
      sections: {
        hero: {
          title: 'Hero Section',
          fields: [
            { name: 'title', label: 'Main Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'primaryButtonText', label: 'Primary Button Text', type: 'text' },
            { name: 'primaryButtonLink', label: 'Primary Button Link', type: 'text' },
            { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
            { name: 'secondaryButtonLink', label: 'Secondary Button Link', type: 'text' },
            { name: 'backgroundImage', label: 'Background Image', type: 'image' },
            { name: 'videoUrl', label: 'Video URL (optional)', type: 'text' }
          ]
        },
        aboutUs: {
          title: 'About Us Section',
          fields: [
            { name: 'title', label: 'Section Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'buttonText', label: 'Button Text', type: 'text' },
            { name: 'buttonLink', label: 'Button Link', type: 'text' },
            { name: 'leftImage', label: 'Left Side Image', type: 'image' },
            { name: 'rightImage', label: 'Right Side Image', type: 'image' }
          ]
        },
        aboutFeatures: {
          title: 'About Us Features (with Icons)',
          type: 'array',
          fields: [
            { name: 'title', label: 'Feature Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'icon', label: 'Icon Class (e.g., fas fa-heart)', type: 'text', required: true },
            { name: 'color', label: 'Icon Color', type: 'color' },
            { name: 'buttonText', label: 'Button Text', type: 'text' },
            { name: 'buttonLink', label: 'Button Link', type: 'text' }
          ]
        },
        gallery: {
          title: 'Gallery Section',
          fields: [
            { name: 'title', label: 'Gallery Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Gallery Subtitle', type: 'text' },
            { name: 'description', label: 'Gallery Description', type: 'textarea' }
          ]
        },
        galleryImages: {
          title: 'Gallery Images',
          type: 'array',
          fields: [
            { name: 'image', label: 'Gallery Image', type: 'image', required: true },
            { name: 'title', label: 'Image Title', type: 'text' },
            { name: 'description', label: 'Image Description', type: 'text' },
            { name: 'category', label: 'Category', type: 'text' },
            { name: 'alt', label: 'Alt Text', type: 'text' }
          ]
        },
        ctaSections: {
          title: 'Call-to-Action Sections',
          type: 'array',
          fields: [
            { name: 'title', label: 'CTA Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'primaryButtonText', label: 'Primary Button Text', type: 'text' },
            { name: 'primaryButtonLink', label: 'Primary Button Link', type: 'text' },
            { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
            { name: 'secondaryButtonLink', label: 'Secondary Button Link', type: 'text' },
            { name: 'backgroundColor', label: 'Background Color', type: 'color' },
            { name: 'backgroundImage', label: 'Background Image', type: 'image' },
            { name: 'sectionId', label: 'Section ID/Class', type: 'text' }
          ]
        }
      }
    },
    about: {
      title: 'About Us Page',
      sections: {
        header: {
          title: 'About Us Header',
          fields: [
            { name: 'title', label: 'Page Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Small Description', type: 'textarea' },
            { name: 'headerImage', label: 'Header Background Image', type: 'image' }
          ]
        },
        aboutSection: {
          title: 'About Us Main Content',
          fields: [
            { name: 'title', label: 'Section Title', type: 'text', required: true },
            { name: 'description', label: 'Main Description', type: 'textarea', required: true },
            { name: 'leftImage', label: 'Left Side Image', type: 'image' },
            { name: 'rightImage', label: 'Right Side Image', type: 'image' },
            { name: 'bottomLeftImage', label: 'Bottom Left Image', type: 'image' },
            { name: 'bottomRightImage', label: 'Bottom Right Image', type: 'image' }
          ]
        },
        aboutPointers: {
          title: 'About Us Key Points',
          type: 'array',
          fields: [
            { name: 'title', label: 'Point Title', type: 'text', required: true },
            { name: 'description', label: 'Point Description', type: 'textarea' },
            { name: 'icon', label: 'Icon Class (e.g., fas fa-check)', type: 'text' },
            { name: 'color', label: 'Point Color', type: 'color' }
          ]
        },
        mission: {
          title: 'Our Mission',
          fields: [
            { name: 'title', label: 'Mission Title', type: 'text', required: true },
            { name: 'description', label: 'Mission Description', type: 'textarea', required: true },
            { name: 'image', label: 'Mission Image', type: 'image' },
            { name: 'buttonText', label: 'Mission Button Text', type: 'text' },
            { name: 'buttonLink', label: 'Mission Button Link', type: 'text' }
          ]
        },
        vision: {
          title: 'Our Vision',
          fields: [
            { name: 'title', label: 'Vision Title', type: 'text', required: true },
            { name: 'description', label: 'Vision Description', type: 'textarea', required: true },
            { name: 'image', label: 'Vision Image', type: 'image' },
            { name: 'buttonText', label: 'Vision Button Text', type: 'text' },
            { name: 'buttonLink', label: 'Vision Button Link', type: 'text' }
          ]
        },
        values: {
          title: 'Our Values',
          fields: [
            { name: 'title', label: 'Values Section Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Values Subtitle', type: 'text' },
            { name: 'description', label: 'Values Description', type: 'textarea' }
          ]
        },
        valuesList: {
          title: 'Values List',
          type: 'array',
          fields: [
            { name: 'title', label: 'Value Title', type: 'text', required: true },
            { name: 'description', label: 'Value Description', type: 'textarea' },
            { name: 'icon', label: 'Value Icon Class', type: 'text' },
            { name: 'image', label: 'Value Image', type: 'image' },
            { name: 'color', label: 'Value Color', type: 'color' }
          ]
        },
        leadership: {
          title: 'Our Leadership',
          fields: [
            { name: 'title', label: 'Leadership Section Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Leadership Subtitle', type: 'text' },
            { name: 'description', label: 'Leadership Description', type: 'textarea' }
          ]
        },
        leadershipTeam: {
          title: 'Leadership Team Members',
          type: 'array',
          fields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'position', label: 'Position/Title', type: 'text', required: true },
            { name: 'bio', label: 'Biography', type: 'textarea' },
            { name: 'image', label: 'Profile Image', type: 'image' },
            { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
            { name: 'twitter', label: 'Twitter URL', type: 'text' },
            { name: 'email', label: 'Email Address', type: 'email' },
            { name: 'phone', label: 'Phone Number', type: 'tel' }
          ]
        },
        team: {
          title: 'General Team Section',
          type: 'array',
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'position', label: 'Position', type: 'text', required: true },
            { name: 'bio', label: 'Biography', type: 'textarea' },
            { name: 'image', label: 'Profile Image', type: 'image' },
            { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'department', label: 'Department', type: 'text' }
          ]
        },
        history: {
          title: 'Company History',
          fields: [
            { name: 'title', label: 'History Title', type: 'text' },
            { name: 'subtitle', label: 'History Subtitle', type: 'text' },
            { name: 'content', label: 'History Content', type: 'richtext' },
            { name: 'image', label: 'History Image', type: 'image' }
          ]
        }
      }
    },
    services: {
      title: 'Services Page',
      sections: {
        header: {
          title: 'Page Header',
          fields: [
            { name: 'title', label: 'Page Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]
        },
        services: {
          title: 'Service Offerings',
          type: 'array',
          fields: [
            { name: 'title', label: 'Service Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'features', label: 'Features (comma-separated)', type: 'textarea' },
            { name: 'price', label: 'Pricing', type: 'text' },
            { name: 'icon', label: 'Icon Name', type: 'text' },
            { name: 'image', label: 'Service Image', type: 'image' }
          ]
        },
        process: {
          title: 'Process Steps',
          type: 'array',
          fields: [
            { name: 'step', label: 'Step Number', type: 'number', required: true },
            { name: 'title', label: 'Step Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'icon', label: 'Icon Name', type: 'text' }
          ]
        },
        pricing: {
          title: 'Pricing Information',
          fields: [
            { name: 'title', label: 'Pricing Section Title', type: 'text' },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'contactText', label: 'Contact Call-to-Action Text', type: 'text' }
          ]
        }
      }
    },
    contact: {
      title: 'Contact Us Page',
      sections: {
        header: {
          title: 'Page Header',
          fields: [
            { name: 'title', label: 'Page Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' }
          ]
        },
        contactInfo: {
          title: 'Contact Information',
          fields: [
            { name: 'phone', label: 'Phone Number', type: 'tel' },
            { name: 'email', label: 'Email Address', type: 'email' },
            { name: 'address', label: 'Physical Address', type: 'textarea' },
            { name: 'hours', label: 'Business Hours', type: 'textarea' }
          ]
        },
        locations: {
          title: 'Office Locations',
          type: 'array',
          fields: [
            { name: 'name', label: 'Office Name', type: 'text', required: true },
            { name: 'address', label: 'Address', type: 'textarea', required: true },
            { name: 'phone', label: 'Phone', type: 'tel' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'mapUrl', label: 'Google Maps URL', type: 'text' }
          ]
        }
      }
    }
  };

  const fetchPageData = async () => {
    try {
      // Check if demo mode
      if (token && token.startsWith("demo-token")) {
        // Set demo data based on pageId
        const demoData = {
          home: {
            _id: 'home',
            pageType: 'home',
            title: 'Home Page',
            sections: {
              hero: {
                title: 'Welcome to SAYV Financial',
                subtitle: 'Your trusted partner in financial planning',
                description: 'We help you achieve your financial goals with expert advice and personalized solutions.',
                primaryButtonText: 'Get Started Today',
                primaryButtonLink: '/contact',
                secondaryButtonText: 'Learn More',
                secondaryButtonLink: '/about',
                backgroundImage: '/images/hero-bg.jpg',
                videoUrl: 'https://youtube.com/embed/demo-video'
              },
              aboutUs: {
                title: 'About SAYV Financial',
                subtitle: 'Building Financial Futures Since 2008',
                description: 'We are a leading financial services company dedicated to helping individuals and businesses achieve their financial objectives through comprehensive planning and expert guidance.',
                buttonText: 'Read Our Story',
                buttonLink: '/about',
                leftImage: '/images/about-left.jpg',
                rightImage: '/images/about-right.jpg'
              },
              aboutFeatures: [
                {
                  title: 'Expert Financial Planning',
                  description: 'Professional guidance for your financial future with personalized strategies.',
                  icon: 'fas fa-chart-line',
                  color: '#007bff',
                  buttonText: 'Learn More',
                  buttonLink: '/services/planning'
                },
                {
                  title: 'Investment Management',
                  description: 'Tailored investment strategies designed for optimal growth and risk management.',
                  icon: 'fas fa-coins',
                  color: '#28a745',
                  buttonText: 'View Services',
                  buttonLink: '/services/investment'
                },
                {
                  title: '24/7 Client Support',
                  description: 'Round-the-clock assistance and support whenever you need expert advice.',
                  icon: 'fas fa-headset',
                  color: '#ffc107',
                  buttonText: 'Contact Support',
                  buttonLink: '/contact'
                },
                {
                  title: 'Retirement Planning',
                  description: 'Secure your future with comprehensive retirement planning strategies.',
                  icon: 'fas fa-piggy-bank',
                  color: '#dc3545',
                  buttonText: 'Plan Now',
                  buttonLink: '/services/retirement'
                }
              ],
              gallery: {
                title: 'Our Gallery',
                subtitle: 'Moments that Matter',
                description: 'Take a look at our office, team events, client meetings, and community involvement activities that showcase our commitment to excellence and client service.'
              },
              galleryImages: [
                {
                  image: '/images/gallery/office-1.jpg',
                  title: 'Modern Office Space',
                  description: 'Our state-of-the-art office designed for client comfort',
                  category: 'office',
                  alt: 'SAYV Financial modern office interior'
                },
                {
                  image: '/images/gallery/team-meeting.jpg',
                  title: 'Team Collaboration',
                  description: 'Our expert team working together on client solutions',
                  category: 'team',
                  alt: 'Financial advisors in team meeting'
                },
                {
                  image: '/images/gallery/client-consultation.jpg',
                  title: 'Client Consultation',
                  description: 'One-on-one financial planning session with clients',
                  category: 'client',
                  alt: 'Financial advisor consulting with client'
                },
                {
                  image: '/images/gallery/community-event.jpg',
                  title: 'Community Outreach',
                  description: 'Supporting local community financial literacy programs',
                  category: 'community',
                  alt: 'Community financial education event'
                },
                {
                  image: '/images/gallery/awards.jpg',
                  title: 'Industry Recognition',
                  description: 'Awards and recognition for excellence in financial services',
                  category: 'awards',
                  alt: 'Financial services industry awards'
                },
                {
                  image: '/images/gallery/technology.jpg',
                  title: 'Advanced Technology',
                  description: 'Cutting-edge tools for financial analysis and planning',
                  category: 'technology',
                  alt: 'Financial planning technology and tools'
                }
              ],

              ctaSections: [
                {
                  title: 'Ready to Start Your Financial Journey?',
                  description: 'Contact us today for a free consultation and take the first step towards financial success.',
                  primaryButtonText: 'Schedule Consultation',
                  primaryButtonLink: '/contact',
                  secondaryButtonText: 'View Our Services',
                  secondaryButtonLink: '/services',
                  backgroundColor: '#007bff',
                  backgroundImage: '/images/cta-bg-1.jpg',
                  sectionId: 'main-cta'
                },
                {
                  title: 'Download Our Financial Planning Guide',
                  description: 'Get our comprehensive guide to financial planning and investment strategies, absolutely free.',
                  primaryButtonText: 'Download Guide',
                  primaryButtonLink: '/downloads/financial-guide.pdf',
                  secondaryButtonText: 'Subscribe Newsletter',
                  secondaryButtonLink: '/newsletter',
                  backgroundColor: '#28a745',
                  backgroundImage: '/images/cta-bg-2.jpg',
                  sectionId: 'guide-cta'
                },
                {
                  title: 'Join Our Exclusive Webinar Series',
                  description: 'Learn from industry experts in our monthly webinar series covering investment strategies and market insights.',
                  primaryButtonText: 'Register Now',
                  primaryButtonLink: '/webinars',
                  secondaryButtonText: 'View Past Sessions',
                  secondaryButtonLink: '/webinars/archive',
                  backgroundColor: '#6f42c1',
                  backgroundImage: '/images/cta-bg-3.jpg',
                  sectionId: 'webinar-cta'
                }
              ],

            },
            isPublished: true,
            lastUpdated: new Date().toISOString()
          },
          about: {
            _id: 'about',
            pageType: 'about',
            title: 'About Us',
            sections: {
              header: {
                title: 'About SAYV Financial',
                subtitle: 'Building Financial Futures Since 2008',
                description: 'We are a leading financial services company dedicated to helping individuals and businesses achieve their financial objectives through innovative solutions and expert guidance.',
                headerImage: '/images/about-header-bg.jpg'
              },
              aboutSection: {
                title: 'Who We Are',
                description: 'At SAYV Financial, we believe that everyone deserves access to professional financial guidance. Our team of experienced advisors works tirelessly to understand your unique financial situation and goals, crafting personalized strategies that help you build wealth, manage risk, and secure your financial future.',
                leftImage: '/images/about/office-exterior.jpg',
                rightImage: '/images/about/team-discussion.jpg',
                bottomLeftImage: '/images/about/client-meeting.jpg',
                bottomRightImage: '/images/about/technology-tools.jpg'
              },
              aboutPointers: [
                {
                  title: 'Personalized Financial Planning',
                  description: 'Tailored strategies designed specifically for your financial goals and circumstances.',
                  icon: 'fas fa-user-check',
                  color: '#007bff'
                },
                {
                  title: 'Expert Investment Management',
                  description: 'Professional portfolio management with proven track record of success.',
                  icon: 'fas fa-chart-line',
                  color: '#28a745'
                },
                {
                  title: 'Comprehensive Risk Assessment',
                  description: 'Thorough analysis of potential risks and protective strategies.',
                  icon: 'fas fa-shield-alt',
                  color: '#ffc107'
                },
                {
                  title: 'Ongoing Support & Guidance',
                  description: '24/7 access to our team of financial experts whenever you need assistance.',
                  icon: 'fas fa-headset',
                  color: '#dc3545'
                },
                {
                  title: 'Transparent Fee Structure',
                  description: 'Clear, upfront pricing with no hidden fees or surprise charges.',
                  icon: 'fas fa-dollar-sign',
                  color: '#6f42c1'
                },
                {
                  title: 'Cutting-Edge Technology',
                  description: 'Advanced tools and platforms for portfolio tracking and financial planning.',
                  icon: 'fas fa-laptop',
                  color: '#20c997'
                }
              ],
              mission: {
                title: 'Our Mission',
                description: 'To empower individuals and families to achieve financial independence through comprehensive planning, expert guidance, and innovative solutions. We are committed to building lasting relationships based on trust, transparency, and exceptional service.',
                image: '/images/about/mission-image.jpg',
                buttonText: 'Learn About Our Approach',
                buttonLink: '/services'
              },
              vision: {
                title: 'Our Vision',
                description: 'To be the most trusted financial partner, helping clients build lasting wealth and achieve their dreams through personalized strategies and unwavering commitment to their success.',
                image: '/images/about/vision-image.jpg',
                buttonText: 'Explore Our Services',
                buttonLink: '/services'
              },
              values: {
                title: 'Our Core Values',
                subtitle: 'The principles that guide everything we do',
                description: 'Our values are not just words on a wall - they are the foundation of every interaction, decision, and strategy we develop for our clients.'
              },
              valuesList: [
                {
                  title: 'Integrity',
                  description: 'We operate with the highest ethical standards, always putting our clients\' interests first.',
                  icon: 'fas fa-handshake',
                  image: '/images/values/integrity.jpg',
                  color: '#007bff'
                },
                {
                  title: 'Excellence',
                  description: 'We strive for excellence in everything we do, continuously improving our services and expertise.',
                  icon: 'fas fa-star',
                  image: '/images/values/excellence.jpg',
                  color: '#28a745'
                },
                {
                  title: 'Innovation',
                  description: 'We embrace new technologies and strategies to provide the best possible outcomes for our clients.',
                  icon: 'fas fa-lightbulb',
                  image: '/images/values/innovation.jpg',
                  color: '#ffc107'
                },
                {
                  title: 'Client-First Approach',
                  description: 'Every decision we make is guided by what is best for our clients and their financial well-being.',
                  icon: 'fas fa-users',
                  image: '/images/values/client-first.jpg',
                  color: '#dc3545'
                },
                {
                  title: 'Transparency',
                  description: 'We believe in clear communication and honest, straightforward advice at all times.',
                  icon: 'fas fa-eye',
                  image: '/images/values/transparency.jpg',
                  color: '#6f42c1'
                },
                {
                  title: 'Professional Excellence',
                  description: 'Our team maintains the highest professional standards and continues education in their fields.',
                  icon: 'fas fa-graduation-cap',
                  image: '/images/values/excellence.jpg',
                  color: '#20c997'
                }
              ],
              leadership: {
                title: 'Our Leadership Team',
                subtitle: 'Meet the experts leading SAYV Financial',
                description: 'Our leadership team brings decades of combined experience in financial services, investment management, and client relations.'
              },
              leadershipTeam: [
                {
                  name: 'John Smith',
                  position: 'Chief Executive Officer & Founder',
                  bio: 'With over 20 years in financial services, John founded SAYV Financial with the vision of making professional financial advice accessible to everyone. He holds a CFA designation and MBA from Wharton.',
                  image: '/images/leadership/john-smith.jpg',
                  linkedin: 'https://linkedin.com/in/johnsmith-ceo',
                  twitter: 'https://twitter.com/johnsmith_ceo',
                  email: 'john.smith@sayv.net',
                  phone: '+1 (555) 123-4567'
                },
                {
                  name: 'Sarah Johnson',
                  position: 'Chief Investment Officer',
                  bio: 'Sarah brings 15+ years of portfolio management experience from top-tier investment firms. She specializes in risk management and alternative investments, holding CFA and FRM certifications.',
                  image: '/images/leadership/sarah-johnson.jpg',
                  linkedin: 'https://linkedin.com/in/sarah-johnson-cio',
                  twitter: 'https://twitter.com/sarahjohnson_cio',
                  email: 'sarah.johnson@sayv.net',
                  phone: '+1 (555) 123-4568'
                },
                {
                  name: 'Michael Davis',
                  position: 'Chief Financial Officer',
                  bio: 'Michael oversees all financial operations and ensures regulatory compliance. With his CPA and extensive experience in financial services, he maintains the highest standards of fiscal responsibility.',
                  image: '/images/leadership/michael-davis.jpg',
                  linkedin: 'https://linkedin.com/in/michael-davis-cfo',
                  email: 'michael.davis@sayv.net',
                  phone: '+1 (555) 123-4569'
                },
                {
                  name: 'Emily Rodriguez',
                  position: 'Chief Technology Officer',
                  bio: 'Emily leads our technology initiatives, ensuring our clients have access to cutting-edge financial tools and platforms. She has 12 years of experience in fintech and holds an MS in Computer Science.',
                  image: '/images/leadership/emily-rodriguez.jpg',
                  linkedin: 'https://linkedin.com/in/emily-rodriguez-cto',
                  email: 'emily.rodriguez@sayv.net',
                  phone: '+1 (555) 123-4570'
                }
              ],
              team: [
                {
                  name: 'David Wilson',
                  position: 'Senior Financial Advisor',
                  bio: 'David specializes in retirement planning and estate management with 12 years of experience helping families secure their financial futures.',
                  image: '/images/team/david-wilson.jpg',
                  linkedin: 'https://linkedin.com/in/david-wilson-advisor',
                  email: 'david.wilson@sayv.net',
                  department: 'Financial Planning'
                },
                {
                  name: 'Lisa Chen',
                  position: 'Investment Analyst',
                  bio: 'Lisa conducts market research and investment analysis to support our portfolio management strategies. She holds a Master\'s in Finance from NYU.',
                  image: '/images/team/lisa-chen.jpg',
                  linkedin: 'https://linkedin.com/in/lisa-chen-analyst',
                  email: 'lisa.chen@sayv.net',
                  department: 'Investment Management'
                },
                {
                  name: 'Robert Martinez',
                  position: 'Client Relations Manager',
                  bio: 'Robert ensures exceptional client service and manages ongoing relationships with our valued clients. He has 8 years of experience in financial services.',
                  image: '/images/team/robert-martinez.jpg',
                  linkedin: 'https://linkedin.com/in/robert-martinez-relations',
                  email: 'robert.martinez@sayv.net',
                  department: 'Client Services'
                }
              ],
              history: {
                title: 'Our Journey',
                subtitle: 'From humble beginnings to industry leadership',
                content: '<h3>Founded in 2008</h3><p>SAYV Financial was established during the financial crisis with a mission to provide honest, transparent financial advice to individuals and families affected by market volatility.</p><h3>Growth and Expansion (2010-2015)</h3><p>We expanded our services to include comprehensive investment management and added several key team members with expertise in various financial disciplines.</p><h3>Technology Innovation (2016-2020)</h3><p>We invested heavily in technology to provide clients with cutting-edge tools for portfolio tracking, financial planning, and secure communication.</p><h3>Present Day</h3><p>Today, SAYV Financial serves over 5,000 clients and manages more than $2 billion in assets, while maintaining our commitment to personalized service and client success.</p>',
                image: '/images/about/company-history.jpg'
              }
            },
            isPublished: true,
            lastUpdated: new Date().toISOString()
          },
          services: {
            _id: 'services',
            pageType: 'services',
            title: 'Our Services',
            sections: {
              header: {
                title: 'Financial Services',
                subtitle: 'Comprehensive solutions for all your financial needs',
                description: 'From investment planning to retirement strategies, we offer a full range of financial services tailored to your unique situation.'
              },
              services: [
                {
                  title: 'Wealth Management',
                  description: 'Comprehensive wealth management solutions for high-net-worth individuals and families.',
                  features: 'Portfolio Management, Tax Planning, Estate Planning, Risk Management',
                  price: 'Custom Pricing',
                  icon: 'gem',
                  image: '/images/services/wealth.jpg'
                },
                {
                  title: 'Retirement Planning',
                  description: 'Secure your future with our comprehensive retirement planning services.',
                  features: '401k Management, IRA Planning, Social Security Optimization, Pension Planning',
                  price: 'Starting at $199/month',
                  icon: 'piggy-bank',
                  image: '/images/services/retirement.jpg'
                }
              ],
              process: [
                {
                  step: 1,
                  title: 'Initial Consultation',
                  description: 'We meet to understand your financial goals and current situation.',
                  icon: 'user-check'
                },
                {
                  step: 2,
                  title: 'Financial Analysis',
                  description: 'Comprehensive analysis of your financial position and risk tolerance.',
                  icon: 'chart-bar'
                },
                {
                  step: 3,
                  title: 'Strategy Development',
                  description: 'Custom financial strategy tailored to your specific needs and goals.',
                  icon: 'lightbulb'
                },
                {
                  step: 4,
                  title: 'Implementation',
                  description: 'Execute the financial plan with ongoing monitoring and adjustments.',
                  icon: 'cog'
                }
              ],
              pricing: {
                title: 'Transparent Pricing',
                subtitle: 'No hidden fees, clear pricing structure',
                description: 'Our pricing is based on the complexity of your financial situation and the services you need.',
                contactText: 'Contact us for a personalized quote'
              }
            },
            isPublished: true,
            lastUpdated: new Date().toISOString()
          }
        };
        
        setPageData(demoData[pageId]);
        if (demoData[pageId] && Object.keys(pageConfigs[pageId]?.sections || {}).length > 0) {
          setActiveTab(Object.keys(pageConfigs[pageId].sections)[0]);
        }
        return;
      }

      // Real API call for production
      const data = await getCorePageById(pageId).unwrap();
      setPageData(data?.page);
      if (data?.page && Object.keys(pageConfigs[pageId]?.sections || {}).length > 0) {
        setActiveTab(Object.keys(pageConfigs[pageId].sections)[0]);
      }
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    if (pageId && pageConfigs[pageId]) {
      fetchPageData();
    } else {
      toast.error('Invalid page ID');
      navigate('/dash/website-pages');
    }
  }, [pageId]);

  const handleSectionChange = (sectionKey, field, value, index = null) => {
    setHasChanges(true);
    setPageData(prev => {
      const newData = { ...prev };
      
      if (!newData.sections) {
        newData.sections = {};
      }
      
      if (!newData.sections[sectionKey]) {
        newData.sections[sectionKey] = pageConfigs[pageId].sections[sectionKey].type === 'array' ? [] : {};
      }

      if (pageConfigs[pageId].sections[sectionKey].type === 'array') {
        if (index !== null) {
          if (!newData.sections[sectionKey][index]) {
            newData.sections[sectionKey][index] = {};
          }
          newData.sections[sectionKey][index][field] = value;
        }
      } else {
        newData.sections[sectionKey][field] = value;
      }
      
      return newData;
    });
  };

  const addArrayItem = (sectionKey) => {
    setHasChanges(true);
    setPageData(prev => {
      const newData = { ...prev };
      if (!newData.sections[sectionKey]) {
        newData.sections[sectionKey] = [];
      }
      newData.sections[sectionKey].push({});
      return newData;
    });
  };

  const removeArrayItem = (sectionKey, index) => {
    setHasChanges(true);
    setPageData(prev => {
      const newData = { ...prev };
      newData.sections[sectionKey].splice(index, 1);
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const data = await updateCorePage({ id: pageId, data: pageData }).unwrap();
      toast.success(data?.message || 'Page updated successfully');
      setHasChanges(false);
    } catch (error) {
      getError(error);
    }
  };

  const renderField = (field, sectionKey, value, onChange, index = null) => {
    const fieldValue = value || '';
    
    switch (field.type) {
      case 'richtext':
        return (
          <TextEditor
            description={fieldValue}
            onChange={(text) => onChange(field.name, text)}
          />
        );
      case 'textarea':
        return (
          <FormField
            type="textarea"
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            rows={3}
          />
        );
      case 'color':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{field.label} {field.required && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
              type="color"
              value={fieldValue}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          </Form.Group>
        );
      default:
        return (
          <FormField
            type={field.type}
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  const renderSection = (sectionKey, sectionConfig) => {
    const sectionData = pageData?.sections?.[sectionKey] || (sectionConfig.type === 'array' ? [] : {});

    if (sectionConfig.type === 'array') {
      return (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{sectionConfig.title}</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => addArrayItem(sectionKey)}
            >
              Add Item
            </Button>
          </Card.Header>
          <Card.Body>
            {sectionData.map((item, index) => (
              <Card key={index} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Item {index + 1}</h6>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeArrayItem(sectionKey, index)}
                  >
                    Remove
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {sectionConfig.fields.map((field) => (
                      <Col key={field.name} md={field.type === 'textarea' || field.type === 'richtext' ? 12 : 6}>
                        {renderField(
                          field,
                          sectionKey,
                          item[field.name],
                          (fieldName, value) => handleSectionChange(sectionKey, fieldName, value, index),
                          index
                        )}
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            ))}
            {sectionData.length === 0 && (
              <Alert variant="info">
                No items added yet. Click "Add Item" to get started.
              </Alert>
            )}
          </Card.Body>
        </Card>
      );
    }

    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{sectionConfig.title}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {sectionConfig.fields.map((field) => (
              <Col key={field.name} md={field.type === 'textarea' || field.type === 'richtext' ? 12 : 6}>
                {renderField(
                  field,
                  sectionKey,
                  sectionData[field.name],
                  (fieldName, value) => handleSectionChange(sectionKey, fieldName, value)
                )}
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  if (!pageData || !pageConfigs[pageId]) {
    return (
      <MotionDiv>
        <Container>
          <Alert variant="warning">Loading page data...</Alert>
        </Container>
      </MotionDiv>
    );
  }

  const pageConfig = pageConfigs[pageId];

  return (
    <MotionDiv>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/dash/website-pages')}
              className="me-3"
            >
              <FaArrowLeft className="me-1" />
              Back
            </Button>
            <h2 className="d-inline">
              <span style={{ color: 'var(--dark-color)' }}>Edit</span>{' '}
              <span style={{ color: 'var(--neutral-color)' }}>{pageConfig.title}</span>
            </h2>
            {hasChanges && <Badge bg="warning" className="ms-2">Unsaved Changes</Badge>}
          </div>
          <div>
            <Button
              variant="outline-info"
              onClick={() => setShowPreview(true)}
              className="me-2"
            >
              <FaEye className="me-1" />
              Preview
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateLoading || !hasChanges}
            >
              <FaSave className="me-1" />
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          {Object.entries(pageConfig.sections).map(([sectionKey, sectionConfig]) => (
            <Tab
              key={sectionKey}
              eventKey={sectionKey}
              title={sectionConfig.title}
            >
              <SectionEditor
                sectionKey={sectionKey}
                sectionConfig={sectionConfig}
                sectionData={pageData?.sections?.[sectionKey]}
                onChange={handleSectionChange}
                onAddItem={addArrayItem}
                onRemoveItem={removeArrayItem}
              />
            </Tab>
          ))}
        </Tabs>

        {/* Page Preview Modal */}
        <PagePreview
          show={showPreview}
          onHide={() => setShowPreview(false)}
          pageId={pageId}
          pageData={pageData}
          title={pageConfig.title}
        />
      </Container>
    </MotionDiv>
  );
};

export default EditWebsitePage;