import React, { useState, useEffect } from 'react';
import NavigationMenu from './NavigationMenu';

// Import de vos composants pages
import LandingPage from './LandingPage';
import UserProfile from './UserProfile';
import PropertyCatalog from './PropertyCatalog';
import ProspectsDatabase from './ProspectsDatabase/ProspectsDatabase';
import WhatsAppCampaigns from './WhatsAppCampaigns';
import LoginPage from './LoginPage';

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('smartaquar_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const handleLogin = (token) => {
    localStorage.setItem('smartaquar_token', token);
    setIsAuthenticated(true);
    setCurrentPage('landing'); // Rediriger vers le dashboard après login
  };

  const handleLogout = () => {
    localStorage.removeItem('smartaquar_token');
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
  };

  // Fonction pour rendre le composant de page actuel
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'profile':
        return <UserProfile />;
      case 'properties':
        return <PropertyCatalog />;
      case 'prospects':
        return <ProspectsDatabase />;
      case 'whatsapp':
        return <WhatsAppCampaigns />;
      default:
        return <LandingPage />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  // Si pas authentifié, afficher la page de login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Si authentifié, afficher l'interface avec navigation
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />
      
      <main className="min-h-[calc(100vh-4rem)]">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default MainLayout;