import React, { useState, useRef } from 'react';
import { uploadImage, validateImageFile, createImagePreview } from '../../utils/imageUpload';
import { getImageUrl } from '../../utils/imageUtils';
import './ImageUpload.css';

const ImageUpload = ({ 
  currentImage = '', 
  onImageChange, 
  label = 'Upload Image',
  required = false 
}) => {
  const [uploading, setUploading] = useState(false);
  // Construct proper image path for preview if currentImage is just a filename
  const getImagePath = (image) => {
    return getImageUrl(image);
  };
  
  const [preview, setPreview] = useState(getImagePath(currentImage));
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    try {
      // Validate file
      validateImageFile(file);
      
      // Create preview
      const previewUrl = createImagePreview(file);
      setPreview(previewUrl);
      
      // Upload to server
      setUploading(true);
      const imageUrl = await uploadImage(file);
      
      // Update parent component
      onImageChange(imageUrl);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      setPreview(imageUrl);
      
    } catch (error) {
      alert(error.message);
      setPreview(getImagePath(currentImage));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">
        {label} {required && '*'}
      </label>
      
      <div 
        className={`image-upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {preview ? (
          <div className="image-preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="image-preview"
            />
            <div className="image-overlay">
              <div className="image-actions">
                <button 
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  disabled={uploading}
                >
                  📁 Change
                </button>
                <button 
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={uploading}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            {uploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>Uploading image...</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p className="upload-text">
                  Click to select or drag & drop an image
                </p>
                <p className="upload-hint">
                  JPEG, PNG, WebP up to 2MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload;
