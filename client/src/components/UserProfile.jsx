import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle,
  XCircle,
  Globe,
  Bell,
  Lock,
  AlertCircle,
  Loader,
  Crown,
  Coins
} from 'lucide-react';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('smartaquar_token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // CORRECTION: Utiliser la bonne URL de l'API
      const response = await fetch('http://localhost:5000/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFlag = (lang) => {
    switch(lang) {
      case 'en': return '🇺🇸';
      case 'fr': return '🇫🇷';
      case 'ar': return '🇲🇦';
      default: return '🌐';
    }
  };

  const getLanguageName = (lang) => {
    switch(lang) {
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'ar': return 'العربية';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-3">
          <Loader className="h-6 w-6 text-blue-600 animate-spin" />
          <span className="text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {userData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userData?.name}</h2>
                <p className="text-gray-600">{userData?.email}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Credits</span>
                  </div>
                  {/* CORRECTION: Afficher correctement le crédit */}
                  <span className="text-lg font-bold text-blue-600">
                    {typeof userData?.credit === 'number' ? userData.credit : (userData?.credit?.credit || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Role</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600 capitalize">
                    {userData?.roles?.[0] || 'User'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Language</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {getLanguageFlag(userData?.language)} {getLanguageName(userData?.language)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              
              {/* View Mode - Always show profile information */}
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{userData?.name}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{userData?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{userData?.phone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {getLanguageFlag(userData?.language)} {getLanguageName(userData?.language)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Status */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Security Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {userData?.phone_verified_at ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Verified</p>
                          <p className="text-xs text-gray-600">
                            {userData?.phone_verified_at 
                              ? new Date(userData.phone_verified_at).toLocaleDateString()
                              : 'Not verified'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {userData?.two_factor_enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">2FA Enabled</p>
                          <p className="text-xs text-gray-600">
                            {userData?.two_factor_enabled ? 'Active' : 'Disabled'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {userData?.two_factor_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">2FA Verified</p>
                          <p className="text-xs text-gray-600">
                            {userData?.two_factor_verified ? 'Verified' : 'Not verified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NOUVEAU: Section Aquarium Data */}
                  {userData?.aquarium_data && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Aquarium Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-semibold text-blue-900 mb-2">Tanks</h5>
                          <p className="text-lg font-bold text-blue-600">
                            {userData.aquarium_data.tanks?.length || 0}
                          </p>
                          <p className="text-xs text-blue-700">Total tanks configured</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="text-sm font-semibold text-green-900 mb-2">Sensors</h5>
                          <p className="text-lg font-bold text-green-600">
                            {userData.aquarium_data.sensors?.length || 0}
                          </p>
                          <p className="text-xs text-green-700">Active sensors</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;