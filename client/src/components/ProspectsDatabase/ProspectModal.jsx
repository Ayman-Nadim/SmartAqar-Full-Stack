import React from 'react';
import { X, Check, Loader } from 'lucide-react';

const ProspectModal = ({
  isOpen,
  onClose,
  isEditing = false,
  isViewing = false,
  prospect,
  setProspect,
  onSubmit,
  submitting = false
}) => {
  const availablePropertyTypes = ['apartment', 'villa', 'house', 'commercial', 'office', 'land'];
  const availableFeatures = [
    'Swimming Pool', 'Garage', 'Security System', 'Elevator', 'Balcony', 'Parking',
    'Garden', 'Maid Room', 'Smart Home', 'Gym', 'Traditional Design', 'Modern Design',
    'Sea View', 'Mountain View', 'Central AC', 'Fireplace'
  ];
  const availableStatuses = ['hot', 'warm', 'cold', 'active'];
  const availableSources = ['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'phone'];
  const availableLocations = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 
    'Kenitra', 'Tetouan', 'Safi', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida'
  ];

  const handleCheckboxChange = (field, value) => {
    if (isViewing) return;
    setProspect(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: prev.preferences[field].includes(value)
          ? prev.preferences[field].filter(item => item !== value)
          : [...prev.preferences[field], value]
      }
    }));
  };

  const handleLocationChange = (location) => {
    if (isViewing) return;
    setProspect(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        locations: prev.preferences.locations.includes(location)
          ? prev.preferences.locations.filter(loc => loc !== location)
          : [...prev.preferences.locations, location]
      }
    }));
  };

  const handleSubmit = () => {
    if (isViewing) return;
    if (!prospect.name || !prospect.email || !prospect.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }
    onSubmit(prospect);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isViewing ? 'View Prospect' : isEditing ? 'Edit Prospect' : 'Add New Prospect'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={prospect.name}
                    onChange={(e) => setProspect({...prospect, name: e.target.value})}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={prospect.email}
                    onChange={(e) => setProspect({...prospect, email: e.target.value})}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={prospect.phone}
                    onChange={(e) => setProspect({...prospect, phone: e.target.value})}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={prospect.status}
                    onChange={(e) => setProspect({...prospect, status: e.target.value})}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {availableStatuses.map(status => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={prospect.source}
                    onChange={(e) => setProspect({...prospect, source: e.target.value})}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {availableSources.map(source => (
                      <option key={source} value={source} className="capitalize">
                        {source.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Budget</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget (DH)
                  </label>
                  <input
                    type="number"
                    value={prospect.preferences?.budget?.min || ''}
                    onChange={(e) => setProspect({
                      ...prospect,
                      preferences: {
                        ...prospect.preferences,
                        budget: {
                          ...prospect.preferences.budget,
                          min: e.target.value
                        }
                      }
                    })}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Minimum budget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget (DH)
                  </label>
                  <input
                    type="number"
                    value={prospect.preferences?.budget?.max || ''}
                    onChange={(e) => setProspect({
                      ...prospect,
                      preferences: {
                        ...prospect.preferences,
                        budget: {
                          ...prospect.preferences.budget,
                          max: e.target.value
                        }
                      }
                    })}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Maximum budget"
                  />
                </div>
              </div>
            </div>

            {/* Property Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Property Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={prospect.preferences?.bedrooms || ''}
                    onChange={(e) => setProspect({
                      ...prospect,
                      preferences: {
                        ...prospect.preferences,
                        bedrooms: e.target.value
                      }
                    })}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Number of bedrooms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={prospect.preferences?.bathrooms || ''}
                    onChange={(e) => setProspect({
                      ...prospect,
                      preferences: {
                        ...prospect.preferences,
                        bathrooms: e.target.value
                      }
                    })}
                    disabled={isViewing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Number of bathrooms"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Range (m²)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={prospect.preferences?.area?.min || ''}
                      onChange={(e) => setProspect({
                        ...prospect,
                        preferences: {
                          ...prospect.preferences,
                          area: {
                            ...prospect.preferences.area,
                            min: e.target.value
                          }
                        }
                      })}
                      disabled={isViewing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={prospect.preferences?.area?.max || ''}
                      onChange={(e) => setProspect({
                        ...prospect,
                        preferences: {
                          ...prospect.preferences,
                          area: {
                            ...prospect.preferences.area,
                            max: e.target.value
                          }
                        }
                      })}
                      disabled={isViewing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Property Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availablePropertyTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prospect.preferences?.propertyTypes?.includes(type) || false}
                      onChange={() => handleCheckboxChange('propertyTypes', type)}
                      disabled={isViewing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Preferred Locations</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableLocations.map(location => (
                  <label key={location} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prospect.preferences?.locations?.includes(location) || false}
                      onChange={() => handleLocationChange(location)}
                      disabled={isViewing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Desired Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prospect.preferences?.features?.includes(feature) || false}
                      onChange={() => handleCheckboxChange('features', feature)}
                      disabled={isViewing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <textarea
                value={prospect.notes || ''}
                onChange={(e) => setProspect({...prospect, notes: e.target.value})}
                disabled={isViewing}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Any additional notes about the prospect..."
              />
            </div>

            {/* Actions */}
            {!isViewing && (
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{submitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Prospect' : 'Add Prospect')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectModal;