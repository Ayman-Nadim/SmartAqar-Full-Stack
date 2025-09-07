// components/PropertyViewModal.jsx - Code complet
import React, { useState } from 'react';
import { propertyService } from '../services/propertyService';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Home,
  Building2,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';

const PropertyViewModal = ({ 
  property, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !property) return null;

  const getTypeIcon = (type) => {
    switch(type) {
      case 'villa': return <Home className="h-5 w-5" />;
      case 'apartment': return <Building2 className="h-5 w-5" />;
      case 'house': return <Home className="h-5 w-5" />;
      case 'commercial': return <Store className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'sold': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'sold': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(price).replace('MAD', 'DH');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const hasImages = property.images && property.images.length > 0;

  // Debug: Log des informations d'image
  if (hasImages) {
    console.log('Modal - Property images:', property.images);
    console.log('Modal - Current image path:', property.images[currentImageIndex]);
    console.log('Modal - Generated URL:', propertyService.getImageUrl(property.images[currentImageIndex]));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {/* Image Gallery */}
          <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-100 to-cyan-100">
            {hasImages ? (
              <>
                <img
                  src={propertyService.getImageUrl(property.images[currentImageIndex])}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Modal - Image failed to load:', e.target.src);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMzUgMTIwSDI2NVYxNTBIMjM1VjEyMFpNMjA1IDE1MEgyMzVWMTgwSDIwNVYxNTBaTTI2NSAxNTBIMjk1VjE4MEgyNjVWMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                  onLoad={() => {
                    console.log('Modal - Image loaded successfully:', property.images[currentImageIndex]);
                  }}
                />
                
                {/* Navigation des images */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Indicateurs de pagination */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {getTypeIcon(property.type)}
                  <p className="text-gray-600 mt-2">No Image Available</p>
                </div>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                {getStatusIcon(property.status)}
                <span className="ml-2 capitalize">{property.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {getTypeIcon(property.type)}
                <span className="text-sm text-gray-600 capitalize">{property.type}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-6">
            <MapPin className="h-5 w-5 mr-2" />
            <span className="text-lg">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {property.bedrooms > 0 && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-lg font-semibold">{property.bedrooms}</p>
                <p className="text-sm text-gray-600">Bedrooms</p>
              </div>
            )}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-lg font-semibold">{property.bathrooms}</p>
              <p className="text-sm text-gray-600">Bathrooms</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-lg font-semibold">{property.area}</p>
              <p className="text-sm text-gray-600">m²</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-lg font-semibold">{formatDate(property.addedDate || property.updatedDate)}</p>
              <p className="text-sm text-gray-600">Added</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery Thumbnails */}
          {hasImages && property.images.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Gallery ({property.images.length} images)</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={propertyService.getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg2MFY2MEg0MFY0MFpNMzAgNjBINDBWODBIMzBWNjBaTTYwIDYwSDcwVjgwSDYwVjYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Property Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Property ID</h4>
                <p className="text-gray-900">{property._id}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Status</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {getStatusIcon(property.status)}
                  <span className="ml-1 capitalize">{property.status}</span>
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Property Type</h4>
                <p className="text-gray-900 capitalize">{property.type}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Added Date</h4>
                <p className="text-gray-900">{formatDate(property.addedDate)}</p>
              </div>
              {property.updatedDate && property.updatedDate !== property.addedDate && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Last Updated</h4>
                  <p className="text-gray-900">{formatDate(property.updatedDate)}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Price per m²</h4>
                <p className="text-gray-900">{formatPrice(Math.round(property.price / property.area))} / m²</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(property);
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Property</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
                    onDelete(property);
                    onClose();
                  }
                }}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyViewModal;