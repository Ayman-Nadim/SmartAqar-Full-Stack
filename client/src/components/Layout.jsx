// Layout.jsx - Composant de mise en page principal
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import NavigationMenu from './NavigationMenu';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  
  // Pages où la sidebar ne doit pas apparaître
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(location.pathname);
  
  // Afficher la sidebar seulement si l'utilisateur est connecté ET n'est pas sur une page publique
  const showSidebar = isAuthenticated && !isPublicPage;

  if (!showSidebar) {
    // Affichage sans sidebar pour les pages publiques
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Affichage avec sidebar pour les pages protégées
  return (
    <div className="flex h-screen bg-gray-50">
      <NavigationMenu 
        currentPage="properties" // Vous pouvez passer la page actuelle ici
        onPageChange={(pageId) => {
          // Logique de navigation
          console.log('Navigation vers:', pageId);
        }}
        onLogout={() => {
          // Logique de déconnexion
          console.log('Déconnexion');
        }}
      />
      
      {/* Zone de contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden ml-16"> {/* ml-16 pour sidebar collapsed par défaut */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;