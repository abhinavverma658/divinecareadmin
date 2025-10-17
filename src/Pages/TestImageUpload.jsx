import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import FormField from '../Components/FormField';

const TestImageUpload = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TestImageUpload] ${message}`);
  };

  const handleImageChange = (e) => {
    const newValue = e.target.value;
    addLog(`Image change detected: ${newValue ? newValue.substring(0, 50) + '...' : 'empty'}`);
    setImageUrl(newValue);
  };

  const clearImage = () => {
    addLog('Clearing image manually');
    setImageUrl('');
  };

  const setDemoImage = () => {
    const demoUrl = 'https://picsum.photos/400/300?random=' + Date.now();
    addLog(`Setting demo image: ${demoUrl}`);
    setImageUrl(demoUrl);
  };

  return (
    <Container fluid className="p-4">
      <h2>🖼️ Image Upload Test Component</h2>
      
      <Row>
        <Col md={6}>
          <h4>Upload Component</h4>
          <FormField
            type="image"
            name="testImage"
            label="Test Image Upload"
            value={imageUrl}
            onChange={handleImageChange}
            required={true}
          />
          
          <div className="mt-3">
            <Button onClick={setDemoImage} variant="secondary" className="me-2">
              Set Demo Image
            </Button>
            <Button onClick={clearImage} variant="outline-danger">
              Clear Image
            </Button>
          </div>
        </Col>
        
        <Col md={6}>
          <h4>Debug Info</h4>
          <div className="border p-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
            <p><strong>Current imageUrl value:</strong></p>
            <code>{imageUrl || '(empty)'}</code>
            
            <p className="mt-3"><strong>Debug Log:</strong></p>
            {debugLog.map((log, index) => (
              <div key={index} className="small text-muted">{log}</div>
            ))}
            {debugLog.length === 0 && <div className="text-muted">No events yet...</div>}
          </div>
          
          <h4 className="mt-4">Manual Preview</h4>
          <div className="border p-3">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Manual preview" 
                style={{maxWidth: '100%', maxHeight: '200px'}}
                onError={(e) => {
                  addLog('Manual preview image failed to load');
                  e.target.style.display = 'none';
                }}
                onLoad={() => addLog('Manual preview image loaded successfully')}
              />
            ) : (
              <div className="text-muted">No image to preview</div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TestImageUpload;