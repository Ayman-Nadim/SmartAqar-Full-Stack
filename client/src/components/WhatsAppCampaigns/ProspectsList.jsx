import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  DollarSign,
  TrendingUp,
  Heart,
  Users,
  UserCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Star
} from 'lucide-react';

const ProspectsList = ({ 
  prospects, 
  matches, 
  searchTerm, 
  setSearchTerm
}) => {
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [matchesFilter, setMatchesFilter] = useState('all');
  
  // Modal states
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' DH';
  };

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(prospects.map(p => p.status))];
    const locations = [...new Set(prospects.flatMap(p => p.preferences?.locations || []))];
    
    return {
      statuses,
      locations,
      budgetRanges: [
        { label: 'Under 500K DH', min: 0, max: 500000 },
        { label: '500K - 1M DH', min: 500000, max: 1000000 },
        { label: '1M - 2M DH', min: 1000000, max: 2000000 },
        { label: 'Above 2M DH', min: 2000000, max: Infinity }
      ]
    };
  }, [prospects]);

  // Filter and search logic
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      // Search filter
      const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prospect.phone.includes(searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;

      // Location filter
      const matchesLocation = locationFilter === 'all' || 
                             prospect.preferences?.locations?.includes(locationFilter);

      // Budget filter
      let matchesBudget = true;
      if (budgetFilter !== 'all') {
        const budgetRange = filterOptions.budgetRanges.find(b => b.label === budgetFilter);
        const prospectBudgetMin = prospect.preferences?.budget?.min || 0;
        const prospectBudgetMax = prospect.preferences?.budget?.max || 0;
        
        matchesBudget = (prospectBudgetMin >= budgetRange.min && prospectBudgetMin <= budgetRange.max) ||
                       (prospectBudgetMax >= budgetRange.min && prospectBudgetMax <= budgetRange.max);
      }

      // Matches filter
      const prospectMatches = matches.filter(m => m.prospect._id === prospect._id);
      let matchesMatchFilter = true;
      if (matchesFilter === 'with_matches') {
        matchesMatchFilter = prospectMatches.length > 0;
      } else if (matchesFilter === 'without_matches') {
        matchesMatchFilter = prospectMatches.length === 0;
      }

      return matchesSearch && matchesStatus && matchesLocation && matchesBudget && matchesMatchFilter;
    });
  }, [prospects, searchTerm, statusFilter, locationFilter, budgetFilter, matchesFilter, matches, filterOptions.budgetRanges]);

  // Pagination logic
  const paginationData = useMemo(() => {
    const totalItems = filteredProspects.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProspects = filteredProspects.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentProspects,
      showingFrom: startIndex + 1,
      showingTo: Math.min(endIndex, totalItems)
    };
  }, [filteredProspects, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, locationFilter, budgetFilter, matchesFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBudgetFilter('all');
    setLocationFilter('all');
    setMatchesFilter('all');
    setCurrentPage(1);
  };

  // Open modal with prospect matches
  const viewProspectMatches = (prospect) => {
    setSelectedProspect(prospect);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProspect(null);
  };

  // Get status styling
  const getStatusColor = (status) => {
    switch(status) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-orange-600 bg-orange-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'hot': return <TrendingUp className="h-3 w-3" />;
      case 'warm': return <Heart className="h-3 w-3" />;
      case 'cold': return <Users className="h-3 w-3" />;
      case 'active': return <UserCheck className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  // Count active filters
  const activeFiltersCount = [statusFilter, budgetFilter, locationFilter, matchesFilter]
    .filter(filter => filter !== 'all').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">
            Prospects ({paginationData.totalItems})
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  {filterOptions.statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Budgets</option>
                  {filterOptions.budgetRanges.map(range => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {filterOptions.locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Matches Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Matches</label>
                <select
                  value={matchesFilter}
                  onChange={(e) => setMatchesFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Prospects</option>
                  <option value="with_matches">With Matches</option>
                  <option value="without_matches">Without Matches</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prospects Grid */}
      <div className="p-6">
        {/* Items per page selector */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
            <span>per page</span>
          </div>
          
          {paginationData.totalItems > 0 && (
            <div className="text-sm text-gray-600">
              Showing {paginationData.showingFrom}-{paginationData.showingTo} of {paginationData.totalItems} prospects
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginationData.currentProspects.map((prospect) => {
            const prospectMatches = matches.filter(m => m.prospect._id === prospect._id);
            
            return (
              <div 
                key={prospect._id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                {/* Prospect Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{prospect.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
                      {getStatusIcon(prospect.status)}
                      <span className="ml-1 capitalize">{prospect.status}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {prospectMatches.length} matches
                    </div>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{prospect.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{prospect.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formatPrice(prospect.preferences?.budget?.min || 0)} - {formatPrice(prospect.preferences?.budget?.max || 0)}
                    </span>
                  </div>
                </div>
                
                {/* View Matches Button */}
                <button
                  onClick={() => viewProspectMatches(prospect)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Matches ({prospectMatches.length})</span>
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {paginationData.totalItems === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search terms or filters' 
                : 'No prospects available'
              }
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-green-600 hover:text-green-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t pt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (paginationData.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= paginationData.totalPages - 2) {
                    pageNumber = paginationData.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                disabled={currentPage === paginationData.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Page {currentPage} of {paginationData.totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Properties Matches Modal */}
      {showModal && selectedProspect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Property Matches for {selectedProspect.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {matches.filter(m => m.prospect._id === selectedProspect._id).length} matching properties found
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Prospect Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Prospect Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Budget: {formatPrice(selectedProspect.preferences?.budget?.min || 0)} - {formatPrice(selectedProspect.preferences?.budget?.max || 0)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    Locations: {selectedProspect.preferences?.locations?.join(', ') || 'Any location'}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Bed className="h-4 w-4 mr-2" />
                    Bedrooms: {selectedProspect.preferences?.bedrooms || 'Any'} min
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Bath className="h-4 w-4 mr-2" />
                    Bathrooms: {selectedProspect.preferences?.bathrooms || 'Any'} min
                  </div>
                </div>
              </div>

              {/* Matching Properties */}
              <div className="space-y-4">
                {matches
                  .filter(m => m.prospect._id === selectedProspect._id)
                  .sort((a, b) => b.score - a.score)
                  .map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg">{match.property.title}</h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{match.property.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatPrice(match.property.price)}
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-gray-600">Match Score: {match.score}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Bed className="h-4 w-4 mr-2" />
                          <span className="text-sm">{match.property.bedrooms} bedrooms</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Bath className="h-4 w-4 mr-2" />
                          <span className="text-sm">{match.property.bathrooms} bathrooms</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Square className="h-4 w-4 mr-2" />
                          <span className="text-sm">{match.property.area} m²</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.property.type === 'villa' ? 'bg-purple-100 text-purple-800' :
                            match.property.type === 'apartment' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.property.type}
                          </span>
                        </div>
                      </div>

                      {/* Property Features */}
                      {match.property.features && match.property.features.length > 0 && (
                        <div className="border-t pt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Features:</h5>
                          <div className="flex flex-wrap gap-2">
                            {match.property.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* No matches message */}
                {matches.filter(m => m.prospect._id === selectedProspect._id).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Star className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching properties</h3>
                    <p className="text-gray-600">
                      No properties currently match this prospect's preferences and budget.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectsList;