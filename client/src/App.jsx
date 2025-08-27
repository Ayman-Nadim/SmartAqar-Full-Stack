import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuthContext } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/Register';
import LoginPage from './components/LoginPage';
import PropertyCatalog from './components/PropertiesDatabase/PropertyCatalog';
import UserProfile from './components/UserProfile';
import ProspectsDatabase from './components/ProspectsDatabase/ProspectsDatabase';
import WhatsAppCampaigns from './components/WhatsAppCampaigns';
import NavigationMenu from './components/NavigationMenu';
import ProtectedRoute from './components/ProtectedRoute';

// Composant wrapper pour gérer l'affichage conditionnel
const AppLayout = () => {
  const { isAuthenticated, logout } = useAuthContext();

  const handleLogout = () => {
    localStorage.removeItem('smartaquar_token');
    localStorage.removeItem('smartaquar_user');
    logout();
    window.location.href = '/login';
  };

  const handlePageChange = (pageId) => {
    switch (pageId) {
      case 'profile':
        window.location.href = '/user-profile';
        break;
      case 'properties':
        window.location.href = '/property-catalog';
        break;
      case 'prospects':
        window.location.href = '/prospects';
        break;
      case 'whatsapp':
        window.location.href = '/whatsapp-campaigns';
        break;
      default:
        window.location.href = '/property-catalog';
    }
  };

  return (
    <Routes>
      {/* Routes publiques - sans sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Routes protégées - avec sidebar */}
      <Route 
        path="/property-catalog" 
        element={
          <ProtectedRoute>
            <NavigationMenu 
              currentPage="properties"
              onPageChange={handlePageChange}
              onLogout={handleLogout}
            >
              <PropertyCatalog />
            </NavigationMenu>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/user-profile" 
        element={
          <ProtectedRoute>
            <NavigationMenu 
              currentPage="profile"
              onPageChange={handlePageChange}
              onLogout={handleLogout}
            >
              <UserProfile />
            </NavigationMenu>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/prospects" 
        element={
          <ProtectedRoute>
            <NavigationMenu 
              currentPage="prospects"
              onPageChange={handlePageChange}
              onLogout={handleLogout}
            >
              <ProspectsDatabase />
            </NavigationMenu>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/whatsapp-campaigns" 
        element={
          <ProtectedRoute>
            <NavigationMenu 
              currentPage="whatsapp"
              onPageChange={handlePageChange}
              onLogout={handleLogout}
            >
              <WhatsAppCampaigns />
            </NavigationMenu>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;