import React from 'react';
import { Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import FormField from './FormField';
import TextEditor from './TextEditor';
import { FaPlus, FaTrash, FaImage, FaLink } from 'react-icons/fa';

const SectionEditor = ({ 
  sectionKey, 
  sectionConfig, 
  sectionData, 
  onChange, 
  onAddItem, 
  onRemoveItem 
}) => {

  const renderField = (field, value, onFieldChange, index = null) => {
    const fieldValue = value || '';
    
    switch (field.type) {
      case 'richtext':
        return (
          <div className="mb-3">
            <label className="form-label">
              {field.label} {field.required && <span className="text-danger">*</span>}
            </label>
            <TextEditor
              description={fieldValue}
              onChange={(text) => onFieldChange(field.name, text)}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <FormField
            type="textarea"
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={field.name === 'description' ? 4 : 3}
          />
        );
        
      case 'color':
        return (
          <Form.Group className="mb-3">
            <Form.Label>
              {field.label} {field.required && <span className="text-danger">*</span>}
            </Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="color"
                value={fieldValue || '#007bff'}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                style={{ width: '60px', marginRight: '10px' }}
              />
              <Form.Control
                type="text"
                value={fieldValue || '#007bff'}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                placeholder="#007bff"
              />
            </div>
          </Form.Group>
        );
        
      case 'number':
        return (
          <FormField
            type="number"
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.name, parseInt(e.target.value) || 0)}
            required={field.required}
            min={field.min || 0}
            max={field.max}
          />
        );
        
      case 'url':
      case 'text':
      case 'email':
      case 'tel':
        return (
          <FormField
            type={field.type === 'url' ? 'text' : field.type}
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder || field.label}
          />
        );
        
      default:
        return (
          <FormField
            type="text"
            name={field.name}
            label={field.label}
            value={fieldValue}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  const renderArraySection = () => {
    const items = Array.isArray(sectionData) ? sectionData : [];
    
    return (
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{sectionConfig.title}</h5>
            {sectionConfig.description && (
              <small className="text-muted">{sectionConfig.description}</small>
            )}
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onAddItem(sectionKey)}
          >
            <FaPlus className="me-1" />
            Add {sectionConfig.itemName || 'Item'}
          </Button>
        </Card.Header>
        <Card.Body>
          {items.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaPlus size={20} className="mb-2" />
              <div>No {sectionConfig.itemName?.toLowerCase() || 'items'} added yet.</div>
              <small>Click "Add {sectionConfig.itemName || 'Item'}" to get started.</small>
            </Alert>
          ) : (
            items.map((item, index) => (
              <Card key={index} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    {sectionConfig.itemName || 'Item'} {index + 1}
                    {item.title && `: ${item.title}`}
                    {item.name && `: ${item.name}`}
                  </h6>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRemoveItem(sectionKey, index)}
                  >
                    <FaTrash />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {sectionConfig.fields.map((field) => {
                      const colSize = getFieldColumnSize(field);
                      return (
                        <Col key={field.name} {...colSize}>
                          {renderField(
                            field,
                            item[field.name],
                            (fieldName, value) => onChange(sectionKey, fieldName, value, index)
                          )}
                        </Col>
                      );
                    })}
                  </Row>
                  
                  {/* Preview for image fields */}
                  {item.image && (
                    <div className="mt-3">
                      <small className="text-muted">Image Preview:</small>
                      <div className="mt-1">
                        <img
                          src={item.image}
                          alt="Preview"
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '100px', 
                            objectFit: 'cover',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderObjectSection = () => {
    const data = sectionData || {};
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{sectionConfig.title}</h5>
          {sectionConfig.description && (
            <small className="text-muted">{sectionConfig.description}</small>
          )}
        </Card.Header>
        <Card.Body>
          <Row>
            {sectionConfig.fields.map((field) => {
              const colSize = getFieldColumnSize(field);
              return (
                <Col key={field.name} {...colSize}>
                  {renderField(
                    field,
                    data[field.name],
                    (fieldName, value) => onChange(sectionKey, fieldName, value)
                  )}
                </Col>
              );
            })}
          </Row>
          
          {/* Special handling for specific field types */}
          {data.backgroundImage && (
            <div className="mt-3">
              <small className="text-muted">Background Image Preview:</small>
              <div className="mt-1">
                <img
                  src={data.backgroundImage}
                  alt="Background Preview"
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '150px', 
                    objectFit: 'cover',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          
          {data.backgroundColor && (
            <div className="mt-3">
              <small className="text-muted">Background Color Preview:</small>
              <div 
                className="mt-1"
                style={{
                  width: '100px',
                  height: '30px',
                  backgroundColor: data.backgroundColor,
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const getFieldColumnSize = (field) => {
    if (field.type === 'textarea' || field.type === 'richtext') {
      return { md: 12 };
    }
    if (field.type === 'color') {
      return { md: 6, lg: 4 };
    }
    if (field.name === 'description' || field.name === 'bio') {
      return { md: 12 };
    }
    return { md: 6 };
  };

  return sectionConfig.type === 'array' ? renderArraySection() : renderObjectSection();
};

export default SectionEditor;