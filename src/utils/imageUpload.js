import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Upload image to backend (Cloudinary)
export const uploadImage = async (file) => {
  try {
    const token = localStorage.getItem('token');
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload to backend
    const response = await axios.post(
      API_ENDPOINTS.IMAGE_UPLOAD,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Return the image URL from Cloudinary
    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// Image validation
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload only JPEG, PNG, or WebP images');
  }
  
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 2MB');
  }
  
  return true;
};

// Create image preview URL
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};
