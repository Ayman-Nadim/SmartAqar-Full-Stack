// components/PropertyFilters.js
import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const PropertyFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset,
  resultsCount = 0 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (name, value) => {
    onFiltersChange({
      ...filters,
      [name]: value
    });
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      type: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'addedDate',
      sortOrder: 'desc'
    };
    onFiltersChange(resetFilters);
    if (onReset) onReset();
  };

  const hasActiveFilters = () => {
    return filters.search || 
           (filters.type && filters.type !== 'all') || 
           (filters.status && filters.status !== 'all') || 
           filters.minPrice || 
           filters.maxPrice;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
      {/* Basic Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties by title, location..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="all">All Types</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="pending">Pending</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
            showAdvanced || hasActiveFilters()
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="whitespace-nowrap">Advanced</span>
          {hasActiveFilters() && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {[filters.search, filters.type !== 'all' ? filters.type : null, 
                filters.status !== 'all' ? filters.status : null, 
                filters.minPrice, filters.maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Reset Button */}
        {hasActiveFilters() && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-300 hover:border-red-300 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (DH)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (DH)
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'addedDate'}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="addedDate">Date Added</option>
                <option value="price">Price</option>
                <option value="title">Title</option>
                <option value="area">Area</option>
                <option value="location">Location</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Price Range Presets */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under 500K DH', min: '', max: '500000' },
                { label: '500K - 1M DH', min: '500000', max: '1000000' },
                { label: '1M - 2M DH', min: '1000000', max: '2000000' },
                { label: '2M - 5M DH', min: '2000000', max: '5000000' },
                { label: 'Over 5M DH', min: '5000000', max: '' },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleInputChange('minPrice', preset.min);
                    handleInputChange('maxPrice', preset.max);
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <span>
          {resultsCount > 0 ? (
            <>
              Showing <span className="font-medium text-gray-900">{resultsCount}</span> 
              {resultsCount === 1 ? ' property' : ' properties'}
              {hasActiveFilters() && ' matching your filters'}
            </>
          ) : (
            'No properties found'
          )}
        </span>
        
        {hasActiveFilters() && (
          <div className="flex items-center space-x-4">
            <span className="text-blue-600">
              {[filters.search, filters.type !== 'all' ? filters.type : null, 
                filters.status !== 'all' ? filters.status : null, 
                filters.minPrice, filters.maxPrice].filter(Boolean).length} filter(s) active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;