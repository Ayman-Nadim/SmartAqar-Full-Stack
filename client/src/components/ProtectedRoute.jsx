import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, login, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('smartaquar_token');
      const user = localStorage.getItem('smartaquar_user');

      if (!token || !user) {
        setShouldRedirect(true);
        setIsLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est déjà authentifié dans le contexte
      if (isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier la validité du token avec l'API
        const response = await fetch('http://localhost:5000/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Token valide, connecter l'utilisateur dans le contexte
          const userData = JSON.parse(user);
          login(userData, token);
          setIsLoading(false);
        } else {
          // Token invalide, nettoyer et rediriger
          localStorage.removeItem('smartaquar_token');
          localStorage.removeItem('smartaquar_user');
          logout();
          setShouldRedirect(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        // En cas d'erreur réseau, on peut soit rediriger soit rester connecté
        // selon votre logique métier
        localStorage.removeItem('smartaquar_token');
        localStorage.removeItem('smartaquar_user');
        logout();
        setShouldRedirect(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, login, logout]);

  if (isLoading) {
    // Afficher un spinner de chargement pendant la vérification
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;