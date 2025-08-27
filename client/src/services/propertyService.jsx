// services/propertyService.js
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('smartaquar_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to get auth headers for file upload (no Content-Type)
const getFileUploadHeaders = () => {
  const token = localStorage.getItem('smartaquar_token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const propertyService = {
  // Get all properties with filters and pagination
  async getProperties({
    page = 1,
    limit = 12,
    type = '',
    status = '',
    search = '',
    minPrice = '',
    maxPrice = '',
    sortBy = 'addedDate',
    sortOrder = 'desc'
  } = {}) {
    const params = new URLSearchParams();
    
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (type && type !== 'all') params.append('type', type);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const response = await fetch(`${API_BASE_URL}/properties?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Get property by ID
  async getPropertyById(id) {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Upload single image
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/upload/property-image`, {
        method: 'POST',
        headers: getFileUploadHeaders(),
        body: formData
      });

      const data = await handleResponse(response);

      return {
        success: true,
        imagePath: data.data.imagePath,
        data: data.data
      };
    } catch (error) {
      console.error('Upload image error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload image'
      };
    }
  },

  // Upload multiple images
  async uploadImages(imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/property-images`, {
        method: 'POST',
        headers: getFileUploadHeaders(),
        body: formData
      });

      const data = await handleResponse(response);

      return {
        success: true,
        images: data.data.images,
        data: data.data
      };
    } catch (error) {
      console.error('Upload images error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload images'
      };
    }
  },

  // Delete image
  async deleteImage(filename) {
    try {
      // Extract filename from path if full path is provided
      const actualFilename = filename.includes('/') ? filename.split('/').pop() : filename;

      const response = await fetch(`${API_BASE_URL}/upload/property-image/${actualFilename}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await handleResponse(response);

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Delete image error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete image'
      };
    }
  },

  // Create new property with image upload
  async createProperty(propertyData) {
    try {
      let imagePaths = [];
      
      // Handle image uploads if files are provided
      if (propertyData.imageFiles && propertyData.imageFiles.length > 0) {
        const uploadResult = await this.uploadImages(propertyData.imageFiles);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Failed to upload images');
        }
        
        imagePaths = uploadResult.images.map(img => img.imagePath);
      }

      // Prepare property data
      const dataToSend = {
        ...propertyData,
        images: imagePaths
      };

      // Remove imageFiles from the data to send
      delete dataToSend.imageFiles;

      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend)
      });

      const data = await handleResponse(response);

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Create property error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create property'
      };
    }
  },

  // Update property with image management
  async updateProperty(id, propertyData) {
    try {
      let newImagePaths = [];
      
      // Handle new image uploads if files are provided
      if (propertyData.imageFiles && propertyData.imageFiles.length > 0) {
        const uploadResult = await this.uploadImages(propertyData.imageFiles);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Failed to upload new images');
        }
        
        newImagePaths = uploadResult.images.map(img => img.imagePath);
      }

      // Combine existing images with new ones
      const existingImages = propertyData.existingImages || [];
      const allImages = [...existingImages, ...newImagePaths];

      // Prepare property data
      const dataToSend = {
        ...propertyData,
        images: allImages
      };

      // Remove file-related fields from the data to send
      delete dataToSend.imageFiles;
      delete dataToSend.existingImages;
      delete dataToSend.removedImages;

      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend)
      });

      const data = await handleResponse(response);

      // Clean up removed images if update was successful
      if (propertyData.removedImages && propertyData.removedImages.length > 0) {
        await Promise.all(propertyData.removedImages.map(path => this.deleteImage(path)));
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Update property error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update property'
      };
    }
  },

  // Delete property
  async deleteProperty(id) {
    try {
      // First get the property to access its images
      const propertyResult = await this.getPropertyById(id);
      
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await handleResponse(response);

      // Clean up associated images after successful deletion
      if (propertyResult.success && propertyResult.data.images) {
        await Promise.all(
          propertyResult.data.images.map(imagePath => this.deleteImage(imagePath))
        );
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Delete property error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete property'
      };
    }
  },

  // Get property statistics
  async getPropertyStats() {
    const response = await fetch(`${API_BASE_URL}/properties/stats/overview`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  // Get image URL for display
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /, it's a relative path from the server
    if (imagePath.startsWith('/')) {
      const baseUrl = API_BASE_URL.replace('/api/v1', '');
      return `${baseUrl}${imagePath}`;
    }
    
    // Otherwise, assume it's a filename in the uploads directory
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}/uploads/properties/${imagePath}`;
  }
};

// Authentication service
export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await handleResponse(response);
    
    if (data.success && data.token) {
      localStorage.setItem('smartaquar_token', data.token);
      localStorage.setItem('smartaquar_user', JSON.stringify(data.user));
    }

    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    return handleResponse(response);
  },

  logout() {
    localStorage.removeItem('smartaquar_token');
    localStorage.removeItem('smartaquar_user');
  },

  getUser() {
    const user = localStorage.getItem('smartaquar_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('smartaquar_token');
  },

  getToken() {
    return localStorage.getItem('smartaquar_token');
  },

  // Helper method to set token if obtained from elsewhere
  setToken(token, user = null) {
    localStorage.setItem('smartaquar_token', token);
    if (user) {
      localStorage.setItem('smartaquar_user', JSON.stringify(user));
    }
  }
};