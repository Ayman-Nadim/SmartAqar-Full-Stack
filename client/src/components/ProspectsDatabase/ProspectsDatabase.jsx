import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Upload,
  TrendingUp,
  UserCheck,
  Star,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database
} from 'lucide-react';

// Import des composants séparés
import ProspectsTable from './ProspectsTable';
import ProspectsFilters from './ProspectsFilters';
import ProspectModal from './ProspectModal';
import Notification from './Notification';
import ModernDeleteModal from './ModernDeleteModal';
import FileUploadModal from './FileUploadModal';

const ProspectsDatabase = () => {
  // États
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPropertyType, setFilterPropertyType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  // États pour les notifications
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  // États pour la confirmation de suppression
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    prospectId: null,
    prospectName: ''
  });

  // États pour la visualisation (mode lecture seule)
  const [viewingProspect, setViewingProspect] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [newProspect, setNewProspect] = useState({
    name: '',
    email: '',
    phone: '',
    preferences: {
      budget: { min: '', max: '' },
      propertyTypes: [],
      locations: [],
      bedrooms: '',
      bathrooms: '',
      area: { min: '', max: '' },
      features: []
    },
    notes: '',
    status: 'active',
    source: 'website'
  });

  const API_BASE_URL = 'http://localhost:5000/api/v1';

  // Fonction pour afficher une notification
  const showNotification = (type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  };

  // Fonction pour fermer la notification
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Récupération du token depuis localStorage
  const getToken = () => {
    try {
      return localStorage.getItem('smartaquar_token') || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Récupération des données utilisateur
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('smartaquar_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserData();

  // Fonction générique pour les appels API
  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getToken();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Récupération des prospects
  const fetchProspects = async () => {
    if (!user?.id) {
      setError('User not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(`/prospects`);
      const data = response.success ? response.data : response;
      setProspects(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch prospects. Please try again.');
      showNotification('error', 'Error', 'Failed to load prospects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Création d'un prospect
  const createProspect = async (prospectData) => {
    try {
      setSubmitting(true);
      const dataToSend = {
        userId: user.id,
        ...prospectData,
        preferences: {
          ...prospectData.preferences,
          budget: {
            min: parseInt(prospectData.preferences.budget.min) || 0,
            max: parseInt(prospectData.preferences.budget.max) || 0
          },
          bedrooms: parseInt(prospectData.preferences.bedrooms) || 0,
          bathrooms: parseInt(prospectData.preferences.bathrooms) || 0,
          area: {
            min: parseInt(prospectData.preferences.area.min) || 0,
            max: parseInt(prospectData.preferences.area.max) || 0
          }
        }
      };

      await apiCall('/prospects', {
        method: 'POST',
        body: JSON.stringify(dataToSend)
      });

      await fetchProspects();
      setShowAddModal(false);
      resetNewProspect();
      
      // Notification de succès
      showNotification(
        'success', 
        'Prospect Added Successfully!', 
        `${prospectData.name} has been added to your prospects database.`
      );
      
    } catch (error) {
      console.error('Create prospect error:', error);
      showNotification(
        'error', 
        'Failed to Add Prospect', 
        'There was an error adding the prospect. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Import en masse de prospects
  const importProspects = async (prospectsData) => {
    try {
      setSubmitting(true);
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Traiter les prospects par lots pour éviter de surcharger l'API
      for (const prospect of prospectsData) {
        try {
          const dataToSend = {
            userId: user.id,
            ...prospect,
            preferences: {
              ...prospect.preferences,
              budget: {
                min: parseInt(prospect.preferences.budget.min) || 0,
                max: parseInt(prospect.preferences.budget.max) || 0
              },
              bedrooms: parseInt(prospect.preferences.bedrooms) || 0,
              bathrooms: parseInt(prospect.preferences.bathrooms) || 0,
              area: {
                min: parseInt(prospect.preferences.area.min) || 0,
                max: parseInt(prospect.preferences.area.max) || 0
              }
            }
          };

          await apiCall('/prospects', {
            method: 'POST',
            body: JSON.stringify(dataToSend)
          });
          
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`${prospect.name}: ${error.message}`);
        }
      }

      // Actualiser la liste des prospects
      await fetchProspects();
      
      // Afficher la notification appropriée
      if (successCount > 0 && errorCount === 0) {
        showNotification(
          'success', 
          'Import Successful!', 
          `Successfully imported ${successCount} prospects.`
        );
      } else if (successCount > 0 && errorCount > 0) {
        showNotification(
          'warning', 
          'Partial Import Success', 
          `Imported ${successCount} prospects. ${errorCount} failed.`
        );
      } else {
        showNotification(
          'error', 
          'Import Failed', 
          `Failed to import prospects. Please check your data and try again.`
        );
      }

    } catch (error) {
      console.error('Import prospects error:', error);
      showNotification(
        'error', 
        'Import Error', 
        'There was an error importing the prospects. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Mise à jour d'un prospect
  const updateProspect = async (prospectId, updateData) => {
    try {
      setSubmitting(true);
      const dataToSend = {
        ...updateData,
        preferences: {
          ...updateData.preferences,
          budget: {
            min: parseInt(updateData.preferences.budget.min) || 0,
            max: parseInt(updateData.preferences.budget.max) || 0
          },
          bedrooms: parseInt(updateData.preferences.bedrooms) || 0,
          bathrooms: parseInt(updateData.preferences.bathrooms) || 0,
          area: {
            min: parseInt(updateData.preferences.area.min) || 0,
            max: parseInt(updateData.preferences.area.max) || 0
          }
        }
      };

      await apiCall(`/prospects/${prospectId}`, {
        method: 'PUT',
        body: JSON.stringify(dataToSend)
      });

      await fetchProspects();
      setShowEditModal(false);
      setEditingProspect(null);
      
      // Notification de succès pour la modification
      showNotification(
        'success', 
        'Prospect Updated Successfully!', 
        `${updateData.name}'s information has been updated successfully.`
      );
      
    } catch (error) {
      console.error('Update prospect error:', error);
      showNotification(
        'error', 
        'Failed to Update Prospect', 
        'There was an error updating the prospect. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Suppression d'un prospect
  const deleteProspect = (prospectId) => {
    const prospectToDelete = prospects.find(p => p._id === prospectId);
    
    // Ouvrir le modal de confirmation personnalisé
    setDeleteConfirmation({
      isOpen: true,
      prospectId: prospectId,
      prospectName: prospectToDelete?.name || 'Unknown Prospect'
    });
  };

  // Confirmer la suppression
  const confirmDeleteProspect = async () => {
    const { prospectId, prospectName } = deleteConfirmation;
    
    try {
      await apiCall(`/prospects/${prospectId}`, { method: 'DELETE' });
      await fetchProspects();
      
      // Notification rouge pour la suppression
      showNotification(
        'error', 
        'Prospect Deleted!', 
        `${prospectName} has been permanently removed from your database.`
      );
      
    } catch (error) {
      console.error('Delete prospect error:', error);
      showNotification(
        'error', 
        'Failed to Delete Prospect', 
        'There was an error deleting the prospect. Please try again.'
      );
    } finally {
      // Fermer le modal de confirmation
      setDeleteConfirmation({
        isOpen: false,
        prospectId: null,
        prospectName: ''
      });
    }
  };

  const resetNewProspect = () => {
    setNewProspect({
      name: '',
      email: '',
      phone: '',
      preferences: {
        budget: { min: '', max: '' },
        propertyTypes: [],
        locations: [],
        bedrooms: '',
        bathrooms: '',
        area: { min: '', max: '' },
        features: []
      },
      notes: '',
      status: 'active',
      source: 'website'
    });
  };

  useEffect(() => { fetchProspects(); }, []);

  // Filtrage
  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesPropertyType = filterPropertyType === 'all' ||
                                p.preferences?.propertyTypes?.includes(filterPropertyType);
    const matchesLocation = filterLocation === 'all' ||
                            p.preferences?.locations?.some(loc =>
                              loc.toLowerCase().includes(filterLocation.toLowerCase())
                            );
    return matchesSearch && matchesStatus && matchesPropertyType && matchesLocation;
  });

  const totalItems = filteredProspects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProspects = filteredProspects.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterPropertyType, filterLocation]);

  const goToPage = (page) => { setCurrentPage(Math.max(1, Math.min(page, totalPages))); };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const allLocations = [...new Set(prospects.flatMap(p => p.preferences?.locations || []))];
  const allPropertyTypes = [...new Set(prospects.flatMap(p => p.preferences?.propertyTypes || []))];

  const handleEditProspect = (prospect) => {
    setEditingProspect({
      ...prospect,
      preferences: {
        budget: { 
          min: prospect.preferences?.budget?.min?.toString() || '', 
          max: prospect.preferences?.budget?.max?.toString() || '' 
        },
        propertyTypes: prospect.preferences?.propertyTypes || [],
        locations: prospect.preferences?.locations || [],
        bedrooms: prospect.preferences?.bedrooms?.toString() || '',
        bathrooms: prospect.preferences?.bathrooms?.toString() || '',
        area: { 
          min: prospect.preferences?.area?.min?.toString() || '', 
          max: prospect.preferences?.area?.max?.toString() || '' 
        },
        features: prospect.preferences?.features || []
      }
    });
    setShowEditModal(true);
  };

  // Fonction pour visualiser un prospect (mode lecture seule)
  const handleViewProspect = (prospect) => {
    setViewingProspect({
      ...prospect,
      preferences: {
        budget: { 
          min: prospect.preferences?.budget?.min?.toString() || '', 
          max: prospect.preferences?.budget?.max?.toString() || '' 
        },
        propertyTypes: prospect.preferences?.propertyTypes || [],
        locations: prospect.preferences?.locations || [],
        bedrooms: prospect.preferences?.bedrooms?.toString() || '',
        bathrooms: prospect.preferences?.bathrooms?.toString() || '',
        area: { 
          min: prospect.preferences?.area?.min?.toString() || '', 
          max: prospect.preferences?.area?.max?.toString() || '' 
        },
        features: prospect.preferences?.features || []
      }
    });
    setShowViewModal(true);
  };

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please login to access the prospects database.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Notification Component */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent">
                  SMARTAQAR
                </div>
                <p className="text-sm text-gray-600">Prospects Database</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              
              {/* Import Button */}
              <button
                onClick={() => setShowImportModal(true)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>

              {/* Add Prospect Button */}
              <button
                onClick={() => setShowAddModal(true)}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Add Prospect</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <ProspectsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPropertyType={filterPropertyType}
          setFilterPropertyType={setFilterPropertyType}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          setCurrentPage={setCurrentPage}
          allPropertyTypes={allPropertyTypes}
          allLocations={allLocations}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prospects</p>
                <p className="text-3xl font-bold text-gray-900">{prospects.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Hot */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot Prospects</p>
                <p className="text-3xl font-bold text-red-600">{prospects.filter(p => p.status === 'hot').length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{prospects.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Matches */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Matches</p>
                <p className="text-3xl font-bold text-orange-600">{prospects.filter(p => p.matchedProperties?.length > 0).length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <ProspectsTable
          prospects={currentProspects}
          onView={handleViewProspect}
          onEdit={handleEditProspect}
          onDelete={deleteProspect}
          loading={loading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">Page {currentPage} of {totalPages} ({totalItems} total prospects)</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex space-x-1">
                  {getPageNumbers().map(page => (
                    <button key={page} onClick={() => goToPage(page)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                      {page}
                    </button>
                  ))}
                </div>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <ProspectModal
            isOpen={showAddModal}
            isEditing={false}
            isViewing={false}
            prospect={newProspect}
            setProspect={setNewProspect}
            onClose={() => setShowAddModal(false)}
            onSubmit={createProspect}
            submitting={submitting}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <FileUploadModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImportProspects={importProspects}
          />
        )}

        {/* View Modal (Read-only) */}
        {showViewModal && viewingProspect && (
          <ProspectModal
            isOpen={showViewModal}
            isEditing={false}
            isViewing={true}
            prospect={viewingProspect}
            setProspect={() => {}} // Fonction vide car en mode lecture seule
            onClose={() => {
              setShowViewModal(false);
              setViewingProspect(null);
            }}
            onSubmit={() => {}} // Fonction vide car pas de soumission en mode lecture
            submitting={false}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && editingProspect && (
          <ProspectModal
            isOpen={showEditModal}
            isEditing={true}
            isViewing={false}
            prospect={editingProspect}
            setProspect={setEditingProspect}
            onClose={() => {
              setShowEditModal(false);
              setEditingProspect(null);
            }}
            onSubmit={(data) => updateProspect(editingProspect._id, data)}
            submitting={submitting}
          />
        )}

        {/* Modern Delete Confirmation Modal */}
        <ModernDeleteModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, prospectId: null, prospectName: '' })}
          onConfirm={confirmDeleteProspect}
          prospectName={deleteConfirmation.prospectName}
        />

      </div>
    </div>
  );
};

export default ProspectsDatabase;