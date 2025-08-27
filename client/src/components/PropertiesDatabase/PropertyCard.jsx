// components/PropertyCard.js
import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Store, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Camera 
} from 'lucide-react';

const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'villa': return <Home className="h-4 w-4" />;
      case 'apartment': return <Building2 className="h-4 w-4" />;
      case 'house': return <Home className="h-4 w-4" />;
      case 'commercial': return <Store className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
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
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'sold': return <XCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
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

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const hasImages = property.images && property.images.length > 0;

  const handleView = (e) => {
    e.stopPropagation(); // Empêche le clic sur la carte parent
    if (onView) onView(property);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(property);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(property);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={handleView}
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gradient-to-r from-blue-100 to-cyan-100">
        {hasImages ? (
          <>
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMzUgMTIwSDI2NVYxNTBIMjM1VjEyMFpNMjA1IDE1MEgyMzVWMTgwSDIwNVYxNTBaTTI2NSAxNTBIMjk1VjE4MEgyNjVWMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
              }}
            />
            
            {/* Navigation des images */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Indicateurs de pagination */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
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
              <p className="text-sm text-gray-600 mt-2">No Image</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {getStatusIcon(property.status)}
            <span className="ml-1 capitalize">{property.status}</span>
          </span>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium capitalize">
            {property.type}
          </span>
        </div>

        {/* Images Count Badge */}
        {hasImages && property.images.length > 1 && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
              <Camera className="h-3 w-3" />
              <span>{property.images.length}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(property.price)}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area}m²</span>
          </div>
        </div>

        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(property.addedDate || property.updatedDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleView}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit property"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete property"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;