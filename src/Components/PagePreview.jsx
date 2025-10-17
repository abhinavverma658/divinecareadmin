import React, { useState } from 'react';
import { Modal, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaEye, FaExternalLinkAlt, FaMobile, FaDesktop, FaTabletAlt } from 'react-icons/fa';

const PagePreview = ({ show, onHide, pageId, pageData, title }) => {
  const [deviceView, setDeviceView] = useState('desktop');
  const [loading, setLoading] = useState(true);

  const getPreviewUrl = () => {
    // In production, this would be the actual frontend URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-website.com' 
      : 'http://localhost:5174';
    
    return `${baseUrl}/pages/${pageId}?preview=true`;
  };

  const getIframeStyles = () => {
    switch (deviceView) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxWidth: '100%',
          border: '8px solid #333',
          borderRadius: '20px',
          backgroundColor: '#333'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
          border: '4px solid #666',
          borderRadius: '12px',
          backgroundColor: '#666'
        };
      default:
        return {
          width: '100%',
          height: '70vh',
          border: '2px solid #ddd',
          borderRadius: '8px'
        };
    }
  };

  const deviceButtons = [
    { key: 'desktop', icon: FaDesktop, label: 'Desktop' },
    { key: 'tablet', icon: FaTabletAlt, label: 'Tablet' },
    { key: 'mobile', icon: FaMobile, label: 'Mobile' }
  ];

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const renderPreviewContent = () => {
    if (!pageData || !pageData.sections) {
      return (
        <Alert variant="warning" className="text-center p-4">
          <FaEye size={24} className="mb-2" />
          <div>No preview available</div>
          <small>Page data is not complete or sections are missing.</small>
        </Alert>
      );
    }

    // For demo purposes, render a simplified preview
    return (
      <div className="preview-content p-4">
        <Alert variant="info" className="mb-4">
          <strong>Preview Mode</strong> - This is a simplified preview. 
          The actual page will have full styling and functionality.
        </Alert>
        
        {pageId === 'home' && renderHomePreview()}
        {pageId === 'about' && renderAboutPreview()}
        {pageId === 'services' && renderServicesPreview()}
        {pageId === 'contact' && renderContactPreview()}
      </div>
    );
  };

  const renderHomePreview = () => {
    const { hero, features, statistics, cta } = pageData.sections;
    
    return (
      <div>
        {/* Hero Section */}
        {hero && (
          <div className="mb-5 p-4 bg-primary text-white rounded">
            <h1>{hero.title || 'Hero Title'}</h1>
            {hero.subtitle && <h3>{hero.subtitle}</h3>}
            {hero.description && <p>{hero.description}</p>}
            {hero.buttonText && (
              <Button variant="light">{hero.buttonText}</Button>
            )}
          </div>
        )}
        
        {/* Features Section */}
        {features && Array.isArray(features) && features.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Features</h3>
            <div className="row">
              {features.map((feature, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{feature.title}</h5>
                      <p className="card-text">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Statistics Section */}
        {statistics && Array.isArray(statistics) && statistics.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Statistics</h3>
            <div className="row text-center">
              {statistics.map((stat, index) => (
                <div key={index} className="col-md-3 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h2 className="text-primary">{stat.value}</h2>
                      <p>{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA Section */}
        {cta && (
          <div className="p-4 bg-success text-white rounded text-center">
            <h3>{cta.title}</h3>
            {cta.description && <p>{cta.description}</p>}
            {cta.buttonText && (
              <Button variant="light">{cta.buttonText}</Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAboutPreview = () => {
    const { header, mission, team, history } = pageData.sections;
    
    return (
      <div>
        {/* Header Section */}
        {header && (
          <div className="mb-5">
            <h1>{header.title}</h1>
            {header.subtitle && <h3 className="text-muted">{header.subtitle}</h3>}
            {header.description && <p className="lead">{header.description}</p>}
          </div>
        )}
        
        {/* Mission & Vision */}
        {mission && (
          <div className="mb-5">
            <div className="row">
              <div className="col-md-6">
                <h4>Mission</h4>
                <p>{mission.mission}</p>
              </div>
              <div className="col-md-6">
                <h4>Vision</h4>
                <p>{mission.vision}</p>
              </div>
            </div>
            {mission.values && (
              <div className="mt-4">
                <h4>Core Values</h4>
                {mission.values.split(',').map((value, index) => (
                  <Badge key={index} bg="primary" className="me-2 mb-2">
                    {value.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Team Section */}
        {team && Array.isArray(team) && team.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Our Team</h3>
            <div className="row">
              {team.map((member, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{member.name}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{member.position}</h6>
                      <p className="card-text">{member.bio}</p>
                      {member.email && (
                        <small className="text-muted">Email: {member.email}</small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderServicesPreview = () => {
    const { header, services, process, pricing } = pageData.sections;
    
    return (
      <div>
        {/* Header */}
        {header && (
          <div className="mb-5">
            <h1>{header.title}</h1>
            {header.subtitle && <h3 className="text-muted">{header.subtitle}</h3>}
            {header.description && <p className="lead">{header.description}</p>}
          </div>
        )}
        
        {/* Services */}
        {services && Array.isArray(services) && services.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Our Services</h3>
            <div className="row">
              {services.map((service, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{service.title}</h5>
                      <p className="card-text">{service.description}</p>
                      {service.features && (
                        <div className="mb-3">
                          <strong>Features:</strong>
                          <ul>
                            {service.features.split(',').map((feature, idx) => (
                              <li key={idx}>{feature.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {service.price && (
                        <div className="text-primary">
                          <strong>{service.price}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Process */}
        {process && Array.isArray(process) && process.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Our Process</h3>
            <div className="row">
              {process.map((step, index) => (
                <div key={index} className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="badge bg-primary rounded-circle p-3 mb-3">
                      {step.step}
                    </div>
                    <h5>{step.title}</h5>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContactPreview = () => {
    const { header, contactInfo, locations } = pageData.sections;
    
    return (
      <div>
        {/* Header */}
        {header && (
          <div className="mb-5">
            <h1>{header.title}</h1>
            {header.subtitle && <h3 className="text-muted">{header.subtitle}</h3>}
            {header.description && <p className="lead">{header.description}</p>}
          </div>
        )}
        
        {/* Contact Info */}
        {contactInfo && (
          <div className="mb-5">
            <h3 className="mb-4">Contact Information</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    {contactInfo.phone && <p><strong>Phone:</strong> {contactInfo.phone}</p>}
                    {contactInfo.email && <p><strong>Email:</strong> {contactInfo.email}</p>}
                    {contactInfo.address && <p><strong>Address:</strong> {contactInfo.address}</p>}
                    {contactInfo.hours && <p><strong>Hours:</strong> {contactInfo.hours}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Locations */}
        {locations && Array.isArray(locations) && locations.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-4">Our Locations</h3>
            <div className="row">
              {locations.map((location, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{location.name}</h5>
                      <p>{location.address}</p>
                      {location.phone && <p><strong>Phone:</strong> {location.phone}</p>}
                      {location.email && <p><strong>Email:</strong> {location.email}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye className="me-2" />
          Preview: {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* Device View Toggle */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div className="btn-group" role="group">
            {deviceButtons.map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={deviceView === key ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setDeviceView(key)}
              >
                <Icon className="me-1" />
                {label}
              </Button>
            ))}
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.open(getPreviewUrl(), '_blank')}
          >
            <FaExternalLinkAlt className="me-1" />
            Open in New Tab
          </Button>
        </div>
        
        {/* Preview Container */}
        <div 
          className="d-flex justify-content-center align-items-start p-3"
          style={{ 
            backgroundColor: '#f8f9fa',
            minHeight: '500px',
            overflow: 'auto'
          }}
        >
          <div style={getIframeStyles()}>
            {loading && (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" />
              </div>
            )}
            
            {/* For demo purposes, show simplified preview */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: 'white',
              overflow: 'auto',
              padding: deviceView === 'mobile' ? '10px' : '20px'
            }}>
              {renderPreviewContent()}
            </div>
            
            {/* In production, use an iframe */}
            {/* 
            <iframe
              src={getPreviewUrl()}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: deviceView === 'desktop' ? '6px' : '16px'
              }}
              onLoad={handleIframeLoad}
              title={`Preview of ${title}`}
            />
            */}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <small className="text-muted me-auto">
          This is a simplified preview. The actual page will have full styling and functionality.
        </small>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PagePreview;