// services/propertyService.js - Version adaptée pour FormData upload direct
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
    // Pas de Content-Type pour FormData
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

  // Create new property - ADAPTÉ pour utiliser FormData directement
  async createProperty(formData) {
    try {
      console.log('Creating property with FormData');

      // Si c'est un objet JavaScript, le convertir en FormData
      if (!(formData instanceof FormData)) {
        const form = new FormData();
        
        // Ajouter tous les champs texte
        Object.keys(formData).forEach(key => {
          if (key === 'images') {
            // Gérer les images
            if (Array.isArray(formData[key])) {
              formData[key].forEach(file => {
                if (file instanceof File) {
                  form.append('images', file);
                }
              });
            }
          } else if (key === 'features') {
            // Sérialiser les features en JSON
            form.append('features', JSON.stringify(formData[key]));
          } else {
            form.append(key, formData[key]);
          }
        });
        
        formData = form;
      }

      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: getFileUploadHeaders(),
        body: formData
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

  // Update property - ADAPTÉ pour utiliser FormData directement
  async updateProperty(id, formData) {
    try {
      console.log('Updating property with FormData');

      // Si c'est un objet JavaScript, le convertir en FormData
      if (!(formData instanceof FormData)) {
        const form = new FormData();
        
        // Ajouter tous les champs texte
        Object.keys(formData).forEach(key => {
          if (key === 'images') {
            // Gérer les nouvelles images (fichiers)
            if (Array.isArray(formData[key])) {
              formData[key].forEach(file => {
                if (file instanceof File) {
                  form.append('images', file);
                }
              });
            }
          } else if (key === 'existingImages') {
            // Gérer les images existantes à conserver
            form.append('existingImages', JSON.stringify(formData[key]));
          } else if (key === 'features') {
            // Sérialiser les features en JSON
            form.append('features', JSON.stringify(formData[key]));
          } else if (key !== 'imageFiles') { // Exclure imageFiles s'il existe
            form.append(key, formData[key]);
          }
        });
        
        formData = form;
      }

      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'PUT',
        headers: getFileUploadHeaders(),
        body: formData
      });

      const data = await handleResponse(response);

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
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await handleResponse(response);

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
  },

  // MÉTHODES UTILITAIRES POUR L'UPLOAD D'IMAGES (optionnelles)
  
  // Upload single image - pour usage futur si nécessaire
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

  // Upload multiple images - pour usage futur si nécessaire
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

  // Validate file before upload
  validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    return { valid: true };
  },

  // Validate multiple files
  validateImageFiles(files) {
    if (!files || files.length === 0) {
      return { valid: false, error: 'No files provided' };
    }

    if (files.length > 3) {
      return { valid: false, error: 'Maximum 3 images allowed' };
    }

    for (let file of files) {
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }
};

// Authentication service - inchangé
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

  setToken(token, user = null) {
    localStorage.setItem('smartaquar_token', token);
    if (user) {
      localStorage.setItem('smartaquar_user', JSON.stringify(user));
    }
  }
};