import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Upload,
  CheckCircle, 
  XCircle, 
  Clock, 
  Home,
  AlertCircle,
  Loader
} from 'lucide-react';

// Import your existing components and service
import { propertyService } from '../services/propertyService'; // Your original service
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyFilters from './PropertyFilters';
import PropertyViewModal from './PropertyViewModal';
import PropertyImportModal from './PropertyImportModal'; // New import

const PropertyCatalog = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    pending: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'addedDate',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // New state
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load properties when filters change
  useEffect(() => {
    loadProperties();
  }, [filters]);

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading properties with filters:', filters);
      
      const response = await propertyService.getProperties(filters);
      
      console.log('API Response:', response);
      
      if (response.success) {
        setProperties(response.data.properties || []);
        setPagination(response.data.pagination || {});
        
        console.log('Properties loaded:', response.data.properties?.length || 0);
        console.log('Pagination info:', response.data.pagination);
        
        // Update stats from response if available
        if (response.data.stats) {
          setStats({
            total: response.data.stats.total || 0,
            available: response.data.stats.available || 0,
            sold: response.data.stats.sold || 0,
            pending: response.data.stats.pending || 0
          });
        }
      } else {
        console.error('API Error:', response.message);
        setError(response.message || 'Failed to load properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await propertyService.getPropertyStats();
      if (response.success && response.data.overview) {
        setStats({
          total: response.data.overview.total || 0,
          available: response.data.overview.availableCount || 0,
          sold: response.data.overview.soldCount || 0,
          pending: response.data.overview.pendingCount || 0
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Don't show error for stats, just log it
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters({
      ...newFilters,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const handleAddProperty = async (propertyData) => {
    try {
      setFormLoading(true);
      setError('');
      
      console.log('Creating property with data:', propertyData);
      
      // Use the property service to create property with image upload
      const response = await propertyService.createProperty(propertyData);
      
      if (response.success) {
        console.log('Property created successfully:', response.data);
        setShowAddModal(false);
        await loadProperties(); // Reload properties
        await loadStats(); // Reload stats
      } else {
        console.error('Failed to create property:', response.message);
        setError(response.message || 'Failed to create property');
        throw new Error(response.message || 'Failed to create property');
      }
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
      throw err; // Re-throw to be handled by the form
    } finally {
      setFormLoading(false);
    }
  };

  // NEW: Handle bulk import of properties
  const handleImportProperties = async (propertiesData) => {
    try {
      setFormLoading(true);
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process properties in batches
      for (const property of propertiesData) {
        try {
          console.log('Importing property:', property.title);
          const response = await propertyService.createProperty(property);
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${property.title}: ${response.message || 'Unknown error'}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`${property.title}: ${error.message}`);
        }
      }

      // Refresh data
      await loadProperties();
      await loadStats();
      
      // Show appropriate notification
      if (successCount > 0 && errorCount === 0) {
        alert(`Successfully imported ${successCount} properties!`);
      } else if (successCount > 0 && errorCount > 0) {
        alert(`Imported ${successCount} properties. ${errorCount} failed.`);
      } else {
        alert('Failed to import properties. Please check your data and try again.');
      }

    } catch (error) {
      console.error('Import properties error:', error);
      alert('There was an error importing the properties. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProperty = async (propertyData) => {
    try {
      setFormLoading(true);
      setError('');
      
      console.log('Updating property with data:', propertyData);
      console.log('Editing property ID:', editingProperty._id);
      
      // Use the property service to update property with image management
      const response = await propertyService.updateProperty(editingProperty._id, propertyData);
      
      if (response.success) {
        console.log('Property updated successfully:', response.data);
        setEditingProperty(null);
        await loadProperties(); // Reload properties
        await loadStats(); // Reload stats
      } else {
        console.error('Failed to update property:', response.message);
        setError(response.message || 'Failed to update property');
        throw new Error(response.message || 'Failed to update property');
      }
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err.message || 'Failed to update property');
      throw err; // Re-throw to be handled by the form
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProperty = async (property) => {
    if (!window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
      return;
    }

    try {
      setError('');
      console.log('Deleting property:', property._id);
      
      const response = await propertyService.deleteProperty(property._id);
      
      if (response.success) {
        console.log('Property deleted successfully');
        await loadProperties(); // Reload properties
        await loadStats(); // Reload stats
      } else {
        console.error('Failed to delete property:', response.message);
        setError(response.message || 'Failed to delete property');
        alert(response.message || 'Failed to delete property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err.message || 'Failed to delete property');
      alert(err.message || 'Failed to delete property');
    }
  };

  const handleViewProperty = (property) => {
    setViewingProperty(property);
  };

  const getStatsCards = () => [
    {
      title: 'Total Properties',
      value: stats.total,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Available',
      value: stats.available,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Sold',
      value: stats.sold,
      icon: XCircle,
      color: 'red'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow'
    }
  ];

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const currentPage = pagination.current;
    const totalPages = pagination.pages;
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-2 rounded-lg ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-500">
          Page {currentPage} of {totalPages} ({pagination.total} total properties)
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {pages}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent">
                Property Catalog
              </div>
              <p className="text-gray-600">Manage your real estate listings</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Import Button - NEW */}
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Import Properties</span>
            </button>
            
            {/* Add Property Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Property</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => {
                setError('');
                loadProperties();
              }}
              className="ml-auto text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <PropertyFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          resultsCount={pagination.total}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              red: 'bg-red-100 text-red-600',
              yellow: 'bg-yellow-100 text-yellow-600'
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold ${
                      stat.color === 'blue' ? 'text-gray-900' : 
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {loading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading properties...</span>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onView={handleViewProperty}
                  onEdit={setEditingProperty}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && !error && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.minPrice || filters.maxPrice
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first property'
              }
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import Properties</span>
              </button>
              <span className="text-gray-400">or</span>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Add Your First Property
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <PropertyForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProperty}
        isLoading={formLoading}
      />

      {/* Import Properties Modal - NEW */}
      <PropertyImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportProperties={handleImportProperties}
      />

      {/* Edit Property Modal */}
      <PropertyForm
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        onSubmit={handleEditProperty}
        property={editingProperty}
        isLoading={formLoading}
      />

      {/* View Property Modal */}
      <PropertyViewModal
        property={viewingProperty}
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
        onEdit={setEditingProperty}
        onDelete={handleDeleteProperty}
      />
    </div>
  );
};

export default PropertyCatalog;