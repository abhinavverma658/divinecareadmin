import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaUpload, FaTrash, FaImage, FaEye } from 'react-icons/fa';
import { useUploadImageMutation } from '../features/apiSlice';
import { getError } from '../utils/error';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '../features/authSlice';

const ImageUpload = ({ 
  value, 
  onChange, 
  label = "Upload Image", 
  required = false,
  multiple = false,
  maxSize = 5, // MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  previewHeight = '200px',
  showPreview = true
}) => {
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const { token } = useSelector(selectAuth);
  const fileInputRef = useRef();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleFileSelect = async (files) => {
    const validFiles = [];
    
    for (let file of files) {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Please upload: ${acceptedTypes.join(', ')}`);
        continue;
      }
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size: ${maxSize}MB`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    try {
      if (token && token.startsWith("demo-token")) {
        // Demo mode - simulate upload with FileReader
        await handleDemoUpload(validFiles);
      } else {
        // Real upload
        await handleRealUpload(validFiles);
      }
    } catch (error) {
      getError(error);
    }
  };

  // Demo mode upload simulation
  const handleDemoUpload = async (files) => {
    for (let file of files) {
      setUploadProgress(30);
      
      console.log('🎭 Demo upload started for:', file.name);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 200);
      
      // Create preview URL from actual file
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        console.log('📸 Demo upload - file converted to base64, length:', imageUrl.length);
        
        // Simulate server response
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          if (multiple) {
            const currentUrls = Array.isArray(value) ? value : [];
            onChange([...currentUrls, imageUrl]);
          } else {
            console.log('🔄 Demo upload - setting new image URL');
            onChange(imageUrl);
          }
          
          toast.success(`Demo upload completed: ${file.name}`);
          setUploadProgress(0);
        }, 500);
      };
      
      reader.onerror = () => {
        console.error('❌ Demo upload - FileReader error');
        clearInterval(progressInterval);
        setUploadProgress(0);
        toast.error(`Demo upload failed for: ${file.name}`);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Real upload to server
  const handleRealUpload = async (files) => {
    for (let file of files) {
      const formData = new FormData();
      formData.append('files', file); // Use 'files' key for backend
      formData.append('folder', 'website-pages'); // Organize uploads

      setUploadProgress(10);

      try {
        console.log('Starting upload for:', file.name);
        const data = await uploadImage(formData).unwrap();
        console.log('Upload response:', data);

        let imageUrl = null;

        // DivineCare backend returns { success, files: [{ url, public_id }] }
        if (data?.success && Array.isArray(data.files) && data.files[0]?.url) {
          imageUrl = data.files[0].url;
          console.log('📸 Upload success - using data.files[0].url:', imageUrl.substring(0, 50) + '...');
        } else if (data?.success && data?.imageUrl) {
          imageUrl = data.imageUrl;
          console.log('📸 Upload success - using data.imageUrl:', imageUrl.substring(0, 50) + '...');
        } else if (data?.url) {
          imageUrl = data.url;
          console.log('📸 Upload success - using data.url:', imageUrl.substring(0, 50) + '...');
        } else if (data?.data?.url) {
          imageUrl = data.data.url;
          console.log('📸 Upload success - using data.data.url:', imageUrl.substring(0, 50) + '...');
        } else if (data?.filePath) {
          imageUrl = data.filePath;
          console.log('📸 Upload success - using data.filePath:', imageUrl.substring(0, 50) + '...');
        }

        if (imageUrl) {
          console.log('🔄 Setting new image URL in component state');
          if (multiple) {
            const currentUrls = Array.isArray(value) ? value : [];
            onChange([...currentUrls, imageUrl]);
          } else {
            onChange(imageUrl);
          }

          toast.success(`Image uploaded successfully: ${file.name}`);
          setUploadProgress(100);

          // Reset progress after a short delay
          setTimeout(() => setUploadProgress(0), 1000);
        } else {
          console.error('Upload response missing imageUrl:', data);
          throw new Error('Upload completed but no image URL received. Please try again.');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadProgress(0);
        toast.error(`Upload failed for ${file.name}: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(Array.from(e.target.files));
    }
  };

  // Remove image
  const removeImage = (indexOrUrl) => {
    if (multiple) {
      const currentUrls = Array.isArray(value) ? value : [];
      const newUrls = currentUrls.filter((_, index) => index !== indexOrUrl);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  // Preview modal
  const openPreview = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const renderImagePreview = (imageUrl, index = null) => (
    <div className="position-relative d-inline-block me-2 mb-2" key={index || 'single'}>
      <Card style={{ width: '150px' }}>
        <Card.Img 
          variant="top" 
          src={imageUrl} 
          style={{ height: previewHeight, objectFit: 'cover' }}
          alt="Preview"
          onError={(e) => {
            console.log('Image preview error for:', imageUrl);
            e.target.src = 'https://via.placeholder.com/150x200/f8f9fa/6c757d?text=Image+Error';
          }}
        />
        <Card.Body className="p-2">
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => openPreview(imageUrl)}
            >
              <FaEye />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => removeImage(multiple ? index : imageUrl)}
            >
              <FaTrash />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const hasImages = multiple ? (Array.isArray(value) && value.length > 0) : !!value;
  const imageUrls = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  return (
    <div className="mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Card.Body className="text-center py-4">
          {isLoading || uploadProgress > 0 ? (
            <div>
              <Spinner animation="border" variant="primary" className="mb-2" />
              <div>Uploading... {uploadProgress}%</div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress mt-2">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <FaUpload size={40} className="text-muted mb-3" />
              <h6>Drop files here or click to browse</h6>
              <p className="text-muted small mb-3">
                Maximum size: {maxSize}MB each
                {multiple && <><br />Multiple files allowed</>}
              </p>
              <Button 
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload className="me-1" />
                Select {multiple ? 'Files' : 'File'}
              </Button>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </Card.Body>
      </Card>
      
      {/* Validation Message */}
      {required && !hasImages && (
        <div className="text-danger small mt-1">
          {label} is required
        </div>
      )}
      
      {/* Help Text */}
      <div className="text-muted small mt-1">
        {multiple ? 'You can upload multiple images' : 'Upload a single image'}. 
        Drag and drop supported.
      </div>

      {/* Current Images Preview */}
      {hasImages && showPreview && (
        <div className="mt-3">
          <label className="form-label">Current Images:</label>
          <div className="d-flex flex-wrap">
            {imageUrls.map((imageUrl, index) => 
              renderImagePreview(imageUrl, multiple ? index : null)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;