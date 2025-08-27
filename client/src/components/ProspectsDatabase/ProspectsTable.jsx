import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  Heart,
  Building2,
  Star,
  MessageCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Home,
  Car,
  Shield,
  Waves,
  Bed,
  Bath,
  Users
} from 'lucide-react';

const ProspectsTable = ({ 
  prospects, 
  onView,    // ✅ Nouvelle prop pour voir
  onEdit, 
  onDelete, 
  loading 
}) => {
  // Fonctions utilitaires
  const getStatusColor = (status) => {
    switch(status) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-orange-600 bg-orange-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'hot': return <TrendingUp className="h-3 w-3" />;
      case 'warm': return <Heart className="h-3 w-3" />;
      case 'cold': return <UserX className="h-3 w-3" />;
      case 'active': return <UserCheck className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 DH';
    return new Intl.NumberFormat('fr-MA').format(price) + ' DH';
  };

  const getSourceIcon = (source) => {
    switch(source) {
      case 'website': return <Building2 className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'social_media': return <MessageCircle className="h-4 w-4" />;
      case 'advertisement': return <Star className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getFeatureIcon = (feature) => {
    const lowerFeature = feature?.toLowerCase() || '';
    switch(true) {
      case lowerFeature.includes('pool'): return <Waves className="h-3 w-3" />;
      case lowerFeature.includes('garage'): return <Car className="h-3 w-3" />;
      case lowerFeature.includes('security'): return <Shield className="h-3 w-3" />;
      case lowerFeature.includes('parking'): return <Car className="h-3 w-3" />;
      default: return <Home className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prospects...</p>
        </div>
      </div>
    );
  }

  if (prospects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prospect
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget & Requirements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status & Matches
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prospects.map((prospect) => (
              <tr key={prospect._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {prospect.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{prospect.name}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        {getSourceIcon(prospect.source)}
                        <span className="ml-1 capitalize">{prospect.source?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="truncate max-w-40">{prospect.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {prospect.phone}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{formatPrice(prospect.preferences?.budget?.min)}</div>
                      <div className="text-gray-500">to {formatPrice(prospect.preferences?.budget?.max)}</div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {prospect.preferences?.bedrooms || 0}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {prospect.preferences?.bathrooms || 0}
                      </div>
                      <div>{prospect.preferences?.area?.min || 0}-{prospect.preferences?.area?.max || 0}m²</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {prospect.preferences?.propertyTypes?.map(type => (
                        <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {prospect.preferences?.locations?.join(', ') || 'No locations specified'}
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {prospect.preferences?.features?.slice(0, 3).map(feature => (
                        <span key={feature} className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                          {getFeatureIcon(feature)}
                          <span className="ml-1 truncate">{feature}</span>
                        </span>
                      ))}
                      {prospect.preferences?.features?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{prospect.preferences.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
                      {getStatusIcon(prospect.status)}
                      <span className="ml-1 capitalize">{prospect.status}</span>
                    </span>
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center">
                        <Home className="h-3 w-3 mr-1" />
                        {prospect.matchedProperties?.length || 0} matches
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {prospect.lastContact ? new Date(prospect.lastContact).toLocaleDateString() : 'No contact'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* 👁️ Bouton View - MAINTENANT FONCTIONNEL */}
                    <button 
                      onClick={() => onView(prospect)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View prospect details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {/* ✏️ Bouton Edit */}
                    <button 
                      onClick={() => onEdit(prospect)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit prospect"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    {/* 🗑️ Bouton Delete */}
                    <button 
                      onClick={() => onDelete(prospect._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete prospect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProspectsTable;