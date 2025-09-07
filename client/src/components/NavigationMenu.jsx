import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  User, 
  Home, 
  Building, 
  Users, 
  MessageCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NavigationMenu = ({ currentPage, onLogout, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Public pages where the sidebar should NOT appear
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(location.pathname);
  
  // Hide sidebar if user is not authenticated or on a public page
  const shouldShowSidebar = isAuthenticated && !isPublicPage;

  // Fetch user profile
  useEffect(() => {
    if (!shouldShowSidebar) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('smartaquar_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setUserProfile(result.data);
        } else {
          console.error('Error fetching user profile');
          if (response.status === 401) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Connection error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [shouldShowSidebar]);

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'properties',
      name: 'Properties',
      icon: Building,
      path: '/property-catalog',
      description: 'Real estate catalog'
    },
    {
      id: 'prospects',
      name: 'Prospects',
      icon: Users,
      path: '/prospects',
      description: 'Prospects database'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      path: '/whatsapp-campaigns',
      description: 'WhatsApp campaigns'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      path: '/user-profile',
      description: 'My profile'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('smartaquar_token');
    localStorage.removeItem('smartaquar_user');
    
    if (onLogout) {
      onLogout();
    }
    
    navigate('/login', { replace: true });
  };

  const handlePageChange = (item) => {
    navigate(item.path);
  };

  // If the sidebar should not be shown, return only children content
  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Normal layout with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img src={require("../assets/smartaqar-logo.png")} alt="SMARTAQAR Logo" className="w-10 h-10" />
              <div className="text-xl font-bold bg-gradient-to-r from-[#007bff] to-[#28a745] bg-clip-text text-transparent">
                SMARTAQAR
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mx-auto">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-2 px-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Section */}
        <div className="border-t border-gray-200 p-3 mt-auto">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {loading ? 'Loading...' : userProfile?.name || 'User'}
                  </div>
                  <div className="text-xs text-green-500 truncate flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                    Online
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <main className="p-6 h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NavigationMenu;
