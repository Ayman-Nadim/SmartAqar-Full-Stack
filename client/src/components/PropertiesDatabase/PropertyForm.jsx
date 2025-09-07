// components/PropertyForm.js - Version finale compatible avec le service adapté
import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { propertyService } from '../services/propertyService';

const PropertyForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  property = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    status: 'available',
    features: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form with property data when editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        type: property.type || '',
        price: property.price || '',
        location: property.location || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || '',
        description: property.description || '',
        status: property.status || 'available',
        features: property.features || []
      });
      
      // Pour l'édition, on garde les URLs existantes
      const existingImageUrls = property.images || [];
      setExistingImages(existingImageUrls);
      setSelectedImages(existingImageUrls.map(url => propertyService.getImageUrl(url)));
      setImageFiles([]);
    } else {
      // Reset form for new property
      setFormData({
        title: '',
        type: '',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        description: '',
        status: 'available',
        features: []
      });
      setSelectedImages([]);
      setImageFiles([]);
      setExistingImages([]);
    }
    setErrors({});
    setImageError('');
  }, [property, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Property type is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.bathrooms || formData.bathrooms <= 0) {
      newErrors.bathrooms = 'Number of bathrooms is required';
    }
    if (!formData.area || formData.area <= 0) {
      newErrors.area = 'Area is required';
    }

    // Image validation for new properties
    if (!property && imageFiles.length === 0 && existingImages.length === 0) {
      setImageError('At least one image is required');
    } else {
      setImageError('');
    }

    // Validate image files
    if (imageFiles.length > 0) {
      const validation = propertyService.validateImageFiles(imageFiles);
      if (!validation.valid) {
        setImageError(validation.error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !imageError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Créer FormData
      const formDataToSend = new FormData();
      
      // Ajouter les données de base
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('price', parseInt(formData.price));
      formDataToSend.append('location', formData.location);
      formDataToSend.append('bedrooms', parseInt(formData.bedrooms) || 0);
      formDataToSend.append('bathrooms', parseInt(formData.bathrooms));
      formDataToSend.append('area', parseInt(formData.area));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('features', JSON.stringify(formData.features));

      // Ajouter les nouvelles images (fichiers)
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Pour l'édition: ajouter les images existantes à conserver
      if (property && existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages));
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) {
      return;
    }

    // Validation immédiate
    const validation = propertyService.validateImageFiles(files);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }

    // Vérifier le total d'images (existantes + nouvelles)
    if (existingImages.length + files.length > 3) {
      setImageError('Maximum 3 images allowed in total');
      return;
    }
    
    setImageError('');
    setImageFiles(files);
    
    // Créer des URLs pour l'aperçu
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages([...existingImages.map(url => propertyService.getImageUrl(url)), ...imageUrls]);
  };

  const removeImage = (indexToRemove) => {
    const totalImages = existingImages.length + imageFiles.length;
    
    if (indexToRemove < existingImages.length) {
      // Supprimer une image existante
      const newExistingImages = existingImages.filter((_, index) => index !== indexToRemove);
      setExistingImages(newExistingImages);
    } else {
      // Supprimer une nouvelle image
      const fileIndex = indexToRemove - existingImages.length;
      const newFiles = Array.from(imageFiles).filter((_, index) => index !== fileIndex);
      setImageFiles(newFiles);
    }
    
    // Mettre à jour l'aperçu
    const newSelectedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setSelectedImages(newSelectedImages);
    
    if (newSelectedImages.length === 0 && !property) {
      setImageError('At least one image is required');
    } else {
      setImageError('');
    }
  };

  const handleFeatureAdd = (feature) => {
    if (feature.trim() && !formData.features.includes(feature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
    }
  };

  const handleFeatureRemove = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter property title..."
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select type...</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="commercial">Commercial</option>
                </select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                )}
              </div>
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (DH) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter price..."
                  disabled={isLoading}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter location..."
                  disabled={isLoading}
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Number of bedrooms..."
                  disabled={isLoading}
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Number of bathrooms..."
                  disabled={isLoading}
                />
                {errors.bathrooms && (
                  <p className="text-red-600 text-sm mt-1">{errors.bathrooms}</p>
                )}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (m²) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Area in square meters..."
                  disabled={isLoading}
                />
                {errors.area && (
                  <p className="text-red-600 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images {!property && '*'}
                <span className="text-xs text-gray-500 ml-1">
                  (Max 3 images, 10MB each)
                  {existingImages.length > 0 && ` - ${existingImages.length} existing`}
                </span>
              </label>
              
              {existingImages.length + imageFiles.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, GIF, WebP up to 10MB each
                      ({3 - existingImages.length - imageFiles.length} slots remaining)
                    </p>
                  </label>
                </div>
              )}

              {imageError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{imageError}</p>
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Images ({selectedImages.length}/3)
                    {existingImages.length > 0 && ` - ${existingImages.length} existing, ${imageFiles.length} new`}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg2MFY2MEg0MFY0MFpNMzAgNjBINDBWODBIMzBWNjBaTTYwIDYwSDcwVjgwSDYwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                          {index + 1}
                          {index < existingImages.length && (
                            <span className="ml-1 text-green-300">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Property description..."
                disabled={isLoading}
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Add a feature and press Enter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFeatureAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={isLoading}
                />
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(feature)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;